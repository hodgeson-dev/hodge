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
  // HODGE-351: Cache package.json per instance (directory-specific)
  private packageJsonCache?: PackageJson | null;
  // HODGE-351: Static command cache (shared across all instances)
  // Commands in PATH don't change per directory, so we can share this cache
  private static commandCache: Map<string, boolean> = new Map();

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
   * HODGE-351: Cached to avoid re-reading package.json for every tool
   */
  private async hasPackageDependency(packageName: string): Promise<boolean> {
    // Load and cache package.json on first call
    if (this.packageJsonCache === undefined) {
      try {
        const packageJsonPath = join(this.cwd, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const parsed: unknown = JSON.parse(content);

        if (typeof parsed !== 'object' || parsed === null) {
          this.packageJsonCache = null;
          return false;
        }

        this.packageJsonCache = parsed as PackageJson;
      } catch {
        this.packageJsonCache = null;
        return false;
      }
    }

    // Return false if package.json doesn't exist or is invalid
    if (this.packageJsonCache === null) {
      return false;
    }

    const deps = {
      ...(this.packageJsonCache.dependencies ?? {}),
      ...(this.packageJsonCache.devDependencies ?? {}),
    };

    return packageName in deps;
  }

  /**
   * Check if a command exists in PATH
   * HODGE-351: Static cache to avoid repeated subprocess spawning (major bottleneck)
   * - Each exec() call takes ~100-200ms, and we check 16+ commands per detectTools()
   * - Cache is static because command availability doesn't change per directory
   * - First detectTools() call populates cache, subsequent calls are instant
   */
  private async commandExists(command: string): Promise<boolean> {
    // Check static cache first
    if (ToolchainService.commandCache.has(command)) {
      return ToolchainService.commandCache.get(command)!;
    }

    try {
      // Use 'which' on Unix-like systems, 'where' on Windows
      const whichCommand = process.platform === 'win32' ? 'where' : 'which';
      await exec(`${whichCommand} ${command}`, { cwd: this.cwd });
      ToolchainService.commandCache.set(command, true);
      return true;
    } catch {
      ToolchainService.commandCache.set(command, false);
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
      // Set timeout to 2 seconds to prevent hanging on npx downloads
      const { stdout } = await exec(`npx ${versionCommand}`, {
        cwd: this.cwd,
        timeout: 2000,
      });
      // Extract version number from output (e.g., "Version 5.3.3" -> "5.3.3")
      // Use word boundary and non-backtracking pattern to avoid ReDoS
      const versionPattern = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/;
      const match = versionPattern.exec(stdout);
      return match?.[0];
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
   * HODGE-341.2: Added 'feature' scope support using commit range tracking
   * HODGE-344.3: Extended to accept explicit file lists for file-based reviews
   */
  async runQualityChecks(scope: FileScope | string[], feature?: string): Promise<RawToolResult[]> {
    const config = await this.loadConfig();
    let files: string[] | undefined;

    // Handle explicit file list (HODGE-344.3)
    if (Array.isArray(scope)) {
      files = scope;
      logger.info('Running quality checks', { scope: 'explicit-files', fileCount: files.length });
    } else {
      // Handle existing FileScope enum values
      if (scope === 'uncommitted') {
        files = await this.getUncommittedFiles();
      } else if (scope === 'feature') {
        if (!feature) {
          throw new Error('Feature name required for "feature" scope');
        }
        files = await this.getFeatureFiles(feature);
      }
      // scope === 'all' => files = undefined (check all files)

      logger.info('Running quality checks', { scope, feature, fileCount: files?.length });
    }

    const results = await Promise.all([
      this.runCheckType('type_checking', config, files),
      this.runCheckType('linting', config, files),
      this.runCheckType('testing', config, files),
      this.runCheckType('formatting', config, files),
      this.runCheckType('complexity', config, files),
      this.runCheckType('code_smells', config, files),
      this.runCheckType('duplication', config, files),
      this.runCheckType('architecture', config, files),
      this.runCheckType('security', config, files),
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
      // Tool should exist in commands if it's in quality_checks (config validation ensures this)
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
   * Properly escapes file paths to avoid shell expansion issues (e.g., braces in git renames)
   */
  private substituteFiles(commandTemplate: string, files?: string[]): string {
    if (!commandTemplate.includes('${files}')) {
      // No placeholder - return as-is
      return commandTemplate;
    }

    // Replace ${files} with file list or '.' for all files
    // Properly quote each file path to avoid shell expansion (e.g., {old => new} in renames)
    const filesArg = files?.length
      ? files.map((f) => `'${f.replace(/'/g, "'\\''")}'`).join(' ')
      : '.';
    return commandTemplate.replace(/\$\{files\}/g, filesArg);
  }

  /**
   * Parse git rename notation to extract the actual file path
   * Git shows renames as: path/{old => new}/file or {old => new}path/file
   * We need to extract the new path: path/new/file or newpath/file
   */
  private parseRenamedPath(gitPath: string): string {
    // Match rename pattern: {old => new}
    const startBrace = gitPath.indexOf('{');
    const arrow = gitPath.indexOf(' => ', startBrace);
    const endBrace = gitPath.indexOf('}', arrow);

    if (startBrace !== -1 && arrow !== -1 && endBrace !== -1) {
      // Extract the new name from {old => new}
      const newName = gitPath.substring(arrow + 4, endBrace); // +4 to skip ' => '
      // Replace the entire {old => new} with just the new part
      return gitPath.substring(0, startBrace) + newName + gitPath.substring(endBrace + 1);
    }

    // Not a rename, return as-is
    return gitPath;
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

      // Combine, parse renames, and dedupe
      const allFiles = [
        ...new Set([
          ...working
            .split('\n')
            .filter(Boolean)
            .map((f) => this.parseRenamedPath(f)),
          ...staged
            .split('\n')
            .filter(Boolean)
            .map((f) => this.parseRenamedPath(f)),
        ]),
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

  /**
   * Get list of files changed in a feature using commit range from ship-record.json
   * HODGE-341.2: Uses buildStartCommit from ship-record to scope file changes
   * Includes both committed AND uncommitted changes since buildStartCommit
   */
  async getFeatureFiles(feature: string): Promise<string[]> {
    try {
      // Read ship-record.json to get buildStartCommit
      const shipRecordPath = join(this.cwd, '.hodge', 'features', feature, 'ship-record.json');
      const { readFile } = await import('fs/promises');
      const shipRecordContent = await readFile(shipRecordPath, 'utf-8');
      const shipRecord = JSON.parse(shipRecordContent) as { buildStartCommit?: string };

      if (!shipRecord.buildStartCommit) {
        logger.warn(
          'No buildStartCommit found in ship-record.json, falling back to uncommitted files'
        );
        return await this.getUncommittedFiles();
      }

      // Get all files changed since buildStartCommit (includes working tree)
      // Using single dot (..) to include uncommitted changes
      // --diff-filter=d excludes deleted files (prevents checking non-existent files)
      const { stdout } = await exec(
        `git diff ${shipRecord.buildStartCommit} --name-only --diff-filter=d`,
        {
          cwd: this.cwd,
        }
      );

      // Parse renamed files to extract actual paths
      const allFiles = stdout
        .split('\n')
        .filter(Boolean)
        .map((f) => this.parseRenamedPath(f));

      // Filter by extension
      const filteredFiles = allFiles.filter(
        (f) => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')
      );

      logger.info('Found feature files', {
        feature,
        commitRange: `${shipRecord.buildStartCommit.substring(0, 7)}..working-tree`,
        count: filteredFiles.length,
      });

      return filteredFiles;
    } catch (error) {
      logger.error('Failed to get feature files from git', { feature, error: error as Error });
      // Fallback to uncommitted files if we can't read ship-record or run git
      logger.warn('Falling back to uncommitted files');
      return await this.getUncommittedFiles();
    }
  }
}
