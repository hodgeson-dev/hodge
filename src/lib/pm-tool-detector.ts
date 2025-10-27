import { execSync } from 'child_process';

/**
 * PM Tool types supported
 */
export type PMTool = 'local' | 'linear' | 'github' | 'jira' | 'trello' | 'asana' | 'custom' | null;

/**
 * Detects project management tools in a project
 */
export class PMToolDetector {
  /**
   * Creates a new PMToolDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Detects project management tools by checking environment variables and git remotes
   * @returns The detected PM tool or null
   */
  detect(): PMTool | null {
    // Check environment variables
    if (process.env.LINEAR_API_KEY) return 'linear';
    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) return 'github';
    if (process.env.JIRA_API_TOKEN) return 'jira';

    // Check git remote for GitHub
    try {
      // eslint-disable-next-line sonarjs/no-os-command-from-path -- 'git' is a hardcoded command, not user input
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
}
