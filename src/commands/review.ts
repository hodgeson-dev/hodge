/**
 * Review Command (HODGE-344.4)
 *
 * AI-orchestrated code review for arbitrary file scopes with flexible fix workflow.
 * Users execute via `/review` slash command in Claude Code with flags:
 * - `/review --file src/lib/config.ts` - Review single file
 * - `/review --directory src/commands/` - Review directory
 * - `/review --last 3` - Review files from last 3 commits
 *
 * Workflow:
 * 1. CLI discovers files using git utilities (HODGE-344.1)
 * 2. CLI generates manifest and runs quality checks (HODGE-344.3)
 * 3. CLI writes structured output files to review directory
 * 4. AI reads files, interprets findings, presents to user
 * 5. AI facilitates fix selection conversation
 * 6. AI runs `hodge review --fix` for auto-fixes, Edit tool for manual fixes
 * 7. AI re-runs checks to verify fixes
 * 8. AI writes review-report.md using Write tool
 */

import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createCommandLogger } from '../lib/logger.js';
import {
  validateFile,
  getFilesInDirectory,
  getFilesFromLastNCommits,
  FileScopingError,
} from '../lib/git-utils.js';
import { ReviewEngineService } from '../lib/review-engine-service.js';
import { ReviewManifestGenerator } from '../lib/review-manifest-generator.js';
import { ToolchainService } from '../lib/toolchain-service.js';
import { CriticalFileSelector } from '../lib/critical-file-selector.js';
import { ImportAnalyzer } from '../lib/import-analyzer.js';
import { SeverityExtractor } from '../lib/severity-extractor.js';
import { ToolRegistryLoader } from '../lib/tool-registry-loader.js';
import { AutoFixService } from '../lib/auto-fix-service.js';
import * as yaml from 'js-yaml';
import type { ScopeMetadata } from '../types/review-manifest.js';
import type { ReviewManifest } from '../types/review-manifest.js';
import type { EnrichedToolResult } from '../types/review-engine.js';

export interface ReviewCommandOptions {
  file?: string;
  directory?: string;
  last?: number;
  fix?: boolean;
}

/**
 * Review Command for AI-orchestrated advisory code reviews
 * Thin CLI orchestration layer that coordinates services and writes output files
 */
export class ReviewCommand {
  private logger = createCommandLogger('review', { enableConsole: true });
  private reviewEngineService: ReviewEngineService;
  private autoFixService: AutoFixService;

  constructor() {
    // Initialize services with dependency injection
    const manifestGenerator = new ReviewManifestGenerator(process.cwd());
    const toolchainService = new ToolchainService();
    const importAnalyzer = new ImportAnalyzer();
    const severityExtractor = new SeverityExtractor();
    const criticalFileSelector = new CriticalFileSelector(importAnalyzer, severityExtractor);
    const toolRegistryLoader = new ToolRegistryLoader();

    this.reviewEngineService = new ReviewEngineService(
      manifestGenerator,
      toolchainService,
      criticalFileSelector,
      toolRegistryLoader
    );

    this.autoFixService = new AutoFixService();
  }

  /**
   * Execute review command
   * Discovers files, generates manifest, runs quality checks, writes output files
   */
  async execute(options: ReviewCommandOptions): Promise<void> {
    try {
      // Validate and parse scope
      this.validateScopeOptions(options);
      const scope = this.parseScope(options);
      const fileList = await this.discoverFiles(scope);

      // Handle --fix flag (auto-fix workflow)
      if (options.fix) {
        await this.handleAutoFix(fileList, scope);
        return;
      }

      // Generate review and write output files
      await this.performReview(fileList, scope);
    } catch (error) {
      this.handleReviewError(error);
    }
  }

  /**
   * Validate that exactly one scope flag is provided
   */
  private validateScopeOptions(options: ReviewCommandOptions): void {
    const scopeFlags = [options.file, options.directory, options.last].filter(
      (f) => f !== undefined
    );
    if (scopeFlags.length === 0) {
      throw new Error(
        'Please specify a scope: --file <path>, --directory <path>, or --last <count>'
      );
    }
    if (scopeFlags.length > 1) {
      throw new Error('Please specify only one scope flag (--file, --directory, or --last)');
    }
  }

  /**
   * Perform review: generate manifest, run checks, write output files
   */
  private async performReview(fileList: string[], scope: ScopeMetadata): Promise<void> {
    // Create review directory with descriptive name
    const reviewDir = await this.createReviewDirectory(scope);

    // Generate manifest and run quality checks via ReviewEngineService
    const findings = await this.reviewEngineService.analyzeFiles(fileList, {
      scope: scope,
      enableCriticalSelection: false, // Hard-coded policy for /review
    });

    // Write structured output files for AI
    await this.writeManifest(reviewDir, findings.manifest);
    await this.writeQualityChecks(reviewDir, findings.toolResults);

    // Output review directory path for AI (via stdout)
    console.log(`\n✅ Review files generated at: ${reviewDir}`);
    console.log(`\nAI: Read the following files to interpret findings:`);
    console.log(`  1. ${path.join(reviewDir, 'review-manifest.yaml')}`);
    console.log(`  2. ${path.join(reviewDir, 'quality-checks.md')}`);
  }

  /**
   * Handle errors during review execution
   */
  private handleReviewError(error: unknown): never {
    if (error instanceof FileScopingError) {
      // Expected empty result - display helpful guidance
      this.logger.info(chalk.yellow(`\n⚠️  No files to review: ${error.message}`));

      // Provide guidance based on error message
      if (error.message.includes('not found') || error.message.includes('not git-tracked')) {
        this.logger.info(
          chalk.dim("\nTip: If the file exists but isn't tracked, run: git add <file>")
        );
      } else if (error.message.includes('No git-tracked files in directory')) {
        this.logger.info(chalk.dim('\nTip: Check that files in the directory are tracked by git'));
      }

      process.exit(0); // Not an error - user provided scope had no files
    }

    // Unexpected error - log and throw
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    this.logger.error(chalk.red(`\n❌ Review command failed: ${errorMessage}`), {
      error: error as Error,
    });
    throw error;
  }

  /**
   * Parse scope from command options
   */
  private parseScope(options: ReviewCommandOptions): ScopeMetadata {
    if (options.file) {
      return {
        type: 'file',
        target: options.file,
        fileCount: 1, // Will be updated after file discovery
      };
    }
    if (options.directory) {
      return {
        type: 'directory',
        target: options.directory,
        fileCount: 0, // Will be updated after file discovery
      };
    }
    if (options.last) {
      return {
        type: 'commits',
        target: String(options.last),
        fileCount: 0, // Will be updated after file discovery
      };
    }

    throw new Error('Invalid scope options');
  }

  /**
   * Discover files using git utilities (HODGE-344.1)
   * Throws FileScopingError for empty results with helpful messages
   */
  private async discoverFiles(scope: ScopeMetadata): Promise<string[]> {
    this.logger.info(chalk.blue(`🔍 Discovering files for ${scope.type} scope: ${scope.target}`));

    let fileList: string[] = [];

    try {
      switch (scope.type) {
        case 'file': {
          fileList = await validateFile(scope.target);
          break;
        }
        case 'directory': {
          fileList = await getFilesInDirectory(scope.target);
          break;
        }
        case 'commits': {
          const commitCount = parseInt(scope.target, 10);
          // Warn for large commit counts
          if (commitCount > 100) {
            this.logger.warn(
              chalk.yellow(
                `\n⚠️  Warning: Reviewing ${commitCount} commits may take a while. Consider reducing the count for faster results.`
              )
            );
          }
          fileList = await getFilesFromLastNCommits(commitCount);
          break;
        }
      }

      // Update file count in scope metadata
      scope.fileCount = fileList.length;

      this.logger.info(chalk.green(`✓ Found ${fileList.length} file(s) to review`));
      return fileList;
    } catch (error) {
      // Re-throw FileScopingError as-is (expected empty results)
      if (error instanceof FileScopingError) {
        throw error;
      }
      // Wrap unexpected errors
      throw new Error(
        `Failed to discover files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Handle auto-fix workflow (--fix flag)
   * Applies formatters and linters to scoped files
   */
  private async handleAutoFix(fileList: string[], scope: ScopeMetadata): Promise<void> {
    this.logger.info(chalk.blue(`\n🔧 Running auto-fix for ${scope.type} scope: ${scope.target}`));
    this.logger.info(chalk.dim(`Files: ${fileList.length}`));

    try {
      // Load toolchain config
      const toolchainService = new ToolchainService();
      const toolchainConfig = await toolchainService.loadConfig();

      // Run auto-fix service (formatters first, then linters)
      // Note: AutoFixService works with staged files, so we inform user
      this.logger.info(chalk.dim('Running auto-fix on staged files...'));
      const report = await this.autoFixService.runAutoFix(toolchainConfig);

      // Display summary
      this.logger.info(chalk.green(`\n✓ Auto-fix complete`));
      this.logger.info(`  Total issues fixed: ${report.totalIssuesFixed}`);
      this.logger.info(`  Files modified: ${report.totalFilesModified}`);
      this.logger.info(`  Files modified: Check git diff for changes`);

      this.logger.info(
        chalk.dim(
          `\nNote: Auto-fix runs on staged files. Files are automatically re-staged after fixes.`
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(chalk.red(`\n❌ Auto-fix failed: ${errorMessage}`), {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Create review directory with descriptive, conflict-resistant name
   * Format: .hodge/reviews/review-{scope-type}-{sanitized-target}-{timestamp}/
   */
  private async createReviewDirectory(scope: ScopeMetadata): Promise<string> {
    const timestamp = this.formatTimestamp(new Date());
    const sanitizedTarget = this.sanitizePath(scope.target);
    const dirName = `review-${scope.type}-${sanitizedTarget}-${timestamp}`;
    const reviewDir = path.join(process.cwd(), '.hodge', 'reviews', dirName);

    await fs.mkdir(reviewDir, { recursive: true });
    this.logger.debug(`Created review directory: ${reviewDir}`);

    return reviewDir;
  }

  /**
   * Format timestamp for directory naming
   * Format: YYYY-MM-DD-HHMMSS
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
  }

  /**
   * Sanitize file path for use in directory name
   * Converts slashes to hyphens, preserves meaningful characters
   */
  private sanitizePath(targetPath: string): string {
    // Remove leading slashes (up to 10 to avoid ReDoS)
    let sanitized = targetPath;
    while (sanitized.startsWith('/') && sanitized.length > 0) {
      sanitized = sanitized.substring(1);
    }

    // Remove trailing slashes (up to 10 to avoid ReDoS)
    while (sanitized.endsWith('/') && sanitized.length > 0) {
      sanitized = sanitized.substring(0, sanitized.length - 1);
    }

    // Convert internal slashes to hyphens
    sanitized = sanitized.replace(/\//g, '-');

    // Remove special characters except hyphens, dots, and alphanumerics
    sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, '');

    // Truncate if too long (keep under 100 chars to avoid filesystem limits)
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    return sanitized;
  }

  /**
   * Write manifest to review directory
   */
  private async writeManifest(reviewDir: string, manifest: ReviewManifest): Promise<void> {
    const manifestPath = path.join(reviewDir, 'review-manifest.yaml');
    const yamlContent = yaml.dump(manifest, { lineWidth: -1, noRefs: true });
    await fs.writeFile(manifestPath, yamlContent, 'utf-8');
    this.logger.debug(`Wrote manifest: ${manifestPath}`);
  }

  /**
   * Write quality checks output to review directory
   * Format matches /harden's quality-checks.md for consistency
   */
  private async writeQualityChecks(
    reviewDir: string,
    toolResults: EnrichedToolResult[]
  ): Promise<void> {
    const qualityChecksPath = path.join(reviewDir, 'quality-checks.md');

    // Build markdown content
    let content = '# Quality Checks Report\n\n';
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += '---\n\n';

    for (const result of toolResults) {
      const toolName = String(result.tool);
      const checkType = String(result.checkType);
      content += `## ${toolName} (${checkType})\n\n`;

      if (result.skipped) {
        const reason = result.reason ? String(result.reason) : 'Tool not available';
        content += `**Status**: Skipped\n`;
        content += `**Reason**: ${reason}\n\n`;
        continue;
      }

      const status = result.success ? '✓ Passed' : '✗ Failed';
      const autoFixable = result.autoFixable ? 'Yes' : 'No';
      content += `**Status**: ${status}\n`;
      content += `**Auto-fixable**: ${autoFixable}\n\n`;

      if (result.output) {
        const output = String(result.output);
        content += '```\n';
        content += output;
        content += '\n```\n\n';
      }

      content += '---\n\n';
    }

    await fs.writeFile(qualityChecksPath, content, 'utf-8');
    this.logger.debug(`Wrote quality checks: ${qualityChecksPath}`);
  }
}
