import { exec } from 'child_process';
import { promisify } from 'util';
import { getStagedFiles, stageFiles } from './git-utils.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

/**
 * Result of running auto-fix for a single tool
 * HODGE-341.6: Auto-fix workflow - tools fix simple issues
 */
export interface AutoFixResult {
  tool: string;
  filesProcessed: number;
  issuesFixed: number;
  success: boolean;
  stdout: string;
  stderr: string;
  duration: number;
}

/**
 * Complete report of auto-fix execution across all tools
 * HODGE-341.6: Tracks what was fixed, failures, and summary metrics
 */
export interface AutoFixReport {
  timestamp: string;
  stagedFiles: string[];
  results: AutoFixResult[];
  totalIssuesFixed: number;
  totalFilesModified: number;
  failures: AutoFixResult[];
}

/**
 * Tool configuration from toolchain.yaml
 */
interface ToolConfig {
  command: string;
  fix_command?: string;
}

/**
 * Toolchain configuration structure
 */
interface ToolchainConfig {
  language: string;
  commands: Record<string, ToolConfig>;
  projects?: Array<{
    path: string;
    language: string;
    commands: Record<string, ToolConfig>;
  }>;
}

/**
 * Service for running auto-fix tools on staged files
 * HODGE-341.6: Implements the auto-fix workflow
 *
 * Workflow:
 * 1. Get staged files from git
 * 2. Identify tools with fix_command in toolchain.yaml
 * 3. Run fix commands in order (formatters first, then linters)
 * 4. Re-stage modified files
 * 5. Generate report
 */
export class AutoFixService {
  /**
   * Run auto-fix on staged files for all tools with fix_command
   */
  async runAutoFix(toolchainConfig: ToolchainConfig): Promise<AutoFixReport> {
    // 1. Get staged files from git
    const stagedFiles = await getStagedFiles();

    if (stagedFiles.length === 0) {
      logger.info('No staged files - skipping auto-fix');
      return this.emptyReport();
    }

    logger.info(`🔧 Auto-fixing ${stagedFiles.length} staged files...`);

    // 2. Identify tools with fix_command
    const fixableTools = this.getFixableTools(toolchainConfig);

    if (fixableTools.length === 0) {
      logger.info('No tools with fix_command configured - skipping auto-fix');
      return this.emptyReport();
    }

    // 3. Run fix commands in order (formatters first, then linters)
    const results: AutoFixResult[] = [];
    const orderedTools = this.orderToolsByType(fixableTools);

    for (const toolName of orderedTools) {
      const result = await this.runToolFix(toolName, stagedFiles, toolchainConfig);
      results.push(result);

      // Report progress
      if (result.success) {
        logger.info(
          `  ✓ ${toolName}: Fixed ${result.issuesFixed} issues in ${result.filesProcessed} files`
        );
      } else {
        logger.warn(`  ⚠️ ${toolName}: ${result.stderr || 'Failed to apply fixes'}`);
      }
    }

    // 4. Re-stage modified files
    await this.restageFiles(stagedFiles);

    // 5. Generate report
    const report = this.generateReport(stagedFiles, results);
    logger.info(
      `\n📊 Auto-fix summary: ${report.totalIssuesFixed} issues fixed across ${report.totalFilesModified} files\n`
    );

    return report;
  }

  /**
   * Run auto-fix for a single tool
   */
  private async runToolFix(
    toolName: string,
    stagedFiles: string[],
    config: ToolchainConfig
  ): Promise<AutoFixResult> {
    const startTime = Date.now();

    try {
      // Get fix command from config
      const toolConfig = config.commands[toolName];
      if (!toolConfig.fix_command) {
        return this.createSkippedResult(toolName, 'No fix_command configured');
      }

      // Filter files to tool's scope
      const scopedFiles = this.filterFilesForTool(stagedFiles, toolName);
      if (scopedFiles.length === 0) {
        return this.createSkippedResult(toolName, 'No files match tool scope');
      }

      // Substitute ${files} in fix_command
      const command = toolConfig.fix_command.replace('${files}', scopedFiles.join(' '));

      // Execute fix command
      const { stdout, stderr } = await execAsync(command, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });

      // Parse output to count issues fixed (heuristic)
      const issuesFixed = this.parseIssuesFixed(stdout, toolName);

      return {
        tool: toolName,
        filesProcessed: scopedFiles.length,
        issuesFixed,
        success: true,
        stdout,
        stderr,
        duration: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const err = error as { code?: number; stdout?: string; stderr?: string; message?: string };

      // Some tools exit with non-zero even on success (e.g., eslint when it fixes issues)
      // Check if we got output despite the error
      if (err.stdout) {
        const issuesFixed = this.parseIssuesFixed(err.stdout, toolName);
        return {
          tool: toolName,
          filesProcessed: this.filterFilesForTool(stagedFiles, toolName).length,
          issuesFixed,
          success: true,
          stdout: err.stdout,
          stderr: err.stderr || '',
          duration: Date.now() - startTime,
        };
      }

      return {
        tool: toolName,
        filesProcessed: 0,
        issuesFixed: 0,
        success: false,
        stdout: err.stdout || '',
        stderr: err.stderr || err.message || String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Re-stage files that were modified by auto-fix
   */
  private async restageFiles(stagedFiles: string[]): Promise<void> {
    try {
      await stageFiles(stagedFiles);
    } catch (error) {
      logger.warn(`Failed to re-stage files: ${String(error)}`);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get list of tools that have fix_command configured
   */
  private getFixableTools(config: ToolchainConfig): string[] {
    const tools: string[] = [];

    // Determine which command sets to check
    const commandSets =
      config.language === 'multi' && config.projects
        ? config.projects.map((p) => p.commands)
        : [config.commands];

    // Collect all tools with fix_command
    for (const commands of commandSets) {
      for (const [toolName, toolConfig] of Object.entries(commands)) {
        if (toolConfig.fix_command) {
          tools.push(toolName);
        }
      }
    }

    return [...new Set(tools)]; // Deduplicate
  }

  /**
   * Order tools by type: formatters first, then linters
   * This ensures consistent baseline before linters make fixes
   */
  private orderToolsByType(tools: string[]): string[] {
    const formatters = new Set(['prettier', 'black', 'google-java-format', 'ktlint']);
    const linters = new Set(['eslint', 'ruff']);

    // Partition tools into categories
    const formatterList = tools.filter((t) => formatters.has(t));
    const linterList = tools.filter((t) => linters.has(t));
    const otherList = tools.filter((t) => !formatters.has(t) && !linters.has(t));

    // Concatenate in order: formatters, linters, others
    return [...formatterList, ...linterList, ...otherList];
  }

  /**
   * Filter files to those handled by this tool based on file extensions
   */
  private filterFilesForTool(files: string[], toolName: string): string[] {
    const extensions = this.getToolExtensions(toolName);

    return files.filter((file) => extensions.some((ext) => file.endsWith(ext)));
  }

  /**
   * Map tools to file extensions they handle
   */
  private getToolExtensions(toolName: string): string[] {
    const extensionMap: Record<string, string[]> = {
      eslint: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
      prettier: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml', '.css', '.html'],
      black: ['.py'],
      ruff: ['.py'],
      ktlint: ['.kt', '.kts'],
      'google-java-format': ['.java'],
    };

    return extensionMap[toolName] || [];
  }

  /**
   * Parse tool output to count issues fixed (heuristic)
   * Different tools have different output formats
   */
  private parseIssuesFixed(output: string, toolName: string): number {
    // Use bounded quantifiers to avoid backtracking issues (sonarjs/slow-regex)
    // Limit digits to 1-6 (reasonable for issue counts < 1 million)
    if (toolName === 'eslint') {
      const match = /(\d{1,6}) problem/.exec(output);
      return match ? parseInt(match[1], 10) : 0;
    }
    if (toolName === 'prettier') {
      const match = /(\d{1,6}) file/.exec(output);
      return match && output.includes('formatted') ? parseInt(match[1], 10) : 0;
    }
    if (toolName === 'black') {
      const match = /reformatted (\d{1,6}) file/.exec(output);
      return match ? parseInt(match[1], 10) : 0;
    }
    if (toolName === 'ruff') {
      const match = /Fixed (\d{1,6}) error/.exec(output);
      return match ? parseInt(match[1], 10) : 0;
    }

    // Unknown tool - check if output suggests success
    return output.trim().length > 0 ? 1 : 0;
  }

  /**
   * Generate complete auto-fix report
   */
  private generateReport(stagedFiles: string[], results: AutoFixResult[]): AutoFixReport {
    const totalIssuesFixed = results.reduce((sum, r) => sum + r.issuesFixed, 0);
    const totalFilesModified = results.reduce((sum, r) => sum + r.filesProcessed, 0);
    const failures = results.filter((r) => !r.success);

    return {
      timestamp: new Date().toISOString(),
      stagedFiles,
      results,
      totalIssuesFixed,
      totalFilesModified,
      failures,
    };
  }

  /**
   * Create empty report (when no staged files or no fixable tools)
   */
  private emptyReport(): AutoFixReport {
    return {
      timestamp: new Date().toISOString(),
      stagedFiles: [],
      results: [],
      totalIssuesFixed: 0,
      totalFilesModified: 0,
      failures: [],
    };
  }

  /**
   * Create result for skipped tool (not a failure)
   */
  private createSkippedResult(toolName: string, reason: string): AutoFixResult {
    return {
      tool: toolName,
      filesProcessed: 0,
      issuesFixed: 0,
      success: true, // Skipped is not a failure
      stdout: reason,
      stderr: '',
      duration: 0,
    };
  }
}
