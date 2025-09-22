import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';

describe('Ship Command - Smoke Tests', () => {
  smokeTest('should not crash when executed without state', async () => {
    await withTestWorkspace('ship-no-state', async (workspace) => {
      // Setup minimal .hodge structure
      await workspace.writeFile(
        '.hodge/features/test-feature/build/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
        })
      );

      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Run ship command - should not crash even without pre-approved message
      await workspace.hodge('ship test-feature --yes --skip-tests');
    });
  });

  smokeTest('should detect and use pre-approved message from state', async () => {
    await withTestWorkspace('ship-with-state', async (workspace) => {
      // Setup .hodge structure with pre-approved message
      await workspace.writeFile(
        '.hodge/features/test-feature/build/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
        })
      );

      // Create pre-approved state file
      const state = {
        command: 'ship',
        feature: 'test-feature',
        status: 'edited',
        timestamp: new Date().toISOString(),
        environment: 'Claude Code',
        data: {
          edited: 'fix: streamline ship workflow\n\nPre-approved message from slash command',
          suggested: 'ship: test-feature',
        },
        history: [
          {
            timestamp: new Date().toISOString(),
            type: 'edit',
            data: 'User approved via slash command',
          },
        ],
      };

      await workspace.writeFile(
        '.hodge/temp/ship-interaction/test-feature/state.json',
        JSON.stringify(state, null, 2)
      );

      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Command should use the pre-approved message
      await workspace.hodge('ship test-feature --yes --skip-tests');
    });
  });

  smokeTest('should be completely non-interactive', async () => {
    await withTestWorkspace('ship-non-interactive', async (workspace) => {
      await workspace.writeFile(
        '.hodge/features/test-feature/build/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
        })
      );

      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Even without state, should not prompt for input
      await workspace.hodge('ship test-feature --yes --skip-tests');
    });
  });

  smokeTest('should handle corrupted state files gracefully', async () => {
    await withTestWorkspace('ship-corrupted-state', async (workspace) => {
      await workspace.writeFile(
        '.hodge/features/test-feature/build/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
        })
      );

      // Create corrupted state file
      await workspace.writeFile(
        '.hodge/temp/ship-interaction/test-feature/state.json',
        'not valid json { corrupted'
      );

      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Should not crash with corrupted state
      await workspace.hodge('ship test-feature --yes --skip-tests');
    });
  });

  smokeTest('should be non-interactive by default (no prompts allowed)', async () => {
    await withTestWorkspace('ship-no-prompts', async (workspace) => {
      await workspace.writeFile(
        '.hodge/features/test-feature/ship/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'ship',
        })
      );

      // Initialize git repo with main branch
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');
      await workspace.writeFile('test2.txt', 'test2');
      await workspace.run('git add .');
      await workspace.run('git commit -m "feature"');

      // Ship should complete without any prompts (since all hodge commands are non-interactive)
      await workspace.hodge('ship test-feature --yes --skip-tests');
    });
  });
});
