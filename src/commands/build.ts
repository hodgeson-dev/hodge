import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { CacheManager } from '../lib/cache-manager.js';
import { ContextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { createCommandLogger } from '../lib/logger.js';
import { ShipService } from '../lib/ship-service.js';
import { getCurrentCommitSHA } from '../lib/git-utils.js';

export interface BuildOptions {
  skipChecks?: boolean;
  sequential?: boolean; // Run I/O operations sequentially for debugging
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
  private pmHooks: PMHooks;
  private logger = createCommandLogger('build', { enableConsole: true });
  private shipService: ShipService;
  private contextManager: ContextManager;

  constructor(basePath: string = process.cwd()) {
    this.contextManager = new ContextManager(basePath);
    this.pmHooks = new PMHooks(basePath);
    this.shipService = new ShipService(basePath);
  }

  /**
   * Setup build paths for the feature
   */
  private setupBuildPaths(feature: string) {
    return {
      featureDir: path.join('.hodge', 'features', feature),
      buildDir: path.join('.hodge', 'features', feature, 'build'),
      exploreDir: path.join('.hodge', 'features', feature, 'explore'),
      decisionFile: path.join('.hodge', 'features', feature, 'decisions.md'),
      issueIdFile: path.join('.hodge', 'features', feature, 'issue-id.txt'),
      standardsFile: path.join('.hodge', 'standards.md'),
      patternsDir: path.join('.hodge', 'patterns'),
    };
  }

  /**
   * Load build data in parallel with caching
   */
  private async loadBuildData(
    hasIssueId: boolean,
    hasStandards: boolean,
    hasPatterns: boolean,
    issueIdFile: string,
    standardsFile: string,
    patternsDir: string
  ): Promise<[string | null, string | null, string[], string]> {
    return await Promise.all([
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
            this.logger.info(chalk.green('✓ Loaded project standards'));
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
  }

  /**
   * Setup build environment (directories and files)
   */
  private async setupBuildEnvironment(
    buildDir: string,
    feature: string,
    buildPlanTemplate: string,
    issueId: string | null,
    pmTool: string | undefined
  ) {
    // Create directory
    await fs.mkdir(buildDir, { recursive: true });

    // HODGE-341.2: Record buildStartCommit
    try {
      const commitSHA = await getCurrentCommitSHA();
      await this.shipService.updateShipRecord(feature, {
        buildStartCommit: commitSHA,
      });
      this.logger.debug('Recorded buildStartCommit', { feature, commitSHA });
    } catch (error) {
      this.logger.warn('Could not record buildStartCommit (git may not be available)', {
        error: error as Error,
      });
    }

    // Write build plan
    await fs.writeFile(
      path.join(buildDir, 'build-plan.md'),
      this.populateBuildPlan(buildPlanTemplate, feature, issueId, pmTool ?? null)
    );
  }

  /**
   * Display build results and guidelines
   */
  private displayBuildResults(
    buildDir: string,
    feature: string,
    patterns: string[],
    startTime: number
  ) {
    this.logger.info(chalk.green('✓ Build environment prepared\n'));

    this.logger.info(chalk.bold('In Build Mode:'));
    this.logger.info('  • Standards are ' + chalk.blue('recommended'));
    this.logger.info('  • Patterns should be ' + chalk.blue('reused'));
    this.logger.info('  • Focus on ' + chalk.blue('structured implementation'));
    this.logger.info('  • Balance ' + chalk.blue('quality and speed') + '\n');

    if (patterns.length > 0) {
      this.logger.info(chalk.bold('Available patterns:'));
      patterns.forEach((p: string) => {
        this.logger.info(chalk.gray(`  • ${p.replace('.md', '')}`));
      });
      this.logger.info('');
    }

    this.logger.info(chalk.bold('Files created:'));
    this.logger.info(chalk.gray(`  • ${path.join(buildDir, 'build-plan.md')}`));

    this.logger.info('\n' + chalk.bold('Build guidelines:'));
    this.logger.info('  ✓ ' + chalk.green('SHOULD') + ' follow coding standards');
    this.logger.info('  ✓ ' + chalk.green('SHOULD') + ' use established patterns');
    this.logger.info('  ✓ ' + chalk.green('SHOULD') + ' include error handling');
    this.logger.info('  ✓ ' + chalk.yellow('CONSIDER') + ' adding tests\n');

    this.logger.info(chalk.bold('Next steps:'));
    this.logger.info('  1. Implement the feature');
    this.logger.info('  2. Update ' + chalk.yellow(`${path.join(buildDir, 'build-plan.md')}`));
    this.logger.info('  3. Run ' + chalk.cyan('`npm test`') + ' to verify');
    this.logger.info(
      '  4. Use ' + chalk.cyan(`\`/harden ${feature}\``) + ' for production readiness\n'
    );

    this.logger.info(chalk.dim('Build context saved to: ' + buildDir));

    // Performance metrics (only in development)
    if (process.env.NODE_ENV === 'development' || process.env.HODGE_DEBUG) {
      const elapsed = Date.now() - startTime;
      this.logger.info(
        chalk.dim(
          `\nPerformance: ${elapsed}ms (cache hit rate: ${this.cache.getStats().hitRate.toFixed(1)}%)`
        )
      );
    }
  }

  /**
   * Handle build command errors
   */
  private handleBuildError(error: unknown): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    this.logger.error(chalk.red(`\n❌ Build command failed: ${errorMessage}`), {
      error: error as Error,
    });

    if (process.env.HODGE_DEBUG) {
      this.logger.error(chalk.dim('Stack trace:'));
      this.logger.error(error as Error);
    }

    throw error;
  }

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
    const resolvedFeature = await this.contextManager.getFeature(feature);
    if (!resolvedFeature) {
      throw new Error(
        'No feature specified. Please provide a feature name or run "hodge explore <feature>" first to set context.'
      );
    }
    feature = resolvedFeature;
    await this.contextManager.updateForCommand('build', feature, 'build');

    try {
      this.logger.info(chalk.blue('🔨 Entering Build Mode'));
      this.logger.info(chalk.gray(`Feature: ${feature}\n`));
      this.displayAIContext(feature);

      const paths = this.setupBuildPaths(feature);

      // Validate prerequisites
      const validation = await this.validatePrerequisites({
        ...paths,
        feature,
        skipChecks: options.skipChecks ?? false,
        sequential: options.sequential ?? false,
      });

      if (!validation.canProceed) {
        return;
      }

      const { hasIssueId, hasStandards, hasPatterns } = validation;

      // Load data in parallel
      const [issueId, , patterns, buildPlanTemplate] = await this.loadBuildData(
        hasIssueId,
        hasStandards,
        hasPatterns,
        paths.issueIdFile,
        paths.standardsFile,
        paths.patternsDir
      );

      // Update PM tracking
      await this.pmHooks.onBuild(feature);

      // Display PM integration
      const pmTool = process.env.HODGE_PM_TOOL;
      if (pmTool && issueId) {
        this.logger.info(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
      }

      // Setup build environment
      await this.setupBuildEnvironment(paths.buildDir, feature, buildPlanTemplate, issueId, pmTool);

      // Display results
      this.displayBuildResults(paths.buildDir, feature, patterns, startTime);
    } catch (error) {
      this.handleBuildError(error);
    }
  }

  /**
   * Display AI context information for build mode
   * @param {string} feature - The feature being built
   * @private
   */
  private displayAIContext(feature: string): void {
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.blue.bold('AI CONTEXT UPDATE:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`You are now in ${chalk.blue.bold('BUILD MODE')} for: ${feature}`);
    this.logger.info('\nRequirements for AI assistance:');
    this.logger.info('• Standards SHOULD be followed (recommended)');
    this.logger.info('• Use established patterns where applicable');
    this.logger.info('• Include basic error handling');
    this.logger.info('• Balance quality with development speed');
    this.logger.info('• Add helpful comments for complex logic');
    this.logger.info(chalk.bold('═'.repeat(60)) + '\n');
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

  /**
   * Check file existence for all prerequisites
   * @private
   */
  private async checkPrerequisiteFiles(params: {
    exploreDir: string;
    decisionFile: string;
    issueIdFile: string;
    standardsFile: string;
    patternsDir: string;
    sequential: boolean;
  }) {
    if (params.sequential) {
      return {
        hasExploration: await this.fileExists(params.exploreDir),
        hasDecision: await this.fileExists(params.decisionFile),
        hasIssueId: await this.fileExists(params.issueIdFile),
        hasStandards: await this.fileExists(params.standardsFile),
        hasPatterns: await this.fileExists(params.patternsDir),
      };
    }

    const [hasExploration, hasDecision, hasIssueId, hasStandards, hasPatterns] = await Promise.all([
      this.fileExists(params.exploreDir),
      this.fileExists(params.decisionFile),
      this.fileExists(params.issueIdFile),
      this.fileExists(params.standardsFile),
      this.fileExists(params.patternsDir),
    ]);

    return { hasExploration, hasDecision, hasIssueId, hasStandards, hasPatterns };
  }

  /**
   * Validate prerequisites before building
   * @private
   */
  private async validatePrerequisites(params: {
    exploreDir: string;
    decisionFile: string;
    issueIdFile: string;
    standardsFile: string;
    patternsDir: string;
    feature: string;
    skipChecks: boolean;
    sequential: boolean;
  }): Promise<{
    canProceed: boolean;
    hasIssueId: boolean;
    hasStandards: boolean;
    hasPatterns: boolean;
  }> {
    // Check file existence
    const { hasExploration, hasDecision, hasIssueId, hasStandards, hasPatterns } =
      await this.checkPrerequisiteFiles(params);

    // Validate required prerequisites
    if (!params.skipChecks) {
      if (!hasExploration) {
        this.logger.info(chalk.yellow('⚠️  No exploration found for this feature.'));
        this.logger.info(chalk.gray('   Consider exploring first with:'));
        this.logger.info(chalk.cyan(`   hodge explore ${params.feature}\n`));
        this.logger.info(chalk.gray('   Or use --skip-checks to proceed anyway.\n'));
        return { canProceed: false, hasIssueId, hasStandards, hasPatterns };
      }

      if (!hasDecision) {
        this.logger.info(chalk.yellow('⚠️  No decision recorded for this feature.'));
        this.logger.info(chalk.gray('   Review exploration and make a decision first.'));
        this.logger.info(chalk.gray('   Or use --skip-checks to proceed anyway.\n'));
      }
    }

    return { canProceed: true, hasIssueId, hasStandards, hasPatterns };
  }
}
