import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ReviewTierClassifier } from './review-tier-classifier.js';
import type { GitDiffResult } from './git-diff-analyzer.js';

describe('ReviewTierClassifier - Smoke Tests', () => {
  smokeTest('should classify test-only changes as QUICK', () => {
    const classifier = new ReviewTierClassifier();
    const changes: GitDiffResult[] = [
      { path: 'src/foo.test.ts', linesAdded: 20, linesDeleted: 10, linesChanged: 30 },
    ];

    const result = classifier.classifyChanges(changes);

    expect(result.tier).toBe('quick');
    expect(result.metrics.totalFiles).toBe(1);
    expect(result.metrics.totalLines).toBe(30);
  });

  smokeTest('should classify critical path changes as FULL', () => {
    const classifier = new ReviewTierClassifier();
    const changes: GitDiffResult[] = [
      { path: 'src/commands/harden.ts', linesAdded: 5, linesDeleted: 2, linesChanged: 7 },
    ];

    const result = classifier.classifyChanges(changes);

    expect(result.tier).toBe('full');
    expect(result.reason).toContain('Critical path');
  });

  smokeTest('should classify large file count as FULL', () => {
    const classifier = new ReviewTierClassifier();
    const changes: GitDiffResult[] = Array.from({ length: 15 }, (_, i) => ({
      path: `src/file${i}.ts`,
      linesAdded: 10,
      linesDeleted: 5,
      linesChanged: 15,
    }));

    const result = classifier.classifyChanges(changes);

    expect(result.tier).toBe('full');
    expect(result.metrics.totalFiles).toBe(15);
  });

  smokeTest('should detect file types from review profile patterns', () => {
    const classifier = new ReviewTierClassifier();

    // Should match testing profile applies_to patterns
    const testType = classifier.analyzeFileType('src/foo.test.ts');
    expect(testType).toBe('test');

    // Should match implementation files
    const implType = classifier.analyzeFileType('src/lib/feature.ts');
    expect(implType).toBe('implementation');

    // Should detect documentation
    const docType = classifier.analyzeFileType('README.md');
    expect(docType).toBe('documentation');
  });

  smokeTest('should identify critical paths from config', () => {
    const classifier = new ReviewTierClassifier();

    expect(classifier.isCriticalPath('src/commands/harden.ts')).toBe(true);
    expect(classifier.isCriticalPath('src/lib/core/engine.ts')).toBe(true);
    expect(classifier.isCriticalPath('.hodge/standards.md')).toBe(true);
    expect(classifier.isCriticalPath('.claude/commands/harden.md')).toBe(true);
    expect(classifier.isCriticalPath('src/lib/util.ts')).toBe(false);
  });
});
