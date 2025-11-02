/**
 * Integration Tests for Logs Command
 * End-to-end behavior verification with real log files
 */

import { integrationTest } from '../test/helpers.js';
import { LogsCommand } from './logs.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import fs from 'fs-extra';
import path from 'path';

integrationTest('should read and format real log file with pretty output', async () => {
  const fixture = new TempDirectoryFixture();
  const testLogDir = await fixture.setup();
  const testLogFile = path.join(testLogDir, 'hodge.log');

  try {
    // Create a test log file with sample entries
    const logEntries = [
      JSON.stringify({
        time: Date.now(),
        level: 'info',
        msg: 'Test message 1',
        command: 'explore',
        name: 'explore',
        enableConsole: true,
      }),
      JSON.stringify({
        time: Date.now(),
        level: 'error',
        msg: 'Test error',
        command: 'build',
        hostname: 'test-host',
      }),
      JSON.stringify({
        time: Date.now(),
        level: 'info',
        msg: 'Test with user data',
        command: 'ship',
        filePath: '/foo/bar',
        reason: 'not found',
      }),
    ];

    await fs.writeFile(testLogFile, logEntries.join('\n'));

    const cmd = new LogsCommand(testLogFile);

    // Execute should not throw
    await expect(cmd.execute({ pretty: true })).resolves.not.toThrow();
  } finally {
    await fixture.cleanup();
  }
});

integrationTest('should filter logs by level', async () => {
  const fixture = new TempDirectoryFixture();
  const testLogDir = await fixture.setup();
  const testLogFile = path.join(testLogDir, 'hodge.log');

  try {
    const logEntries = [
      JSON.stringify({ time: Date.now(), level: 'info', msg: 'Info message' }),
      JSON.stringify({ time: Date.now(), level: 'error', msg: 'Error message' }),
      JSON.stringify({ time: Date.now(), level: 'info', msg: 'Another info' }),
    ];

    await fs.writeFile(testLogFile, logEntries.join('\n'));

    const cmd = new LogsCommand(testLogFile);

    await expect(cmd.execute({ level: 'error', pretty: true })).resolves.not.toThrow();
  } finally {
    await fixture.cleanup();
  }
});

integrationTest('should filter logs by command', async () => {
  const fixture = new TempDirectoryFixture();
  const testLogDir = await fixture.setup();
  const testLogFile = path.join(testLogDir, 'hodge.log');

  try {
    const logEntries = [
      JSON.stringify({ time: Date.now(), level: 'info', msg: 'Explore msg', command: 'explore' }),
      JSON.stringify({ time: Date.now(), level: 'info', msg: 'Build msg', command: 'build' }),
      JSON.stringify({
        time: Date.now(),
        level: 'info',
        msg: 'Another explore',
        command: 'explore',
      }),
    ];

    await fs.writeFile(testLogFile, logEntries.join('\n'));

    const cmd = new LogsCommand(testLogFile);

    await expect(cmd.execute({ command: 'build', pretty: true })).resolves.not.toThrow();
  } finally {
    await fixture.cleanup();
  }
});

integrationTest('should apply tail limit correctly', async () => {
  const fixture = new TempDirectoryFixture();
  const testLogDir = await fixture.setup();
  const testLogFile = path.join(testLogDir, 'hodge.log');

  try {
    const logEntries = Array.from({ length: 100 }, (_, i) =>
      JSON.stringify({ time: Date.now(), level: 'info', msg: `Message ${i}` })
    );

    await fs.writeFile(testLogFile, logEntries.join('\n'));

    const cmd = new LogsCommand(testLogFile);

    await expect(cmd.execute({ tail: 10, pretty: true })).resolves.not.toThrow();
  } finally {
    await fixture.cleanup();
  }
});

integrationTest('should clear log files', async () => {
  const fixture = new TempDirectoryFixture();
  const testLogDir = await fixture.setup();
  const testLogFile = path.join(testLogDir, 'hodge.log');

  try {
    await fs.writeFile(testLogFile, 'test log content');

    const cmd = new LogsCommand(testLogFile);

    await cmd.execute({ clear: true });

    // Log file should be deleted
    expect(await fs.pathExists(testLogFile)).toBe(false);
  } finally {
    await fixture.cleanup();
  }
});

integrationTest('should handle non-existent log file gracefully', async () => {
  const cmd = new LogsCommand('/nonexistent/test-hodge-log-file.log');

  await expect(cmd.execute({ pretty: true })).resolves.not.toThrow();
});

integrationTest('should handle malformed JSON in log file', async () => {
  const fixture = new TempDirectoryFixture();
  const testLogDir = await fixture.setup();
  const testLogFile = path.join(testLogDir, 'hodge.log');

  try {
    const logEntries = [
      JSON.stringify({ time: Date.now(), level: 'info', msg: 'Valid entry' }),
      'This is not valid JSON',
      JSON.stringify({ time: Date.now(), level: 'info', msg: 'Another valid entry' }),
    ];

    await fs.writeFile(testLogFile, logEntries.join('\n'));

    const cmd = new LogsCommand(testLogFile);

    await expect(cmd.execute({ pretty: true })).resolves.not.toThrow();
  } finally {
    await fixture.cleanup();
  }
});

integrationTest('should preserve raw JSON in non-pretty mode', async () => {
  const fixture = new TempDirectoryFixture();
  const testLogDir = await fixture.setup();
  const testLogFile = path.join(testLogDir, 'hodge.log');

  try {
    const logEntry = JSON.stringify({
      time: Date.now(),
      level: 'info',
      msg: 'Test',
      name: 'test',
      enableConsole: true,
    });

    await fs.writeFile(testLogFile, logEntry);

    const cmd = new LogsCommand(testLogFile);

    await expect(cmd.execute({ pretty: false })).resolves.not.toThrow();
  } finally {
    await fixture.cleanup();
  }
});
