import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContextManager } from '../context-manager';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { TempDirectoryFixture } from '../../test/temp-directory-fixture.js';

describe('[smoke] ContextManager', () => {
  let fixture: TempDirectoryFixture;
  let testDir: string;
  let contextManager: ContextManager;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    testDir = await fixture.setup();
    await mkdir(path.join(testDir, '.hodge'), { recursive: true });
    contextManager = new ContextManager(testDir);
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  it('should create a ContextManager instance', () => {
    expect(contextManager).toBeDefined();
    expect(contextManager.load).toBeDefined();
    expect(contextManager.save).toBeDefined();
    expect(contextManager.getFeature).toBeDefined();
  });

  it('should return null when no context exists', async () => {
    const context = await contextManager.load();
    expect(context).toBeNull();
  });

  it('should save and load context', async () => {
    await contextManager.save({ feature: 'TEST-001', mode: 'build' });
    const context = await contextManager.load();
    expect(context).toBeDefined();
    expect(context?.feature).toBe('TEST-001');
    expect(context?.mode).toBe('build');
  });

  it('should get feature from explicit argument over context', async () => {
    await contextManager.save({ feature: 'CONTEXT-001' });
    const feature = await contextManager.getFeature('EXPLICIT-001');
    expect(feature).toBe('EXPLICIT-001');
  });

  it('should get feature from context when no argument provided', async () => {
    await contextManager.save({ feature: 'CONTEXT-002' });
    const feature = await contextManager.getFeature();
    expect(feature).toBe('CONTEXT-002');
  });

  it('should return null when no feature in context or argument', async () => {
    const feature = await contextManager.getFeature();
    expect(feature).toBeNull();
  });

  it('should update context for commands', async () => {
    await contextManager.updateForCommand('build', 'FEATURE-003', 'build');
    const context = await contextManager.load();
    expect(context?.feature).toBe('FEATURE-003');
    expect(context?.mode).toBe('build');
    expect(context?.lastCommand).toBe('build');
  });

  it('should handle corrupted context gracefully', async () => {
    const contextPath = path.join(testDir, '.hodge', 'context.json');
    await mkdir(path.join(testDir, '.hodge'), { recursive: true });

    // Write invalid JSON
    const fs = await import('fs/promises');
    await fs.writeFile(contextPath, '{ invalid json }');

    const context = await contextManager.load();
    expect(context).toBeNull(); // Should return null, not throw
  });

  it('should clear context', async () => {
    await contextManager.save({ feature: 'TO-CLEAR' });
    let context = await contextManager.load();
    expect(context?.feature).toBe('TO-CLEAR');

    await contextManager.clear();
    context = await contextManager.load();
    expect(context).toBeNull();
  });
});
