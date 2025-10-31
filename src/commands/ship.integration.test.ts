import { describe, expect, vi } from 'vitest';
import { integrationTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';
import { ShipCommand } from './ship.js';
import type { RawToolResult } from '../types/toolchain.js';

// Mock ToolchainService to prevent real tool execution in integration tests
vi.mock('../lib/toolchain-service.js', () => ({
  ToolchainService: class {
    async runQualityChecks(): Promise<RawToolResult[]> {
      return [
        { type: 'testing', tool: 'vitest', success: true },
        { type: 'linting', tool: 'eslint', success: true },
        { type: 'type_checking', tool: 'tsc', success: true },
      ];
    }
    async loadConfig() {
      return {
        version: '1.0',
        language: 'typescript',
        quality_checks: {},
        commands: {},
      };
    }
  },
}));

describe('Ship Command - Integration Tests', () => {
  integrationTest('should complete full ship workflow with pre-approved message', async () => {
    await withTestWorkspace('ship-integration-full', async (workspace) => {
      // Setup complete .hodge structure
      await workspace.writeFile('.hodge/standards.md', '# Standards');
      await workspace.writeFile('.hodge/features/test-feature/build/build-plan.md', '# Build Plan');

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

      // Run ship command directly (no subprocess)
      // HODGE-320: Direct function call instead of subprocess spawning
      // HODGE-366: Use basePath for test isolation
      const command = new ShipCommand(workspace.getPath());
      await command.execute('test-feature', { yes: true, skipTests: true });

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
      // Setup minimal build structure
      await workspace.writeFile('.hodge/features/test-feature/build/build-plan.md', '# Build Plan');

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

      // Run ship without state file (direct call - no subprocess)
      // HODGE-320: Direct function call instead of subprocess spawning
      // HODGE-366: Use basePath for test isolation
      const command = new ShipCommand(workspace.getPath());
      await command.execute('test-feature', { yes: true, skipTests: true });

      // Verify commit was made with default message
      const lastCommitResult = await workspace.run('git log -1 --pretty=format:%B');
      expect(lastCommitResult.output).toContain('test-feature');
      expect(lastCommitResult.output).toContain('Implementation complete');
    });
  });

  integrationTest('should handle corrupted state gracefully and fallback', async () => {
    await withTestWorkspace('ship-integration-corrupted', async (workspace) => {
      // Setup minimal build structure
      await workspace.writeFile('.hodge/features/test-feature/build/build-plan.md', '# Build Plan');

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

      // Should not crash, should use default message (direct call - no subprocess)
      // HODGE-320: Direct function call instead of subprocess spawning
      const command = new ShipCommand(workspace.getPath());
        await command.execute('test-feature', { yes: true, skipTests: true });

      const lastCommitResult = await workspace.run('git log -1 --pretty=format:%B');
      expect(lastCommitResult.output).toContain('test-feature');
    });
  });

  integrationTest('should create ship record and release notes', async () => {
    await withTestWorkspace('ship-integration-records', async (workspace) => {
      // Setup minimal build structure
      await workspace.writeFile('.hodge/features/test-feature/build/build-plan.md', '# Build Plan');

      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');
      await workspace.writeFile('test.txt', 'updated');
      await workspace.run('git add .');

      // Run ship (direct call - no subprocess)
      // HODGE-320: Direct function call instead of subprocess spawning
      const command = new ShipCommand(workspace.getPath());
        await command.execute('test-feature', { yes: true, skipTests: true });

      // Verify ship record was created
      const shipRecordExists = await workspace.exists(
        '.hodge/features/test-feature/ship-record.json'
      );
      expect(shipRecordExists).toBe(true);

      // Verify release notes were created
      const releaseNotesExists = await workspace.exists(
        '.hodge/features/test-feature/ship/release-notes.md'
      );
      expect(releaseNotesExists).toBe(true);

      // Verify content of ship record
      const shipRecord = JSON.parse(
        await workspace.readFile('.hodge/features/test-feature/ship-record.json')
      );
      expect(shipRecord.feature).toBe('test-feature');
      expect(shipRecord.commitMessage).toBeDefined();
    });
  });

  integrationTest('should skip push to protected branch without prompting', async () => {
    await withTestWorkspace('ship-integration-protected', async (workspace) => {
      // Setup minimal build structure
      await workspace.writeFile('.hodge/features/test-feature/build/build-plan.md', '# Build Plan');

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

      // Should complete without prompting, skipping push (direct call - no subprocess)
      // HODGE-320: Direct function call instead of subprocess spawning
      const command = new ShipCommand(workspace.getPath());
        await command.execute('test-feature', { yes: true, skipTests: true });

      // Verify commit was made locally
      const lastCommitResult = await workspace.run('git log -1 --pretty=format:%B');
      expect(lastCommitResult.output).toContain('test-feature');
    });
  });
});
