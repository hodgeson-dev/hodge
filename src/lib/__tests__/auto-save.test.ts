import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AutoSave } from '../auto-save';
import { existsSync, rmSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { smokeTest, integrationTest, unitTest } from '../../test/helpers';

describe('AutoSave', () => {
  const testDir = path.join(process.cwd(), '.test-hodge');
  let autoSave: AutoSave;

  beforeEach(async () => {
    // Create test directory structure
    await mkdir(testDir, { recursive: true });

    // Create a new AutoSave instance with test directory
    autoSave = new AutoSave(testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Smoke Tests', () => {
    smokeTest('should not crash when no context exists', async () => {
      // Just call it - no context file exists
      const result = await autoSave.checkAndSave('test-feature');

      expect(result).toBe(false); // No save should occur
    });

    smokeTest('should complete quickly', async () => {
      const start = Date.now();
      await autoSave.checkAndSave('test-feature');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    smokeTest('should handle disabled state', async () => {
      autoSave.setEnabled(false);

      // Create a context that would normally trigger auto-save
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(
        path.join(testDir, '.hodge', 'context.json'),
        JSON.stringify({ feature: 'old-feature', mode: 'build' })
      );

      const result = await autoSave.checkAndSave('new-feature');

      expect(result).toBe(false);
      expect(existsSync(path.join(testDir, '.hodge', 'saves'))).toBe(false);
    });
  });

  describe('Behavioral Tests', () => {
    unitTest('should not save when switching to same feature', async () => {
      // Set up current context
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(
        path.join(testDir, '.hodge', 'context.json'),
        JSON.stringify({ feature: 'current-feature', mode: 'explore' })
      );

      const result = await autoSave.checkAndSave('current-feature');

      expect(result).toBe(false);
      // No saves directory should be created
      expect(existsSync(path.join(testDir, '.hodge', 'saves'))).toBe(false);
    });

    unitTest('should create auto-save when switching features', async () => {
      // Set up current context with a feature
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(
        path.join(testDir, '.hodge', 'context.json'),
        JSON.stringify({ feature: 'old-feature', mode: 'build' })
      );

      // Switch to new feature
      const result = await autoSave.checkAndSave('new-feature');

      expect(result).toBe(true);

      // Check that a save was created
      const saves = existsSync(path.join(testDir, '.hodge', 'saves'));
      expect(saves).toBe(true);
    });

    unitTest('should preserve context in auto-save', async () => {
      // Set up context
      const originalContext = { feature: 'old-feature', mode: 'explore', data: 'test' };
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(
        path.join(testDir, '.hodge', 'context.json'),
        JSON.stringify(originalContext)
      );

      // Trigger auto-save
      await autoSave.checkAndSave('new-feature');

      // Find the created save directory (should start with "auto-old-feature")
      const { readdirSync } = await import('fs');
      const saveDirs = readdirSync(path.join(testDir, '.hodge', 'saves'));
      const autoSaveDir = saveDirs.find((dir) => dir.startsWith('auto-old-feature'));

      expect(autoSaveDir).toBeDefined();

      // Verify context was preserved
      if (autoSaveDir) {
        const savedContext = JSON.parse(
          await readFile(
            path.join(testDir, '.hodge', 'saves', autoSaveDir, 'context.json'),
            'utf-8'
          )
        );
        expect(savedContext).toEqual(originalContext);
      }
    });

    unitTest('should use auto- prefix for save names', async () => {
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(
        path.join(testDir, '.hodge', 'context.json'),
        JSON.stringify({ feature: 'test-feature', mode: 'build' })
      );

      await autoSave.checkAndSave('another-feature');

      const { readdirSync } = await import('fs');
      const saveDirs = readdirSync(path.join(testDir, '.hodge', 'saves'));

      expect(saveDirs[0]).toMatch(/^auto-test-feature-\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('Error Handling', () => {
    integrationTest('should handle corrupted context.json gracefully', async () => {
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(path.join(testDir, '.hodge', 'context.json'), 'not valid json{{');

      // Should not throw, just return false
      const result = await autoSave.checkAndSave('new-feature');

      expect(result).toBe(false);
    });

    integrationTest('should handle missing feature in context', async () => {
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(
        path.join(testDir, '.hodge', 'context.json'),
        JSON.stringify({ mode: 'explore' }) // No feature field
      );

      const result = await autoSave.checkAndSave('new-feature');

      expect(result).toBe(false);
    });

    integrationTest('should continue even if save fails', async () => {
      // Create context
      await mkdir(path.join(testDir, '.hodge'), { recursive: true });
      await writeFile(
        path.join(testDir, '.hodge', 'context.json'),
        JSON.stringify({ feature: 'old-feature', mode: 'build' })
      );

      // Make saves directory read-only to cause save to fail
      await mkdir(path.join(testDir, '.hodge', 'saves'), { recursive: true });
      const { chmodSync } = await import('fs');

      // This might not work on all systems, so we'll just check it doesn't crash
      try {
        chmodSync(path.join(testDir, '.hodge', 'saves'), 0o444); // Read-only
      } catch {
        // Some systems don't support chmod, that's ok
      }

      // Should handle the error gracefully
      const result = await autoSave.checkAndSave('new-feature');

      // Result doesn't matter, just shouldn't crash
      expect(result).toBeDefined();
    });
  });
});
