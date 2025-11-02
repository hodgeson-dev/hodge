import { createCommandLogger } from './logger.js';
/**
 * Hodge Structure Generator
 * Creates .hodge directory and initial configuration files
 * Provides secure file generation with comprehensive error handling
 */

import fs from 'fs-extra';
import path from 'path';
import { PM_SCRIPTS_README } from './pm-readme-template.js';
import { ProjectInfo } from './detection.js';
import {
  getLinearScripts,
  getGitHubScripts,
  getJiraScripts,
  getTrelloScripts,
  getAsanaScripts,
  getCommonScripts,
  PMScript,
} from './pm-scripts-templates.js';
import { installHodgeWay } from './install-hodge-way.js';

/**
 * Custom error class for structure generation errors
 */
export class StructureGenerationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'StructureGenerationError';
  }
}

/**
 * Security utilities for PM script generation
 */
class ScriptSecurityValidator {
  /**
   * Validates script content for security issues
   * @param content - The script content to validate
   * @param scriptType - The type of script being validated
   * @throws {StructureGenerationError} If security issues are found
   */
  static validateScriptContent(content: string, scriptType: string): void {
    // Check for potential security issues
    const securityPatterns = [
      { pattern: /eval\s*\(/gi, issue: 'eval() usage' },
      { pattern: /exec\s*\(/gi, issue: 'exec() usage' },
      { pattern: /spawn\s*\(/gi, issue: 'spawn() usage without validation' },
      { pattern: /execSync\s*\(/gi, issue: 'execSync() usage' },
      { pattern: /child_process/gi, issue: 'direct child_process usage' },
      // Removed overly broad template literal check - only flag dangerous patterns
      { pattern: /require\s*\(\s*['"]\s*\.\./gi, issue: 'relative require paths' },
      // Use bounded quantifier to prevent ReDoS
      { pattern: /import\s+.{1,200}?from\s+['"]\s*\.\./gi, issue: 'relative import paths' },
    ];

    for (const { pattern, issue } of securityPatterns) {
      if (pattern.test(content)) {
        throw new StructureGenerationError(`Security issue in ${scriptType}: ${issue}`);
      }
    }
  }

  /**
   * Validates that script path is safe
   * @param scriptPath - The path where the script will be written
   * @throws {StructureGenerationError} If path is unsafe
   */
  static validateScriptPath(scriptPath: string): void {
    // Ensure path is within allowed directories
    if (scriptPath.includes('..') || scriptPath.includes('~')) {
      throw new StructureGenerationError('Script path contains unsafe path traversal');
    }

    // Ensure script has safe extension
    if (!scriptPath.endsWith('.js') && !scriptPath.endsWith('.md')) {
      throw new StructureGenerationError('Script must have .js or .md extension');
    }
  }

  /**
   * Sanitizes environment variable names
   * @param envVarName - The environment variable name to sanitize
   * @returns Sanitized environment variable name
   */
  static sanitizeEnvVarName(envVarName: string): string {
    // Only allow alphanumeric characters and underscores
    const sanitized = envVarName.replace(/[^A-Z0-9_]/g, '');
    if (!sanitized || sanitized !== envVarName) {
      throw new StructureGenerationError(`Invalid environment variable name: ${envVarName}`);
    }
    return sanitized;
  }
}

/**
 * Configuration object stored in .hodge/config.json
 */
export interface HodgeConfig {
  /** The project name */
  projectName: string;
  /** The detected project type */
  projectType: string;
  /** All detected development tools */
  detectedTools: {
    packageManager: string | null;
    testFramework: string[];
    linting: string[];
    buildTools: string[];
    hasGit: boolean;
    gitRemote?: string;
  };
  /** ISO timestamp when config was created */
  createdAt: string;
  /** Hodge configuration version */
  version: string;
}

/**
 * Generates the .hodge directory structure and configuration files
 */
export class StructureGenerator {
  private logger = createCommandLogger('structure-generation-error', { enableConsole: false });

  /**
   * Creates a new StructureGenerator instance
   * @param rootPath - The root path where .hodge should be created
   * @throws {StructureGenerationError} If the rootPath is invalid
   */
  constructor(private rootPath: string = process.cwd()) {
    this.validateRootPath(rootPath);
  }

  /**
   * Validates that the root path exists and is writable
   * @param rootPath - The path to validate
   * @throws {StructureGenerationError} If the path is invalid or not writable
   */
  private validateRootPath(rootPath: string): void {
    if (!rootPath || typeof rootPath !== 'string') {
      throw new StructureGenerationError('Root path must be a non-empty string');
    }

    // Check for path traversal attempts
    if (rootPath.includes('../') || rootPath.includes('..\\')) {
      throw new StructureGenerationError('Path traversal detected in root path');
    }

    if (!path.isAbsolute(rootPath)) {
      this.rootPath = path.resolve(rootPath);
    }

    try {
      const stat = fs.statSync(this.rootPath);
      if (!stat.isDirectory()) {
        throw new StructureGenerationError(`Path is not a directory: ${this.rootPath}`);
      }

      // Test write permissions by attempting to create a temporary file
      const tempPath = path.join(this.rootPath, `.hodge-write-test-${Date.now()}`);
      fs.writeFileSync(tempPath, '');
      fs.unlinkSync(tempPath);
    } catch (error) {
      if (error instanceof StructureGenerationError) throw error;
      throw new StructureGenerationError(
        `Cannot write to directory: ${this.rootPath}`,
        error as Error
      );
    }
  }

  /**
   * Generates the complete .hodge directory structure
   * @param projectInfo - The detected project information
   * @throws {StructureGenerationError} If generation fails
   */
  async generateStructure(projectInfo: ProjectInfo): Promise<void> {
    // TypeScript ensures projectInfo is defined via type system

    const hodgePath = this.safePath('.hodge');
    if (!hodgePath) {
      throw new StructureGenerationError('Invalid .hodge path');
    }

    try {
      // Note: Existence check moved to InitCommand.smartQuestionFlow()
      // This ensures clean error messaging to users

      // Create .hodge directory structure
      await fs.ensureDir(hodgePath);
      await fs.ensureDir(path.join(hodgePath, 'patterns'));
      await fs.ensureDir(path.join(hodgePath, 'features'));

      // Create .hodge/.gitignore with context.json (HODGE-377.1)
      await this.createHodgeGitignore(hodgePath);

      // Generate all configuration files
      await this.generateConfig(projectInfo, hodgePath);
      await this.generateUserConfig(projectInfo); // Create hodge.json if PM tool selected
      await this.generateStandards(projectInfo, hodgePath);
      // Standards now includes decisions, patterns, and principles via installHodgeWay
      // eslint-disable-next-line sonarjs/deprecation
      await this.generatePMScripts(projectInfo, hodgePath); // Still used for PM scripts directory setup

      // Generate .gitignore entry if git is present
      if (projectInfo.detectedTools.hasGit) {
        await this.updateGitignore();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown generation error';
      throw new StructureGenerationError(
        `Failed to generate Hodge structure: ${message}`,
        error as Error
      );
    }
  }

  /**
   * Creates a safe path by joining with rootPath and validating against path traversal
   * @param relativePath - The relative path to validate
   * @returns Safe absolute path or null if invalid
   */
  private safePath(relativePath: string): string | null {
    if (!relativePath || typeof relativePath !== 'string') return null;

    // Prevent path traversal attacks
    if (relativePath.includes('..') || relativePath.includes('~')) return null;

    const fullPath = path.join(this.rootPath, relativePath);

    // Ensure the resolved path is still within rootPath
    if (!fullPath.startsWith(this.rootPath)) return null;

    return fullPath;
  }

  /**
   * Generates the project-meta.json file with automatically detected project information
   * This is NOT user configuration - it's metadata detected by Hodge
   * @param projectInfo - The detected project information
   * @param hodgePath - The .hodge directory path
   * @throws {StructureGenerationError} If metadata generation fails
   */
  private async generateConfig(projectInfo: ProjectInfo, hodgePath: string): Promise<void> {
    try {
      const metadata: HodgeConfig = {
        projectName: projectInfo.name,
        projectType: projectInfo.type,
        detectedTools: projectInfo.detectedTools,
        createdAt: new Date().toISOString(),
        version: '0.1.0',
      };

      const metadataPath = path.join(hodgePath, 'project-meta.json');

      // Add a header comment to explain this file
      const content = JSON.stringify(metadata, null, 2);
      const withHeader = `{
  "_comment": "This file contains auto-detected project metadata. DO NOT EDIT. User configuration goes in hodge.json",
  "_generated": "${new Date().toISOString()}",
${content.slice(1)}`; // Remove opening brace since we added it with comment

      await fs.writeFile(metadataPath, withHeader, 'utf-8');
    } catch (error) {
      throw new StructureGenerationError(
        `Failed to generate project-meta.json: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error as Error
      );
    }
  }

  /**
   * Generates the hodge.json user configuration file with all defaults visible
   * @param projectInfo - The detected project information
   * @throws {StructureGenerationError} If config generation fails
   */
  private async generateUserConfig(projectInfo: ProjectInfo): Promise<void> {
    try {
      // Always create hodge.json with comprehensive defaults
      const userConfig = {
        version: '1.0.0',
        pm: {
          tool: projectInfo.pmTool ?? 'local',
          // Status mapping is always visible so users know they can customize it
          statusMap: {
            explore: 'To Do',
            build: 'In Progress',
            harden: 'In Review',
            ship: 'Done',
          },
          // Verbosity for PM comments
          verbosity: 'essential', // minimal | essential | rich
        },
        ship: {
          autoPush: false,
          push: {
            strategy: 'safe', // safe | force | interactive
            createPR: 'prompt', // always | never | prompt
            protectedBranches: ['main', 'master', 'develop', 'staging', 'production'],
            remoteName: 'origin',
          },
        },
        features: {
          autoSave: true,
          debugMode: false,
        },
        // Common commit types for conventional commits
        commitTypes: [
          'feat',
          'fix',
          'docs',
          'style',
          'refactor',
          'test',
          'chore',
          'perf',
          'ci',
          'build',
          'revert',
        ],
      };

      const configPath = path.join(this.rootPath, 'hodge.json');
      await fs.writeJson(configPath, userConfig, { spaces: 2 });
    } catch (error) {
      throw new StructureGenerationError(
        `Failed to generate hodge.json: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error as Error
      );
    }
  }

  /**
   * Generates the standards.md file based on detected project tools
   * @param projectInfo - The detected project information
   * @param hodgePath - The .hodge directory path
   * @throws {StructureGenerationError} If standards generation fails
   */
  private async generateStandards(_projectInfo: ProjectInfo, hodgePath: string): Promise<void> {
    try {
      // Install the Hodge Way templates (standards, patterns, decisions, principles)
      await installHodgeWay(hodgePath);
    } catch (error) {
      throw new StructureGenerationError(
        `Failed to generate standards: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error as Error
      );
    }
  }

  // Removed: buildStandardsContent - Now using Hodge Way templates via installHodgeWay

  /* Keeping for reference - old implementation

  /**
   * Generates the decisions.md template file
   * @param hodgePath - The .hodge directory path
   * @throws {StructureGenerationError} If decisions generation fails
   */
  /**
   * @deprecated Now handled by installHodgeWay
   */

  /**
   * Generates the patterns/README.md file
   * @param hodgePath - The .hodge directory path
   * @throws {StructureGenerationError} If patterns readme generation fails
   */
  /**
   * @deprecated Now handled by installHodgeWay
   */

  /**
   * Generates PM scripts for the detected or selected PM tool
   * @param projectInfo - The project information
   * @param hodgePath - The .hodge directory path
   * @throws {StructureGenerationError} If PM scripts generation fails
   */
  private async generatePMScripts(projectInfo: ProjectInfo, hodgePath: string): Promise<void> {
    if (!projectInfo.pmTool) {
      // No PM tool configured - create empty directory with placeholder
      await fs.ensureDir(path.join(hodgePath, 'pm-scripts'));
      const placeholderPath = path.join(hodgePath, 'pm-scripts', 'README.md');
      const placeholderContent = `# Project Management Scripts

No PM tool configured yet. To add PM integration:

1. Set up environment variables for your PM tool:
   - Linear: \`LINEAR_API_KEY\`
   - GitHub: \`GITHUB_TOKEN\`
   - Jira: \`JIRA_API_TOKEN\`

2. Run \`hodge init\` again to configure PM integration

3. Or manually configure in \`.hodge/config.json\`

Scripts will be generated here once a PM tool is configured.
`;
      await fs.writeFile(placeholderPath, placeholderContent, 'utf8');
      return;
    }

    // Create pm-scripts directory
    const scriptsPath = path.join(hodgePath, 'pm-scripts');
    await fs.ensureDir(scriptsPath);

    // Generate scripts based on PM tool
    switch (projectInfo.pmTool) {
      case 'linear':
        await this.generateLinearScripts(scriptsPath);
        break;
      case 'github':
        await this.generateGitHubScripts(scriptsPath);
        break;
      case 'jira':
        await this.generateJiraScripts(scriptsPath);
        break;
      case 'trello':
        await this.generateTrelloScripts(scriptsPath);
        break;
      case 'asana':
        await this.generateAsanaScripts(scriptsPath);
        break;
      case 'custom':
        await this.generateCustomScripts(scriptsPath);
        break;
      default:
        // Handle null case or unknown PM tools
        break;
    }

    // Generate common scripts
    await this.generateCommonPMScripts(scriptsPath);
  }

  /**
   * Writes PM scripts to disk with security validation
   * @param scripts - Array of scripts to write
   * @param scriptsPath - The path to write scripts to
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async writeScripts(scripts: PMScript[], scriptsPath: string): Promise<void> {
    for (const script of scripts) {
      const scriptPath = path.join(scriptsPath, script.name);
      ScriptSecurityValidator.validateScriptPath(scriptPath);
      ScriptSecurityValidator.validateScriptContent(script.content, script.description);
      await fs.writeFile(scriptPath, script.content, 'utf8');
      // Safe: 0o755 (rwxr-xr-x) is standard for executable scripts
      // eslint-disable-next-line sonarjs/file-permissions
      await fs.chmod(scriptPath, 0o755);
    }
  }

  /**
   * Generates Linear-specific PM scripts with security validation
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async generateLinearScripts(scriptsPath: string): Promise<void> {
    const scripts = getLinearScripts();
    await this.writeScripts(scripts, scriptsPath);
  }

  /**
   * Generates GitHub-specific PM scripts with security validation
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async generateGitHubScripts(scriptsPath: string): Promise<void> {
    const scripts = getGitHubScripts();
    await this.writeScripts(scripts, scriptsPath);
  }

  /**
   * Generates Jira-specific PM scripts with security validation
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async generateJiraScripts(scriptsPath: string): Promise<void> {
    const scripts = getJiraScripts();
    await this.writeScripts(scripts, scriptsPath);
  }

  /**
   * Generates Trello-specific PM scripts with security validation
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async generateTrelloScripts(scriptsPath: string): Promise<void> {
    const scripts = getTrelloScripts();
    await this.writeScripts(scripts, scriptsPath);
  }

  /**
   * Generates Asana-specific PM scripts with security validation
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async generateAsanaScripts(scriptsPath: string): Promise<void> {
    const scripts = getAsanaScripts();
    await this.writeScripts(scripts, scriptsPath);
  }

  /**
   * Generates custom PM integration scripts with security validation
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async generateCustomScripts(scriptsPath: string): Promise<void> {
    const templateScript = `#!/usr/bin/env node
/**
 * Custom PM Integration Script
 * Customize this script for your PM tool
 * Generated by Hodge - SAFE TO EDIT
 */

'use strict';

// Add your custom PM tool integration here
this.logger.info('Custom PM integration - customize this script for your needs');

// Example structure:
// 1. Read Hodge feature status from .hodge/features/
// 2. Call your PM tool API (use fetch or axios for HTTP requests)
// 3. Update status bidirectionally
// 4. Always validate and sanitize input data

// Security recommendations:
// - Use environment variables for API keys
// - Validate all input data
// - Use HTTPS for API calls
// - Implement proper error handling
`;

    const scriptPath = path.join(scriptsPath, 'sync-custom.js');
    ScriptSecurityValidator.validateScriptPath(scriptPath);
    ScriptSecurityValidator.validateScriptContent(templateScript, 'Custom sync script template');

    await fs.writeFile(scriptPath, templateScript, 'utf8');
    // Safe: 0o755 (rwxr-xr-x) is standard for executable scripts
    // eslint-disable-next-line sonarjs/file-permissions
    await fs.chmod(scriptPath, 0o755);
  }

  /**
   * Generates common PM scripts used by all PM tools with security validation
   * @throws {StructureGenerationError} If script generation or validation fails
   */
  private async generateCommonPMScripts(scriptsPath: string): Promise<void> {
    const scripts = getCommonScripts();
    await this.writeScripts(scripts, scriptsPath);

    // Generate README for the PM scripts
    await fs.writeFile(path.join(scriptsPath, 'README.md'), PM_SCRIPTS_README, 'utf-8');
  }

  /**
   * Updates .gitignore to include Hodge-specific entries
   * @throws {StructureGenerationError} If gitignore update fails
   */
  /**
   * Creates .hodge/.gitignore with auto-generated context files (HODGE-377.1, HODGE-377.3)
   * Keeps session state and auto-generated AI context out of version control
   * @param hodgePath - The .hodge directory path
   */
  private async createHodgeGitignore(hodgePath: string): Promise<void> {
    try {
      const hodgeGitignorePath = path.join(hodgePath, '.gitignore');

      // HODGE-377.3: Gitignore all auto-generated context files
      const gitignoreContent = `# Hodge auto-generated context files - regenerate with 'hodge regen'
# These files are developer-local and should not be shared in version control

# Session state (HODGE-377.1)
context.json

# Architecture graph - regenerated from codebase (HODGE-377.3)
architecture-graph.dot

# Ship records - historical artifacts, not team state (HODGE-377.3)
features/**/ship-record.json
`;

      // Check if .gitignore already exists
      const exists = await fs.pathExists(hodgeGitignorePath);

      if (exists) {
        // Append new patterns if they don't already exist
        const existingContent = await fs.readFile(hodgeGitignorePath, 'utf8');
        const patternsToAdd: string[] = [];

        if (!existingContent.includes('architecture-graph.dot')) {
          patternsToAdd.push('architecture-graph.dot');
        }
        if (!existingContent.includes('features/**/ship-record.json')) {
          patternsToAdd.push('features/**/ship-record.json');
        }

        if (patternsToAdd.length > 0) {
          const appendContent = `\n# HODGE-377.3: Auto-generated context files\n${patternsToAdd.join('\n')}\n`;
          await fs.appendFile(hodgeGitignorePath, appendContent, 'utf8');
          this.logger.debug('Appended new patterns to .hodge/.gitignore');
        }
      } else {
        // Create new .gitignore with all patterns
        await fs.writeFile(hodgeGitignorePath, gitignoreContent, 'utf8');
        this.logger.debug('Created .hodge/.gitignore with all auto-generated file patterns');
      }
    } catch (error) {
      // Don't fail init if .hodge/.gitignore creation fails
      this.logger.warn(
        `Warning: Failed to create/update .hodge/.gitignore: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async updateGitignore(): Promise<void> {
    try {
      const gitignorePath = this.safePath('.gitignore');
      if (!gitignorePath) {
        throw new StructureGenerationError('Invalid .gitignore path');
      }

      const hodgeIgnoreEntry = '\n# Hodge local files\n.hodge/local/\n.hodge/saves/\n';

      if (await fs.pathExists(gitignorePath)) {
        const content = await fs.readFile(gitignorePath, 'utf-8');
        if (!content.includes('.hodge/local/')) {
          await fs.appendFile(gitignorePath, hodgeIgnoreEntry);
        }
      } else {
        await fs.writeFile(gitignorePath, hodgeIgnoreEntry.trim() + '\n', 'utf8');
      }
    } catch (error) {
      // Don't fail the entire init process if gitignore update fails
      this.logger.warn(
        `Warning: Failed to update .gitignore: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
