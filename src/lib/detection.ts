/**
 * Project Detection Engine
 * Detects project properties for smart initialization
 * Provides comprehensive auto-detection of project name, type, PM tools, and development tools
 */

import fs from 'fs-extra';
import path from 'path';
import { LintingDetector } from './linting-detector.js';
import { BuildToolDetector } from './build-tool-detector.js';
import { ProjectNameDetector } from './project-name-detector.js';
import { TestFrameworkDetector } from './test-framework-detector.js';
import { PMToolDetector, type PMTool } from './pm-tool-detector.js';
import { NodePackageDetector } from './node-package-detector.js';
import { ProjectTypeDetector, type ProjectType } from './project-type-detector.js';
import { GitDetector } from './git-detector.js';

/**
 * Custom error class for detection-related errors
 */
export class DetectionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'DetectionError';
  }
}

/**
 * Custom error class for validation-related errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Complete information about a detected project
 */
export interface ProjectInfo {
  /** The project name extracted from various sources */
  name: string;
  /** The detected project type */
  type: ProjectType;
  /** The detected project management tool */
  pmTool: PMTool | null;
  /** Whether a .hodge directory already exists */
  hasExistingConfig: boolean;
  /** All detected development tools */
  detectedTools: DetectedTools;
  /** The root path of the project */
  rootPath: string;
}

// Re-export types from detector modules for backward compatibility
export type { ProjectType } from './project-type-detector.js';
export type { PMTool } from './pm-tool-detector.js';

/**
 * Development tools detected in the project
 */
export interface DetectedTools {
  /** The package manager in use */
  packageManager: 'npm' | 'yarn' | 'pnpm' | null;
  /** Test frameworks found in the project */
  testFramework: string[];
  /** Linting tools configured */
  linting: string[];
  /** Build tools configured */
  buildTools: string[];
  /** Whether git is initialized */
  hasGit: boolean;
  /** Git remote URL if available */
  gitRemote?: string;
  /** Whether Claude Code is set up (CLAUDE.md exists) */
  hasClaudeCode: boolean;
}

/**
 * Main project detection class that analyzes a directory to extract project information
 */
export class ProjectDetector {
  // Logger for detection errors - intentionally unused for now
  // private logger = createCommandLogger('detection-error', { enableConsole: false });

  /**
   * Creates a new ProjectDetector instance
   * @param rootPath - The root path to analyze (defaults to current working directory)
   * @param lintingDetector - Detector for linting tools (injectable for testing)
   * @param buildToolDetector - Detector for build tools (injectable for testing)
   * @param projectNameDetector - Detector for project name (injectable for testing)
   * @param testFrameworkDetector - Detector for test frameworks (injectable for testing)
   * @param pmToolDetector - Detector for PM tools (injectable for testing)
   * @param nodePackageDetector - Detector for Node package managers (injectable for testing)
   * @param projectTypeDetector - Detector for project type (injectable for testing)
   * @param gitDetector - Detector for Git status (injectable for testing)
   * @throws {ValidationError} If the rootPath is invalid
   */
  constructor(
    private rootPath: string = process.cwd(),
    private lintingDetector = new LintingDetector(rootPath),
    private buildToolDetector = new BuildToolDetector(rootPath),
    private projectNameDetector = new ProjectNameDetector(rootPath),
    private testFrameworkDetector = new TestFrameworkDetector(rootPath),
    private pmToolDetector = new PMToolDetector(rootPath),
    private nodePackageDetector = new NodePackageDetector(rootPath),
    private projectTypeDetector = new ProjectTypeDetector(rootPath),
    private gitDetector = new GitDetector(rootPath)
  ) {
    this.validateRootPath(rootPath);
  }

  /**
   * Validates that the root path exists and is accessible
   * @param rootPath - The path to validate
   * @throws {ValidationError} If the path is invalid or inaccessible
   */
  private validateRootPath(rootPath: string): void {
    if (!rootPath || typeof rootPath !== 'string') {
      throw new ValidationError('Root path must be a non-empty string', 'rootPath');
    }

    // Check for path traversal attempts
    if (rootPath.includes('../') || rootPath.includes('..\\')) {
      throw new ValidationError('Path traversal detected', 'rootPath');
    }

    if (!path.isAbsolute(rootPath)) {
      // Convert to absolute path
      this.rootPath = path.resolve(rootPath);
    }

    // Check if path exists and is accessible
    try {
      const stat = fs.statSync(this.rootPath);
      if (!stat.isDirectory()) {
        throw new ValidationError(`Path is not a directory: ${this.rootPath}`, 'rootPath');
      }
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new ValidationError(`Cannot access directory: ${this.rootPath}`, 'rootPath');
    }
  }

  /**
   * Performs comprehensive project detection
   * @returns Complete project information
   * @throws {DetectionError} If detection fails
   */
  async detectProject(): Promise<ProjectInfo> {
    try {
      const name = await this.detectProjectName();
      const type = await this.detectProjectType();
      const pmTool = this.detectPMTool();
      const hasExistingConfig = await this.hasHodgeConfig();
      const detectedTools = await this.detectTools();

      return {
        name,
        type,
        pmTool,
        hasExistingConfig,
        detectedTools,
        rootPath: this.rootPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown detection error';
      throw new DetectionError(`Failed to detect project information: ${message}`, error as Error);
    }
  }

  /**
   * Detects the project name using multiple strategies
   * Priority: package.json > git remote > directory name
   * @returns The detected project name
   * @throws {DetectionError} If no valid name can be determined
   */
  private async detectProjectName(): Promise<string> {
    return this.projectNameDetector.detect();
  }


  /**
   * Detects the project type by analyzing project files
   * @returns The detected project type
   */
  private async detectProjectType(): Promise<ProjectType> {
    return this.projectTypeDetector.detect();
  }

  /**
   * Detects project management tools by checking environment variables and git remotes
   * @returns The detected PM tool or null
   */
  private detectPMTool(): PMTool | null {
    return this.pmToolDetector.detect();
  }

  /**
   * Checks if Hodge is already configured in this project
   * @returns True if .hodge directory exists
   */
  private async hasHodgeConfig(): Promise<boolean> {
    return fs.pathExists(path.join(this.rootPath, '.hodge'));
  }

  /**
   * Detects all development tools used in the project
   * @returns Complete detected tools information
   */
  private async detectTools(): Promise<DetectedTools> {
    const hasGit = this.checkGit();
    const gitRemote = hasGit ? this.getGitRemote() : undefined;
    const hasClaudeCode = await this.detectClaudeCode();

    return {
      packageManager: await this.detectPackageManager(),
      testFramework: await this.detectTestFrameworks(),
      linting: await this.detectLinting(),
      buildTools: await this.detectBuildTools(),
      hasGit,
      gitRemote,
      hasClaudeCode,
    };
  }

  /**
   * Detects the package manager by checking for lock files
   * @returns The detected package manager or null
   */
  private async detectPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | null> {
    return this.nodePackageDetector.detect();
  }

  /**
   * Detects test frameworks by analyzing package.json dependencies
   * @returns Array of detected test framework names
   */
  private async detectTestFrameworks(): Promise<string[]> {
    return this.testFrameworkDetector.detect();
  }

  /**
   * Detects linting tools by checking dependencies and config files
   * @returns Array of detected linting tool names
   */
  private async detectLinting(): Promise<string[]> {
    return this.lintingDetector.detect();
  }

  /**
   * Detects build tools by checking dependencies and config files
   * @returns Array of detected build tool names
   */
  private async detectBuildTools(): Promise<string[]> {
    return this.buildToolDetector.detect();
  }

  /**
   * Checks if git is initialized in the project
   * @returns True if git is available and initialized
   */
  private checkGit(): boolean {
    return this.gitDetector.checkGit();
  }

  /**
   * Gets the git remote URL if available
   * @returns The git remote URL or undefined
   */
  private getGitRemote(): string | undefined {
    return this.gitDetector.getGitRemote();
  }

  /**
   * Detects if Claude Code is set up in the project
   * @returns True if CLAUDE.md exists
   */
  private async detectClaudeCode(): Promise<boolean> {
    try {
      return await fs.pathExists(path.join(this.rootPath, 'CLAUDE.md'));
    } catch {
      return false;
    }
  }
}
