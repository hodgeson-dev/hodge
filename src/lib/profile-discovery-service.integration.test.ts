/**
 * Integration tests for ProfileDiscoveryService
 *
 * Tests end-to-end behavior with real file system operations
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { ProfileDiscoveryService } from './profile-discovery-service.js';
import { integrationTest } from '../test/helpers.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('ProfileDiscoveryService Integration', () => {
  let tempDir: string;
  let profilesDir: string;

  beforeEach(async () => {
    // Create isolated temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-profile-discovery-test-'));
    profilesDir = path.join(tempDir, 'review-profiles');
    await fs.ensureDir(profilesDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tempDir);
  });

  integrationTest('should discover profiles in nested directory structure', async () => {
    // Create profile structure
    await fs.ensureDir(path.join(profilesDir, 'languages'));
    await fs.ensureDir(path.join(profilesDir, 'frameworks'));

    await fs.writeFile(
      path.join(profilesDir, 'languages', 'typescript.md'),
      `---
scope: reusable
type: language
language: typescript
applies_to: ["**/*.ts"]
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: hodge-framework
---

# TypeScript
`
    );

    await fs.writeFile(
      path.join(profilesDir, 'frameworks', 'react.md'),
      `---
scope: reusable
type: framework
framework: react
applies_to: ["**/*.jsx"]
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: hodge-framework
detection:
  dependencies: ["react"]
  match: any
---

# React
`
    );

    const service = new ProfileDiscoveryService(profilesDir);
    const registry = await service.discoverProfiles();

    expect(registry.profiles).toHaveLength(2);
    expect(registry.profiles.map((p) => p.path)).toContain('languages/typescript.md');
    expect(registry.profiles.map((p) => p.path)).toContain('frameworks/react.md');
  });

  integrationTest('should correctly identify detectable vs non-detectable profiles', async () => {
    await fs.ensureDir(path.join(profilesDir, 'test'));

    // Profile WITH detection rules
    await fs.writeFile(
      path.join(profilesDir, 'test', 'with-detection.md'),
      `---
scope: reusable
type: test
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: test
detection:
  files: ["test.txt"]
  match: any
---

# Test
`
    );

    // Profile WITHOUT detection rules (uses applies_to)
    await fs.writeFile(
      path.join(profilesDir, 'test', 'without-detection.md'),
      `---
scope: reusable
type: test
applies_to: ["**/*.test.ts"]
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: test
---

# Test
`
    );

    const service = new ProfileDiscoveryService(profilesDir);
    const registry = await service.discoverProfiles();

    expect(registry.profiles).toHaveLength(2);
    expect(registry.detectableProfiles).toHaveLength(1);
    expect(registry.detectableProfiles[0].path).toBe('test/with-detection.md');
  });

  integrationTest('should gracefully handle malformed frontmatter', async () => {
    await fs.ensureDir(path.join(profilesDir, 'test'));

    // Valid profile
    await fs.writeFile(
      path.join(profilesDir, 'test', 'valid.md'),
      `---
scope: reusable
type: test
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: test
---

# Valid
`
    );

    // Malformed profile (missing required fields)
    await fs.writeFile(
      path.join(profilesDir, 'test', 'malformed.md'),
      `---
scope: reusable
---

# Malformed
`
    );

    const service = new ProfileDiscoveryService(profilesDir);
    const registry = await service.discoverProfiles();

    // Should only include valid profile, skip malformed
    expect(registry.profiles).toHaveLength(1);
    expect(registry.profiles[0].path).toBe('test/valid.md');
  });

  integrationTest(
    'should return empty registry when profiles directory does not exist',
    async () => {
      const nonExistentDir = path.join(tempDir, 'nonexistent');

      const service = new ProfileDiscoveryService(nonExistentDir);
      const registry = await service.discoverProfiles();

      expect(registry.profiles).toHaveLength(0);
      expect(registry.detectableProfiles).toHaveLength(0);
    }
  );

  integrationTest('should parse frontmatter correctly with all fields', async () => {
    await fs.ensureDir(path.join(profilesDir, 'test'));

    await fs.writeFile(
      path.join(profilesDir, 'test', 'complete.md'),
      `---
scope: reusable
type: language
language: rust
applies_to: ["**/*.rs"]
version: "2.1.0"
frontmatter_version: "1.0.0"
maintained_by: community
name: "Rust Best Practices"
description: "Guidelines for Rust development"
detection:
  files: ["Cargo.toml"]
  dependencies: ["rustc"]
  match: all
---

# Rust Best Practices
`
    );

    const service = new ProfileDiscoveryService(profilesDir);
    const registry = await service.discoverProfiles();

    expect(registry.profiles).toHaveLength(1);
    const profile = registry.profiles[0];

    expect(profile.frontmatter.scope).toBe('reusable');
    expect(profile.frontmatter.type).toBe('language');
    expect(profile.frontmatter.version).toBe('2.1.0');
    expect(profile.frontmatter.name).toBe('Rust Best Practices');
    expect(profile.frontmatter.description).toBe('Guidelines for Rust development');
    expect(profile.detection?.files).toContain('Cargo.toml');
    expect(profile.detection?.dependencies).toContain('rustc');
    expect(profile.detection?.match).toBe('all');
  });

  integrationTest('should handle deeply nested directory structures', async () => {
    await fs.ensureDir(path.join(profilesDir, 'a', 'b', 'c'));

    await fs.writeFile(
      path.join(profilesDir, 'a', 'b', 'c', 'deep.md'),
      `---
scope: reusable
type: test
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: test
---

# Deep
`
    );

    const service = new ProfileDiscoveryService(profilesDir);
    const registry = await service.discoverProfiles();

    expect(registry.profiles).toHaveLength(1);
    expect(registry.profiles[0].path).toBe(path.join('a', 'b', 'c', 'deep.md'));
  });

  integrationTest('should only include .md files', async () => {
    await fs.ensureDir(path.join(profilesDir, 'test'));

    await fs.writeFile(
      path.join(profilesDir, 'test', 'profile.md'),
      `---
scope: reusable
type: test
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: test
---

# Profile
`
    );

    // Create non-.md files
    await fs.writeFile(path.join(profilesDir, 'test', 'readme.txt'), 'Not a profile');
    await fs.writeFile(path.join(profilesDir, 'test', 'config.json'), '{}');

    const service = new ProfileDiscoveryService(profilesDir);
    const registry = await service.discoverProfiles();

    expect(registry.profiles).toHaveLength(1);
    expect(registry.profiles[0].path).toBe('test/profile.md');
  });
});
