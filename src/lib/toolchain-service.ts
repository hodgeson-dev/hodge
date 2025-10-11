/**
 * ToolchainService: Detects and executes quality tools
 * Part of HODGE-341.1: Build System Detection and Toolchain Infrastructure
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import yaml from 'js-yaml';
import type {
  ToolchainConfig,
  DetectedTool,
  RawToolResult,
  FileScope,
  QualityChecksMapping,
} from '../types/toolchain.js';
import { createCommandLogger } from './logger.js';

const exec = promisify(execCallback);
const logger = createCommandLogger('toolchain-service');

// Type definition for package.json structure
interface PackageJson {
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
}

// Type definition for exec error with additional properties
interface ExecError extends Error {
  code?: string;
  stdout?: string;
  stderr?: string;
}

/**
 * Service for detecting and executing quality tools
 */
export class ToolchainService {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Load toolchain configuration from .hodge/toolchain.yaml
   */
  async loadConfig(): Promise<ToolchainConfig> {
    const configPath = join(this.cwd, '.hodge', 'toolchain.yaml');

    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = yaml.load(content) as ToolchainConfig;

      logger.debug('Loaded toolchain config', { config });
      return config;
    } catch (error) {
      logger.error('Failed to load toolchain config', { error: error as Error });
      throw new Error(
        `Failed to load toolchain config from ${configPath}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Detect available tools using three-tier detection:
   * 1. Config files (highest priority)
   * 2. package.json devDependencies
   * 3. PATH (lowest priority - not implemented in Phase 1)
   */
  async detectTools(): Promise<DetectedTool[]> {
    const tools: DetectedTool[] = [];

    // TypeScript detection
    const tsConfig = await this.fileExists('tsconfig.json');
    if (tsConfig) {
      const version = await this.getToolVersion('typescript', 'tsc --version');
      tools.push({
        name: 'typescript',
        detected: true,
        version,
        detectionMethod: 'config_file',
      });
    }

    // ESLint detection
    const eslintConfig =
      (await this.fileExists('.eslintrc.json')) ||
      (await this.fileExists('.eslintrc.js')) ||
      (await this.fileExists('.eslintrc.yaml'));
    if (eslintConfig) {
      const version = await this.getToolVersion('eslint', 'eslint --version');
      tools.push({
        name: 'eslint',
        detected: true,
        version,
        detectionMethod: 'config_file',
      });
    }

    // Prettier detection
    const prettierConfig =
      (await this.fileExists('.prettierrc')) ||
      (await this.fileExists('.prettierrc.json')) ||
      (await this.fileExists('.prettierrc.js')) ||
      (await this.fileExists('prettier.config.js'));
    if (prettierConfig) {
      const version = await this.getToolVersion('prettier', 'prettier --version');
      tools.push({
        name: 'prettier',
        detected: true,
        version,
        detectionMethod: 'config_file',
      });
    }

    // Vitest detection
    const vitestConfig =
      (await this.fileExists('vitest.config.ts')) || (await this.fileExists('vitest.config.js'));
    if (vitestConfig) {
      const version = await this.getToolVersion('vitest', 'vitest --version');
      tools.push({
        name: 'vitest',
        detected: true,
        version,
        detectionMethod: 'config_file',
      });
    }

    // Check package.json for tools not found via config files
    await this.detectFromPackageJson(tools);

    logger.info('Tool detection complete', { toolCount: tools.length });
    return tools;
  }

  /**
   * Detect tools from package.json devDependencies
   */
  private async detectFromPackageJson(existingTools: DetectedTool[]): Promise<void> {
    try {
      const packageJsonPath = join(this.cwd, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const parsed: unknown = JSON.parse(content);

      // Type guard for package.json
      if (typeof parsed !== 'object' || parsed === null) {
        logger.warn('package.json is not a valid object');
        return;
      }

      const packageJson = parsed as PackageJson;
      const devDeps = packageJson.devDependencies ?? {};

      const toolsToCheck = ['typescript', 'eslint', 'prettier', 'vitest'];

      for (const toolName of toolsToCheck) {
        // Skip if already detected via config file
        if (existingTools.some((t) => t.name === toolName)) {
          continue;
        }

        // Check if tool is in devDependencies
        if (devDeps[toolName]) {
          existingTools.push({
            name: toolName,
            detected: true,
            detectionMethod: 'package_json',
          });
        }
      }
    } catch (error) {
      logger.warn('Could not read package.json for tool detection', {
        error: error as Error,
      });
    }
  }

  /**
   * Get version of a tool by executing its version command
   */
  private async getToolVersion(
    toolName: string,
    versionCommand: string
  ): Promise<string | undefined> {
    try {
      const { stdout } = await exec(`npx ${versionCommand}`, { cwd: this.cwd });
      // Extract version number from output (e.g., "Version 5.3.3" -> "5.3.3")
      const match = stdout.match(/\d+\.\d+\.\d+/);
      return match ? match[0] : undefined;
    } catch (error) {
      logger.debug(`Could not detect ${toolName} version`, { error: error as Error });
      return undefined;
    }
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filename: string): Promise<boolean> {
    try {
      await fs.access(join(this.cwd, filename));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run all quality checks based on configuration
   */
  async runQualityChecks(scope: FileScope): Promise<RawToolResult[]> {
    const config = await this.loadConfig();
    const files = scope === 'uncommitted' ? await this.getUncommittedFiles() : undefined;

    logger.info('Running quality checks', { scope, fileCount: files?.length });

    const results = await Promise.all([
      this.runCheckType('type_checking', config, files),
      this.runCheckType('linting', config, files),
      this.runCheckType('testing', config, files),
      this.runCheckType('formatting', config, files),
    ]);

    return results.flat();
  }

  /**
   * Run checks for a specific quality check type
   */
  private async runCheckType(
    checkType: keyof QualityChecksMapping,
    config: ToolchainConfig,
    files?: string[]
  ): Promise<RawToolResult[]> {
    const toolNames = config.quality_checks[checkType];

    if (toolNames.length === 0) {
      return [
        {
          type: checkType,
          tool: 'none',
          skipped: true,
          reason: 'No tools configured for this check type',
        },
      ];
    }

    // Run all configured tools for this check type
    const results = [];
    for (const toolName of toolNames) {
      const toolConfig = config.commands[toolName];
      if (!toolConfig) {
        logger.warn(`Tool ${toolName} not found in commands configuration`);
        continue;
      }

      const result = await this.executeTool(checkType, toolName, toolConfig.command, files);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute a tool command with file scoping
   */
  private async executeTool(
    checkType: keyof QualityChecksMapping,
    toolName: string,
    commandTemplate: string,
    files?: string[]
  ): Promise<RawToolResult> {
    // Substitute ${files} placeholder with actual files
    const command = this.substituteFiles(commandTemplate, files);

    logger.debug('Executing tool', { tool: toolName, command });

    try {
      const { stdout, stderr } = await exec(command, { cwd: this.cwd });

      return {
        type: checkType,
        tool: toolName,
        success: true,
        stdout,
        stderr,
      };
    } catch (error: unknown) {
      // Type guard for exec error
      const execError = error as ExecError;

      // Check if tool is not available
      if (execError.message.includes('command not found') || execError.code === 'ENOENT') {
        logger.warn(`Tool ${toolName} not available`, { error: execError });
        return {
          type: checkType,
          tool: toolName,
          skipped: true,
          reason: `Tool not available. Install with: npm install --save-dev ${toolName}`,
        };
      }

      // Tool ran but found issues (exit code 1)
      return {
        type: checkType,
        tool: toolName,
        success: false,
        stdout: execError.stdout ?? '',
        stderr: execError.stderr ?? '',
      };
    }
  }

  /**
   * Substitute ${files} placeholder in command template
   */
  private substituteFiles(commandTemplate: string, files?: string[]): string {
    if (!commandTemplate.includes('${files}')) {
      // No placeholder - return as-is
      return commandTemplate;
    }

    // Replace ${files} with file list or '.' for all files
    const filesArg = files?.length ? files.join(' ') : '.';
    return commandTemplate.replace(/\$\{files\}/g, filesArg);
  }

  /**
   * Get list of uncommitted files from git
   */
  async getUncommittedFiles(): Promise<string[]> {
    try {
      // Get working tree changes
      const { stdout: working } = await exec('git diff HEAD --name-only', { cwd: this.cwd });

      // Get staged changes
      const { stdout: staged } = await exec('git diff --cached --name-only', {
        cwd: this.cwd,
      });

      // Combine and dedupe
      const allFiles = [
        ...new Set([...working.split('\n').filter(Boolean), ...staged.split('\n').filter(Boolean)]),
      ];

      // Filter by extension
      const filteredFiles = allFiles.filter(
        (f) => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')
      );

      logger.info('Found uncommitted files', { count: filteredFiles.length });
      return filteredFiles;
    } catch (error) {
      logger.error('Failed to get uncommitted files from git', { error: error as Error });
      throw new Error(`Failed to get uncommitted files: ${(error as Error).message}`);
    }
  }
}
