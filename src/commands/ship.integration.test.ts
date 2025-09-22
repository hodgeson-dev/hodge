import { describe, expect } from 'vitest';
import { integrationTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';

describe('Ship Command - Integration Tests', () => {
  integrationTest('should complete full ship workflow with pre-approved message', async () => {
    await withTestWorkspace('ship-integration-full', async (workspace) => {
      // Setup complete .hodge structure
      await workspace.writeFile('.hodge/standards.md', '# Standards');
      await workspace.writeFile(
        '.hodge/features/test-feature/build/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
        })
      );

      // Create pre-approved state file (simulating slash command)
      const state = {
        command: 'ship',
        feature: 'test-feature',
        status: 'edited',
        timestamp: new Date().toISOString(),
        environment: 'Claude Code',
        data: {
          edited:
            'fix: streamline ship workflow\n\nThis is a pre-approved message from the slash command integration',
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

      // Initialize git repo with changes
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('feature.ts', 'export const feature = "test";');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Make a change to ship
      await workspace.writeFile('feature.ts', 'export const feature = "updated";');
      await workspace.run('git add .');

      // Run ship command - should use pre-approved message
      // Note: --skip-tests to bypass validation checks in test environment
      await workspace.hodge('ship test-feature --yes --skip-tests');

      // Verify the commit was made with the pre-approved message
      const lastCommitResult = await workspace.run('git log -1 --pretty=format:%B');
      const lastCommit = lastCommitResult.output;
      expect(lastCommit).toContain('fix: streamline ship workflow');
      expect(lastCommit).toContain('pre-approved message');

      // Verify state was cleaned up
      const stateExists = await workspace.exists(
        '.hodge/temp/ship-interaction/test-feature/state.json'
      );
      expect(stateExists).toBe(false);
    });
  });

  integrationTest('should fallback to default message when no state exists', async () => {
    await withTestWorkspace('ship-integration-fallback', async (workspace) => {
      // Setup minimal structure
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

      // Make a change
      await workspace.writeFile('test.txt', 'updated');
      await workspace.run('git add .');

      // Run ship without state file
      await workspace.hodge('ship test-feature --yes --skip-tests');

      // Verify commit was made with default message
      const lastCommitResult = await workspace.run('git log -1 --pretty=format:%B');
      expect(lastCommitResult.output).toContain('test-feature');
      expect(lastCommitResult.output).toContain('Implementation complete');
    });
  });

  integrationTest('should handle corrupted state gracefully and fallback', async () => {
    await withTestWorkspace('ship-integration-corrupted', async (workspace) => {
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
        '{ invalid json corrupted }'
      );

      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');
      await workspace.writeFile('test.txt', 'updated');
      await workspace.run('git add .');

      // Should not crash, should use default message
      await workspace.hodge('ship test-feature --yes --skip-tests');

      const lastCommitResult = await workspace.run('git log -1 --pretty=format:%B');
      expect(lastCommitResult.output).toContain('test-feature');
    });
  });

  integrationTest('should create ship record and release notes', async () => {
    await withTestWorkspace('ship-integration-records', async (workspace) => {
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
      await workspace.writeFile('test.txt', 'updated');
      await workspace.run('git add .');

      // Run ship
      await workspace.hodge('ship test-feature --yes --skip-tests');

      // Verify ship record was created
      const shipRecordExists = await workspace.exists(
        '.hodge/features/test-feature/ship/ship-record.json'
      );
      expect(shipRecordExists).toBe(true);

      // Verify release notes were created
      const releaseNotesExists = await workspace.exists(
        '.hodge/features/test-feature/ship/release-notes.md'
      );
      expect(releaseNotesExists).toBe(true);

      // Verify content of ship record
      const shipRecord = JSON.parse(
        await workspace.readFile('.hodge/features/test-feature/ship/ship-record.json')
      );
      expect(shipRecord.feature).toBe('test-feature');
      expect(shipRecord.commitMessage).toBeDefined();
    });
  });

  integrationTest('should skip push to protected branch without prompting', async () => {
    await withTestWorkspace('ship-integration-protected', async (workspace) => {
      await workspace.writeFile(
        '.hodge/features/test-feature/build/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
        })
      );

      // Initialize git repo on main branch (protected)
      await workspace.run('git init -b main');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Add a remote to make branch tracking detectable
      await workspace.run('git remote add origin https://github.com/test/test.git');

      await workspace.writeFile('test.txt', 'updated');
      await workspace.run('git add .');

      // Should complete without prompting, skipping push
      const shipResult = await workspace.hodge('ship test-feature --yes --skip-tests');

      // Verify commit was made locally
      const lastCommitResult = await workspace.run('git log -1 --pretty=format:%B');
      expect(lastCommitResult.output).toContain('test-feature');

      // Output should mention skipping push or not pushing
      expect(shipResult.output).toMatch(/skip|protected|manual/i);
    });
  });
});
