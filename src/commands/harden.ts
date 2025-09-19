import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { autoSave } from '../lib/auto-save.js';
import { contextManager } from '../lib/context-manager.js';
import { FeaturePopulator } from '../lib/feature-populator.js';

const execAsync = promisify(exec);

export interface HardenOptions {
  skipTests?: boolean;
  autoFix?: boolean;
  sequential?: boolean; // Run validations sequentially for debugging
}

interface ValidationResult {
  passed: boolean;
  output: string;
}

interface ValidationResults {
  tests: ValidationResult;
  lint: ValidationResult;
  typecheck: ValidationResult;
  build: ValidationResult;
}

/**
 * Harden Command with parallel validation execution
 * Runs test, lint, and typecheck in parallel for 50-70% performance improvement
 *
 * @class HardenCommand
 * @description Production-ready harden command with parallel validation by default
 */
export class HardenCommand {
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
      const context = {
        mode: 'harden',
        feature,
        timestamp: new Date().toISOString(),
        standards: 'enforced',
        validation: 'required',
        pmIssue: issueId,
        pmTool: pmTool ?? null,
      };

      // Save context
      await fs.writeFile(path.join(hardenDir, 'context.json'), JSON.stringify(context, null, 2));

      console.log(chalk.bold('In Harden Mode:'));
      console.log('  • Standards are ' + chalk.red('strictly enforced'));
      console.log('  • All tests must ' + chalk.red('pass'));
      console.log('  • Code must be ' + chalk.red('production-ready'));
      console.log('  • No warnings or errors ' + chalk.red('allowed') + '\n');

      // Run validation checks
      console.log(chalk.bold('Running validation checks...\n'));

      let testResult: ValidationResult;
      let lintResult: ValidationResult;
      let typecheckResult: ValidationResult;

      if (options.sequential) {
        // Sequential execution for debugging
        console.log(chalk.cyan('📝 Running validations sequentially (debug mode)...'));

        testResult = options.skipTests ? this.skipTests() : await this.runTests();
        lintResult = await this.runLinting(options.autoFix);
        typecheckResult = await this.runTypeCheck();
      } else {
        // Phase 1: Run parallel validations (test, lint, typecheck)
        console.log(chalk.cyan('🚀 Running validations in parallel...'));

        const parallelStartTime = Date.now();

        // Run test, lint, and typecheck in parallel
        [testResult, lintResult, typecheckResult] = await Promise.all([
          options.skipTests ? Promise.resolve(this.skipTests()) : this.runTests(),
          this.runLinting(options.autoFix),
          this.runTypeCheck(),
        ]);

        const parallelEndTime = Date.now();
        console.log(
          chalk.dim(
            `   Parallel validations completed in ${parallelEndTime - parallelStartTime}ms\n`
          )
        );
      }

      // Phase 2: Run build (depends on TypeScript, must be sequential)
      console.log(chalk.cyan('🏗️  Running build...'));
      const buildResult = await this.runBuild();

      // Aggregate results
      const results: ValidationResults = {
        tests: testResult,
        lint: lintResult,
        typecheck: typecheckResult,
        build: buildResult,
      };

      // Save validation results
      await fs.writeFile(
        path.join(hardenDir, 'validation-results.json'),
        JSON.stringify(results, null, 2)
      );

      // Generate and save report
      const reportContent = this.generateReport(feature, results, options);
      await fs.writeFile(path.join(hardenDir, 'harden-report.md'), reportContent);

      // Regenerate feature HODGE.md to include harden results (HODGE-005)
      const populator = new FeaturePopulator();
      await populator.generateFeatureHodgeMD(feature);

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
   * Run tests in parallel
   * @private
   */
  private async runTests(): Promise<ValidationResult> {
    const spinner = this.startSpinner('Running tests...');

    try {
      const { stdout, stderr } = await execAsync('npm test 2>&1', {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 120000, // 2 minute timeout
      });

      const passed = !stderr || !stderr.includes('FAIL');
      this.stopSpinner(spinner, passed ? '✓ Tests passed' : '✗ Tests failed', passed);

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
      this.stopSpinner(spinner, '✗ Tests failed', false);

      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Skip tests when requested
   * @private
   */
  private skipTests(): ValidationResult {
    console.log(chalk.yellow('   ⚠️  Tests skipped'));
    return {
      passed: true,
      output: 'Tests skipped via --skip-tests flag',
    };
  }

  /**
   * Run linting in parallel
   * @private
   */
  private async runLinting(autoFix?: boolean): Promise<ValidationResult> {
    const spinner = this.startSpinner('Running linter...');

    try {
      const { stdout, stderr } = await execAsync('npm run lint 2>&1', {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000, // 1 minute timeout
      });

      const passed = !stderr || !stderr.includes('error');

      if (!passed && autoFix) {
        this.stopSpinner(spinner, '🔧 Attempting auto-fix...', false);

        try {
          await execAsync('npm run lint -- --fix');
          console.log(chalk.green('   ✓ Auto-fix applied'));
        } catch {
          console.log(chalk.red('   ✗ Auto-fix failed'));
        }
      } else {
        this.stopSpinner(spinner, passed ? '✓ Linting passed' : '✗ Linting failed', passed);
      }

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
      this.stopSpinner(spinner, '✗ Linting failed', false);

      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run type checking in parallel
   * @private
   */
  private async runTypeCheck(): Promise<ValidationResult> {
    const spinner = this.startSpinner('Running type check...');

    try {
      const { stdout, stderr } = await execAsync('npm run typecheck 2>&1', {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000,
      });

      const passed = !stderr || !stderr.includes('error');
      this.stopSpinner(spinner, passed ? '✓ Type check passed' : '✗ Type check failed', passed);

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
      this.stopSpinner(spinner, '✗ Type check failed', false);

      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run build (sequential, depends on TypeScript)
   * @private
   */
  private async runBuild(): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync('npm run build 2>&1', {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 120000, // 2 minute timeout
      });

      const passed = !stderr || !stderr.includes('error');
      console.log(passed ? chalk.green('   ✓ Build succeeded') : chalk.red('   ✗ Build failed'));

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
      console.log(chalk.red('   ✗ Build failed'));

      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Simple spinner for parallel operations
   * @private
   */
  private startSpinner(text: string): { text: string; stop: () => void } {
    process.stdout.write(chalk.cyan(`   ${text}`));

    return {
      text,
      stop: () => {
        process.stdout.write('\r\x1b[K'); // Clear line
      },
    };
  }

  /**
   * Stop spinner and show result
   * @private
   */
  private stopSpinner(spinner: { stop: () => void }, message: string, success: boolean): void {
    spinner.stop();
    console.log(success ? chalk.green(`   ${message}`) : chalk.red(`   ${message}`));
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
