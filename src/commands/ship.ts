import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { ContextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { ShipService } from '../lib/ship-service.js';
import type { LearningResult } from '../lib/pattern-learner.js';
import { createCommandLogger } from '../lib/logger.js';
import { ArchitectureGraphService } from '../lib/architecture-graph-service.js';
import { ToolchainService } from '../lib/toolchain-service.js';

export interface ShipOptions {
  skipTests?: boolean;
  message: string; // Required - commit message must be provided
}

export class ShipCommand {
  private logger = createCommandLogger('ship', { enableConsole: true });
  private pmHooks: PMHooks;
  private shipService: ShipService;
  private contextManager: ContextManager;
  private readonly basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();
    this.contextManager = new ContextManager(this.basePath);
    this.pmHooks = new PMHooks(this.basePath);
    this.shipService = new ShipService(this.basePath);
  }

  async execute(feature: string | undefined, options: ShipOptions): Promise<void> {
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
    await this.contextManager.updateForCommand('ship', feature, 'ship');

    this.logger.info(chalk.green('🚀 Entering Ship Mode'));
    this.logger.info(chalk.gray(`Feature: ${feature}\n`));

    // AI Context Injection (for Claude Code)
    this.displayAIContext(feature);

    // Validate ship prerequisites (hardening and validation)
    const prerequisites = await this.shipService.validateShipPrerequisites(
      feature,
      options.skipTests ?? false
    );

    const shipAction = this.shipService.determineShipAction(
      prerequisites,
      options.skipTests ?? false
    );

    // Handle prerequisites - abort if needed
    if (!this.handlePrerequisites(shipAction, feature)) {
      return;
    }

    // Load PM integration details
    const { pmTool, issueId } = await this.shipService.loadPMIntegration(feature);

    if (pmTool && issueId) {
      this.logger.info(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
      this.logger.info(chalk.gray('   Issue will be transitioned to Done after shipping.'));
    }

    const validationPassed = prerequisites.validationPassed;

    // Run final quality checks
    const { qualityResults, results } = await this.runFinalQualityChecks(
      feature,
      options.skipTests ?? false
    );

    if (!qualityResults) return; // Quality gates failed

    // Resolve commit message (directly from required --message flag)
    const commitMessage = this.resolveAndDisplayCommitMessage(options.message);

    // Create ship record and artifacts
    const shipDir = await this.createShipRecordAndArtifacts(
      feature,
      issueId,
      pmTool,
      validationPassed,
      qualityResults,
      commitMessage
    );

    // Display ship summary
    this.displayShipSummary(feature, issueId, results, qualityResults.length);

    // Complete post-ship operations (always creates commit)
    await this.completePostShipOperations(feature, commitMessage, pmTool, issueId, shipDir);
  }

  /**
   * Run final quality checks and return results
   * HODGE-359.1: Extracted from execute method for Boy Scout Rule compliance
   */
  private async runFinalQualityChecks(
    feature: string,
    skipTests: boolean
  ): Promise<{
    qualityResults: Awaited<ReturnType<ShipService['runQualityGates']>> | null;
    results: ReturnType<ShipService['categorizeQualityResults']>;
  }> {
    this.logger.info('\n' + chalk.bold('Running Ship Quality Gates...\n'));

    // HODGE-359.1: Pass feature to scope validation to files since buildStartCommit
    const qualityResults = await this.shipService.runQualityGates(feature, {
      skipTests,
    });

    // Display results (HODGE-356: Use universal success flags)
    const results = this.shipService.categorizeQualityResults(qualityResults);
    this.displayQualityResults(results, skipTests);

    // Determine if ready to ship (HODGE-356: universal success check)
    if (!this.shipService.checkQualityGatesPassed(qualityResults, skipTests)) {
      this.logger.info('\n' + chalk.red('❌ Not all quality gates passed.'));
      this.logger.info(chalk.gray('   Fix the issues above and try again.'));
      return { qualityResults: null, results };
    }

    return { qualityResults, results };
  }

  /**
   * Resolve commit message and display status
   * HODGE-369: Simplified to use direct message (no InteractionStateManager)
   */
  private resolveAndDisplayCommitMessage(message: string): string {
    const commitMessage = this.shipService.resolveCommitMessage(message);

    this.logger.info(chalk.green('   ✓ Using commit message from --message flag'));

    return commitMessage;
  }

  /**
   * Create ship record and related artifacts
   * HODGE-359.1: Extracted from execute method for Boy Scout Rule compliance
   */
  private async createShipRecordAndArtifacts(
    feature: string,
    issueId: string | null,
    pmTool: string | null,
    validationPassed: boolean,
    qualityResults: Awaited<ReturnType<ShipService['runQualityGates']>>,
    commitMessage: string
  ): Promise<string> {
    // Create ship record using ShipService (HODGE-356: using qualityResults)
    const shipRecord = this.shipService.generateShipRecord({
      feature,
      issueId,
      pmTool: pmTool ?? null,
      validationPassed,
      qualityResults,
      commitMessage,
    });

    // HODGE-341.2: Write ship-record.json to feature root (not ship/ subdirectory)
    const featureDir = path.join('.hodge', 'features', feature);
    await fs.writeFile(
      path.join(featureDir, 'ship-record.json'),
      JSON.stringify(shipRecord, null, 2)
    );

    const shipDir = path.join(featureDir, 'ship');
    await fs.mkdir(shipDir, { recursive: true });

    // HODGE-359.1: Write validation-results.json for AI consumption
    await fs.writeFile(
      path.join(shipDir, 'validation-results.json'),
      JSON.stringify(qualityResults, null, 2)
    );

    // Generate release notes using ShipService (HODGE-356: using qualityResults)
    const releaseNotes = this.shipService.generateReleaseNotes({
      feature,
      issueId,
      qualityResults,
    });

    await fs.writeFile(path.join(shipDir, 'release-notes.md'), releaseNotes);

    return shipDir;
  }

  /**
   * Complete post-ship operations (pattern learning, PM updates, git commit)
   * HODGE-369: Always creates commit (removed --no-commit option)
   */
  private async completePostShipOperations(
    feature: string,
    commitMessage: string,
    pmTool: string | null,
    issueId: string | null,
    shipDir: string
  ): Promise<void> {
    // Success message
    this.logger.info('\n' + chalk.green.bold('✅ Feature Shipped Successfully!'));

    // Update PM tracking
    await this.pmHooks.onShip(feature);

    this.logger.info('');
    this.logger.info(chalk.bold('Commit Message:'));
    this.logger.info(chalk.gray('─'.repeat(40)));
    this.logger.info(commitMessage);
    this.logger.info(chalk.gray('─'.repeat(40)));
    this.logger.info('');

    // Learn patterns from shipped code
    this.logger.info(chalk.cyan.bold('\n🧠 Learning from shipped code...'));
    const learningResult = await this.shipService.learnPatternsFromShippedCode(feature);
    this.displayPatternLearning(learningResult);

    // Note: Lessons learned are now captured in the /ship slash command BEFORE this CLI command runs
    // This ensures lessons are committed with the feature (see .claude/commands/ship.md Step 3.5)

    // HODGE-362: Generate architecture graph after successful ship
    await this.generateArchitectureGraph();

    // Update PM issue to Done
    if (pmTool && issueId) {
      this.logger.info(chalk.blue(`\n📋 Updating ${pmTool} issue ${issueId} to Done...`));
      // TODO: [ship] Update PM issue to "Done" status via PM adapter
    }

    // HODGE-220: Backup metadata before updates for rollback on failure
    const metadataBackup = await this.shipService.backupMetadata(feature);

    // Create git commit (always - removed --no-commit option)
    await this.createGitCommit(commitMessage, feature, metadataBackup);

    this.logger.info('');
    this.logger.info(chalk.gray('Ship record saved to: ' + shipDir));
  }

  /**
   * Create git commit and display next steps
   * HODGE-359.1: Extracted from completePostShipOperations for clarity
   */
  private async createGitCommit(
    commitMessage: string,
    feature: string,
    metadataBackup: Awaited<ReturnType<ShipService['backupMetadata']>>
  ): Promise<void> {
    this.logger.info(chalk.bold('\n📝 Creating git commit...'));

    const commitResult = await this.shipService.createShipCommit(
      commitMessage,
      feature,
      metadataBackup
    );

    if (commitResult.success) {
      this.logger.info(chalk.green('   ✓ Commit created successfully'));
      this.displaySuccessNextSteps();
    } else {
      this.displayCommitFailureSteps(commitResult.error?.message);
    }
  }

  /**
   * Display next steps after successful commit
   */
  private displaySuccessNextSteps(): void {
    this.logger.info(chalk.bold('\nNext Steps:'));
    this.logger.info('  1. Push to remote: git push');
    this.logger.info('  2. Create pull request if needed');
    this.logger.info('  3. Create release tag if needed');
    this.logger.info('  4. Monitor production metrics');
    this.logger.info('  5. Gather user feedback');
  }

  /**
   * Display steps when commit fails
   */
  private displayCommitFailureSteps(errorMessage?: string): void {
    this.logger.warn(chalk.yellow('   ⚠️  Could not create commit automatically'));
    this.logger.info(chalk.gray(`   Error: ${errorMessage ?? 'Unknown error'}`));
    this.logger.info(chalk.green('   ✓ Metadata rolled back successfully'));

    this.logger.info(chalk.bold('\nManual Steps Required:'));
    this.logger.info('  1. Stage changes: git add .');
    this.logger.info('  2. Commit with the message above');
    this.logger.info('  3. Push to main branch');
    this.logger.info('  4. Create release tag if needed');
    this.logger.info('  5. Monitor production metrics');
    this.logger.info('  6. Gather user feedback');
  }

  /**
   * Display AI context for ship mode
   */
  private displayAIContext(feature: string): void {
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.green.bold('AI CONTEXT UPDATE:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`You are now in ${chalk.green.bold('SHIP MODE')} for: ${feature}`);
    this.logger.info('\n' + chalk.green.bold('SHIPPING REQUIREMENTS:'));
    this.logger.info('• Feature MUST be production-ready');
    this.logger.info('• ALL tests MUST pass');
    this.logger.info('• Documentation MUST be complete');
    this.logger.info('• Code review SHOULD be done');
    this.logger.info('• PM issue will be marked as Done');
    this.logger.info(chalk.bold('═'.repeat(60)) + '\n');
  }

  /**
   * Handle prerequisite validation result
   * Returns true if should continue, false if should abort
   */
  private handlePrerequisites(
    shipAction: { action: string; warning?: string },
    feature: string
  ): boolean {
    switch (shipAction.action) {
      case 'abort-not-built':
        this.logger.warn(chalk.yellow('⚠️  Feature has not been hardened.'));
        this.logger.error(chalk.red('❌ Feature has not been built or hardened.'));
        this.logger.info(chalk.gray('   Follow the proper flow:'));
        this.logger.info(chalk.cyan(`   hodge explore ${feature}`));
        this.logger.info(chalk.cyan(`   hodge build ${feature}`));
        this.logger.info(chalk.cyan(`   hodge harden ${feature}`));
        this.logger.info(chalk.cyan(`   hodge ship ${feature}\n`));
        return false;

      case 'abort-not-hardened':
        this.logger.warn(chalk.yellow('⚠️  Feature has not been hardened.'));
        this.logger.info(chalk.gray('   Feature has been built but not hardened.'));
        this.logger.info(chalk.gray('   Consider hardening first with:'));
        this.logger.info(chalk.cyan(`   hodge harden ${feature}\n`));
        this.logger.warn(
          chalk.yellow('Ship without hardening? This is not recommended for production.')
        );
        this.logger.info(chalk.gray('Use --skip-tests to bypass this check at your own risk.\n'));
        return false;

      case 'abort-validation-failed':
        this.logger.error(chalk.red('❌ Validation checks from hardening have not passed.'));
        this.logger.info(chalk.gray('   Review and fix issues, then run:'));
        this.logger.info(chalk.cyan(`   hodge harden ${feature}\n`));
        return false;

      case 'continue':
        if (shipAction.warning === 'no-harden') {
          this.logger.warn(chalk.yellow('⚠️  Feature has not been hardened.'));
          this.logger.warn(
            chalk.yellow('Ship without hardening? This is not recommended for production.')
          );
        } else if (shipAction.warning === 'no-validation-data') {
          this.logger.warn(chalk.yellow('⚠️  Could not read validation results.'));
        }
        return true;

      default:
        return true;
    }
  }

  /**
   * Display quality gate results
   */
  private displayQualityResults(
    results: { testsPassed: boolean; lintPassed: boolean; typeCheckPassed: boolean },
    skipTests: boolean
  ): void {
    // Tests status
    if (!skipTests) {
      this.logger.info(chalk.cyan('📝 Running final test suite...'));
      this.logger.info(
        results.testsPassed ? chalk.green('   ✓ All tests passing') : chalk.red('   ✗ Tests failed')
      );
    } else {
      this.logger.warn(chalk.yellow('   ⚠️  Tests skipped'));
    }

    // Linting status
    this.logger.info(chalk.cyan('🔍 Checking linting...'));
    this.logger.info(
      results.lintPassed ? chalk.green('   ✓ Linting passed') : chalk.red('   ✗ Linting failed')
    );

    // Type checking status
    this.logger.info(chalk.cyan('📊 Checking types...'));
    this.logger.info(
      results.typeCheckPassed
        ? chalk.green('   ✓ Type checking passed')
        : chalk.red('   ✗ Type checking failed')
    );
  }

  /**
   * Display ship summary
   */
  private displayShipSummary(
    feature: string,
    issueId: string | null,
    results: { testsPassed: boolean; lintPassed: boolean; typeCheckPassed: boolean },
    qualityResultsCount: number
  ): void {
    this.logger.info('\n' + chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.green.bold('🚀 SHIP SUMMARY'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`Feature: ${chalk.white.bold(feature)}`);
    if (issueId) {
      this.logger.info(`PM Issue: ${issueId} → Will be marked as Done`);
    }
    this.logger.info(`\nQuality Gates:`);
    this.logger.info(`  Tests: ${results.testsPassed ? '✅' : '❌'}`);
    this.logger.info(`  Linting: ${results.lintPassed ? '✅' : '❌'}`);
    this.logger.info(`  Type Checking: ${results.typeCheckPassed ? '✅' : '❌'}`);
    this.logger.info(`  Total Checks: ${qualityResultsCount}`);
    this.logger.info(chalk.bold('═'.repeat(60)));
  }

  /**
   * Display pattern learning results
   */
  private displayPatternLearning(learningResult: unknown): void {
    if (!learningResult) {
      this.logger.warn(chalk.yellow('   ⚠️  Pattern learning skipped (optional feature)'));
      return;
    }

    const result = learningResult as LearningResult;
    this.logger.info(chalk.green(`   ✓ Analyzed ${result.statistics.filesAnalyzed} files`));
    this.logger.info(chalk.green(`   ✓ Found ${result.statistics.patternsFound} patterns`));
    this.logger.info(chalk.green(`   ✓ Detected ${result.statistics.standardsDetected} standards`));

    if (result.patterns.length > 0) {
      this.logger.info(chalk.dim('\n   Top patterns:'));
      const sortedPatterns = [...result.patterns].sort((a, b) => b.frequency - a.frequency);
      const topPatterns = sortedPatterns.slice(0, 3);
      topPatterns.forEach((p) => {
        this.logger.info(
          chalk.dim(`   • ${p.name} (${p.frequency}x, ${p.metadata.confidence}% confidence)`)
        );
      });
    }

    if (result.recommendations.length > 0) {
      this.logger.info(chalk.dim('\n   Recommendations:'));
      result.recommendations.slice(0, 3).forEach((r) => {
        this.logger.info(chalk.dim(`   • ${r}`));
      });
    }

    this.logger.info(chalk.green('\n   ✓ Patterns saved to .hodge/patterns/'));
  }

  /**
   * Generate architecture graph using configured tool
   * HODGE-362: Non-blocking graph generation for AI codebase awareness
   */
  private async generateArchitectureGraph(): Promise<void> {
    try {
      this.logger.info(chalk.cyan.bold('\n📊 Generating architecture graph...'));

      // Load toolchain config
      const toolchainService = new ToolchainService(this.basePath);
      const toolchainConfig = await toolchainService.loadConfig();

      // Generate graph
      const graphService = new ArchitectureGraphService();
      const result = await graphService.generateGraph({
        projectRoot: this.basePath,
        toolchainConfig,
        quiet: false,
      });

      if (result.success) {
        this.logger.info(chalk.green(`   ✓ Architecture graph generated`));
        this.logger.info(chalk.dim(`   Tool: ${result.tool}`));
        this.logger.info(chalk.dim(`   Location: ${result.graphPath}`));
      } else {
        // Non-blocking: just log warning
        this.logger.warn(
          chalk.yellow(`   ⚠️  Graph generation skipped: ${result.error ?? 'unknown error'}`)
        );
      }
    } catch (error) {
      // Non-blocking: catch all errors
      const err = error as Error;
      this.logger.warn(chalk.yellow(`   ⚠️  Graph generation failed: ${err.message}`));
      this.logger.debug('Graph generation error details', { error: err });
    }
  }
}
