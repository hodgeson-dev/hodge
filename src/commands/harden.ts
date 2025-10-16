import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { existsSync } from 'fs';
import { contextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import {
  HardenService,
  type ValidationResult,
  type ValidationResults,
} from '../lib/harden-service.js';
import type { RawToolResult, ToolchainConfig } from '../types/toolchain.js';
import { createCommandLogger } from '../lib/logger.js';
import { GitDiffAnalyzer } from '../lib/git-diff-analyzer.js';
import { ReviewManifestGenerator } from '../lib/review-manifest-generator.js';
import { ImportAnalyzer } from '../lib/import-analyzer.js';
import { SeverityExtractor } from '../lib/severity-extractor.js';
import { CriticalFileSelector, type CriticalFilesReport } from '../lib/critical-file-selector.js';
import { CriticalFilesReportGenerator } from '../lib/critical-files-report-generator.js';
import * as yaml from 'js-yaml';
import { ShipService } from '../lib/ship-service.js';
import { getCurrentCommitSHA } from '../lib/git-utils.js';
import { AutoFixService } from '../lib/auto-fix-service.js';
import { ReviewEngineService } from '../lib/review-engine-service.js';
import { ToolchainService } from '../lib/toolchain-service.js';
import { ToolRegistryLoader } from '../lib/tool-registry-loader.js';
import type { EnrichedToolResult } from '../types/review-engine.js';
import type { QualityChecksMapping } from '../types/toolchain.js';

export interface HardenOptions {
  skipTests?: boolean;
  autoFix?: boolean;
  fix?: boolean; // HODGE-341.6: Run auto-fix on staged files only
  sequential?: boolean; // Run validations sequentially for debugging
  review?: boolean; // Return review context instead of running validations
}

/**
 * Harden Command with parallel validation execution
 * Runs test, lint, and typecheck in parallel for 50-70% performance improvement
 *
 * @class HardenCommand
 * @description Production-ready harden command with parallel validation by default
 * @note Refactored in HODGE-321 to use HardenService for testable business logic
 */
export class HardenCommand {
  private pmHooks = new PMHooks();
  private hardenService = new HardenService();
  private logger = createCommandLogger('harden', { enableConsole: true });
  private shipService = new ShipService();
  private reviewEngineService: ReviewEngineService;

  constructor() {
    // HODGE-344.5: Initialize ReviewEngineService for unified review workflows
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
  }

  /**
   * Execute the harden command for a feature
   * @param {string} feature - The feature name to harden (optional, uses context if not provided)
   * @param {HardenOptions} options - Harden options including skipTests and autoFix
   * @returns {Promise<void>}
   * @throws {Error} If critical validation fails
   */
  async execute(feature?: string, options: HardenOptions = {}): Promise<void> {
    const startTime = Date.now();

    // Get feature from argument or context
    const resolvedFeature = await contextManager.getFeature(feature);

    if (!resolvedFeature) {
      throw new Error(
        'No feature specified. Please provide a feature name or run "hodge explore <feature>" first to set context.'
      );
    }

    // Use resolved feature from here on
    feature = resolvedFeature;

    // Update context for this command
    await contextManager.updateForCommand('harden', feature, 'harden');

    // Validate inputs
    if (!feature || typeof feature !== 'string') {
      throw new Error('Feature name is required and must be a string');
    }

    // HODGE-341.6: Handle --fix flag (auto-fix staged files) - early return
    if (options.fix) {
      await this.handleAutoFix(feature);
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
   * Run harden validation workflow (extracted to reduce cognitive complexity)
   * @private
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
    const results = await this.runValidationsWithTiming(feature, options);

    // Display validation status (presentation layer)
    this.displayValidationStatus(results, options);

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
   * @private
   */
  private displayHardenRequirements(): void {
    this.logger.info(chalk.bold('In Harden Mode:'));
    this.logger.info('  • Standards are ' + chalk.red('strictly enforced'));
    this.logger.info('  • All tests must ' + chalk.red('pass'));
    this.logger.info('  • Code must be ' + chalk.red('production-ready'));
    this.logger.info('  • No warnings or errors ' + chalk.red('allowed') + '\n');
  }

  /**
   * Run validations with timing metrics
   * @private
   */
  private async runValidationsWithTiming(
    feature: string,
    options: HardenOptions
  ): Promise<ValidationResults> {
    this.logger.info(chalk.bold('Running validation checks...\n'));

    if (options.sequential) {
      this.logger.info(chalk.cyan('📝 Running validations sequentially (debug mode)...'));
    } else {
      this.logger.info(chalk.cyan('🚀 Running validations in parallel...'));
    }

    const parallelStartTime = Date.now();

    // Delegate to HardenService for business logic
    // HODGE-341.2: Pass feature name for commit range scoping
    const results: ValidationResults = await this.hardenService.runValidations(feature, options);

    const parallelEndTime = Date.now();
    if (!options.sequential) {
      this.logger.info(
        chalk.dim(`   Parallel validations completed in ${parallelEndTime - parallelStartTime}ms\n`)
      );
    }

    return results;
  }

  /**
   * Save validation results and generate reports
   * @private
   */
  private async saveValidationResults(
    feature: string,
    hardenDir: string,
    results: ValidationResults,
    options: HardenOptions
  ): Promise<void> {
    // Check if all validations passed
    const allPassed = Object.values(results).every((r: ValidationResult) => r.passed);

    // Save validation results
    await fs.writeFile(
      path.join(hardenDir, 'validation-results.json'),
      JSON.stringify(results, null, 2)
    );

    // HODGE-341.2: Save ALL quality check results (including advanced checks) for AI review
    const allQualityChecks = this.hardenService.getLastQualityCheckResults();
    if (allQualityChecks && allQualityChecks.length > 0) {
      const qualityChecksReport = this.generateQualityChecksReport(allQualityChecks);
      await fs.writeFile(path.join(hardenDir, 'quality-checks.md'), qualityChecksReport);
      this.logger.debug('Wrote quality checks report', {
        checkCount: allQualityChecks.length,
        path: path.join(hardenDir, 'quality-checks.md'),
      });
    }

    // Generate and save report
    const reportContent = this.generateReport(feature, results, options);
    await fs.writeFile(path.join(hardenDir, 'harden-report.md'), reportContent);

    // HODGE-341.5: If all errors fixed, prompt AI to review warnings
    if (allPassed) {
      await this.promptWarningReview(hardenDir);
    }

    // Display final summary
    this.displaySummary(feature, results, hardenDir, options);
  }

  /**
   * Display AI context for harden mode
   * @private
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
   * Display validation status (presentation layer)
   * @private
   */
  private displayValidationStatus(results: ValidationResults, options: HardenOptions): void {
    this.logger.info(this.getTestStatusMessage(results.tests.passed, options.skipTests ?? false));
    this.logger.info(
      results.lint.passed ? chalk.green('   ✓ Linting passed') : chalk.red('   ✗ Linting failed')
    );
    this.logger.info(
      results.typecheck.passed
        ? chalk.green('   ✓ Type check passed')
        : chalk.red('   ✗ Type check failed')
    );
    this.logger.info(
      results.build.passed ? chalk.green('   ✓ Build succeeded') : chalk.red('   ✗ Build failed')
    );
    this.logger.info('');
  }

  /**
   * Get test status message
   * @private
   */
  private getTestStatusMessage(passed: boolean, skipped: boolean): string {
    if (passed) {
      return chalk.green('   ✓ Tests passed');
    }
    if (skipped) {
      return chalk.yellow('   ⚠️  Tests skipped');
    }
    return chalk.red('   ✗ Tests failed');
  }

  /**
   * Get test status for report
   * @private
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
   * Generate harden report
   * @private
   */
  private generateReport(
    feature: string,
    results: ValidationResults,
    options: HardenOptions
  ): string {
    const allPassed = Object.values(results).every((r: ValidationResult) => r.passed);

    return `# Harden Report: ${feature}

## Validation Results
**Date**: ${new Date().toLocaleString()}
**Overall Status**: ${allPassed ? '✅ PASSED' : '❌ FAILED'}

### Test Results
- **Tests**: ${this.getTestStatusForReport(results.tests.passed, options.skipTests ?? false)}
- **Linting**: ${results.lint.passed ? '✅ Passed' : '❌ Failed'}
- **Type Check**: ${results.typecheck.passed ? '✅ Passed' : '❌ Failed'}
- **Build**: ${results.build.passed ? '✅ Passed' : '❌ Failed'}

## Standards Compliance
${allPassed ? 'All standards have been met. Code is production-ready.' : 'Standards violations detected. Please fix before shipping.'}

## Performance
Validations were run in parallel for optimal performance.

## Next Steps
${
  allPassed
    ? `✅ Feature is production-ready!
- Use \`/ship ${feature}\` to deploy
- Update PM issue status to "Done"`
    : `❌ Issues need to be resolved:
- Review validation output below
- Fix identified issues
- Run \`/harden ${feature}\` again`
}

## Detailed Output

### Test Output
\`\`\`
${results.tests.output || 'No test output'}
\`\`\`

### Lint Output
\`\`\`
${results.lint.output || 'No lint output'}
\`\`\`

### Type Check Output
\`\`\`
${results.typecheck.output || 'No type check output'}
\`\`\`

### Build Output
\`\`\`
${results.build.output || 'No build output'}
\`\`\`
`;
  }

  /**
   * Display final summary
   * @private
   */
  private displaySummary(
    feature: string,
    results: ValidationResults,
    hardenDir: string,
    options: HardenOptions
  ): void {
    const allPassed = Object.values(results).every((r: ValidationResult) => r.passed);

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

      if (options.autoFix) {
        this.logger.info(
          '\n' +
            chalk.yellow('💡 Tip: Some issues may have been auto-fixed. Review and commit changes.')
        );
      }
    }

    this.logger.info(
      '\n' + chalk.dim('Report saved to: ' + path.join(hardenDir, 'harden-report.md'))
    );
  }

  /**
   * Setup harden environment and validate prerequisites
   * @private
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
      await this.handleReviewMode(feature, hardenDir);
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

  /**
   * Generate quality checks report from raw tool results
   * HODGE-341.2: Write ALL quality check results for AI interpretation
   * @private
   */
  private generateQualityChecksReport(results: RawToolResult[]): string {
    const timestamp = new Date().toISOString();
    const header = this.generateReportHeader(timestamp, results.length);
    const byType = this.groupResultsByType(results);
    const body = this.generateReportBody(byType);
    const footer = this.generateReportFooter();

    return header + body + footer;
  }

  /**
   * Generate report header
   * @private
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
   * @private
   */
  private groupResultsByType(results: RawToolResult[]): Record<string, RawToolResult[]> {
    return results.reduce(
      (acc, result) => {
        if (!acc[result.type]) {
          acc[result.type] = [];
        }
        acc[result.type].push(result);
        return acc;
      },
      {} as Record<string, RawToolResult[]>
    );
  }

  /**
   * Generate report body with all check results
   * @private
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
   * @private
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
   * @private
   */
  private generateReportFooter(): string {
    return `\n---\n\n**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.\n`;
  }

  /**
   * Handle review mode - prepare context for AI code review with tiered approach
   * HODGE-341.3: Enhanced with quality checks and critical file selection
   * @param {string} feature - Feature name
   * @param {string} hardenDir - Directory to save review manifest
   * @private
   */
  private async handleReviewMode(feature: string, hardenDir: string): Promise<void> {
    this.logger.info(
      chalk.blue('🔍 Review Mode: Analyzing changes and generating review manifest\n')
    );

    try {
      // HODGE-344.5: Use ReviewEngineService for unified review workflow
      // 1. Get changed files using GitDiffAnalyzer
      const gitAnalyzer = new GitDiffAnalyzer();
      const changedFiles = await gitAnalyzer.getChangedFiles();

      // Display file summary to user
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

      // 2. Extract file list and call ReviewEngineService
      const fileList = changedFiles.map((f) => f.path);
      const findings = await this.reviewEngineService.analyzeFiles(fileList, {
        scope: {
          type: 'feature',
          target: feature,
        },
        enableCriticalSelection: true, // Harden policy: always select critical files
      });

      // 3. Write reports using extracted methods
      await this.writeQualityChecks(hardenDir, findings.toolResults);
      await this.writeManifest(hardenDir, findings.manifest);
      if (findings.criticalFiles) {
        await this.writeCriticalFiles(hardenDir, findings.criticalFiles);
      }

      // 4. Display tier classification
      this.logger.info(chalk.green(`✓ Classification complete`));
      this.logger.info(chalk.bold(`   Recommended tier: ${findings.metadata.tier.toUpperCase()}`));
      this.logger.info('');

      // 5. Output summary for AI
      this.logger.info(chalk.bold('Review Context Ready:'));
      this.logger.info(chalk.gray(`   review-manifest.yaml - Context files to load`));
      this.logger.info(chalk.gray(`   quality-checks.md - Tool diagnostics`));
      if (changedFiles.length > 0) {
        this.logger.info(chalk.gray(`   critical-files.md - Top files for deep review`));
      }
      this.logger.info('');
      this.logger.info(chalk.green('✅ AI can now conduct comprehensive code review'));
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
   * Write quality checks report to quality-checks.md
   * HODGE-344.5: Extracted method for reduced complexity
   * @private
   */
  private async writeQualityChecks(
    hardenDir: string,
    enrichedResults: EnrichedToolResult[]
  ): Promise<void> {
    this.logger.info(chalk.blue('🔍 Running quality checks...\n'));

    // Convert EnrichedToolResult to RawToolResult for report generation
    const rawResults: RawToolResult[] = enrichedResults.map((enriched) => ({
      type: enriched.checkType as keyof QualityChecksMapping,
      tool: enriched.tool,
      success: enriched.success,
      stdout: enriched.output,
      stderr: '',
      skipped: enriched.skipped,
      reason: enriched.reason,
    }));

    const qualityChecksReport = this.generateQualityChecksReport(rawResults);
    await fs.writeFile(path.join(hardenDir, 'quality-checks.md'), qualityChecksReport);
    this.logger.info(chalk.green('✓ Quality checks complete\n'));
  }

  /**
   * Write review manifest to review-manifest.yaml
   * HODGE-344.5: Extracted method for reduced complexity
   * @private
   */
  private async writeManifest(hardenDir: string, manifest: unknown): Promise<void> {
    this.logger.info(chalk.blue('📚 Generating review manifest...'));
    const manifestPath = path.join(hardenDir, 'review-manifest.yaml');
    await fs.writeFile(manifestPath, yaml.dump(manifest, { lineWidth: 120, noRefs: true }));
    this.logger.info(chalk.green(`✓ Review manifest generated`));
    this.logger.info('');
  }

  /**
   * Write critical files report to critical-files.md
   * HODGE-344.5: Extracted method for reduced complexity
   * @private
   */
  private async writeCriticalFiles(
    hardenDir: string,
    criticalFiles: CriticalFilesReport
  ): Promise<void> {
    this.logger.info(chalk.blue('🎯 Selecting critical files...\n'));
    const reportGen = new CriticalFilesReportGenerator();
    const criticalFilesMarkdown = reportGen.generateReport(criticalFiles, new Date().toISOString());
    await fs.writeFile(path.join(hardenDir, 'critical-files.md'), criticalFilesMarkdown);
    this.logger.info(chalk.green(`✓ Selected ${criticalFiles.topFiles.length} critical files\n`));
  }

  /**
   * Prompt AI to review warnings after all errors are fixed
   * HODGE-341.5: AI-driven warning review
   * @private
   */
  private async promptWarningReview(hardenDir: string): Promise<void> {
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

      // Check if quality-checks.md exists
      const qualityChecksPath = path.join(hardenDir, 'quality-checks.md');
      if (!existsSync(qualityChecksPath)) {
        return; // No quality checks to review
      }

      // Display prompt for AI
      this.logger.info('\n' + chalk.bold('═'.repeat(70)));
      this.logger.info(chalk.green.bold('✅ All Blocking Errors Fixed!'));
      this.logger.info(chalk.bold('═'.repeat(70)));

      this.logger.info(
        '\n' + chalk.yellow('⚠️  Some warnings remain in ') + chalk.cyan('quality-checks.md')
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
          `Please review ${chalk.yellow('quality-checks.md')} and identify any warnings that should be fixed before shipping.`
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
    } catch (error) {
      // Non-critical - log and continue
      this.logger.debug('Failed to check warning review config', { error: error as Error });
    }
  }

  /**
   * Handle auto-fix mode - run auto-fix on staged files
   * HODGE-341.6: Auto-fix workflow
   * @private
   */
  private async handleAutoFix(feature: string): Promise<void> {
    this.logger.info(chalk.blue('🔧 Auto-Fix Mode: Running auto-fixable tools on staged files\n'));

    try {
      // Define paths
      const featureDir = path.join('.hodge', 'features', feature);
      const hardenDir = path.join(featureDir, 'harden');

      // Create harden directory
      await fs.mkdir(hardenDir, { recursive: true });

      // Load toolchain config
      const toolchainConfigPath = path.join(process.cwd(), '.hodge', 'toolchain.yaml');
      if (!existsSync(toolchainConfigPath)) {
        this.logger.error(chalk.red('❌ No toolchain.yaml found'));
        this.logger.info(chalk.gray('   Run `hodge init` to create toolchain configuration'));
        throw new Error('Toolchain configuration not found');
      }

      const toolchainYaml = await fs.readFile(toolchainConfigPath, 'utf-8');
      const toolchainConfig = yaml.load(toolchainYaml) as ToolchainConfig;

      // Run auto-fix
      const autoFixService = new AutoFixService();
      const report = await autoFixService.runAutoFix(toolchainConfig);

      // Save report for reference
      await fs.writeFile(
        path.join(hardenDir, 'auto-fix-report.json'),
        JSON.stringify(report, null, 2)
      );

      // Check for failures
      if (report.failures.length > 0) {
        this.logger.warn(
          chalk.yellow(`\n⚠️  ${report.failures.length} tool(s) failed to auto-fix`)
        );
        this.logger.info(chalk.gray('Failures will be included in quality check report\n'));
      }

      this.logger.info(chalk.green('✅ Auto-fix complete\n'));
    } catch (error) {
      this.logger.error(chalk.red('❌ Auto-fix failed'), { error: error as Error });
      throw error;
    }
  }
}
