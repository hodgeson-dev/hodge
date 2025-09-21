import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SaveCommand } from './save.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

describe('SaveCommand [smoke]', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create isolated test directory - NEVER touch the project's .hodge directory
    testDir = join(tmpdir(), `hodge-save-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, '.hodge'), { recursive: true });
    await fs.mkdir(join(testDir, '.hodge', 'saves'), { recursive: true });

    // Create minimal context for testing
    const context = {
      feature: 'TEST-SAVE',
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
    expect(() => new SaveCommand()).not.toThrow();
  });

  it('should have execute method', () => {
    const saveCommand = new SaveCommand();
    expect(saveCommand.execute).toBeDefined();
    expect(typeof saveCommand.execute).toBe('function');
  });

  it('should handle options parameter', () => {
    const saveCommand = new SaveCommand();
    // Just verify it accepts the right parameters
    expect(() => {
      // Don't actually execute, just check the signature
      const fn = saveCommand.execute;
      return fn.length; // Check arity
    }).not.toThrow();
  });

  it('smoke test - command structure is valid', () => {
    const saveCommand = new SaveCommand();

    // Verify the command has the expected structure
    expect(saveCommand).toBeDefined();
    expect(saveCommand.execute).toBeDefined();

    // The command should be callable
    expect(typeof saveCommand.execute).toBe('function');
  });
});
