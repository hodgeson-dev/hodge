/**
 * Integration tests for AutoDetectionService
 *
 * Tests end-to-end detection logic with real file system operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AutoDetectionService } from './auto-detection-service.js';
import { integrationTest } from '../test/helpers.js';
import type { ProfileEntry } from './profile-discovery-service.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('AutoDetectionService Integration', () => {
  let tempDir: string;
  let service: AutoDetectionService;

  beforeEach(async () => {
    // Create isolated temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-auto-detection-test-'));
    service = new AutoDetectionService(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tempDir);
  });

  integrationTest('should detect profiles using file-based detection rules', async () => {
    // Create tsconfig.json
    await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}');

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/typescript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          files: ['tsconfig.json'],
          match: 'any',
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(true);
    expect(results[0].reason).toContain('tsconfig.json');
  });

  integrationTest('should detect profiles using dependency-based detection rules', async () => {
    // Create package.json with react dependency
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^18.0.0',
        },
      })
    );

    const profiles: ProfileEntry[] = [
      {
        path: 'frameworks/react.md',
        frontmatter: {
          scope: 'reusable',
          type: 'framework',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          dependencies: ['react'],
          match: 'any',
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(true);
    expect(results[0].reason).toContain('react');
  });

  integrationTest('should detect profiles using applies_to glob patterns', async () => {
    // Create TypeScript files
    await fs.writeFile(path.join(tempDir, 'index.ts'), 'export const foo = 1;');
    await fs.ensureDir(path.join(tempDir, 'src'));
    await fs.writeFile(path.join(tempDir, 'src', 'main.ts'), 'console.log("hi");');

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/typescript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          applies_to: ['**/*.ts'],
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        // No explicit detection rules - should fall back to applies_to
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(true);
    expect(results[0].reason).toContain('**/*.ts');
    expect(results[0].reason).toContain('2 file'); // Found 2 .ts files
  });

  integrationTest('should handle "match: all" logic (AND)', async () => {
    // Create both files required
    await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}');
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ dependencies: { typescript: '^5.0.0' } })
    );

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/typescript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          files: ['tsconfig.json'],
          dependencies: ['typescript'],
          match: 'all', // Both conditions must match
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(true);
  });

  integrationTest('should fail "match: all" when one condition is missing', async () => {
    // Create only tsconfig.json, not the dependency
    await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}');

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/typescript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          files: ['tsconfig.json'],
          dependencies: ['typescript'],
          match: 'all',
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(false);
    expect(results[0].reason).toContain('Failed');
  });

  integrationTest('should handle "match: any" logic (OR)', async () => {
    // Create only one of the required conditions
    await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}');

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/typescript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          files: ['tsconfig.json'],
          dependencies: ['typescript'], // This won't be found
          match: 'any', // Only one needs to match
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(true);
    expect(results[0].reason).toContain('tsconfig.json');
  });

  integrationTest('should check devDependencies in addition to dependencies', async () => {
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({
        devDependencies: {
          vitest: '^1.0.0',
        },
      })
    );

    const profiles: ProfileEntry[] = [
      {
        path: 'testing/vitest.md',
        frontmatter: {
          scope: 'reusable',
          type: 'testing',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          dependencies: ['vitest'],
          match: 'any',
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(true);
    expect(results[0].reason).toContain('vitest');
  });

  integrationTest('should not detect when no conditions match', async () => {
    // Empty project - no files, no package.json

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/typescript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          files: ['tsconfig.json'],
          dependencies: ['typescript'],
          match: 'any',
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(false);
    expect(results[0].reason).toContain('No matches found');
  });

  integrationTest('should handle projects without package.json gracefully', async () => {
    // Create a file-based detection (no package.json needed)
    await fs.writeFile(path.join(tempDir, 'go.mod'), 'module example');

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/go.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          files: ['go.mod'],
          match: 'any',
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(1);
    expect(results[0].detected).toBe(true);
    expect(results[0].reason).toContain('go.mod');
  });

  integrationTest('should handle multiple profiles and return all results', async () => {
    // Create files for multiple technologies
    await fs.writeFile(path.join(tempDir, 'index.ts'), 'export const foo = 1;');
    await fs.writeFile(path.join(tempDir, 'index.js'), 'export const bar = 2;');
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^18.0.0' },
        devDependencies: { vitest: '^1.0.0' },
      })
    );

    const profiles: ProfileEntry[] = [
      {
        path: 'languages/typescript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          applies_to: ['**/*.ts'],
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
      },
      {
        path: 'languages/javascript.md',
        frontmatter: {
          scope: 'reusable',
          type: 'language',
          applies_to: ['**/*.js'],
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
      },
      {
        path: 'frameworks/react.md',
        frontmatter: {
          scope: 'reusable',
          type: 'framework',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          dependencies: ['react'],
          match: 'any',
        },
      },
      {
        path: 'testing/vitest.md',
        frontmatter: {
          scope: 'reusable',
          type: 'testing',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        detection: {
          dependencies: ['vitest'],
          match: 'any',
        },
      },
    ];

    const results = await service.detectProfiles(profiles);

    expect(results).toHaveLength(4);
    expect(results.filter((r) => r.detected)).toHaveLength(4);
  });

  integrationTest('should skip profiles without detection rules or applies_to', async () => {
    const profiles: ProfileEntry[] = [
      {
        path: 'general/no-detection.md',
        frontmatter: {
          scope: 'reusable',
          type: 'general',
          version: '1.0.0',
          frontmatter_version: '1.0.0',
          maintained_by: 'test',
        },
        // No detection rules, no applies_to
      },
    ];

    const results = await service.detectProfiles(profiles);

    // Should return empty array (profile was skipped)
    expect(results).toHaveLength(0);
  });
});
