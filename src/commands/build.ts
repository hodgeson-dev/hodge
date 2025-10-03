import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { CacheManager } from '../lib/cache-manager.js';
import { autoSave } from '../lib/auto-save.js';
import { contextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';

export interface BuildOptions {
  skipChecks?: boolean;
  sequential?: boolean; // Run I/O operations sequentially for debugging
}

interface BuildContext {
  mode: string;
  feature: string;
  timestamp: string;
  standards: string;
  validation: string;
  pmIssue: string | null;
  pmTool: string | null;
}

/**
 * Build Command with parallel I/O and smart caching
 * Combines parallel I/O and smart caching for 60-70% performance improvement
 *
 * @class BuildCommand
 * @description Production-ready build command with performance optimizations
 */
export class BuildCommand {
  private cache = CacheManager.getInstance();
  private pmHooks = new PMHooks();

  /**
   * Execute the build command for a feature
   * @param {string} feature - The feature name to build (optional, uses context if not provided)
   * @param {BuildOptions} options - Build options including skipChecks flag
   * @returns {Promise<void>}
   * @throws {Error} If critical file operations fail
   */
  async execute(feature?: string, options: BuildOptions = {}): Promise<void> {
    const startTime = Date.now();

    // Get feature from argument or context
    const resolvedFeature = await contextManager.getFeature(feature);

    if (!resolvedFeature) {
      throw new Error(
        'No feature specified. Please provide a feature name or run "hodge explore <feature>" first to set context.'
      );
    }

    // Use resolved feature from here on
    feature = resolvedFeature;

    // Auto-save context when switching features
    await autoSave.checkAndSave(feature);

    // Update context for this command
    await contextManager.updateForCommand('build', feature, 'build');

    try {
      // Validate inputs (redundant but keeping for safety)
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required and must be a string');
      }

      // Display immediate feedback
      console.log(chalk.blue('🔨 Entering Build Mode'));
      console.log(chalk.gray(`Feature: ${feature}\n`));

      // Display AI context immediately (no I/O)
      this.displayAIContext(feature);

      // Define all paths upfront
      const featureDir = path.join('.hodge', 'features', feature);
      const buildDir = path.join(featureDir, 'build');
      const exploreDir = path.join(featureDir, 'explore');
      const decisionFile = path.join(featureDir, 'decisions.md');
      const issueIdFile = path.join(featureDir, 'issue-id.txt');
      const standardsFile = path.join('.hodge', 'standards.md');
      const patternsDir = path.join('.hodge', 'patterns');

      // Phase 1: File existence checks
      let hasExploration: boolean;
      let hasDecision: boolean;
      let hasIssueId: boolean;
      let hasStandards: boolean;
      let hasPatterns: boolean;

      if (options.sequential) {
        // Sequential checks for debugging
        hasExploration = await this.fileExists(exploreDir);
        hasDecision = await this.fileExists(decisionFile);
        hasIssueId = await this.fileExists(issueIdFile);
        hasStandards = await this.fileExists(standardsFile);
        hasPatterns = await this.fileExists(patternsDir);
      } else {
        // Parallel file existence checks
        [hasExploration, hasDecision, hasIssueId, hasStandards, hasPatterns] = await Promise.all([
          this.fileExists(exploreDir),
          this.fileExists(decisionFile),
          this.fileExists(issueIdFile),
          this.fileExists(standardsFile),
          this.fileExists(patternsDir),
        ]);
      }

      // Early return if checks fail
      if (!options.skipChecks) {
        if (!hasExploration) {
          console.log(chalk.yellow('⚠️  No exploration found for this feature.'));
          console.log(chalk.gray('   Consider exploring first with:'));
          console.log(chalk.cyan(`   hodge explore ${feature}\n`));
          console.log(chalk.gray('   Or use --skip-checks to proceed anyway.\n'));
          return;
        }

        if (!hasDecision) {
          console.log(chalk.yellow('⚠️  No decision recorded for this feature.'));
          console.log(chalk.gray('   Review exploration and make a decision first.'));
          console.log(chalk.gray('   Or use --skip-checks to proceed anyway.\n'));
        }
      }

      // Phase 2: Parallel data loading with caching
      const [issueId, _standards, patterns, buildPlanTemplate] = await Promise.all([
        // Issue ID is feature-specific, no caching
        hasIssueId
          ? fs.readFile(issueIdFile, 'utf-8').then((s: string) => s.trim())
          : Promise.resolve(null),

        // Cache standards (changes rarely)
        this.cache.getOrLoad(
          'build:standards',
          async () => {
            if (hasStandards) {
              const content = await fs.readFile(standardsFile, 'utf-8');
              console.log(chalk.green('✓ Loaded project standards'));
              return content;
            }
            return null;
          },
          { ttl: 300000 } // 5 minutes cache
        ),

        // Cache patterns list (changes occasionally)
        this.cache.getOrLoad(
          'build:patterns',
          async () => {
            if (hasPatterns) {
              const files = await fs.readdir(patternsDir);
              return files.filter((f: string) => f.endsWith('.md'));
            }
            return [];
          },
          { ttl: 60000 } // 1 minute cache
        ),

        // Cache build plan template
        this.cache.getOrLoad(
          'build:template',
          () => Promise.resolve(this.generateBuildPlanTemplate()),
          { ttl: 600000 } // 10 minutes cache
        ),
      ]);

      // Update PM tracking
      await this.pmHooks.onBuild(feature);

      // Display PM integration if available
      const pmTool = process.env.HODGE_PM_TOOL;
      if (pmTool && issueId) {
        console.log(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
      }

      // Create build context
      const context: BuildContext = {
        mode: 'build',
        feature,
        timestamp: new Date().toISOString(),
        standards: 'recommended',
        validation: 'suggested',
        pmIssue: issueId,
        pmTool: pmTool || null,
      };

      // Phase 3: Parallel directory creation and file writes
      await Promise.all([
        fs.mkdir(buildDir, { recursive: true }),
        // Don't write context and build plan until directory is created
      ]);

      // Now write files in parallel
      await Promise.all([
        fs.writeFile(path.join(buildDir, 'context.json'), JSON.stringify(context, null, 2)),
        fs.writeFile(
          path.join(buildDir, 'build-plan.md'),
          this.populateBuildPlan(buildPlanTemplate, feature, issueId, pmTool || null)
        ),
      ]);

      // Display results
      console.log(chalk.green('✓ Build environment prepared\n'));

      console.log(chalk.bold('In Build Mode:'));
      console.log('  • Standards are ' + chalk.blue('recommended'));
      console.log('  • Patterns should be ' + chalk.blue('reused'));
      console.log('  • Focus on ' + chalk.blue('structured implementation'));
      console.log('  • Balance ' + chalk.blue('quality and speed') + '\n');

      if (patterns && patterns.length > 0) {
        console.log(chalk.bold('Available patterns:'));
        patterns.forEach((p: string) => {
          console.log(chalk.gray(`  • ${p.replace('.md', '')}`));
        });
        console.log();
      }

      console.log(chalk.bold('Files created:'));
      console.log(chalk.gray(`  • ${path.join(buildDir, 'context.json')}`));
      console.log(chalk.gray(`  • ${path.join(buildDir, 'build-plan.md')}`));

      console.log('\n' + chalk.bold('Build guidelines:'));
      console.log('  ✓ ' + chalk.green('SHOULD') + ' follow coding standards');
      console.log('  ✓ ' + chalk.green('SHOULD') + ' use established patterns');
      console.log('  ✓ ' + chalk.green('SHOULD') + ' include error handling');
      console.log('  ✓ ' + chalk.yellow('CONSIDER') + ' adding tests\n');

      console.log(chalk.bold('Next steps:'));
      console.log('  1. Implement the feature');
      console.log('  2. Update ' + chalk.yellow(`${path.join(buildDir, 'build-plan.md')}`));
      console.log('  3. Run ' + chalk.cyan('`npm test`') + ' to verify');
      console.log(
        '  4. Use ' + chalk.cyan(`\`/harden ${feature}\``) + ' for production readiness\n'
      );

      console.log(chalk.dim('Build context saved to: ' + buildDir));

      // Performance metrics (only in development)
      if (process.env.NODE_ENV === 'development' || process.env.HODGE_DEBUG) {
        const elapsed = Date.now() - startTime;
        console.log(
          chalk.dim(
            `\nPerformance: ${elapsed}ms (cache hit rate: ${this.cache.getStats().hitRate.toFixed(1)}%)`
          )
        );
      }
    } catch (error) {
      // Comprehensive error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(chalk.red(`\n❌ Build command failed: ${errorMessage}`));

      if (process.env.HODGE_DEBUG) {
        console.error(chalk.dim('Stack trace:'));
        console.error(error);
      }

      throw error; // Re-throw for caller to handle
    }
  }

  /**
   * Display AI context information for build mode
   * @param {string} feature - The feature being built
   * @private
   */
  private displayAIContext(feature: string): void {
    console.log(chalk.bold('═'.repeat(60)));
    console.log(chalk.blue.bold('AI CONTEXT UPDATE:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`You are now in ${chalk.blue.bold('BUILD MODE')} for: ${feature}`);
    console.log('\nRequirements for AI assistance:');
    console.log('• Standards SHOULD be followed (recommended)');
    console.log('• Use established patterns where applicable');
    console.log('• Include basic error handling');
    console.log('• Balance quality with development speed');
    console.log('• Add helpful comments for complex logic');
    console.log(chalk.bold('═'.repeat(60)) + '\n');
  }

  /**
   * Check if a file or directory exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if exists, false otherwise
   * @private
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate the build plan template
   * @returns {string} The build plan template with placeholders
   * @private
   */
  private generateBuildPlanTemplate(): string {
    // Template is now cached and reused
    return `# Build Plan: \${feature}

## Feature Overview
\${pmInfo}
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [ ] Create main component/module
- [ ] Implement core logic
- [ ] Add error handling
- [ ] Include inline documentation

### Integration
- [ ] Connect with existing modules
- [ ] Update CLI/API endpoints
- [ ] Configure dependencies

### Quality Checks
- [ ] Follow coding standards
- [ ] Use established patterns
- [ ] Add basic validation
- [ ] Consider edge cases

## Files Modified
<!-- Track files as you modify them -->
- \`path/to/file1.ts\` - Description
- \`path/to/file2.ts\` - Description

## Decisions Made
<!-- Document any implementation decisions -->
- Decision 1: Reasoning
- Decision 2: Reasoning

## Testing Notes
<!-- Notes for testing approach -->
- Test scenario 1
- Test scenario 2

## Next Steps
After implementation:
1. Run tests with \`npm test\`
2. Check linting with \`npm run lint\`
3. Review changes
4. Proceed to \`/harden \${feature}\` for production readiness
`;
  }

  /**
   * Populate the build plan template with actual values
   * @param {string} template - The template string
   * @param {string} feature - The feature name
   * @param {string | null} issueId - PM issue ID if available
   * @param {string | null} pmTool - PM tool name if configured
   * @returns {string} The populated build plan
   * @private
   */
  private populateBuildPlan(
    template: string,
    feature: string,
    issueId: string | null,
    pmTool: string | null
  ): string {
    if (!template) {
      return '';
    }

    const pmInfo =
      issueId && pmTool ? `**PM Issue**: ${issueId} (${pmTool})` : 'No PM issue linked';

    return template.replace(/\${feature}/g, feature).replace('${pmInfo}', pmInfo);
  }
}
