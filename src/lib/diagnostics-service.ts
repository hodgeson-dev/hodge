/**
 * DiagnosticsService: Aggregates and normalizes tool results
 * Part of HODGE-341.1: Build System Detection and Toolchain Infrastructure
 */

import type { RawToolResult, Diagnostic, DiagnosticReport, Severity } from '../types/toolchain.js';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('diagnostics-service');

// Type definitions for external tool output formats
interface ESLintMessage {
  severity: number;
  message: string;
  line: number;
  column: number;
  ruleId: string;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
}

interface VitestAssertionResult {
  status: string;
  failureMessages?: string[];
}

interface VitestTestFile {
  name: string;
  assertionResults?: VitestAssertionResult[];
}

interface VitestResults {
  testResults?: VitestTestFile[];
}

/**
 * Service for aggregating and normalizing tool results
 */
export class DiagnosticsService {
  /**
   * Aggregate raw tool results into a diagnostic report
   */
  aggregate(results: RawToolResult[], uncommittedFiles?: string[]): DiagnosticReport {
    logger.info('Aggregating tool results', { resultCount: results.length });

    const issues: Diagnostic[] = [];
    let checksRun = 0;
    let checksPassed = 0;

    for (const result of results) {
      // Skip results that were skipped
      if (result.skipped) {
        continue;
      }

      checksRun++;

      // Parse diagnostics from tool output
      const toolIssues = this.parseDiagnostics(result);

      // Filter to uncommitted files if scope is provided
      const filteredIssues = uncommittedFiles
        ? this.filterToUncommittedFiles(toolIssues, uncommittedFiles)
        : toolIssues;

      issues.push(...filteredIssues);

      // Check passed if no issues found
      if (filteredIssues.length === 0) {
        checksPassed++;
      }
    }

    // Calculate pass rate
    const passRate = checksRun > 0 ? Math.round((checksPassed / checksRun) * 100) : 100;

    // Count issues by severity
    const bySeverity: Record<Severity, number> = {
      blocker: 0,
      critical: 0,
      major: 0,
      minor: 0,
      info: 0,
    };

    for (const issue of issues) {
      bySeverity[issue.severity]++;
    }

    logger.info('Aggregation complete', {
      totalIssues: issues.length,
      checksRun,
      checksPassed,
      passRate,
    });

    return {
      summary: {
        total_issues: issues.length,
        by_severity: bySeverity,
        pass_rate: passRate,
        checks_run: checksRun,
        checks_passed: checksPassed,
      },
      issues,
    };
  }

  /**
   * Filter diagnostics to only uncommitted files
   */
  private filterToUncommittedFiles(
    diagnostics: Diagnostic[],
    uncommittedFiles: string[]
  ): Diagnostic[] {
    return diagnostics.filter((diagnostic) => {
      if (!diagnostic.file) {
        return true; // Keep issues without file reference
      }

      // Normalize file paths for comparison
      const normalizedFile = diagnostic.file.replace(/^\.\//, '');
      return uncommittedFiles.some((uncommitted) => {
        const normalizedUncommitted = uncommitted.replace(/^\.\//, '');
        return (
          normalizedFile === normalizedUncommitted || normalizedFile.endsWith(normalizedUncommitted)
        );
      });
    });
  }

  /**
   * Parse diagnostics from raw tool result
   */
  private parseDiagnostics(result: RawToolResult): Diagnostic[] {
    const tool = result.tool;

    switch (tool) {
      case 'typescript':
        return this.parseTypeScriptDiagnostics(result.stdout ?? '', tool);

      case 'eslint':
        return this.parseESLintDiagnostics(result.stdout ?? '', tool);

      case 'prettier':
        return this.parsePrettierDiagnostics(result.stdout ?? '', result.stderr ?? '', tool);

      case 'vitest':
        return this.parseVitestDiagnostics(result.stdout ?? '', tool);

      default:
        logger.warn(`No parser for tool: ${tool}`);
        return [];
    }
  }

  /**
   * Parse TypeScript compiler diagnostics
   * Expected format: "src/file.ts(10,5): error TS2322: Type 'string' is not assignable..."
   */
  private parseTypeScriptDiagnostics(stdout: string, tool: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Match TypeScript error format
    const errorRegex = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(\w+):\s+(.+)$/gm;
    let match;

    while ((match = errorRegex.exec(stdout)) !== null) {
      const [, file, line, column, severity, code, message] = match;

      diagnostics.push({
        severity: severity === 'error' ? 'blocker' : 'minor',
        message: message.trim(),
        file: file.trim(),
        line: parseInt(line, 10),
        column: parseInt(column, 10),
        tool,
        rule: code,
      });
    }

    return diagnostics;
  }

  /**
   * Parse ESLint diagnostics (JSON format)
   * Expected: eslint --format=json output
   */
  private parseESLintDiagnostics(stdout: string, tool: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    try {
      const parsed: unknown = JSON.parse(stdout);

      // Type guard for ESLint results array
      if (!Array.isArray(parsed)) {
        logger.warn('ESLint output is not an array');
        return diagnostics;
      }

      const results = parsed as ESLintResult[];

      for (const fileResult of results) {
        if (!Array.isArray(fileResult.messages)) {
          continue;
        }

        for (const message of fileResult.messages) {
          diagnostics.push({
            severity: this.normalizeESLintSeverity(message.severity),
            message: message.message,
            file: fileResult.filePath,
            line: message.line,
            column: message.column,
            tool,
            rule: message.ruleId,
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to parse ESLint JSON output', { error: error as Error });
    }

    return diagnostics;
  }

  /**
   * Parse Prettier diagnostics
   * Prettier outputs file paths that would be changed
   */
  private parsePrettierDiagnostics(stdout: string, _stderr: string, tool: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Prettier --check outputs files that need formatting
    const lines = stdout.split('\n').filter(Boolean);

    for (const line of lines) {
      if (line.trim().length === 0) continue;

      diagnostics.push({
        severity: 'minor',
        message: 'File is not formatted according to Prettier rules',
        file: line.trim(),
        tool,
      });
    }

    return diagnostics;
  }

  /**
   * Parse Vitest diagnostics (JSON format)
   * Expected: vitest run --reporter=json output
   */
  private parseVitestDiagnostics(stdout: string, tool: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    try {
      const parsed: unknown = JSON.parse(stdout);

      // Type guard for Vitest results object
      if (typeof parsed !== 'object' || parsed === null) {
        logger.warn('Vitest output is not an object');
        return diagnostics;
      }

      const results = parsed as VitestResults;

      // Parse test failures
      if (results.testResults && Array.isArray(results.testResults)) {
        for (const testFile of results.testResults) {
          const assertionResults = testFile.assertionResults ?? [];

          for (const testCase of assertionResults) {
            if (testCase.status === 'failed') {
              const failureMessage = testCase.failureMessages?.join('\n') ?? 'Test failed';

              diagnostics.push({
                severity: 'critical',
                message: failureMessage,
                file: testFile.name,
                tool,
              });
            }
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to parse Vitest JSON output', { error: error as Error });
    }

    return diagnostics;
  }

  /**
   * Normalize ESLint severity to our severity levels
   * ESLint: 1 = warning, 2 = error
   */
  private normalizeESLintSeverity(eslintSeverity: number): Severity {
    switch (eslintSeverity) {
      case 2:
        return 'critical';
      case 1:
        return 'major';
      default:
        return 'info';
    }
  }
}
