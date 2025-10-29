/**
 * Harden Review Mode
 * Handles review mode workflow with tiered approach
 */

import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { createCommandLogger } from '../../lib/logger.js';
import { GitDiffAnalyzer } from '../../lib/git-diff-analyzer.js';
import { ReviewEngineService } from '../../lib/review-engine-service.js';
import type { ToolchainConfig } from '../../types/toolchain.js';
import type { RawToolResult } from '../../types/toolchain.js';

/**
 * Handles review mode workflow
 */
export class HardenReview {
  private logger = createCommandLogger('harden-review', { enableConsole: true });

  constructor(private reviewEngineService: ReviewEngineService) {}

  /**
   * Handle review mode - prepare context for AI code review with tiered approach
   */
  async handleReviewMode(feature: string, hardenDir: string): Promise<void> {
    this.logger.info(
      chalk.blue('🔍 Review Mode: Analyzing changes and generating review manifest\n')
    );

    try {
      // 1. Get changed files using GitDiffAnalyzer
      const gitAnalyzer = new GitDiffAnalyzer();
      const changedFiles = await gitAnalyzer.getChangedFiles();

      // Display file summary to user
      this.displayFileSummary(changedFiles);

      // 2. Extract file list and call ReviewEngineService
      const fileList = changedFiles.map((f) => f.path);
      const findings = await this.reviewEngineService.analyzeFiles(fileList, {
        scope: {
          type: 'feature',
          target: feature,
        },
        enableCriticalSelection: true, // Harden policy: always select critical files
      });

      // 3. Write reports
      // HODGE-359.1: Write validation-results.json (replaces quality-checks.md)
      this.logger.info(chalk.blue('🔍 Running quality checks...\n'));
      await this.writeValidationResults(hardenDir, findings.rawToolResults);
      this.logger.info(chalk.green('✓ Quality checks complete\n'));

      // HODGE-360: Manifest now includes critical_files section, no separate file needed
      this.logger.info(chalk.blue('📚 Generating review manifest...\n'));
      await this.writeManifest(hardenDir, findings.manifest);

      // 4. Display tier classification
      this.logger.info(chalk.green(`✓ Classification complete`));
      this.logger.info(chalk.bold(`   Recommended tier: ${findings.metadata.tier.toUpperCase()}`));
      this.logger.info('');

      // 5. Output summary for AI
      this.displayReviewSummary(findings.manifest.critical_files !== undefined);
    } catch (error) {
      this.logger.error(
        chalk.red(
          `❌ Failed to prepare review context: ${error instanceof Error ? error.message : String(error)}`
        ),
        { error: error as Error }
      );
      throw error;
    }
  }

  /**
   * Prompt AI to review warnings after all errors are fixed
   */
  async promptWarningReview(hardenDir: string): Promise<void> {
    // Load toolchain config to check if warning review is enabled
    const toolchainConfigPath = path.join(process.cwd(), '.hodge', 'toolchain.yaml');

    if (!existsSync(toolchainConfigPath)) {
      return; // No config, skip warning review
    }

    try {
      const toolchainYaml = await fs.readFile(toolchainConfigPath, 'utf-8');
      const toolchainConfig = yaml.load(toolchainYaml) as ToolchainConfig;

      // Check if warning review is enabled
      const reviewWarnings = toolchainConfig.quality_gates?.harden?.review_warnings ?? false;

      if (!reviewWarnings) {
        return; // Warning review disabled
      }

      // HODGE-359.1: Check if validation-results.json exists
      const validationResultsPath = path.join(hardenDir, 'validation-results.json');
      if (!existsSync(validationResultsPath)) {
        return; // No validation results to review
      }

      // Display prompt for AI
      this.displayWarningPrompt(toolchainConfig);
    } catch (error) {
      // Non-critical - log and continue
      this.logger.debug('Failed to check warning review config', { error: error as Error });
    }
  }

  /**
   * Display file summary
   */
  private displayFileSummary(
    changedFiles: Array<{
      path: string;
      linesAdded: number;
      linesDeleted: number;
      linesChanged: number;
    }>
  ): void {
    if (changedFiles.length === 0) {
      this.logger.info(chalk.yellow('⚠️  No changed files found in current branch'));
      this.logger.info(chalk.gray('   Review manifest will still be generated\n'));
    } else {
      const totalLines = changedFiles.reduce((sum, f) => sum + f.linesChanged, 0);
      this.logger.info(
        chalk.green(`📄 Found ${changedFiles.length} changed files (${totalLines} lines):`)
      );
      changedFiles.forEach((file) => {
        this.logger.info(
          chalk.gray(`   - ${file.path} (+${file.linesAdded}/-${file.linesDeleted})`)
        );
      });
      this.logger.info('');
    }
  }

  /**
   * Display review summary (HODGE-360: Updated for manifest-only approach)
   */
  private displayReviewSummary(hasCriticalFiles: boolean): void {
    this.logger.info(chalk.bold('Review Context Ready:'));
    this.logger.info(
      chalk.gray(
        `   review-manifest.yaml - Context files & ${hasCriticalFiles ? 'critical file priorities' : 'file list'}`
      )
    );
    this.logger.info(chalk.gray(`   validation-results.json - Tool diagnostics`));
    this.logger.info('');
    this.logger.info(chalk.green('✅ AI can now conduct comprehensive code review'));
  }

  /**
   * Display warning review prompt
   */
  private displayWarningPrompt(toolchainConfig: ToolchainConfig): void {
    this.logger.info('\n' + chalk.bold('═'.repeat(70)));
    this.logger.info(chalk.green.bold('✅ All Blocking Errors Fixed!'));
    this.logger.info(chalk.bold('═'.repeat(70)));

    this.logger.info(
      '\n' + chalk.yellow('⚠️  Some warnings remain in ') + chalk.cyan('validation-results.json')
    );

    // Load and display warning guidance if configured
    const warningGuidance = toolchainConfig.quality_gates?.harden?.warning_guidance;
    if (warningGuidance) {
      this.logger.info('\n' + chalk.bold('Warning Review Guidance:'));
      this.logger.info(chalk.gray(warningGuidance.trim()));
    }

    this.logger.info('\n' + chalk.bold('AI Prompt:'));
    this.logger.info(
      chalk.cyan(
        `Please review ${chalk.yellow('validation-results.json')} and identify any warnings that should be fixed before shipping.`
      )
    );
    this.logger.info(
      chalk.cyan(
        'Consider the guidance above, project standards in .hodge/standards.md, and the scope of this feature.'
      )
    );
    this.logger.info(
      '\n' +
        chalk.dim(
          'Note: You can respond naturally. For example: "Fix the complexity warnings" or "These warnings are acceptable"'
        )
    );
    this.logger.info(chalk.bold('═'.repeat(70)) + '\n');
  }

  /**
   * Write validation results JSON
   * HODGE-359.1: Core structured validation data for AI consumption
   */
  private async writeValidationResults(
    hardenDir: string,
    toolResults: RawToolResult[]
  ): Promise<void> {
    const validationResultsPath = path.join(hardenDir, 'validation-results.json');
    await fs.writeFile(validationResultsPath, JSON.stringify(toolResults, null, 2));
  }

  /**
   * Write review manifest (HODGE-360: Now includes critical_files section)
   */
  private async writeManifest(hardenDir: string, manifest: unknown): Promise<void> {
    const manifestPath = path.join(hardenDir, 'review-manifest.yaml');
    await fs.writeFile(manifestPath, yaml.dump(manifest, { lineWidth: 120, noRefs: true }));
    this.logger.info(chalk.green(`✓ Review manifest generated`));
    this.logger.info('');
  }
}
