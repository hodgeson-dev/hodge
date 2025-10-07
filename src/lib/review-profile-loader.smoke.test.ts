/**
 * Review Profile Loader - Smoke Tests
 *
 * Quick sanity checks for markdown profile loading.
 */

import { describe, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ReviewProfileLoader } from './review-profile-loader.js';
import { smokeTest } from '../test/helpers.js';

describe('ReviewProfileLoader', () => {
  smokeTest('loads valid markdown profile', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));
    const profilesDir = join(tempDir, '.hodge', 'review-profiles');

    try {
      // Create profile directory
      mkdirSync(profilesDir, { recursive: true });
      writeFileSync(
        join(profilesDir, 'test-profile.md'),
        `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
name: Test Profile
description: A test profile for smoke testing
applies_to:
  - "**/*.ts"
---

## First Criteria

Some guidance here.

## Second Criteria

More guidance.
`
      );

      const loader = new ReviewProfileLoader(tempDir);
      const profile = loader.loadProfile('test-profile');

      expect(profile.name).toBe('Test Profile');
      expect(profile.description).toBe('A test profile for smoke testing');
      expect(profile.criteria_count).toBe(2);
      expect(profile.version).toBe('1.0.0');
      expect(profile.scope).toBe('reusable');
      expect(profile.content).toContain('First Criteria');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('throws error when profile not found', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      const loader = new ReviewProfileLoader(tempDir);

      expect(() => loader.loadProfile('nonexistent')).toThrow('Profile not found');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('uses filename as fallback when name not in frontmatter', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));
    const profilesDir = join(tempDir, '.hodge', 'review-profiles');

    try {
      mkdirSync(profilesDir, { recursive: true });
      writeFileSync(
        join(profilesDir, 'my-profile.md'),
        `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
description: Profile without name field
---

## Criteria
`
      );

      const loader = new ReviewProfileLoader(tempDir);
      const profile = loader.loadProfile('my-profile');

      expect(profile.name).toBe('my-profile');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('throws error when description missing from frontmatter', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));
    const profilesDir = join(tempDir, '.hodge', 'review-profiles');

    try {
      mkdirSync(profilesDir, { recursive: true });
      writeFileSync(
        join(profilesDir, 'bad-profile.md'),
        `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
---

## Criteria
`
      );

      const loader = new ReviewProfileLoader(tempDir);

      expect(() => loader.loadProfile('bad-profile')).toThrow(
        'missing required frontmatter field: description'
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('uses default applies_to when not specified', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));
    const profilesDir = join(tempDir, '.hodge', 'review-profiles');

    try {
      mkdirSync(profilesDir, { recursive: true });
      writeFileSync(
        join(profilesDir, 'universal.md'),
        `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
description: Universal profile
---

## Criteria
`
      );

      const loader = new ReviewProfileLoader(tempDir);
      const profile = loader.loadProfile('universal');

      expect(profile.applies_to).toEqual(['**/*']);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
