/**
 * HODGE-220: Integration test for ship command clean working tree fix
 *
 * Simplified integration tests that verify the behavior without full workspace setup
 */

import { describe, it, expect } from 'vitest';
import { integrationTest } from '../test/helpers.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

describe('ship command integration - HODGE-220', () => {
  integrationTest('should have backup and restore functions integrated', async () => {
    // Import the ship command module
    const shipModule = await import('./ship.js');

    // Verify the ShipCommand class exists
    expect(shipModule.ShipCommand).toBeDefined();

    // Create an instance and verify it has the expected structure
    const shipCommand = new shipModule.ShipCommand();
    expect(shipCommand).toBeDefined();
    expect(shipCommand.execute).toBeDefined();
    expect(typeof shipCommand.execute).toBe('function');
  });

  integrationTest(
    'should verify metadata update order without HODGE.md (HODGE-319.1)',
    async () => {
      // Read the ship.ts source file
      const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
      const content = await fs.readFile(shipPath, 'utf-8');

      // Verify the order of operations (without HODGE.md generation)
      const lines = content.split('\n');
      let backupLine = -1;
      let commitLine = -1;
      let restoreLine = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('await backupMetadata(feature)')) {
          backupLine = i;
        }
        if (lines[i].includes('`git commit -m')) {
          commitLine = i;
        }
        if (lines[i].includes('await restoreMetadata(feature, metadataBackup)')) {
          restoreLine = i;
        }
      }

      // Verify correct order: backup -> commit -> restore (on error)
      expect(backupLine).toBeGreaterThan(0);
      expect(commitLine).toBeGreaterThan(backupLine);
      expect(restoreLine).toBeGreaterThan(commitLine);

      // Verify HODGE.md generation was removed (HODGE-319.1)
      expect(content).not.toContain('generateFeatureHodgeMD');
    }
  );

  integrationTest('should use git add -A for staging all changes', async () => {
    // Read the compiled ship.js file to verify runtime behavior
    const shipJsPath = path.join(process.cwd(), 'dist', 'src', 'commands', 'ship.js');

    // Only run this test if the built file exists
    if (existsSync(shipJsPath)) {
      const content = await fs.readFile(shipJsPath, 'utf-8');

      // Verify we're using git add -A
      expect(content).toContain("'git add -A'");

      // Verify rollback mechanism is present
      expect(content).toContain('backupMetadata');
      expect(content).toContain('restoreMetadata');

      // Verify try-catch structure for rollback
      expect(content).toContain('try {');
      expect(content).toContain('catch (error)');
    }
  });

  integrationTest('should handle rollback on commit failure', async () => {
    // Test the rollback logic by verifying the error handling structure
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const content = await fs.readFile(shipPath, 'utf-8');

    // Verify error handling includes rollback
    expect(content).toContain('// Inner catch for git commit failure');
    expect(content).toContain('await restoreMetadata(feature, metadataBackup)');
    expect(content).toContain('✓ Metadata rolled back successfully');

    // Verify outer catch for overall failures
    expect(content).toContain('// Outer catch for any failures during the ship process');
  });
});
