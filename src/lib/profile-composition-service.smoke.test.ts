/**
 * Smoke tests for ProfileCompositionService
 *
 * Quick sanity checks that the service can compose review context
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileCompositionService } from './profile-composition-service.js';
import { smokeTest } from '../test/helpers.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('ProfileCompositionService - Smoke Tests', () => {
  let tmpDir: string;

  beforeEach(async () => {
    // Create isolated temp directory for each test
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-composition-test-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tmpDir);
  });

  smokeTest('can instantiate service', () => {
    const service = new ProfileCompositionService(tmpDir);
    expect(service).toBeDefined();
  });

  smokeTest('composeReviewContext does not crash with minimal setup', async () => {
    // Create minimal .hodge structure
    const hodgeDir = path.join(tmpDir, '.hodge');
    await fs.ensureDir(hodgeDir);

    // Create empty standards and principles
    await fs.writeFile(path.join(hodgeDir, 'standards.md'), '# Standards\n');
    await fs.writeFile(path.join(hodgeDir, 'principles.md'), '# Principles\n');

    // Create minimal review-config.md
    await fs.writeFile(
      path.join(hodgeDir, 'review-config.md'),
      `---
version: "1.0.0"
---

# Review Configuration

## Active Profiles

### General
- \`general-coding-standards\` - Universal coding standards
`
    );

    // Create minimal profile
    const reviewProfilesDir = path.join(hodgeDir, 'review-profiles');
    await fs.ensureDir(reviewProfilesDir);
    await fs.writeFile(
      path.join(reviewProfilesDir, 'general-coding-standards.md'),
      `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
name: General Coding Standards
description: Universal coding standards
applies_to: ["**/*"]
version: "1.0.0"
---

# General Coding Standards

## Test Rule
**Enforcement: SUGGESTED** | **Severity: WARNING**
This is a test rule.
`
    );

    const service = new ProfileCompositionService(tmpDir);
    const result = service.composeReviewContext();

    expect(result).toBeDefined();
    expect(result.content).toBeTruthy();
  });

  smokeTest('handles missing review-config.md gracefully', async () => {
    // Create minimal .hodge structure without review-config.md
    const hodgeDir = path.join(tmpDir, '.hodge');
    await fs.ensureDir(hodgeDir);
    await fs.writeFile(path.join(hodgeDir, 'standards.md'), '# Standards\n');
    await fs.writeFile(path.join(hodgeDir, 'principles.md'), '# Principles\n');

    // Create default profile directory
    const reviewProfilesDir = path.join(hodgeDir, 'review-profiles');
    await fs.ensureDir(reviewProfilesDir);
    await fs.writeFile(
      path.join(reviewProfilesDir, 'general-coding-standards.md'),
      `---
frontmatter_version: "1.0.0"
scope: reusable
name: General Coding Standards
description: Universal coding standards
applies_to: ["**/*"]
version: "1.0.0"
---

# General Coding Standards

## Test Rule
**Enforcement: SUGGESTED** | **Severity: WARNING**
Test rule content.
`
    );

    const service = new ProfileCompositionService(tmpDir);

    // Should not throw, should fall back to default profile
    expect(() => service.composeReviewContext()).not.toThrow();
  });

  smokeTest('includes precedence rules in output', async () => {
    // Create minimal setup
    const hodgeDir = path.join(tmpDir, '.hodge');
    await fs.ensureDir(hodgeDir);
    await fs.writeFile(path.join(hodgeDir, 'standards.md'), '# Standards\n');
    await fs.writeFile(path.join(hodgeDir, 'principles.md'), '# Principles\n');

    const reviewProfilesDir = path.join(hodgeDir, 'review-profiles');
    await fs.ensureDir(reviewProfilesDir);
    await fs.writeFile(
      path.join(reviewProfilesDir, 'general-coding-standards.md'),
      `---
frontmatter_version: "1.0.0"
scope: reusable
name: General Coding Standards
description: Universal coding standards
applies_to: ["**/*"]
version: "1.0.0"
---

# General Coding Standards
## Test Rule
Test content.
`
    );

    await fs.writeFile(
      path.join(hodgeDir, 'review-config.md'),
      `## Active Profiles
- \`general-coding-standards\` - Test
`
    );

    const service = new ProfileCompositionService(tmpDir);
    const result = service.composeReviewContext();

    // Should include precedence header
    expect(result.content).toContain('REVIEW CONTEXT - PRECEDENCE RULES');
    expect(result.content).toContain('PROJECT STANDARD wins');
  });

  smokeTest('returns metadata structure', async () => {
    // Create minimal setup
    const hodgeDir = path.join(tmpDir, '.hodge');
    await fs.ensureDir(hodgeDir);
    await fs.writeFile(path.join(hodgeDir, 'standards.md'), '# Standards\n');
    await fs.writeFile(path.join(hodgeDir, 'principles.md'), '# Principles\n');

    const service = new ProfileCompositionService(tmpDir);
    const result = service.composeReviewContext();

    // Should return proper metadata structure
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('profilesLoaded');
    expect(result).toHaveProperty('profilesMissing');
    expect(result).toHaveProperty('projectContextComplete');
    expect(typeof result.content).toBe('string');
    expect(Array.isArray(result.profilesLoaded)).toBe(true);
    expect(Array.isArray(result.profilesMissing)).toBe(true);
  });
});
