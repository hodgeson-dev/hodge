import chalk from 'chalk';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { getConfigManager } from '../config-manager.js';
import { ShipContext } from './types.js';
import { IDManager } from '../id-manager.js';
import { CommentGeneratorService } from './comment-generator-service.js';
import { PMAdapterService } from './pm-adapter-service.js';
import { PMIssueCreatorService } from './pm-issue-creator-service.js';
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
  private pmAdapterService: PMAdapterService;
  private issueCreatorService: PMIssueCreatorService;

  constructor(basePath?: string, commentGenerator = new CommentGeneratorService()) {
    this.basePath = basePath ?? process.cwd();
    this.localAdapter = new LocalPMAdapter(basePath);
    this.idManager = new IDManager();
    this.pmQueueFile = path.join(this.basePath, '.hodge/.pm-queue.json');
    this.commentGenerator = commentGenerator;
    this.pmAdapterService = new PMAdapterService(
      this.localAdapter,
      this.commentGenerator,
      this.configManager
    );
    this.issueCreatorService = new PMIssueCreatorService(this.idManager);
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
    await this.pmAdapterService.updatePMStatus(tool, feature, status, this.shipContext);
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
      const description = await this.formatDecisionsForPM(feature, decisions);
      const result = await this.createIssueForTool(
        pmTool,
        apiKey,
        feature,
        description,
        isEpic,
        subIssues
      );

      if (!result.externalId) {
        return { created: false, error: 'Failed to create issue' };
      }

      // Map the external ID
      await this.idManager.mapFeature(feature, result.externalId, pmTool);
      return { created: true, issueId: result.externalId };
    } catch (error) {
      return await this.handleCreateIssueError(error, feature, decisions, isEpic, subIssues);
    }
  }

  /**
   * Create issue for specific PM tool
   */
  private async createIssueForTool(
    pmTool: string,
    apiKey: string,
    feature: string,
    description: string,
    isEpic: boolean,
    subIssues?: Array<{ id: string; title: string }>
  ): Promise<{ externalId?: string; error?: string }> {
    switch (pmTool) {
      case 'linear':
        return await this.issueCreatorService.createLinearIssue(
          apiKey,
          feature,
          description,
          isEpic,
          subIssues
        );

      case 'github':
        return await this.issueCreatorService.createGitHubIssue(apiKey, feature, description);

      default:
        return { error: `PM tool ${pmTool} not supported` };
    }
  }

  /**
   * Handle errors during issue creation
   */
  private async handleCreateIssueError(
    error: unknown,
    feature: string,
    decisions: string[],
    isEpic: boolean,
    subIssues?: Array<{ id: string; title: string }>
  ): Promise<{ created: boolean; error: string }> {
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
      // File doesn't exist or can't be read - this is expected for new features
      this.logger.debug('Could not extract problem statement from exploration.md', { error });
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
      const queue = await this.loadQueue();
      if (queue.length === 0) {
        return;
      }

      await this.logQueueStart(queue.length);

      const remaining = await this.processOperations(queue);

      await this.updateQueueFile(remaining);
    } catch (error) {
      await this.handleQueueError(error);
    }
  }

  private async loadQueue(): Promise<QueuedOperation[]> {
    const content = await fs.readFile(this.pmQueueFile, 'utf-8');
    return JSON.parse(content) as QueuedOperation[];
  }

  private async logQueueStart(count: number): Promise<void> {
    const debugMode = await this.configManager.isDebugMode();
    if (debugMode) {
      this.logger.info(chalk.blue(`📋 Processing ${count} queued PM operations...`));
    }
  }

  private async processOperations(queue: QueuedOperation[]): Promise<QueuedOperation[]> {
    const remaining: QueuedOperation[] = [];

    for (const operation of queue) {
      if (!(await this.processOperation(operation))) {
        remaining.push(operation);
      }
    }

    return remaining;
  }

  private async processOperation(operation: QueuedOperation): Promise<boolean> {
    try {
      if (operation.type === 'create_issue' || operation.type === 'create_epic') {
        const result = await this.createPMIssue(
          operation.feature,
          operation.decisions,
          operation.isEpic || false,
          operation.subIssues
        );
        return result.created || result.error === 'Issue already exists';
      }
    } catch (error) {
      this.logger.debug('Failed to process queued PM operation', { error });
      return false;
    }
    return false;
  }

  private async updateQueueFile(remaining: QueuedOperation[]): Promise<void> {
    if (remaining.length > 0) {
      await fs.writeFile(this.pmQueueFile, JSON.stringify(remaining, null, 2));
    } else {
      await fs.unlink(this.pmQueueFile);
    }
  }

  private async handleQueueError(error: unknown): Promise<void> {
    const debugMode = await this.configManager.isDebugMode();
    if (debugMode) {
      this.logger.info(chalk.gray(`   Could not process queue: ${String(error)}`));
    }
  }
}
