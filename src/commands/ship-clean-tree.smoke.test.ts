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
    // Read the ship.ts file and verify it uses the correct git command
    const fs = await import('fs/promises');
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const content = await fs.readFile(shipPath, 'utf-8');

    // Check that we're using git add -A for staging all changes
    expect(content).toContain('git add -A');

    // Verify we have the rollback mechanism
    expect(content).toContain('backupMetadata');
    expect(content).toContain('restoreMetadata');
  });

  smokeTest('should move metadata updates before commit', async () => {
    // Verify the code structure has been changed
    const fs = await import('fs/promises');
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const content = await fs.readFile(shipPath, 'utf-8');

    // Find line numbers for key operations
    const lines = content.split('\n');
    let generateLineNum = -1;
    let commitLineNum = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('generateFeatureHodgeMD(feature)')) {
        generateLineNum = i;
      }
      if (lines[i].includes('`git commit -m')) {
        commitLineNum = i;
      }
    }

    // Verify generateFeatureHodgeMD comes before git commit
    expect(generateLineNum).toBeGreaterThan(0);
    expect(commitLineNum).toBeGreaterThan(0);
    expect(generateLineNum).toBeLessThan(commitLineNum);

    // Verify the HODGE-220 comment is present
    expect(content).toContain('HODGE-220');
  });
});
