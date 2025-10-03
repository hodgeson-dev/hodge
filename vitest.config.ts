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
        lines: 80,
        functions: 80,
        // Lower threshold for branch coverage (CLI architecture consideration)
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
