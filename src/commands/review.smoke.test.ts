/**
 * Smoke Tests for Review Command (HODGE-327.1)
 *
 * Tests core infrastructure: profile loading, context aggregation, basic command execution.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ProfileLoader } from '../lib/profile-loader.js';
import { ContextAggregator } from '../lib/context-aggregator.js';
import { ReviewCommand } from './review.js';
import { smokeTest } from '../test/helpers.js';

describe('Review Command - Smoke Tests', () => {
  smokeTest('ProfileLoader can load and validate default.yml profile', () => {
    const loader = new ProfileLoader();
    const profile = loader.loadProfile('default');

    expect(profile.name).toBe('Default Code Quality');
    expect(profile.description).toBeTruthy();
    expect(profile.criteria.length).toBeGreaterThan(0);
    expect(profile.applies_to).toContain('**/*.ts');
    expect(profile.applies_to).toContain('**/*.kt'); // Kotlin support
  });

  smokeTest('ProfileLoader validates required fields', () => {
    const testDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(join(testDir, '.hodge', 'review-profiles'), { recursive: true });

    try {
      // Create invalid profile (missing required field)
      const invalidProfile = join(testDir, '.hodge', 'review-profiles', 'invalid.yml');
      writeFileSync(
        invalidProfile,
        `
name: "Invalid Profile"
# Missing description and criteria
applies_to:
  - "**/*.ts"
`.trim()
      );

      const loader = new ProfileLoader(testDir);
      expect(() => loader.loadProfile('invalid')).toThrow(/missing.*field/i);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  smokeTest('ProfileLoader validates severity levels', () => {
    const testDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(join(testDir, '.hodge', 'review-profiles'), { recursive: true });

    try {
      // Create profile with invalid severity
      const badProfile = join(testDir, '.hodge', 'review-profiles', 'badseverity.yml');
      writeFileSync(
        badProfile,
        `
name: "Bad Severity"
description: "Test"
applies_to:
  - "**/*.ts"
criteria:
  - name: "Test"
    severity: invalid_severity
    patterns:
      - "Test pattern"
`.trim()
      );

      const loader = new ProfileLoader(testDir);
      expect(() => loader.loadProfile('badseverity')).toThrow(/invalid severity/i);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  smokeTest('ContextAggregator loads project context', () => {
    const aggregator = new ContextAggregator();
    const context = aggregator.loadContext();

    // These files exist in the Hodge project
    expect(context.standards).toBeTruthy();
    expect(context.principles).toBeTruthy();
    expect(context.patterns.length).toBeGreaterThan(0);
    expect(context.lessons.length).toBeGreaterThan(0);
  });

  smokeTest('ContextAggregator handles missing files gracefully', () => {
    const testDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(join(testDir, '.hodge'), { recursive: true });

    try {
      const aggregator = new ContextAggregator(testDir);
      const context = aggregator.loadContext();

      // Should return empty strings/arrays, not throw
      expect(context.standards).toBe('');
      expect(context.principles).toBe('');
      expect(context.patterns).toEqual([]);
      expect(context.lessons).toEqual([]);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  smokeTest('ReviewCommand rejects unsupported scopes', () => {
    const command = new ReviewCommand();

    // HODGE-327.1 only supports 'file' scope
    expect(() => command.execute('directory', 'src/')).toThrow(/not supported/i);
    expect(() => command.execute('pattern', '**/*.ts')).toThrow(/not supported/i);
    expect(() => command.execute('recent', '--last 5')).toThrow(/not supported/i);
  });

  smokeTest('ReviewCommand validates file exists', () => {
    const command = new ReviewCommand();
    const nonExistentFile = join(tmpdir(), 'does-not-exist-' + Date.now() + '.ts');

    // Should exit with error for missing file
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    try {
      expect(() => command.execute('file', nonExistentFile)).toThrow();
    } finally {
      exitSpy.mockRestore();
    }
  });

  smokeTest('ReviewCommand loads profile and context successfully', () => {
    const testDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    const testFile = join(testDir, 'test.ts');

    try {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(testFile, 'const x = 1;'); // Simple test file

      const command = new ReviewCommand();

      // Should not throw (will output placeholder message in HODGE-327.1)
      expect(() => command.execute('file', testFile)).not.toThrow();
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
