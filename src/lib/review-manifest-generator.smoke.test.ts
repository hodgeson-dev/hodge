import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ReviewManifestGenerator } from './review-manifest-generator.js';
import type { GitDiffResult } from './git-diff-analyzer.js';
import type { TierRecommendation } from './review-tier-classifier.js';

describe('ReviewManifestGenerator - Smoke Tests', () => {
  smokeTest('should generate complete manifest structure', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/foo.ts', linesAdded: 10, linesDeleted: 5, linesChanged: 15 },
    ];
    const recommendation: TierRecommendation = {
      tier: 'standard',
      reason: 'Implementation changes: 1 file, 15 lines',
      metrics: {
        totalFiles: 1,
        totalLines: 15,
        fileTypeBreakdown: { implementation: 1, test: 0, documentation: 0, config: 0 },
        hasCriticalPaths: false,
      },
    };

    const manifest = generator.generateManifest('HODGE-337', changes, recommendation);

    expect(manifest.version).toBe('1.0');
    expect(manifest.feature).toBe('HODGE-337');
    expect(manifest.recommended_tier).toBe('standard');
    expect(manifest.change_analysis.total_files).toBe(1);
    expect(manifest.change_analysis.total_lines).toBe(15);
    expect(manifest.changed_files).toHaveLength(1);
    expect(manifest.changed_files[0].path).toBe('src/foo.ts');
    expect(manifest.context.project_standards).toBeDefined();
    expect(manifest.context.project_principles).toBeDefined();
  });

  smokeTest('should filter relevant patterns based on changed files', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/foo.test.ts', linesAdded: 20, linesDeleted: 10, linesChanged: 30 },
    ];

    const patterns = generator.filterRelevantPatterns(changes);

    // Should include test-pattern.md for test files
    expect(patterns).toContain('test-pattern.md');
  });

  smokeTest('should filter relevant profiles based on changed files', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/lib/feature.ts', linesAdded: 50, linesDeleted: 20, linesChanged: 70 },
    ];

    const profiles = generator.filterRelevantProfiles(changes);

    // Should include TypeScript and general profiles
    expect(profiles.length).toBeGreaterThan(0);
  });

  smokeTest('should include decisions.md only for FULL tier', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/commands/harden.ts', linesAdded: 100, linesDeleted: 50, linesChanged: 150 },
    ];

    // STANDARD tier - no decisions
    const standardRec: TierRecommendation = {
      tier: 'standard',
      reason: 'Implementation changes',
      metrics: {
        totalFiles: 1,
        totalLines: 150,
        fileTypeBreakdown: { implementation: 1, test: 0, documentation: 0, config: 0 },
        hasCriticalPaths: false,
      },
    };
    const standardManifest = generator.generateManifest('TEST', changes, standardRec);
    expect(standardManifest.context.project_decisions).toBeUndefined();

    // FULL tier - includes decisions
    const fullRec: TierRecommendation = {
      tier: 'full',
      reason: 'Critical path changes',
      metrics: {
        totalFiles: 1,
        totalLines: 150,
        fileTypeBreakdown: { implementation: 1, test: 0, documentation: 0, config: 0 },
        hasCriticalPaths: true,
      },
    };
    const fullManifest = generator.generateManifest('TEST', changes, fullRec);
    expect(fullManifest.context.project_decisions).toBeDefined();
  });

  smokeTest('should categorize changed files by type', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/foo.ts', linesAdded: 10, linesDeleted: 5, linesChanged: 15 },
      { path: 'src/foo.test.ts', linesAdded: 20, linesDeleted: 10, linesChanged: 30 },
      { path: 'README.md', linesAdded: 5, linesDeleted: 2, linesChanged: 7 },
      { path: 'package.json', linesAdded: 2, linesDeleted: 1, linesChanged: 3 },
    ];
    const recommendation: TierRecommendation = {
      tier: 'standard',
      reason: 'Mixed changes',
      metrics: {
        totalFiles: 4,
        totalLines: 55,
        fileTypeBreakdown: { implementation: 1, test: 1, documentation: 1, config: 1 },
        hasCriticalPaths: false,
      },
    };

    const manifest = generator.generateManifest('TEST', changes, recommendation);

    expect(manifest.changed_files).toHaveLength(4);
    expect(manifest.changed_files.find((f) => f.path === 'src/foo.ts')?.change_type).toBe(
      'implementation'
    );
    expect(manifest.changed_files.find((f) => f.path === 'src/foo.test.ts')?.change_type).toBe(
      'test'
    );
    expect(manifest.changed_files.find((f) => f.path === 'README.md')?.change_type).toBe(
      'documentation'
    );
    expect(manifest.changed_files.find((f) => f.path === 'package.json')?.change_type).toBe(
      'config'
    );
  });

  smokeTest('should only include profiles matching installed version', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/foo.test.ts', linesAdded: 20, linesDeleted: 10, linesChanged: 30 },
    ];

    const profiles = generator.filterRelevantProfiles(changes);

    // Should include vitest-3.x.yaml (project has vitest: ^3.2.4) - HODGE-341.4: YAML format
    expect(profiles).toContain('testing/vitest-3.x.yaml');

    // Should NOT include other vitest versions
    expect(profiles).not.toContain('testing/vitest-1.x.yaml');
    expect(profiles).not.toContain('testing/vitest-0.34+.yaml');
  });

  smokeTest('should filter TypeScript profiles by version', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/lib/feature.ts', linesAdded: 50, linesDeleted: 20, linesChanged: 70 },
    ];

    const profiles = generator.filterRelevantProfiles(changes);

    // Should include typescript-5.x.yaml (project has typescript: ^5.3.3) - HODGE-341.4: YAML format
    expect(profiles).toContain('languages/typescript-5.x.yaml');

    // Should NOT include typescript-4.x.yaml
    expect(profiles).not.toContain('languages/typescript-4.x.yaml');
  });

  smokeTest('should include general profiles regardless of version', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/lib/feature.ts', linesAdded: 50, linesDeleted: 20, linesChanged: 70 },
      { path: 'src/lib/feature.test.ts', linesAdded: 30, linesDeleted: 10, linesChanged: 40 },
    ];

    const profiles = generator.filterRelevantProfiles(changes);

    // Should always include general profiles (no version_range in meta) - HODGE-341.4: YAML format
    expect(profiles).toContain('languages/general-coding-standards.yaml');
    expect(profiles).toContain('testing/general-test-standards.yaml');
  });

  // HODGE-344.2: File list and scope metadata tests
  smokeTest('should accept explicit file list with scope metadata', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/lib/test.ts', linesAdded: 10, linesDeleted: 5, linesChanged: 15 },
    ];
    const recommendation: TierRecommendation = {
      tier: 'quick',
      reason: 'Single file change',
      metrics: {
        totalFiles: 1,
        totalLines: 15,
        fileTypeBreakdown: { implementation: 1, test: 0, documentation: 0, config: 0 },
        hasCriticalPaths: false,
      },
    };

    const manifest = generator.generateManifest('TEST-001', changes, recommendation, {
      fileList: ['src/lib/test.ts'],
      scope: {
        type: 'file',
        target: 'src/lib/test.ts',
      },
    });

    expect(manifest.scope).toBeDefined();
    expect(manifest.scope?.type).toBe('file');
    expect(manifest.scope?.target).toBe('src/lib/test.ts');
    expect(manifest.scope?.fileCount).toBe(1);
  });

  smokeTest('should track directory scope metadata', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/lib/a.ts', linesAdded: 10, linesDeleted: 5, linesChanged: 15 },
      { path: 'src/lib/b.ts', linesAdded: 20, linesDeleted: 10, linesChanged: 30 },
    ];
    const recommendation: TierRecommendation = {
      tier: 'standard',
      reason: 'Directory changes',
      metrics: {
        totalFiles: 2,
        totalLines: 45,
        fileTypeBreakdown: { implementation: 2, test: 0, documentation: 0, config: 0 },
        hasCriticalPaths: false,
      },
    };

    const manifest = generator.generateManifest('TEST-002', changes, recommendation, {
      fileList: ['src/lib/a.ts', 'src/lib/b.ts'],
      scope: {
        type: 'directory',
        target: 'src/lib/',
      },
    });

    expect(manifest.scope?.type).toBe('directory');
    expect(manifest.scope?.target).toBe('src/lib/');
    expect(manifest.scope?.fileCount).toBe(2);
  });

  smokeTest('should track commits scope metadata', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/a.ts', linesAdded: 10, linesDeleted: 5, linesChanged: 15 },
    ];
    const recommendation: TierRecommendation = {
      tier: 'standard',
      reason: 'Recent commits',
      metrics: {
        totalFiles: 1,
        totalLines: 15,
        fileTypeBreakdown: { implementation: 1, test: 0, documentation: 0, config: 0 },
        hasCriticalPaths: false,
      },
    };

    const manifest = generator.generateManifest('TEST-003', changes, recommendation, {
      fileList: ['src/a.ts'],
      scope: {
        type: 'commits',
        target: '5',
      },
    });

    expect(manifest.scope?.type).toBe('commits');
    expect(manifest.scope?.target).toBe('5');
  });

  smokeTest('should not include scope metadata when file list not provided', () => {
    const generator = new ReviewManifestGenerator();
    const changes: GitDiffResult[] = [
      { path: 'src/lib/test.ts', linesAdded: 10, linesDeleted: 5, linesChanged: 15 },
    ];
    const recommendation: TierRecommendation = {
      tier: 'quick',
      reason: 'Single file change',
      metrics: {
        totalFiles: 1,
        totalLines: 15,
        fileTypeBreakdown: { implementation: 1, test: 0, documentation: 0, config: 0 },
        hasCriticalPaths: false,
      },
    };

    const manifest = generator.generateManifest('TEST-004', changes, recommendation);

    // No file list provided = feature-based review (backward compatibility)
    expect(manifest.scope).toBeUndefined();
  });
});
