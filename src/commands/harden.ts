import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { existsSync } from 'fs';
import { autoSave } from '../lib/auto-save.js';
import { contextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import {
  HardenService,
  type ValidationResult,
  type ValidationResults,
} from '../lib/harden-service.js';
import { createCommandLogger } from '../lib/logger.js';

export interface HardenOptions {
  skipTests?: boolean;
  autoFix?: boolean;
  sequential?: boolean; // Run validations sequentially for debugging
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

    // Auto-save context when switching features
    await autoSave.checkAndSave(feature);

    // Update context for this command
    await contextManager.updateForCommand('harden', feature, 'harden');

    try {
      // Validate inputs
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required and must be a string');
      }

      this.logger.info(chalk.magenta('🛡️  Entering Harden Mode'));
      this.logger.info(chalk.gray(`Feature: ${feature}\n`));

      // Update PM tracking - mark as hardening at START of phase
      await this.pmHooks.onHarden(feature);

      // Display AI context
      this.displayAIContext(feature);

      // Define paths
      const featureDir = path.join('.hodge', 'features', feature);
      const hardenDir = path.join(featureDir, 'harden');
      const buildDir = path.join(featureDir, 'build');

      // Check for build completion
      if (!existsSync(buildDir)) {
        const error = new Error('No build found for this feature');
        this.logger.error(chalk.red('❌ No build found for this feature.'), { error });
        this.logger.error(chalk.gray('   Build the feature first with:'));
        this.logger.error(chalk.cyan(`   hodge build ${feature}\n`));
        return;
      }

      // Create harden directory
      await fs.mkdir(hardenDir, { recursive: true });

      // Check for PM integration
      const pmTool = process.env.HODGE_PM_TOOL;
      const issueIdFile = path.join(featureDir, 'issue-id.txt');
      let issueId: string | null = null;

      if (existsSync(issueIdFile)) {
        issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
        if (pmTool && issueId) {
          this.logger.info(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
        }
      }

      // Create harden context
      this.logger.info(chalk.bold('In Harden Mode:'));
      this.logger.info('  • Standards are ' + chalk.red('strictly enforced'));
      this.logger.info('  • All tests must ' + chalk.red('pass'));
      this.logger.info('  • Code must be ' + chalk.red('production-ready'));
      this.logger.info('  • No warnings or errors ' + chalk.red('allowed') + '\n');

      // Run validation checks using HardenService
      this.logger.info(chalk.bold('Running validation checks...\n'));

      if (options.sequential) {
        this.logger.info(chalk.cyan('📝 Running validations sequentially (debug mode)...'));
      } else {
        this.logger.info(chalk.cyan('🚀 Running validations in parallel...'));
      }

      const parallelStartTime = Date.now();

      // Delegate to HardenService for business logic
      const results: ValidationResults = await this.hardenService.runValidations(options);

      const parallelEndTime = Date.now();
      if (!options.sequential) {
        this.logger.info(
          chalk.dim(
            `   Parallel validations completed in ${parallelEndTime - parallelStartTime}ms\n`
          )
        );
      }

      // Display validation status (presentation layer)
      this.displayValidationStatus(results, options);

      // Save validation results
      await fs.writeFile(
        path.join(hardenDir, 'validation-results.json'),
        JSON.stringify(results, null, 2)
      );

      // Generate and save report
      const reportContent = this.generateReport(feature, results, options);
      await fs.writeFile(path.join(hardenDir, 'harden-report.md'), reportContent);

      // Display final summary
      this.displaySummary(feature, results, hardenDir, options);

      // Performance metrics (in development)
      if (process.env.NODE_ENV === 'development' || process.env.HODGE_DEBUG) {
        const elapsed = Date.now() - startTime;
        this.logger.info(chalk.dim(`\nTotal execution time: ${elapsed}ms`));
      }
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
    this.logger.info(
      results.tests.passed
        ? chalk.green('   ✓ Tests passed')
        : options.skipTests
          ? chalk.yellow('   ⚠️  Tests skipped')
          : chalk.red('   ✗ Tests failed')
    );
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
- **Tests**: ${results.tests.passed ? '✅ Passed' : options.skipTests ? '⚠️ Skipped' : '❌ Failed'}
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
}
