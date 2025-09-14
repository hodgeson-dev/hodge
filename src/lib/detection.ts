/**
 * Project Detection Engine
 * Detects project properties for smart initialization
 * Provides comprehensive auto-detection of project name, type, PM tools, and development tools
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

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

/**
 * Supported project types for auto-detection
 */
export type ProjectType = 'node' | 'python' | 'unknown';

/**
 * Supported project management tools
 */
export type PMTool = 'linear' | 'github' | 'jira' | 'trello' | 'asana' | 'custom' | null;

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
}

/**
 * Main project detection class that analyzes a directory to extract project information
 */
export class ProjectDetector {
  /**
   * Creates a new ProjectDetector instance
   * @param rootPath - The root path to analyze (defaults to current working directory)
   * @throws {ValidationError} If the rootPath is invalid
   */
  constructor(private rootPath: string = process.cwd()) {
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
    // Try package.json first
    const packageJsonPath = path.join(this.rootPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = (await fs.readJson(packageJsonPath)) as { name?: string };
        if (packageJson.name && typeof packageJson.name === 'string') {
          // Remove scope prefix if present (e.g., @scope/name -> name)
          const name = packageJson.name.replace(/^@[^/]+\//, '');
          if (this.isValidProjectName(name)) {
            return name;
          }
        }
      } catch (error) {
        // Continue to fallback methods but log the error
        console.warn(
          `Warning: Failed to read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Try git remote
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        cwd: this.rootPath,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 5000, // 5 second timeout
      }).trim();

      // Extract name from git URL (supports both SSH and HTTPS)
      const match = remoteUrl.match(/\/([^/]+?)(?:\.git)?$/);
      if (match && match[1]) {
        const name = match[1];
        if (this.isValidProjectName(name)) {
          return name;
        }
      }
    } catch {
      // Git not available or no remote - this is expected in many cases
    }

    // Fall back to directory name
    const dirName = path.basename(this.rootPath);
    if (this.isValidProjectName(dirName)) {
      return dirName;
    }

    // If even directory name is invalid, use a safe default
    throw new DetectionError(`Could not determine a valid project name from directory: ${dirName}`);
  }

  /**
   * Validates if a project name is valid
   * @param name - The name to validate
   * @returns True if the name is valid
   */
  private isValidProjectName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;

    // Remove common invalid characters and check if anything remains
    const cleaned = name.trim();
    if (cleaned.length === 0) return false;

    // Check for extremely long names (over 214 characters is npm limit)
    if (cleaned.length > 214) return false;

    // Check for invalid characters that could cause security issues
    const invalidChars = /[<>:"|?*\\]/;
    if (invalidChars.test(cleaned)) return false;

    return true;
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
   * Detects the project type by analyzing project files
   * @returns The detected project type
   */
  private async detectProjectType(): Promise<ProjectType> {
    // Check for Node.js indicators
    const nodeIndicators = [
      'package.json',
      'node_modules',
      'yarn.lock',
      'package-lock.json',
      'pnpm-lock.yaml',
    ];

    for (const indicator of nodeIndicators) {
      const indicatorPath = this.safePath(indicator);
      if (indicatorPath && (await fs.pathExists(indicatorPath))) {
        return 'node';
      }
    }

    // Check for Python indicators
    const pythonIndicators = [
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'Pipfile',
      'poetry.lock',
      'environment.yml',
    ];

    for (const indicator of pythonIndicators) {
      const indicatorPath = this.safePath(indicator);
      if (indicatorPath && (await fs.pathExists(indicatorPath))) {
        return 'python';
      }
    }

    return 'unknown';
  }

  /**
   * Detects project management tools by checking environment variables and git remotes
   * @returns The detected PM tool or null
   */
  private detectPMTool(): PMTool | null {
    // Check environment variables
    if (process.env.LINEAR_API_KEY) return 'linear';
    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) return 'github';
    if (process.env.JIRA_API_TOKEN) return 'jira';

    // Check git remote for GitHub
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        cwd: this.rootPath,
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();

      if (remoteUrl.includes('github.com')) {
        return 'github';
      }
    } catch {
      // Git not available or no remote
    }

    return null;
  }

  /**
   * Checks if Hodge is already configured in this project
   * @returns True if .hodge directory exists
   */
  private async hasHodgeConfig(): Promise<boolean> {
    const hodgePath = this.safePath('.hodge');
    return hodgePath ? fs.pathExists(hodgePath) : false;
  }

  /**
   * Detects all development tools used in the project
   * @returns Complete detected tools information
   */
  private async detectTools(): Promise<DetectedTools> {
    const hasGit = this.checkGit();
    const gitRemote = hasGit ? this.getGitRemote() : undefined;

    return {
      packageManager: await this.detectPackageManager(),
      testFramework: await this.detectTestFrameworks(),
      linting: await this.detectLinting(),
      buildTools: await this.detectBuildTools(),
      hasGit,
      gitRemote,
    };
  }

  /**
   * Detects the package manager by checking for lock files
   * @returns The detected package manager or null
   */
  private async detectPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | null> {
    const pnpmLockPath = this.safePath('pnpm-lock.yaml');
    if (pnpmLockPath && (await fs.pathExists(pnpmLockPath))) return 'pnpm';

    const yarnLockPath = this.safePath('yarn.lock');
    if (yarnLockPath && (await fs.pathExists(yarnLockPath))) return 'yarn';

    const npmLockPath = this.safePath('package-lock.json');
    if (npmLockPath && (await fs.pathExists(npmLockPath))) return 'npm';

    return null;
  }

  /**
   * Detects test frameworks by analyzing package.json dependencies
   * @returns Array of detected test framework names
   */
  private async detectTestFrameworks(): Promise<string[]> {
    const frameworks: string[] = [];
    const packageJsonPath = this.safePath('package.json');

    if (packageJsonPath && (await fs.pathExists(packageJsonPath))) {
      try {
        const packageJson = (await fs.readJson(packageJsonPath)) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };
        const allDeps = {
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {}),
        };

        // Check for test frameworks with proper type checking
        const testFrameworkChecks = [
          { dep: 'vitest', name: 'vitest' },
          { dep: 'jest', name: 'jest' },
          { dep: 'mocha', name: 'mocha' },
          { dep: 'jasmine', name: 'jasmine' },
          { dep: '@testing-library/react', name: 'testing-library' },
          { dep: 'cypress', name: 'cypress' },
          { dep: '@playwright/test', name: 'playwright' },
        ];

        for (const check of testFrameworkChecks) {
          if (allDeps[check.dep]) {
            frameworks.push(check.name);
          }
        }
      } catch (error) {
        console.warn(
          `Warning: Failed to read package.json for test framework detection: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return frameworks;
  }

  /**
   * Detects linting tools by checking dependencies and config files
   * @returns Array of detected linting tool names
   */
  private async detectLinting(): Promise<string[]> {
    const linters: string[] = [];
    const packageJsonPath = path.join(this.rootPath, 'package.json');

    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = (await fs.readJson(packageJsonPath)) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if (allDeps && allDeps.eslint) linters.push('eslint');
        if (allDeps && allDeps.prettier) linters.push('prettier');
        if (allDeps && allDeps.tslint) linters.push('tslint');
      } catch {
        // Continue without package.json info
      }
    }

    // Check for config files
    const configFiles = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.json',
      '.prettierrc',
      '.prettierrc.js',
      '.prettierrc.json',
      'tslint.json',
    ];

    for (const file of configFiles) {
      if (await fs.pathExists(path.join(this.rootPath, file))) {
        if (file.includes('eslint') && !linters.includes('eslint')) {
          linters.push('eslint');
        }
        if (file.includes('prettier') && !linters.includes('prettier')) {
          linters.push('prettier');
        }
        if (file.includes('tslint') && !linters.includes('tslint')) {
          linters.push('tslint');
        }
      }
    }

    return linters;
  }

  /**
   * Detects build tools by checking dependencies and config files
   * @returns Array of detected build tool names
   */
  private async detectBuildTools(): Promise<string[]> {
    const buildTools: string[] = [];
    const packageJsonPath = path.join(this.rootPath, 'package.json');

    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = (await fs.readJson(packageJsonPath)) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if (allDeps && allDeps.typescript) buildTools.push('typescript');
        if (allDeps && allDeps.webpack) buildTools.push('webpack');
        if (allDeps && allDeps.vite) buildTools.push('vite');
        if (allDeps && allDeps.rollup) buildTools.push('rollup');
        if (allDeps && allDeps.parcel) buildTools.push('parcel');
      } catch {
        // Continue without package.json info
      }
    }

    // Check for config files
    const configFiles = [
      'tsconfig.json',
      'webpack.config.js',
      'vite.config.js',
      'rollup.config.js',
    ];

    for (const file of configFiles) {
      if (await fs.pathExists(path.join(this.rootPath, file))) {
        const tool = file.split('.')[0];
        if (tool === 'tsconfig' && !buildTools.includes('typescript')) {
          buildTools.push('typescript');
        } else if (!buildTools.includes(tool)) {
          buildTools.push(tool);
        }
      }
    }

    return buildTools;
  }

  /**
   * Checks if git is initialized in the project
   * @returns True if git is available and initialized
   */
  private checkGit(): boolean {
    try {
      execSync('git status', {
        cwd: this.rootPath,
        stdio: 'pipe',
        timeout: 5000, // 5 second timeout
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the git remote URL if available
   * @returns The git remote URL or undefined
   */
  private getGitRemote(): string | undefined {
    try {
      return execSync('git remote get-url origin', {
        cwd: this.rootPath,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 5000, // 5 second timeout
      }).trim();
    } catch {
      return undefined;
    }
  }
}
