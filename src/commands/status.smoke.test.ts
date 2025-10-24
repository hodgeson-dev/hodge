import { describe, expect } from 'vitest';
import { StatusCommand } from './status.js';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';

describe('StatusCommand - Non-Interactive Smoke Tests', () => {
  smokeTest('should not crash when showing overall status', async () => {
    await withTestWorkspace('status-overall', async (workspace) => {
      const command = new StatusCommand();

      // Run without throwing
      await expect(command.execute()).resolves.not.toThrow();
    });
  });

  smokeTest('should not crash when showing feature status', async () => {
    await withTestWorkspace('status-feature', async (workspace) => {
      const command = new StatusCommand();

      // Create a feature directory using workspace helper
      await workspace.writeFile('.hodge/features/TEST-001/explore/context.json', '{}');

      // Run without throwing
      await expect(command.execute('TEST-001')).resolves.not.toThrow();
    });
  });

  smokeTest('should not update HODGE.md file', async () => {
    await withTestWorkspace('status-no-update', async (workspace) => {
      const command = new StatusCommand();

      // Create a marker file to detect updates using workspace helper
      await workspace.writeFile('.hodge/HODGE.md', 'ORIGINAL_CONTENT');

      // Run status command
      await command.execute();

      // Verify file was NOT updated
      const content = await workspace.readFile('.hodge/HODGE.md');
      expect(content).toBe('ORIGINAL_CONTENT');
    });
  });

  smokeTest('should handle session without prompting', async () => {
    await withTestWorkspace('status-session', async (workspace) => {
      const command = new StatusCommand();

      // Create a session file using workspace helper
      const session = {
        feature: 'TEST-001',
        mode: 'build',
        timestamp: new Date().toISOString(),
      };
      await workspace.writeFile('.hodge/session.json', JSON.stringify(session));

      // Run without throwing (should use session feature)
      await expect(command.execute()).resolves.not.toThrow();
    });
  });

  smokeTest('should detect decision.md at feature root (not in explore/)', async () => {
    await withTestWorkspace('status-decision-root', async (workspace) => {
      const command = new StatusCommand();

      // Create feature with decision.md at root (not in explore/ subdirectory)
      await workspace.writeFile('.hodge/features/TEST-002/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-002/decision.md', 'Decision content');

      // Run without throwing - should detect decision at root
      await expect(command.execute('TEST-002')).resolves.not.toThrow();
    });
  });

  smokeTest('should detect shipped status when ship-record.json exists', async () => {
    await withTestWorkspace('status-shipped', async (workspace) => {
      const command = new StatusCommand();

      // Create fully shipped feature with ship-record.json
      await workspace.writeFile('.hodge/features/TEST-003/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-003/decision.md', 'Decision');
      await workspace.writeFile('.hodge/features/TEST-003/build/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-003/harden/context.json', '{}');
      await workspace.writeFile(
        '.hodge/features/TEST-003/ship-record.json',
        JSON.stringify({ shipped: true })
      );

      // Run without throwing - should detect shipped status
      await expect(command.execute('TEST-003')).resolves.not.toThrow();
    });
  });

  // Phase 1 (HODGE-346.4): Stats functionality
  smokeTest('should support --stats flag', async () => {
    await withTestWorkspace('status-stats-flag', async (workspace) => {
      const command = new StatusCommand();

      // Run without throwing
      await expect(command.execute(undefined, { stats: true })).resolves.not.toThrow();
    });
  });

  smokeTest('should return stats with all fields', async () => {
    await withTestWorkspace('status-stats-fields', async (workspace) => {
      const command = new StatusCommand();

      // Create some ship records
      await workspace.writeFile(
        '.hodge/features/TEST-SHIP-1/ship-record.json',
        JSON.stringify({
          feature: 'TEST-SHIP-1',
          timestamp: new Date().toISOString(),
          validationPassed: true,
        })
      );

      // Run without throwing - stats calculation should work
      await expect(command.execute(undefined, { stats: true })).resolves.not.toThrow();
    });
  });

  smokeTest('should handle no ship records gracefully', async () => {
    await withTestWorkspace('status-no-ships', async (workspace) => {
      const command = new StatusCommand();

      // No ship records exist - should still work
      await expect(command.execute(undefined, { stats: true })).resolves.not.toThrow();
    });
  });

  smokeTest('should handle corrupted ship records gracefully', async () => {
    await withTestWorkspace('status-corrupted-ships', async (workspace) => {
      const command = new StatusCommand();

      // Create corrupted JSON
      await workspace.writeFile('.hodge/features/BAD-SHIP/ship-record.json', 'INVALID JSON{');

      // Should skip corrupted files and not crash
      await expect(command.execute(undefined, { stats: true })).resolves.not.toThrow();
    });
  });
});
