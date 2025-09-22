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
});
