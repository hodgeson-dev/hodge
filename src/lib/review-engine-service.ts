/**
 * Review Engine Service
 * HODGE-344.3: Shared review workflow core for /harden and /review commands
 *
 * Single Responsibility: Collect raw quality check results from CLI tools
 * and package them with context for AI interpretation.
 *
 * Does NOT:
 * - Parse tool outputs (AI does this)
 * - Make severity decisions (AI does this)
 * - Format markdown reports (ReviewReportSaver does this)
 * - Execute auto-fixes (AutoFixService does this)
 * - Prompt users (slash command templates do this)
 */

import { createCommandLogger } from './logger.js';
import { getFileChangeStats } from './git-utils.js';
import { ReviewManifestGenerator } from './review-manifest-generator.js';
import { ReviewTierClassifier } from './review-tier-classifier.js';
import { ToolchainService } from './toolchain-service.js';
import { CriticalFileSelector } from './critical-file-selector.js';
import { ToolRegistryLoader } from './tool-registry-loader.js';
import type { ReviewOptions, ReviewFindings, EnrichedToolResult } from '../types/review-engine.js';
import type { RawToolResult } from '../types/toolchain.js';
import { isToolResultSuccessful } from '../types/toolchain.js';
import type { CriticalFilesReport } from './critical-file-selector.js';
import type { ReviewManifest } from '../types/review-manifest.js';

/**
 * Service for orchestrating code review workflows
 * Used by both /harden and /review commands with different policies
 */
export class ReviewEngineService {
  private logger = createCommandLogger('review-engine-service', { enableConsole: false });

  constructor(
    private manifestGenerator: ReviewManifestGenerator,
    private toolchainService: ToolchainService,
    private criticalFileSelector: CriticalFileSelector,
    private toolRegistryLoader: ToolRegistryLoader
  ) {}

  /**
   * Analyze files and collect quality check results for AI interpretation
   *
   * Workflow:
   * 1. Get change statistics for files (git diff --numstat)
   * 2. Generate manifest (language detection, profile selection, context)
   * 3. Run quality checks via ToolchainService (raw tool outputs)
   * 4. Select critical files if policy enables it
   * 5. Package findings with auto-fix flags for AI
   *
   * @param fileList - Files to review
   * @param options - Review configuration (scope, critical selection)
   * @returns Structured findings for AI interpretation
   */
  async analyzeFiles(fileList: string[], options: ReviewOptions): Promise<ReviewFindings> {
    this.logger.info('Starting file analysis', {
      fileCount: fileList.length,
      scope: options.scope,
      criticalSelection: options.enableCriticalSelection,
    });

    // 1. Get change statistics for accurate risk scoring
    const changeStats = await getFileChangeStats(fileList);
    this.logger.debug('Got file change stats', { statsCount: changeStats.length });

    // 2. Generate manifest (determines what to review)
    const classifier = new ReviewTierClassifier();
    const tierRecommendation = classifier.classifyChanges(changeStats);

    const manifest = this.manifestGenerator.generateManifest(
      options.scope.target, // Use target as feature identifier
      changeStats,
      tierRecommendation,
      {
        fileList,
        scope: options.scope,
      }
    );
    this.logger.debug('Generated manifest', { tier: manifest.recommended_tier });

    // 3. Run quality checks (get raw tool results)
    const toolResults = await this.toolchainService.runQualityChecks(fileList);
    this.logger.debug('Ran quality checks', { resultCount: toolResults.length });

    // 4. Select critical files if enabled (policy decision)
    let criticalReport: CriticalFilesReport | undefined;
    if (options.enableCriticalSelection) {
      criticalReport = this.criticalFileSelector.selectCriticalFiles(changeStats, toolResults, {
        maxFiles: 10,
      });
      this.logger.debug('Selected critical files', {
        topFilesCount: criticalReport.topFiles.length,
      });
    }

    // 5. Package findings for AI (enrich with auto-fix info)
    return this.packageFindings(toolResults, criticalReport, manifest);
  }

  /**
   * Package raw tool results into structured findings for AI
   * Enriches results with auto-fixable flags based on tool registry
   */
  private async packageFindings(
    toolResults: RawToolResult[],
    criticalReport: CriticalFilesReport | undefined,
    manifest: ReviewManifest
  ): Promise<ReviewFindings> {
    // Load tool registry for auto-fix detection
    const registry = await this.toolRegistryLoader.load();

    // Enrich tool results with autoFixable flags
    const enrichedResults: EnrichedToolResult[] = toolResults.map((result) => ({
      tool: result.tool,
      checkType: result.type,
      success: isToolResultSuccessful(result),
      output: this.combineOutput(result.stdout, result.stderr),
      autoFixable: this.isAutoFixable(result.tool, registry.tools),
      skipped: result.skipped,
      reason: result.reason,
    }));

    this.logger.info('Packaged findings', {
      toolResultsCount: enrichedResults.length,
      hasCriticalFiles: !!criticalReport,
    });

    return {
      rawToolResults: toolResults,
      toolResults: enrichedResults,
      criticalFiles: criticalReport,
      manifest,
      metadata: {
        scope: manifest.scope!,
        timestamp: new Date().toISOString(),
        tier: manifest.recommended_tier,
      },
    };
  }

  /**
   * Combine stdout and stderr into single output string
   * Preserves both streams for AI interpretation
   */
  private combineOutput(stdout?: string, stderr?: string): string {
    const parts: string[] = [];

    if (stdout?.trim()) {
      parts.push(stdout.trim());
    }

    if (stderr?.trim()) {
      parts.push(stderr.trim());
    }

    return parts.join('\n\n');
  }

  /**
   * Determine if a tool can auto-fix issues
   * Conservative approach: only true if tool has fix_command configured
   */
  private isAutoFixable(
    toolName: string,
    toolRegistry: Record<string, import('../types/toolchain.js').ToolRegistryEntry>
  ): boolean {
    const toolInfo = toolRegistry[toolName];
    // HODGE-359.1: Defensive check - toolName may not exist in registry
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!toolInfo) return false;
    return !!toolInfo.fix_command;
  }
}
