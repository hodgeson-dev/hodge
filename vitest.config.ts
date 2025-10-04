import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Vitest 3.x: Use forks pool for better test isolation
    pool: 'forks',
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
        lines: 55,
        functions: 75,
        branches: 75,
        statements: 55,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
