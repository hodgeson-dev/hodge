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
        'scripts/create-linear-project.js',
        'scripts/fetch-issue.js',
        'scripts/list-linear-teams.js',
        'scripts/test-pm-connection.js',
        'scripts/update-issue-decision.js',
        'scripts/validate-standards.js',
        '.hodge/',
        'podge/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
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
