import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { createCommandLogger } from './logger.js';
import { DetectionError } from './detection.js';

/**
 * Detects project name using multiple strategies
 */
export class ProjectNameDetector {
  private logger = createCommandLogger('project-name-detector', { enableConsole: false });

  /**
   * Creates a new ProjectNameDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Detects the project name using multiple strategies
   * Priority: package.json > git remote > directory name
   * @returns The detected project name
   * @throws {DetectionError} If no valid name can be determined
   */
  async detect(): Promise<string> {
    const nameFromPackageJson = await this.detectFromPackageJson();
    if (nameFromPackageJson) {
      return nameFromPackageJson;
    }

    const nameFromGit = this.detectFromGitRemote();
    if (nameFromGit) {
      return nameFromGit;
    }

    return this.detectFromDirectoryName();
  }

  /**
   * Try to detect name from package.json
   */
  private async detectFromPackageJson(): Promise<string | null> {
    const packageJsonPath = path.join(this.rootPath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      return null;
    }

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
      this.logger.warn(
        `Warning: Failed to read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return null;
  }

  /**
   * Try to detect name from git remote URL
   */
  private detectFromGitRemote(): string | null {
    try {
      // eslint-disable-next-line sonarjs/no-os-command-from-path -- 'git' is a hardcoded command, not user input
      const remoteUrl = execSync('git remote get-url origin', {
        cwd: this.rootPath,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 5000, // 5 second timeout
      }).trim();

      // Extract name from git URL (supports both SSH and HTTPS)
      const match = /\/([^/]+?)(?:\.git)?$/.exec(remoteUrl);
      if (match && match[1]) {
        const name = match[1];
        if (this.isValidProjectName(name)) {
          return name;
        }
      }
    } catch {
      // Git not available or no remote - this is expected in many cases
    }

    return null;
  }

  /**
   * Fall back to directory name
   */
  private detectFromDirectoryName(): string {
    const dirName = path.basename(this.rootPath);
    if (this.isValidProjectName(dirName)) {
      return dirName;
    }

    // If even directory name is invalid, throw error
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
}
