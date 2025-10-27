import { ToolchainService } from './toolchain-service.js';
import type { RawToolResult } from '../types/toolchain.js';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('harden-service');

/**
 * HardenService - Testable business logic for hardening features
 *
 * HODGE-356: Refactored to return RawToolResult[] directly from toolchain.
 * Eliminates tool-specific parsing and legacy ValidationResults conversion.
 * Commands check success flags only, AI interprets error details.
 */
export class HardenService {
  private toolchainService: ToolchainService;

  constructor(cwd: string = process.cwd(), toolchainService?: ToolchainService) {
    this.toolchainService = toolchainService ?? new ToolchainService(cwd);
  }
  /**
   * Run all validation checks using toolchain
   * HODGE-356: Returns RawToolResult[] directly (no conversion)
   * @param feature - Feature name for scoping file checks (optional)
   * @param options - Validation options
   * @returns Promise<RawToolResult[]> - Raw tool results from toolchain
   */
  async runValidations(
    feature?: string,
    options: {
      skipTests?: boolean;
      autoFix?: boolean;
      sequential?: boolean;
    } = {}
  ): Promise<RawToolResult[]> {
    const scope = feature ? 'feature' : 'uncommitted';

    try {
      const results = await this.toolchainService.runQualityChecks(scope, feature);

      // Handle skipTests option by filtering out test results
      if (options.skipTests) {
        return results.map((r) =>
          r.type === 'testing'
            ? { ...r, skipped: true, reason: 'Tests skipped via --skip-tests flag' }
            : r
        );
      }

      return results;
    } catch (error) {
      logger.error('Toolchain validation failed', {
        error: error as Error,
        feature,
      });
      throw error;
    }
  }

  /**
   * Check quality gates and determine if feature is production-ready
   * HODGE-356: Uses RawToolResult[] directly (universal success flags)
   * @param results - Raw tool results from runValidations
   * @returns Quality gate status
   */
  checkQualityGates(results: RawToolResult[]): {
    allPassed: boolean;
    results: RawToolResult[];
  } {
    const allPassed = results.every((r) => r.skipped || r.success);

    return {
      allPassed,
      results,
    };
  }

  /**
   * Generate harden report data (no formatting, just data)
   * HODGE-356: Uses RawToolResult[] directly
   * @param feature - Feature name
   * @param results - Raw tool results
   * @param options - Harden options
   * @returns Report data object
   */
  generateReportData(
    feature: string,
    results: RawToolResult[],
    options: { skipTests?: boolean } = {}
  ): {
    feature: string;
    timestamp: string;
    allPassed: boolean;
    results: RawToolResult[];
    skipTests: boolean;
  } {
    const allPassed = results.every((r) => r.skipped || r.success);

    return {
      feature,
      timestamp: new Date().toISOString(),
      allPassed,
      results,
      skipTests: options.skipTests ?? false,
    };
  }
}
