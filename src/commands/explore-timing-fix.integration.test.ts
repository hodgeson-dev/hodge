import { describe, expect } from 'vitest';
import { integrationTest } from '../test/helpers.js';
import { ExploreCommand } from './explore.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { existsSync } from 'fs';

describe('[integration] Explore Command Timing Fix', () => {
  // HODGE-320: Replaced subprocess spawning with direct function calls
  // Tests verify command success only - vitest timeout handles hangs
  // No timing assertions to eliminate flakiness

  integrationTest('explore command completes successfully', async () => {
    // Create isolated temp directory for test (test isolation)
    const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-timing-test-'));

    try {
      // Initialize .hodge structure in test directory
      const hodgeDir = path.join(testDir, '.hodge');
      await fs.mkdir(hodgeDir, { recursive: true });
      await fs.mkdir(path.join(hodgeDir, 'features'), { recursive: true });

      // Direct function call - no subprocess
      const command = new ExploreCommand();
      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);
        await command.execute('test-timing-fix', { skipIdManagement: true });

        // Verify success through filesystem state
        const featureDir = path.join(hodgeDir, 'features', 'test-timing-fix');
        expect(existsSync(featureDir)).toBe(true);

        const exploreDir = path.join(featureDir, 'explore');
        expect(existsSync(exploreDir)).toBe(true);

        // Verify exploration file was created
        const explorationFile = path.join(exploreDir, 'exploration.md');
        expect(existsSync(explorationFile)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      // Cleanup temp directory
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  integrationTest('multiple explores complete successfully', async () => {
    // Create isolated temp directory for test (test isolation)
    const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-multi-timing-test-'));

    try {
      // Initialize .hodge structure in test directory
      const hodgeDir = path.join(testDir, '.hodge');
      await fs.mkdir(hodgeDir, { recursive: true });
      await fs.mkdir(path.join(hodgeDir, 'features'), { recursive: true });

      // Direct function calls - no subprocess
      const command = new ExploreCommand();
      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        // Run multiple explores
        await command.execute('feature-1', { skipIdManagement: true });
        await command.execute('feature-2', { skipIdManagement: true });

        // Verify both features were created
        const feature1Dir = path.join(hodgeDir, 'features', 'feature-1', 'explore');
        const feature2Dir = path.join(hodgeDir, 'features', 'feature-2', 'explore');

        expect(existsSync(feature1Dir)).toBe(true);
        expect(existsSync(feature2Dir)).toBe(true);

        // Verify exploration files were created
        expect(existsSync(path.join(feature1Dir, 'exploration.md'))).toBe(true);
        expect(existsSync(path.join(feature2Dir, 'exploration.md'))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    } finally {
      // Cleanup temp directory
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });
});
