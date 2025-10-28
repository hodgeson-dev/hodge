/**
 * Plan Display and PM Integration
 * Handles plan display, saving, and PM issue creation
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { PMHooks } from '../../lib/pm/pm-hooks.js';
import { createCommandLogger } from '../../lib/logger.js';
import { DevelopmentPlan } from './plan-generator.js';

/**
 * Displays plans and integrates with PM tools
 */
export class PlanDisplay {
  private logger = createCommandLogger('plan-display', { enableConsole: true });
  private pmHooks: PMHooks;

  constructor(private basePath: string) {
    this.pmHooks = new PMHooks(basePath);
  }

  /**
   * Display plan to console
   */
  displayPlan(plan: DevelopmentPlan): void {
    this.logger.info('\n' + chalk.bold('📋 Development Plan'));
    this.logger.info(chalk.bold('='.repeat(50)));

    this.logger.info(`Feature: ${chalk.cyan(plan.feature)}`);
    this.logger.info(`Type: ${chalk.yellow(plan.type)}`);

    if (plan.type === 'epic' && plan.stories) {
      this.logger.info(`\n${chalk.bold('Stories')} (${plan.stories.length}):`);
      for (const story of plan.stories) {
        const deps = story.dependencies?.length
          ? ` [depends on: ${story.dependencies.join(', ')}]`
          : '';
        const lane = story.lane !== undefined ? ` (Lane ${story.lane + 1})` : '';
        this.logger.info(`  ${chalk.green(story.id)}: ${story.title}${deps}${lane}`);
      }

      if (plan.lanes) {
        this.logger.info(`\n${chalk.bold('Lane Allocation')} (${plan.lanes.count} lanes):`);
        for (let i = 0; i < plan.lanes.count; i++) {
          const storyIds = plan.lanes.assignments.get(i) || [];
          this.logger.info(`  Lane ${i + 1}: ${storyIds.join(', ')}`);
        }
      }
    }

    this.logger.info(`\nEstimated Timeline: ${chalk.yellow(plan.estimatedDays)} days`);
    this.logger.info(chalk.bold('='.repeat(50)));
  }

  /**
   * Save plan to feature directory
   */
  async savePlan(plan: DevelopmentPlan): Promise<void> {
    const featurePlanFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      plan.feature,
      'plan.json'
    );
    await fs.mkdir(path.dirname(featurePlanFile), { recursive: true });
    await fs.writeFile(featurePlanFile, JSON.stringify(plan, null, 2));
  }

  /**
   * Create PM structure (issues/epic) from plan
   */
  async createPMStructure(
    plan: DevelopmentPlan,
    featureDescription: string,
    decisions: string[]
  ): Promise<void> {
    const epicTitle = `${plan.feature}: ${featureDescription}`;

    if (plan.type === 'single') {
      // Create single issue with full title format
      const result = await this.pmHooks.createPMIssue(epicTitle, decisions, false);
      if (result.created) {
        this.logger.info(chalk.green(`✓ Created PM issue: ${result.issueId}`));
      }
    } else if (plan.stories) {
      // Create epic with stories - format story titles with ID prefix
      const subIssues = plan.stories.map((s) => ({
        id: s.id,
        title: `${s.id}: ${s.title}`, // HODGE-XXX.Y: Description format
      }));

      const result = await this.pmHooks.createPMIssue(
        epicTitle, // Use formatted epic title with description
        decisions, // Pass all decision titles
        true,
        subIssues
      );

      if (result.created) {
        this.logger.info(chalk.green(`✓ Created epic with ${plan.stories.length} stories`));
      }
    }
  }

  /**
   * Show next steps after plan creation
   */
  showNextSteps(plan: DevelopmentPlan): void {
    this.logger.info('\n' + chalk.bold('Next Steps:'));

    if (plan.type === 'single') {
      const buildCommand = `hodge build ${plan.feature}`;
      this.logger.info(`  Start building: ${chalk.cyan(buildCommand)}`);
    } else if (plan.lanes && plan.lanes.count > 1) {
      this.logger.info('\nParallel development ready:');
      for (let i = 0; i < plan.lanes.count; i++) {
        const stories = plan.lanes.assignments.get(i) || [];
        if (stories.length > 0) {
          const buildCommand = `hodge build ${stories[0]}`;
          this.logger.info(`  Lane ${i + 1}: ${chalk.cyan(buildCommand)}`);
        }
      }
    } else if (plan.stories && plan.stories.length > 0) {
      const buildCommand = `hodge build ${plan.stories[0].id}`;
      this.logger.info(`  Start with: ${chalk.cyan(buildCommand)}`);
    }
  }
}
