/**
 * GitHub Issues PM Adapter Implementation
 */

import { BasePMAdapter } from './base-adapter.js';
import { PMAdapterOptions, PMIssue, PMState, StateType } from './types.js';
import { execSync } from 'child_process';

// Type definitions for GitHub API responses
interface GitHubIssue {
  number: number;
  title: string;
  state?: string;
  body?: string | null;
  html_url: string;
}

interface GitHubApiClient {
  issues: {
    get: (params: unknown) => Promise<{ data: GitHubIssue }>;
    create: (params: unknown) => Promise<{ data: GitHubIssue }>;
    update: (params: unknown) => Promise<{ data: GitHubIssue }>;
    createComment: (params: unknown) => Promise<void>;
    addLabels: (params: unknown) => Promise<void>;
  };
  search: {
    issuesAndPullRequests: (params: unknown) => Promise<{ data: { items: GitHubIssue[] } }>;
  };
}

export class GitHubAdapter extends BasePMAdapter {
  private octokit?: GitHubApiClient;
  private owner: string;
  private repo: string;
  private apiKey: string;
  private octokitLoaded = false;

  constructor(options: PMAdapterOptions) {
    super(options);

    // Validate required configuration
    if (!options.config.apiKey || typeof options.config.apiKey !== 'string') {
      throw new Error('GitHub token is required and must be a string');
    }

    this.apiKey = options.config.apiKey;

    // Parse owner/repo from git remote or config
    const { owner, repo } = this.parseGitHubRepo();
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Lazy-load Octokit to avoid CommonJS/ES module warnings
   */
  private async ensureOctokit(): Promise<void> {
    if (!this.octokitLoaded) {
      try {
        // Dynamic import to avoid loading at module level
        const { Octokit } = await import('@octokit/rest');
        // Cast to our interface - we know the shape matches
        this.octokit = new Octokit({ auth: this.apiKey }) as unknown as GitHubApiClient;
        this.octokitLoaded = true;
      } catch (error) {
        throw new Error(`Failed to load GitHub API client: ${String(error)}`);
      }
    }
  }

  /**
   * Get the octokit client, ensuring it's loaded
   */
  private getOctokit(): GitHubApiClient {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized. Call ensureOctokit() first.');
    }
    return this.octokit;
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
    await this.ensureOctokit();

    try {
      const issueNumber = this.parseIssueNumber(issueId);
      const octokit = this.getOctokit();
      const { data: issue } = await octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      return {
        id: issue.number.toString(),
        title: issue.title,
        state: {
          id: issue.state ?? 'open',
          name: issue.state === 'closed' ? 'Closed' : 'Open',
          type: issue.state === 'closed' ? ('completed' as StateType) : ('started' as StateType),
        },
        description: issue.body || '',
        url: issue.html_url,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch issue: ${errorMessage}`);
    }
  }

  /**
   * Create a new issue on GitHub
   */
  async createIssue(title: string, description?: string, _projectId?: string): Promise<PMIssue> {
    await this.ensureOctokit();
    const octokit = this.getOctokit();

    try {
      const { data: issue } = await octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body: description ?? '',
        labels: ['hodge'],
      });

      return {
        id: issue.number.toString(),
        title: issue.title,
        state: {
          id: issue.state ?? 'open',
          name: issue.state === 'closed' ? 'Closed' : 'Open',
          type: issue.state === 'closed' ? ('completed' as StateType) : ('started' as StateType),
        },
        description: issue.body || '',
        url: issue.html_url,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create issue: ${errorMessage}`);
    }
  }

  /**
   * Update an existing issue on GitHub
   */
  async updateIssue(
    issueId: string,
    updates: { title?: string; description?: string; status?: string }
  ): Promise<PMIssue> {
    await this.ensureOctokit();
    const octokit = this.getOctokit();

    try {
      const issueNumber = this.parseIssueNumber(issueId);

      // Update basic fields
      if (updates.title || updates.description) {
        await octokit.issues.update({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          ...(updates.title && { title: updates.title }),
          ...(updates.description && { body: updates.description }),
        });
      }

      // Handle status change (open/close)
      if (updates.status === 'closed' || updates.status === 'completed') {
        await octokit.issues.update({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          state: 'closed',
        });
      } else if (updates.status === 'open' || updates.status === 'started') {
        await octokit.issues.update({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          state: 'open',
        });
      }

      return this.getIssue(issueId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update issue: ${errorMessage}`);
    }
  }

  /**
   * Search for issues by title
   */
  async searchIssues(query: string): Promise<PMIssue[]> {
    await this.ensureOctokit();
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.search.issuesAndPullRequests({
        q: `${query} repo:${this.owner}/${this.repo} is:issue`,
        per_page: 10,
      });

      return data.items.map((issue) => ({
        id: issue.number.toString(),
        title: issue.title,
        state: {
          id: issue.state ?? 'open',
          name: issue.state === 'closed' ? 'Closed' : 'Open',
          type: issue.state === 'closed' ? ('completed' as StateType) : ('started' as StateType),
        },
        description: issue.body || '',
        url: issue.html_url,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to search issues: ${errorMessage}`);
    }
  }

  /**
   * Update issue state in GitHub
   */
  async updateIssueState(issueId: string, stateId: string): Promise<void> {
    await this.ensureOctokit();
    const octokit = this.getOctokit();

    try {
      const issueNumber = this.parseIssueNumber(issueId);

      // GitHub only has open/closed states
      if (stateId === 'closed' || stateId === 'completed') {
        await octokit.issues.update({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          state: 'closed',
        });
      } else if (stateId === 'open' || stateId === 'started') {
        await octokit.issues.update({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          state: 'open',
        });
      } else {
        // Add label for hodge workflow state
        const labelName = `hodge:${stateId}`;
        await octokit.issues.addLabels({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          labels: [labelName],
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update issue state: ${errorMessage}`);
    }
  }

  /**
   * Add a comment to an issue (for context updates)
   */
  async addComment(issueId: string, comment: string): Promise<void> {
    await this.ensureOctokit();
    const octokit = this.getOctokit();

    try {
      const issueNumber = this.parseIssueNumber(issueId);
      await octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: comment,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to add comment: ${errorMessage}`);
    }
  }

  /**
   * Get issue by title or ID
   */
  async findIssueByFeature(feature: string): Promise<PMIssue | undefined> {
    // First try as issue number
    if (feature.match(/^\d+$/)) {
      try {
        return await this.getIssue(feature);
      } catch {
        // Not an ID, continue
      }
    }

    // Search by title
    const results = await this.searchIssues(feature);
    return results.find((issue) => issue.title.toLowerCase().includes(feature.toLowerCase()));
  }

  /**
   * Find issue by local ID in comments or title
   */
  async findIssueByLocalId(localId: string): Promise<PMIssue | null> {
    await this.ensureOctokit();
    const octokit = this.getOctokit();

    try {
      // Search for issue with local ID in title or body
      const { data } = await octokit.search.issuesAndPullRequests({
        q: `${localId} repo:${this.owner}/${this.repo} is:issue`,
        per_page: 5,
      });

      if (data.items.length > 0) {
        const issue = data.items[0];
        return {
          id: issue.number.toString(),
          title: issue.title,
          state: {
            id: issue.state ?? 'open',
            name: issue.state === 'closed' ? 'Closed' : 'Open',
            type: issue.state === 'closed' ? ('completed' as StateType) : ('started' as StateType),
          },
          description: issue.body || '',
          url: issue.html_url,
        };
      }

      return null;
    } catch (error) {
      // Silently return null if search fails
      return null;
    }
  }

  /**
   * Create an epic with sub-issues
   */
  async createEpicWithStories(
    epicTitle: string,
    epicDescription: string,
    stories: Array<{ title: string; description?: string }>
  ): Promise<{ epic: PMIssue; stories: PMIssue[] }> {
    await this.ensureOctokit();
    const octokit = this.getOctokit();

    try {
      // Create the epic (parent issue)
      const { data: epicIssue } = await octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: epicTitle,
        body: epicDescription,
        labels: ['hodge', 'epic'],
      });

      const epic: PMIssue = {
        id: epicIssue.number.toString(),
        title: epicIssue.title,
        state: {
          id: epicIssue.state ?? 'open',
          name: epicIssue.state === 'closed' ? 'Closed' : 'Open',
          type:
            epicIssue.state === 'closed' ? ('completed' as StateType) : ('started' as StateType),
        },
        description: epicIssue.body || '',
        url: epicIssue.html_url,
      };

      // Create sub-issues with references to the epic
      const createdStories: PMIssue[] = [];
      for (const story of stories) {
        const storyBody = `${story.description ?? ''}\n\n---\nParent Epic: #${epicIssue.number}`;
        const { data: storyIssue } = await octokit.issues.create({
          owner: this.owner,
          repo: this.repo,
          title: story.title,
          body: storyBody,
          labels: ['hodge', 'story'],
        });

        createdStories.push({
          id: storyIssue.number.toString(),
          title: storyIssue.title,
          state: {
            id: storyIssue.state ?? 'open',
            name: storyIssue.state === 'closed' ? 'Closed' : 'Open',
            type:
              storyIssue.state === 'closed' ? ('completed' as StateType) : ('started' as StateType),
          },
          description: storyIssue.body || '',
          url: storyIssue.html_url,
        });
      }

      // Update epic body with links to stories
      const storyLinks = createdStories
        .map((story) => `- [ ] #${story.id} - ${story.title}`)
        .join('\n');
      const updatedBody = `${epicDescription}\n\n## Stories\n${storyLinks}`;

      await octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: epicIssue.number,
        body: updatedBody,
      });

      return { epic, stories: createdStories };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create epic with stories: ${errorMessage}`);
    }
  }

  /**
   * Parse GitHub owner/repo from git remote
   */
  private parseGitHubRepo(): { owner: string; repo: string } {
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf-8',
      }).trim();

      // Parse GitHub URL formats
      let match;
      if (remoteUrl.includes('github.com')) {
        // SSH format: git@github.com:owner/repo.git
        match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
          return { owner: match[1], repo: match[2] };
        }

        // HTTPS format: https://github.com/owner/repo.git
        match = remoteUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
        if (match) {
          return { owner: match[1], repo: match[2] };
        }
      }
    } catch (error) {
      // Fall through to throw error below
    }

    throw new Error(
      'Could not parse GitHub repository from git remote. Ensure you are in a git repository with a GitHub remote.'
    );
  }

  /**
   * Parse issue number from various formats
   */
  private parseIssueNumber(issueId: string): number {
    // Handle formats: "123", "#123", "GH-123"
    const match = issueId.match(/\d+/);
    if (!match) {
      throw new Error(`Invalid issue ID format: ${issueId}`);
    }
    return parseInt(match[0], 10);
  }
}
