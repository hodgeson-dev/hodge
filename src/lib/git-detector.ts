import { execSync } from 'child_process';

/**
 * Detects Git configuration and status in a project
 */
export class GitDetector {
  /**
   * Creates a new GitDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Checks if git is initialized in the project
   * @returns True if git is available and initialized
   */
  checkGit(): boolean {
    try {
      // eslint-disable-next-line sonarjs/no-os-command-from-path -- 'git' is a hardcoded command, not user input
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
  getGitRemote(): string | undefined {
    try {
      // eslint-disable-next-line sonarjs/no-os-command-from-path -- 'git' is a hardcoded command, not user input
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
