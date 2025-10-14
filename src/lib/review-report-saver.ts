/**
 * Review Report Saver
 *
 * Standalone utility for saving review reports to .hodge/reviews/
 * with timestamp-based naming and scope metadata inclusion.
 *
 * HODGE-344.2: Provides report persistence for file-based review workflows
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { createCommandLogger } from './logger.js';
import type { ScopeMetadata } from '../types/review-manifest.js';

const logger = createCommandLogger('review-report-saver', { enableConsole: false });

/**
 * Review report structure
 */
export interface ReviewReport {
  /** Feature or scope identifier */
  title: string;

  /** Review tier used */
  tier: string;

  /** Scope metadata (file/directory/commits/feature) */
  scope?: ScopeMetadata;

  /** Report sections */
  sections: {
    summary: string;
    blockers: string;
    warnings: string;
    suggestions: string;
    profiles?: string;
  };
}

/**
 * Format timestamp for report filename
 * Format: YYYY-MM-DD-HHMMSS (e.g., 2025-10-14-053045)
 *
 * @param date - Date to format (defaults to now)
 * @returns Formatted timestamp string
 */
export function formatTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

/**
 * Format scope metadata for report header
 *
 * @param scope - Scope metadata
 * @returns Formatted scope string
 */
function formatScopeMetadata(scope: ScopeMetadata): string {
  const typeLabel = {
    file: 'File',
    directory: 'Directory',
    commits: 'Last N Commits',
    feature: 'Feature',
  }[scope.type];

  return `**Scope**: ${typeLabel} - \`${scope.target}\` (${scope.fileCount} ${scope.fileCount === 1 ? 'file' : 'files'})`;
}

/**
 * Build report content in markdown format
 *
 * @param report - Review report data
 * @returns Markdown content
 */
function buildReportContent(report: ReviewReport): string {
  const sections = report.sections;
  let content = `# Code Review Report: ${report.title}\n\n`;

  // Add metadata header
  content += `**Reviewed**: ${new Date().toISOString()}\n`;
  content += `**Tier**: ${report.tier.toUpperCase()}\n`;

  // Add scope metadata if present
  if (report.scope) {
    content += formatScopeMetadata(report.scope) + '\n';
  }

  // Add profiles used if present
  if (sections.profiles) {
    content += sections.profiles + '\n';
  }

  content += '\n## Summary\n';
  content += sections.summary + '\n\n';

  content += '---\n\n';

  // Add main sections
  content += '## Critical Issues (BLOCKER)\n';
  content += sections.blockers + '\n\n';

  content += '---\n\n';

  content += '## Warnings (WARNING)\n';
  content += sections.warnings + '\n\n';

  content += '---\n\n';

  content += '## Suggestions (SUGGESTION)\n';
  content += sections.suggestions + '\n';

  return content;
}

/**
 * Save review report to .hodge/reviews/ with timestamp-based naming
 *
 * @param report - Review report to save
 * @param outputDir - Output directory (defaults to .hodge/reviews)
 * @returns Path to saved report
 */
export function saveReviewReport(
  report: ReviewReport,
  outputDir: string = '.hodge/reviews'
): string {
  logger.debug('Saving review report', {
    title: report.title,
    tier: report.tier,
    hasScope: !!report.scope,
  });

  // Generate timestamp-based filename
  const timestamp = formatTimestamp();
  const filename = `review-${timestamp}.md`;
  const outputPath = join(outputDir, filename);

  // Ensure output directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  // Build report content
  const content = buildReportContent(report);

  // Write report file
  writeFileSync(outputPath, content, 'utf-8');

  logger.info('Review report saved', { path: outputPath });

  return outputPath;
}
