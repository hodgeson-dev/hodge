/**
 * Sub-Feature Context Service - Smoke Tests
 *
 * Quick sanity checks for sub-feature detection and context loading.
 */

import { describe, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SubFeatureContextService } from './sub-feature-context-service.js';
import { smokeTest } from '../test/helpers.js';

describe('SubFeatureContextService', () => {
  smokeTest('detects sub-feature pattern correctly', () => {
    const service = new SubFeatureContextService();

    const result = service.detectSubFeature('HODGE-333.1');

    expect(result.isSubFeature).toBe(true);
    expect(result.parent).toBe('HODGE-333');
  });

  smokeTest('handles non-sub-features correctly', () => {
    const service = new SubFeatureContextService();

    const result = service.detectSubFeature('HODGE-333');

    expect(result.isSubFeature).toBe(false);
    expect(result.parent).toBeUndefined();
  });

  smokeTest('rejects invalid patterns', () => {
    const service = new SubFeatureContextService();

    // Grandchildren not supported yet
    const result = service.detectSubFeature('HODGE-333.1.1');

    expect(result.isSubFeature).toBe(false);
  });

  smokeTest('finds shipped siblings with valid ship records', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      // Create feature structure
      const featuresDir = join(tempDir, '.hodge', 'features');
      const sibling1Dir = join(featuresDir, 'HODGE-333.1');
      const sibling2Dir = join(featuresDir, 'HODGE-333.2');

      mkdirSync(sibling1Dir, { recursive: true });
      mkdirSync(sibling2Dir, { recursive: true });

      // Create valid ship records
      writeFileSync(
        join(sibling1Dir, 'ship-record.json'),
        JSON.stringify({
          feature: 'HODGE-333.1',
          validationPassed: true,
          commitMessage: 'feat: sibling 1',
          shipChecks: { tests: true, coverage: true, docs: true, changelog: true },
        })
      );

      writeFileSync(
        join(sibling2Dir, 'ship-record.json'),
        JSON.stringify({
          feature: 'HODGE-333.2',
          validationPassed: true,
          commitMessage: 'feat: sibling 2',
          shipChecks: { tests: true, coverage: true, docs: true, changelog: true },
        })
      );

      const service = new SubFeatureContextService(tempDir);
      const siblings = service.findShippedSiblings('HODGE-333');

      expect(siblings).toHaveLength(2);
      expect(siblings[0].feature).toBe('HODGE-333.1');
      expect(siblings[1].feature).toBe('HODGE-333.2');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('excludes siblings with invalid ship records', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      const featuresDir = join(tempDir, '.hodge', 'features');
      const sibling1Dir = join(featuresDir, 'HODGE-333.1');
      const sibling2Dir = join(featuresDir, 'HODGE-333.2');

      mkdirSync(sibling1Dir, { recursive: true });
      mkdirSync(sibling2Dir, { recursive: true });

      // Sibling 1: valid
      writeFileSync(
        join(sibling1Dir, 'ship-record.json'),
        JSON.stringify({
          feature: 'HODGE-333.1',
          validationPassed: true,
          commitMessage: 'feat: sibling 1',
        })
      );

      // Sibling 2: validation failed
      writeFileSync(
        join(sibling2Dir, 'ship-record.json'),
        JSON.stringify({
          feature: 'HODGE-333.2',
          validationPassed: false,
          commitMessage: 'feat: sibling 2',
        })
      );

      const service = new SubFeatureContextService(tempDir);
      const siblings = service.findShippedSiblings('HODGE-333');

      expect(siblings).toHaveLength(1);
      expect(siblings[0].feature).toBe('HODGE-333.1');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('excludes siblings specified by user', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      const featuresDir = join(tempDir, '.hodge', 'features');
      const sibling1Dir = join(featuresDir, 'HODGE-333.1');
      const sibling2Dir = join(featuresDir, 'HODGE-333.2');

      mkdirSync(sibling1Dir, { recursive: true });
      mkdirSync(sibling2Dir, { recursive: true });

      writeFileSync(
        join(sibling1Dir, 'ship-record.json'),
        JSON.stringify({ feature: 'HODGE-333.1', validationPassed: true, commitMessage: '' })
      );

      writeFileSync(
        join(sibling2Dir, 'ship-record.json'),
        JSON.stringify({ feature: 'HODGE-333.2', validationPassed: true, commitMessage: '' })
      );

      const service = new SubFeatureContextService(tempDir);
      const siblings = service.findShippedSiblings('HODGE-333', ['333.1']);

      expect(siblings).toHaveLength(1);
      expect(siblings[0].feature).toBe('HODGE-333.2');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('handles parent with zero shipped siblings', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      mkdirSync(join(tempDir, '.hodge', 'features'), { recursive: true });

      const service = new SubFeatureContextService(tempDir);
      const siblings = service.findShippedSiblings('HODGE-999');

      expect(siblings).toHaveLength(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('builds file manifest for parent and siblings', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      // Create parent files
      const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
      mkdirSync(join(parentDir, 'explore'), { recursive: true });
      writeFileSync(join(parentDir, 'explore', 'exploration.md'), '# Parent exploration');
      writeFileSync(join(parentDir, 'decisions.md'), '# Parent decisions');

      // Create sibling with ship record
      const siblingDir = join(tempDir, '.hodge', 'features', 'HODGE-333.1');
      mkdirSync(siblingDir, { recursive: true });
      writeFileSync(
        join(siblingDir, 'ship-record.json'),
        JSON.stringify({
          feature: 'HODGE-333.1',
          validationPassed: true,
          timestamp: '2025-10-05T00:00:00Z',
          commitMessage: 'test',
        })
      );

      // Create lesson file
      const lessonsDir = join(tempDir, '.hodge', 'lessons');
      mkdirSync(lessonsDir, { recursive: true });
      writeFileSync(join(lessonsDir, 'HODGE-333.1-test.md'), '# Lessons');

      const service = new SubFeatureContextService(tempDir);
      const manifest = service.buildFileManifest('HODGE-333');

      expect(manifest).not.toBeNull();
      expect(manifest?.parent?.feature).toBe('HODGE-333');
      expect(manifest?.parent?.files).toHaveLength(2);
      expect(manifest?.siblings).toHaveLength(1);
      expect(manifest?.siblings[0].feature).toBe('HODGE-333.1');
      expect(manifest?.siblings[0].files).toHaveLength(2); // ship-record + lessons
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('returns null manifest when no parent or siblings exist', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      mkdirSync(join(tempDir, '.hodge', 'features'), { recursive: true });

      const service = new SubFeatureContextService(tempDir);
      const manifest = service.buildFileManifest('HODGE-999');

      expect(manifest).toBeNull();
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('includes precedence and metadata in file entries', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hodge-test-'));

    try {
      const parentDir = join(tempDir, '.hodge', 'features', 'HODGE-333');
      mkdirSync(join(parentDir, 'explore'), { recursive: true });
      writeFileSync(join(parentDir, 'explore', 'exploration.md'), '# Test');

      const service = new SubFeatureContextService(tempDir);
      const manifest = service.buildFileManifest('HODGE-333');

      expect(manifest?.parent?.files[0].precedence).toBe(1);
      expect(manifest?.parent?.files[0].type).toBe('exploration');
      expect(manifest?.suggestedReadingOrder).toContain('parent exploration');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
