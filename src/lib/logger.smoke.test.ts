/**
 * Smoke tests for the Hodge logger
 * Quick sanity checks to ensure logging works without crashing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { smokeTest } from '../test/helpers';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Import logger components
import { logger, createCommandLogger, LogRotator, type CommandLoggerOptions } from './logger';

describe('[smoke] Logger', () => {
  const testLogDir = path.join(os.tmpdir(), 'hodge-logger-test', Date.now().toString());

  beforeEach(async () => {
    // Ensure clean test directory
    await fs.ensureDir(testLogDir);
    // Override log directory for tests
    process.env.HODGE_LOG_DIR = testLogDir;
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testLogDir);
    delete process.env.HODGE_LOG_DIR;
  });

  smokeTest('should create logger without crashing', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  smokeTest('should log info message without crashing', () => {
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  smokeTest('should log error message without crashing', () => {
    expect(() => {
      logger.error('Test error message', { error: new Error('Test error') });
    }).not.toThrow();
  });

  smokeTest('should create command logger without crashing', () => {
    const commandLogger = createCommandLogger('test-command');
    expect(commandLogger).toBeDefined();
    expect(() => {
      commandLogger.info('Command test message');
    }).not.toThrow();
  });

  smokeTest('should create logger with enableConsole: true (dual logging)', () => {
    const cmdLogger = createCommandLogger('test-command', { enableConsole: true });
    expect(cmdLogger).toBeDefined();
    expect(() => {
      cmdLogger.info('Test dual logging');
    }).not.toThrow();
  });

  smokeTest('should create logger with enableConsole: false (pino only)', () => {
    const libLogger = createCommandLogger('test-lib', { enableConsole: false });
    expect(libLogger).toBeDefined();
    expect(() => {
      libLogger.info('Test pino-only logging');
    }).not.toThrow();
  });

  smokeTest('should default to enableConsole: false when no options provided', () => {
    const defaultLogger = createCommandLogger('test-default');
    expect(defaultLogger).toBeDefined();
    expect(() => {
      defaultLogger.info('Test default logging');
    }).not.toThrow();
  });

  smokeTest('should create LogRotator without crashing', async () => {
    const rotator = new LogRotator();
    expect(rotator).toBeDefined();

    // Should not crash when rotating non-existent files
    await expect(rotator.rotateIfNeeded()).resolves.not.toThrow();
  });

  smokeTest('should respect LOG_LEVEL environment variable', () => {
    const originalLevel = process.env.LOG_LEVEL;

    // Test different log levels
    process.env.LOG_LEVEL = 'debug';
    expect(() => {
      logger.debug('Debug level test');
    }).not.toThrow();

    process.env.LOG_LEVEL = 'error';
    expect(() => {
      logger.error('Error level test');
    }).not.toThrow();

    // Restore original level
    if (originalLevel) {
      process.env.LOG_LEVEL = originalLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  smokeTest('should handle concurrent logging without crashing', async () => {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        new Promise<void>((resolve) => {
          logger.info(`Concurrent log ${i}`);
          resolve();
        })
      );
    }

    await expect(Promise.all(promises)).resolves.not.toThrow();
  });

  smokeTest('should write to console when enableConsole: true', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const cmdLogger = createCommandLogger('test-cmd', { enableConsole: true });
    cmdLogger.info('Test message');

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  smokeTest('should NOT write to console when enableConsole: false', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const libLogger = createCommandLogger('test-lib', { enableConsole: false });
    libLogger.info('Test message');

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  smokeTest('should respect HODGE_SILENT environment variable', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    process.env.HODGE_SILENT = 'true';

    const cmdLogger = createCommandLogger('test-cmd', { enableConsole: true });
    cmdLogger.info('Test message');

    // Should not write to console even with enableConsole: true
    expect(consoleSpy).not.toHaveBeenCalled();

    delete process.env.HODGE_SILENT;
    consoleSpy.mockRestore();
  });
});
