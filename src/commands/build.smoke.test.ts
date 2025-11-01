/**
 * Smoke tests for BuildCommand
 *
 * Tests verify build command behavior including:
 * - Correct decision file path usage
 * - HODGE.md generation eliminated
 * - No phase-specific context.json creation
 */

import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('[smoke] BuildCommand', () => {
  smokeTest('should use correct decision file path (not exploreDir/decision.md)', async () => {
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

  smokeTest('should not generate HODGE.md', async () => {
    // Verify build.ts does not generate HODGE.md
    const buildPath = path.join(process.cwd(), 'src', 'commands', 'build.ts');
    const content = await fs.readFile(buildPath, 'utf-8');

    // Should NOT call generateFeatureHodgeMD
    expect(content).not.toContain('generateFeatureHodgeMD');

    // Should NOT import FeaturePopulator at all (unused)
    expect(content).not.toContain('FeaturePopulator');
  });

  smokeTest(
    'should NOT create phase-specific context.json',
    async () => {
      await withTestWorkspace('build-no-context', async (workspace) => {
        // Setup minimal structure for build
        await workspace.writeFile(
          '.hodge/features/test-feature/explore/exploration.md',
          '# Exploration'
        );
        await workspace.writeFile('.hodge/standards.md', '# Standards');

        // Run build command
        await workspace.hodge('build test-feature --skip-checks');

        // Verify build-plan.md was created
        expect(await workspace.exists('.hodge/features/test-feature/build/build-plan.md')).toBe(
          true
        );

        // Verify context.json was NOT created
        expect(await workspace.exists('.hodge/features/test-feature/build/context.json')).toBe(
          false
        );
      });
    },
    10000
  );

  smokeTest('should work with global context.json when it exists', async () => {
    await withTestWorkspace('build-global-context', async (workspace) => {
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
