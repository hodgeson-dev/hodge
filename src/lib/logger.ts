/**
 * Hodge Logger - Persistent logging for debugging CLI commands
 *
 * Uses Pino for high-performance logging with automatic rotation
 * and proper separation of concerns for different execution contexts.
 */

import { pino } from 'pino';
import type { LoggerOptions } from 'pino';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import stripAnsi from 'strip-ansi';

// Get log directory - use project-specific location
function getLogDir(): string {
  // Allow tests to override log directory
  if (process.env.HODGE_LOG_DIR) {
    fs.ensureDirSync(process.env.HODGE_LOG_DIR, { mode: 0o755 });
    return process.env.HODGE_LOG_DIR;
  }

  const projectLogDir = path.join(process.cwd(), '.hodge', 'logs');
  const fallbackLogDir = path.join(os.homedir(), '.hodge', 'logs');

  // Try project directory first, fallback to home directory
  try {
    fs.ensureDirSync(projectLogDir, { mode: 0o755 });
    return projectLogDir;
  } catch {
    fs.ensureDirSync(fallbackLogDir, { mode: 0o755 });
    return fallbackLogDir;
  }
}

/**
 * Configuration shape for hodge.json
 */
interface HodgeConfig {
  logLevel?: string;
  [key: string]: unknown;
}

/**
 * Get log level from configuration with fallback chain:
 * 1. HODGE_LOG_LEVEL environment variable (highest priority - per-command override)
 * 2. hodge.json logLevel setting (persistent project preference, committed to repo)
 * 3. 'info' (default)
 */
function getLogLevel(): string {
  // Check environment variable first (per-command override)
  if (process.env.HODGE_LOG_LEVEL) {
    return process.env.HODGE_LOG_LEVEL;
  }

  // Check hodge.json for persistent preference (in project root)
  try {
    const configPath = path.join(process.cwd(), 'hodge.json');
    if (fs.existsSync(configPath)) {
      const config = fs.readJsonSync(configPath) as HodgeConfig;
      if (config.logLevel) {
        return config.logLevel;
      }
    }
  } catch (error) {
    // Config file doesn't exist or can't be read - use default
    // Log the error for debugging purposes
    logger.debug('Failed to read hodge.json config', { error });
  }

  // Default to info level
  return 'info';
}

// Detect if we're running in Vitest (test environment)
const isTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';

const logDir = isTest ? os.tmpdir() : getLogDir();

// Use synchronous file destination for better CLI performance
// This ensures logs are written before process exits
// In test mode, use temp directory to avoid polluting project .hodge
const logDestination = pino.destination({
  dest: path.join(logDir, isTest ? `hodge-test-${process.pid}.log` : 'hodge.log'),
  sync: true, // Synchronous writes for CLI tools
  mkdir: true,
});

// Create error log destination
const errorDestination = pino.destination({
  dest: path.join(logDir, isTest ? `error-test-${process.pid}.log` : 'error.log'),
  sync: true,
  mkdir: true,
});

// Shared logger configuration for consistency
const baseLoggerOptions: LoggerOptions = {
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
    bindings: (bindings: Record<string, unknown>) => ({
      pid: bindings.pid as number,
      // Remove hostname for privacy
    }),
  },
  base: {
    // Base context for all logs
    hodgeVersion: process.env.npm_package_version,
  },
};

// Create the base logger
const loggerOptions: LoggerOptions = {
  ...baseLoggerOptions,
  level: getLogLevel(),
};

export const logger = pino(loggerOptions, logDestination);

// Also create error-only logger
const errorLoggerOptions: LoggerOptions = {
  ...baseLoggerOptions,
  level: 'error',
};

export const errorLogger = pino(errorLoggerOptions, errorDestination);

/**
 * Options for creating a command logger
 */
export interface CommandLoggerOptions {
  /** Enable console output in addition to file logging */
  enableConsole?: boolean;
}

/**
 * Strip ANSI color codes from a value for clean pino logging
 * Handles strings, objects with message properties, and passes through other types
 */
function stripAnsiFromValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return stripAnsi(value);
  }
  if (typeof value === 'object' && value !== null) {
    // Handle objects that might have message/msg properties with ANSI codes
    const obj = value as Record<string, unknown>;
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      cleaned[key] = typeof val === 'string' ? stripAnsi(val) : val;
    }
    return cleaned;
  }
  return value;
}

/**
 * Create a child logger for a specific command or library
 * This provides command-specific context for all logs
 *
 * @param name - Command or library name
 * @param options - Logger configuration options
 * @returns A configured pino logger instance
 */
export function createCommandLogger(name: string, options: CommandLoggerOptions = {}): pino.Logger {
  const childLogger = logger.child({
    name,
    timestamp: new Date().toISOString(),
    enableConsole: options.enableConsole ?? false,
  });

  // Wrap logger methods to support dual logging
  if (options.enableConsole && !process.env.HODGE_SILENT) {
    const originalInfo = childLogger.info.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);
    const originalDebug = childLogger.debug.bind(childLogger);

    // Type-safe wrapper that preserves pino.LogFn signature
    // Strips ANSI color codes for pino while preserving them for console
    childLogger.info = Object.assign((msgOrObj: string | object, ...args: unknown[]) => {
      // Console: preserve colors
      console.log(msgOrObj, ...args);
      // Pino: strip ANSI codes for clean JSON logging
      const cleanMsg = stripAnsiFromValue(msgOrObj);
      const cleanArgs = args.map(stripAnsiFromValue);
      return originalInfo(cleanMsg as string, ...cleanArgs);
    }, originalInfo) as pino.LogFn;

    childLogger.warn = Object.assign((msgOrObj: string | object, ...args: unknown[]) => {
      // Console: preserve colors
      console.warn(msgOrObj, ...args);
      // Pino: strip ANSI codes for clean JSON logging
      const cleanMsg = stripAnsiFromValue(msgOrObj);
      const cleanArgs = args.map(stripAnsiFromValue);
      return originalWarn(cleanMsg as string, ...cleanArgs);
    }, originalWarn) as pino.LogFn;

    childLogger.error = Object.assign((msgOrObj: string | object, ...args: unknown[]) => {
      // Console: preserve colors
      console.error(msgOrObj, ...args);
      // Pino: strip ANSI codes for clean JSON logging
      const cleanMsg = stripAnsiFromValue(msgOrObj);
      const cleanArgs = args.map(stripAnsiFromValue);
      errorLogger.error(cleanMsg as string, ...cleanArgs);
      return originalError(cleanMsg as string, ...cleanArgs);
    }, originalError) as pino.LogFn;

    childLogger.debug = Object.assign((msgOrObj: string | object, ...args: unknown[]) => {
      if (process.env.DEBUG) {
        // Console: preserve colors
        console.debug(msgOrObj, ...args);
      }
      // Pino: strip ANSI codes for clean JSON logging
      const cleanMsg = stripAnsiFromValue(msgOrObj);
      const cleanArgs = args.map(stripAnsiFromValue);
      return originalDebug(cleanMsg as string, ...cleanArgs);
    }, originalDebug) as pino.LogFn;
  }

  return childLogger;
}

/**
 * Log rotation manager
 * Implements hybrid rotation strategy: size + time based
 */
export class LogRotator {
  private readonly maxSize = 10 * 1024 * 1024; // 10MB
  private readonly maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly maxFiles = 5;

  async rotateIfNeeded(): Promise<void> {
    const logFiles = await this.getLogFiles();

    for (const file of logFiles) {
      await this.checkAndRotate(file);
    }

    await this.cleanOldFiles();
  }

  private async getLogFiles(): Promise<string[]> {
    // Use dynamic log directory resolution for test compatibility
    const dir = process.env.HODGE_LOG_DIR ?? logDir;

    // Ensure directory exists before reading
    try {
      await fs.ensureDir(dir);
      const files = await fs.readdir(dir);
      return files.filter((f) => f.endsWith('.log')).map((f) => path.join(dir, f));
    } catch (error) {
      // Directory doesn't exist or can't be read - return empty array
      // This is expected during initial setup or in test environments
      logger.debug('Could not read log directory', { dir, error });
      return [];
    }
  }

  private async checkAndRotate(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);

      // Check size
      if (stats.size > this.maxSize) {
        await this.rotate(filePath, 'size');
        return;
      }

      // Check age (daily rotation)
      const age = Date.now() - stats.mtime.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (age > oneDayMs) {
        await this.rotate(filePath, 'age');
      }
    } catch (error) {
      // File might not exist yet, that's ok
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error('Error checking log file for rotation', { filePath, error });
      }
    }
  }

  private async rotate(filePath: string, reason: 'size' | 'age'): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const basename = path.basename(filePath, '.log');
    const rotatedName = `${basename}.${timestamp}.log`;
    const rotatedPath = path.join(logDir, rotatedName);

    try {
      await fs.rename(filePath, rotatedPath);
      logger.info('Log rotated', {
        original: filePath,
        rotated: rotatedPath,
        reason,
      });
    } catch (error) {
      logger.error('Failed to rotate log', { filePath, error });
    }
  }

  private async cleanOldFiles(): Promise<void> {
    const files = await this.getLogFiles();
    const rotatedFiles = files.filter((f) => f.includes('.2'));

    // Sort by modification time, oldest first
    const fileStats = await Promise.all(
      rotatedFiles.map(async (file) => ({
        file,
        mtime: (await fs.stat(file)).mtime.getTime(),
      }))
    );

    fileStats.sort((a, b) => a.mtime - b.mtime);

    // Remove old files by age
    const now = Date.now();
    const toDelete = fileStats.filter((f) => now - f.mtime > this.maxAge);

    // Also remove if we have too many files
    const keepCount = this.maxFiles;
    if (fileStats.length > keepCount) {
      const excess = fileStats.slice(0, fileStats.length - keepCount);
      toDelete.push(...excess);
    }

    // Delete the files
    for (const { file } of toDelete) {
      try {
        await fs.unlink(file);
        logger.info('Deleted old log file', { file });
      } catch (error) {
        logger.error('Failed to delete old log file', { file, error });
      }
    }
  }
}

// Export rotator for manual rotation (e.g., via cron or maintenance command)
// NOTE: Rotation should NOT run automatically on every import as this can cause log loss
// when commands run frequently. Instead, rotation should be triggered manually or via scheduled job.
export const rotator = new LogRotator();

// Ensure logs are flushed on process exit
// With sync: true, logs are written immediately so no flush needed
process.on('SIGINT', () => {
  logger.info('Process interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Process terminated');
  process.exit(0);
});
