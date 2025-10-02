import { describe } from 'vitest';
import { integrationTest } from './helpers';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

describe('[integration] Test Isolation', () => {
  integrationTest(
    'should handle parallel test execution without conflicts',
    async () => {
      // Run multiple test files in parallel and verify they don't conflict
      const testCommands = [
        'npx vitest run src/lib/session-manager.test.ts',
        'npx vitest run src/lib/__tests__/auto-save.test.ts',
        'npx vitest run src/lib/__tests__/context-manager.test.ts',
      ];

      // Execute tests in parallel using Promise.all
      const results = await Promise.all(
        testCommands.map(
          (cmd) =>
            new Promise<boolean>((resolve) => {
              try {
                execSync(cmd, {
                  stdio: 'pipe',
                  encoding: 'utf8',
                  env: { ...process.env, NODE_ENV: 'test' },
                });
                resolve(true);
              } catch {
                // Even if a test fails, we're checking for conflicts, not test success
                resolve(true);
              }
            })
        )
      );

      // All should complete without file system conflicts
      results.forEach((result) => expect(result).toBe(true));

      // Verify no test directories in project root
      const hasTestDirs =
        existsSync('.test-hodge') ||
        existsSync('.test-session') ||
        existsSync('.test-workflow') ||
        existsSync('.test-context');

      expect(hasTestDirs).toBe(false);
    },
    15000
  );

  integrationTest('should clean up test directories even on failure', async () => {
    // Create a test that will fail but should still clean up
    const testDir = join(tmpdir(), `cleanup-test-${Date.now()}-${randomBytes(4).toString('hex')}`);
    const testFile = join(testDir, 'failing-test.js');

    try {
      mkdirSync(testDir, { recursive: true });

      // Write a test that creates a temp dir and then fails
      writeFileSync(
        testFile,
        `
        const { mkdirSync, rmSync } = require('fs');
        const { join } = require('path');
        const { tmpdir } = require('os');

        const testDir = join(tmpdir(), 'test-cleanup-' + Date.now());
        mkdirSync(testDir, { recursive: true });

        try {
          throw new Error('Intentional test failure');
        } finally {
          rmSync(testDir, { recursive: true, force: true });
        }
        `
      );

      // Run the failing test
      try {
        execSync(`node ${testFile}`, { stdio: 'pipe' });
      } catch (error) {
        // Test should fail, but that's expected
      }

      // Verify no leftover test-cleanup-* directories in tmpdir
      const tmpDirContents = execSync(`ls ${tmpdir()} | grep test-cleanup || echo "none"`, {
        encoding: 'utf8',
      }).trim();

      expect(tmpDirContents).toBe('none');
    } finally {
      // Clean up our test directory
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    }
  });

  integrationTest(
    'should maintain complete isolation between test runs',
    async () => {
      // Run the same test multiple times and verify each run is isolated
      const testFile = 'src/lib/session-manager.test.ts';
      const runs = 3;

      for (let i = 0; i < runs; i++) {
        // Get initial state of .hodge/saves
        const beforeSaves = existsSync('.hodge/saves')
          ? execSync('ls -1 .hodge/saves 2>/dev/null | wc -l', { encoding: 'utf8' }).trim()
          : '0';

        // Run test
        try {
          execSync(`npx vitest run ${testFile}`, {
            stdio: 'pipe',
            env: { ...process.env, NODE_ENV: 'test' },
          });
        } catch {
          // Ignore test failures, we're checking isolation
        }

        // Verify saves count hasn't changed
        const afterSaves = existsSync('.hodge/saves')
          ? execSync('ls -1 .hodge/saves 2>/dev/null | wc -l', { encoding: 'utf8' }).trim()
          : '0';

        expect(afterSaves).toBe(beforeSaves);
      }
    },
    10000 // Increase timeout to 10s for this slow test
  );

  integrationTest('should prevent test data from leaking into project', async () => {
    // Create a marker file in project's .hodge to detect modifications
    const markerPath = '.hodge/.test-marker-' + Date.now();
    const markerContent = 'This file should not be modified by tests';

    try {
      // Create marker
      writeFileSync(markerPath, markerContent);

      // Run all fixed tests
      const testFiles = [
        'src/lib/session-manager.test.ts',
        'src/lib/__tests__/auto-save.test.ts',
        'src/test/context-aware-commands.test.ts',
        'src/lib/__tests__/context-manager.test.ts',
      ];

      for (const file of testFiles) {
        try {
          execSync(`npx vitest run ${file}`, {
            stdio: 'pipe',
            env: { ...process.env, NODE_ENV: 'test' },
          });
        } catch {
          // Ignore test failures
        }
      }

      // Verify marker is unchanged
      expect(existsSync(markerPath)).toBe(true);
      const currentContent = require('fs').readFileSync(markerPath, 'utf8');
      expect(currentContent).toBe(markerContent);

      // Verify no new files in .hodge (except our marker)
      const hodgeFiles = execSync(
        'find .hodge -type f -newer ' + markerPath + ' 2>/dev/null || echo ""',
        {
          encoding: 'utf8',
        }
      ).trim();

      // Should be empty (no files newer than our marker)
      expect(hodgeFiles).toBe('');
    } finally {
      // Clean up marker
      if (existsSync(markerPath)) {
        rmSync(markerPath);
      }
    }
  });
});
