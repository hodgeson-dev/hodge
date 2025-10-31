/**
 * Hodge Harden Command
 * Orchestrates feature hardening with parallel validation execution (thin orchestrator)
 */

import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { existsSync } from 'fs';
import { ContextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { createCommandLogger } from '../lib/logger.js';
import { ReviewManifestGenerator } from '../lib/review-manifest-generator.js';
import { ImportAnalyzer } from '../lib/import-analyzer.js';
import { SeverityExtractor } from '../lib/severity-extractor.js';
import { CriticalFileSelector } from '../lib/critical-file-selector.js';
import { ShipService } from '../lib/ship-service.js';
import { getCurrentCommitSHA } from '../lib/git-utils.js';
import { ReviewEngineService } from '../lib/review-engine-service.js';
import { ToolchainService } from '../lib/toolchain-service.js';
import { ToolRegistryLoader } from '../lib/tool-registry-loader.js';
import { HardenValidator, getAllPassed } from './harden/harden-validator.js';
import { QualityReportGenerator } from '../lib/quality-report-generator.js';
import { HardenReview } from './harden/harden-review.js';
import { HardenAutoFix } from './harden/harden-auto-fix.js';
import type { RawToolResult } from '../types/toolchain.js';

export interface HardenOptions {
  skipTests?: boolean;
  fix?: boolean; // HODGE-341.6: Run auto-fix on staged files only
  sequential?: boolean; // Run validations sequentially for debugging
  review?: boolean; // Return review context instead of running validations
}

/**
 * HardenCommand orchestrates feature hardening workflow
 */
export class HardenCommand {
  private pmHooks: PMHooks;
  private logger = createCommandLogger('harden', { enableConsole: true });
  private shipService: ShipService;
  private contextManager: ContextManager;
  private reviewEngineService: ReviewEngineService;
  private validator: HardenValidator;
  private reportGenerator: QualityReportGenerator;
  private reviewHandler: HardenReview;
  private autoFixHandler: HardenAutoFix;

  constructor(basePath: string = process.cwd()) {
    // Initialize context-aware services
    this.contextManager = new ContextManager(basePath);
    this.pmHooks = new PMHooks(basePath);
    this.shipService = new ShipService(basePath);

    // Initialize services
    const manifestGenerator = new ReviewManifestGenerator();
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

    // Initialize modules
    this.validator = new HardenValidator();
    this.reportGenerator = new QualityReportGenerator();
    this.reviewHandler = new HardenReview(this.reviewEngineService);
    this.autoFixHandler = new HardenAutoFix();
  }

  /**
   * Execute the harden command for a feature
   */
  async execute(feature?: string, options: HardenOptions = {}): Promise<void> {
    const startTime = Date.now();

    // Get feature from argument or context
    const resolvedFeature = await this.contextManager.getFeature(feature);

    if (!resolvedFeature) {
      throw new Error(
        'No feature specified. Please provide a feature name or run "hodge explore <feature>" first to set context.'
      );
    }

    // Use resolved feature from here on
    feature = resolvedFeature;

    // Update context for this command
    await this.contextManager.updateForCommand('harden', feature, 'harden');

    // Validate inputs
    if (!feature || typeof feature !== 'string') {
      throw new Error('Feature name is required and must be a string');
    }

    // HODGE-341.6: Handle --fix flag (auto-fix staged files) - early return
    if (options.fix) {
      await this.autoFixHandler.handleAutoFix(feature);
      return;
    }

    try {
      await this.runHardenValidation(feature, options, startTime);
    } catch (error) {
      // Comprehensive error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(chalk.red(`\n❌ Harden command failed: ${errorMessage}`), {
        error: error as Error,
      });

      if (process.env.HODGE_DEBUG) {
        this.logger.error(chalk.dim('Stack trace:'), { error: error as Error });
      }

      throw error;
    }
  }

  /**
   * Run harden validation workflow
   */
  private async runHardenValidation(
    feature: string,
    options: HardenOptions,
    startTime: number
  ): Promise<void> {
    this.logger.info(chalk.magenta('🛡️  Entering Harden Mode'));
    this.logger.info(chalk.gray(`Feature: ${feature}\n`));

    // Update PM tracking - mark as hardening at START of phase
    await this.pmHooks.onHarden(feature);

    // Display AI context
    this.displayAIContext(feature);

    // Setup and validate
    const setup = await this.setupHardenEnvironment(feature, options);
    if (!setup.canProceed) {
      return; // Setup handled the exit
    }

    const { hardenDir } = setup;

    // Display harden mode requirements
    this.displayHardenRequirements();

    // Run validations and get results
    const results = await this.validator.runValidationsWithTiming(feature, options);

    // Display validation status (presentation layer)
    this.validator.displayValidationStatus(results, options);

    // Save results and reports
    await this.saveValidationResults(feature, hardenDir, results, options);

    // Performance metrics (in development)
    if (process.env.NODE_ENV === 'development' || process.env.HODGE_DEBUG) {
      const elapsed = Date.now() - startTime;
      this.logger.info(chalk.dim(`\nTotal execution time: ${elapsed}ms`));
    }
  }

  /**
   * Display harden mode requirements
   */
  private displayHardenRequirements(): void {
    this.logger.info(chalk.bold('In Harden Mode:'));
    this.logger.info('  • Standards are ' + chalk.red('strictly enforced'));
    this.logger.info('  • All tests must ' + chalk.red('pass'));
    this.logger.info('  • Code must be ' + chalk.red('production-ready'));
    this.logger.info('  • No warnings or errors ' + chalk.red('allowed') + '\n');
  }

  /**
   * Save validation results and generate reports
   */
  private async saveValidationResults(
    feature: string,
    hardenDir: string,
    results: RawToolResult[],
    options: HardenOptions
  ): Promise<void> {
    // Check if all validations passed
    const allPassed = getAllPassed(results);

    // Save validation results
    await fs.writeFile(
      path.join(hardenDir, 'validation-results.json'),
      JSON.stringify(results, null, 2)
    );

    // Update ship-record with validation status and quality results
    await this.shipService.updateShipRecord(feature, {
      validationPassed: allPassed,
      qualityResults: results,
    });

    // HODGE-359.1: validation-results.json is now the source of truth
    // quality-checks.md generation removed - AI reads structured JSON instead

    // Generate and save report
    const reportContent = this.reportGenerator.generateReport(feature, results);
    await fs.writeFile(path.join(hardenDir, 'harden-report.md'), reportContent);

    // HODGE-341.5: If all errors fixed, prompt AI to review warnings
    if (allPassed) {
      await this.reviewHandler.promptWarningReview(hardenDir);
    }

    // Display final summary
    this.displaySummary(feature, results, hardenDir, options);
  }

  /**
   * Display AI context for harden mode
   */
  private displayAIContext(feature: string): void {
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.red.bold('AI CONTEXT UPDATE:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`You are now in ${chalk.red.bold('HARDEN MODE')} for: ${feature}`);
    this.logger.info('\n' + chalk.red.bold('STRICT REQUIREMENTS for AI assistance:'));
    this.logger.info('• ALL standards MUST be followed - NO exceptions');
    this.logger.info('• Use ONLY established patterns');
    this.logger.info('• Include COMPREHENSIVE error handling');
    this.logger.info('• Code MUST be production-ready');
    this.logger.info('• ALL tests MUST pass');
    this.logger.info('• NO warnings or errors allowed');
    this.logger.info(chalk.bold('═'.repeat(60)) + '\n');
  }

  /**
   * Display final summary
   */
  private displaySummary(
    feature: string,
    results: RawToolResult[],
    hardenDir: string,
    _options: HardenOptions
  ): void {
    const allPassed = getAllPassed(results);

    this.logger.info('\n' + chalk.bold('Harden Summary:'));

    if (allPassed) {
      this.logger.info(chalk.green.bold('\n✅ All validation checks passed!'));
      this.logger.info(chalk.green('Feature is production-ready.\n'));

      this.logger.info(chalk.bold('Next steps:'));
      this.logger.info(
        '  1. Review ' + chalk.yellow(`${path.join(hardenDir, 'harden-report.md')}`)
      );
      this.logger.info('  2. Use ' + chalk.cyan(`\`/ship ${feature}\``) + ' to deploy');
      this.logger.info('  3. Update PM issue status to "Done"');
    } else {
      this.logger.info(chalk.red.bold('\n❌ Validation checks failed.'));
      this.logger.info(chalk.red('Please fix issues before shipping.\n'));

      this.logger.info(chalk.bold('Required actions:'));
      this.logger.info(
        '  1. Review ' + chalk.yellow(`${path.join(hardenDir, 'harden-report.md')}`)
      );
      this.logger.info('  2. Fix identified issues');
      this.logger.info('  3. Run ' + chalk.cyan(`\`hodge harden ${feature}\``) + ' again');
    }

    this.logger.info(
      '\n' + chalk.dim('Report saved to: ' + path.join(hardenDir, 'harden-report.md'))
    );
  }

  /**
   * Setup harden environment and validate prerequisites
   */
  private async setupHardenEnvironment(
    feature: string,
    options: HardenOptions
  ): Promise<{
    canProceed: boolean;
    hardenDir: string;
    issueId: string | null;
  }> {
    // Define paths
    const featureDir = path.join('.hodge', 'features', feature);
    const hardenDir = path.join(featureDir, 'harden');
    const buildDir = path.join(featureDir, 'build');

    // Validate build directory exists
    if (!existsSync(buildDir)) {
      this.logger.info(chalk.yellow('⚠️  No build found for this feature.'));
      this.logger.info(chalk.gray('   Build the feature first with:'));
      this.logger.info(chalk.cyan(`   hodge build ${feature}\n`));
      return { canProceed: false, hardenDir, issueId: null };
    }

    // Create harden directory
    await fs.mkdir(hardenDir, { recursive: true });

    // HODGE-341.2: Record hardenStartCommit for toolchain file scoping
    try {
      const commitSHA = await getCurrentCommitSHA();
      await this.shipService.updateShipRecord(feature, {
        hardenStartCommit: commitSHA,
      });
      this.logger.debug('Recorded hardenStartCommit', { feature, commitSHA });
    } catch (error) {
      // Non-critical - continue if git is not available
      this.logger.warn('Could not record hardenStartCommit (git may not be available)', {
        error: error as Error,
      });
    }

    // Handle review mode
    if (options.review) {
      await this.reviewHandler.handleReviewMode(feature, hardenDir);
      return { canProceed: false, hardenDir, issueId: null };
    }

    // Read issue ID if available
    let issueId: string | null = null;
    const issueIdPath = path.join(featureDir, 'issue-id.txt');
    if (existsSync(issueIdPath)) {
      issueId = (await fs.readFile(issueIdPath, 'utf-8')).trim();
    }

    return { canProceed: true, hardenDir, issueId };
  }
}
