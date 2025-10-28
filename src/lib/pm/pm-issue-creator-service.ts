import { LinearAdapter } from './linear-adapter.js';
import { GitHubAdapter } from './github-adapter.js';
import { IDManager } from '../id-manager.js';

interface CreateIssueResult {
  externalId?: string;
  error?: string;
}

interface SubIssue {
  id: string;
  title: string;
}

/**
 * Service for creating PM issues
 * Reduces complexity by extracting issue creation logic
 */
export class PMIssueCreatorService {
  constructor(private idManager: IDManager) {}

  /**
   * Create Linear issue
   */
  async createLinearIssue(
    apiKey: string,
    feature: string,
    description: string,
    isEpic: boolean,
    subIssues?: SubIssue[]
  ): Promise<CreateIssueResult> {
    const linearAdapter = new LinearAdapter({
      config: {
        tool: 'linear' as const,
        apiKey,
        teamId: process.env.LINEAR_TEAM_ID || '',
      },
    });

    // Create main issue
    const issue = await linearAdapter.createIssue(feature, description);
    const externalId = issue.id;

    // Handle sub-issues if this is an epic
    if (isEpic && subIssues) {
      await this.createLinearSubIssues(linearAdapter, feature, subIssues);
    }

    return { externalId };
  }

  /**
   * Create Linear sub-issues atomically with rollback
   */
  private async createLinearSubIssues(
    linearAdapter: LinearAdapter,
    feature: string,
    subIssues: SubIssue[]
  ): Promise<void> {
    const createdSubIssues: string[] = [];

    try {
      for (const subIssue of subIssues) {
        const sub = await linearAdapter.createIssue(subIssue.title, `Sub-task of ${feature}`);
        createdSubIssues.push(sub.id);
        // Map sub-issue ID
        await this.idManager.mapFeature(subIssue.id, sub.id, 'linear');
      }
    } catch (error) {
      // Rollback: close created sub-issues (Linear doesn't have delete)
      await this.rollbackLinearSubIssues(linearAdapter, createdSubIssues);
      throw error;
    }
  }

  /**
   * Rollback Linear sub-issues on failure
   */
  private async rollbackLinearSubIssues(
    linearAdapter: LinearAdapter,
    createdSubIssues: string[]
  ): Promise<void> {
    for (const subId of createdSubIssues) {
      try {
        await linearAdapter.updateIssueState(subId, 'canceled');
      } catch {
        // Ignore rollback failures
      }
    }
  }

  /**
   * Create GitHub issue
   */
  async createGitHubIssue(
    apiKey: string,
    feature: string,
    description: string
  ): Promise<CreateIssueResult> {
    const githubRepo = process.env.GITHUB_REPO || '';
    const githubAdapter = new GitHubAdapter({
      config: {
        tool: 'github' as const,
        apiKey,
        projectId: githubRepo,
      },
    });

    const issue = await githubAdapter.createIssue(feature, description);
    return { externalId: issue.id };
  }
}
