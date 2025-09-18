import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BuildCommand } from '../commands/build';
import { HardenCommand } from '../commands/harden';
import { ShipCommand } from '../commands/ship';
import { ExploreCommand } from '../commands/explore';
import { ContextManager } from '../lib/context-manager';
import { rm, mkdir } from 'fs/promises';
import path from 'path';

describe('[integration] Context-Aware Workflow Commands', () => {
  const testDir = path.join(process.cwd(), '.test-workflow');
  let contextManager: ContextManager;

  beforeEach(async () => {
    await mkdir(path.join(testDir, '.hodge'), { recursive: true });
    contextManager = new ContextManager(testDir);
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should allow seamless workflow progression', async () => {
    // Simulate explore setting context
    await contextManager.save({ feature: 'CONTEXT-TEST-001', mode: 'explore' });

    // Load context to verify it was set
    const contextAfterExplore = await contextManager.load();
    expect(contextAfterExplore?.feature).toBe('CONTEXT-TEST-001');
    expect(contextAfterExplore?.mode).toBe('explore');

    // Simulate build updating context
    await contextManager.updateForCommand('build', 'CONTEXT-TEST-001', 'build');

    // Verify context was updated
    const contextAfterBuild = await contextManager.load();
    expect(contextAfterBuild?.feature).toBe('CONTEXT-TEST-001');
    expect(contextAfterBuild?.mode).toBe('build');
  });

  it('should return null when no context and no feature provided', async () => {
    // Test the getFeature method behavior
    const feature = await contextManager.getFeature();
    expect(feature).toBeNull();
  });

  it('should allow explicit feature to override context', async () => {
    // Set initial context
    await contextManager.save({ feature: 'OLD-FEATURE', mode: 'explore' });

    // Test getFeature with explicit override
    const feature = await contextManager.getFeature('NEW-FEATURE');
    expect(feature).toBe('NEW-FEATURE'); // Should use explicit, not context

    // Verify original context unchanged
    const context = await contextManager.load();
    expect(context?.feature).toBe('OLD-FEATURE');
  });

  it('should maintain backward compatibility', async () => {
    // Test that explicit features work
    const feature = await contextManager.getFeature('EXPLICIT-FEATURE');
    expect(feature).toBe('EXPLICIT-FEATURE');

    // Save and verify
    await contextManager.save({ feature: 'EXPLICIT-FEATURE', mode: 'build' });
    const context = await contextManager.load();
    expect(context?.feature).toBe('EXPLICIT-FEATURE');
  });
});

describe('[smoke] Context-Aware Commands Basic Functionality', () => {
  it('should not crash when loading BuildCommand with context support', () => {
    expect(() => new BuildCommand()).not.toThrow();
  });

  it('should not crash when loading HardenCommand with context support', () => {
    expect(() => new HardenCommand()).not.toThrow();
  });

  it('should not crash when loading ShipCommand with context support', () => {
    expect(() => new ShipCommand()).not.toThrow();
  });

  it('should not crash when loading ExploreCommand with context support', () => {
    expect(() => new ExploreCommand()).not.toThrow();
  });
});
