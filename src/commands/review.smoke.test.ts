/**
 * Smoke Tests for Review Command (HODGE-327.1)
 *
 * Tests core infrastructure: profile loading, context aggregation, basic command execution.
 */

import { describe, it, expect, vi } from 'vitest';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ReviewProfileLoader } from '../lib/review-profile-loader.js';
import { ContextAggregator } from '../lib/context-aggregator.js';
import { ReviewCommand } from './review.js';
import { smokeTest } from '../test/helpers.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

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

  smokeTest('ReviewProfileLoader validates required fields', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    try {
      mkdirSync(join(testDir, '.hodge', 'review-profiles'), { recursive: true });

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
      await fixture.cleanup();
    }
  });

  smokeTest('ReviewProfileLoader validates frontmatter version', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    try {
      mkdirSync(join(testDir, '.hodge', 'review-profiles'), { recursive: true });

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
      await fixture.cleanup();
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

  smokeTest('ContextAggregator handles missing files gracefully', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    try {
      mkdirSync(join(testDir, '.hodge'), { recursive: true });

      const aggregator = new ContextAggregator(testDir);
      const context = aggregator.loadContext();

      // Should return empty strings/arrays, not throw
      expect(context.standards).toBe('');
      expect(context.principles).toBe('');
      expect(context.patterns).toEqual([]);
      expect(context.lessons).toEqual([]);
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('ReviewCommand rejects unsupported scopes', async () => {
    const command = new ReviewCommand();

    // Now supports file, directory, and recent - test invalid scope
    await expect(command.execute('invalid', 'src/')).rejects.toThrow(/not supported/i);
  });

  smokeTest('ReviewCommand validates file exists', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    try {
      const command = new ReviewCommand();
      const nonExistentFile = join(testDir, 'does-not-exist.ts');

      // Should exit with error for missing file
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await expect(command.execute('file', nonExistentFile)).rejects.toThrow();
      } finally {
        exitSpy.mockRestore();
      }
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('ReviewCommand loads profile and context successfully', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    try {
      const testFile = join(testDir, 'test.ts');
      writeFileSync(testFile, 'const x = 1;'); // Simple test file

      const command = new ReviewCommand();

      // Should not throw
      await expect(command.execute('file', testFile)).resolves.not.toThrow();
    } finally {
      await fixture.cleanup();
    }
  });
});
