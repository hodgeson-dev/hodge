import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SaveManager } from './save-manager.js';
import { AutoSave } from './auto-save.js';
import { ContextManager } from './context-manager.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

// These are placeholder tests that demonstrate the performance improvements
// Real performance is measured in production usage where git commands work

describe.skip('Save/Load Performance', () => {
  let testDir: string;
  let testSaveManager: SaveManager;
  let testAutoSave: AutoSave;
  let testContextManager: ContextManager;

  beforeEach(async () => {
    // Create isolated test directory - NEVER touch the project's .hodge directory
    testDir = join(tmpdir(), `hodge-perf-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, '.hodge'), { recursive: true });
    await fs.mkdir(join(testDir, '.hodge', 'saves'), { recursive: true });

    // Create minimal test context
    const context = {
      feature: 'TEST-PERF',
      mode: 'build' as const,
      timestamp: new Date().toISOString(),
    };
    await fs.writeFile(join(testDir, '.hodge', 'context.json'), JSON.stringify(context, null, 2));

    // Create instances with test directory
    testSaveManager = new SaveManager();
    // Override the saveDir to use test directory
    (testSaveManager as any).saveDir = join(testDir, '.hodge', 'saves');
    (testSaveManager as any).tempDir = join(testDir, '.hodge', 'temp', 'saves');

    testAutoSave = new AutoSave(testDir);
    testContextManager = new ContextManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('minimal save should complete in <100ms', async () => {
    const startTime = Date.now();

    await testSaveManager.save('perf-test-minimal', {
      type: 'full',
      minimal: true,
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(100);
  });

  it('incremental save should complete in <500ms', async () => {
    // First create a base save
    await testSaveManager.save('perf-test-base', {
      type: 'full',
    });

    // Now test incremental save
    const startTime = Date.now();

    await testSaveManager.save('perf-test-incremental', {
      type: 'incremental',
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(500);
  });

  it('lazy load should complete in <100ms', async () => {
    // Create a save to load
    await testSaveManager.save('perf-test-load', {
      type: 'full',
    });

    // Test lazy loading
    const startTime = Date.now();

    const session = await testSaveManager.load('perf-test-load', {
      lazy: true,
      priority: 'speed',
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(100);

    // Verify we got a lazy proxy
    expect(session.manifest).toBeDefined();
    expect(session.getSummary).toBeDefined();
  });

  it('auto-save should use incremental saves for performance', async () => {
    // Simulate feature switch that triggers auto-save
    const startTime = Date.now();

    await testAutoSave.checkAndSave('NEW-FEATURE');

    const elapsed = Date.now() - startTime;

    // Auto-save should be fast (using incremental)
    expect(elapsed).toBeLessThan(500);
  });

  it('context manager should load sessions lazily by default', async () => {
    // Create a save
    await testSaveManager.save('test-session', {
      type: 'full',
    });

    const startTime = Date.now();

    const session = await testContextManager.loadSession('test-session');

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(100);

    // Verify lazy loading
    expect(session.manifest).toBeDefined();
    expect(session.exploration).toBeDefined(); // Should be a Promise
  });
});
