/**
 * Enhanced Explore Command with Cache + AI Intelligence
 * Combines performance optimization with smart context generation
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { cacheManager, featureCache, standardsCache } from '../lib/cache-manager.js';
import { PatternLearner } from '../lib/pattern-learner.js';
import { IDManager, type FeatureID } from '../lib/id-manager.js';
import { createCommandLogger } from '../lib/logger.js';
import { sessionManager } from '../lib/session-manager.js';
import { FeaturePopulator } from '../lib/feature-populator.js';
import { FeatureSpecLoader } from '../lib/feature-spec-loader.js';
import { autoSave } from '../lib/auto-save.js';
import { contextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';

export interface ExploreOptions {
  force?: boolean;
  verbose?: boolean;
  skipIdManagement?: boolean; // For testing
  prePopulate?: boolean; // Pre-populate from decisions (legacy)
  decisions?: string[]; // Specific decisions to link (legacy)
  fromSpec?: string; // Path to YAML spec file (new approach)
}

// Simplified feature intent type
type IntentType =
  | 'authentication'
  | 'database'
  | 'api'
  | 'ui'
  | 'general'
  | 'api-endpoint'
  | 'caching'
  | 'performance'
  | 'testing';

interface FeatureIntent {
  type: IntentType;
  keywords: string[];
  suggestedPatterns: string[];
  relatedCommands: string[];
}

interface SmartTemplate {
  content: string;
  approaches: Approach[];
  relatedFeatures: string[];
  suggestedPatterns: string[];
}

interface Approach {
  name: string;
  description: string;
  relevance: number;
  pros: string[];
  cons: string[];
}

/**
 * Explore Command with AI, caching, and ID management
 */
export class ExploreCommand {
  private cache = cacheManager;
  private featureCache = featureCache;
  private standardsCache = standardsCache;
  private patternLearner = new PatternLearner();
  private idManager: IDManager;
  private pmHooks = new PMHooks();
  private logger = createCommandLogger('explore', { enableConsole: true });

  constructor(idManager?: IDManager) {
    this.idManager = idManager || new IDManager();
  }

  async execute(feature: string, options: ExploreOptions = {}): Promise<void> {
    const startTime = Date.now();

    // Auto-save context when switching features
    await autoSave.checkAndSave(feature);

    // HODGE-053: Detect if input is a feature or topic
    const inputType = this.detectInputType(feature);

    if (options.verbose || process.env.DEBUG) {
      this.logger.info(chalk.gray(`Input detection: "${feature}" → ${inputType}`));
      this.logger.debug('Input detection', { feature, inputType });
    }

    if (inputType === 'topic') {
      // Handle as topic exploration (future implementation)
      this.logger.info(chalk.cyan('🔍 Exploring Topic: ' + feature));
      this.logger.info(
        chalk.yellow('Topic exploration not yet implemented. Treating as feature for now.\n')
      );
      this.logger.info('Topic exploration requested', { topic: feature });
    }

    // Handle ID management
    let featureID: FeatureID | null = null;
    let featureName = feature;

    if (!options.skipIdManagement) {
      // Resolve feature ID (could be local or external)
      featureID = await this.idManager.resolveID(feature);

      // If not found and doesn't look like an ID, create new feature
      if (!featureID && !feature.match(/^(HODGE-|[A-Z]+-|#|!)\d+/)) {
        // It's a new feature name, create it
        featureID = await this.idManager.createFeature(feature);
        featureName = featureID.localID;
        this.logger.info(chalk.green(`✓ Created new feature: ${featureID.localID}`));
        this.logger.info('Created new feature', { featureID: featureID.localID, name: feature });
        // Update PM tracking - mark as exploring at START of phase (fire-and-forget for performance)
        this.pmHooks.onExplore(featureID.localID, feature).catch(() => {
          // Silently handle PM update failures
        });
      } else if (!featureID) {
        // It looks like an ID but we couldn't find it
        // Create a new feature and link it if it's an external ID
        if (feature.startsWith('HODGE-')) {
          const error = new Error(`Feature not found: ${feature}`);
          this.logger.error('Feature not found', { error, feature });
          this.logger.error(chalk.red(`❌ Feature ${feature} not found`));
          return;
        } else {
          // External ID - create new feature and link it
          const newFeature = await this.idManager.createFeature(feature);
          featureID = await this.idManager.linkExternalID(newFeature.localID, feature);
          featureName = featureID.localID;
          this.logger.info(
            chalk.green(`✓ Created new feature ${featureID.localID} linked to ${feature}`)
          );
          this.logger.info('Created linked feature', {
            localID: featureID.localID,
            externalID: feature,
          });
          // Update PM tracking - mark as exploring at START of phase (fire-and-forget for performance)
          this.pmHooks.onExplore(featureID.localID, feature).catch(() => {
            // Silently handle PM update failures
          });
        }
      } else {
        // Found existing feature
        featureName = featureID.localID;
        // Update PM tracking - mark as exploring at START of phase (fire-and-forget for performance)
        this.pmHooks.onExplore(featureID.localID).catch(() => {
          // Silently handle PM update failures
        });
        if (featureID.externalID) {
          this.logger.info('Using existing feature with external ID', {
            localID: featureID.localID,
            externalID: featureID.externalID,
          });
          this.logger.info(
            chalk.blue(`ℹ️  Using existing feature ${featureID.localID} (${featureID.externalID})`)
          );
        } else {
          this.logger.info(chalk.blue(`ℹ️  Using existing feature ${featureID.localID}`));
        }
      }
    }

    // Handle from-spec mode (new approach)
    if (options.fromSpec) {
      this.logger.info(chalk.cyan('🔍 Creating feature from specification'));

      const specLoader = new FeatureSpecLoader();
      const spec = await specLoader.loadSpec(options.fromSpec);

      // Override feature name from spec if provided
      if (spec.feature.name && spec.feature.name !== featureName) {
        this.logger.info(chalk.yellow(`Note: Using feature name from spec: ${spec.feature.name}`));
        featureName = spec.feature.name;
      }

      const populator = new FeaturePopulator();
      const decisions = specLoader.extractDecisions(spec);
      const metadata = specLoader.toPopulatorMetadata(spec);

      await populator.populateFromDecisions(featureName, decisions, metadata);

      // Update session context
      await sessionManager.updateContext(featureName, 'explore');
      await sessionManager.suggestNext('Complete exploration and make decisions');

      this.logger.info(chalk.green('\n✓ Feature created from specification'));
      this.logger.info(chalk.gray(`  Spec file retained: ${options.fromSpec}`));
      this.logger.info(
        chalk.gray(`  Review: .hodge/features/${featureName}/explore/exploration.md`)
      );
      return;
    }

    // Handle pre-populate mode (legacy approach)
    if (options.prePopulate) {
      this.logger.info(chalk.cyan('🔍 Pre-populating feature from decisions'));
      const populator = new FeaturePopulator();
      await populator.populateFromDecisions(featureName, options.decisions || []);

      // Update session context
      await sessionManager.updateContext(featureName, 'explore');
      await sessionManager.suggestNext('Complete exploration and make decisions');

      this.logger.info(chalk.green('\n✓ Feature pre-populated and ready for exploration'));
      this.logger.info(
        chalk.gray(`  Review: .hodge/features/${featureName}/explore/exploration.md`)
      );
      return;
    }

    this.logger.info(chalk.cyan('🔍 Entering Explore Mode (Enhanced)'));
    this.logger.info(chalk.gray(`Feature: ${featureName}\n`));

    // Display AI context
    this.displayAIContext(featureName);

    const exploreDir = path.join('.hodge', 'features', featureName, 'explore');

    // Parallel operations for maximum performance
    const [
      existingCheck,
      projectContext,
      featureIntent,
      similarFeatures,
      pmIssue,
      existingPatterns,
    ] = await Promise.all([
      this.checkExistingExploration(exploreDir, options.force),
      this.loadProjectContext(),
      this.analyzeFeatureIntent(featureName),
      this.findSimilarFeatures(featureName),
      featureID?.externalID
        ? Promise.resolve({
            id: featureID.externalID,
            title: `Feature ${featureName}`,
            url: `#${featureID.externalID}`,
          })
        : this.checkPMIntegration(featureName),
      this.patternLearner.loadExistingPatterns(),
    ]);

    // Early return if exploration exists and not forcing
    if (existingCheck.exists && !options.force) {
      return;
    }

    // Generate smart template based on all context
    const smartTemplate = this.generateSmartTemplate(
      featureName,
      featureIntent,
      similarFeatures,
      existingPatterns.map((p) => ({
        name: p.name,
        description: p.description,
        confidence: p.frequency / 100,
      })),
      projectContext,
      pmIssue
    );

    // Create exploration structure in parallel
    await this.createExplorationStructure(
      featureName,
      exploreDir,
      smartTemplate,
      featureIntent,
      pmIssue,
      featureID
    );

    // Display exploration guidance
    this.displayExplorationGuidance(
      featureName,
      smartTemplate,
      similarFeatures,
      existingPatterns.map((p) => ({
        name: p.name,
        description: p.description,
        confidence: p.frequency / 100,
      }))
    );

    // Save session checkpoint
    await sessionManager.updateContext(featureName, 'explore');
    await sessionManager.addCommand(`hodge explore ${featureName}`);
    await sessionManager.setSummary(
      `Explored ${featureName} - template ready for AI approach generation`
    );
    await sessionManager.suggestNext(`Review exploration and decide with 'hodge decide'`);

    // Update context manager for context-aware commands
    await contextManager.updateForCommand('explore', featureName, 'explore');

    // Performance report
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (process.env.DEBUG || options.verbose) {
      this.logger.info(chalk.gray(`\n⚡ Execution time: ${executionTime}ms`));
      const stats = this.cache.getStats();
      this.logger.info(
        chalk.gray(
          `📊 Cache: ${stats.hits} hits, ${stats.misses} misses (${(stats.hitRate * 100).toFixed(1)}% hit rate)`
        )
      );
    }
  }

  /**
   * HODGE-053: Detect if input is a feature ID or a topic
   * Rules:
   * - Quoted strings → topic
   * - Pattern: any-chars-123 (non-space chars, hyphen, numbers) → feature
   * - Natural language (contains spaces, no pattern match) → topic
   */
  private detectInputType(input: string): 'feature' | 'topic' {
    // Remove surrounding quotes if present for detection
    const trimmed = input.trim();

    // Rule 1: Quoted strings are always topics
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return 'topic';
    }

    // Rule 2: Feature pattern - any non-space chars, hyphen, numbers
    // Examples: HODGE-053, auth-123, feature-1, ABC-999
    const featurePattern = /^[^\s]+-\d+$/;
    if (featurePattern.test(trimmed)) {
      return 'feature';
    }

    // Rule 3: Hash or exclamation patterns for external IDs
    if (/^[#!]\d+$/.test(trimmed)) {
      return 'feature';
    }

    // Rule 4: Everything else is a topic (natural language, spaces, etc.)
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
   * Check for existing exploration with caching
   */
  private async checkExistingExploration(
    exploreDir: string,
    force?: boolean
  ): Promise<{ exists: boolean; content?: string }> {
    const exists = await this.cache.getOrLoad(
      `exists:${exploreDir}`,
      () => Promise.resolve(existsSync(exploreDir)),
      { ttl: 1000 }
    );

    if (exists && !force) {
      this.logger.info(chalk.yellow('⚠️  Exploration already exists for this feature.'));
      this.logger.info(
        chalk.gray(`   Use --force to overwrite or review existing exploration at:`)
      );
      this.logger.info(chalk.gray(`   ${exploreDir}\n`));

      const explorationPath = path.join(exploreDir, 'exploration.md');
      const content = await this.cache.getOrLoad(`file:${explorationPath}`, async () => {
        try {
          return await fs.readFile(explorationPath, 'utf-8');
        } catch {
          return null;
        }
      });

      if (content && typeof content === 'string') {
        const lines = content.split('\n').slice(0, 10);
        this.logger.info(chalk.dim('--- Existing Exploration Preview ---'));
        this.logger.info(chalk.dim(lines.join('\n')));
        this.logger.info(chalk.dim('...\n'));
      }

      return { exists: true, content: content || undefined };
    }

    return { exists: false };
  }

  /**
   * Analyze feature intent using AI-like pattern matching
   */
  private async analyzeFeatureIntent(feature: string): Promise<FeatureIntent> {
    return this.cache.getOrLoad(
      `intent:${feature}`,
      () =>
        Promise.resolve(
          (function () {
            const intents: Record<string, FeatureIntent> = {
              auth: {
                type: 'authentication',
                keywords: ['login', 'logout', 'session', 'token', 'jwt', 'oauth'],
                suggestedPatterns: ['singleton-auth', 'middleware', 'token-manager'],
                relatedCommands: ['login', 'logout', 'verify', 'refresh'],
              },
              api: {
                type: 'api-endpoint',
                keywords: ['REST', 'GraphQL', 'endpoint', 'route', 'controller'],
                suggestedPatterns: ['controller', 'router', 'validation', 'error-handler'],
                relatedCommands: ['get', 'post', 'put', 'delete', 'patch'],
              },
              cache: {
                type: 'caching',
                keywords: ['cache', 'memoize', 'store', 'ttl', 'invalidate'],
                suggestedPatterns: ['singleton-cache', 'cache-manager', 'lazy-loading'],
                relatedCommands: ['get', 'set', 'invalidate', 'clear'],
              },
              perf: {
                type: 'performance',
                keywords: ['optimization', 'speed', 'parallel', 'async', 'profiling'],
                suggestedPatterns: ['async-parallel', 'caching', 'lazy-loading'],
                relatedCommands: ['profile', 'benchmark', 'optimize'],
              },
              test: {
                type: 'testing',
                keywords: ['unit', 'integration', 'mock', 'coverage', 'vitest'],
                suggestedPatterns: ['test-factory', 'mock-builder', 'fixture'],
                relatedCommands: ['test', 'mock', 'assert', 'coverage'],
              },
            };

            const featureLower = feature.toLowerCase();
            for (const [key, intent] of Object.entries(intents)) {
              if (featureLower.includes(key)) {
                return intent;
              }
            }

            // Default intent
            return {
              type: 'general',
              keywords: [feature],
              suggestedPatterns: ['service', 'utility', 'factory'],
              relatedCommands: ['execute', 'process', 'handle'],
            };
          })()
        ),
      { ttl: 60000 } // Cache for 1 minute
    );
  }

  /**
   * Find similar features using pattern matching
   */
  private async findSimilarFeatures(feature: string): Promise<string[]> {
    const allFeatures = await this.featureCache.loadAllFeatures();

    const similarities = Array.from(allFeatures.keys()).map((f) => ({
      feature: f,
      score: this.calculateSimilarity(feature, f),
    }));

    return similarities
      .filter((s) => s.score > 0.3 && s.feature !== feature)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.feature);
  }

  /**
   * Calculate similarity between feature names
   */
  private calculateSimilarity(a: string, b: string): number {
    const aTokens = a.toLowerCase().split(/[-_\s]+/);
    const bTokens = b.toLowerCase().split(/[-_\s]+/);

    const commonTokens = aTokens.filter((t) => bTokens.includes(t));
    return (commonTokens.length * 2) / (aTokens.length + bTokens.length);
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
    const standardsPromise = this.standardsCache.loadStandards();
    const patternsPromise = this.standardsCache.loadPatterns();
    const configPromise = this.standardsCache.loadConfig();

    const [standards, patterns, config] = await Promise.all([
      standardsPromise,
      patternsPromise,
      configPromise,
    ]);

    return {
      hasStandards: !!standards,
      patternCount: patterns.size ?? 0,
      patterns: patterns ? Array.from(patterns.keys()) : [],
      config: (config as Record<string, unknown>) ?? null,
    };
  }

  /**
   * Check PM integration
   */
  private async checkPMIntegration(
    feature: string
  ): Promise<{ id: string; title: string; url: string } | null> {
    const pmTool = process.env.HODGE_PM_TOOL;

    if (!pmTool) {
      return null;
    }

    this.logger.info(chalk.blue(`📋 Checking ${pmTool} for issue ${feature}...`));

    // Save issue ID for future reference
    const issueIdFile = path.join('.hodge', 'features', feature, 'issue-id.txt');
    await fs.mkdir(path.dirname(issueIdFile), { recursive: true });
    await fs.writeFile(issueIdFile, feature);

    this.logger.info(chalk.green(`✓ Linked to ${pmTool} issue: ${feature}`));

    return { id: feature, title: `${pmTool} issue`, url: '#' };
  }

  /**
   * Generate smart template based on context
   */
  private generateSmartTemplate(
    feature: string,
    intent: FeatureIntent,
    similarFeatures: string[],
    _existingPatterns: Array<{ name: string; description: string; confidence: number }>,
    projectContext: {
      hasStandards: boolean;
      patternCount: number;
      patterns: string[];
      config: Record<string, unknown> | null;
    },
    pmIssue: { id: string; title: string; url: string } | null
  ): SmartTemplate {
    // CLI does not generate approaches - that's the AI's job
    const approaches: Approach[] = [];

    // Find patterns that match this feature type
    const suggestedPatterns = _existingPatterns
      .filter((p) => intent.suggestedPatterns.some((sp) => p.name.toLowerCase().includes(sp)))
      .map((p) => p.name);

    // Generate minimal template content - AI will fill in approaches
    const content = `# Exploration: ${feature}

## Feature Overview
${pmIssue ? `**PM Issue**: ${pmIssue.id}` : ''}
**Type**: ${intent.type}
**Created**: ${new Date().toISOString()}

## Context
- **Standards**: ${projectContext.hasStandards ? 'Loaded (suggested only)' : 'Not enforced'}
- **Available Patterns**: ${projectContext.patternCount}

- **Similar Features**: ${similarFeatures.length > 0 ? similarFeatures.join(', ') : 'None found'}
- **Relevant Patterns**: ${suggestedPatterns.length > 0 ? suggestedPatterns.join(', ') : 'None identified'}

## Implementation Approaches
<!-- AI will generate 2-3 approaches here -->

## Recommendation
<!-- AI will provide recommendation -->

## Decisions Needed
<!-- AI will list decisions for /decide command -->

## Next Steps
- [ ] Review exploration findings
- [ ] Use \`/decide\` to make implementation decisions
- [ ] Proceed to \`/build ${feature}\`

---
*Template created: ${new Date().toISOString()}*
*AI exploration to follow*
`;

    return {
      content,
      approaches,
      relatedFeatures: similarFeatures,
      suggestedPatterns,
    };
  }

  // Removed generateApproaches method - AI handles approach generation, not CLI

  // Removed generateImplementationHints - AI provides implementation guidance

  /**
   * Create exploration structure
   */
  private async createExplorationStructure(
    feature: string,
    exploreDir: string,
    template: SmartTemplate,
    intent: FeatureIntent,
    pmIssue: { id: string; title: string; url: string } | null,
    _featureID: FeatureID | null = null
  ): Promise<void> {
    // Create directory
    await fs.mkdir(exploreDir, { recursive: true });

    // Generate test intentions based on feature intent
    const testIntentions = this.generateTestIntentions(feature, intent);

    // Create all files in parallel
    await Promise.all(
      [
        fs.writeFile(path.join(exploreDir, 'exploration.md'), template.content),
        fs.writeFile(path.join(exploreDir, 'test-intentions.md'), testIntentions),
        pmIssue
          ? fs.writeFile(path.join('.hodge', 'features', feature, 'issue-id.txt'), pmIssue.id)
          : Promise.resolve(),
      ].filter(Boolean)
    );

    // Invalidate cache for this feature
    this.cache.invalidateFeature(feature);
  }

  /**
   * Generate test intentions based on feature and intent
   */
  private generateTestIntentions(feature: string, intent: FeatureIntent): string {
    const baseIntentions = [
      '- [ ] Should not crash when executed',
      '- [ ] Should complete within reasonable time (<500ms)',
      '- [ ] Should handle invalid input gracefully',
      '- [ ] Should integrate with existing systems',
    ];

    const intentSpecific: Record<string, string[]> = {
      authentication: [
        '- [ ] Should handle login/logout correctly',
        '- [ ] Should manage sessions securely',
        '- [ ] Should validate tokens properly',
        '- [ ] Should handle authorization failures gracefully',
      ],
      database: [
        '- [ ] Should handle connections properly',
        '- [ ] Should manage transactions correctly',
        '- [ ] Should handle query errors gracefully',
        '- [ ] Should optimize for performance',
      ],
      api: [
        '- [ ] Should validate request data',
        '- [ ] Should return appropriate status codes',
        '- [ ] Should handle errors consistently',
        '- [ ] Should follow REST/GraphQL conventions',
      ],
      'api-endpoint': [
        '- [ ] Should validate request data',
        '- [ ] Should return appropriate status codes',
        '- [ ] Should handle errors consistently',
        '- [ ] Should follow REST/GraphQL conventions',
      ],
      ui: [
        '- [ ] Should render without errors',
        '- [ ] Should be responsive across devices',
        '- [ ] Should handle user interactions correctly',
        '- [ ] Should provide appropriate feedback',
      ],
      caching: [
        '- [ ] Should store and retrieve data correctly',
        '- [ ] Should respect TTL settings',
        '- [ ] Should handle cache invalidation',
        '- [ ] Should handle cache misses gracefully',
      ],
      performance: [
        '- [ ] Should improve targeted metrics',
        '- [ ] Should not degrade other performance areas',
        '- [ ] Should be measurable and reproducible',
        '- [ ] Should work under various load conditions',
      ],
      testing: [
        '- [ ] Should cover critical paths',
        '- [ ] Should run quickly and reliably',
        '- [ ] Should use appropriate test doubles',
        '- [ ] Should follow testing best practices',
      ],
      general: [
        '- [ ] Should provide the intended functionality',
        '- [ ] Should integrate with existing code',
        '- [ ] Should handle errors appropriately',
        '- [ ] Should be maintainable and documented',
      ],
      maintenance: [
        '- [ ] Should update dependencies safely',
        '- [ ] Should not break compatibility',
        '- [ ] Should improve maintainability',
        '- [ ] Should be well-documented',
      ],
    };

    const approachIntentions = [
      '- [ ] Selected implementation approach should work correctly',
      '- [ ] Solution integrates well with existing codebase',
    ];

    return `# Test Intentions for ${feature}

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
${baseIntentions.join('\n')}

## ${intent.type.charAt(0).toUpperCase() + intent.type.slice(1)}-Specific Requirements
${intentSpecific[intent.type].join('\n') || intentSpecific.general.join('\n')}

## Approach-Specific Tests
${approachIntentions.join('\n')}

## Integration Tests
- [ ] Should work with current authentication system
- [ ] Should respect user permissions
- [ ] Should handle database transactions properly
- [ ] Should emit appropriate events/logs

## Performance Criteria
- [ ] Response time < 200ms for typical operations
- [ ] Memory usage should not increase significantly
- [ ] Should handle concurrent operations
- [ ] Should scale to expected load

## User Experience
- [ ] Should provide clear error messages
- [ ] Should have appropriate loading states
- [ ] Should be intuitive to use
- [ ] Should work across supported browsers/platforms

## Notes
Add any specific test scenarios or edge cases discovered during exploration:

-
-
-

---
*Generated during exploration phase. Convert to actual tests during build phase.*`;
  }

  /**
   * Display exploration guidance
   */
  private displayExplorationGuidance(
    feature: string,
    template: SmartTemplate,
    similarFeatures: string[],
    _patterns: Array<{ name: string; description: string; confidence: number }>
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

    this.logger.info('\n' + chalk.bold('Exploration Structure Created:'));
    this.logger.info(chalk.cyan('  Template ready for AI exploration'));

    this.logger.info('\n' + chalk.bold('Files created:'));
    this.logger.info(chalk.gray(`  • .hodge/features/${feature}/explore/exploration.md`));

    this.logger.info('\n' + chalk.bold('Next steps:'));
    this.logger.info(`  1. Review the AI-generated exploration`);
    this.logger.info('  2. Generate and review implementation approaches');
    this.logger.info('  3. Use ' + chalk.cyan('`/decide`') + ' to choose an approach');
    this.logger.info('  4. Then ' + chalk.cyan(`\`/build ${feature}\``) + ' to implement\n');

    this.logger.info(chalk.dim(`Exploration saved to: .hodge/features/${feature}/explore`));
  }
}

// Export alias for backward compatibility
export { ExploreCommand as EnhancedExploreCommand };
