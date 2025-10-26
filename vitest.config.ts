import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // HODGE-351: Increase timeout for integration tests (real I/O takes 3-5s)
    testTimeout: 10000, // 10 seconds (default is 5s)
    // Vitest 3.x: Use forks pool for better test isolation
    pool: 'forks',
    // HODGE-351: Limit concurrent workers to prevent resource exhaustion
    poolOptions: {
      forks: {
        maxForks: 6, // Conservative limit for 8-core machines with 16GB RAM
        minForks: 2, // Maintain some parallelism even for small test runs
      },
    },
    // Isolate file system state between test files
    isolate: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '*.config.ts',
        '*.config.js',
        // Exclude entire scripts directory (standalone development tools)
        'scripts/**',
        // Exclude CLI entry point
        'src/bin/**',
        '.hodge/',
        'podge/',
      ],
      thresholds: {
        // HODGE-322: Adjusted to realistic targets based on CLI architecture
        // Service extraction pattern enables incremental progress toward 80% goal
        // Current: 55.73% lines, 76.36% functions, 76.57% branches, 55.73% statements
        lines: 50,
        functions: 70,
        branches: 75,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
