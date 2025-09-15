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

export interface ExploreOptions {
  force?: boolean;
  verbose?: boolean;
}

interface FeatureIntent {
  type: string;
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
 * Enhanced Explore Command with AI and caching
 */
export class EnhancedExploreCommand {
  private cache = cacheManager;
  private featureStateCache = featureCache;
  private standardsCache = standardsCache;
  private patternLearner = new PatternLearner();

  async execute(feature: string, options: ExploreOptions = {}): Promise<void> {
    const startTime = Date.now();

    console.log(chalk.cyan('🔍 Entering Explore Mode (Enhanced)'));
    console.log(chalk.gray(`Feature: ${feature}\n`));

    // Display AI context
    this.displayAIContext(feature);

    const exploreDir = path.join('.hodge', 'features', feature, 'explore');

    // Parallel operations for maximum performance
    const [
      existingCheck,
      projectContext,
      featureIntent,
      similarFeatures,
      pmIssue,
      existingPatterns
    ] = await Promise.all([
      this.checkExistingExploration(exploreDir, options.force),
      this.loadProjectContext(),
      this.analyzeFeatureIntent(feature),
      this.findSimilarFeatures(feature),
      this.checkPMIntegration(feature),
      this.patternLearner.loadExistingPatterns()
    ]);

    // Early return if exploration exists and not forcing
    if (existingCheck.exists && !options.force) {
      return;
    }

    // Generate smart template based on all context
    const smartTemplate = await this.generateSmartTemplate(
      feature,
      featureIntent,
      similarFeatures,
      existingPatterns,
      projectContext,
      pmIssue
    );

    // Create exploration structure in parallel
    await this.createExplorationStructure(
      feature,
      exploreDir,
      smartTemplate,
      featureIntent,
      pmIssue
    );

    // Display exploration guidance
    this.displayExplorationGuidance(
      feature,
      smartTemplate,
      similarFeatures,
      existingPatterns
    );

    // Performance report
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (process.env.DEBUG || options.verbose) {
      console.log(chalk.gray(`\n⚡ Execution time: ${executionTime}ms`));
      const stats = this.cache.getStats();
      console.log(chalk.gray(`📊 Cache: ${stats.hits} hits, ${stats.misses} misses (${(stats.hitRate * 100).toFixed(1)}% hit rate)`));
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
      async () => existsSync(exploreDir),
      { ttl: 1000 }
    );

    if (exists && !force) {
      console.log(chalk.yellow('⚠️  Exploration already exists for this feature.'));
      console.log(chalk.gray(`   Use --force to overwrite or review existing exploration at:`));
      console.log(chalk.gray(`   ${exploreDir}\n`));

      const explorationPath = path.join(exploreDir, 'exploration.md');
      const content = await this.cache.getOrLoad(
        `file:${explorationPath}`,
        async () => {
          try {
            return await fs.readFile(explorationPath, 'utf-8');
          } catch {
            return null;
          }
        }
      );

      if (content) {
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
      async () => {
        const intents: Record<string, FeatureIntent> = {
          auth: {
            type: 'authentication',
            keywords: ['login', 'logout', 'session', 'token', 'jwt', 'oauth'],
            suggestedPatterns: ['singleton-auth', 'middleware', 'token-manager'],
            relatedCommands: ['login', 'logout', 'verify', 'refresh']
          },
          api: {
            type: 'api-endpoint',
            keywords: ['REST', 'GraphQL', 'endpoint', 'route', 'controller'],
            suggestedPatterns: ['controller', 'router', 'validation', 'error-handler'],
            relatedCommands: ['get', 'post', 'put', 'delete', 'patch']
          },
          cache: {
            type: 'caching',
            keywords: ['cache', 'memoize', 'store', 'ttl', 'invalidate'],
            suggestedPatterns: ['singleton-cache', 'cache-manager', 'lazy-loading'],
            relatedCommands: ['get', 'set', 'invalidate', 'clear']
          },
          perf: {
            type: 'performance',
            keywords: ['optimization', 'speed', 'parallel', 'async', 'profiling'],
            suggestedPatterns: ['async-parallel', 'caching', 'lazy-loading'],
            relatedCommands: ['profile', 'benchmark', 'optimize']
          },
          test: {
            type: 'testing',
            keywords: ['unit', 'integration', 'mock', 'coverage', 'vitest'],
            suggestedPatterns: ['test-factory', 'mock-builder', 'fixture'],
            relatedCommands: ['test', 'mock', 'assert', 'coverage']
          }
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
          relatedCommands: ['execute', 'process', 'handle']
        };
      },
      { ttl: 60000 } // Cache for 1 minute
    );
  }

  /**
   * Find similar features using pattern matching
   */
  private async findSimilarFeatures(feature: string): Promise<string[]> {
    const allFeatures = await this.featureStateCache.loadAllFeatures();

    const similarities = Array.from(allFeatures.keys()).map(f => ({
      feature: f,
      score: this.calculateSimilarity(feature, f)
    }));

    return similarities
      .filter(s => s.score > 0.3 && s.feature !== feature)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.feature);
  }

  /**
   * Calculate similarity between feature names
   */
  private calculateSimilarity(a: string, b: string): number {
    const aTokens = a.toLowerCase().split(/[-_\s]+/);
    const bTokens = b.toLowerCase().split(/[-_\s]+/);

    const commonTokens = aTokens.filter(t => bTokens.includes(t));
    return (commonTokens.length * 2) / (aTokens.length + bTokens.length);
  }

  /**
   * Load project context from cache
   */
  private async loadProjectContext(): Promise<any> {
    const [standards, patterns, config] = await Promise.all([
      this.standardsCache.loadStandards(),
      this.standardsCache.loadPatterns(),
      this.standardsCache.loadConfig()
    ]);

    return {
      hasStandards: !!standards,
      patternCount: patterns.size,
      patterns: Array.from(patterns.keys()),
      config
    };
  }

  /**
   * Check PM integration
   */
  private async checkPMIntegration(feature: string): Promise<any> {
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

    return { id: feature, tool: pmTool };
  }

  /**
   * Generate smart template based on context
   */
  private async generateSmartTemplate(
    feature: string,
    intent: FeatureIntent,
    similarFeatures: string[],
    _existingPatterns: any[],
    projectContext: any,
    pmIssue: any
  ): Promise<SmartTemplate> {
    // Generate intelligent approaches
    const approaches = this.generateApproaches(feature, intent, _existingPatterns);

    // Find patterns that match this feature type
    const suggestedPatterns = _existingPatterns
      .filter(p => intent.suggestedPatterns.some(sp => p.name.toLowerCase().includes(sp)))
      .map(p => p.name);

    // Generate template content
    const content = `# Exploration: ${feature}

## Feature Analysis
**Type**: ${intent.type}
**Keywords**: ${intent.keywords.join(', ')}
**Related Commands**: ${intent.relatedCommands.join(', ')}
${pmIssue ? `**PM Issue**: ${pmIssue.id} (${pmIssue.tool})` : ''}

## Context
- **Date**: ${new Date().toLocaleDateString()}
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (${projectContext.hasStandards ? 'loaded' : 'not enforced'})
- **Existing Patterns**: ${projectContext.patternCount}

${similarFeatures.length > 0 ? `
## Similar Features
${similarFeatures.map(f => `- ${f}`).join('\n')}
` : ''}

${suggestedPatterns.length > 0 ? `
## Suggested Patterns
${suggestedPatterns.map(p => `- ${p}`).join('\n')}
` : ''}

## Recommended Approaches

${approaches.map((approach, i) => `
### Approach ${i + 1}: ${approach.name} (${approach.relevance}% relevant)
**Description**: ${approach.description}

**Pros**:
${approach.pros.map(p => `- ${p}`).join('\n')}

**Cons**:
${approach.cons.map(c => `- ${c}`).join('\n')}
`).join('\n')}

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
      suggestedPatterns
    };
  }

  /**
   * Generate intelligent approaches
   */
  private generateApproaches(
    feature: string,
    intent: FeatureIntent,
    _existingPatterns: any[]
  ): Approach[] {
    const approaches: Approach[] = [];

    // Always include a standard approach
    approaches.push({
      name: 'Standard Implementation',
      description: `Implement ${feature} following existing project patterns`,
      relevance: 70,
      pros: [
        'Consistent with codebase',
        'Uses proven patterns',
        'Easy for team to understand'
      ],
      cons: [
        'May not be optimal for specific use case',
        'Could miss optimization opportunities'
      ]
    });

    // Add intent-specific approaches
    if (intent.type === 'performance' || feature.includes('optim')) {
      approaches.push({
        name: 'Performance-First Architecture',
        description: 'Optimize for speed with caching and parallelization',
        relevance: 95,
        pros: [
          'Maximum performance gains',
          'Reduced resource usage',
          'Better scalability'
        ],
        cons: [
          'Higher complexity',
          'More memory usage',
          'Harder to debug'
        ]
      });
    }

    if (intent.type === 'authentication') {
      approaches.push({
        name: 'Secure Token-Based Auth',
        description: 'JWT-based authentication with refresh tokens',
        relevance: 90,
        pros: [
          'Stateless and scalable',
          'Industry standard',
          'Works across services'
        ],
        cons: [
          'Token management complexity',
          'Need secure storage',
          'Revocation challenges'
        ]
      });
    }

    if (intent.type === 'caching') {
      approaches.push({
        name: 'Multi-Layer Cache Strategy',
        description: 'Memory cache with TTL and persistent fallback',
        relevance: 85,
        pros: [
          'Fast access times',
          'Automatic invalidation',
          'Resilient to failures'
        ],
        cons: [
          'Memory overhead',
          'Cache coherency challenges',
          'Complex invalidation logic'
        ]
      });
    }

    // Sort by relevance
    return approaches.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Generate implementation hints
   */
  private generateImplementationHints(intent: FeatureIntent, patterns: any[]): string {
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
    if (patterns.some(p => p.name.includes('Singleton'))) {
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
    pmIssue: any
  ): Promise<void> {
    // Create directory
    await fs.mkdir(exploreDir, { recursive: true });

    // Create all files in parallel
    await Promise.all([
      fs.writeFile(path.join(exploreDir, 'exploration.md'), template.content),
      fs.writeFile(path.join(exploreDir, 'context.json'), JSON.stringify({
        mode: 'explore',
        feature,
        timestamp: new Date().toISOString(),
        intent,
        standards: 'suggested',
        validation: 'optional',
        pmIssue: pmIssue?.id || null,
        pmTool: pmIssue?.tool || null,
        approaches: template.approaches,
        relatedFeatures: template.relatedFeatures,
        suggestedPatterns: template.suggestedPatterns
      }, null, 2)),
      pmIssue ? fs.writeFile(
        path.join('.hodge', 'features', feature, 'issue-id.txt'),
        pmIssue.id
      ) : Promise.resolve()
    ].filter(Boolean));

    // Invalidate cache for this feature
    this.cache.invalidateFeature(feature);
  }

  /**
   * Display exploration guidance
   */
  private displayExplorationGuidance(
    feature: string,
    template: SmartTemplate,
    similarFeatures: string[],
    _patterns: any[]
  ): void {
    console.log(chalk.green('✓ Enhanced exploration environment created\n'));

    console.log(chalk.bold('AI Analysis:'));
    console.log(`  • Feature type detected: ${chalk.cyan(template.approaches[0].name)}`);
    console.log(`  • Relevance score: ${chalk.green(template.approaches[0].relevance + '%')}`);

    if (similarFeatures.length > 0) {
      console.log(`  • Similar features found: ${chalk.cyan(similarFeatures.length)}`);
      similarFeatures.forEach(f => console.log(chalk.gray(`    - ${f}`)));
    }

    if (template.suggestedPatterns.length > 0) {
      console.log(`  • Suggested patterns: ${chalk.green(template.suggestedPatterns.length)}`);
      template.suggestedPatterns.slice(0, 3).forEach(p => console.log(chalk.gray(`    - ${p}`)));
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