import { exec } from 'child_process';
import { promisify } from 'util';
import { ToolchainService } from './toolchain-service.js';
import type { RawToolResult } from '../types/toolchain.js';

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
 *
 * HODGE-341.2: Refactored to use ToolchainService for toolchain-based validation
 */
export class HardenService {
  private toolchainService: ToolchainService;
  private useToolchain: boolean;

  constructor(cwd: string = process.cwd(), useToolchain: boolean = true) {
    this.toolchainService = new ToolchainService(cwd);
    this.useToolchain = useToolchain;
  }
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
    // Try to use toolchain-based validation if enabled
    if (this.useToolchain) {
      try {
        return await this.runToolchainValidations(options);
      } catch (error) {
        // Fall back to legacy npm commands if toolchain fails
        console.warn('Toolchain validation failed, falling back to npm commands:', error);
      }
    }

    // Legacy npm command execution
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
   * Run validations using toolchain configuration
   * HODGE-341.2: New method for toolchain-based validation
   * @private
   */
  private async runToolchainValidations(options: {
    skipTests?: boolean;
    autoFix?: boolean;
    sequential?: boolean;
  }): Promise<ValidationResults> {
    // Run quality checks using toolchain
    const rawResults = await this.toolchainService.runQualityChecks('uncommitted');

    // Convert RawToolResult[] to ValidationResults
    const testResult = this.convertToolResult(
      rawResults.filter((r) => r.type === 'testing'),
      options.skipTests
    );
    const lintResult = this.convertToolResult(rawResults.filter((r) => r.type === 'linting'));
    const typecheckResult = this.convertToolResult(
      rawResults.filter((r) => r.type === 'type_checking')
    );

    // Build still uses npm command
    const buildResult = await this.runBuild();

    return {
      tests: testResult,
      lint: lintResult,
      typecheck: typecheckResult,
      build: buildResult,
    };
  }

  /**
   * Convert RawToolResult[] to ValidationResult
   * @private
   */
  private convertToolResult(results: RawToolResult[], skipTests?: boolean): ValidationResult {
    if (skipTests) {
      return this.skipTests();
    }

    if (results.length === 0) {
      return {
        passed: true,
        output: 'No tools configured for this check',
      };
    }

    // Aggregate results from multiple tools
    const allPassed = results.every((r) => r.skipped || r.success);
    const outputs = results.map((r) => {
      if (r.skipped) {
        return `[${r.tool}] ${r.reason ?? 'Skipped'}`;
      }
      return `[${r.tool}]\n${r.stdout ?? ''}\n${r.stderr ?? ''}`;
    });

    return {
      passed: allPassed,
      output: outputs.join('\n\n'),
    };
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

      // If execAsync succeeds (no throw), tests passed (exit code 0)
      // Check output for test failures as secondary validation
      const output = stdout + stderr;
      // Check for failure indicators without complex regex to avoid backtracking
      const hasFailed = output.includes(' FAIL ') || output.includes(' failed');

      return {
        passed: !hasFailed,
        output,
      };
    } catch (error) {
      // execAsync throws on non-zero exit code = tests failed
      // Error object from child_process.exec contains stdout/stderr properties
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      const output = execError.stdout ?? execError.stderr ?? execError.message ?? String(error);
      return {
        passed: false,
        output,
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

      // execAsync succeeds = exit code 0 = no linting errors (warnings are OK)
      const output = stdout + stderr;
      // Check for ESLint error summary format: "X problems (Y errors, Z warnings)"
      // Use RegExp.exec() instead of String.match() for safer regex execution
      const errorPattern = /\((\d+) errors?,/;
      const errorMatch = errorPattern.exec(output);
      const hasErrors = errorMatch !== null && parseInt(errorMatch[1]) > 0;

      // Auto-fix if requested and has errors
      if (hasErrors && autoFix) {
        try {
          await execAsync('npm run lint -- --fix');
        } catch {
          // Auto-fix failed, continue with original result
        }
      }

      return {
        passed: !hasErrors,
        output,
      };
    } catch (error) {
      // execAsync throws on non-zero exit code = linting errors exist
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

      // execAsync succeeds = exit code 0 = no TypeScript errors
      const output = stdout + stderr;
      const hasErrors = output.includes('error TS') || /Found \d+ errors?/.test(output);

      return {
        passed: !hasErrors,
        output,
      };
    } catch (error) {
      // execAsync throws on non-zero exit code = TypeScript errors exist
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

      // execAsync succeeds = exit code 0 = build succeeded
      const output = stdout + stderr;
      const hasErrors = output.includes('error TS') || output.includes('Build failed');

      return {
        passed: !hasErrors,
        output,
      };
    } catch (error) {
      // execAsync throws on non-zero exit code = build failed
      return {
        passed: false,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
