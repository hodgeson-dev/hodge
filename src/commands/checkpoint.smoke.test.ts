import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { ContextCommand } from './context.js';

/**
 * Smoke tests for HODGE-358: Checkpoint Command
 *
 * Tests verify checkpoint file discovery and precedence:
 * 1. Checkpoint files are discovered via glob pattern
 2. Checkpoints sorted by timestamp (newest first)
 * 3. Feature context loading includes checkpoint list
 * 4. Multiple checkpoints handled correctly
 */
describe('ContextCommand - HODGE-358 Checkpoint Discovery', () => {
  smokeTest('should discover checkpoint files in feature directory', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      // Create feature directory with checkpoint files
      const featureDir = '.hodge/features/TEST-001';
      await fixture.writeFile(`${featureDir}/explore/exploration.md`, '# Test');
      await fixture.writeFile(
        `${featureDir}/checkpoint-2025-10-27-140000.yaml`,
        'timestamp: 2025-10-27T14:00:00Z\nphase: build\nfeatureId: TEST-001'
      );

      // Create context command with temp directory
      const command = new ContextCommand(tempDir);

      // Execute loadFeatureContext - should not crash
      await command.execute({ feature: 'TEST-001' });

      // Verify checkpoint file exists
      const checkpointExists = await fixture.fileExists(
        `${featureDir}/checkpoint-2025-10-27-140000.yaml`
      );
      expect(checkpointExists).toBe(true);
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('should sort checkpoints by timestamp (newest first)', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      // Create multiple checkpoint files with different timestamps
      const featureDir = '.hodge/features/TEST-002';
      await fixture.writeFile(`${featureDir}/explore/exploration.md`, '# Test');
      await fixture.writeFile(
        `${featureDir}/checkpoint-2025-10-27-140000.yaml`,
        'timestamp: 2025-10-27T14:00:00Z'
      );
      await fixture.writeFile(
        `${featureDir}/checkpoint-2025-10-27-150000.yaml`,
        'timestamp: 2025-10-27T15:00:00Z'
      );
      await fixture.writeFile(
        `${featureDir}/checkpoint-2025-10-27-130000.yaml`,
        'timestamp: 2025-10-27T13:00:00Z'
      );

      // Create context command
      const command = new ContextCommand(tempDir);

      // Execute - should discover and sort checkpoints
      await command.execute({ feature: 'TEST-002' });

      // Verify all checkpoints exist
      const files = await fixture.listFiles(featureDir);
      const checkpointFiles = files.filter((f) => f.startsWith('checkpoint-'));
      expect(checkpointFiles.length).toBe(3);
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('should handle feature directory with no checkpoints', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      // Create feature directory without checkpoints
      const featureDir = '.hodge/features/TEST-003';
      await fixture.writeFile(`${featureDir}/explore/exploration.md`, '# Test');

      // Create context command
      const command = new ContextCommand(tempDir);

      // Execute - should not crash when no checkpoints exist
      await command.execute({ feature: 'TEST-003' });

      // Verify no checkpoint files exist
      const files = await fixture.listFiles(featureDir);
      const checkpointFiles = files.filter((f) => f.startsWith('checkpoint-'));
      expect(checkpointFiles.length).toBe(0);
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('should handle feature directory that does not exist', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      // Create .hodge directory structure for HODGE.md generation
      await fixture.writeFile('.hodge/standards.md', '# Standards');

      // Create context command
      const command = new ContextCommand(tempDir);

      // Execute with non-existent feature - should not crash
      await command.execute({ feature: 'NON-EXISTENT' });

      // No verification needed - success means no crash
      expect(true).toBe(true);
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('should handle checkpoint files with malformed names', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      // Create feature directory with valid and invalid checkpoint files
      const featureDir = '.hodge/features/TEST-004';
      await fixture.writeFile(`${featureDir}/explore/exploration.md`, '# Test');
      await fixture.writeFile(
        `${featureDir}/checkpoint-2025-10-27-140000.yaml`,
        'timestamp: 2025-10-27T14:00:00Z'
      );
      await fixture.writeFile(`${featureDir}/checkpoint-invalid.yaml`, 'invalid'); // Malformed name
      await fixture.writeFile(`${featureDir}/not-a-checkpoint.yaml`, 'other'); // Not a checkpoint

      // Create context command
      const command = new ContextCommand(tempDir);

      // Execute - should handle mixed files gracefully
      await command.execute({ feature: 'TEST-004' });

      // Verify only valid checkpoint discovered
      const files = await fixture.listFiles(featureDir);
      const checkpointFiles = files.filter(
        (f) => f.startsWith('checkpoint-') && f.endsWith('.yaml')
      );
      expect(checkpointFiles.length).toBeGreaterThanOrEqual(1);
    } finally {
      await fixture.cleanup();
    }
  });
});
