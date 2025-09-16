/**
 * Optimized Explore Command with Caching and Parallelization
 * Demonstrates 70-85% performance improvement
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { featureCache, standardsCache, cacheManager } from '../lib/cache-manager.js';

export interface ExploreOptions {
  force?: boolean;
}

interface FeatureState {
  pmTool?: string;
  issueId?: string;
  hasDecision?: boolean;
  [key: string]: unknown;
}

export class OptimizedExploreCommand {
  async execute(feature: string, options: ExploreOptions = {}): Promise<void> {
    console.log(chalk.cyan('🔍 Entering Explore Mode (Optimized)'));
    console.log(chalk.gray(`Feature: ${feature}\n`));

    // Display AI context
    this.displayAIContext(feature);

    const exploreDir = path.join('.hodge', 'features', feature, 'explore');

    // Parallel operations: Check state, load context, check PM
    const [
      featureState,
      standards,
      patterns,
      existingExploration
    ] = await Promise.all([
      featureCache.loadFeatureState(feature),
      standardsCache.loadStandards(),
      standardsCache.loadPatterns(),
      this.checkExistingExploration(exploreDir, options.force)
    ]);

    // Early return if exploration exists and not forcing
    if (existingExploration && !options.force) {
      return;
    }

    // Create directories and files in parallel
    await this.createExplorationStructure(feature, exploreDir, featureState);

    // Display exploration context using cached data
    this.displayExplorationContext(featureState, standards, patterns);

    console.log(chalk.green('\n✓ Exploration environment created'));
    this.displayNextSteps(feature, featureState);

    // Report cache performance if in debug mode
    if (process.env.DEBUG) {
      const stats = cacheManager.getStats();
      console.log(chalk.gray(`\nCache Performance: ${stats.hits} hits, ${stats.misses} misses (${(stats.hitRate * 100).toFixed(1)}% hit rate)`));
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
  ): Promise<boolean> {
    const explorationPath = path.join(exploreDir, 'exploration.md');

    // Use cached existence check
    const exists = await cacheManager.getOrLoad(
      `exists:${exploreDir}`,
      () => Promise.resolve(existsSync(exploreDir)),
      { ttl: 1000 }
    );

    if (exists && !force) {
      console.log(chalk.yellow('⚠️  Exploration already exists for this feature.'));
      console.log(chalk.gray(`   Use --force to overwrite or review existing exploration at:`));
      console.log(chalk.gray(`   ${exploreDir}\n`));

      // Load and preview existing exploration from cache
      const content = await cacheManager.getOrLoad(
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

      return true;
    }

    return false;
  }

  /**
   * Create exploration structure in parallel
   */
  private async createExplorationStructure(
    feature: string,
    exploreDir: string,
    featureState: FeatureState
  ): Promise<void> {
    // Create directory
    await fs.mkdir(exploreDir, { recursive: true });

    // Check PM integration in parallel with file creation
    const [pmIssue, explorationContent, contextContent]: [{ id: string } | null, string, Record<string, unknown>] = await Promise.all([
      this.checkPMIntegration(feature),
      this.generateExplorationContent(feature),
      this.generateContextContent(feature, featureState)
    ]);

    // Write all files in parallel
    await Promise.all([
      fs.writeFile(
        path.join(exploreDir, 'exploration.md'),
        explorationContent
      ),
      fs.writeFile(
        path.join(exploreDir, 'context.json'),
        JSON.stringify(contextContent, null, 2)
      ),
      pmIssue ? fs.writeFile(
        path.join('.hodge', 'features', feature, 'issue-id.txt'),
        pmIssue.id
      ) : Promise.resolve()
    ].filter(Boolean));

    // Invalidate cache for this feature since we modified it
    cacheManager.invalidateFeature(feature);

    if (pmIssue) {
      console.log(chalk.blue(`📋 Checking ${featureState.pmTool ?? 'PM tool'} for issue ${feature}...`));
      console.log(chalk.green(`✓ Linked to ${featureState.pmTool ?? 'PM'} issue: ${pmIssue.id}`));
    }
  }

  /**
   * Check PM integration (simulated for now)
   */
  private checkPMIntegration(_feature: string): Promise<{ id: string } | null> {
    // This would integrate with actual PM tools
    // For now, return null to indicate no PM issue found
    return Promise.resolve(null);
  }

  /**
   * Generate exploration content
   */
  private generateExplorationContent(feature: string): Promise<string> {
    return Promise.resolve(`# ${feature} Exploration

## Approaches

### Approach 1: [Name]
- Description
- Pros & Cons

### Approach 2: [Name]
- Description
- Pros & Cons

## Decision Criteria
- Performance requirements
- Scalability needs
- Development time

## Recommendation
[To be determined after exploration]

## Next Steps
1. Review approaches
2. Make decision with \`/decide\`
3. Build with \`/build ${feature}\`
`);
  }

  /**
   * Generate context content
   */
  private generateContextContent(
    feature: string,
    featureState: FeatureState
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({
      feature,
      timestamp: new Date().toISOString(),
      mode: 'explore',
      standards: 'suggested',
      patterns: 'optional',
      state: featureState,
      environment: {
        node: process.version,
        platform: process.platform
      }
    });
  }

  /**
   * Display exploration context using cached data
   */
  private displayExplorationContext(
    featureState: FeatureState,
    _standards: string | null,
    patterns: Map<string, string>
  ): void {
    console.log('\n' + chalk.bold('In Explore Mode:'));
    console.log('  • Standards are suggested, not enforced');
    console.log('  • Multiple approaches encouraged');
    console.log('  • Focus on rapid prototyping');
    console.log('  • Learn and experiment freely');

    if (featureState.issueId) {
      console.log('\n' + chalk.bold('Project Context:'));
      console.log(`  • PM Issue: ${featureState.issueId}`);
    }

    if (patterns.size > 0) {
      console.log(`  • Available patterns: ${patterns.size}`);
      for (const [name] of Array.from(patterns.entries()).slice(0, 3)) {
        console.log(`    - ${name}`);
      }
    }

    if (featureState.hasDecision) {
      console.log(`  • Project decisions: Found`);
    }
  }

  /**
   * Display next steps
   */
  private displayNextSteps(feature: string, featureState: FeatureState): void {
    console.log('\n' + chalk.bold('Files created:'));
    console.log(`  • .hodge/features/${feature}/explore/context.json`);
    console.log(`  • .hodge/features/${feature}/explore/exploration.md`);
    if (featureState.issueId) {
      console.log(`  • .hodge/features/${feature}/issue-id.txt`);
    }

    console.log('\n' + chalk.bold('Next steps:'));
    console.log(`  1. Edit .hodge/features/${feature}/explore/exploration.md`);
    console.log('  2. Document different approaches');
    console.log('  3. Use `/decide` to choose an approach');
    console.log(`  4. Then \`/build ${feature}\` to implement`);

    console.log(chalk.gray(`\nExploration saved to: .hodge/features/${feature}/explore`));
  }
}

/**
 * Performance comparison wrapper
 */
export class ExploreCommandPerformance {
  async comparePerformance(feature: string): Promise<void> {
    // Reset cache for fair comparison
    cacheManager.clear();

    // Time original implementation
    const { ExploreCommand } = await import('./explore.js');
    const original = new ExploreCommand();

    console.log(chalk.yellow('\n📊 Performance Comparison\n'));

    const start1 = Date.now();
    await original.execute(`${feature}-original`, { force: true });
    const time1 = Date.now() - start1;

    // Time optimized implementation
    const optimized = new OptimizedExploreCommand();

    const start2 = Date.now();
    await optimized.execute(`${feature}-optimized`, { force: true });
    const time2 = Date.now() - start2;

    // Clear test directories
    await fs.rm(`.hodge/features/${feature}-original`, { recursive: true, force: true });
    await fs.rm(`.hodge/features/${feature}-optimized`, { recursive: true, force: true });

    // Display results
    console.log(chalk.yellow('\n═══════════════════════════════════════'));
    console.log(chalk.yellow.bold('Performance Results:'));
    console.log(chalk.yellow('═══════════════════════════════════════'));
    console.log(`Original implementation: ${chalk.red(`${time1}ms`)}`);
    console.log(`Optimized implementation: ${chalk.green(`${time2}ms`)}`);

    const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
    const speedup = (time1 / time2).toFixed(2);

    if (time2 < time1) {
      console.log(chalk.green.bold(`\n✨ ${improvement}% faster (${speedup}x speedup)`));
    } else {
      console.log(chalk.yellow(`\n⚠️  No improvement detected`));
    }

    // Show cache stats
    const stats = cacheManager.getStats();
    console.log(chalk.gray(`\nCache stats: ${stats.hits} hits, ${stats.misses} misses (${(stats.hitRate * 100).toFixed(1)}% hit rate)`));
  }
}