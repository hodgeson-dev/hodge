import chalk from 'chalk';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { getConfigManager } from '../config-manager.js';
import { ShipContext } from './types.js';
import { IDManager } from '../id-manager.js';
import { LinearAdapter } from './linear-adapter.js';
import { GitHubAdapter } from './github-adapter.js';
import { CommentGeneratorService } from './comment-generator-service.js';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { createCommandLogger } from '../logger.js';
type WorkflowPhase = 'explore' | 'build' | 'harden' | 'ship';

interface QueuedOperation {
  type: 'create_issue' | 'create_epic';
  feature: string;
  decisions: string[];
  isEpic?: boolean;
  subIssues?: Array<{ id: string; title: string }>;
  timestamp: string;
}

/**
 * PM integration hooks with configuration support and better error handling
 * Implements decisions:
 * - Silent failure with logging for PM API failures
 * - Simple status mapping from hodge.json
 * - Hooks for critical workflow commands only
 */
export class PMHooks {
  private logger = createCommandLogger('p-m-hooks', { enableConsole: false });

  private localAdapter: LocalPMAdapter;
  private configManager = getConfigManager();
  private shipContext?: ShipContext;
  private idManager: IDManager;
  private pmQueueFile: string;
  private basePath: string;
  private commentGenerator: CommentGeneratorService;

  constructor(
    basePath?: string,
    commentGenerator = new CommentGeneratorService()
  ) {
    this.basePath = basePath ?? process.cwd();
    this.localAdapter = new LocalPMAdapter(basePath);
    this.idManager = new IDManager();
    this.pmQueueFile = path.join(this.basePath, '.hodge/.pm-queue.json');
    this.commentGenerator = commentGenerator;
  }

  /**
   * Initialize PM tracking and load configuration
   */
  async init(): Promise<void> {
    // Always initialize local adapter
    await this.localAdapter.init();

    // Load configuration through ConfigManager
    await this.configManager.load();
  }

  /**
   * Hook called when exploring a new feature
   */
  async onExplore(feature: string, description?: string): Promise<void> {
    // Update local tracking
    try {
      await this.localAdapter.addFeature(feature, description ?? `Feature ${feature}`, 'TBD');
    } catch {
      // Feature might already exist, just update status
      await this.localAdapter.updateFeatureStatus(feature, 'exploring');
    }

    // Update external PM (non-blocking)
    this.updateExternalPMSilently(feature, 'explore');
  }

  /**
   * Hook called when entering build phase
   */
  async onBuild(feature: string): Promise<void> {
    await this.localAdapter.updateFeatureStatus(feature, 'building');
    this.updateExternalPMSilently(feature, 'build');
  }

  /**
   * Hook called when entering harden phase
   */
  async onHarden(feature: string): Promise<void> {
    await this.localAdapter.updateFeatureStatus(feature, 'hardening');
    this.updateExternalPMSilently(feature, 'harden');
  }

  /**
   * Hook called when shipping a feature
   */
  async onShip(featureOrContext: string | ShipContext): Promise<void> {
    const feature =
      typeof featureOrContext === 'string' ? featureOrContext : featureOrContext.feature;
    this.shipContext = typeof featureOrContext === 'object' ? featureOrContext : undefined;

    await this.localAdapter.updateFeatureStatus(feature, 'shipped');
    await this.localAdapter.updatePhaseProgress();
    this.updateExternalPMSilently(feature, 'ship');

    this.logger.info(chalk.green('✓ Updated project management tracking'));
  }

  /**
   * Update external PM tool silently (non-blocking with logging)
   * Implements silent failure decision - never blocks commands
   */
  private updateExternalPMSilently(feature: string, phase: WorkflowPhase): void {
    // Run async update in background - don't await
    void (async () => {
      try {
        // Get PM configuration
        const pmTool = await this.configManager.getPMTool();
        const apiKey = this.configManager.getPMApiKey(pmTool);

        // Skip if no PM tool configured
        if (!pmTool || !apiKey || pmTool === 'local') {
          return;
        }

        // Log attempt if in debug mode
        const isDebug = await this.configManager.isDebugMode();
        if (isDebug) {
          this.logger.info(chalk.blue(`📋 Updating ${pmTool} issue: ${feature}`));
        }

        // Get status from configuration (includes defaults)
        const pmConfig = await this.configManager.getPMConfig();
        const status = pmConfig?.statusMap?.[phase];

        if (!status) {
          this.logger.error(`No status mapping found for phase: ${phase}`);
          return;
        }

        // Call the appropriate adapter
        await this.callPMAdapter(pmTool, feature, status);

        // Silent success - only log in debug mode
        const debugMode = await this.configManager.isDebugMode();
        if (debugMode) {
          this.logger.info(chalk.green(`   ✓ Updated to status: ${status}`));
        }
      } catch (error) {
        // Silent failure with optional logging
        const debugMode = await this.configManager.isDebugMode();
        const pmTool = await this.configManager.getPMTool();
        if (debugMode || process.env.HODGE_PM_DEBUG) {
          this.logger.info(
            chalk.gray(`   ℹ️ Could not update ${String(pmTool)} issue (non-blocking)`)
          );
          if (process.env.HODGE_PM_DEBUG) {
            this.logger.info(chalk.gray(`   Error: ${String(error)}`));
          }
        }
        // Never throw - PM updates should never block workflow
      }
    })();
  }

  /**
   * Call the appropriate PM adapter based on tool
   */
  private async callPMAdapter(tool: string, feature: string, status: string): Promise<void> {
    switch (tool.toLowerCase()) {
      case 'local':
        // LocalPMAdapter can now be called through unified interface
        // This is optional - the direct calls in methods above still work
        await this.localAdapter.updateIssueState(feature, status);
        break;

      case 'linear': {
        const apiKey = this.configManager.getPMApiKey('linear');
        const teamId = this.configManager.getPMTeamId();
        if (!apiKey || !teamId) {
          throw new Error('Linear API key and team ID are required');
        }
        const { LinearAdapter } = await import('./linear-adapter.js');
        const adapter = new LinearAdapter({
          config: {
            apiKey,
            teamId,
            tool: 'linear',
          },
        });

        // Find and update the issue
        const issue = await adapter.findIssueByFeature(feature);
        if (issue) {
          // Get Linear's states and map intelligently
          const states = await adapter.fetchStates();
          const targetState = this.mapToLinearState(status, states);
          await adapter.updateIssueState(issue.id, targetState.id);

          // Add rich comment if ship context is available
          if (this.shipContext && status === 'Done') {
            const comment = await this.generateRichComment(this.shipContext);
            await adapter.addComment(issue.id, comment);
            const isDebug = await this.configManager.isDebugMode();
            if (isDebug) {
              this.logger.info(chalk.gray('   Added rich comment to Linear issue'));
            }
          }
        }
        break;
      }

      case 'github': {
        const apiKey = this.configManager.getPMApiKey('github');
        if (!apiKey) {
          throw new Error('GitHub token is required');
        }
        const { GitHubAdapter } = await import('./github-adapter.js');
        const githubAdapter = new GitHubAdapter({
          config: {
            apiKey,
            tool: 'github',
          },
        });

        // Find and update the issue
        const githubIssue = await githubAdapter.findIssueByFeature(feature);
        if (githubIssue) {
          // GitHub only has open/closed states
          const targetState = status === 'Done' || status === 'shipped' ? 'closed' : 'open';
          await githubAdapter.updateIssueState(githubIssue.id, targetState);

          // Add rich comment if ship context is available
          if (this.shipContext && (status === 'Done' || status === 'shipped')) {
            const comment = await this.generateRichComment(this.shipContext);
            await githubAdapter.addComment(githubIssue.id, comment);
          }
        }
        break;
      }

      default:
        throw new Error(`PM tool ${tool} not supported`);
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
    if (exactMatch) return exactMatch;

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

  /**
   * Generate rich comment based on verbosity level
   */
  private async generateRichComment(context: ShipContext): Promise<string> {
    return this.commentGenerator.generate(context);
  }

  /**
   * Create PM issue after decide phase completes
   * Per our decisions: issues are created after decide, not during explore
   */
  async createPMIssue(
    feature: string,
    decisions: string[],
    isEpic: boolean = false,
    subIssues?: Array<{ id: string; title: string }>
  ): Promise<{ created: boolean; issueId?: string; error?: string }> {
    try {
      // Get PM configuration
      const pmTool = await this.configManager.getPMTool();
      const apiKey = this.configManager.getPMApiKey(pmTool);

      // Skip if no PM tool configured
      if (!pmTool || !apiKey || pmTool === 'local') {
        return { created: false, error: 'No PM tool configured' };
      }

      // Check if issue already exists
      const featureId = await this.idManager.resolveID(feature);
      if (featureId?.externalID) {
        return { created: false, error: 'Issue already exists', issueId: featureId.externalID };
      }

      // Create the issue based on PM tool
      let externalId: string | undefined;

      switch (pmTool) {
        case 'linear': {
          const linearAdapter = new LinearAdapter({
            config: {
              tool: 'linear' as const,
              apiKey,
              teamId: process.env.LINEAR_TEAM_ID || '',
            },
          });

          // Create issue with decisions in description
          const description = await this.formatDecisionsForPM(feature, decisions);
          const issue = await linearAdapter.createIssue(feature, description);
          externalId = issue.id;

          // Handle sub-issues if this is an epic
          if (isEpic && subIssues) {
            // Create sub-issues atomically (with rollback on failure)
            const createdSubIssues: string[] = [];
            try {
              for (const subIssue of subIssues) {
                const sub = await linearAdapter.createIssue(
                  subIssue.title,
                  `Sub-task of ${feature}`
                );
                createdSubIssues.push(sub.id);
                // Map sub-issue ID
                await this.idManager.mapFeature(subIssue.id, sub.id, 'linear');
              }
            } catch (error) {
              // Rollback: delete created sub-issues
              for (const subId of createdSubIssues) {
                // Linear doesn't have a delete API, so we'll close them
                await linearAdapter.updateIssueState(subId, 'canceled');
              }
              // Queue for retry
              await this.queuePMOperation({
                type: 'create_epic',
                feature,
                decisions,
                isEpic,
                subIssues,
                timestamp: new Date().toISOString(),
              });
              throw error;
            }
          }
          break;
        }

        case 'github': {
          const githubRepo = process.env.GITHUB_REPO || '';
          const githubAdapter = new GitHubAdapter({
            config: {
              tool: 'github' as const,
              apiKey,
              projectId: githubRepo,
            },
          });

          const description = await this.formatDecisionsForPM(feature, decisions);
          const issue = await githubAdapter.createIssue(feature, description);
          externalId = issue.id;
          break;
        }

        default:
          return { created: false, error: `PM tool ${pmTool} not supported` };
      }

      // Map the external ID
      if (externalId) {
        await this.idManager.mapFeature(feature, externalId, pmTool);
        return { created: true, issueId: externalId };
      }

      return { created: false, error: 'Failed to create issue' };
    } catch (error) {
      // Queue for later retry
      await this.queuePMOperation({
        type: 'create_issue',
        feature,
        decisions,
        isEpic,
        subIssues,
        timestamp: new Date().toISOString(),
      });

      const debugMode = await this.configManager.isDebugMode();
      if (debugMode) {
        this.logger.warn(
          chalk.yellow(`   ⚠️  Queued PM issue creation for later (${String(error)})`)
        );
      }

      return { created: false, error: String(error) };
    }
  }

  /**
   * Format decisions for PM issue description
   * Includes problem statement from exploration.md before decisions list
   */
  private async formatDecisionsForPM(feature: string, decisions: string[]): Promise<string> {
    let description = '';

    // Extract problem statement from exploration.md
    const problemStatement = await this.extractProblemStatement(feature);
    if (problemStatement) {
      description += `${problemStatement}\n\n`;
    }

    // Add decisions list
    if (decisions.length === 0) {
      if (!problemStatement) {
        return 'Created via Hodge workflow';
      }
      description += '\n---\n_Created by Hodge_';
      return description;
    }

    description += '## Decisions Made\n\n';
    decisions.forEach((decision, index) => {
      description += `${index + 1}. ${decision}\n`;
    });
    description += '\n---\n_Created by Hodge after decide phase_';
    return description;
  }

  /**
   * Extract problem statement from exploration.md for PM issue description
   */
  private async extractProblemStatement(feature: string): Promise<string | null> {
    const explorationFile = path.join(
      this.localAdapter['basePath'] || process.cwd(),
      '.hodge',
      'features',
      feature,
      'explore',
      'exploration.md'
    );

    if (!existsSync(explorationFile)) {
      return null;
    }

    try {
      const content = await fs.readFile(explorationFile, 'utf-8');

      // Try to extract from ## Problem Statement heading
      const headingMatch = /## Problem Statement\s*\n([^\n]+(?:\n(?!##)[^\n]+)*)/.exec(content);
      if (headingMatch && headingMatch[1]) {
        return headingMatch[1].trim();
      }

      // Try to extract from **Problem Statement:** inline format
      const inlineMatch = /\*\*Problem Statement:\*\*\s*\n([^\n]+(?:\n(?!\*\*)[^\n]+)*)/.exec(
        content
      );
      if (inlineMatch && inlineMatch[1]) {
        return inlineMatch[1].trim();
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Queue PM operation for later retry
   */
  private async queuePMOperation(operation: QueuedOperation): Promise<void> {
    try {
      let queue: QueuedOperation[] = [];
      if (existsSync(this.pmQueueFile)) {
        const content = await fs.readFile(this.pmQueueFile, 'utf-8');
        queue = JSON.parse(content) as QueuedOperation[];
      }

      queue.push(operation);

      // Ensure directory exists
      await fs.mkdir(path.dirname(this.pmQueueFile), { recursive: true });
      await fs.writeFile(this.pmQueueFile, JSON.stringify(queue, null, 2));
    } catch (error) {
      // Silently fail - queue is best effort
      const debugMode = await this.configManager.isDebugMode();
      if (debugMode) {
        this.logger.info(chalk.gray(`   Could not queue operation: ${String(error)}`));
      }
    }
  }

  /**
   * Process queued PM operations
   */
  async processQueue(): Promise<void> {
    if (!existsSync(this.pmQueueFile)) {
      return;
    }

    try {
      const content = await fs.readFile(this.pmQueueFile, 'utf-8');
      const queue = JSON.parse(content) as QueuedOperation[];

      if (queue.length === 0) {
        return;
      }

      const debugMode = await this.configManager.isDebugMode();
      if (debugMode) {
        this.logger.info(chalk.blue(`📋 Processing ${queue.length} queued PM operations...`));
      }

      const remaining: QueuedOperation[] = [];
      for (const operation of queue) {
        try {
          if (operation.type === 'create_issue' || operation.type === 'create_epic') {
            const result = await this.createPMIssue(
              operation.feature,
              operation.decisions,
              operation.isEpic || false,
              operation.subIssues
            );
            if (!result.created && result.error !== 'Issue already exists') {
              remaining.push(operation);
            }
          }
        } catch (error) {
          remaining.push(operation);
        }
      }

      // Update queue with remaining operations
      if (remaining.length > 0) {
        await fs.writeFile(this.pmQueueFile, JSON.stringify(remaining, null, 2));
      } else {
        // Delete queue file if empty
        await fs.unlink(this.pmQueueFile);
      }
    } catch (error) {
      // Silently fail
      const debugMode = await this.configManager.isDebugMode();
      if (debugMode) {
        this.logger.info(chalk.gray(`   Could not process queue: ${String(error)}`));
      }
    }
  }
}
