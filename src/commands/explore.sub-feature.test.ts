/**
 * Tests for exploring sub-features (e.g., HODGE-333.2)
 * This verifies that we can explore new HODGE-prefixed features even when they don't exist yet
 */

import { describe, expect } from 'vitest';
import { smokeTest, integrationTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';
import { ExploreCommand } from './explore.js';
import { IDManager } from '../lib/id-manager.js';
import { ExploreService } from '../lib/explore-service.js';

describe('ExploreCommand - Sub-Feature Support', () => {
  // ============================================
  // SMOKE TESTS
  // ============================================
  describe('Smoke Tests', () => {
    smokeTest('should not crash when exploring new HODGE-prefixed feature', async () => {
      await withTestWorkspace('sub-feature-smoke', async (workspace) => {
        const exploreService = new ExploreService(workspace.getPath());
        const command = new ExploreCommand(undefined, exploreService, workspace.getPath());

        // Should not throw when exploring HODGE-333.2 (doesn't exist yet)
        await expect(command.execute('HODGE-333.2')).resolves.not.toThrow();
      });
    });

    smokeTest('should create directory for new HODGE-prefixed feature', async () => {
      await withTestWorkspace('sub-feature-dir', async (workspace) => {
        const exploreService = new ExploreService(workspace.getPath());
        const command = new ExploreCommand(undefined, exploreService, workspace.getPath());

        await command.execute('HODGE-333.2');

        // Verify directory was created
        expect(await workspace.exists('.hodge/features/HODGE-333.2/explore')).toBe(true);
      });
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================
  describe('Integration Tests', () => {
    integrationTest('should create sub-feature exploration structure', async () => {
      await withTestWorkspace('sub-feature-structure', async (workspace) => {
        const exploreService = new ExploreService(workspace.getPath());
        const command = new ExploreCommand(undefined, exploreService, workspace.getPath());

        // Create parent feature first
        await command.execute('parent-feature');

        // Now create a sub-feature with explicit HODGE ID
        await command.execute('HODGE-333.2');

        // Verify sub-feature structure
        expect(await workspace.exists('.hodge/features/HODGE-333.2/explore')).toBe(true);
        expect(await workspace.exists('.hodge/features/HODGE-333.2/explore/exploration.md')).toBe(
          true
        );
        expect(
          await workspace.exists('.hodge/features/HODGE-333.2/explore/test-intentions.md')
        ).toBe(true);
      });
    });

    integrationTest('should register new HODGE-prefixed feature in ID mappings', async () => {
      await withTestWorkspace('sub-feature-id-mapping', async (workspace) => {
        const idManager = new IDManager(workspace.getPath() + '/.hodge');
        const exploreService = new ExploreService(workspace.getPath());
        const command = new ExploreCommand(idManager, exploreService, workspace.getPath());

        // Explore a new HODGE-prefixed feature
        await command.execute('HODGE-333.2');

        // Verify it was registered in ID mappings
        const featureID = await idManager.resolveID('HODGE-333.2');
        expect(featureID).toBeDefined();
        expect(featureID?.localID).toBe('HODGE-333.2');
      });
    });

    integrationTest('should handle numeric sub-feature notation', async () => {
      await withTestWorkspace('numeric-sub-feature', async (workspace) => {
        const exploreService = new ExploreService(workspace.getPath());
        const command = new ExploreCommand(undefined, exploreService, workspace.getPath());

        // Create features with numeric sub-feature notation
        await command.execute('HODGE-333.1');
        await command.execute('HODGE-333.2');
        await command.execute('HODGE-333.3');

        // Verify all were created
        expect(await workspace.exists('.hodge/features/HODGE-333.1/explore')).toBe(true);
        expect(await workspace.exists('.hodge/features/HODGE-333.2/explore')).toBe(true);
        expect(await workspace.exists('.hodge/features/HODGE-333.3/explore')).toBe(true);
      });
    });

    integrationTest(
      'should preserve exploration templates for HODGE-prefixed features',
      async () => {
        await withTestWorkspace('sub-feature-template', async (workspace) => {
          const exploreService = new ExploreService(workspace.getPath());
          const command = new ExploreCommand(undefined, exploreService, workspace.getPath());

          await command.execute('HODGE-555.5');

          // Verify exploration template was created
          const exploration = await workspace.readFile(
            '.hodge/features/HODGE-555.5/explore/exploration.md'
          );

          expect(exploration).toContain('# Exploration: HODGE-555.5');
          expect(exploration).toContain('## Context');
          expect(exploration).toContain('## Implementation Approaches');
        });
      }
    );
  });
});
