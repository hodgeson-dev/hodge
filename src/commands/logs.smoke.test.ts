/**
 * Smoke Tests for Logs Command
 * Quick sanity checks for log formatting and filtering
 */

import { smokeTest } from '../test/helpers.js';
import { LogsCommand } from './logs.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

smokeTest('logs command should not crash with no log file', async () => {
  const cmd = new LogsCommand();
  await expect(cmd.execute()).resolves.not.toThrow();
});

smokeTest('logs command should handle empty options', async () => {
  const cmd = new LogsCommand();
  await expect(cmd.execute({})).resolves.not.toThrow();
});

smokeTest('logs command should handle pretty option', async () => {
  const cmd = new LogsCommand();
  await expect(cmd.execute({ pretty: true })).resolves.not.toThrow();
});

smokeTest('logs command should handle level filter', async () => {
  const cmd = new LogsCommand();
  await expect(cmd.execute({ level: 'error' })).resolves.not.toThrow();
});

smokeTest('logs command should handle command filter', async () => {
  const cmd = new LogsCommand();
  await expect(cmd.execute({ command: 'ship' })).resolves.not.toThrow();
});

smokeTest('logs command should handle tail option', async () => {
  const cmd = new LogsCommand();
  await expect(cmd.execute({ tail: 10 })).resolves.not.toThrow();
});

smokeTest('logs command should handle clear option', async () => {
  const cmd = new LogsCommand();
  await expect(cmd.execute({ clear: true })).resolves.not.toThrow();
});

smokeTest('formatLogLine should filter logger internals in pretty mode', async () => {
  const cmd = new LogsCommand();
  const logLine = JSON.stringify({
    time: Date.now(),
    level: 'info',
    msg: 'Test message',
    command: 'ship',
    name: 'ship',
    enableConsole: true,
    hostname: 'test-host',
    pid: 12345,
  });

  // Access private method via type assertion for testing
  const formatted = (cmd as any).formatLogLine(logLine, {}, true);

  expect(formatted).toBeTruthy();
  expect(formatted).not.toContain('enableConsole');
  expect(formatted).not.toContain('hostname');
  expect(formatted).not.toContain('"name"');
});

smokeTest('formatLogLine should capitalize and bracket command names', async () => {
  const cmd = new LogsCommand();
  const logLine = JSON.stringify({
    time: Date.now(),
    level: 'info',
    msg: 'Test message',
    command: 'ship',
  });

  const formatted = (cmd as any).formatLogLine(logLine, {}, true);

  expect(formatted).toContain('[Ship]');
  expect(formatted).not.toContain('[ship]');
});

smokeTest('formatLogLine should show user data line-by-line', async () => {
  const cmd = new LogsCommand();
  const logLine = JSON.stringify({
    time: Date.now(),
    level: 'error',
    msg: 'Failed to load',
    command: 'build',
    filePath: '/foo/bar',
    reason: 'not found',
  });

  const formatted = (cmd as any).formatLogLine(logLine, {}, true);

  expect(formatted).toContain('filePath: /foo/bar');
  expect(formatted).toContain('reason: not found');
  expect(formatted).toContain('\n  '); // Check for indentation
});

smokeTest('formatLogLine should preserve raw JSON in non-pretty mode', async () => {
  const cmd = new LogsCommand();
  const logLine = JSON.stringify({
    time: Date.now(),
    level: 'info',
    msg: 'Test',
    name: 'test',
    enableConsole: true,
  });

  const formatted = (cmd as any).formatLogLine(logLine, {}, false);

  expect(formatted).toBe(logLine);
});
