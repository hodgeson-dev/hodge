/**
 * Enhanced Explore Command with Cache + AI Intelligence
 * Combines performance optimization with smart context generation
 * Refactored for HODGE-357.2: Service extraction for complexity reduction
 *
 * Note: AI handles approach generation - no CLI logic needed
 * Note: AI provides implementation guidance through conversation
 */

import chalk from 'chalk';
import path from 'path';
import { cacheManager, standardsCache } from '../lib/cache-manager.js';
import { PatternLearner } from '../lib/pattern-learner.js';
import { IDManager, type FeatureID } from '../lib/id-manager.js';
import { createCommandLogger } from '../lib/logger.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { SubFeatureContextService } from '../lib/sub-feature-context-service.js';
import { ExploreService } from '../lib/explore-service.js';

export interface ExploreOptions {
  verbose?: boolean;
  skipIdManagement?: boolean; // For testing
}

/**
 * Explore Command with AI, caching, and ID management
 * Thin orchestration layer - business logic in ExploreService
 */
export class ExploreCommand {
  private cache = cacheManager;
  private standardsCache = standardsCache;
  private patternLearner: PatternLearner;
  private idManager: IDManager;
  private pmHooks: PMHooks;
  private logger = createCommandLogger('explore', { enableConsole: true });
  private subFeatureContext: SubFeatureContextService;
  private exploreService: ExploreService;
  private readonly workingDir: string;

  constructor(idManager?: IDManager, exploreService?: ExploreService, basePath?: string) {
    this.workingDir = basePath ?? process.cwd();
    const hodgeDir = path.join(this.workingDir, '.hodge');

    this.patternLearner = new PatternLearner(this.workingDir);
    this.idManager = idManager ?? new IDManager(hodgeDir);
    this.exploreService = exploreService ?? new ExploreService(this.workingDir);
    this.pmHooks = new PMHooks(this.workingDir);
    this.subFeatureContext = new SubFeatureContextService(this.workingDir);
  }

  async execute(feature: string, options: ExploreOptions = {}): Promise<void> {
    const startTime = Date.now();

    // HODGE-053: Detect input type and handle topic exploration warning
    const inputType = this.detectInputType(feature);
    const userDescription = inputType === 'topic' ? feature : undefined;

    if ((options.verbose ?? false) || !!process.env.DEBUG) {
      this.logger.info(chalk.gray(`Input detection: "${feature}" → ${inputType}`));
    }

    if (inputType === 'topic') {
      this.logger.info(chalk.cyan('🔍 Exploring Topic: ' + feature));
      this.logger.info(
        chalk.yellow('Topic exploration not yet implemented. Treating as feature for now.\n')
      );
    }

    // Handle ID management and get resolved feature name
    const { featureID, featureName } = await this.handleIDManagement(feature, options);

    // Standard exploration flow
    await this.performExploration(featureName, featureID, userDescription, options, startTime);
  }

  /**
   * Handle ID management and feature resolution
   */
  private async handleIDManagement(
    feature: string,
    options: ExploreOptions
  ): Promise<{ featureID: FeatureID | null; featureName: string }> {
    if (options.skipIdManagement) {
      return { featureID: null, featureName: feature };
    }

    let featureID = await this.idManager.resolveID(feature);
    let featureName: string;

    if (!featureID && !/^(HODGE-|[A-Z]+-|#|!)\d+/.test(feature)) {
      // New feature name
      featureID = await this.idManager.createFeature(feature);
      featureName = featureID.localID;
      this.logger.info(chalk.green(`✓ Created new feature: ${featureID.localID}`));
      this.pmHooks.onExplore(featureID.localID, feature).catch(() => {});
    } else if (!featureID) {
      // Looks like ID but not found
      featureID = await this.createFeatureWithID(feature);
      featureName = featureID.localID;
    } else {
      // Existing feature
      featureName = featureID.localID;
      this.pmHooks.onExplore(featureID.localID).catch(() => {});
      this.logExistingFeature(featureID);
    }

    return { featureID, featureName };
  }

  /**
   * Create feature with specific ID (HODGE- prefix or external)
   */
  private async createFeatureWithID(feature: string): Promise<FeatureID> {
    if (feature.startsWith('HODGE-')) {
      const featureID = await this.idManager.createFeature(feature);
      this.logger.info(chalk.green(`✓ Created new feature: ${featureID.localID}`));
      this.pmHooks.onExplore(featureID.localID, feature).catch(() => {});
      return featureID;
    } else {
      const newFeature = await this.idManager.createFeature(feature);
      const featureID = await this.idManager.linkExternalID(newFeature.localID, feature);
      this.logger.info(
        chalk.green(`✓ Created new feature ${featureID.localID} linked to ${feature}`)
      );
      this.pmHooks.onExplore(featureID.localID, feature).catch(() => {});
      return featureID;
    }
  }

  /**
   * Log existing feature information
   */
  private logExistingFeature(featureID: FeatureID): void {
    if (featureID.externalID) {
      this.logger.info(
        chalk.blue(`ℹ️  Using existing feature ${featureID.localID} (${featureID.externalID})`)
      );
    } else {
      this.logger.info(chalk.blue(`ℹ️  Using existing feature ${featureID.localID}`));
    }
  }

  /**
   * Perform standard exploration workflow
   */
  private async performExploration(
    featureName: string,
    featureID: FeatureID | null,
    userDescription: string | undefined,
    options: ExploreOptions,
    startTime: number
  ): Promise<void> {
    this.logger.info(chalk.cyan('🔍 Entering Explore Mode (Enhanced)'));
    this.logger.info(chalk.gray(`Feature: ${featureName}\n`));

    this.displayAIContext(featureName);
    this.loadSubFeatureContext(featureName);

    const exploreDir = path.join(this.workingDir, '.hodge', 'features', featureName, 'explore');

    // Check existing exploration
    const existingCheck = await this.exploreService.checkExistingExploration(exploreDir, false);

    if (existingCheck.exists && !existingCheck.shouldContinue) {
      this.displayExistingExploration(exploreDir, existingCheck.content);
      return;
    }

    // Gather context and generate exploration
    const context = await this.gatherExplorationContext(featureName, featureID);
    const smartTemplate = await this.generateAndCreateExploration(
      featureName,
      featureID,
      userDescription,
      exploreDir,
      context
    );

    this.displayExplorationGuidance(featureName, smartTemplate, context.similarFeatures);

    // Update session
    await this.exploreService.updateSession(featureName, Date.now() - startTime);

    // Performance report
    if (!!process.env.DEBUG || (options.verbose ?? false)) {
      this.displayPerformanceStats(Date.now() - startTime);
    }
  }

  /**
   * Gather all context needed for exploration
   */
  private async gatherExplorationContext(featureName: string, featureID: FeatureID | null) {
    const [, featureIntent, similarFeatures, pmIssue, existingPatterns] = await Promise.all([
      this.loadProjectContext(),
      this.exploreService.analyzeFeatureIntent(featureName),
      this.exploreService.findSimilarFeatures(featureName),
      this.resolvePMIssue(featureID, featureName),
      this.patternLearner.loadExistingPatterns(),
    ]);

    return { featureIntent, similarFeatures, pmIssue, existingPatterns };
  }

  /**
   * Generate template and create exploration structure
   */
  private async generateAndCreateExploration(
    featureName: string,
    featureID: FeatureID | null,
    userDescription: string | undefined,
    exploreDir: string,
    context: Awaited<ReturnType<typeof this.gatherExplorationContext>>
  ) {
    const smartTemplate = this.exploreService.generateSmartTemplate(
      featureName,
      context.featureIntent,
      context.similarFeatures,
      context.existingPatterns.map((p) => ({
        name: p.name,
        description: p.description,
        confidence: p.frequency / 100,
      })),
      { projectType: 'unknown', technologies: [], patterns: [] },
      context.pmIssue,
      userDescription
    );

    await this.exploreService.createExplorationStructure(
      featureName,
      exploreDir,
      smartTemplate,
      context.featureIntent,
      context.pmIssue,
      featureID
    );

    return smartTemplate;
  }

  /**
   * HODGE-053: Detect if input is a feature ID or a topic
   */
  private detectInputType(input: string): 'feature' | 'topic' {
    const trimmed = input.trim();

    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return 'topic';
    }

    const featurePattern = /^[^\s]+-\d+(\.\d+)?$/;
    if (featurePattern.test(trimmed)) {
      return 'feature';
    }

    if (/^[#!]\d+$/.test(trimmed)) {
      return 'feature';
    }

    return 'topic';
  }

  /**
   * Display AI context header
   */
  private displayAIContext(feature: string): void {
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.cyan.bold('AI CONTEXT UPDATE:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`You are now in ${chalk.cyan.bold('EXPLORATION MODE')} for: ${feature}`);
    this.logger.info('\nGuidelines for AI assistance:');
    this.logger.info('• Suggest multiple approaches and alternatives');
    this.logger.info('• Standards are suggestions only, not requirements');
    this.logger.info('• Encourage experimentation and learning');
    this.logger.info('• Focus on discovery over perfection');
    this.logger.info(chalk.bold('═'.repeat(60)) + '\n');
  }

  /**
   * Display existing exploration warning
   */
  private displayExistingExploration(exploreDir: string, content?: string): void {
    this.logger.info(chalk.yellow('⚠️  Exploration already exists for this feature.'));
    this.logger.info(chalk.gray(`   Review existing exploration at:`));
    this.logger.info(chalk.gray(`   ${exploreDir}\n`));

    if (content) {
      const lines = content.split('\n').slice(0, 10);
      this.logger.info(chalk.dim('--- Existing Exploration Preview ---'));
      this.logger.info(chalk.dim(lines.join('\n')));
      this.logger.info(chalk.dim('...\n'));
    }
  }

  /**
   * Load project context from cache
   */
  private async loadProjectContext(): Promise<{
    hasStandards: boolean;
    patternCount: number;
    patterns: string[];
    config: Record<string, unknown> | null;
  }> {
    const [standards, patterns, config] = await Promise.all([
      this.standardsCache.loadStandards(),
      this.standardsCache.loadPatterns(),
      this.standardsCache.loadConfig(),
    ]);

    return {
      hasStandards: !!standards,
      patternCount: patterns.size,
      patterns: Array.from(patterns.keys()),
      config: config as Record<string, unknown> | null,
    };
  }

  /**
   * Resolve PM issue from feature ID or feature name
   */
  private resolvePMIssue(
    featureID: FeatureID | null,
    featureName: string
  ): { id: string; title: string; url: string } | null {
    if (featureID?.externalID) {
      return {
        id: featureID.externalID,
        title: `Feature ${featureName}`,
        url: `#${featureID.externalID}`,
      };
    }

    return null;
  }

  /**
   * Display exploration guidance
   *
   * Template contains placeholders for AI:
   * <!-- AI will generate 2-3 approaches here -->
   * <!-- AI will provide recommendation -->
   * <!-- AI will list decisions for /decide command -->
   */
  private displayExplorationGuidance(
    feature: string,
    template: { suggestedPatterns: string[] },
    similarFeatures: string[]
  ): void {
    this.logger.info(chalk.green('✓ Enhanced exploration environment created\n'));
    this.logger.info(chalk.bold('AI Analysis:'));
    this.logger.info(`  • Feature: ${chalk.cyan(feature)}`);
    this.logger.info(`  • Template ready for AI to generate approaches`);

    if (similarFeatures.length > 0) {
      this.logger.info(`  • Similar features found: ${chalk.cyan(similarFeatures.length)}`);
      similarFeatures.forEach((f) => this.logger.info(chalk.gray(`    - ${f}`)));
    }

    if (template.suggestedPatterns.length > 0) {
      this.logger.info(`  • Suggested patterns: ${chalk.green(template.suggestedPatterns.length)}`);
      template.suggestedPatterns
        .slice(0, 3)
        .forEach((p) => this.logger.info(chalk.gray(`    - ${p}`)));
    }

    this.logger.info('\n' + chalk.bold('Next steps:'));
    // Generate and review implementation approaches
    this.logger.info(`  1. Review the AI-generated exploration`);
    this.logger.info('  2. Use ' + chalk.cyan('`/decide`') + ' to choose an approach');
    this.logger.info('  3. Then ' + chalk.cyan(`\`/build ${feature}\``) + ' to implement\n');
    this.logger.info(chalk.dim(`Exploration saved to: .hodge/features/${feature}/explore`));
  }

  /**
   * Display performance stats
   */
  private displayPerformanceStats(executionTime: number): void {
    this.logger.info(chalk.gray(`\n⚡ Execution time: ${executionTime}ms`));
    const stats = this.cache.getStats();
    this.logger.info(
      chalk.gray(
        `📊 Cache: ${stats.hits} hits, ${stats.misses} misses (${(stats.hitRate * 100).toFixed(1)}% hit rate)`
      )
    );
  }

  /**
   * Load sub-feature context if applicable (HODGE-334)
   * Outputs file manifest to stdout for AI to consume
   */
  private loadSubFeatureContext(feature: string): { isSubFeature: boolean } {
    const detection = this.subFeatureContext.detectSubFeature(feature);

    if (!detection.isSubFeature || !detection.parent) {
      return { isSubFeature: false };
    }

    // Build file manifest (just paths + metadata, no reading)
    const manifest = this.subFeatureContext.buildFileManifest(detection.parent, [feature]);

    if (!manifest) {
      return { isSubFeature: true };
    }

    // Output manifest to stdout for AI
    this.logger.info(chalk.cyan('\n📚 Sub-Feature Context Available'));
    this.logger.info(chalk.gray(`Feature: ${feature} (child of ${detection.parent})\n`));

    if (manifest.parent) {
      this.logger.info(chalk.bold(`Parent: ${manifest.parent.feature}`));
      for (const file of manifest.parent.files) {
        this.logger.info(chalk.gray(`  - ${file.path}`));
      }
      this.logger.info('');
    }

    if (manifest.siblings.length > 0) {
      this.logger.info(chalk.bold(`Shipped Siblings (${manifest.siblings.length}):`));
      for (const sibling of manifest.siblings) {
        this.logger.info(chalk.cyan(`  ${sibling.feature} (shipped ${sibling.shippedAt}):`));
        for (const file of sibling.files) {
          this.logger.info(chalk.gray(`    - ${file.path}`));
        }
      }
      this.logger.info('');
    }

    this.logger.info(chalk.dim(`Suggested reading order: ${manifest.suggestedReadingOrder}\n`));

    return { isSubFeature: true };
  }
}

// Export alias for backward compatibility
export { ExploreCommand as EnhancedExploreCommand };
