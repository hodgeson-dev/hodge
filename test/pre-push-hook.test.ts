import { describe, expect } from 'vitest';
import { smokeTest } from '../src/test/helpers';
import * as fs from 'fs';
import * as path from 'path';

describe('Pre-push Hook', () => {
  smokeTest('pre-push hook script should exist and be executable', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    expect(fs.existsSync(hookPath)).toBe(true);

    const stats = fs.statSync(hookPath);
    // Check if file is executable (owner execute permission)
    expect(stats.mode & 0o100).toBeTruthy();
  });

  smokeTest('pre-push hook should have proper shebang', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');
    expect(content.startsWith('#!/bin/sh')).toBe(true);
  });

  smokeTest('pre-push hook should check for protected branches', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    // Check for protected branch patterns
    expect(content).toContain('PROTECTED_BRANCHES');
    expect(content).toContain('main');
    expect(content).toContain('develop');
    expect(content).toContain('release/');
    expect(content).toContain('hotfix/');
  });

  smokeTest('pre-push hook should include prettier check', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('npx prettier --check');
    expect(content).toContain('run_prettier_check');
  });

  smokeTest('pre-push hook should include npm audit with caching', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('npm audit');
    expect(content).toContain('--audit-level');
    expect(content).toContain('moderate');
    expect(content).toContain('CACHE_DIR');
    expect(content).toContain('AUDIT_CACHE_FILE');
  });

  smokeTest('pre-push hook should respect cache duration of 24 hours', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('CACHE_DURATION_HOURS=24');
  });

  smokeTest('pre-push hook should have 5 second performance threshold', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('MAX_EXECUTION_TIME=5');
  });

  smokeTest('pre-push hook should support --no-verify override', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    // The hook itself doesn't need to check for --no-verify
    // Git handles this automatically by not running the hook
    expect(content).toContain('use --no-verify to bypass');
  });

  smokeTest('pre-push hook should invalidate cache on package-lock changes', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('package-lock.json');
    expect(content).toContain('invalidating audit cache');
  });

  smokeTest('pre-push hook should support HODGE_STRICT environment variable', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('HODGE_STRICT');
    expect(content).toContain('use HODGE_STRICT=true to force');
  });

  // HODGE-378.1: ESLint validation tests
  smokeTest('pre-push hook should include ESLint check function', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('run_eslint_check');
    expect(content).toContain('npm run lint');
  });

  smokeTest('pre-push hook should support SKIP_LINT environment variable', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('SKIP_LINT');
    expect(content).toContain('SKIP_LINT=true git push');
  });

  smokeTest('pre-push hook should run ESLint check in main execution', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    // Verify ESLint check is called in main()
    expect(content).toContain('run_eslint_check');
    expect(content).toContain('Prevents ESLint errors from reaching CI');
  });

  smokeTest('pre-push hook should provide helpful error messages for ESLint failures', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('ESLint errors detected');
    expect(content).toContain('To see detailed errors:');
    expect(content).toContain('To bypass this check (emergency only):');
  });
});
