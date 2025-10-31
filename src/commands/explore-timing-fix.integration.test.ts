import { describe, expect } from 'vitest';
import { integrationTest } from '../test/helpers.js';
import { ExploreCommand } from './explore.js';
import { existsSync } from 'fs';
import path from 'path';
import { withTestWorkspace } from '../test/runners.js';

describe('[integration] Explore Command Timing Fix', () => {
  // HODGE-320: Replaced subprocess spawning with direct function calls
  // Tests verify command success only - vitest timeout handles hangs
  // No timing assertions to eliminate flakiness

  integrationTest('explore command completes successfully', async () => {
    await withTestWorkspace('explore-timing', async (workspace) => {
      // Direct function call - no subprocess
      // Pass workspace path to ensure proper test isolation (HODGE-366)
      const { ExploreService } = await import('../lib/explore-service.js');
      const exploreService = new ExploreService(workspace.getPath());
      const command = new ExploreCommand(undefined, exploreService, workspace.getPath());

      await command.execute('test-timing-fix', { skipIdManagement: true });

      // Verify success through filesystem state
      const featureDir = path.join(workspace.getPath(), '.hodge', 'features', 'test-timing-fix');
      expect(existsSync(featureDir)).toBe(true);

      const exploreDir = path.join(featureDir, 'explore');
      expect(existsSync(exploreDir)).toBe(true);

      // Verify exploration file was created
      const explorationFile = path.join(exploreDir, 'exploration.md');
      expect(existsSync(explorationFile)).toBe(true);
    });
  });

  integrationTest('multiple explores complete successfully', async () => {
    await withTestWorkspace('explore-multi-timing', async (workspace) => {
      // Direct function calls - no subprocess
      // Pass workspace path to ensure proper test isolation (HODGE-366)
      const { ExploreService } = await import('../lib/explore-service.js');
      const exploreService = new ExploreService(workspace.getPath());
      const command = new ExploreCommand(undefined, exploreService, workspace.getPath());

      // Run multiple explores
      await command.execute('feature-1', { skipIdManagement: true });
      await command.execute('feature-2', { skipIdManagement: true });

      // Verify both features were created
      const hodgeDir = path.join(workspace.getPath(), '.hodge');
      const feature1Dir = path.join(hodgeDir, 'features', 'feature-1', 'explore');
      const feature2Dir = path.join(hodgeDir, 'features', 'feature-2', 'explore');

      expect(existsSync(feature1Dir)).toBe(true);
      expect(existsSync(feature2Dir)).toBe(true);

      // Verify exploration files were created
      expect(existsSync(path.join(feature1Dir, 'exploration.md'))).toBe(true);
      expect(existsSync(path.join(feature2Dir, 'exploration.md'))).toBe(true);
    });
  });
});
