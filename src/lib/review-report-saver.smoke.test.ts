/**
 * Smoke tests for review report saver
 *
 * HODGE-344.2: Verify report saving to .hodge/reviews/
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { saveReviewReport, formatTimestamp, type ReviewReport } from './review-report-saver.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('formatTimestamp - Smoke Tests', () => {
  smokeTest('should format timestamp correctly', () => {
    const date = new Date('2025-10-14T05:30:45.000Z');
    const formatted = formatTimestamp(date);

    // Format: YYYY-MM-DD-HHMMSS
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}$/);
    expect(formatted).toContain('2025'); // year
    expect(formatted).toContain('30'); // minutes
    expect(formatted).toContain('45'); // seconds
  });

  smokeTest('should pad single digits', () => {
    const date = new Date('2025-01-05T01:02:03.000Z');
    const formatted = formatTimestamp(date);

    // Verify format: YYYY-MM-DD-HHMMSS with all single digits padded
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}$/);
    expect(formatted.split('-').length).toBe(4); // Year-Month-Day-Time
  });
});

describe('saveReviewReport - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let outputDir: string;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    await fixture.setup();
    outputDir = join(fixture.getPath(), '.hodge', 'reviews');
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  const mockReport: ReviewReport = {
    title: 'TEST-001',
    tier: 'QUICK',
    sections: {
      summary: '- 🚫 **0 Blockers**\n- ⚠️ **0 Warnings**\n- 💡 **0 Suggestions**',
      blockers: 'None found.',
      warnings: 'None found.',
      suggestions: 'None found.',
    },
  };

  smokeTest('should save report to specified directory', () => {
    const reportPath = saveReviewReport(mockReport, outputDir);

    expect(existsSync(reportPath)).toBe(true);
    expect(reportPath).toContain(outputDir);
  });

  smokeTest('should use timestamp-based naming', () => {
    const reportPath = saveReviewReport(mockReport, outputDir);
    const filename = reportPath.split('/').pop();

    expect(filename).toMatch(/^review-\d{4}-\d{2}-\d{2}-\d{6}\.md$/);
  });

  smokeTest('should create output directory if missing', () => {
    const reportPath = saveReviewReport(mockReport, outputDir);

    expect(existsSync(outputDir)).toBe(true);
    expect(existsSync(reportPath)).toBe(true);
  });

  smokeTest('should include report title in content', () => {
    const reportPath = saveReviewReport(mockReport, outputDir);
    const content = readFileSync(reportPath, 'utf-8');

    expect(content).toContain('# Code Review Report: TEST-001');
  });

  smokeTest('should include tier in content', () => {
    const reportPath = saveReviewReport(mockReport, outputDir);
    const content = readFileSync(reportPath, 'utf-8');

    expect(content).toContain('**Tier**: QUICK');
  });

  smokeTest('should include all sections', () => {
    const reportPath = saveReviewReport(mockReport, outputDir);
    const content = readFileSync(reportPath, 'utf-8');

    expect(content).toContain('## Summary');
    expect(content).toContain('## Critical Issues (BLOCKER)');
    expect(content).toContain('## Warnings (WARNING)');
    expect(content).toContain('## Suggestions (SUGGESTION)');
  });

  smokeTest('should include scope metadata when provided', () => {
    const reportWithScope: ReviewReport = {
      ...mockReport,
      scope: {
        type: 'file',
        target: 'src/lib/test.ts',
        fileCount: 1,
      },
    };

    const reportPath = saveReviewReport(reportWithScope, outputDir);
    const content = readFileSync(reportPath, 'utf-8');

    expect(content).toContain('**Scope**: File');
    expect(content).toContain('src/lib/test.ts');
    expect(content).toContain('1 file');
  });

  smokeTest('should handle directory scope', () => {
    const reportWithScope: ReviewReport = {
      ...mockReport,
      scope: {
        type: 'directory',
        target: 'src/lib/',
        fileCount: 42,
      },
    };

    const reportPath = saveReviewReport(reportWithScope, outputDir);
    const content = readFileSync(reportPath, 'utf-8');

    expect(content).toContain('**Scope**: Directory');
    expect(content).toContain('42 files');
  });

  smokeTest('should handle commits scope', () => {
    const reportWithScope: ReviewReport = {
      ...mockReport,
      scope: {
        type: 'commits',
        target: '5',
        fileCount: 10,
      },
    };

    const reportPath = saveReviewReport(reportWithScope, outputDir);
    const content = readFileSync(reportPath, 'utf-8');

    expect(content).toContain('**Scope**: Last N Commits');
    expect(content).toContain('`5`');
  });

  smokeTest('should return path to saved report', () => {
    const reportPath = saveReviewReport(mockReport, outputDir);

    expect(reportPath).toContain('.hodge/reviews/review-');
    expect(reportPath.endsWith('.md')).toBe(true);
  });
});
