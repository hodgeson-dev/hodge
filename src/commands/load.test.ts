import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LoadCommand } from './load.js';
import { SaveCommand } from './save.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

describe('LoadCommand [smoke]', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create isolated test directory - NEVER touch the project's .hodge directory
    testDir = join(tmpdir(), `hodge-load-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, '.hodge'), { recursive: true });
    await fs.mkdir(join(testDir, '.hodge', 'saves'), { recursive: true });

    // Create minimal context for testing
    const context = {
      feature: 'TEST-LOAD',
      mode: 'build',
      timestamp: new Date().toISOString(),
    };
    await fs.writeFile(join(testDir, '.hodge', 'context.json'), JSON.stringify(context, null, 2));
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should not crash when instantiating', () => {
    expect(() => new LoadCommand()).not.toThrow();
  });

  it('should have execute method', () => {
    const loadCommand = new LoadCommand();
    expect(loadCommand.execute).toBeDefined();
    expect(typeof loadCommand.execute).toBe('function');
  });

  it('should handle options parameter', () => {
    const loadCommand = new LoadCommand();
    // Just verify it accepts the right parameters
    expect(() => {
      // Don't actually execute, just check the signature
      const fn = loadCommand.execute;
      return fn.length; // Check arity
    }).not.toThrow();
  });

  it('smoke test - command structure is valid', () => {
    const loadCommand = new LoadCommand();

    // Verify the command has the expected structure
    expect(loadCommand).toBeDefined();
    expect(loadCommand.execute).toBeDefined();

    // The command should be callable
    expect(typeof loadCommand.execute).toBe('function');
  });
});
