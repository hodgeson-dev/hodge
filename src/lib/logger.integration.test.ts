/**
 * Integration tests for logger dual logging system (HODGE-330)
 *
 * Tests end-to-end behavior of:
 * - Command logger dual output (console + pino)
 * - Library logger pino-only output
 * - Environment variable controls (HODGE_SILENT)
 * - Log file creation and content
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { integrationTest } from '../test/helpers.js';
import { createCommandLogger } from './logger.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Logger Integration Tests', () => {
  let testLogDir: string;
  let originalEnv: NodeJS.ProcessEnv;
  let consoleOutput: string[];
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    // Create isolated test log directory
    testLogDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hodge-logger-test-'));

    // Save original environment
    originalEnv = { ...process.env };
    process.env.HODGE_LOG_DIR = testLogDir;

    // Capture console output
    consoleOutput = [];
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;

    console.log = (...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(' '));
    };
    console.error = (...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(' '));
    };
    console.warn = (...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(' '));
    };
  });

  afterEach(() => {
    // Restore console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;

    // Restore environment
    process.env = originalEnv;

    // Clean up test directory
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  integrationTest('command logger should write to both console and pino logs', async () => {
    const logger = createCommandLogger('test-command', { enableConsole: true });

    logger.info('Test message');

    // Verify console output
    expect(consoleOutput.length).toBeGreaterThan(0);
    const hasMessage = consoleOutput.some((output) => output.includes('Test message'));
    expect(hasMessage).toBe(true);

    // Wait for pino to flush (logs are written to os.tmpdir() in test mode)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In test mode, logs go to os.tmpdir() with process.pid in filename
    const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);

    // Verify log file exists and contains message
    expect(fs.existsSync(expectedLogFile)).toBe(true);
    const logContent = fs.readFileSync(expectedLogFile, 'utf-8');
    expect(logContent).toContain('Test message');
    expect(logContent).toContain('test-command');
  });

  integrationTest('library logger should write only to pino logs (no console)', async () => {
    const logger = createCommandLogger('test-library', { enableConsole: false });

    logger.info('Library message');

    // Verify NO console output
    expect(consoleOutput.length).toBe(0);

    // Wait for pino to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify pino log file exists and contains message
    const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);
    expect(fs.existsSync(expectedLogFile)).toBe(true);

    const logContent = fs.readFileSync(expectedLogFile, 'utf-8');
    expect(logContent).toContain('Library message');
    expect(logContent).toContain('test-library');
  });

  integrationTest(
    'HODGE_SILENT should suppress console output but preserve pino logs',
    async () => {
      process.env.HODGE_SILENT = 'true';

      const logger = createCommandLogger('test-silent', { enableConsole: true });

      logger.info('Silent test');

      // Verify NO console output (suppressed by HODGE_SILENT)
      expect(consoleOutput.length).toBe(0);

      // Wait for pino to flush
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify pino log still exists
      const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);
      expect(fs.existsSync(expectedLogFile)).toBe(true);

      const logContent = fs.readFileSync(expectedLogFile, 'utf-8');
      expect(logContent).toContain('Silent test');
    }
  );

  integrationTest('logger should handle different log levels correctly', async () => {
    const logger = createCommandLogger('test-levels', { enableConsole: true });

    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    // Verify console captured all levels
    expect(consoleOutput.length).toBe(3);
    expect(consoleOutput.some((o) => o.includes('Info message'))).toBe(true);
    expect(consoleOutput.some((o) => o.includes('Warning message'))).toBe(true);
    expect(consoleOutput.some((o) => o.includes('Error message'))).toBe(true);

    // Wait for pino to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify pino log contains all levels
    const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);
    const logContent = fs.readFileSync(expectedLogFile, 'utf-8');

    expect(logContent).toContain('Info message');
    expect(logContent).toContain('Warning message');
    expect(logContent).toContain('Error message');
  });

  integrationTest('logger should write to pino log file', async () => {
    const logger = createCommandLogger('test-context', { enableConsole: false });

    logger.info('Action performed');

    // Wait for pino to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify pino log contains message
    const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);
    const logContent = fs.readFileSync(expectedLogFile, 'utf-8');

    expect(logContent).toContain('Action performed');
    expect(logContent).toContain('test-context');
  });

  integrationTest('multiple loggers should write to same log file in test mode', async () => {
    const logger1 = createCommandLogger('command-1', { enableConsole: false });
    const logger2 = createCommandLogger('command-2', { enableConsole: false });

    logger1.info('Message from command 1');
    logger2.info('Message from command 2');

    // Wait for pino to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In test mode, all loggers write to same file
    const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);
    const logContent = fs.readFileSync(expectedLogFile, 'utf-8');

    expect(logContent).toContain('command-1');
    expect(logContent).toContain('command-2');
    expect(logContent).toContain('Message from command 1');
    expect(logContent).toContain('Message from command 2');
  });

  integrationTest('logger should log errors to both main and error log', async () => {
    const logger = createCommandLogger('test-errors', { enableConsole: false });

    logger.error('Error occurred');

    // Wait for pino to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify error appears in main log
    const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);
    const logContent = fs.readFileSync(expectedLogFile, 'utf-8');
    expect(logContent).toContain('Error occurred');
    expect(logContent).toContain('test-errors');

    // Verify error-specific log file exists (errors are also logged there)
    const errorLogFile = path.join(os.tmpdir(), `error-test-${process.pid}.log`);
    // File should exist and contain error-level logs
    expect(fs.existsSync(errorLogFile)).toBe(true);
  });

  integrationTest('default logger (no options) should use pino-only mode', async () => {
    const logger = createCommandLogger('test-default');

    logger.info('Default behavior test');

    // Verify NO console output (default is enableConsole: false)
    expect(consoleOutput.length).toBe(0);

    // Wait for pino to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify pino log exists
    const expectedLogFile = path.join(os.tmpdir(), `hodge-test-${process.pid}.log`);
    expect(fs.existsSync(expectedLogFile)).toBe(true);

    const logContent = fs.readFileSync(expectedLogFile, 'utf-8');
    expect(logContent).toContain('Default behavior test');
  });
});
