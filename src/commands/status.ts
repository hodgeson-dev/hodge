import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { sessionManager } from '../lib/session-manager.js';
import { createCommandLogger } from '../lib/logger.js';

export class StatusCommand {
  private logger = createCommandLogger('status', { enableConsole: true });

  async execute(feature?: string): Promise<void> {
    // Check for existing session first
    const session = await sessionManager.load();
    if (session && !feature) {
      // Non-interactive: just use the session feature if no feature specified
      feature = session.feature;
      this.logger.info(chalk.blue(`📂 Showing status for ${session.feature} from session\n`));
    }

    if (feature) {
      await this.showFeatureStatus(feature);
    } else {
      await this.showOverallStatus();
    }
  }

  private async showFeatureStatus(feature: string): Promise<void> {
    this.logger.info(chalk.blue(`📊 Status for feature: ${feature}\n`));

    const featureDir = path.join('.hodge', 'features', feature);

    if (!existsSync(featureDir)) {
      this.logger.info(chalk.yellow('⚠️  No work found for this feature.'));
      this.logger.info(chalk.gray(`   Start with: hodge explore ${feature}`));
      return;
    }

    // Check exploration
    const exploreDir = path.join(featureDir, 'explore');
    const hasExploration = existsSync(exploreDir);
    // Fix Bug 1: Check decision.md at feature root, not in explore/ subdirectory
    const hasDecision = existsSync(path.join(featureDir, 'decision.md'));

    // Check build
    const buildDir = path.join(featureDir, 'build');
    const hasBuild = existsSync(buildDir);

    // Check harden
    const hardenDir = path.join(featureDir, 'harden');
    const hasHarden = existsSync(hardenDir);
    let isProductionReady = false;

    if (hasHarden) {
      const validationFile = path.join(hardenDir, 'validation-results.json');
      if (existsSync(validationFile)) {
        try {
          const results = JSON.parse(await fs.readFile(validationFile, 'utf-8')) as Record<
            string,
            { passed: boolean }
          >;
          isProductionReady = Object.values(results).every((r) => r.passed);
        } catch {
          // Invalid validation file
        }
      }
    }

    // Fix Bug 2: Check if feature has been shipped (has ship-record.json)
    // HODGE-341.2: ship-record.json moved to feature root
    const shipRecordPath = path.join(featureDir, 'ship-record.json');
    const isShipped = existsSync(shipRecordPath);

    // Check PM integration
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    let issueId = null;
    if (existsSync(issueIdFile)) {
      issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
    }

    // Display status
    this.logger.info(chalk.bold('Progress:'));
    this.logger.info('  ' + (hasExploration ? chalk.green('✓') : chalk.gray('○')) + ' Exploration');
    this.logger.info('  ' + (hasDecision ? chalk.green('✓') : chalk.gray('○')) + ' Decision');
    this.logger.info('  ' + (hasBuild ? chalk.green('✓') : chalk.gray('○')) + ' Build');
    this.logger.info('  ' + (hasHarden ? chalk.green('✓') : chalk.gray('○')) + ' Harden');
    this.logger.info(
      '  ' + (isProductionReady ? chalk.green('✓') : chalk.gray('○')) + ' Production Ready'
    );
    this.logger.info('  ' + (isShipped ? chalk.green('✓') : chalk.gray('○')) + ' Shipped\n');

    if (issueId) {
      this.logger.info(chalk.bold('PM Integration:'));
      this.logger.info(`  Issue: ${issueId}`);
      if (process.env.HODGE_PM_TOOL) {
        this.logger.info(`  Tool: ${process.env.HODGE_PM_TOOL}`);
      }
      this.logger.info('');
    }

    // Suggest next step
    this.logger.info(chalk.bold('Next Step:'));
    if (!hasExploration) {
      this.logger.info(chalk.cyan(`  hodge explore ${feature}`));
    } else if (!hasDecision) {
      this.logger.info(chalk.yellow('  Review exploration and make a decision'));
      this.logger.info(chalk.cyan(`  hodge decide "Your decision here" --feature ${feature}`));
    } else if (!hasBuild) {
      this.logger.info(chalk.cyan(`  hodge build ${feature}`));
    } else if (!hasHarden) {
      this.logger.info(chalk.cyan(`  hodge harden ${feature}`));
    } else if (!isProductionReady) {
      this.logger.info(chalk.yellow('  Fix validation issues and run:'));
      this.logger.info(chalk.cyan(`  hodge harden ${feature}`));
    } else if (isShipped) {
      this.logger.info(chalk.green('  ✓ Feature completed. Start new work with:'));
      this.logger.info(chalk.cyan(`  hodge explore <feature>`));
    } else {
      this.logger.info(chalk.green('  ✓ Feature is ready to ship!'));
      this.logger.info(chalk.cyan(`  hodge ship ${feature}`));
    }
  }

  private async showOverallStatus(): Promise<void> {
    this.logger.info(chalk.blue('📊 Overall Hodge Status\n'));

    // Check if Hodge is initialized
    const configFile = path.join('.hodge', 'config.json');
    if (!existsSync(configFile)) {
      this.logger.info(chalk.red('❌ Hodge is not initialized in this project.'));
      this.logger.info(chalk.gray('   Run: hodge init'));
      return;
    }

    // Load configuration
    const config = JSON.parse(await fs.readFile(configFile, 'utf-8')) as {
      projectName?: string;
      projectType?: string;
      pmTool?: string;
    };

    this.logger.info(chalk.bold('Project Configuration:'));
    this.logger.info(`  Name: ${config.projectName || 'Unknown'}`);
    this.logger.info(`  Type: ${config.projectType || 'Unknown'}`);
    if (config.pmTool) {
      this.logger.info(`  PM Tool: ${config.pmTool}`);
    }
    this.logger.info('');

    // Count features
    const featuresDir = path.join('.hodge', 'features');
    let featureCount = 0;
    const activeFeatures: string[] = [];

    if (existsSync(featuresDir)) {
      const features = await fs.readdir(featuresDir);
      featureCount = features.length;

      for (const feature of features) {
        const hardenDir = path.join(featuresDir, feature, 'harden');
        if (!existsSync(hardenDir)) {
          activeFeatures.push(feature);
        }
      }
    }

    // Count patterns and decisions
    const patternsDir = path.join('.hodge', 'patterns');
    let patternCount = 0;
    if (existsSync(patternsDir)) {
      const patterns = await fs.readdir(patternsDir);
      patternCount = patterns.filter((f) => f.endsWith('.md')).length;
    }

    const decisionsFile = path.join('.hodge', 'decisions.md');
    let decisionCount = 0;
    if (existsSync(decisionsFile)) {
      const content = await fs.readFile(decisionsFile, 'utf-8');
      decisionCount = (content.match(/^### \d{4}-/gm) || []).length;
    }

    // Display statistics
    this.logger.info(chalk.bold('Statistics:'));
    this.logger.info(`  Features: ${chalk.green(featureCount.toString())}`);
    this.logger.info(`  Active: ${chalk.yellow(activeFeatures.length.toString())}`);
    this.logger.info(`  Patterns: ${chalk.green(patternCount.toString())}`);
    this.logger.info(`  Decisions: ${chalk.green(decisionCount.toString())}`);
    this.logger.info('');

    // Show active features
    if (activeFeatures.length > 0) {
      this.logger.info(chalk.bold('Active Features:'));
      for (const feature of activeFeatures.slice(0, 5)) {
        this.logger.info(`  • ${feature}`);
      }
      if (activeFeatures.length > 5) {
        this.logger.info(chalk.gray(`  ... and ${activeFeatures.length - 5} more`));
      }
      this.logger.info('');
    }

    // AI Context
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.blue.bold('PROJECT CONTEXT SUMMARY:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`Project: ${config.projectName || 'Unknown'}`);
    this.logger.info(`Active Features: ${activeFeatures.join(', ') || 'None'}`);
    this.logger.info(`Patterns Available: ${patternCount}`);
    this.logger.info(`Decisions Made: ${decisionCount}`);
    this.logger.info('\nUse this context to maintain consistency across the project.');
    this.logger.info(chalk.bold('═'.repeat(60)));
  }

  // Removed updateHodgeMD method - status should be read-only
  // HODGE.md updates now happen in commands that actually change state:
  // - explore, build, harden, ship (for feature HODGE.md)
  // - context (for main HODGE.md when explicitly requested)
}
