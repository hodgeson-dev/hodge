import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { getConfigManager } from '../lib/config-manager.js';
import { createCommandLogger } from '../lib/logger.js';

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

// JSON-serializable version of DevelopmentPlan (Maps are plain objects)
interface DevelopmentPlanJSON {
  feature: string;
  type: 'single' | 'epic';
  stories?: Story[];
  lanes?: {
    count: number;
    assignments: { [key: string]: string[] };
  };
  dependencies?: { [key: string]: string[] };
  estimatedDays?: number;
  createdAt: string;
}

export class PlanCommand {
  private logger = createCommandLogger('plan', { enableConsole: true });
  private pmHooks: PMHooks;
  private basePath: string;
  private configManager = getConfigManager();

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
    this.pmHooks = new PMHooks(this.basePath);
  }

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
    const decisions = await this.analyzeDecisions(feature);
    if (decisions.length === 0) {
      this.logger.warn(chalk.yellow(`No decisions found for ${feature}. Run /decide first.`));
      return;
    }

    // Generate work breakdown
    const plan = await this.generatePlan(feature, decisions, laneCount);

    // Display plan for approval
    this.displayPlan(plan);

    // Save plan locally
    await this.savePlan(plan);

    // Create PM issues only if explicitly requested with --create-pm flag
    if (options.createPm) {
      await this.createPMStructure(plan);
    } else {
      this.logger.info(
        chalk.yellow('\n💾 Plan saved locally. Use --create-pm to create PM issues in Linear.')
      );
    }

    this.logger.info(chalk.green(`\n✓ Plan created for ${feature}`));
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

  /**
   * Analyzes decisions using cascading file check strategy:
   * 1. Feature-specific decisions.md
   * 2. exploration.md (Recommendation + Decisions Needed)
   * 3. Global decisions.md (fallback)
   */
  private async analyzeDecisions(feature: string): Promise<string[]> {
    // Strategy 1: Check feature-specific decisions.md
    const featureDecisions = await this.checkFeatureDecisions(feature);
    if (featureDecisions.length > 0) {
      return featureDecisions;
    }

    // Strategy 2: Extract from exploration.md
    const explorationDecisions = await this.extractFromExploration(feature);
    if (explorationDecisions.length > 0) {
      return explorationDecisions;
    }

    // Strategy 3: Fall back to global decisions.md
    return this.checkGlobalDecisions(feature);
  }

  /**
   * Check for decisions in feature-specific decisions.md file
   */
  private async checkFeatureDecisions(feature: string): Promise<string[]> {
    const featureDecisionsFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      feature,
      'decisions.md'
    );

    if (!existsSync(featureDecisionsFile)) {
      return [];
    }

    const content = await fs.readFile(featureDecisionsFile, 'utf-8');
    return this.parseDecisionsFromMarkdown(content, feature);
  }

  /**
   * Extract decisions from exploration.md (Recommendation + Decisions Needed sections)
   */
  private async extractFromExploration(feature: string): Promise<string[]> {
    const explorationFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      feature,
      'explore',
      'exploration.md'
    );

    if (!existsSync(explorationFile)) {
      return [];
    }

    try {
      const content = await fs.readFile(explorationFile, 'utf-8');
      const decisions: string[] = [];

      // Extract Recommendation section
      const recommendationMatch = content.match(/## Recommendation\s*\n\n\*\*(.+?)\*\*/);
      if (recommendationMatch && recommendationMatch[1]) {
        decisions.push(recommendationMatch[1].trim());
      }

      // Extract Decisions Needed section
      const decisionsNeededMatch = content.match(/## Decisions Needed([\s\S]*?)(?=\n## |\n---|$)/);
      if (decisionsNeededMatch && decisionsNeededMatch[1]) {
        // Parse individual decision titles from "### Decision N:" headers
        const decisionTitles = decisionsNeededMatch[1].match(/### Decision \d+: (.+)/g);
        if (decisionTitles) {
          decisionTitles.forEach((title) => {
            const match = title.match(/### Decision \d+: (.+)/);
            if (match && match[1]) {
              decisions.push(match[1].trim());
            }
          });
        }
      }

      // If we have decisions from exploration, check for uncovered decisions
      if (decisions.length > 0) {
        this.checkUncoveredDecisions(content, recommendationMatch?.[1] || '');
      }

      return decisions;
    } catch (error) {
      return [];
    }
  }

  /**
   * Check for uncovered decisions in Decisions Needed section
   * Prompts user interactively if uncovered decisions are found
   */
  private checkUncoveredDecisions(explorationContent: string, recommendation: string): void {
    const decisionsNeededMatch = explorationContent.match(
      /## Decisions Needed([\s\S]*?)(?=\n## |\n---|$)/
    );

    if (!decisionsNeededMatch) {
      return;
    }

    // Extract decision titles
    const decisionTitles = decisionsNeededMatch[1].match(/### Decision \d+: (.+)/g);
    if (!decisionTitles || decisionTitles.length === 0) {
      return;
    }

    // Check if recommendation covers all decisions
    const uncoveredDecisions = decisionTitles.filter((title) => {
      const match = title.match(/### Decision \d+: (.+)/);
      if (!match) return false;
      const decisionTopic = match[1].toLowerCase();
      return !recommendation.toLowerCase().includes(decisionTopic);
    });

    if (uncoveredDecisions.length > 0) {
      this.logger.warn(chalk.yellow('\n⚠️  Uncovered Decisions Detected:'));
      this.logger.info(
        chalk.yellow(
          `The Recommendation doesn't address ${uncoveredDecisions.length} decision(s) from Decisions Needed:`
        )
      );
      uncoveredDecisions.forEach((decision, index) => {
        const match = decision.match(/### Decision \d+: (.+)/);
        if (match) {
          this.logger.warn(chalk.yellow(`  ${index + 1}. ${match[1]}`));
        }
      });
      this.logger.info(
        chalk.yellow('\nNote: You may want to revisit /decide to address these before proceeding.')
      );
      this.logger.warn(chalk.yellow('Continuing with plan generation...\n'));
    }
  }

  /**
   * Check global decisions.md file (final fallback)
   */
  private async checkGlobalDecisions(feature: string): Promise<string[]> {
    const decisionsFile = path.join(this.basePath, '.hodge', 'decisions.md');
    if (!existsSync(decisionsFile)) {
      return [];
    }

    const content = await fs.readFile(decisionsFile, 'utf-8');
    return this.parseDecisionsFromMarkdown(content, feature);
  }

  /**
   * Parse decisions from markdown content with feature filtering
   */
  private parseDecisionsFromMarkdown(content: string, feature: string): string[] {
    const decisions: string[] = [];
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

  private async generatePlan(
    feature: string,
    decisions: string[],
    laneCount: number
  ): Promise<DevelopmentPlan> {
    // Check for AI-generated plan file first
    const aiPlanPath = path.join(
      this.basePath,
      '.hodge',
      'temp',
      'plan-interaction',
      feature,
      'plan.json'
    );

    if (existsSync(aiPlanPath)) {
      try {
        const aiPlanContent = await fs.readFile(aiPlanPath, 'utf-8');
        const aiPlan = JSON.parse(aiPlanContent) as DevelopmentPlanJSON;

        this.logger.info(chalk.green('✓ Using AI-generated plan from slash command'));

        // Convert plain objects to Maps for lanes and dependencies
        const convertedLanes = aiPlan.lanes
          ? {
              count: aiPlan.lanes.count,
              assignments: new Map(
                Object.entries(aiPlan.lanes.assignments).map(([k, v]) => [parseInt(k), v])
              ),
            }
          : undefined;

        const convertedDependencies = aiPlan.dependencies
          ? new Map(Object.entries(aiPlan.dependencies))
          : undefined;

        const convertedPlan: DevelopmentPlan = {
          ...aiPlan,
          lanes: convertedLanes,
          dependencies: convertedDependencies,
        };

        // Validate and return the AI-generated plan
        return convertedPlan;
      } catch (error) {
        this.logger.info(
          chalk.yellow('⚠️  AI plan file exists but is invalid, falling back to keyword matching')
        );
        // Fall through to keyword-based generation
      }
    }

    // Fallback: keyword-based plan generation (legacy behavior)
    this.logger.warn(
      chalk.yellow('ℹ️  No AI plan found, using keyword matching (legacy behavior)')
    );

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

    // Try exploration.md first
    if (existsSync(explorationFile)) {
      try {
        const content = await fs.readFile(explorationFile, 'utf-8');

        // Priority 1: Extract from Title field (AI-generated)
        const titleMatch = content.match(/\*\*Title\*\*:\s*([^\n]+)/);
        if (titleMatch && titleMatch[1]) {
          return this.truncateDescription(titleMatch[1].trim());
        }

        // Priority 2: Extract from ## Problem Statement heading
        const headingMatch = content.match(/## Problem Statement\s*\n([^\n]+)/);
        if (headingMatch && headingMatch[1]) {
          return this.truncateDescription(headingMatch[1].trim());
        }

        // Priority 3: Extract from **Problem Statement:** inline format
        const inlineMatch = content.match(/\*\*Problem Statement:\*\*\s*\n([^\n]+)/);
        if (inlineMatch && inlineMatch[1]) {
          return this.truncateDescription(inlineMatch[1].trim());
        }

        // Priority 4: Try to extract from "Type:" line
        const typeMatch = content.match(/\*\*Type\*\*:\s*([^\n]+)/);
        if (typeMatch && typeMatch[1]) {
          return this.truncateDescription(typeMatch[1].trim());
        }

        // Priority 5: Use first non-header line after Feature Overview
        const overviewMatch = content.match(/## Feature Overview[\s\S]*?\n\n([^\n#]+)/);
        if (overviewMatch && overviewMatch[1]) {
          return this.truncateDescription(overviewMatch[1].trim());
        }
      } catch (error) {
        // Fall through to decision extraction
      }
    }

    // Fallback: Try to extract from decisions
    const decisions = await this.analyzeDecisions(feature);
    if (decisions.length > 0) {
      // Strategy 1: Look for implementation approach decision
      const approachDecision = decisions.find(
        (d) =>
          d.toLowerCase().includes('implement') ||
          d.toLowerCase().includes('approach') ||
          d.toLowerCase().includes('use')
      );
      if (approachDecision) {
        return this.truncateDescription(this.cleanDecisionText(approachDecision));
      }

      // Strategy 2: Use first substantial decision
      const substantialDecision = decisions.find((d) => d.length > 30);
      if (substantialDecision) {
        return this.truncateDescription(this.cleanDecisionText(substantialDecision));
      }

      // Strategy 3: Synthesize from decision count
      return `Implementing ${decisions.length} technical decisions`;
    }

    return 'No description available';
  }

  /**
   * Clean decision text by removing phase markers and extra formatting
   */
  private cleanDecisionText(decision: string): string {
    return decision
      .replace(/\[.*?\]/g, '') // Remove phase markers like [harden]
      .split('-')[0] // Take first part before dash
      .trim();
  }

  /**
   * Truncate description at 100 chars with word boundary
   */
  private truncateDescription(text: string): string {
    if (text.length <= 100) {
      return text;
    }

    // Find last space before 100 chars
    const truncated = text.substring(0, 100);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    // No space found, just truncate at 100
    return truncated + '...';
  }

  private displayPlan(plan: DevelopmentPlan): void {
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

  private showNextSteps(plan: DevelopmentPlan): void {
    this.logger.info('\n' + chalk.bold('Next Steps:'));

    if (plan.type === 'single') {
      this.logger.info(`  Start building: ${chalk.cyan(`hodge build ${plan.feature}`)}`);
    } else if (plan.lanes && plan.lanes.count > 1) {
      this.logger.info('\nParallel development ready:');
      for (let i = 0; i < plan.lanes.count; i++) {
        const stories = plan.lanes.assignments.get(i) || [];
        if (stories.length > 0) {
          this.logger.info(`  Lane ${i + 1}: ${chalk.cyan(`hodge build ${stories[0]}`)}`);
        }
      }
    } else if (plan.stories && plan.stories.length > 0) {
      this.logger.info(`  Start with: ${chalk.cyan(`hodge build ${plan.stories[0].id}`)}`);
    }
  }
}
