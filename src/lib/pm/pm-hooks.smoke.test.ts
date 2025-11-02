/**
 * Smoke tests for PM hooks integration
 */

import { describe, expect } from 'vitest';
import { PMHooks } from './pm-hooks.js';
import { smokeTest } from '../../test/helpers.js';
import { withTestWorkspace } from '../../test/runners.js';
import path from 'path';
import { promises as fs } from 'fs';

describe('PM Hooks Smoke Tests', () => {
  smokeTest('should create PMHooks instance without crashing', async () => {
    await withTestWorkspace('pm-hooks-instance', async (workspace) => {
      expect(() => {
        // eslint-disable-next-line sonarjs/constructor-for-side-effects -- Testing constructor doesn't throw
        new PMHooks(workspace.getPath());
      }).not.toThrow();
    });
  });

  smokeTest('should initialize without configuration', async () => {
    await withTestWorkspace('pm-hooks-init', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await expect(hooks.init()).resolves.not.toThrow();
    });
  });

  smokeTest('should handle explore hook', async () => {
    await withTestWorkspace('pm-hooks-explore', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await hooks.init();
      await expect(hooks.onExplore('TEST-001')).resolves.not.toThrow();
    });
  });

  smokeTest('should handle build hook', async () => {
    await withTestWorkspace('pm-hooks-build', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await hooks.init();
      await expect(hooks.onBuild('TEST-001')).resolves.not.toThrow();
    });
  });

  smokeTest('should handle harden hook', async () => {
    await withTestWorkspace('pm-hooks-harden', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await hooks.init();
      await expect(hooks.onHarden('TEST-001')).resolves.not.toThrow();
    });
  });

  smokeTest('should handle ship hook with string', async () => {
    await withTestWorkspace('pm-hooks-ship', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await hooks.init();
      await expect(hooks.onShip('TEST-001')).resolves.not.toThrow();
    });
  });

  smokeTest('should handle ship hook with context', async () => {
    await withTestWorkspace('pm-hooks-ship-context', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await hooks.init();

      const context = {
        feature: 'TEST-001',
        commitHash: 'abc123',
        commitMessage: 'feat: test feature',
        filesChanged: 5,
        linesAdded: 100,
        linesRemoved: 20,
        testsResults: { passed: 10, total: 10 },
        patterns: ['error-boundary', 'input-validation'],
        coverage: 85,
      };

      await expect(hooks.onShip(context)).resolves.not.toThrow();
    });
  });

  smokeTest('should load configuration from hodge.json', async () => {
    await withTestWorkspace('pm-hooks-config', async (workspace) => {
      // Create config file
      const configPath = path.join(workspace.getPath(), '.hodge', 'config.json');
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(
        configPath,
        JSON.stringify({
          pm: {
            tool: 'github',
            verbosity: 'rich',
            statusMap: {
              explore: 'Backlog',
              build: 'In Development',
              harden: 'Testing',
              ship: 'Complete',
            },
          },
        })
      );

      const hooks = new PMHooks(workspace.getPath());
      await expect(hooks.init()).resolves.not.toThrow();
    });
  });

  smokeTest('should handle missing PM tool gracefully', async () => {
    await withTestWorkspace('pm-hooks-no-tool', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await hooks.init();

      // Should work without external PM tool configured
      await expect(hooks.onExplore('TEST-002')).resolves.not.toThrow();
      await expect(hooks.onBuild('TEST-002')).resolves.not.toThrow();
      await expect(hooks.onHarden('TEST-002')).resolves.not.toThrow();
      await expect(hooks.onShip('TEST-002')).resolves.not.toThrow();
    });
  });

  smokeTest('should update local PM tracking', async () => {
    await withTestWorkspace('pm-hooks-local', async (workspace) => {
      const hooks = new PMHooks(workspace.getPath());
      await hooks.init();

      // Run through workflow
      await hooks.onExplore('TEST-003', 'Test feature description');
      await hooks.onBuild('TEST-003');
      await hooks.onHarden('TEST-003');
      await hooks.onShip('TEST-003');

      // Check that project_management.md was created
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const exists = await fs
        .access(pmPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });
  });
});
