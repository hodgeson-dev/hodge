/**
 * Smoke tests for DiagnosticsService
 * HODGE-341.1: Build System Detection and Toolchain Infrastructure
 */

import { describe, expect } from 'vitest';
import { DiagnosticsService } from './diagnostics-service.js';
import type { RawToolResult } from '../types/toolchain.js';
import { smokeTest } from '../test/helpers.js';

describe('DiagnosticsService - Smoke Tests', () => {
  const service = new DiagnosticsService();

  smokeTest('should not crash with empty results', () => {
    const report = service.aggregate([]);

    expect(report).toBeDefined();
    expect(report.summary.total_issues).toBe(0);
    expect(report.summary.pass_rate).toBe(100);
  });

  smokeTest('should aggregate multiple tool results', () => {
    const results: RawToolResult[] = [
      {
        type: 'type_checking',
        tool: 'typescript',
        success: true,
        stdout: '',
      },
      {
        type: 'linting',
        tool: 'eslint',
        success: false,
        stdout: JSON.stringify([
          {
            filePath: 'src/test.ts',
            messages: [
              {
                severity: 2,
                message: 'Missing semicolon',
                line: 10,
                column: 5,
                ruleId: 'semi',
              },
            ],
          },
        ]),
      },
    ];

    const report = service.aggregate(results);

    expect(report).toBeDefined();
    expect(report.summary.checks_run).toBe(2);
    expect(report.summary.checks_passed).toBe(1);
    expect(report.summary.pass_rate).toBe(50);
    expect(report.issues.length).toBeGreaterThan(0);
  });

  smokeTest('should calculate pass rate correctly', () => {
    const results: RawToolResult[] = [
      { type: 'type_checking', tool: 'typescript', success: true, stdout: '' },
      { type: 'linting', tool: 'eslint', success: true, stdout: '[]' },
      { type: 'testing', tool: 'vitest', success: true, stdout: '{}' },
      { type: 'formatting', tool: 'prettier', success: true, stdout: '' },
    ];

    const report = service.aggregate(results);

    expect(report.summary.pass_rate).toBe(100);
    expect(report.summary.checks_passed).toBe(4);
    expect(report.summary.checks_run).toBe(4);
  });

  smokeTest('should skip skipped results', () => {
    const results: RawToolResult[] = [
      {
        type: 'type_checking',
        tool: 'typescript',
        skipped: true,
        reason: 'Not available',
      },
      {
        type: 'linting',
        tool: 'eslint',
        success: true,
        stdout: '[]',
      },
    ];

    const report = service.aggregate(results);

    expect(report.summary.checks_run).toBe(1); // Only eslint counted
    expect(report.summary.pass_rate).toBe(100);
  });

  smokeTest('should parse TypeScript diagnostics format', () => {
    const results: RawToolResult[] = [
      {
        type: 'type_checking',
        tool: 'typescript',
        success: false,
        stdout: 'src/file.ts(10,5): error TS2322: Type string is not assignable to type number',
      },
    ];

    const report = service.aggregate(results);

    expect(report.issues.length).toBeGreaterThan(0);
    const issue = report.issues[0];
    expect(issue.severity).toBe('blocker');
    expect(issue.file).toBe('src/file.ts');
    expect(issue.line).toBe(10);
    expect(issue.column).toBe(5);
  });

  smokeTest('should parse ESLint JSON diagnostics', () => {
    const eslintOutput = JSON.stringify([
      {
        filePath: '/path/to/file.js',
        messages: [
          {
            severity: 2,
            message: 'Unexpected console statement',
            line: 42,
            column: 8,
            ruleId: 'no-console',
          },
        ],
      },
    ]);

    const results: RawToolResult[] = [
      {
        type: 'linting',
        tool: 'eslint',
        success: false,
        stdout: eslintOutput,
      },
    ];

    const report = service.aggregate(results);

    expect(report.issues.length).toBe(1);
    expect(report.issues[0].severity).toBe('critical');
    expect(report.issues[0].rule).toBe('no-console');
  });

  smokeTest('should count issues by severity', () => {
    const eslintOutput = JSON.stringify([
      {
        filePath: '/path/to/file.js',
        messages: [
          {
            severity: 2, // error -> critical
            message: 'Error 1',
            line: 1,
            column: 1,
            ruleId: 'rule1',
          },
          {
            severity: 1, // warning -> major
            message: 'Warning 1',
            line: 2,
            column: 1,
            ruleId: 'rule2',
          },
        ],
      },
    ]);

    const results: RawToolResult[] = [
      {
        type: 'linting',
        tool: 'eslint',
        success: false,
        stdout: eslintOutput,
      },
    ];

    const report = service.aggregate(results);

    expect(report.summary.by_severity.critical).toBe(1);
    expect(report.summary.by_severity.major).toBe(1);
    expect(report.summary.total_issues).toBe(2);
  });

  smokeTest('should filter diagnostics to uncommitted files', () => {
    const eslintOutput = JSON.stringify([
      {
        filePath: 'src/changed.ts',
        messages: [
          {
            severity: 2,
            message: 'Error in changed file',
            line: 1,
            column: 1,
            ruleId: 'rule1',
          },
        ],
      },
      {
        filePath: 'src/unchanged.ts',
        messages: [
          {
            severity: 2,
            message: 'Error in unchanged file',
            line: 1,
            column: 1,
            ruleId: 'rule2',
          },
        ],
      },
    ]);

    const results: RawToolResult[] = [
      {
        type: 'linting',
        tool: 'eslint',
        success: false,
        stdout: eslintOutput,
      },
    ];

    const uncommittedFiles = ['src/changed.ts'];
    const report = service.aggregate(results, uncommittedFiles);

    // Should only include issues from src/changed.ts
    expect(report.issues.length).toBe(1);
    expect(report.issues[0].file).toContain('changed.ts');
  });

  smokeTest('should handle malformed tool output gracefully', () => {
    const results: RawToolResult[] = [
      {
        type: 'linting',
        tool: 'eslint',
        success: false,
        stdout: 'not valid json {{{',
      },
    ];

    // Should not crash, just return empty diagnostics for unparseable output
    const report = service.aggregate(results);

    expect(report).toBeDefined();
    expect(report.issues.length).toBe(0);
  });
});
