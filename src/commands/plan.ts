import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { getConfigManager } from '../lib/config-manager.js';

export interface PlanOptions {
  lanes?: number;
  createPm?: boolean; // Explicit flag to create PM issues
  feature?: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  effort?: 'small' | 'medium' | 'large';
  dependencies?: string[];
  lane?: number;
}

export interface DevelopmentPlan {
  feature: string;
  type: 'single' | 'epic';
  stories?: Story[];
  lanes?: {
    count: number;
    assignments: Map<number, string[]>;
  };
  dependencies?: Map<string, string[]>;
  estimatedDays?: number;
  createdAt: string;
}

export class PlanCommand {
  private pmHooks: PMHooks;
  private basePath: string;
  private configManager = getConfigManager();

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
    this.pmHooks = new PMHooks(this.basePath);
  }

  async execute(options: PlanOptions = {}): Promise<void> {
    console.log(chalk.blue('📋 Planning Work Structure'));

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
      console.log(chalk.yellow('No feature specified. Use: hodge plan <feature>'));
      return;
    }

    // Analyze decisions for this feature
    const decisions = await this.analyzeDecisions(feature);
    if (decisions.length === 0) {
      console.log(chalk.yellow(`No decisions found for ${feature}. Run /decide first.`));
      return;
    }

    // Generate work breakdown
    const plan = this.generatePlan(feature, decisions, laneCount);

    // Display plan for approval
    this.displayPlan(plan);

    // Save plan locally
    await this.savePlan(plan);

    // Create PM issues only if explicitly requested with --create-pm flag
    if (options.createPm) {
      await this.createPMStructure(plan);
    } else {
      console.log(
        chalk.yellow('\n💾 Plan saved locally. Use --create-pm to create PM issues in Linear.')
      );
    }

    console.log(chalk.green(`\n✓ Plan created for ${feature}`));
    this.showNextSteps(plan);
  }

  private async getCurrentFeature(): Promise<string | null> {
    const contextFile = path.join(this.basePath, '.hodge', 'context.json');
    if (existsSync(contextFile)) {
      const content = await fs.readFile(contextFile, 'utf-8');
      const context = JSON.parse(content) as { currentFeature?: string };
      return context.currentFeature || null;
    }
    return null;
  }

  private async analyzeDecisions(feature: string): Promise<string[]> {
    const decisionsFile = path.join(this.basePath, '.hodge', 'decisions.md');
    if (!existsSync(decisionsFile)) {
      return [];
    }

    const content = await fs.readFile(decisionsFile, 'utf-8');
    const decisions: string[] = [];

    // Parse decisions from markdown
    const lines = content.split('\n');
    let inDecisionBlock = false;
    let currentDecision = '';

    for (const line of lines) {
      if (line.startsWith('### ')) {
        if (currentDecision && currentDecision.includes(`Feature: ${feature}`)) {
          const decisionMatch = currentDecision.match(/\*\*Decision\*\*:\s*([^\n]+)/);
          if (decisionMatch) {
            decisions.push(decisionMatch[1]);
          }
        }
        currentDecision = line + '\n';
        inDecisionBlock = true;
      } else if (inDecisionBlock) {
        if (line.startsWith('---')) {
          if (currentDecision.includes(`Feature: ${feature}`)) {
            const decisionMatch = currentDecision.match(/\*\*Decision\*\*:\s*([^\n]+)/);
            if (decisionMatch) {
              decisions.push(decisionMatch[1]);
            }
          }
          currentDecision = '';
          inDecisionBlock = false;
        } else {
          currentDecision += line + '\n';
        }
      }
    }

    return decisions;
  }

  private generatePlan(feature: string, decisions: string[], laneCount: number): DevelopmentPlan {
    // Analyze complexity based on decisions
    const isComplex = this.determineComplexity(decisions);

    if (!isComplex) {
      // Simple single story
      return {
        feature,
        type: 'single',
        estimatedDays: 1,
        createdAt: new Date().toISOString(),
      };
    }

    // Generate epic with stories
    const stories = this.generateStories(feature, decisions);
    const dependencies = this.analyzeDependencies(stories);
    const laneAssignments = this.allocateToLanes(stories, dependencies, laneCount);

    return {
      feature,
      type: 'epic',
      stories,
      lanes: {
        count: laneCount,
        assignments: laneAssignments,
      },
      dependencies,
      estimatedDays: this.estimateTimeline(stories, laneCount),
      createdAt: new Date().toISOString(),
    };
  }

  private determineComplexity(decisions: string[]): boolean {
    // Complex if multiple decisions or specific keywords
    if (decisions.length > 2) return true;

    const complexityIndicators = [
      'epic',
      'multiple',
      'phases',
      'stages',
      'frontend',
      'backend',
      'database',
      'refactor',
      'migrate',
      'redesign',
    ];

    return decisions.some((d) =>
      complexityIndicators.some((indicator) => d.toLowerCase().includes(indicator))
    );
  }

  private generateStories(feature: string, decisions: string[]): Story[] {
    const stories: Story[] = [];
    let storyIndex = 1;

    // Analyze decisions to identify work units
    for (const decision of decisions) {
      // Look for technical areas mentioned
      if (
        decision.toLowerCase().includes('database') ||
        decision.toLowerCase().includes('schema')
      ) {
        stories.push({
          id: `${feature}.${storyIndex++}`,
          title: 'Database schema and migrations',
          effort: 'medium',
          dependencies: [],
        });
      }

      if (decision.toLowerCase().includes('api') || decision.toLowerCase().includes('endpoint')) {
        const dbStory = stories.find((s) => s.title.includes('Database'));
        stories.push({
          id: `${feature}.${storyIndex++}`,
          title: 'API implementation',
          effort: 'medium',
          dependencies: dbStory ? [dbStory.id] : [],
        });
      }

      if (decision.toLowerCase().includes('frontend') || decision.toLowerCase().includes('ui')) {
        const apiStory = stories.find((s) => s.title.includes('API'));
        stories.push({
          id: `${feature}.${storyIndex++}`,
          title: 'Frontend components',
          effort: 'medium',
          dependencies: apiStory ? [apiStory.id] : [],
        });
      }

      if (
        decision.toLowerCase().includes('test') ||
        decision.toLowerCase().includes('validation')
      ) {
        stories.push({
          id: `${feature}.${storyIndex++}`,
          title: 'Tests and validation',
          effort: 'small',
          dependencies: stories.map((s) => s.id),
        });
      }
    }

    // If no specific stories identified, create generic ones
    if (stories.length === 0) {
      stories.push(
        {
          id: `${feature}.1`,
          title: 'Core implementation',
          effort: 'medium',
          dependencies: [],
        },
        {
          id: `${feature}.2`,
          title: 'Tests and documentation',
          effort: 'small',
          dependencies: [`${feature}.1`],
        }
      );
    }

    return stories;
  }

  private analyzeDependencies(stories: Story[]): Map<string, string[]> {
    const deps = new Map<string, string[]>();
    for (const story of stories) {
      if (story.dependencies && story.dependencies.length > 0) {
        deps.set(story.id, story.dependencies);
      }
    }
    return deps;
  }

  private allocateToLanes(
    stories: Story[],
    _dependencies: Map<string, string[]>,
    laneCount: number
  ): Map<number, string[]> {
    const lanes = new Map<number, string[]>();
    for (let i = 0; i < laneCount; i++) {
      lanes.set(i, []);
    }

    // Simple round-robin allocation respecting dependencies
    const assigned = new Set<string>();
    const canAssign = (story: Story): boolean => {
      if (!story.dependencies) return true;
      return story.dependencies.every((dep) => assigned.has(dep));
    };

    let currentLane = 0;
    let progress = true;

    while (progress && assigned.size < stories.length) {
      progress = false;
      for (const story of stories) {
        if (!assigned.has(story.id) && canAssign(story)) {
          const laneStories = lanes.get(currentLane) || [];
          laneStories.push(story.id);
          lanes.set(currentLane, laneStories);
          assigned.add(story.id);
          story.lane = currentLane;
          currentLane = (currentLane + 1) % laneCount;
          progress = true;
        }
      }
    }

    return lanes;
  }

  private estimateTimeline(stories: Story[], laneCount: number): number {
    const effortDays = { small: 1, medium: 2, large: 3 };
    const totalEffort = stories.reduce(
      (sum, story) => sum + effortDays[story.effort || 'medium'],
      0
    );
    return Math.ceil(totalEffort / laneCount);
  }

  /**
   * Extract feature description from exploration.md for epic title
   */
  private async getFeatureDescription(feature: string): Promise<string> {
    const explorationFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      feature,
      'explore',
      'exploration.md'
    );

    if (!existsSync(explorationFile)) {
      return 'No description available';
    }

    try {
      const content = await fs.readFile(explorationFile, 'utf-8');

      // Try to extract from "Problem Statement:" section
      const problemMatch = content.match(/\*\*Problem Statement:\*\*\s*\n([^\n]+)/);
      if (problemMatch && problemMatch[1]) {
        return problemMatch[1].trim();
      }

      // Fallback: Try to extract from "Type:" line
      const typeMatch = content.match(/\*\*Type\*\*:\s*([^\n]+)/);
      if (typeMatch && typeMatch[1]) {
        return typeMatch[1].trim();
      }

      // Last fallback: Use first non-header line after Feature Overview
      const overviewMatch = content.match(/## Feature Overview[\s\S]*?\n\n([^\n#]+)/);
      if (overviewMatch && overviewMatch[1]) {
        return overviewMatch[1].trim();
      }

      return 'No description available';
    } catch (error) {
      return 'No description available';
    }
  }

  private displayPlan(plan: DevelopmentPlan): void {
    console.log('\n' + chalk.bold('📋 Development Plan'));
    console.log(chalk.bold('='.repeat(50)));

    console.log(`Feature: ${chalk.cyan(plan.feature)}`);
    console.log(`Type: ${chalk.yellow(plan.type)}`);

    if (plan.type === 'epic' && plan.stories) {
      console.log(`\n${chalk.bold('Stories')} (${plan.stories.length}):`);
      for (const story of plan.stories) {
        const deps = story.dependencies?.length
          ? ` [depends on: ${story.dependencies.join(', ')}]`
          : '';
        const lane = story.lane !== undefined ? ` (Lane ${story.lane + 1})` : '';
        console.log(`  ${chalk.green(story.id)}: ${story.title}${deps}${lane}`);
      }

      if (plan.lanes) {
        console.log(`\n${chalk.bold('Lane Allocation')} (${plan.lanes.count} lanes):`);
        for (let i = 0; i < plan.lanes.count; i++) {
          const storyIds = plan.lanes.assignments.get(i) || [];
          console.log(`  Lane ${i + 1}: ${storyIds.join(', ')}`);
        }
      }
    }

    console.log(`\nEstimated Timeline: ${chalk.yellow(plan.estimatedDays)} days`);
    console.log(chalk.bold('='.repeat(50)));
  }

  private async savePlan(plan: DevelopmentPlan): Promise<void> {
    const planFile = path.join(this.basePath, '.hodge', 'development-plan.json');
    await fs.mkdir(path.dirname(planFile), { recursive: true });
    await fs.writeFile(planFile, JSON.stringify(plan, null, 2));

    // Also save to feature directory if it exists
    const featurePlanFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      plan.feature,
      'plan.json'
    );
    if (existsSync(path.dirname(featurePlanFile))) {
      await fs.writeFile(featurePlanFile, JSON.stringify(plan, null, 2));
    }
  }

  private async createPMStructure(plan: DevelopmentPlan): Promise<void> {
    // Get feature description for epic title
    const description = await this.getFeatureDescription(plan.feature);
    const epicTitle = `${plan.feature}: ${description}`;

    // Get all decisions for this feature
    const decisions = await this.analyzeDecisions(plan.feature);

    if (plan.type === 'single') {
      // Create single issue with full title format
      const result = await this.pmHooks.createPMIssue(epicTitle, decisions, false);
      if (result.created) {
        console.log(chalk.green(`✓ Created PM issue: ${result.issueId}`));
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
        console.log(chalk.green(`✓ Created epic with ${plan.stories.length} stories`));
      }
    }
  }

  private showNextSteps(plan: DevelopmentPlan): void {
    console.log('\n' + chalk.bold('Next Steps:'));

    if (plan.type === 'single') {
      console.log(`  Start building: ${chalk.cyan(`hodge build ${plan.feature}`)}`);
    } else if (plan.lanes && plan.lanes.count > 1) {
      console.log('\nParallel development ready:');
      for (let i = 0; i < plan.lanes.count; i++) {
        const stories = plan.lanes.assignments.get(i) || [];
        if (stories.length > 0) {
          console.log(`  Lane ${i + 1}: ${chalk.cyan(`hodge build ${stories[0]}`)}`);
        }
      }
    } else if (plan.stories && plan.stories.length > 0) {
      console.log(`  Start with: ${chalk.cyan(`hodge build ${plan.stories[0].id}`)}`);
    }
  }
}
