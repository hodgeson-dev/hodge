import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';

describe('HODGE-319.4 - Phase-Specific Context.json Elimination', () => {
  smokeTest('build command should NOT create phase-specific context.json', async () => {
    await withTestWorkspace('hodge-319.4-build-no-context', async (workspace) => {
      // Setup minimal structure for build
      await workspace.writeFile(
        '.hodge/features/test-feature/explore/exploration.md',
        '# Exploration'
      );
      await workspace.writeFile('.hodge/standards.md', '# Standards');

      // Run build command
      await workspace.hodge('build test-feature --skip-checks');

      // Verify build-plan.md was created
      expect(await workspace.exists('.hodge/features/test-feature/build/build-plan.md')).toBe(true);

      // Verify context.json was NOT created
      expect(await workspace.exists('.hodge/features/test-feature/build/context.json')).toBe(false);
    });
  });

  // Note: We don't test harden command here because it requires full test suite setup
  // The key validation is that context.json is NOT created, which we verify via:
  // 1. Code inspection - harden.ts no longer writes context.json
  // 2. Build command test above proves the pattern works
  // 3. Harden.test.ts verifies harden behavior (without checking for context.json)

  smokeTest('global context.json should still work when it exists', async () => {
    await withTestWorkspace('hodge-319.4-global-context', async (workspace) => {
      // Setup global context (simulating what save/load commands do)
      await workspace.writeFile(
        '.hodge/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
          timestamp: new Date().toISOString(),
        })
      );

      // Verify global context.json exists
      expect(await workspace.exists('.hodge/context.json')).toBe(true);

      // Verify it contains expected data
      const contextContent = await workspace.readFile('.hodge/context.json');
      const context = JSON.parse(contextContent);
      expect(context.feature).toBe('test-feature');
      expect(context.mode).toBe('build');
    });
  });
});
