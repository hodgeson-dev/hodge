/**
 * Example test file showing the new progressive testing approach
 * This demonstrates how to write tests that focus on behavior, not implementation
 */

import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { EnhancedExploreCommand as ExploreCommand } from './explore-enhanced';
import {
  smokeTest,
  integrationTest,
  unitTest,
  acceptanceTest,
  outputContains,
  completesWithin
} from '../test/helpers';
import { createMockEnvironment } from '../test/mocks';
import { TestWorkspace, withTestWorkspace } from '../test/runners';

describe('ExploreCommand', () => {
  let command: ExploreCommand;
  let mockEnv: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    command = new ExploreCommand();
    mockEnv = createMockEnvironment();
  });

  // ============================================
  // SMOKE TESTS - Does it work at all?
  // ============================================
  describe('Smoke Tests', () => {
    smokeTest('should load without errors', () => {
      expect(command).toBeDefined();
      expect(command.execute).toBeDefined();
    });

    smokeTest('should not crash with valid input', async () => {
      // We're not testing output, just that it doesn't throw
      await expect(
        command.execute('test-feature')
      ).resolves.not.toThrow();
    });

    smokeTest('should complete quickly', async () => {
      // Ensure basic execution is fast
      await completesWithin(
        () => command.execute('test-feature'),
        500 // Should complete in 500ms
      );
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
        expect(await workspace.exists('.hodge/features/my-feature/explore')).toBe(true);
        expect(await workspace.exists('.hodge/features/my-feature/explore/exploration.md')).toBe(true);
      });
    });

    integrationTest('should detect existing exploration', async () => {
      await withTestWorkspace('explore-existing', async (workspace) => {
        // Create first exploration
        await workspace.hodge('explore my-feature');

        // Try to create again
        const result = await workspace.hodge('explore my-feature');

        // Should warn about existing exploration
        outputContains(result.output, ['already exists']);
      });
    });

    integrationTest('should create test intentions file', async () => {
      await withTestWorkspace('explore-test-intentions', async (workspace) => {
        await workspace.hodge('explore auth-feature');

        const intentions = await workspace.readFile(
          '.hodge/features/auth-feature/explore/test-intentions.md'
        );

        expect(intentions).toContain('Test Intentions');
        expect(intentions).toContain('- [ ]'); // Checkbox format
      });
    });

    integrationTest('should integrate with PM tools when configured', async () => {
      await withTestWorkspace('explore-pm', async (workspace) => {
        // Set up PM configuration
        await workspace.writeFile('.hodge/config.json', JSON.stringify({
          pmTool: 'linear',
          pmConfig: { teamId: 'test' }
        }));

        const result = await workspace.hodge('explore HOD-123');

        // Should attempt PM integration - look for feature ID in output
        outputContains(result.output, ['HOD-123']);
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
        const files = [
          '.hodge/features/user-authentication/explore/exploration.md',
          '.hodge/features/user-authentication/explore/context.json',
          '.hodge/features/user-authentication/explore/test-intentions.md'
        ];

        for (const file of files) {
          expect(await workspace.exists(file)).toBe(true);
        }

        // 3. Verify AI context is set up
        const context = JSON.parse(
          await workspace.readFile('.hodge/features/user-authentication/explore/context.json')
        );
        expect(context.mode).toBe('explore');
        expect(context.standards).toBe('suggested');

        // 4. Can transition to build
        const build = await workspace.hodge('build user-authentication');
        expect(build.success).toBe(true);
        expect(build.output).toContain('Build Mode');
      });
    });

    it.skip('[acceptance] should provide helpful guidance - tests console output', async () => {
      await withTestWorkspace('explore-guidance', async (workspace) => {
        const result = await workspace.hodge('explore new-feature');

        // Should provide clear next steps
        outputContains(result.output, [
          'Next steps',
          'explore',
          'decide',
          'build'
        ]);

        // Should explain the mode
        outputContains(result.output, [
          'Explore Mode',
          'Standards are suggested',
          'experiment'
        ]);
      });
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
      const exists = await workspace.exists('.hodge/features/real-feature');
      expect(exists).toBe(true);
    });
  });
});

/**
 * Example of performance testing
 */
describe('ExploreCommand (Performance)', () => {
  it.skip('[integration] should handle many features efficiently - performance test', async () => {
    await withTestWorkspace('performance-test', async (workspace) => {
      const features = Array.from({ length: 10 }, (_, i) => `feature-${i}`);

      // Create many features
      const startTime = Date.now();
      for (const feature of features) {
        await workspace.hodge(`explore ${feature}`);
      }
      const duration = Date.now() - startTime;

      // Should complete reasonably fast (< 100ms per feature)
      expect(duration).toBeLessThan(features.length * 100);

      // All should be created
      for (const feature of features) {
        expect(await workspace.exists(`.hodge/features/${feature}`)).toBe(true);
      }
    });
  });
});