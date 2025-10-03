import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ValidationResult {
  passed: boolean;
  output: string;
}

export interface ValidationResults {
  tests: ValidationResult;
  lint: ValidationResult;
  typecheck: ValidationResult;
  build: ValidationResult;
}

export interface QualityGateResults {
  gates: string[];
  allPassed: boolean;
  results: ValidationResults;
}

/**
 * HardenService - Testable business logic for hardening features
 *
 * Extracts testable business logic from HardenCommand per HODGE-321.
 * This service handles validation orchestration and quality gate checks
 * without any console I/O, making it fully testable.
 */
export class HardenService {
  /**
   * Run all validation checks in parallel
   * @param options - Validation options
   * @returns Promise<ValidationResults> - Validation results for all checks
   */
  async runValidations(
    options: {
      skipTests?: boolean;
      autoFix?: boolean;
      sequential?: boolean;
    } = {}
  ): Promise<ValidationResults> {
    if (options.sequential) {
      // Sequential execution
      const testResult = options.skipTests ? this.skipTests() : await this.runTests();
      const lintResult = await this.runLinting(options.autoFix);
      const typecheckResult = await this.runTypeCheck();
      const buildResult = await this.runBuild();

      return {
        tests: testResult,
        lint: lintResult,
        typecheck: typecheckResult,
        build: buildResult,
      };
    } else {
      // Parallel execution (default)
      const [testResult, lintResult, typecheckResult] = await Promise.all([
        options.skipTests ? Promise.resolve(this.skipTests()) : this.runTests(),
        this.runLinting(options.autoFix),
        this.runTypeCheck(),
      ]);

      // Build must run after TypeScript check
      const buildResult = await this.runBuild();

      return {
        tests: testResult,
        lint: lintResult,
        typecheck: typecheckResult,
        build: buildResult,
      };
    }
  }

  /**
   * Check quality gates and determine if feature is production-ready
   * @param results - Validation results from runValidations
   * @returns QualityGateResults - Quality gate check results
   */
  checkQualityGates(results: ValidationResults): QualityGateResults {
    const gates = ['tests', 'lint', 'typecheck', 'build'];
    const allPassed = Object.values(results).every((r: ValidationResult) => r.passed);

    return {
      gates,
      allPassed,
      results,
    };
  }

  /**
   * Generate harden report data (no formatting, just data)
   * @param feature - Feature name
   * @param results - Validation results
   * @param options - Harden options
   * @returns Report data object
   */
  generateReportData(
    feature: string,
    results: ValidationResults,
    options: { skipTests?: boolean } = {}
  ): {
    feature: string;
    timestamp: string;
    allPassed: boolean;
    results: ValidationResults;
    skipTests: boolean;
  } {
    const allPassed = Object.values(results).every((r: ValidationResult) => r.passed);

    return {
      feature,
      timestamp: new Date().toISOString(),
      allPassed,
      results,
      skipTests: options.skipTests || false,
    };
  }

  /**
   * Run tests
   * @private
   */
  private async runTests(): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync('npm test 2>&1', {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 120000, // 2 minute timeout
      });

      const passed = !stderr || !stderr.includes('FAIL');

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
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
    return {
      passed: true,
      output: 'Tests skipped via --skip-tests flag',
    };
  }

  /**
   * Run linting
   * @private
   */
  private async runLinting(autoFix?: boolean): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync('npm run lint 2>&1', {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000, // 1 minute timeout
      });

      const passed = !stderr || !stderr.includes('error');

      // Auto-fix if requested and failed
      if (!passed && autoFix) {
        try {
          await execAsync('npm run lint -- --fix');
        } catch {
          // Auto-fix failed, continue with original result
        }
      }

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run type checking
   * @private
   */
  private async runTypeCheck(): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync('npm run typecheck 2>&1', {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000,
      });

      const passed = !stderr || !stderr.includes('error');

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run build
   * @private
   */
  private async runBuild(): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync('npm run build 2>&1', {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 120000, // 2 minute timeout
      });

      const passed = !stderr || !stderr.includes('error');

      return {
        passed,
        output: stdout + stderr,
      };
    } catch (error) {
      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
