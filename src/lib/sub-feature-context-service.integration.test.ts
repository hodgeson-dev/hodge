/**
 * Sub-Feature Context Service - Integration Tests
 *
 * End-to-end tests with real file structures and complete workflows.
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SubFeatureContextService } from './sub-feature-context-service.js';
import { integrationTest } from '../test/helpers.js';

describe('SubFeatureContextService - Integration', () => {
  let tempDir: string;
  let service: SubFeatureContextService;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'hodge-integration-'));
    service = new SubFeatureContextService(tempDir);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  integrationTest('builds complete manifest with parent and multiple shipped siblings', () => {
    // Create parent feature with exploration and decisions
    const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
    mkdirSync(join(parentDir, 'explore'), { recursive: true });

    writeFileSync(
      join(parentDir, 'explore', 'exploration.md'),
      `# Exploration: HODGE-333

## Title
Unified Markdown Review Profiles

## Problem Statement
Need consistent review profile format across the codebase.

## Recommendation
Use unified markdown approach with gray-matter frontmatter parsing.
`
    );

    writeFileSync(
      join(parentDir, 'decisions.md'),
      `# Decisions for HODGE-333

## Decision 1: Use gray-matter
Date: 2025-10-05

We decided to use gray-matter library for frontmatter parsing.
`
    );

    // Create first shipped sibling
    const sibling1Dir = join(tempDir, '.hodge', 'features', 'HODGE-333.1');
    mkdirSync(sibling1Dir, { recursive: true });

    writeFileSync(
      join(sibling1Dir, 'ship-record.json'),
      JSON.stringify({
        feature: 'HODGE-333.1',
        timestamp: '2025-10-05T12:00:00Z',
        validationPassed: true,
        commitMessage: 'feat: add frontmatter-parser\n\nsrc/lib/frontmatter-parser.ts: New parser',
        shipChecks: { tests: true, coverage: true, docs: true, changelog: true },
      })
    );

    // Create lessons for first sibling
    const lessonsDir = join(tempDir, '.hodge', 'lessons');
    mkdirSync(lessonsDir, { recursive: true });

    writeFileSync(
      join(lessonsDir, 'HODGE-333.1-frontmatter-parsing.md'),
      `# Lessons: HODGE-333.1

Gray-matter is much simpler than AST parsing. Stick with simple solutions.
`
    );

    // Create second shipped sibling
    const sibling2Dir = join(tempDir, '.hodge', 'features', 'HODGE-333.2');
    mkdirSync(sibling2Dir, { recursive: true });

    writeFileSync(
      join(sibling2Dir, 'ship-record.json'),
      JSON.stringify({
        feature: 'HODGE-333.2',
        timestamp: '2025-10-06T08:30:00Z',
        validationPassed: true,
        commitMessage: 'feat: add markdown-utils',
        shipChecks: { tests: true, coverage: true, docs: true, changelog: true },
      })
    );

    // Build manifest
    const manifest = service.buildFileManifest('HODGE-333');

    // Verify structure
    expect(manifest).not.toBeNull();
    expect(manifest?.parent?.feature).toBe('HODGE-333');
    expect(manifest?.parent?.files).toHaveLength(2);

    // Verify parent files
    const explorationFile = manifest?.parent?.files.find((f) => f.type === 'exploration');
    expect(explorationFile?.precedence).toBe(1);
    expect(explorationFile?.path).toContain('exploration.md');

    const decisionsFile = manifest?.parent?.files.find((f) => f.type === 'decisions');
    expect(decisionsFile?.precedence).toBe(2);
    expect(decisionsFile?.path).toContain('decisions.md');

    // Verify siblings
    expect(manifest?.siblings).toHaveLength(2);
    expect(manifest?.siblings[0].feature).toBe('HODGE-333.1');
    expect(manifest?.siblings[1].feature).toBe('HODGE-333.2');

    // Verify sibling 1 files
    const sibling1ShipRecord = manifest?.siblings[0].files.find((f) => f.type === 'ship-record');
    expect(sibling1ShipRecord?.precedence).toBe(3);
    expect(sibling1ShipRecord?.timestamp).toBe('2025-10-05T12:00:00Z');

    const sibling1Lessons = manifest?.siblings[0].files.find((f) => f.type === 'lessons');
    expect(sibling1Lessons?.precedence).toBe(4);
    expect(sibling1Lessons?.path).toContain('HODGE-333.1-frontmatter-parsing.md');

    // Verify sibling 2 has ship record but no lessons
    expect(manifest?.siblings[1].files).toHaveLength(1);
    expect(manifest?.siblings[1].files[0].type).toBe('ship-record');

    // Verify suggested reading order
    expect(manifest?.suggestedReadingOrder).toContain('parent exploration');
    expect(manifest?.suggestedReadingOrder).toContain('sibling ship records');
  });

  integrationTest('excludes siblings correctly by feature ID', () => {
    // Create parent and two siblings
    const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
    mkdirSync(join(parentDir, 'explore'), { recursive: true });
    writeFileSync(join(parentDir, 'explore', 'exploration.md'), '# Parent');

    const sibling1Dir = join(tempDir, '.hodge', 'features', 'HODGE-333.1');
    mkdirSync(sibling1Dir, { recursive: true });
    writeFileSync(
      join(sibling1Dir, 'ship-record.json'),
      JSON.stringify({ feature: 'HODGE-333.1', validationPassed: true, timestamp: '2025-10-05' })
    );

    const sibling2Dir = join(tempDir, '.hodge', 'features', 'HODGE-333.2');
    mkdirSync(sibling2Dir, { recursive: true });
    writeFileSync(
      join(sibling2Dir, 'ship-record.json'),
      JSON.stringify({ feature: 'HODGE-333.2', validationPassed: true, timestamp: '2025-10-06' })
    );

    // Exclude HODGE-333.1 using short format
    const manifest = service.buildFileManifest('HODGE-333', ['333.1']);

    expect(manifest?.siblings).toHaveLength(1);
    expect(manifest?.siblings[0].feature).toBe('HODGE-333.2');
  });

  integrationTest('handles parent with only exploration (no decisions)', () => {
    const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
    mkdirSync(join(parentDir, 'explore'), { recursive: true });
    writeFileSync(join(parentDir, 'explore', 'exploration.md'), '# Exploration only');

    const manifest = service.buildFileManifest('HODGE-333');

    expect(manifest).not.toBeNull();
    expect(manifest?.parent?.files).toHaveLength(1);
    expect(manifest?.parent?.files[0].type).toBe('exploration');
  });

  integrationTest('handles siblings without lessons gracefully', () => {
    const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
    mkdirSync(join(parentDir, 'explore'), { recursive: true });
    writeFileSync(join(parentDir, 'explore', 'exploration.md'), '# Parent');

    const siblingDir = join(tempDir, '.hodge', 'features', 'HODGE-333.1');
    mkdirSync(siblingDir, { recursive: true });
    writeFileSync(
      join(siblingDir, 'ship-record.json'),
      JSON.stringify({ feature: 'HODGE-333.1', validationPassed: true, timestamp: '2025-10-05' })
    );

    const manifest = service.buildFileManifest('HODGE-333');

    expect(manifest?.siblings).toHaveLength(1);
    expect(manifest?.siblings[0].files).toHaveLength(1); // Only ship-record
    expect(manifest?.siblings[0].files[0].type).toBe('ship-record');
  });

  integrationTest('returns null when no parent or siblings exist', () => {
    mkdirSync(join(tempDir, '.hodge', 'features'), { recursive: true });

    const manifest = service.buildFileManifest('HODGE-999');

    expect(manifest).toBeNull();
  });

  integrationTest('handles only siblings without parent', () => {
    const siblingDir = join(tempDir, '.hodge', 'features', 'HODGE-333.1');
    mkdirSync(siblingDir, { recursive: true });
    writeFileSync(
      join(siblingDir, 'ship-record.json'),
      JSON.stringify({ feature: 'HODGE-333.1', validationPassed: true, timestamp: '2025-10-05' })
    );

    const manifest = service.buildFileManifest('HODGE-333');

    expect(manifest).not.toBeNull();
    expect(manifest?.parent).toBeUndefined();
    expect(manifest?.siblings).toHaveLength(1);
  });

  integrationTest('excludes siblings with failed validation', () => {
    const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
    mkdirSync(join(parentDir, 'explore'), { recursive: true });
    writeFileSync(join(parentDir, 'explore', 'exploration.md'), '# Parent');

    // Valid sibling
    const sibling1Dir = join(tempDir, '.hodge', 'features', 'HODGE-333.1');
    mkdirSync(sibling1Dir, { recursive: true });
    writeFileSync(
      join(sibling1Dir, 'ship-record.json'),
      JSON.stringify({ feature: 'HODGE-333.1', validationPassed: true, timestamp: '2025-10-05' })
    );

    // Invalid sibling (validation failed)
    const sibling2Dir = join(tempDir, '.hodge', 'features', 'HODGE-333.2');
    mkdirSync(sibling2Dir, { recursive: true });
    writeFileSync(
      join(sibling2Dir, 'ship-record.json'),
      JSON.stringify({ feature: 'HODGE-333.2', validationPassed: false, timestamp: '2025-10-06' })
    );

    const manifest = service.buildFileManifest('HODGE-333');

    expect(manifest?.siblings).toHaveLength(1);
    expect(manifest?.siblings[0].feature).toBe('HODGE-333.1');
  });

  integrationTest('sorts siblings alphabetically by feature name', () => {
    const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
    mkdirSync(join(parentDir, 'explore'), { recursive: true });
    writeFileSync(join(parentDir, 'explore', 'exploration.md'), '# Parent');

    // Create siblings out of order
    for (const num of [3, 1, 2]) {
      const siblingDir = join(tempDir, '.hodge', 'features', `HODGE-333.${num}`);
      mkdirSync(siblingDir, { recursive: true });
      writeFileSync(
        join(siblingDir, 'ship-record.json'),
        JSON.stringify({
          feature: `HODGE-333.${num}`,
          validationPassed: true,
          timestamp: `2025-10-0${num}`,
        })
      );
    }

    const manifest = service.buildFileManifest('HODGE-333');

    expect(manifest?.siblings).toHaveLength(3);
    expect(manifest?.siblings[0].feature).toBe('HODGE-333.1');
    expect(manifest?.siblings[1].feature).toBe('HODGE-333.2');
    expect(manifest?.siblings[2].feature).toBe('HODGE-333.3');
  });
});
