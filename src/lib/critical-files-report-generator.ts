import { CriticalFilesReport } from './critical-file-selector.js';

/**
 * Generates markdown reports for critical file analysis.
 * Provides transparent view of scoring algorithm and file prioritization.
 */
export class CriticalFilesReportGenerator {
  /**
   * Generate markdown report for critical files analysis
   */
  generateReport(report: CriticalFilesReport, timestamp: string): string {
    let markdown = `# Critical Files for Review\n\n`;
    markdown += `**Generated**: ${timestamp}\n`;
    markdown += `**Algorithm**: ${report.algorithm}\n`;
    markdown += `**Scope**: ${report.allFiles.length} files changed, top ${report.topFiles.length} selected for deep review\n\n`;

    // Scoring factors
    markdown += `## Scoring Factors\n\n`;
    markdown += `- Blocker issues: +100 points each\n`;
    markdown += `- Critical issues: +75 points each\n`;
    markdown += `- Warning issues: +25 points each\n`;
    markdown += `- Import fan-in: +2 points per import (high impact files)\n`;
    markdown += `- Lines changed: +0.5 points per line, bonus for large changes (>100 lines)\n`;
    markdown += `- New files: +50 points\n`;
    markdown += `- Critical path match: +50 points\n`;
    markdown += `- Test files: -50 points (lower priority)\n\n`;

    // Critical paths
    markdown += `## Critical Path Analysis\n\n`;

    if (report.inferredCriticalPaths.length > 0) {
      markdown += `**Inferred Critical Paths** (by import fan-in >20):\n`;
      report.inferredCriticalPaths.forEach((path) => {
        markdown += `- ${path}\n`;
      });
      markdown += `\n`;
    } else {
      markdown += `**Inferred Critical Paths**: None (no files with >20 imports)\n\n`;
    }

    if (report.configuredCriticalPaths.length > 0) {
      markdown += `**Configured Critical Paths** (from .hodge/toolchain.yaml):\n`;
      report.configuredCriticalPaths.forEach((path) => {
        markdown += `- ${path}\n`;
      });
      markdown += `\n`;
    } else {
      markdown += `**Configured Critical Paths**: None (add to .hodge/toolchain.yaml if needed)\n\n`;
    }

    // Top N files
    markdown += `## Top ${report.topFiles.length} Critical Files\n\n`;

    if (report.topFiles.length === 0) {
      markdown += `No files scored high enough for selection. All changes appear low-risk.\n\n`;
    } else {
      markdown += `| Rank | Score | File | Risk Factors |\n`;
      markdown += `|------|-------|------|-------------|\n`;

      report.topFiles.forEach((file, index) => {
        const riskFactorsSummary = file.riskFactors.join(', ') || 'low risk';
        markdown += `| ${index + 1} | ${file.score} | ${file.path} | ${riskFactorsSummary} |\n`;
      });

      markdown += `\n`;
    }

    // All files table
    markdown += `## All Changed Files (${report.allFiles.length} total)\n\n`;

    if (report.allFiles.length === 0) {
      markdown += `No changed files found.\n\n`;
    } else {
      markdown += `| File | Score | Included in Review |\n`;
      markdown += `|------|-------|-----------------|\n`;

      report.allFiles.forEach((file) => {
        const included = report.topFiles.some((f) => f.path === file.path);
        const rank = included ? report.topFiles.findIndex((f) => f.path === file.path) + 1 : '-';
        const status = included ? `✅ Yes (Rank ${rank})` : '❌ No';
        markdown += `| ${file.path} | ${file.score} | ${status} |\n`;
      });

      markdown += `\n`;
    }

    markdown += `---\n`;
    markdown += `**Note**: Focus your deep review on the Top ${report.topFiles.length} files. Other files should receive basic checks only.\n`;

    return markdown;
  }
}
