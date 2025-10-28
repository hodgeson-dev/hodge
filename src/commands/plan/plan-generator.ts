/**
 * Plan Generation Logic
 * Handles development plan generation, story breakdown, and lane allocation
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { createCommandLogger } from '../../lib/logger.js';

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
export interface DevelopmentPlanJSON {
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

/**
 * Generates development plans from decisions
 */
export class PlanGenerator {
  private logger = createCommandLogger('plan-generator', { enableConsole: true });

  constructor(private basePath: string) {}

  /**
   * Generate development plan from decisions
   */
  async generatePlan(
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
        this.logger.debug('AI plan validation failed', { error: error as Error });
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

  /**
   * Determine if feature is complex based on decisions
   */
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

  /**
   * Generate stories from decisions
   * @note Cognitive complexity 16 - Pre-existing technical debt, requires refactoring (HODGE-349)
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
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

  /**
   * Analyze story dependencies
   */
  private analyzeDependencies(stories: Story[]): Map<string, string[]> {
    const deps = new Map<string, string[]>();
    for (const story of stories) {
      if (story.dependencies && story.dependencies.length > 0) {
        deps.set(story.id, story.dependencies);
      }
    }
    return deps;
  }

  /**
   * Allocate stories to lanes respecting dependencies
   */
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

  /**
   * Estimate timeline based on story effort
   */
  private estimateTimeline(stories: Story[], laneCount: number): number {
    const effortDays = { small: 1, medium: 2, large: 3 };
    const totalEffort = stories.reduce(
      (sum, story) => sum + effortDays[story.effort || 'medium'],
      0
    );
    return Math.ceil(totalEffort / laneCount);
  }
}
