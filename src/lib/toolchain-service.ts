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
  AnyDetectionRule,
} from '../types/toolchain.js';
import { createCommandLogger } from './logger.js';
import { ToolRegistryLoader } from './tool-registry-loader.js';

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
 * HODGE-341.2: Refactored to use tool registry for generic detection
 */
export class ToolchainService {
  private cwd: string;
  private registryLoader: ToolRegistryLoader;

  constructor(cwd: string = process.cwd(), registryLoader?: ToolRegistryLoader) {
    this.cwd = cwd;
    this.registryLoader = registryLoader ?? new ToolRegistryLoader();
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
   * Detect available tools using registry-based detection
   * HODGE-341.2: Generic detection engine that reads tool registry
   *
   * Detection priority (from registry rules):
   * 1. Config files (highest priority)
   * 2. package.json devDependencies
   * 3. PATH/command existence (lowest priority)
   */
  async detectTools(): Promise<DetectedTool[]> {
    const tools: DetectedTool[] = [];
    const registry = await this.registryLoader.load();

    // Iterate through all tools in registry
    for (const [toolName, toolInfo] of Object.entries(registry.tools)) {
      // Try each detection rule in order (stops at first match)
      for (const rule of toolInfo.detection) {
        const detected = await this.runDetectionRule(rule);

        if (detected) {
          // Get version if version_command is specified
          const version = toolInfo.version_command
            ? await this.getToolVersion(toolName, toolInfo.version_command)
            : undefined;

          tools.push({
            name: toolName,
            detected: true,
            version,
            detectionMethod: rule.type,
          });

          // Stop checking other rules for this tool
          break;
        }
      }
    }

    logger.info('Tool detection complete', {
      toolCount: tools.length,
      tools: tools.map((t) => t.name),
    });

    return tools;
  }

  /**
   * Execute a detection rule
   * HODGE-341.2: Generic detection rule execution
   */
  private async runDetectionRule(rule: AnyDetectionRule): Promise<boolean> {
    switch (rule.type) {
      case 'config_file':
        return await this.anyFileExists(rule.paths);

      case 'package_json':
        return await this.hasPackageDependency(rule.package);

      case 'command':
        return await this.commandExists(rule.command);

      case 'eslint_plugin':
        return await this.checkEslintPlugin(rule.plugin_name);

      default:
        logger.warn('Unknown detection rule type', { rule });
        return false;
    }
  }

  /**
   * Check if any of the specified files exist
   */
  private async anyFileExists(paths: string[]): Promise<boolean> {
    for (const path of paths) {
      if (await this.fileExists(path)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a package is in dependencies or devDependencies
   */
  private async hasPackageDependency(packageName: string): Promise<boolean> {
    try {
      const packageJsonPath = join(this.cwd, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const parsed: unknown = JSON.parse(content);

      if (typeof parsed !== 'object' || parsed === null) {
        return false;
      }

      const packageJson = parsed as PackageJson;
      const deps = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };

      return packageName in deps;
    } catch {
      return false;
    }
  }

  /**
   * Check if a command exists in PATH
   */
  private async commandExists(command: string): Promise<boolean> {
    try {
      // Use 'which' on Unix-like systems, 'where' on Windows
      const whichCommand = process.platform === 'win32' ? 'where' : 'which';
      await exec(`${whichCommand} ${command}`, { cwd: this.cwd });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if an ESLint plugin is configured in .eslintrc
   */
  private async checkEslintPlugin(pluginName: string): Promise<boolean> {
    const eslintConfigFiles = [
      '.eslintrc.json',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.yaml',
      '.eslintrc.yml',
    ];

    for (const configFile of eslintConfigFiles) {
      try {
        const configPath = join(this.cwd, configFile);
        const content = await fs.readFile(configPath, 'utf-8');

        // Simple string search for plugin name
        // This handles both "plugins": ["sonarjs"] and "extends": ["plugin:sonarjs/recommended"]
        if (content.includes(pluginName)) {
          logger.debug('Found ESLint plugin in config', { pluginName, configFile });
          return true;
        }
      } catch {
        // File doesn't exist or can't be read, try next one
        continue;
      }
    }

    return false;
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

    if (!toolNames || toolNames.length === 0) {
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
