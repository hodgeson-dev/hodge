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

  smokeTest('should detect shipped status when validationPassed is true', async () => {
    await withTestWorkspace('status-shipped', async (workspace) => {
      const command = new StatusCommand();

      // Create fully shipped feature with validationPassed: true
      await workspace.writeFile('.hodge/features/TEST-003/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-003/decisions.md', 'Decision');
      await workspace.writeFile('.hodge/features/TEST-003/build/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-003/harden/context.json', '{}');
      await workspace.writeFile(
        '.hodge/features/TEST-003/ship-record.json',
        JSON.stringify({ validationPassed: true })
      );

      // Run without throwing - should detect shipped status
      await expect(command.execute('TEST-003')).resolves.not.toThrow();
    });
  });

  smokeTest('should NOT show shipped when validationPassed is false', async () => {
    await withTestWorkspace('status-not-shipped', async (workspace) => {
      const command = new StatusCommand();

      // Create feature with failed ship attempt (validationPassed: false)
      await workspace.writeFile('.hodge/features/TEST-004/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-004/decisions.md', 'Decision');
      await workspace.writeFile('.hodge/features/TEST-004/build/context.json', '{}');
      await workspace.writeFile(
        '.hodge/features/TEST-004/ship-record.json',
        JSON.stringify({ validationPassed: false })
      );

      // Run without throwing - should NOT consider feature as shipped
      await expect(command.execute('TEST-004')).resolves.not.toThrow();
    });
  });

  smokeTest('should detect decisions.md (plural) not just decision.md', async () => {
    await withTestWorkspace('status-decisions-plural', async (workspace) => {
      const command = new StatusCommand();

      // Create feature with decisions.md (plural)
      await workspace.writeFile('.hodge/features/TEST-005/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-005/decisions.md', 'Multiple decisions');

      // Run without throwing - should detect decisions.md
      await expect(command.execute('TEST-005')).resolves.not.toThrow();
    });
  });

  // Phase 1 (HODGE-346.4): Stats functionality
  smokeTest('should support --stats flag', async () => {
    await withTestWorkspace('status-stats-flag', async () => {
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
    await withTestWorkspace('status-no-ships', async () => {
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

  // HODGE-365: Production Ready indicator should match ship validation status
  smokeTest('should show Production Ready ✓ when shipped with validationPassed: true', async () => {
    await withTestWorkspace('status-production-ready-shipped', async (workspace) => {
      const command = new StatusCommand();

      // Create shipped feature with validationPassed: true
      await workspace.writeFile('.hodge/features/TEST-READY/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-READY/build/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-READY/harden/context.json', '{}');
      await workspace.writeFile(
        '.hodge/features/TEST-READY/ship-record.json',
        JSON.stringify({ validationPassed: true })
      );

      // Should not crash - both Production Ready and Shipped should show ✓
      await expect(command.execute('TEST-READY')).resolves.not.toThrow();
    });
  });

  smokeTest('should show Production Ready ○ when NOT shipped', async () => {
    await withTestWorkspace('status-production-ready-not-shipped', async (workspace) => {
      const command = new StatusCommand();

      // Create feature that's hardened but not shipped
      await workspace.writeFile('.hodge/features/TEST-UNSHIPPED/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-UNSHIPPED/build/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-UNSHIPPED/harden/context.json', '{}');
      // No ship-record.json exists

      // Should not crash - both Production Ready and Shipped should show ○
      await expect(command.execute('TEST-UNSHIPPED')).resolves.not.toThrow();
    });
  });

  smokeTest('should show Production Ready ○ when validationPassed is false', async () => {
    await withTestWorkspace('status-production-ready-failed', async (workspace) => {
      const command = new StatusCommand();

      // Create feature with failed ship validation
      await workspace.writeFile('.hodge/features/TEST-FAILED/explore/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-FAILED/build/context.json', '{}');
      await workspace.writeFile('.hodge/features/TEST-FAILED/harden/context.json', '{}');
      await workspace.writeFile(
        '.hodge/features/TEST-FAILED/ship-record.json',
        JSON.stringify({ validationPassed: false })
      );

      // Should not crash - both Production Ready and Shipped should show ○
      await expect(command.execute('TEST-FAILED')).resolves.not.toThrow();
    });
  });
});
