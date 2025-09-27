import chalk from 'chalk';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { getConfigManager } from '../config-manager.js';
import { ShipContext } from './types.js';

type WorkflowPhase = 'explore' | 'build' | 'harden' | 'ship';

/**
 * PM integration hooks with configuration support and better error handling
 * Implements decisions:
 * - Silent failure with logging for PM API failures
 * - Simple status mapping from hodge.json
 * - Hooks for critical workflow commands only
 */
export class PMHooks {
  private localAdapter: LocalPMAdapter;
  private configManager = getConfigManager();
  private shipContext?: ShipContext;

  constructor(basePath?: string) {
    this.localAdapter = new LocalPMAdapter(basePath);
  }

  /**
   * Initialize PM tracking and load configuration
   */
  async init(): Promise<void> {
    // Always initialize local adapter
    await this.localAdapter.init();

    // Load configuration through ConfigManager
    await this.configManager.load();

    // Try migration if needed
    await this.configManager.migrateConfig();
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

    console.log(chalk.green('✓ Updated project management tracking'));
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
          console.log(chalk.blue(`📋 Updating ${pmTool} issue: ${feature}`));
        }

        // Get status from configuration or defaults
        const pmConfig = await this.configManager.getPMConfig();
        const status = pmConfig?.statusMap?.[phase] ?? this.getDefaultStatusMap()[phase];

        // Call the appropriate adapter
        await this.callPMAdapter(pmTool, feature, status);

        // Silent success - only log in debug mode
        const debugMode = await this.configManager.isDebugMode();
        if (debugMode) {
          console.log(chalk.green(`   ✓ Updated to status: ${status}`));
        }
      } catch (error) {
        // Silent failure with optional logging
        const debugMode = await this.configManager.isDebugMode();
        const pmTool = await this.configManager.getPMTool();
        if (debugMode || process.env.HODGE_PM_DEBUG) {
          console.log(chalk.gray(`   ℹ️ Could not update ${String(pmTool)} issue (non-blocking)`));
          if (process.env.HODGE_PM_DEBUG) {
            console.log(chalk.gray(`   Error: ${String(error)}`));
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
              console.log(chalk.gray('   Added rich comment to Linear issue'));
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
   * Get default status mappings
   */
  private getDefaultStatusMap(): Record<WorkflowPhase, string> {
    return {
      explore: 'To Do',
      build: 'In Progress',
      harden: 'In Review',
      ship: 'Done',
    };
  }

  /**
   * Generate rich comment based on verbosity level
   */
  private async generateRichComment(context: ShipContext): Promise<string> {
    const pmConfig = await this.configManager.getPMConfig();
    const verbosity = pmConfig?.verbosity ?? 'essential';

    if (verbosity === 'minimal') {
      return `✅ Feature ${context.feature} has been shipped${context.commitHash ? ` in ${context.commitHash.substring(0, 7)}` : ''}.`;
    }

    let comment = `## 🚀 Shipped via Hodge\n\n`;

    // Essential information
    if (context.commitHash) {
      comment += `**Commit**: \`${context.commitHash.substring(0, 7)}\`\n`;
    }
    if (context.branch) {
      comment += `**Branch**: \`${context.branch}\`\n`;
    }
    comment += '\n';

    // Add metrics for essential and rich
    if (verbosity === 'essential' || verbosity === 'rich') {
      if (context.filesChanged || context.linesAdded || context.linesRemoved) {
        comment += `### 📊 Changes\n`;
        if (context.filesChanged) comment += `- Files: ${context.filesChanged}\n`;
        if (context.linesAdded) comment += `- Added: +${context.linesAdded}\n`;
        if (context.linesRemoved) comment += `- Removed: -${context.linesRemoved}\n`;
        comment += '\n';
      }

      if (context.testsResults) {
        comment += `### ✅ Tests\n`;
        comment += `${context.testsResults.passed}/${context.testsResults.total} passing\n\n`;
      }
    }

    // Add rich details
    if (verbosity === 'rich') {
      if (context.coverage !== undefined) {
        comment += `### 📈 Coverage\n`;
        comment += `${context.coverage}%\n\n`;
      }

      if (context.patterns && context.patterns.length > 0) {
        comment += `### 🎯 Patterns Applied\n`;
        context.patterns.forEach((p) => {
          comment += `- ${p}\n`;
        });
        comment += '\n';
      }

      if (context.commitMessage) {
        comment += `### 📝 Commit Message\n`;
        comment += '```\n';
        comment += context.commitMessage.substring(0, 500);
        if (context.commitMessage.length > 500) {
          comment += '...\n';
        }
        comment += '\n```\n';
      }
    }

    comment += `\n---\n`;
    comment += `_Updated by Hodge${context.hodgeVersion ? ` v${context.hodgeVersion}` : ''}_`;

    return comment;
  }
}
