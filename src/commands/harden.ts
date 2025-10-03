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

      console.log(chalk.magenta('🛡️  Entering Harden Mode'));
      console.log(chalk.gray(`Feature: ${feature}\n`));

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
        console.log(chalk.red('❌ No build found for this feature.'));
        console.log(chalk.gray('   Build the feature first with:'));
        console.log(chalk.cyan(`   hodge build ${feature}\n`));
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
          console.log(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
        }
      }

      // Create harden context
      console.log(chalk.bold('In Harden Mode:'));
      console.log('  • Standards are ' + chalk.red('strictly enforced'));
      console.log('  • All tests must ' + chalk.red('pass'));
      console.log('  • Code must be ' + chalk.red('production-ready'));
      console.log('  • No warnings or errors ' + chalk.red('allowed') + '\n');

      // Run validation checks using HardenService
      console.log(chalk.bold('Running validation checks...\n'));

      if (options.sequential) {
        console.log(chalk.cyan('📝 Running validations sequentially (debug mode)...'));
      } else {
        console.log(chalk.cyan('🚀 Running validations in parallel...'));
      }

      const parallelStartTime = Date.now();

      // Delegate to HardenService for business logic
      const results: ValidationResults = await this.hardenService.runValidations(options);

      const parallelEndTime = Date.now();
      if (!options.sequential) {
        console.log(
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
        console.log(chalk.dim(`\nTotal execution time: ${elapsed}ms`));
      }
    } catch (error) {
      // Comprehensive error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(chalk.red(`\n❌ Harden command failed: ${errorMessage}`));

      if (process.env.HODGE_DEBUG) {
        console.error(chalk.dim('Stack trace:'));
        console.error(error);
      }

      throw error;
    }
  }

  /**
   * Display AI context for harden mode
   * @private
   */
  private displayAIContext(feature: string): void {
    console.log(chalk.bold('═'.repeat(60)));
    console.log(chalk.red.bold('AI CONTEXT UPDATE:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`You are now in ${chalk.red.bold('HARDEN MODE')} for: ${feature}`);
    console.log('\n' + chalk.red.bold('STRICT REQUIREMENTS for AI assistance:'));
    console.log('• ALL standards MUST be followed - NO exceptions');
    console.log('• Use ONLY established patterns');
    console.log('• Include COMPREHENSIVE error handling');
    console.log('• Code MUST be production-ready');
    console.log('• ALL tests MUST pass');
    console.log('• NO warnings or errors allowed');
    console.log(chalk.bold('═'.repeat(60)) + '\n');
  }

  /**
   * Display validation status (presentation layer)
   * @private
   */
  private displayValidationStatus(results: ValidationResults, options: HardenOptions): void {
    console.log(
      results.tests.passed
        ? chalk.green('   ✓ Tests passed')
        : options.skipTests
          ? chalk.yellow('   ⚠️  Tests skipped')
          : chalk.red('   ✗ Tests failed')
    );
    console.log(
      results.lint.passed ? chalk.green('   ✓ Linting passed') : chalk.red('   ✗ Linting failed')
    );
    console.log(
      results.typecheck.passed
        ? chalk.green('   ✓ Type check passed')
        : chalk.red('   ✗ Type check failed')
    );
    console.log(
      results.build.passed ? chalk.green('   ✓ Build succeeded') : chalk.red('   ✗ Build failed')
    );
    console.log();
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

    console.log('\n' + chalk.bold('Harden Summary:'));

    if (allPassed) {
      console.log(chalk.green.bold('\n✅ All validation checks passed!'));
      console.log(chalk.green('Feature is production-ready.\n'));

      console.log(chalk.bold('Next steps:'));
      console.log('  1. Review ' + chalk.yellow(`${path.join(hardenDir, 'harden-report.md')}`));
      console.log('  2. Use ' + chalk.cyan(`\`/ship ${feature}\``) + ' to deploy');
      console.log('  3. Update PM issue status to "Done"');
    } else {
      console.log(chalk.red.bold('\n❌ Validation checks failed.'));
      console.log(chalk.red('Please fix issues before shipping.\n'));

      console.log(chalk.bold('Required actions:'));
      console.log('  1. Review ' + chalk.yellow(`${path.join(hardenDir, 'harden-report.md')}`));
      console.log('  2. Fix identified issues');
      console.log('  3. Run ' + chalk.cyan(`\`hodge harden ${feature}\``) + ' again');

      if (options.autoFix) {
        console.log(
          '\n' +
            chalk.yellow('💡 Tip: Some issues may have been auto-fixed. Review and commit changes.')
        );
      }
    }

    console.log('\n' + chalk.dim('Report saved to: ' + path.join(hardenDir, 'harden-report.md')));
  }
}
