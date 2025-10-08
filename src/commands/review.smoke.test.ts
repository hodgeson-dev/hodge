/**
 * Smoke Tests for Review Command (HODGE-327.1)
 *
 * Tests core infrastructure: profile loading, context aggregation, basic command execution.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ReviewProfileLoader } from '../lib/review-profile-loader.js';
import { ContextAggregator } from '../lib/context-aggregator.js';
import { ReviewCommand } from './review.js';
import { smokeTest } from '../test/helpers.js';

describe('Review Command - Smoke Tests', () => {
  smokeTest('ReviewProfileLoader can load and validate general-coding-standards.md profile', () => {
    const loader = new ReviewProfileLoader();
    const profile = loader.loadProfile('languages/general-coding-standards');

    expect(profile.name).toBe('General Coding Standards');
    expect(profile.description).toBeTruthy();
    expect(profile.criteria_count).toBeGreaterThan(0);
    expect(Array.isArray(profile.applies_to)).toBe(true);
    expect(profile.applies_to.length).toBeGreaterThan(0);
  });

  smokeTest('ReviewProfileLoader validates required fields', () => {
    const testDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(join(testDir, '.hodge', 'review-profiles'), { recursive: true });

    try {
      // Create invalid profile (missing required frontmatter field)
      const invalidProfile = join(testDir, '.hodge', 'review-profiles', 'invalid.md');
      writeFileSync(
        invalidProfile,
        `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
name: "Invalid Profile"
# Missing description
---

## Some Criteria
`
      );

      const loader = new ReviewProfileLoader(testDir);
      expect(() => loader.loadProfile('invalid')).toThrow(/missing.*field/i);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  smokeTest('ReviewProfileLoader validates frontmatter version', () => {
    const testDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(join(testDir, '.hodge', 'review-profiles'), { recursive: true });

    try {
      // Create profile with invalid frontmatter version
      const badProfile = join(testDir, '.hodge', 'review-profiles', 'badversion.md');
      writeFileSync(
        badProfile,
        `---
frontmatter_version: "2.0.0"
scope: reusable
type: universal
version: "1.0.0"
description: "Profile with unsupported frontmatter version"
---

## Some Criteria
`
      );

      const loader = new ReviewProfileLoader(testDir);
      expect(() => loader.loadProfile('badversion')).toThrow(/frontmatter_version/i);
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

  smokeTest('ReviewCommand rejects unsupported scopes', async () => {
    const command = new ReviewCommand();

    // Now supports file, directory, and recent - test invalid scope
    await expect(command.execute('invalid', 'src/')).rejects.toThrow(/not supported/i);
  });

  smokeTest('ReviewCommand validates file exists', async () => {
    const command = new ReviewCommand();
    const nonExistentFile = join(tmpdir(), 'does-not-exist-' + Date.now() + '.ts');

    // Should exit with error for missing file
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    try {
      await expect(command.execute('file', nonExistentFile)).rejects.toThrow();
    } finally {
      exitSpy.mockRestore();
    }
  });

  smokeTest('ReviewCommand loads profile and context successfully', async () => {
    const testDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    const testFile = join(testDir, 'test.ts');

    try {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(testFile, 'const x = 1;'); // Simple test file

      const command = new ReviewCommand();

      // Should not throw
      await expect(command.execute('file', testFile)).resolves.not.toThrow();
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
