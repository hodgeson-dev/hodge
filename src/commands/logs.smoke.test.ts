/**
 * Smoke Tests for Logs Command
 * Quick sanity checks - no file I/O, <100ms each
 */

import { smokeTest } from '../test/helpers.js';
import { LogsCommand } from './logs.js';

smokeTest('LogsCommand constructor should not throw with custom path', () => {
  expect(() => new LogsCommand('/tmp/fake-log-path.log')).not.toThrow();
});

smokeTest('LogsCommand constructor should not throw with default path', () => {
  expect(() => new LogsCommand()).not.toThrow();
});

smokeTest('formatLogLine should handle malformed JSON gracefully', () => {
  const cmd = new LogsCommand('/tmp/fake.log');
  const result = (cmd as any).formatLogLine('invalid json', {}, true);
  expect(result).toBeTruthy(); // Should return the line as-is, not crash
});

smokeTest('formatLogLine should filter logger internals in pretty mode', () => {
  const cmd = new LogsCommand('/tmp/fake.log');
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

  const formatted = (cmd as any).formatLogLine(logLine, {}, true);

  expect(formatted).toBeTruthy();
  expect(formatted).not.toContain('enableConsole');
  expect(formatted).not.toContain('hostname');
  expect(formatted).not.toContain('"name"');
});

smokeTest('formatLogLine should capitalize and bracket command names', () => {
  const cmd = new LogsCommand('/tmp/fake.log');
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

smokeTest('formatLogLine should show user data line-by-line', () => {
  const cmd = new LogsCommand('/tmp/fake.log');
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

smokeTest('formatLogLine should preserve raw JSON in non-pretty mode', () => {
  const cmd = new LogsCommand('/tmp/fake.log');
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
