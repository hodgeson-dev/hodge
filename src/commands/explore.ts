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
import { sessionManager } from '../lib/session-manager.js';
import { FeaturePopulator } from '../lib/feature-populator.js';
import { FeatureSpecLoader } from '../lib/feature-spec-loader.js';
import { autoSave } from '../lib/auto-save.js';

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

  constructor(idManager?: IDManager) {
    this.idManager = idManager || new IDManager();
  }

  async execute(feature: string, options: ExploreOptions = {}): Promise<void> {
    const startTime = Date.now();

    // Auto-save context when switching features
    await autoSave.checkAndSave(feature);

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
        console.log(chalk.green(`✓ Created new feature: ${featureID.localID}`));
      } else if (!featureID) {
        // It looks like an ID but we couldn't find it
        // Create a new feature and link it if it's an external ID
        if (feature.startsWith('HODGE-')) {
          console.log(chalk.red(`❌ Feature ${feature} not found`));
          return;
        } else {
          // External ID - create new feature and link it
          const newFeature = await this.idManager.createFeature(feature);
          featureID = await this.idManager.linkExternalID(newFeature.localID, feature);
          featureName = featureID.localID;
          console.log(
            chalk.green(`✓ Created new feature ${featureID.localID} linked to ${feature}`)
          );
        }
      } else {
        // Found existing feature
        featureName = featureID.localID;
        if (featureID.externalID) {
          console.log(
            chalk.blue(`ℹ️  Using existing feature ${featureID.localID} (${featureID.externalID})`)
          );
        } else {
          console.log(chalk.blue(`ℹ️  Using existing feature ${featureID.localID}`));
        }
      }
    }

    // Handle from-spec mode (new approach)
    if (options.fromSpec) {
      console.log(chalk.cyan('🔍 Creating feature from specification'));

      const specLoader = new FeatureSpecLoader();
      const spec = await specLoader.loadSpec(options.fromSpec);

      // Override feature name from spec if provided
      if (spec.feature.name && spec.feature.name !== featureName) {
        console.log(chalk.yellow(`Note: Using feature name from spec: ${spec.feature.name}`));
        featureName = spec.feature.name;
      }

      const populator = new FeaturePopulator();
      const decisions = specLoader.extractDecisions(spec);
      const metadata = specLoader.toPopulatorMetadata(spec);

      await populator.populateFromDecisions(featureName, decisions, metadata);

      // Update session context
      await sessionManager.updateContext(featureName, 'explore');
      await sessionManager.suggestNext('Complete exploration and make decisions');

      console.log(chalk.green('\n✓ Feature created from specification'));
      console.log(chalk.gray(`  Spec file retained: ${options.fromSpec}`));
      console.log(chalk.gray(`  Review: .hodge/features/${featureName}/explore/exploration.md`));
      return;
    }

    // Handle pre-populate mode (legacy approach)
    if (options.prePopulate) {
      console.log(chalk.cyan('🔍 Pre-populating feature from decisions'));
      const populator = new FeaturePopulator();
      await populator.populateFromDecisions(featureName, options.decisions || []);

      // Update session context
      await sessionManager.updateContext(featureName, 'explore');
      await sessionManager.suggestNext('Complete exploration and make decisions');

      console.log(chalk.green('\n✓ Feature pre-populated and ready for exploration'));
      console.log(chalk.gray(`  Review: .hodge/features/${featureName}/explore/exploration.md`));
      return;
    }

    console.log(chalk.cyan('🔍 Entering Explore Mode (Enhanced)'));
    console.log(chalk.gray(`Feature: ${featureName}\n`));

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
      `Explored ${featureName} with ${smartTemplate.approaches.length} approaches`
    );
    await sessionManager.suggestNext(`Review exploration and decide with 'hodge decide'`);

    // Performance report
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (process.env.DEBUG || options.verbose) {
      console.log(chalk.gray(`\n⚡ Execution time: ${executionTime}ms`));
      const stats = this.cache.getStats();
      console.log(
        chalk.gray(
          `📊 Cache: ${stats.hits} hits, ${stats.misses} misses (${(stats.hitRate * 100).toFixed(1)}% hit rate)`
        )
      );
    }
  }

  /**
   * Display AI context header
   */
  private displayAIContext(feature: string): void {
    console.log(chalk.bold('═'.repeat(60)));
    console.log(chalk.cyan.bold('AI CONTEXT UPDATE:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`You are now in ${chalk.cyan.bold('EXPLORATION MODE')} for: ${feature}`);
    console.log('\nGuidelines for AI assistance:');
    console.log('• Suggest multiple approaches and alternatives');
    console.log('• Standards are suggestions only, not requirements');
    console.log('• Encourage experimentation and learning');
    console.log('• Focus on discovery over perfection');
    console.log(chalk.bold('═'.repeat(60)) + '\n');
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
      console.log(chalk.yellow('⚠️  Exploration already exists for this feature.'));
      console.log(chalk.gray(`   Use --force to overwrite or review existing exploration at:`));
      console.log(chalk.gray(`   ${exploreDir}\n`));

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
        console.log(chalk.dim('--- Existing Exploration Preview ---'));
        console.log(chalk.dim(lines.join('\n')));
        console.log(chalk.dim('...\n'));
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

    console.log(chalk.blue(`📋 Checking ${pmTool} for issue ${feature}...`));

    // Save issue ID for future reference
    const issueIdFile = path.join('.hodge', 'features', feature, 'issue-id.txt');
    await fs.mkdir(path.dirname(issueIdFile), { recursive: true });
    await fs.writeFile(issueIdFile, feature);

    console.log(chalk.green(`✓ Linked to ${pmTool} issue: ${feature}`));

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
    // Generate intelligent approaches
    const approaches = this.generateApproaches(feature, intent, _existingPatterns);

    // Find patterns that match this feature type
    const suggestedPatterns = _existingPatterns
      .filter((p) => intent.suggestedPatterns.some((sp) => p.name.toLowerCase().includes(sp)))
      .map((p) => p.name);

    // Generate template content
    const content = `# Exploration: ${feature}

## Feature Analysis
**Type**: ${intent.type}
**Keywords**: ${intent.keywords.join(', ')}
**Related Commands**: ${intent.relatedCommands.join(', ')}
${pmIssue ? `**PM Issue**: ${pmIssue.id}` : ''}

## Context
- **Date**: ${new Date().toLocaleDateString()}
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (${projectContext.hasStandards ? 'loaded' : 'not enforced'})
- **Existing Patterns**: ${projectContext.patternCount}

${
  similarFeatures.length > 0
    ? `
## Similar Features
${similarFeatures.map((f) => `- ${f}`).join('\n')}
`
    : ''
}

${
  suggestedPatterns.length > 0
    ? `
## Suggested Patterns
${suggestedPatterns.map((p) => `- ${p}`).join('\n')}
`
    : ''
}

## Recommended Approaches

${approaches
  .map(
    (approach, i) => `
### Approach ${i + 1}: ${approach.name} (${approach.relevance}% relevant)
**Description**: ${approach.description}

**Pros**:
${approach.pros.map((p) => `- ${p}`).join('\n')}

**Cons**:
${approach.cons.map((c) => `- ${c}`).join('\n')}
`
  )
  .join('\n')}

## Recommendation
Based on the analysis, **${approaches[0].name}** appears most suitable because:
- Highest relevance score (${approaches[0].relevance}%)
- Aligns with detected intent (${intent.type})
${suggestedPatterns.length > 0 ? `- Can reuse existing patterns: ${suggestedPatterns[0]}` : ''}

## Implementation Hints
${this.generateImplementationHints(intent, _existingPatterns)}

## Next Steps
- [ ] Review the recommended approaches
- [ ] Consider similar features for inspiration
- [ ] Make decision with \`/decide\`
- [ ] Proceed to \`/build ${feature}\`

---
*Generated with AI-enhanced exploration (${new Date().toISOString()})*
`;

    return {
      content,
      approaches,
      relatedFeatures: similarFeatures,
      suggestedPatterns,
    };
  }

  /**
   * Generate intelligent approaches
   */
  private generateApproaches(
    feature: string,
    intent: FeatureIntent,
    _existingPatterns: Array<{ name: string; description: string; confidence: number }>
  ): Approach[] {
    const approaches: Approach[] = [];

    // Always include a standard approach
    approaches.push({
      name: 'Standard Implementation',
      description: `Implement ${feature} following existing project patterns`,
      relevance: 70,
      pros: ['Consistent with codebase', 'Uses proven patterns', 'Easy for team to understand'],
      cons: ['May not be optimal for specific use case', 'Could miss optimization opportunities'],
    });

    // Add intent-specific approaches
    if (intent.type === 'performance' || feature.includes('optim')) {
      approaches.push({
        name: 'Performance-First Architecture',
        description: 'Optimize for speed with caching and parallelization',
        relevance: 95,
        pros: ['Maximum performance gains', 'Reduced resource usage', 'Better scalability'],
        cons: ['Higher complexity', 'More memory usage', 'Harder to debug'],
      });
    }

    if (intent.type === 'authentication') {
      approaches.push({
        name: 'Secure Token-Based Auth',
        description: 'JWT-based authentication with refresh tokens',
        relevance: 90,
        pros: ['Stateless and scalable', 'Industry standard', 'Works across services'],
        cons: ['Token management complexity', 'Need secure storage', 'Revocation challenges'],
      });
    }

    if (intent.type === 'caching') {
      approaches.push({
        name: 'Multi-Layer Cache Strategy',
        description: 'Memory cache with TTL and persistent fallback',
        relevance: 85,
        pros: ['Fast access times', 'Automatic invalidation', 'Resilient to failures'],
        cons: ['Memory overhead', 'Cache coherency challenges', 'Complex invalidation logic'],
      });
    }

    // Sort by relevance
    return approaches.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Generate implementation hints
   */
  private generateImplementationHints(
    intent: FeatureIntent,
    patterns: Array<{ name: string; description: string; confidence: number }>
  ): string {
    const hints: string[] = [];

    // Intent-specific hints
    switch (intent.type) {
      case 'performance':
        hints.push('- Use Promise.all() for parallel operations');
        hints.push('- Implement caching with TTL');
        hints.push('- Consider lazy loading strategies');
        break;
      case 'authentication':
        hints.push('- Store tokens securely (never in localStorage for sensitive data)');
        hints.push('- Implement token refresh logic');
        hints.push('- Add rate limiting for login attempts');
        break;
      case 'caching':
        hints.push('- Define clear TTL strategies');
        hints.push('- Implement cache invalidation hooks');
        hints.push('- Monitor cache hit rates');
        break;
      default:
        hints.push('- Follow existing code patterns');
        hints.push('- Add comprehensive error handling');
        hints.push('- Include unit tests');
    }

    // Add pattern-based hints
    if (patterns.some((p) => p.name.includes('Singleton'))) {
      hints.push('- Consider using Singleton pattern (already in codebase)');
    }

    return hints.join('\n');
  }

  /**
   * Create exploration structure
   */
  private async createExplorationStructure(
    feature: string,
    exploreDir: string,
    template: SmartTemplate,
    intent: FeatureIntent,
    pmIssue: { id: string; title: string; url: string } | null,
    featureID: FeatureID | null = null
  ): Promise<void> {
    // Create directory
    await fs.mkdir(exploreDir, { recursive: true });

    // Generate test intentions based on feature intent
    const testIntentions = this.generateTestIntentions(feature, intent, template);

    // Create all files in parallel
    await Promise.all(
      [
        fs.writeFile(path.join(exploreDir, 'exploration.md'), template.content),
        fs.writeFile(path.join(exploreDir, 'test-intentions.md'), testIntentions),
        fs.writeFile(
          path.join(exploreDir, 'context.json'),
          JSON.stringify(
            {
              mode: 'explore',
              feature: feature,
              localID: featureID?.localID || feature,
              externalID: featureID?.externalID || null,
              timestamp: new Date().toISOString(),
              intent,
              standards: 'suggested',
              validation: 'optional',
              pmIssue: pmIssue?.id || featureID?.externalID || null,
              pmTool: featureID?.pmTool || null,
              approaches: template.approaches,
              relatedFeatures: template.relatedFeatures,
              suggestedPatterns: template.suggestedPatterns,
            },
            null,
            2
          )
        ),
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
  private generateTestIntentions(
    feature: string,
    intent: FeatureIntent,
    template: SmartTemplate
  ): string {
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

    const approachIntentions = template.approaches.map(
      (approach: Approach) => `- [ ] ${approach.name} approach should work correctly`
    );

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
    console.log(chalk.green('✓ Enhanced exploration environment created\n'));

    console.log(chalk.bold('AI Analysis:'));
    console.log(`  • Feature type detected: ${chalk.cyan(template.approaches[0].name)}`);
    console.log(`  • Relevance score: ${chalk.green(template.approaches[0].relevance + '%')}`);

    if (similarFeatures.length > 0) {
      console.log(`  • Similar features found: ${chalk.cyan(similarFeatures.length)}`);
      similarFeatures.forEach((f) => console.log(chalk.gray(`    - ${f}`)));
    }

    if (template.suggestedPatterns.length > 0) {
      console.log(`  • Suggested patterns: ${chalk.green(template.suggestedPatterns.length)}`);
      template.suggestedPatterns.slice(0, 3).forEach((p) => console.log(chalk.gray(`    - ${p}`)));
    }

    console.log('\n' + chalk.bold('Recommended Approach:'));
    console.log(`  ${chalk.cyan(template.approaches[0].name)}`);
    console.log(chalk.gray(`  ${template.approaches[0].description}`));

    console.log('\n' + chalk.bold('Files created:'));
    console.log(chalk.gray(`  • .hodge/features/${feature}/explore/exploration.md`));
    console.log(chalk.gray(`  • .hodge/features/${feature}/explore/context.json`));

    console.log('\n' + chalk.bold('Next steps:'));
    console.log(`  1. Review the AI-generated exploration`);
    console.log(`  2. Consider the ${template.approaches.length} suggested approaches`);
    console.log('  3. Use ' + chalk.cyan('`/decide`') + ' to choose an approach');
    console.log('  4. Then ' + chalk.cyan(`\`/build ${feature}\``) + ' to implement\n');

    console.log(chalk.dim(`Exploration saved to: .hodge/features/${feature}/explore`));
  }
}

// Export alias for backward compatibility
export { ExploreCommand as EnhancedExploreCommand };
