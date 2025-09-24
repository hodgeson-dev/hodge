import chalk from 'chalk';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { execSync } from 'child_process';
import path from 'path';
import { existsSync } from 'fs';

type WorkflowPhase = 'explore' | 'build' | 'harden' | 'ship';

/**
 * PM integration hooks for workflow commands
 * Manages both local PM tracking and external tool updates
 */
export class PMHooks {
  private localAdapter: LocalPMAdapter;

  constructor(basePath?: string) {
    this.localAdapter = new LocalPMAdapter(basePath);
  }

  /**
   * Initialize PM tracking
   */
  async init(): Promise<void> {
    await this.localAdapter.init();
  }

  /**
   * Hook called when entering a workflow phase
   */
  async onPhaseStart(feature: string, phase: WorkflowPhase): Promise<void> {
    // Update local PM tracking
    const statusMap = {
      explore: 'exploring',
      build: 'building',
      harden: 'hardening',
      ship: 'shipped',
    } as const;

    await this.localAdapter.updateFeatureStatus(feature, statusMap[phase]);

    // Update external PM if configured
    this.updateExternalPM(feature, phase);
  }

  /**
   * Hook called when a feature is shipped
   */
  async onShip(feature: string): Promise<void> {
    await this.localAdapter.updateFeatureStatus(feature, 'shipped');
    await this.localAdapter.updatePhaseProgress();

    // Update external PM to done
    this.updateExternalPM(feature, 'ship');

    console.log(chalk.green('✓ Updated project management tracking'));
  }

  /**
   * Hook called when exploring a new feature
   */
  async onExplore(feature: string, description?: string): Promise<void> {
    // Check if feature exists first
    try {
      await this.localAdapter.addFeature(
        feature,
        description || `Feature ${feature}`,
        this.detectPhase(feature)
      );
    } catch (error) {
      // Feature might already exist, just update status
      await this.localAdapter.updateFeatureStatus(feature, 'exploring');
    }

    this.updateExternalPM(feature, 'explore');
  }

  /**
   * Update external PM tool if configured
   */
  private updateExternalPM(feature: string, phase: WorkflowPhase): void {
    const pmTool = process.env.HODGE_PM_TOOL;

    if (!pmTool) {
      return;
    }

    // Check if update script exists
    const updateScript = path.join('.hodge', 'pm-scripts', 'update-issue.js');
    if (!existsSync(updateScript)) {
      return;
    }

    const statusMap: Record<WorkflowPhase, string> = {
      explore: 'todo',
      build: 'in_progress',
      harden: 'in_review',
      ship: 'done',
    };

    try {
      console.log(chalk.blue(`📋 Updating ${pmTool} issue: ${feature}`));

      const apiKey = this.getApiKey(pmTool);
      if (!apiKey) {
        console.log(chalk.gray(`  Skipping - ${pmTool} not configured`));
        return;
      }

      const env = { ...process.env };
      const status = statusMap[phase];

      execSync(`node "${updateScript}" "${feature}" "${status}"`, {
        env,
        stdio: 'inherit',
      });
    } catch (error) {
      // Non-fatal, just log
      console.log(chalk.yellow(`  ⚠️  Could not update ${pmTool} issue`));
    }
  }

  /**
   * Detect which implementation phase a feature belongs to
   */
  private detectPhase(feature: string): string {
    // Map features to phases based on patterns
    const phaseMap: Record<string, string[]> = {
      'Phase 1: Foundation': ['cross-tool', 'HODGE-004'],
      'Phase 2: AI Experience': ['session', 'HODGE-051', 'HODGE-052', 'HODGE-053', 'HODGE-054'],
      'Phase 3: Feature Organization': ['HODGE-003', 'HODGE-005', 'HODGE-006'],
      'Phase 4: PM Integration': ['pm-adapter', 'HODGE-007', 'HODGE-045'],
      'Phase 5: Enhanced Features': ['batch-decision'],
    };

    for (const [phase, patterns] of Object.entries(phaseMap)) {
      if (patterns.some((p) => feature.toLowerCase().includes(p.toLowerCase()))) {
        return phase;
      }
    }

    return 'TBD';
  }

  /**
   * Get API key for PM tool
   */
  private getApiKey(pmTool: string): string | undefined {
    const keyMap: Record<string, string> = {
      linear: 'LINEAR_API_KEY',
      github: 'GITHUB_TOKEN',
      jira: 'JIRA_API_TOKEN',
      asana: 'ASANA_ACCESS_TOKEN',
      trello: 'TRELLO_API_KEY',
    };

    const envVar = keyMap[pmTool.toLowerCase()];
    return envVar ? process.env[envVar] : undefined;
  }
}
