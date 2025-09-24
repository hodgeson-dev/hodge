import chalk from 'chalk';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { promises as fs } from 'fs';
import path from 'path';

type WorkflowPhase = 'explore' | 'build' | 'harden' | 'ship';

interface PMConfig {
  tool?: string;
  statusMap?: Record<WorkflowPhase, string>;
  apiKey?: string;
  teamId?: string;
}

/**
 * PM integration hooks with configuration support and better error handling
 * Implements decisions:
 * - Silent failure with logging for PM API failures
 * - Simple status mapping from hodge.json
 * - Hooks for critical workflow commands only
 */
export class PMHooks {
  private localAdapter: LocalPMAdapter;
  private config: PMConfig = {};

  constructor(basePath?: string) {
    this.localAdapter = new LocalPMAdapter(basePath);
  }

  /**
   * Initialize PM tracking and load configuration
   */
  async init(): Promise<void> {
    // Always initialize local adapter
    await this.localAdapter.init();

    // Try to load PM configuration
    await this.loadConfiguration();
  }

  /**
   * Load PM configuration from hodge.json
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const configPath = path.join('.hodge', 'config.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent) as {
        pm?: { tool?: string; statusMap?: Record<WorkflowPhase, string> };
      };

      if (config.pm?.tool) {
        this.config = {
          tool: config.pm.tool,
          statusMap: config.pm.statusMap ?? this.getDefaultStatusMap(),
          apiKey: process.env[this.getApiKeyEnvVar(config.pm.tool)],
          teamId: process.env[this.getTeamIdEnvVar(config.pm.tool)],
        };
      }
    } catch (error) {
      // Silent failure - PM is optional
      if (process.env.DEBUG) {
        console.log(chalk.gray(`PM config not loaded: ${String(error)}`));
      }
    }
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
  async onShip(feature: string): Promise<void> {
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
    // Skip if no PM tool configured
    if (!this.config.tool || !this.config.apiKey) {
      return;
    }

    try {
      // Log attempt if in debug mode
      if (process.env.DEBUG) {
        console.log(chalk.blue(`📋 Updating ${this.config.tool} issue: ${feature}`));
      }

      // Get status from configuration or defaults
      const status = this.config.statusMap?.[phase] ?? this.getDefaultStatusMap()[phase];

      // Call the appropriate adapter
      this.callPMAdapter(this.config.tool, feature, status);

      // Silent success - only log in debug mode
      if (process.env.DEBUG) {
        console.log(chalk.green(`   ✓ Updated to status: ${status}`));
      }
    } catch (error) {
      // Silent failure with optional logging
      if (process.env.DEBUG || process.env.HODGE_PM_DEBUG) {
        console.log(
          chalk.gray(`   ℹ️ Could not update ${String(this.config.tool)} issue (non-blocking)`)
        );
        if (process.env.HODGE_PM_DEBUG) {
          console.log(chalk.gray(`   Error: ${String(error)}`));
        }
      }
      // Never throw - PM updates should never block workflow
    }
  }

  /**
   * Call the appropriate PM adapter based on tool
   */
  private callPMAdapter(tool: string, _feature: string, _status: string): void {
    switch (tool.toLowerCase()) {
      case 'linear':
        // TODO: [ship] Implement LinearAdapter
        throw new Error('Linear adapter not yet implemented');

      case 'github':
        // TODO: [ship] Implement GitHubAdapter
        throw new Error('GitHub adapter not yet implemented');

      default:
        throw new Error(`PM tool ${tool} not supported`);
    }
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
   * Get environment variable name for API key
   */
  private getApiKeyEnvVar(tool?: string): string {
    const keyMap: Record<string, string> = {
      linear: 'LINEAR_API_KEY',
      github: 'GITHUB_TOKEN',
      jira: 'JIRA_API_TOKEN',
      asana: 'ASANA_ACCESS_TOKEN',
      trello: 'TRELLO_API_KEY',
    };
    return tool ? (keyMap[tool.toLowerCase()] ?? '') : '';
  }

  /**
   * Get environment variable name for team/org ID
   */
  private getTeamIdEnvVar(tool?: string): string {
    const keyMap: Record<string, string> = {
      linear: 'LINEAR_TEAM_ID',
      github: 'GITHUB_ORG',
      jira: 'JIRA_PROJECT_KEY',
      asana: 'ASANA_WORKSPACE_ID',
      trello: 'TRELLO_BOARD_ID',
    };
    return tool ? (keyMap[tool.toLowerCase()] ?? '') : '';
  }
}
