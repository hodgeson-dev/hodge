import chalk from 'chalk';
import { LinearAdapter } from './linear-adapter.js';
import { GitHubAdapter } from './github-adapter.js';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { ShipContext } from './types.js';
import { CommentGeneratorService } from './comment-generator-service.js';
import { createCommandLogger } from '../logger.js';
import type { ConfigManager } from '../config-manager.js';

/**
 * Service for handling PM adapter operations
 * Reduces complexity by extracting PM tool-specific logic
 */
export class PMAdapterService {
  private logger = createCommandLogger('p-m-adapter-service', { enableConsole: false });

  constructor(
    private localAdapter: LocalPMAdapter,
    private commentGenerator: CommentGeneratorService,
    private configManager: ConfigManager
  ) {}

  /**
   * Call the appropriate PM adapter based on tool
   */
  async updatePMStatus(
    tool: string,
    feature: string,
    status: string,
    shipContext?: ShipContext
  ): Promise<void> {
    switch (tool.toLowerCase()) {
      case 'local':
        await this.updateLocal(feature, status);
        break;

      case 'linear':
        await this.updateLinear(feature, status, shipContext);
        break;

      case 'github':
        await this.updateGitHub(feature, status, shipContext);
        break;

      default:
        throw new Error(`PM tool ${tool} not supported`);
    }
  }

  /**
   * Update local PM adapter
   */
  private async updateLocal(feature: string, status: string): Promise<void> {
    await this.localAdapter.updateIssueState(feature, status);
  }

  /**
   * Update Linear issue
   */
  private async updateLinear(
    feature: string,
    status: string,
    shipContext?: ShipContext
  ): Promise<void> {
    const apiKey = this.configManager.getPMApiKey('linear');
    const teamId = this.configManager.getPMTeamId();

    if (!apiKey || !teamId) {
      throw new Error('Linear API key and team ID are required');
    }

    const adapter = new LinearAdapter({
      config: {
        apiKey,
        teamId,
        tool: 'linear',
      },
    });

    // Find and update the issue
    const issue = await adapter.findIssueByFeature(feature);
    if (!issue) {
      return;
    }

    // Update issue state
    const states = await adapter.fetchStates();
    const targetState = this.mapToLinearState(status, states);
    await adapter.updateIssueState(issue.id, targetState.id);

    // Add rich comment if ship context is available
    if (shipContext && status === 'Done') {
      await this.addRichComment(adapter, issue.id, shipContext);
    }
  }

  /**
   * Update GitHub issue
   */
  private async updateGitHub(
    feature: string,
    status: string,
    shipContext?: ShipContext
  ): Promise<void> {
    const apiKey = this.configManager.getPMApiKey('github');

    if (!apiKey) {
      throw new Error('GitHub token is required');
    }

    const adapter = new GitHubAdapter({
      config: {
        apiKey,
        tool: 'github',
      },
    });

    // Find and update the issue
    const issue = await adapter.findIssueByFeature(feature);
    if (!issue) {
      return;
    }

    // GitHub only has open/closed states
    const targetState = status === 'Done' || status === 'shipped' ? 'closed' : 'open';
    await adapter.updateIssueState(issue.id, targetState);

    // Add rich comment if ship context is available
    if (shipContext && (status === 'Done' || status === 'shipped')) {
      await this.addRichComment(adapter, issue.id, shipContext);
    }
  }

  /**
   * Add rich comment to issue
   */
  private async addRichComment(
    adapter: LinearAdapter | GitHubAdapter,
    issueId: string,
    context: ShipContext
  ): Promise<void> {
    const comment = await this.commentGenerator.generate(context);
    await adapter.addComment(issueId, comment);

    const isDebug = await this.configManager.isDebugMode();
    if (isDebug) {
      this.logger.info(chalk.gray('   Added rich comment to issue'));
    }
  }

  /**
   * Smart state mapping for Linear
   */
  private mapToLinearState(
    hodgeStatus: string,
    linearStates: Array<{ id: string; name: string; type: string }>
  ): { id: string; name: string; type: string } {
    // First try exact match by name
    const exactMatch = linearStates.find((s) => s.name.toLowerCase() === hodgeStatus.toLowerCase());
    if (exactMatch) {
      return exactMatch;
    }

    // Then try type-based matching
    const typeMap: Record<string, string> = {
      'To Do': 'unstarted',
      'In Progress': 'started',
      'In Review': 'started',
      Done: 'completed',
    };

    const targetType = typeMap[hodgeStatus] || 'started';
    return linearStates.find((s) => s.type === targetType) || linearStates[0];
  }
}
