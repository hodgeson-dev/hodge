/**
 * Harden Report Generation
 * Handles generating harden reports and quality checks reports
 */

import type { RawToolResult } from '../../types/toolchain.js';
import type { HardenOptions } from '../harden.js';
import { getAllPassed, getResultsByType } from './harden-validator.js';

/**
 * Generates harden reports and quality checks reports
 */
export class HardenReportGenerator {
  /**
   * Generate harden report
   */
  generateReport(feature: string, results: RawToolResult[], _options: HardenOptions): string {
    const allPassed = getAllPassed(results);

    const testResults = getResultsByType(results, 'testing');
    const lintResults = getResultsByType(results, 'linting');
    const typeCheckResults = getResultsByType(results, 'type_checking');

    const testsPassed = testResults.every((r) => r.skipped ?? r.success);
    const testsSkipped = testResults.some((r) => r.skipped);
    const lintPassed = lintResults.every((r) => r.skipped ?? r.success);
    const typeCheckPassed = typeCheckResults.every((r) => r.skipped ?? r.success);

    const header = this.generateReportHeaderSection(feature, allPassed);
    const validationResults = this.generateValidationResultsSection(
      testsPassed,
      testsSkipped,
      lintPassed,
      typeCheckPassed
    );
    const toolsUsed = this.generateToolsUsedSection(results);
    const complianceAndNext = this.generateComplianceAndNextSteps(feature, allPassed);
    const detailedOutput = this.generateDetailedOutputSection(results);

    return `${header}${validationResults}${toolsUsed}${complianceAndNext}${detailedOutput}`;
  }

  /**
   * Generate quality checks report from raw tool results
   */
  generateQualityChecksReport(results: RawToolResult[]): string {
    const timestamp = new Date().toISOString();
    const header = this.generateReportHeader(timestamp, results.length);
    const byType = this.groupResultsByType(results);
    const body = this.generateReportBody(byType);
    const footer = this.generateReportFooter();

    return header + body + footer;
  }

  /**
   * Get test status for report
   */
  private getTestStatusForReport(passed: boolean, skipped: boolean): string {
    if (passed) {
      return '✅ Passed';
    }
    if (skipped) {
      return '⚠️ Skipped';
    }
    return '❌ Failed';
  }

  /**
   * Generate report header section
   */
  private generateReportHeaderSection(feature: string, allPassed: boolean): string {
    return `# Harden Report: ${feature}

## Validation Results
**Date**: ${new Date().toLocaleString()}
**Overall Status**: ${allPassed ? '✅ PASSED' : '❌ FAILED'}

`;
  }

  /**
   * Generate validation results section
   */
  private generateValidationResultsSection(
    testsPassed: boolean,
    testsSkipped: boolean,
    lintPassed: boolean,
    typeCheckPassed: boolean
  ): string {
    return `### Test Results
- **Tests**: ${this.getTestStatusForReport(testsPassed, testsSkipped)}
- **Linting**: ${lintPassed ? '✅ Passed' : '❌ Failed'}
- **Type Check**: ${typeCheckPassed ? '✅ Passed' : '❌ Failed'}

`;
  }

  /**
   * Generate tools used section
   */
  private generateToolsUsedSection(results: RawToolResult[]): string {
    return `### Tools Used
${results.map((r) => `- ${r.type}: ${r.tool}`).join('\n')}

`;
  }

  /**
   * Generate compliance and next steps sections
   */
  private generateComplianceAndNextSteps(feature: string, allPassed: boolean): string {
    const complianceMessage = allPassed
      ? 'All standards have been met. Code is production-ready.'
      : 'Standards violations detected. Please fix before shipping.';

    const nextSteps = allPassed
      ? `✅ Feature is production-ready!
- Use \`/ship ${feature}\` to deploy
- Update PM issue status to "Done"`
      : `❌ Issues need to be resolved:
- Review validation output below
- Fix identified issues
- Run \`/harden ${feature}\` again`;

    return `## Standards Compliance
${complianceMessage}

## Performance
Validations were run in parallel for optimal performance.

## Next Steps
${nextSteps}

`;
  }

  /**
   * Generate detailed output section
   */
  private generateDetailedOutputSection(results: RawToolResult[]): string {
    const detailsMarkdown = results
      .map((r) => {
        let status: string;
        if (r.skipped) {
          status = '⚠️ Skipped';
        } else if (r.success) {
          status = '✅ Passed';
        } else {
          status = '❌ Failed';
        }
        const reason = r.skipped ? `**Reason**: ${r.reason ?? 'No reason provided'}` : '';
        return `### ${r.type}: ${r.tool}
**Status**: ${status}
${reason}

\`\`\`
${r.stdout ?? ''}${r.stderr ?? ''}
\`\`\`
`;
      })
      .join('\n');

    return `## Detailed Output

${detailsMarkdown}
`;
  }

  /**
   * Generate report header
   */
  private generateReportHeader(timestamp: string, totalChecks: number): string {
    return `# Quality Checks Report
**Generated**: ${timestamp}
**Total Checks**: ${totalChecks}

This report contains the raw output from all quality checks run by the toolchain.
The AI will interpret these results to identify issues that need to be fixed before shipping.

`;
  }

  /**
   * Group results by check type
   */
  private groupResultsByType(results: RawToolResult[]): Record<string, RawToolResult[]> {
    return results.reduce<Record<string, RawToolResult[]>>((acc, result) => {
      if (!(result.type in acc)) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {});
  }

  /**
   * Generate report body with all check results
   */
  private generateReportBody(byType: Record<string, RawToolResult[]>): string {
    let body = '';
    for (const [type, checks] of Object.entries(byType)) {
      body += `\n## ${type.replace(/_/g, ' ').toUpperCase()}\n\n`;
      body += checks.map((check) => this.formatCheckResult(check)).join('');
    }
    return body;
  }

  /**
   * Format a single check result
   */
  private formatCheckResult(check: RawToolResult): string {
    if (check.skipped) {
      return `### ${check.tool} (SKIPPED)\n**Reason**: ${check.reason}\n\n`;
    }

    const status = check.success ? '✅ PASSED' : '❌ FAILED';
    let result = `### ${check.tool} - ${status}\n\n`;

    if (check.stdout) {
      result += `**Output**:\n\`\`\`\n${check.stdout}\n\`\`\`\n\n`;
    }

    if (check.stderr) {
      result += `**Errors**:\n\`\`\`\n${check.stderr}\n\`\`\`\n\n`;
    }

    return result;
  }

  /**
   * Generate report footer
   */
  private generateReportFooter(): string {
    return `\n---\n\n**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.\n`;
  }
}
