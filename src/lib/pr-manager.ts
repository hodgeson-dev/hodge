import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { analyzeBranch } from './git-utils.js';

const execAsync = promisify(exec);

/**
 * PR creation and management utilities
 */

export interface PROptions {
  title: string;
  body: string;
  base?: string;
  head?: string;
  draft?: boolean;
  assignees?: string[];
  labels?: string[];
  reviewers?: string[];
  milestone?: string;
}

export interface PRResult {
  success: boolean;
  url?: string;
  number?: number;
  error?: string;
}

export interface PRInfo {
  number: number;
  url: string;
  title: string;
  state: string;
  base: string;
  head: string;
}

/**
 * Manages pull request operations
 */
export class PRManager {
  /**
   * Check if gh CLI is available
   */
  async isGHAvailable(): Promise<boolean> {
    try {
      await execAsync('gh --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if we're in a GitHub repository
   */
  async isGitHubRepo(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git remote get-url origin');
      return stdout.includes('github.com');
    } catch {
      return false;
    }
  }

  /**
   * Create a pull request using gh CLI
   */
  async createPR(options: PROptions): Promise<PRResult> {
    // Check prerequisites
    const hasGH = await this.isGHAvailable();
    if (!hasGH) {
      return {
        success: false,
        error: 'GitHub CLI (gh) is not installed. Install it from https://cli.github.com',
      };
    }

    const isGitHub = await this.isGitHubRepo();
    if (!isGitHub) {
      return {
        success: false,
        error: 'Not a GitHub repository',
      };
    }

    // Build gh pr create command
    let command = 'gh pr create';

    // Required fields
    command += ` --title "${options.title.replace(/"/g, '\\"')}"`;
    command += ` --body "${options.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;

    // Optional fields
    if (options.base) command += ` --base ${options.base}`;
    if (options.head) command += ` --head ${options.head}`;
    if (options.draft) command += ' --draft';
    if (options.assignees?.length) {
      command += ` --assignee ${options.assignees.join(',')}`;
    }
    if (options.labels?.length) {
      command += ` --label ${options.labels.join(',')}`;
    }
    if (options.reviewers?.length) {
      command += ` --reviewer ${options.reviewers.join(',')}`;
    }
    if (options.milestone) {
      command += ` --milestone "${options.milestone}"`;
    }

    try {
      const { stdout } = await execAsync(command);

      // Extract PR URL from output
      const urlMatch = /https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+/.exec(stdout);
      const numberMatch = /\/pull\/(\d+)/.exec(stdout);

      return {
        success: true,
        url: urlMatch?.[0],
        number: numberMatch ? parseInt(numberMatch[1], 10) : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if a PR already exists for the current branch
   */
  async checkExistingPR(branch?: string): Promise<PRInfo | null> {
    const hasGH = await this.isGHAvailable();
    if (!hasGH) return null;

    try {
      const command = branch
        ? `gh pr list --head ${branch} --json number,url,title,state,baseRefName,headRefName`
        : 'gh pr list --head $(git branch --show-current) --json number,url,title,state,baseRefName,headRefName';

      const { stdout } = await execAsync(command);
      const prs = JSON.parse(stdout) as Array<{
        number: number;
        url: string;
        title: string;
        state: string;
        baseRefName: string;
        headRefName: string;
      }>;

      if (prs.length > 0) {
        const pr = prs[0];
        return {
          number: pr.number,
          url: pr.url,
          title: pr.title,
          state: pr.state,
          base: pr.baseRefName,
          head: pr.headRefName,
        };
      }
    } catch {
      // No PR exists or error occurred
    }

    return null;
  }

  /**
   * Generate PR title from branch and feature
   */
  generatePRTitle(branch: string, feature: string): string {
    const branchInfo = analyzeBranch(branch);

    // If branch has issue ID, include it
    if (branchInfo.issueId) {
      return `${branchInfo.type}(${branchInfo.issueId}): ${feature}`;
    }

    // Otherwise use branch type and feature
    return `${branchInfo.type}: ${feature}`;
  }

  /**
   * Generate PR body with context
   */
  generatePRBody(options: {
    feature: string;
    branch: string;
    commits?: string[];
    issueId?: string;
    description?: string;
  }): string {
    const sections: string[] = [];

    // Summary section
    sections.push('## Summary');
    if (options.description) {
      sections.push(options.description);
    } else {
      sections.push(`Implementation of ${options.feature}`);
    }

    // Changes section
    if (options.commits && options.commits.length > 0) {
      sections.push('\n## Changes');
      options.commits.forEach((commit) => {
        sections.push(`- ${commit}`);
      });
    }

    // Testing section
    sections.push('\n## Testing');
    sections.push('- [ ] Tests pass locally');
    sections.push('- [ ] Manual testing completed');
    sections.push('- [ ] No regressions identified');

    // Checklist section
    sections.push('\n## Checklist');
    sections.push('- [ ] Code follows project standards');
    sections.push('- [ ] Documentation updated if needed');
    sections.push('- [ ] Tests added/updated as appropriate');

    // Issue linking
    if (options.issueId) {
      sections.push(`\nCloses ${options.issueId}`);
    }

    return sections.join('\n');
  }

  /**
   * Create stacked PRs for dependent branches
   */
  async createStackedPRs(branches: string[], feature: string): Promise<PRResult[]> {
    const results: PRResult[] = [];
    let baseBranch = 'main';

    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      const isLast = i === branches.length - 1;

      const title = `[Stack ${i + 1}/${branches.length}] ${this.generatePRTitle(branch, feature)}`;

      const body = this.generatePRBody({
        feature,
        branch,
        description: `Part ${i + 1} of ${branches.length} in stack\n\nDepends on: ${i > 0 ? branches[i - 1] : 'main'}`,
      });

      const result = await this.createPR({
        title,
        body,
        base: baseBranch,
        head: branch,
        draft: !isLast, // All but the last PR are drafts
        labels: ['stacked-pr'],
      });

      results.push(result);

      // Next PR builds on this branch
      baseBranch = branch;
    }

    return results;
  }

  /**
   * Format PR creation result for display
   */
  formatPRResult(result: PRResult, branch: string): string {
    const lines: string[] = [];

    if (result.success) {
      lines.push(chalk.green('✅ Pull Request created successfully!'));
      lines.push('');
      if (result.url) {
        lines.push(`URL: ${chalk.cyan(result.url)}`);
      }
      if (result.number) {
        lines.push(`PR #${result.number}`);
      }
      lines.push('');
      lines.push('Next steps:');
      lines.push('- Request code review');
      lines.push('- Wait for CI checks to pass');
      lines.push('- Merge when approved');
    } else {
      lines.push(chalk.red('❌ Failed to create Pull Request'));
      lines.push('');
      if (result.error) {
        lines.push(`Error: ${result.error}`);
      }
      lines.push('');
      lines.push('Manual steps:');
      lines.push(`1. Go to your repository on GitHub`);
      lines.push(`2. Click "New pull request"`);
      lines.push(`3. Select branch: ${branch}`);
      lines.push(`4. Create PR manually`);
    }

    return lines.join('\n');
  }

  /**
   * Check for merge conflicts with base branch
   */
  async checkConflicts(base = 'main'): Promise<boolean> {
    try {
      // Fetch latest from base
      await execAsync(`git fetch origin ${base}`);

      // Try a test merge
      const { stdout } = await execAsync(
        `git merge-tree $(git merge-base HEAD origin/${base}) HEAD origin/${base}`,
        { encoding: 'utf8' }
      );

      // Check for conflict markers
      return stdout.includes('<<<<<<<');
    } catch {
      return false;
    }
  }

  /**
   * Get conflict resolution instructions
   */
  getConflictInstructions(base = 'main'): string {
    return `
## Resolving Conflicts

1. **Update your branch:**
   \`\`\`bash
   git fetch origin
   git rebase origin/${base}
   \`\`\`

2. **Resolve conflicts:**
   - Open conflicted files
   - Look for <<<<<<< markers
   - Choose the correct code
   - Remove conflict markers

3. **Continue rebase:**
   \`\`\`bash
   git add .
   git rebase --continue
   \`\`\`

4. **Force push:**
   \`\`\`bash
   git push --force-with-lease
   \`\`\`

**Tip**: Use \`git status\` to see conflicted files`;
  }
}

// Singleton instance
let prManager: PRManager | null = null;

/**
 * Get or create PR manager instance
 */
export function getPRManager(): PRManager {
  if (!prManager) {
    prManager = new PRManager();
  }
  return prManager;
}
