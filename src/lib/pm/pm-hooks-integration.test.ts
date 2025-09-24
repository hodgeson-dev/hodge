import { describe, expect } from 'vitest';
import { ExploreCommand } from '../../commands/explore.js';
import { BuildCommand } from '../../commands/build.js';
import { HardenCommand } from '../../commands/harden.js';
import { ShipCommand } from '../../commands/ship.js';
import { smokeTest } from '../../test/helpers.js';
import { PMHooks } from './pm-hooks.js';

describe('PM Hooks Integration', () => {
  // These are smoke tests that verify PM hooks are properly integrated
  // They do NOT modify any directories or make actual PM calls

  smokeTest('PMHooks class should initialize without errors', () => {
    expect(() => {
      const pmHooks = new PMHooks();
      expect(pmHooks).toBeDefined();
    }).not.toThrow();
  });

  smokeTest('explore command should have PM hooks integrated', () => {
    const explore = new ExploreCommand();

    // Verify pmHooks property exists and is initialized
    expect(explore).toHaveProperty('pmHooks');
    expect((explore as any).pmHooks).toBeDefined();
    expect((explore as any).pmHooks).toBeInstanceOf(PMHooks);
  });

  smokeTest('build command should have PM hooks integrated', () => {
    const build = new BuildCommand();

    // Verify pmHooks property exists and is initialized
    expect(build).toHaveProperty('pmHooks');
    expect((build as any).pmHooks).toBeDefined();
    expect((build as any).pmHooks).toBeInstanceOf(PMHooks);
  });

  smokeTest('harden command should have PM hooks integrated', () => {
    const harden = new HardenCommand();

    // Verify pmHooks property exists and is initialized
    expect(harden).toHaveProperty('pmHooks');
    expect((harden as any).pmHooks).toBeDefined();
    expect((harden as any).pmHooks).toBeInstanceOf(PMHooks);
  });

  smokeTest('ship command should have PM hooks integrated', () => {
    const ship = new ShipCommand();

    // Verify pmHooks property exists and is initialized
    expect(ship).toHaveProperty('pmHooks');
    expect((ship as any).pmHooks).toBeDefined();
    expect((ship as any).pmHooks).toBeInstanceOf(PMHooks);
  });

  smokeTest('PM hooks should handle missing configuration gracefully', async () => {
    // Remove any PM configuration
    const originalPMTool = process.env.HODGE_PM_TOOL;
    const originalLinearKey = process.env.LINEAR_API_KEY;

    delete process.env.HODGE_PM_TOOL;
    delete process.env.LINEAR_API_KEY;

    const pmHooks = new PMHooks();

    // These methods should not throw even without configuration
    await expect(pmHooks.onExplore('test-feature', 'Test feature')).resolves.not.toThrow();
    await expect(pmHooks.onBuild('test-feature')).resolves.not.toThrow();
    await expect(pmHooks.onShip('test-feature')).resolves.not.toThrow();

    // Restore original configuration
    if (originalPMTool) process.env.HODGE_PM_TOOL = originalPMTool;
    if (originalLinearKey) process.env.LINEAR_API_KEY = originalLinearKey;
  });
});
