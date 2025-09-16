/**
 * Example test file showing the new progressive testing approach
 * This demonstrates how to write tests that focus on behavior, not implementation
 */

import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { ExploreCommand } from './explore';
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

        // Should attempt PM integration
        outputContains(result.output, ['PM', 'issue']);
      });
    });
  });

  // ============================================
  // UNIT TESTS - Are the internals correct?
  // ============================================
  describe('Unit Tests', () => {
    unitTest('should validate feature names', () => {
      // Test specific validation logic
      expect(() => command.validateFeatureName('')).toThrow();
      expect(() => command.validateFeatureName('valid-name')).not.toThrow();
      expect(() => command.validateFeatureName('has spaces')).toThrow();
    });

    unitTest('should generate correct exploration template', () => {
      const template = command.generateExplorationTemplate('auth-jwt');

      expect(template).toContain('# auth-jwt Exploration');
      expect(template).toContain('## Approaches');
      expect(template).toContain('## Decision Criteria');
      expect(template).toContain('## Next Steps');
    });

    unitTest('should detect intent from feature name', () => {
      expect(command.detectIntent('fix-bug-123')).toBe('bugfix');
      expect(command.detectIntent('add-auth')).toBe('feature');
      expect(command.detectIntent('refactor-database')).toBe('refactor');
      expect(command.detectIntent('update-deps')).toBe('maintenance');
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
        expect(build.output).toContain('requires exploration first');
      });
    });

    acceptanceTest('should provide helpful guidance', async () => {
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
          'Exploration Mode',
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
      const command = new ExploreCommand();

      // Change to workspace directory
      const originalCwd = process.cwd();
      process.chdir(workspace.getPath());

      try {
        // Run command with real FS
        await command.execute('real-feature');

        // Verify using real FS
        const fs = await import('fs');
        expect(fs.existsSync('.hodge/features/real-feature')).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

/**
 * Example of performance testing
 */
describe('ExploreCommand (Performance)', () => {
  integrationTest('should handle many features efficiently', async () => {
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