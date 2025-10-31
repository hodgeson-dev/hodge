/**
 * HODGE-319.1: Smoke tests for Phase 1 Quick Wins
 *
 * Tests verify:
 * 1. Fixed /build decision file path bug (build.ts:81)
 * 2. Eliminated HODGE.md generation from all commands
 * 3. Eliminated phase-specific context.json creation
 */

import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('HODGE-319.1 - Phase 1 Quick Wins', () => {
  smokeTest('should fix /build decision file path (bug fix)', async () => {
    // Verify build.ts uses correct decision file path
    const buildPath = path.join(process.cwd(), 'src', 'commands', 'build.ts');
    const content = await fs.readFile(buildPath, 'utf-8');

    // Should use correct path: '.hodge/features/${feature}/decisions.md'
    // Path can be constructed directly or via featureDir variable
    expect(content).toMatch(/path\.join\([^)]*'decisions\.md'\)/);
    expect(content).toContain("'.hodge', 'features', feature, 'decisions.md'");

    // Should NOT check exploreDir/decision.md (old incorrect path)
    expect(content).not.toContain("path.join(exploreDir, 'decision.md')");
  });

  smokeTest('should eliminate HODGE.md generation from explore command', async () => {
    // Verify explore.ts does not generate HODGE.md
    const explorePath = path.join(process.cwd(), 'src', 'commands', 'explore.ts');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Should NOT call generateFeatureHodgeMD
    expect(content).not.toContain('generateFeatureHodgeMD');

    // FeaturePopulator may still be used for other methods (populateFromDecisions)
    // but not for HODGE.md generation
  });

  smokeTest('should eliminate HODGE.md generation from build command', async () => {
    // Verify build.ts does not generate HODGE.md
    const buildPath = path.join(process.cwd(), 'src', 'commands', 'build.ts');
    const content = await fs.readFile(buildPath, 'utf-8');

    // Should NOT call generateFeatureHodgeMD
    expect(content).not.toContain('generateFeatureHodgeMD');

    // Should NOT import FeaturePopulator at all (unused)
    expect(content).not.toContain('FeaturePopulator');
  });

  smokeTest('should eliminate HODGE.md generation from harden command', async () => {
    // Verify harden.ts does not generate HODGE.md
    const hardenPath = path.join(process.cwd(), 'src', 'commands', 'harden.ts');
    const content = await fs.readFile(hardenPath, 'utf-8');

    // Should NOT call generateFeatureHodgeMD
    expect(content).not.toContain('generateFeatureHodgeMD');

    // Should NOT import FeaturePopulator at all (unused)
    expect(content).not.toContain('FeaturePopulator');
  });

  smokeTest('should eliminate HODGE.md generation from ship command', async () => {
    // Verify ship.ts does not generate HODGE.md
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const content = await fs.readFile(shipPath, 'utf-8');

    // Should NOT call generateFeatureHodgeMD
    expect(content).not.toContain('generateFeatureHodgeMD');
    expect(content).not.toContain('populator.generateFeatureHodgeMD');
  });

  smokeTest('should eliminate HODGE.md backup/restore from ship command', async () => {
    // HODGE-357.1: Verify backup/restore logic in both ship.ts and ShipService
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const shipServicePath = path.join(process.cwd(), 'src', 'lib', 'ship-service.ts');

    const [shipContent, serviceContent] = await Promise.all([
      fs.readFile(shipPath, 'utf-8'),
      fs.readFile(shipServicePath, 'utf-8'),
    ]);

    // Should NOT backup featureHodgeMd (in either file)
    expect(shipContent).not.toContain('backup.featureHodgeMd');
    expect(shipContent).not.toContain('featureHodgePath');
    expect(serviceContent).not.toContain('backup.featureHodgeMd');
    expect(serviceContent).not.toContain('featureHodgePath');

    // Should still backup other metadata (project_management.md)
    // ship.ts calls the service, service implements the logic
    expect(shipContent).toContain('shipService.backupMetadata');
    expect(serviceContent).toContain('backupMetadata');
    expect(serviceContent).toContain('restoreMetadata');
  });

  smokeTest('should eliminate phase-specific context.json from explore command', async () => {
    // Verify explore.ts does not create context.json
    const explorePath = path.join(process.cwd(), 'src', 'commands', 'explore.ts');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Should NOT write context.json in explore directory
    const lines = content.split('\n');
    let hasContextJsonWrite = false;
    let inExploreWrite = false;

    for (const line of lines) {
      // Check if we're in the file write section for explore
      if (line.includes('fs.writeFile') && line.includes('explore')) {
        inExploreWrite = true;
      }

      // Check for context.json in explore writes
      if (inExploreWrite && line.includes('context.json')) {
        hasContextJsonWrite = true;
        break;
      }

      // Exit the write section
      if (inExploreWrite && line.includes('];')) {
        inExploreWrite = false;
      }
    }

    expect(hasContextJsonWrite).toBe(false);
  });

  smokeTest('should verify HODGE-319.1 scope is complete', async () => {
    // Verify all changes from plan.json are implemented
    const buildPath = path.join(process.cwd(), 'src', 'commands', 'build.ts');
    const explorePath = path.join(process.cwd(), 'src', 'commands', 'explore.ts');
    const hardenPath = path.join(process.cwd(), 'src', 'commands', 'harden.ts');
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');

    const [buildContent, exploreContent, hardenContent, shipContent] = await Promise.all([
      fs.readFile(buildPath, 'utf-8'),
      fs.readFile(explorePath, 'utf-8'),
      fs.readFile(hardenPath, 'utf-8'),
      fs.readFile(shipPath, 'utf-8'),
    ]);

    // Scope item 1: Fix build.ts:81 path check ✅
    expect(buildContent).toContain("'.hodge', 'features', feature, 'decisions.md'");

    // Scope item 2: Remove HODGE.md creation from all commands ✅
    expect(exploreContent).not.toContain('generateFeatureHodgeMD');
    expect(buildContent).not.toContain('generateFeatureHodgeMD');
    expect(hardenContent).not.toContain('generateFeatureHodgeMD');
    expect(shipContent).not.toContain('generateFeatureHodgeMD');

    // Scope item 3: Remove phase-specific context.json creation ✅
    expect(exploreContent).not.toMatch(/fs\.writeFile\([^)]*explore[^)]*context\.json/);
  });
});
