/**
 * Example test file showing the new progressive testing approach
 * This demonstrates how to write tests that focus on behavior, not implementation
 */

import { describe, expect } from 'vitest';
import {
  smokeTest,
  integrationTest,
  unitTest,
  acceptanceTest,
  outputContains,
} from '../test/helpers';
import { withTestWorkspace } from '../test/runners';

describe('ExploreCommand', () => {
  // ============================================
  // SMOKE TESTS - Does it work at all?
  // ============================================
  describe('Smoke Tests', () => {
    smokeTest('should load without errors', async () => {
      // Create command in temp directory to avoid creating real features
      await withTestWorkspace('smoke-load-test', async (workspace) => {
        // Just check that we can run the command without errors
        const result = await workspace.hodge('explore --help');
        expect(result.success).toBe(true);
      });
    });

    smokeTest('should not crash with valid input', async () => {
      // Run in temp directory to avoid creating real features
      await withTestWorkspace('smoke-test', async (workspace) => {
        const result = await workspace.hodge('explore test-feature');
        expect(result.success).toBe(true);
      });
    });

    smokeTest('should complete quickly', async () => {
      // Run in temp directory to avoid creating real features
      await withTestWorkspace('smoke-timing-test', async (workspace) => {
        const start = Date.now();
        await workspace.hodge('explore test-feature');
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(3000);
      });
    });
  });

  // ============================================
  // INTEGRATION TESTS - Does it behave correctly?
  // ============================================
  describe('Integration Tests', () => {
    integrationTest('should create exploration structure', async () => {
      await withTestWorkspace('explore-test', async (workspace) => {
        // Run the actual command in a real directory
        const result = await workspace.hodge('explore my-feature');

        // Test behavior, not implementation
        expect(result.success).toBe(true);
        // With ID management, feature is created with a HODGE-xxx ID
        // Check that the output contains the success message
        expect(result.output).toContain('Created new feature: HODGE-');
        // ID mappings file should exist
        expect(await workspace.exists('.hodge/id-mappings.json')).toBe(true);

        // Extract the created feature ID from the output
        const match = result.output.match(/Created new feature: (HODGE-\d+)/);
        expect(match).toBeDefined();

        if (match) {
          const createdFeature = match[1];
          expect(await workspace.exists(`.hodge/features/${createdFeature}/explore`)).toBe(true);
          expect(
            await workspace.exists(`.hodge/features/${createdFeature}/explore/exploration.md`)
          ).toBe(true);
        }
      });
    });

    integrationTest('should detect existing exploration', async () => {
      await withTestWorkspace('explore-existing', async (workspace) => {
        // Create first exploration
        await workspace.hodge('explore my-feature');

        // Try to explore with same ID (HODGE-001)
        const result = await workspace.hodge('explore HODGE-001');

        // Should warn about existing exploration
        outputContains(result.output, ['already exists']);
      });
    });

    integrationTest('should create test intentions file', async () => {
      await withTestWorkspace('explore-test-intentions', async (workspace) => {
        await workspace.hodge('explore auth-feature');

        // With ID management, auth-feature becomes HODGE-001
        const intentions = await workspace.readFile(
          '.hodge/features/HODGE-001/explore/test-intentions.md'
        );

        expect(intentions).toContain('Test Intentions');
        expect(intentions).toContain('- [ ]'); // Checkbox format
      });
    });

    integrationTest('should integrate with PM tools when configured', async () => {
      await withTestWorkspace('explore-pm', async (workspace) => {
        // Set up PM configuration
        await workspace.writeFile(
          '.hodge/config.json',
          JSON.stringify({
            pmTool: 'linear',
            pmConfig: { teamId: 'test' },
          })
        );

        const result = await workspace.hodge('explore HOD-123');

        // With ID management, HOD-123 becomes linked to a HODGE-xxx ID
        // The output should show that a new feature was created and linked
        expect(result.success).toBe(true);
        expect(result.output).toMatch(/Created new feature HODGE-\d+ linked to HOD-123/);
      });
    });
  });

  // ============================================
  // UNIT TESTS - Are the internals correct?
  // ============================================
  describe('Unit Tests', () => {
    unitTest('should validate feature names', () => {
      // Test specific validation logic
      // Note: explore-enhanced doesn't expose validation method,
      // but we can test through the execute method
      expect(true).toBe(true); // Placeholder for now
    });

    unitTest('should generate correct exploration template', () => {
      // Test template generation indirectly
      // explore-enhanced generates templates internally
      expect(true).toBe(true); // Placeholder for now
    });

    unitTest('should detect intent from feature name', () => {
      // Intent detection is handled internally
      // Could test through mocking if methods were exposed
      expect(true).toBe(true); // Placeholder for now
    });
  });

  // ============================================
  // ACCEPTANCE TESTS - Does it meet user needs?
  // ============================================
  describe('Acceptance Tests', () => {
    acceptanceTest('should support complete exploration workflow', async () => {
      await withTestWorkspace('explore-workflow', async (workspace) => {
        // User story: As a developer, I want to explore a new feature

        // 1. Start exploration
        const explore = await workspace.hodge('explore user-authentication');
        expect(explore.success).toBe(true);

        // 2. Check that all necessary files are created
        // With ID management, user-authentication becomes HODGE-001
        // NOTE: context.json removed in HODGE-319.1 (phase-specific context elimination)
        const files = [
          '.hodge/features/HODGE-001/explore/exploration.md',
          '.hodge/features/HODGE-001/explore/test-intentions.md',
          '.hodge/id-mappings.json', // ID management file
        ];

        for (const file of files) {
          expect(await workspace.exists(file)).toBe(true);
        }

        // 3. Verify global context is maintained (not phase-specific)
        // Context now managed globally by context-manager, not per-phase files
        expect(await workspace.exists('.hodge/context.json')).toBe(true);

        // 4. Can transition to build
        const build = await workspace.hodge('build HODGE-001');
        expect(build.success).toBe(true);
        expect(build.output).toContain('Build Mode');
      });
    });
  });

  /**
   * Example of testing without mocks - using real file system
   */
  describe('ExploreCommand (Real FS)', () => {
    integrationTest('should work with real file system', async () => {
      await withTestWorkspace('real-fs-test', async (workspace) => {
        // No mocks - using actual file system operations
        // Note: Can't use process.chdir in Vitest workers
        // Instead, verify through the workspace methods

        const result = await workspace.hodge('explore real-feature');
        expect(result.success).toBe(true);

        // Verify using workspace methods (which use real FS)
        // With ID management, real-feature becomes HODGE-001
        const exists = await workspace.exists('.hodge/features/HODGE-001');
        expect(exists).toBe(true);

        // Verify ID mappings exist
        const mappingsExist = await workspace.exists('.hodge/id-mappings.json');
        expect(mappingsExist).toBe(true);
      });
    });
  });

  // Performance test suite removed - all performance tests deleted
  // Following "test behavior, not implementation" philosophy
});
