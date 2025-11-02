import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ImportAnalyzer } from './import-analyzer.js';
import { SeverityExtractor } from './severity-extractor.js';
import { CriticalFileSelector } from './critical-file-selector.js';
import { CriticalFilesReportGenerator } from './critical-files-report-generator.js';

describe('Critical File Selection (Smoke Tests)', () => {
  smokeTest('ImportAnalyzer should instantiate without crashing', () => {
    expect(() => new ImportAnalyzer()).not.toThrow();
  });

  smokeTest('SeverityExtractor should instantiate without crashing', () => {
    expect(() => new SeverityExtractor()).not.toThrow();
  });

  smokeTest('CriticalFileSelector should instantiate without crashing', () => {
    const analyzer = new ImportAnalyzer();
    const extractor = new SeverityExtractor();
    expect(() => new CriticalFileSelector(analyzer, extractor)).not.toThrow();
  });

  smokeTest('CriticalFilesReportGenerator should instantiate without crashing', () => {
    expect(() => new CriticalFilesReportGenerator()).not.toThrow();
  });

  smokeTest('SeverityExtractor should extract severity from tool output', () => {
    const extractor = new SeverityExtractor();
    const output = 'error: Type mismatch\nwarning: Unused variable\ninfo: Consider refactoring';

    const severities = extractor.extractSeverity(output);

    expect(severities.get('blocker')).toBeGreaterThan(0);
    expect(severities.get('warning')).toBeGreaterThan(0);
    expect(severities.get('info')).toBeGreaterThan(0);
  });

  smokeTest('SeverityExtractor should return score multipliers', () => {
    const extractor = new SeverityExtractor();

    expect(extractor.getScoreMultiplier('blocker')).toBe(100);
    expect(extractor.getScoreMultiplier('critical')).toBe(75);
    expect(extractor.getScoreMultiplier('warning')).toBe(25);
    expect(extractor.getScoreMultiplier('info')).toBe(5);
  });

  smokeTest('CriticalFileSelector should select critical files', async () => {
    const analyzer = new ImportAnalyzer();
    const extractor = new SeverityExtractor();
    const selector = new CriticalFileSelector(analyzer, extractor);

    // Mock changed files
    const changedFiles = [
      {
        path: 'src/example.ts',
        linesAdded: 10,
        linesDeleted: 5,
        linesChanged: 15,
      },
    ];

    // Mock quality check results
    const qualityCheckResults = [
      {
        type: 'linting' as const,
        tool: 'eslint',
        success: false,
        stdout: 'src/example.ts:10:5 error: Missing semicolon',
        stderr: '',
      },
    ];

    const report = selector.selectCriticalFiles(changedFiles, qualityCheckResults, {
      maxFiles: 10,
    });

    expect(report).toBeDefined();
    expect(report.topFiles).toBeDefined();
    expect(report.allFiles).toBeDefined();
    expect(report.algorithm).toBe('risk-weighted-v1.0');
  });

  smokeTest('CriticalFilesReportGenerator should generate markdown report', () => {
    const generator = new CriticalFilesReportGenerator();

    const mockReport = {
      topFiles: [
        {
          path: 'src/example.ts',
          score: 150,
          riskFactors: ['1 blocker issue', 'high impact (25 imports)'],
          linesChanged: 50,
          importFanIn: 25,
          severityCounts: new Map([
            ['blocker', 1],
            ['critical', 0],
            ['warning', 2],
            ['info', 0],
          ]),
        },
      ],
      allFiles: [
        {
          path: 'src/example.ts',
          score: 150,
          riskFactors: ['1 blocker issue', 'high impact (25 imports)'],
          linesChanged: 50,
          importFanIn: 25,
          severityCounts: new Map([
            ['blocker', 1],
            ['critical', 0],
            ['warning', 2],
            ['info', 0],
          ]),
        },
      ],
      inferredCriticalPaths: ['src/lib/core.ts', 'src/lib/utils.ts'],
      configuredCriticalPaths: ['src/payments/', 'src/auth/'],
      algorithm: 'risk-weighted-v1.0',
    };

    const markdown = generator.generateReport(mockReport, '2025-10-11T00:00:00Z');

    expect(markdown).toContain('# Critical Files for Review');
    expect(markdown).toContain('risk-weighted-v1.0');
    expect(markdown).toContain('src/example.ts');
    expect(markdown).toContain('Scoring Factors');
    expect(markdown).toContain('Critical Path Analysis');
  });

  smokeTest('ImportAnalyzer should handle empty project gracefully', () => {
    const analyzer = new ImportAnalyzer();

    // Should not crash on non-existent directory
    expect(() => analyzer.analyzeFanIn('/nonexistent')).not.toThrow();
  });

  smokeTest('CriticalFileSelector should handle empty changed files', async () => {
    const analyzer = new ImportAnalyzer();
    const extractor = new SeverityExtractor();
    const selector = new CriticalFileSelector(analyzer, extractor);

    const report = selector.selectCriticalFiles([], [], { maxFiles: 10 });

    expect(report.topFiles).toHaveLength(0);
    expect(report.allFiles).toHaveLength(0);
  });

  smokeTest('CriticalFileSelector should respect maxFiles limit', async () => {
    const analyzer = new ImportAnalyzer();
    const extractor = new SeverityExtractor();
    const selector = new CriticalFileSelector(analyzer, extractor);

    // Create 15 changed files
    const changedFiles = Array.from({ length: 15 }, (_, i) => ({
      path: `src/file${i}.ts`,
      linesAdded: 10,
      linesDeleted: 5,
      linesChanged: 15,
    }));

    const report = selector.selectCriticalFiles(changedFiles, [], { maxFiles: 5 });

    expect(report.topFiles).toHaveLength(5);
    expect(report.allFiles).toHaveLength(15);
  });
});
