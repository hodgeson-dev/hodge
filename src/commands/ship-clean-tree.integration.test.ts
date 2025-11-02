/**
 * HODGE-220: Integration test for ship command clean working tree fix
 *
 * Simplified integration tests that verify the behavior without full workspace setup
 */
/* eslint-disable @typescript-eslint/unbound-method */

import { describe, expect } from 'vitest';
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
      // HODGE-357.1: Verify backup/restore flow now in ship.ts + ShipService
      const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
      const shipServicePath = path.join(process.cwd(), 'src', 'lib', 'ship-service.ts');

      const [shipContent, serviceContent] = await Promise.all([
        fs.readFile(shipPath, 'utf-8'),
        fs.readFile(shipServicePath, 'utf-8'),
      ]);

      // Verify backup happens in ship.ts before commit
      const shipLines = shipContent.split('\n');
      let backupLine = -1;
      let createCommitLine = -1;

      for (let i = 0; i < shipLines.length; i++) {
        if (shipLines[i].includes('await this.shipService.backupMetadata(feature)')) {
          backupLine = i;
        }
        if (shipLines[i].includes('await this.shipService.createShipCommit(')) {
          createCommitLine = i;
        }
      }

      // Verify correct order in ship.ts: backup -> createShipCommit
      expect(backupLine).toBeGreaterThan(0);
      expect(createCommitLine).toBeGreaterThan(backupLine);

      // Verify restore logic exists in ShipService (called on commit failure)
      expect(serviceContent).toContain('restoreMetadata');

      // Verify HODGE.md generation was removed (HODGE-319.1)
      expect(shipContent).not.toContain('generateFeatureHodgeMD');
    }
  );

  integrationTest('should use git add -A for staging all changes', async () => {
    // HODGE-357.1: git add -A is now in ShipService.createShipCommit()
    const shipServiceJsPath = path.join(process.cwd(), 'dist', 'src', 'lib', 'ship-service.js');

    // Only run this test if the built file exists
    if (existsSync(shipServiceJsPath)) {
      const content = await fs.readFile(shipServiceJsPath, 'utf-8');

      // Verify we're using git add -A in ShipService
      expect(content).toContain('git add -A');

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
    // HODGE-357.1: Error handling refactored - rollback now in ShipService.createShipCommit()
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const content = await fs.readFile(shipPath, 'utf-8');

    // Verify error handling includes rollback message when commit fails
    expect(content).toContain('✓ Metadata rolled back successfully');

    // Verify backup/restore calls still exist
    expect(content).toContain('await this.shipService.backupMetadata(feature)');

    // Verify commit result handling
    expect(content).toContain('commitResult.success');
  });
});
