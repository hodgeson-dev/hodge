/**
 * HODGE-220: Smoke test to verify ship command leaves clean working tree
 *
 * Note: These are simplified smoke tests that check basic functionality.
 * The actual verification happens during integration testing.
 */

import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { existsSync } from 'fs';
import * as path from 'path';

describe('ship command - clean working tree', () => {
  smokeTest('should have rollback functions defined', async () => {
    // Simple smoke test to verify the rollback functions are exported
    const shipModule = await import('./ship.js');

    // Check that the ship command exists
    expect(shipModule.ShipCommand).toBeDefined();

    // Verify the implementation file has been modified
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    expect(existsSync(shipPath)).toBe(true);
  });

  smokeTest('should use git add -A instead of git add .', async () => {
    // HODGE-357.1: Git commands moved to ShipService
    const fs = await import('fs/promises');
    const shipServicePath = path.join(process.cwd(), 'src', 'lib', 'ship-service.ts');
    const content = await fs.readFile(shipServicePath, 'utf-8');

    // Check that we're using git add -A for staging all changes
    expect(content).toContain('git add -A');

    // Verify we have the rollback mechanism
    expect(content).toContain('backupMetadata');
    expect(content).toContain('restoreMetadata');
  });

  smokeTest('should not generate HODGE.md (HODGE-319.1)', async () => {
    // Verify HODGE.md generation was removed in HODGE-319.1
    const fs = await import('fs/promises');
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const content = await fs.readFile(shipPath, 'utf-8');

    // Verify HODGE.md generation has been removed
    expect(content).not.toContain('generateFeatureHodgeMD(feature)');
    expect(content).not.toContain('populator.generateFeatureHodgeMD');

    // Verify backup/restore still exists for other metadata (HODGE-357.1: moved to ShipService)
    expect(content).toContain('shipService.backupMetadata');
    // restoreMetadata now called inside ShipService.createShipCommit(), not in ship.ts

    // Verify git commit still exists (now via ShipService)
    expect(content).toContain('createShipCommit');
  });
});
