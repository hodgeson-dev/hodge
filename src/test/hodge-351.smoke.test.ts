/**
 * Smoke tests for HODGE-351: Test suite performance optimization
 *
 * Verifies that Vitest worker limits are configured correctly to prevent
 * resource exhaustion and orphaned processes.
 */

import { describe, expect } from 'vitest';
import { smokeTest } from './helpers.js';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('HODGE-351: Test Suite Performance [smoke]', () => {
  smokeTest('should have worker limits configured in vitest.config.ts', () => {
    // Read the vitest config file
    const configPath = join(process.cwd(), 'vitest.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Verify poolOptions.forks.maxForks is set
    expect(configContent).toContain('poolOptions');
    expect(configContent).toContain('forks:');
    expect(configContent).toContain('maxForks:');

    // Verify the value is 6 (our decision)
    expect(configContent).toMatch(/maxForks:\s*6/);
  });

  smokeTest('should have minForks configured', () => {
    const configPath = join(process.cwd(), 'vitest.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Verify minForks is set to maintain some parallelism
    expect(configContent).toContain('minForks:');
    expect(configContent).toMatch(/minForks:\s*2/);
  });

  smokeTest('should maintain pool: forks configuration', () => {
    const configPath = join(process.cwd(), 'vitest.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Verify we're still using forks pool (required for test isolation)
    expect(configContent).toMatch(/pool:\s*['"]forks['"]/);
  });

  smokeTest('should maintain isolate: true configuration', () => {
    const configPath = join(process.cwd(), 'vitest.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Verify isolation is still enabled (required for TempDirectoryFixture)
    expect(configContent).toMatch(/isolate:\s*true/);
  });

  smokeTest('should have HODGE-351 reference in configuration comments', () => {
    const configPath = join(process.cwd(), 'vitest.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Verify we documented the change with feature reference
    expect(configContent).toContain('HODGE-351');
  });
});
