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

// Determine if we're running the init command (needs console output)
const isInitCommand = process.argv.includes('init');

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
  level: process.env.LOG_LEVEL ?? 'info',
};

export const logger = pino(loggerOptions, logDestination);

// Also create error-only logger
const errorLoggerOptions: LoggerOptions = {
  ...baseLoggerOptions,
  level: 'error',
};

export const errorLogger = pino(errorLoggerOptions, errorDestination);

/**
 * Create a child logger for a specific command
 * This provides command-specific context for all logs
 */
export function createCommandLogger(command: string): pino.Logger {
  return logger.child({
    command,
    timestamp: new Date().toISOString(),
  });
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
    const dir = process.env.HODGE_LOG_DIR || logDir;

    // Ensure directory exists before reading
    try {
      await fs.ensureDir(dir);
      const files = await fs.readdir(dir);
      return files.filter((f) => f.endsWith('.log')).map((f) => path.join(dir, f));
    } catch (error) {
      // Directory doesn't exist or can't be read - return empty array
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

// Initialize rotation on startup
const rotator = new LogRotator();
rotator.rotateIfNeeded().catch((error: unknown) => {
  logger.error('Initial log rotation failed', { error });
});

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

// Export convenience methods that maintain console.log compatibility
export default {
  info: (message: string, ...args: unknown[]) => {
    logger.info({ args }, message);
    if (isInitCommand && !process.env.HODGE_SILENT) {
      console.log(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    logger.warn({ args }, message);
    if (isInitCommand && !process.env.HODGE_SILENT) {
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    logger.error({ args }, message);
    errorLogger.error({ args }, message);
    if (isInitCommand && !process.env.HODGE_SILENT) {
      console.error(message, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    logger.debug({ args }, message);
    if (isInitCommand && !process.env.HODGE_SILENT && process.env.DEBUG) {
      console.debug(message, ...args);
    }
  },

  // For gradual migration from console.log
  log: (message: string, ...args: unknown[]) => {
    logger.info({ args }, message);
    if (isInitCommand && !process.env.HODGE_SILENT) {
      console.log(message, ...args);
    }
  },
};
