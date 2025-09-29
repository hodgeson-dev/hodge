/**
 * Smoke tests for the Hodge logger
 * Quick sanity checks to ensure logging works without crashing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Import logger components
import { logger, createCommandLogger, LogRotator } from './logger';
import defaultLogger from './logger';

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

  smokeTest('should handle default logger wrapper without crashing', () => {
    expect(() => {
      defaultLogger.info('Info via wrapper');
      defaultLogger.warn('Warning via wrapper');
      defaultLogger.error('Error via wrapper');
      defaultLogger.debug('Debug via wrapper');
      defaultLogger.log('Log via wrapper');
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

  smokeTest('should not output to console for non-init commands', () => {
    // Save original argv
    const originalArgv = process.argv;

    // Simulate non-init command
    process.argv = ['node', 'hodge', 'build', 'test'];

    // Spy on console.log to ensure it's not called
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.info('Should not appear in console');

    expect(consoleSpy).not.toHaveBeenCalled();

    // Restore
    consoleSpy.mockRestore();
    process.argv = originalArgv;
  });
});