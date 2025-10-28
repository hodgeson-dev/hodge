/**
 * Hodge Plan Command
 * Orchestrates feature planning and work breakdown (thin orchestrator)
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getConfigManager } from '../lib/config-manager.js';
import { createCommandLogger } from '../lib/logger.js';
import { PlanDecisionAnalyzer } from './plan/plan-decision-analyzer.js';
import { PlanGenerator } from './plan/plan-generator.js';
import { PlanDisplay } from './plan/plan-display.js';

export interface PlanOptions {
  lanes?: number;
  createPm?: boolean; // Explicit flag to create PM issues
  feature?: string;
}

// Re-export types for backward compatibility
export type { Story, DevelopmentPlan } from './plan/plan-generator.js';

/**
 * PlanCommand handles feature planning and work breakdown orchestration
 */
export class PlanCommand {
  private logger = createCommandLogger('plan', { enableConsole: true });
  private configManager = getConfigManager();
  private decisionAnalyzer: PlanDecisionAnalyzer;
  private planGenerator: PlanGenerator;
  private planDisplay: PlanDisplay;

  constructor(private basePath: string = process.cwd()) {
    this.decisionAnalyzer = new PlanDecisionAnalyzer(basePath);
    this.planGenerator = new PlanGenerator(basePath);
    this.planDisplay = new PlanDisplay(basePath);
  }

  /**
   * Execute the plan command with orchestration
   */
  async execute(options: PlanOptions = {}): Promise<void> {
    this.logger.info(chalk.blue('📋 Planning Work Structure'));

    // Load configuration
    await this.configManager.load();
    const planningConfig = await this.configManager.get('planning');
    const defaultLanes =
      typeof planningConfig === 'object' && planningConfig && 'developmentLanes' in planningConfig
        ? (planningConfig as { developmentLanes?: number }).developmentLanes || 1
        : 1;
    const laneCount = options.lanes || defaultLanes;

    // Determine feature to plan
    const feature = options.feature || (await this.getCurrentFeature());
    if (!feature) {
      this.logger.warn(chalk.yellow('No feature specified. Use: hodge plan <feature>'));
      return;
    }

    // Analyze decisions for this feature
    const decisions = await this.decisionAnalyzer.analyzeDecisions(feature);
    if (decisions.length === 0) {
      this.logger.warn(chalk.yellow(`No decisions found for ${feature}. Run /decide first.`));
      return;
    }

    // Generate work breakdown
    const plan = await this.planGenerator.generatePlan(feature, decisions, laneCount);

    // Display plan for approval
    this.planDisplay.displayPlan(plan);

    // Save plan locally
    await this.planDisplay.savePlan(plan);

    // Create PM issues only if explicitly requested with --create-pm flag
    if (options.createPm) {
      const description = await this.decisionAnalyzer.getFeatureDescription(feature);
      await this.planDisplay.createPMStructure(plan, description, decisions);
    } else {
      this.logger.info(
        chalk.yellow('\n💾 Plan saved locally. Use --create-pm to create PM issues in Linear.')
      );
    }

    this.logger.info(chalk.green(`\n✓ Plan created for ${feature}`));
    this.planDisplay.showNextSteps(plan);
  }

  /**
   * Get current feature from context file
   */
  private async getCurrentFeature(): Promise<string | null> {
    const contextFile = path.join(this.basePath, '.hodge', 'context.json');
    if (existsSync(contextFile)) {
      const content = await fs.readFile(contextFile, 'utf-8');
      const context = JSON.parse(content) as { currentFeature?: string };
      return context.currentFeature || null;
    }
    return null;
  }
}
