/**
 * Linear PM Adapter Implementation
 */

import { LinearClient } from '@linear/sdk';
import { BasePMAdapter } from './base-adapter.js';
import { PMAdapterOptions, PMIssue, PMState, StateType } from './types.js';

export class LinearAdapter extends BasePMAdapter {
  private client: LinearClient;
  private teamId: string;

  constructor(options: PMAdapterOptions) {
    super(options);

    // Validate required configuration
    if (!options.config.apiKey || typeof options.config.apiKey !== 'string') {
      throw new Error('Linear API key is required and must be a string');
    }

    if (!options.config.teamId || typeof options.config.teamId !== 'string') {
      throw new Error('Linear team ID is required and must be a string');
    }

    // Validate API key format (basic check)
    if (options.config.apiKey.length < 20) {
      throw new Error('Invalid Linear API key format');
    }

    this.client = new LinearClient({ apiKey: options.config.apiKey });
    this.teamId = options.config.teamId;
  }

  /**
   * Fetch workflow states from Linear
   */
  async fetchStates(_projectId?: string): Promise<PMState[]> {
    try {
      const team = await this.client.team(this.teamId);
      const states = await team.states();

      return states.nodes.map((state) => ({
        id: state.id,
        name: state.name,
        type: this.mapLinearType(state.type),
        color: state.color,
        description: state.description ?? undefined,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Linear states: ${String(error)}`);
    }
  }

  /**
   * Get a specific issue from Linear
   * @param issueId - Linear issue ID
   * @returns The issue details
   * @throws {Error} If issue ID is invalid or issue not found
   */
  async getIssue(issueId: string): Promise<PMIssue> {
    if (!issueId || typeof issueId !== 'string') {
      throw new Error('Invalid issue ID provided');
    }
    try {
      const issue = await this.client.issue(issueId);
      const state = await issue.state;

      if (!state) {
        throw new Error(`Issue ${issueId} has no state`);
      }

      return {
        id: issue.id,
        title: issue.title,
        description: issue.description ?? undefined,
        state: {
          id: state.id,
          name: state.name,
          type: this.mapLinearType(state.type),
        },
        url: issue.url,
        labels: await this.getIssueLabels(issue),
        assignee: (await issue.assignee)?.name ?? undefined,
      };
    } catch (error) {
      throw new Error(`Failed to get Linear issue ${issueId}: ${String(error)}`);
    }
  }

  /**
   * Update issue state in Linear
   * @param issueId - Linear issue ID
   * @param stateId - Target state ID
   * @throws {Error} If IDs are invalid or update fails
   */
  async updateIssueState(issueId: string, stateId: string): Promise<void> {
    if (!issueId || typeof issueId !== 'string') {
      throw new Error('Invalid issue ID provided');
    }

    if (!stateId || typeof stateId !== 'string') {
      throw new Error('Invalid state ID provided');
    }
    try {
      await this.client.updateIssue(issueId, { stateId });
    } catch (error) {
      throw new Error(`Failed to update Linear issue ${issueId}: ${String(error)}`);
    }
  }

  /**
   * Search for issues in Linear
   */
  async searchIssues(query: string): Promise<PMIssue[]> {
    try {
      const issues = await this.client.issues({
        filter: {
          or: [{ title: { contains: query } }, { description: { contains: query } }],
        },
      });

      const results: PMIssue[] = [];
      for (const issue of issues.nodes) {
        const state = await issue.state;
        if (state) {
          results.push({
            id: issue.id,
            title: issue.title,
            description: issue.description ?? undefined,
            state: {
              id: state.id,
              name: state.name,
              type: this.mapLinearType(state.type),
            },
            url: issue.url,
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to search Linear issues: ${String(error)}`);
    }
  }

  /**
   * Create a new issue in Linear
   */
  async createIssue(title: string, description?: string): Promise<PMIssue> {
    try {
      const issue = await this.client.createIssue({
        teamId: this.teamId,
        title,
        description,
      });

      const createdIssue = await issue.issue;
      if (!createdIssue) {
        throw new Error('Failed to create issue');
      }

      const state = await createdIssue.state;
      if (!state) {
        throw new Error('Created issue has no state');
      }

      return {
        id: createdIssue.id,
        title: createdIssue.title,
        description: createdIssue.description ?? undefined,
        state: {
          id: state.id,
          name: state.name,
          type: this.mapLinearType(state.type),
        },
        url: createdIssue.url,
      };
    } catch (error) {
      throw new Error(`Failed to create Linear issue: ${String(error)}`);
    }
  }

  /**
   * Map Linear state types to our StateType
   */
  private mapLinearType(linearType: string): StateType {
    const typeMap: Record<string, StateType> = {
      backlog: 'unstarted',
      unstarted: 'unstarted',
      started: 'started',
      completed: 'completed',
      canceled: 'canceled',
    };

    return typeMap[linearType] ?? 'unknown';
  }

  /**
   * Get issue labels
   */
  private async getIssueLabels(issue: {
    labels: () => Promise<{ nodes: Array<{ name: string }> }>;
  }): Promise<string[]> {
    try {
      const labels = await issue.labels();
      return labels.nodes.map((label) => label.name);
    } catch {
      return [];
    }
  }

  /**
   * Get issue by title or ID
   */
  async findIssueByFeature(feature: string): Promise<PMIssue | undefined> {
    // First try as ID
    if (/^[A-Z]+-\d+$/.test(feature)) {
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
   * Add a comment to a Linear issue
   * @param issueId - Linear issue ID
   * @param body - Comment body in markdown format
   */
  async addComment(issueId: string, body: string): Promise<void> {
    if (!issueId || typeof issueId !== 'string') {
      throw new Error('Invalid issue ID provided');
    }

    if (!body || typeof body !== 'string') {
      throw new Error('Comment body is required');
    }

    try {
      const result = await this.client.createComment({
        issueId,
        body,
      });

      // Check if comment was created successfully
      const comment = await result.comment;
      if (!comment) {
        throw new Error('Failed to create comment');
      }
    } catch (error) {
      throw new Error(`Failed to add comment to Linear issue ${issueId}: ${String(error)}`);
    }
  }

  /**
   * Append a comment to a Linear issue
   * HODGE-377.4: Implements BasePMAdapter.appendComment interface
   * @param issueId - Linear issue ID
   * @param comment - Comment body in markdown format
   */
  async appendComment(issueId: string, comment: string): Promise<void> {
    return this.addComment(issueId, comment);
  }

  /**
   * Check if input is a valid Linear issue ID
   * Linear IDs follow the format: PROJ-123
   * Must match the ENTIRE input, not just part of it
   */
  isValidIssueID(input: string): boolean {
    const trimmed = input.trim();
    return /^[A-Z]+-\d+$/.test(trimmed);
  }
}
