/**
 * GitHub Issues PM Adapter Implementation
 */

import { Octokit } from '@octokit/rest';
import { BasePMAdapter } from './base-adapter.js';
import { PMAdapterOptions, PMIssue, PMState, StateType } from './types.js';
import { execSync } from 'child_process';

export class GitHubAdapter extends BasePMAdapter {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(options: PMAdapterOptions) {
    super(options);

    // Validate required configuration
    if (!options.config.apiKey || typeof options.config.apiKey !== 'string') {
      throw new Error('GitHub token is required and must be a string');
    }

    this.octokit = new Octokit({ auth: options.config.apiKey });

    // Parse owner/repo from git remote or config
    const { owner, repo } = this.parseGitHubRepo();
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Fetch workflow states from GitHub (simulated with labels)
   */
  async fetchStates(_projectId?: string): Promise<PMState[]> {
    // GitHub doesn't have workflow states, we simulate with labels
    await Promise.resolve(); // Satisfy linter for async method
    return [
      { id: 'open', name: 'Open', type: 'started' as StateType },
      { id: 'closed', name: 'Closed', type: 'completed' as StateType },
    ];
  }

  /**
   * Get a specific issue from GitHub
   */
  async getIssue(issueId: string): Promise<PMIssue> {
    try {
      const issueNumber = this.parseIssueNumber(issueId);
      const { data: issue } = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      return {
        id: String(issue.number),
        title: issue.title,
        description: issue.body || undefined,
        state: {
          id: issue.state,
          name: issue.state === 'closed' ? 'Closed' : 'Open',
          type: issue.state === 'closed' ? 'completed' : 'started',
        },
        url: issue.html_url,
        labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name || '')),
        assignee: issue.assignee?.login,
      };
    } catch (error) {
      throw new Error(`Failed to get GitHub issue ${issueId}: ${String(error)}`);
    }
  }

  /**
   * Update issue state in GitHub
   */
  async updateIssueState(issueId: string, stateId: string): Promise<void> {
    try {
      const issueNumber = this.parseIssueNumber(issueId);
      const state = stateId === 'closed' || stateId === 'completed' ? 'closed' : 'open';

      await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        state: state as 'open' | 'closed',
      });

      // Add/update hodge workflow label
      const workflowLabel = this.getWorkflowLabel(stateId);
      if (workflowLabel) {
        await this.updateLabels(issueNumber, workflowLabel);
      }
    } catch (error) {
      throw new Error(`Failed to update GitHub issue ${issueId}: ${String(error)}`);
    }
  }

  /**
   * Search for issues in GitHub
   */
  async searchIssues(query: string): Promise<PMIssue[]> {
    try {
      const searchQuery = `${query} repo:${this.owner}/${this.repo}`;
      const { data } = await this.octokit.search.issuesAndPullRequests({
        q: searchQuery,
        per_page: 10,
      });

      return data.items.map((issue) => ({
        id: String(issue.number),
        title: issue.title,
        description: issue.body || undefined,
        state: {
          id: issue.state,
          name: issue.state === 'closed' ? 'Closed' : 'Open',
          type: issue.state === 'closed' ? 'completed' : 'started',
        },
        url: issue.html_url,
        labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name || '')) || [],
      }));
    } catch (error) {
      throw new Error(`Failed to search GitHub issues: ${String(error)}`);
    }
  }

  /**
   * Create a new issue in GitHub
   */
  async createIssue(title: string, description?: string): Promise<PMIssue> {
    try {
      const { data: issue } = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body: description,
        labels: ['hodge:created'],
      });

      return {
        id: String(issue.number),
        title: issue.title,
        description: issue.body || undefined,
        state: {
          id: 'open',
          name: 'Open',
          type: 'started',
        },
        url: issue.html_url,
        labels: ['hodge:created'],
      };
    } catch (error) {
      throw new Error(`Failed to create GitHub issue: ${String(error)}`);
    }
  }

  /**
   * Find issue by feature name or ID
   */
  async findIssueByFeature(feature: string): Promise<PMIssue | undefined> {
    // First try as issue number
    if (feature.match(/^\d+$/)) {
      try {
        return await this.getIssue(feature);
      } catch {
        // Not a valid issue number
      }
    }

    // Try extracting number from HODGE-xxx format
    const hodgeMatch = feature.match(/HODGE-(\d+)/i);
    if (hodgeMatch) {
      try {
        return await this.getIssue(hodgeMatch[1]);
      } catch {
        // Not a valid issue number
      }
    }

    // Search by title
    const results = await this.searchIssues(`"${feature}" in:title`);
    return results[0];
  }

  /**
   * Add a comment to an issue
   */
  async addComment(issueId: string, body: string): Promise<void> {
    try {
      const issueNumber = this.parseIssueNumber(issueId);
      await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body,
      });
    } catch (error) {
      throw new Error(`Failed to add comment to GitHub issue ${issueId}: ${String(error)}`);
    }
  }

  /**
   * Update labels on an issue
   */
  private async updateLabels(issueNumber: number, label: string): Promise<void> {
    try {
      // Get current labels
      const { data: issue } = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      const currentLabels = issue.labels.map((l) => (typeof l === 'string' ? l : l.name || ''));

      // Remove other hodge: labels and add new one
      const updatedLabels = currentLabels.filter((l) => !l.startsWith('hodge:')).concat([label]);

      // Ensure label exists
      await this.ensureLabel(label);

      // Update labels
      await this.octokit.issues.setLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        labels: updatedLabels,
      });
    } catch (error) {
      // Ignore label errors - they're non-critical
      if (process.env.DEBUG) {
        console.log(`Could not update labels: ${String(error)}`);
      }
    }
  }

  /**
   * Ensure a label exists in the repository
   */
  private async ensureLabel(name: string): Promise<void> {
    try {
      await this.octokit.issues.getLabel({
        owner: this.owner,
        repo: this.repo,
        name,
      });
    } catch {
      // Label doesn't exist, create it
      const color = this.getLabelColor(name);
      await this.octokit.issues.createLabel({
        owner: this.owner,
        repo: this.repo,
        name,
        color,
        description: `Hodge workflow state`,
      });
    }
  }

  /**
   * Get label color based on workflow state
   */
  private getLabelColor(label: string): string {
    const colors: Record<string, string> = {
      'hodge:exploring': '0E8A16',
      'hodge:building': 'FBCA04',
      'hodge:hardening': '0052CC',
      'hodge:shipped': '5319E7',
      'hodge:created': 'D4C5F9',
    };
    return colors[label] || 'CCCCCC';
  }

  /**
   * Get workflow label for a state
   */
  private getWorkflowLabel(stateId: string): string | undefined {
    const labelMap: Record<string, string> = {
      'To Do': 'hodge:exploring',
      'In Progress': 'hodge:building',
      'In Review': 'hodge:hardening',
      Done: 'hodge:shipped',
      completed: 'hodge:shipped',
      closed: 'hodge:shipped',
    };
    return labelMap[stateId];
  }

  /**
   * Parse GitHub repository from git remote
   */
  private parseGitHubRepo(): { owner: string; repo: string } {
    try {
      // Try to get from git remote
      const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();

      // Match various GitHub URL formats
      const patterns = [
        /github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/,
        /git@github\.com:([^/]+)\/([^/.]+)(\.git)?$/,
        /https?:\/\/github\.com\/([^/]+)\/([^/.]+)(\.git)?$/,
      ];

      for (const pattern of patterns) {
        const match = remote.match(pattern);
        if (match) {
          return { owner: match[1], repo: match[2] };
        }
      }

      throw new Error('Could not parse GitHub repository from remote');
    } catch (error) {
      // Fallback to environment variables or config
      const owner = process.env.GITHUB_OWNER || process.env.GITHUB_ORG;
      const repo = process.env.GITHUB_REPO;

      if (owner && repo) {
        return { owner, repo };
      }

      throw new Error(`Not a GitHub repository: ${String(error)}`);
    }
  }

  /**
   * Parse issue number from various formats
   */
  private parseIssueNumber(issueId: string): number {
    // Try direct number
    const directNumber = parseInt(issueId, 10);
    if (!isNaN(directNumber)) {
      return directNumber;
    }

    // Try HODGE-xxx format
    const hodgeMatch = issueId.match(/HODGE-(\d+)/i);
    if (hodgeMatch) {
      return parseInt(hodgeMatch[1], 10);
    }

    // Try #xxx format
    const hashMatch = issueId.match(/#(\d+)/);
    if (hashMatch) {
      return parseInt(hashMatch[1], 10);
    }

    throw new Error(`Invalid issue ID format: ${issueId}`);
  }
}
