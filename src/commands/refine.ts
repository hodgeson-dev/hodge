import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { existsSync } from 'fs';
import { createCommandLogger } from '../lib/logger.js';
import { LocalPMAdapter } from '../lib/pm/local-pm-adapter.js';
import type { PMIssue } from '../lib/pm/types.js';

export interface RefineOptions {
  rerun?: boolean;
}

/**
 * Refine Command - Implementation details phase
 * HODGE-377.6: Renamed from DecideCommand to support comprehensive implementation planning
 *
 * This command sets up the refinement phase where developers drill into implementation
 * details after exploration. It validates exploration exists, creates the refine/
 * directory structure, and provides context for the AI conversation.
 *
 * The actual refinement conversation happens in the /refine slash command template,
 * which calls this CLI command for setup and then uses the Write tool to create
 * refinements.md after the structured conversation.
 */
export class RefineCommand {
  private basePath: string;
  private logger = createCommandLogger('refine', { enableConsole: true });
  private pmAdapter: LocalPMAdapter;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
    this.pmAdapter = new LocalPMAdapter(basePath);
  }

  async execute(featureId: string, options: RefineOptions = {}): Promise<void> {
    this.logger.info(chalk.yellow('📋 Entering Refinement Mode'));
    this.logger.info(`Feature: ${featureId}\n`);

    // Setup paths
    const paths = this.setupRefinePaths(featureId);

    // Validation: exploration.md must exist (HODGE-377.6 requirement)
    this.validateExploration(paths.explorationFile, featureId);

    // Check for existing refinements.md (handle --rerun flag)
    this.checkExistingRefinements(paths.refinementsFile, options.rerun ?? false);

    // Create refine directory
    await fs.mkdir(paths.refineDir, { recursive: true });

    // Load context for AI
    const context = await this.loadRefinementContext(featureId, paths);

    // Output AI context
    this.outputAIContext(featureId, context);

    this.logger.info('\nRefinement context prepared.');
    this.logger.info(chalk.gray(`\nRefine directory: ${paths.refineDir}`));
    this.logger.info(
      chalk.yellow('\nThe AI will now guide you through implementation refinement.')
    );
  }

  /**
   * Setup refinement paths
   */
  private setupRefinePaths(featureId: string) {
    const featureDir = path.join(this.basePath, '.hodge', 'features', featureId);
    return {
      featureDir,
      refineDir: path.join(featureDir, 'refine'),
      exploreDir: path.join(featureDir, 'explore'),
      explorationFile: path.join(featureDir, 'explore', 'exploration.md'),
      refinementsFile: path.join(featureDir, 'refine', 'refinements.md'),
    };
  }

  /**
   * Validate that exploration.md exists
   * HODGE-377.6: Refinement requires exploration
   */
  private validateExploration(explorationFile: string, featureId: string): void {
    if (!existsSync(explorationFile)) {
      const error = new Error('Exploration not found');
      this.logger.error(chalk.red('\n✗ Error: exploration.md not found'), { error });
      this.logger.error(chalk.gray(`  Expected: ${explorationFile}`));
      this.logger.error(chalk.yellow(`\n  Please run /explore ${featureId} first.\n`));
      throw error;
    }
  }

  /**
   * Check for existing refinements.md (handle --rerun)
   * HODGE-377.6: Support --rerun flag to regenerate refinements
   */
  private checkExistingRefinements(refinementsFile: string, rerun: boolean): void {
    if (existsSync(refinementsFile) && !rerun) {
      const error = new Error('Refinements already exist');
      this.logger.error(chalk.red('\n✗ Error: refinements.md already exists'), { error });
      this.logger.error(chalk.gray(`  Location: ${refinementsFile}`));
      this.logger.error(chalk.yellow('\n  Use --rerun flag to regenerate refinements.\n'));
      throw error;
    }

    if (existsSync(refinementsFile) && rerun) {
      this.logger.info(chalk.yellow('⚠️  Regenerating refinements (--rerun mode)'));
    }
  }

  /**
   * Load refinement context for AI
   * HODGE-377.6: Load exploration + sub-feature context
   */
  private async loadRefinementContext(
    featureId: string,
    paths: ReturnType<typeof this.setupRefinePaths>
  ) {
    // Load exploration
    const exploration = existsSync(paths.explorationFile)
      ? await fs.readFile(paths.explorationFile, 'utf-8')
      : null;

    // Extract questions from exploration
    const questions = exploration ? this.extractQuestions(exploration) : [];

    // Load sub-feature context (parent + siblings) - HODGE-377.5 integration
    const subFeatureContext = await this.loadSubFeatureContext(featureId);

    return {
      exploration,
      questions,
      subFeatureContext,
      recommendedApproach: this.extractRecommendation(exploration ?? ''),
    };
  }

  /**
   * Extract "Questions for Refinement" from exploration.md
   * HODGE-377.6: Section renamed from "Decisions Needed"
   */
  private extractQuestions(exploration: string): string[] {
    // eslint-disable-next-line sonarjs/slow-regex -- User-authored markdown, small files (<5KB), runs once
    const sectionRegex = /##\s*Questions for Refinement\s*([^]*?)(?=\n##|$)/i;
    const questionsSection = sectionRegex.exec(exploration);

    if (!questionsSection) {
      return [];
    }

    const questionText = questionsSection[1];
    const questions: string[] = [];
    const questionRegex = /^\d+\.\s*\*\*([^*]+)\*\*/gm;

    let match;
    while ((match = questionRegex.exec(questionText)) !== null) {
      questions.push(match[1].trim());
    }

    return questions;
  }

  /**
   * Extract recommendation from exploration.md
   */
  private extractRecommendation(exploration: string): string | null {
    // eslint-disable-next-line sonarjs/slow-regex -- User-authored markdown, small files (<5KB), runs once
    const sectionRegex = /##\s*Recommendation\s*([^]*?)(?=\n##|$)/i;
    const recommendationSection = sectionRegex.exec(exploration);

    if (!recommendationSection) {
      return null;
    }

    // Extract first paragraph after "Recommendation" header
    const text = recommendationSection[1].trim();
    const firstParagraph = text.split('\n\n')[0];
    return firstParagraph.substring(0, 200); // Truncate for summary
  }

  /**
   * Load sub-feature context (parent + siblings)
   * HODGE-377.6: Uses HODGE-377.5 PM adapter methods for sub-feature detection
   */
  private async loadSubFeatureContext(featureId: string): Promise<{
    parent: { id: string; refinements: { id: string; content: string } | null } | null;
    siblings: Array<{ id: string; content: string }>;
  }> {
    try {
      // Use LocalPMAdapter for sub-feature detection
      // Check if this is a sub-feature
      const parentId = await this.pmAdapter.getParentIssue(featureId);

      if (!parentId) {
        return { parent: null, siblings: [] };
      }

      // Load parent refinements
      const parentRefinements = await this.loadRefinementsFile(parentId);

      // Load sibling refinements
      const siblings: PMIssue[] = await this.pmAdapter.getSubIssues(parentId);
      const siblingRefinements = await Promise.all(
        siblings
          .filter((s: PMIssue) => s.id !== featureId) // Exclude self
          .map((s: PMIssue) => this.loadRefinementsFile(s.id))
      );

      return {
        parent: { id: parentId, refinements: parentRefinements },
        siblings: siblingRefinements.filter(
          (r): r is { id: string; content: string } => r !== null
        ),
      };
    } catch (error) {
      // If PM adapters aren't available or fail, continue without sub-feature context
      this.logger.debug('Sub-feature context not available', { error: error as Error });
      return { parent: null, siblings: [] };
    }
  }

  /**
   * Load refinements.md file for a feature (if it exists)
   */
  private async loadRefinementsFile(
    featureId: string
  ): Promise<{ id: string; content: string } | null> {
    const refinementsPath = path.join(
      this.basePath,
      '.hodge',
      'features',
      featureId,
      'refine',
      'refinements.md'
    );

    if (!existsSync(refinementsPath)) {
      return null;
    }

    const content = await fs.readFile(refinementsPath, 'utf-8');
    return { id: featureId, content };
  }

  /**
   * Output AI context for refinement conversation
   */
  private outputAIContext(
    featureId: string,
    context: {
      exploration: string | null;
      questions: string[];
      subFeatureContext: {
        parent: { id: string; refinements: { id: string; content: string } | null } | null;
        siblings: Array<{ id: string; content: string }>;
      };
      recommendedApproach: string | null;
    }
  ): void {
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.yellow.bold('AI CONTEXT UPDATE:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`You are now in REFINEMENT MODE for: ${featureId}\n`);

    if (context.recommendedApproach) {
      this.logger.info('Recommended Approach from Exploration:');
      this.logger.info(chalk.gray(context.recommendedApproach));
      this.logger.info('');
    }

    if (context.questions.length > 0) {
      this.logger.info(`Questions for Refinement: ${context.questions.length}`);
      context.questions.forEach((q, i) => {
        this.logger.info(chalk.gray(`  ${i + 1}. ${q}`));
      });
      this.logger.info('');
    } else {
      this.logger.info('No specific questions identified in exploration.');
      this.logger.info('');
    }

    if (context.subFeatureContext.parent) {
      this.logger.info(chalk.cyan('📚 Sub-Feature Context Available:'));
      this.logger.info(chalk.gray(`  Parent: ${context.subFeatureContext.parent.id}`));
      if (context.subFeatureContext.siblings.length > 0) {
        this.logger.info(chalk.gray(`  Siblings: ${context.subFeatureContext.siblings.length}`));
      }
      this.logger.info('');
    }

    this.outputRefinementInstructions();
  }

  /**
   * Output refinement phase instructions
   */
  private outputRefinementInstructions(): void {
    this.logger.info('Refinement Phase Instructions:');
    this.logger.info('• Phase 1: Address known questions from exploration');
    this.logger.info('• Phase 2: Open implementation drill-down');
    this.logger.info('• Create comprehensive refinements.md with:');
    this.logger.info('  - Implementation Summary');
    this.logger.info('  - Detailed Implementation Plan');
    this.logger.info('  - Known Questions Resolved');
    this.logger.info('  - Additional Decisions Made');
    this.logger.info('  - Test Strategy');
    this.logger.info('  - Edge Cases & Gotchas');
    this.logger.info(chalk.bold('═'.repeat(60)));
  }
}
