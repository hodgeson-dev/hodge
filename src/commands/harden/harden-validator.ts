/**
 * Harden Validation Execution and Display
 * Handles running validations and displaying status
 */

import chalk from 'chalk';
import { HardenService } from '../../lib/harden-service.js';
import { createCommandLogger } from '../../lib/logger.js';
import type { RawToolResult, QualityChecksMapping } from '../../types/toolchain.js';
import type { HardenOptions } from '../harden.js';

/**
 * Helper functions for working with RawToolResult[]
 */
export function getAllPassed(results: RawToolResult[]): boolean {
  return results.every((r) => r.skipped ?? r.success);
}

export function getResultsByType(
  results: RawToolResult[],
  type: keyof QualityChecksMapping
): RawToolResult[] {
  return results.filter((r) => r.type === type);
}

/**
 * Handles validation execution and display
 */
export class HardenValidator {
  private logger = createCommandLogger('harden-validator', { enableConsole: true });
  private hardenService = new HardenService();

  /**
   * Run validations with timing metrics
   */
  async runValidationsWithTiming(
    feature: string,
    options: HardenOptions
  ): Promise<RawToolResult[]> {
    this.logger.info(chalk.bold('Running validation checks...\n'));

    if (options.sequential) {
      this.logger.info(chalk.cyan('📝 Running validations sequentially (debug mode)...'));
    } else {
      this.logger.info(chalk.cyan('🚀 Running validations in parallel...'));
    }

    const parallelStartTime = Date.now();

    // Delegate to HardenService for business logic
    const results: RawToolResult[] = await this.hardenService.runValidations(feature, options);

    const parallelEndTime = Date.now();
    if (!options.sequential) {
      this.logger.info(
        chalk.dim(`   Parallel validations completed in ${parallelEndTime - parallelStartTime}ms\n`)
      );
    }

    return results;
  }

  /**
   * Display validation status (presentation layer)
   */
  displayValidationStatus(results: RawToolResult[], _options: HardenOptions): void {
    const testResults = getResultsByType(results, 'testing');
    const lintResults = getResultsByType(results, 'linting');
    const typeCheckResults = getResultsByType(results, 'type_checking');

    // Tests status
    const testsPassed = testResults.every((r) => r.skipped ?? r.success);
    const testsSkipped = testResults.some((r) => r.skipped);
    this.logger.info(this.getTestStatusMessage(testsPassed, testsSkipped));

    // Linting status
    const lintPassed = lintResults.every((r) => r.skipped ?? r.success);
    this.logger.info(
      lintPassed ? chalk.green('   ✓ Linting passed') : chalk.red('   ✗ Linting failed')
    );

    // Type checking status
    const typeCheckPassed = typeCheckResults.every((r) => r.skipped ?? r.success);
    this.logger.info(
      typeCheckPassed ? chalk.green('   ✓ Type check passed') : chalk.red('   ✗ Type check failed')
    );

    this.logger.info('');
  }

  /**
   * Get test status message
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
}
