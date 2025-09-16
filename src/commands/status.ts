import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { HodgeMDGenerator } from '../lib/hodge-md-generator.js';

export class StatusCommand {
  async execute(feature?: string): Promise<void> {
    if (feature) {
      await this.showFeatureStatus(feature);
    } else {
      await this.showOverallStatus();
    }
  }

  private async showFeatureStatus(feature: string): Promise<void> {
    console.log(chalk.blue(`📊 Status for feature: ${feature}\n`));

    const featureDir = path.join('.hodge', 'features', feature);

    if (!existsSync(featureDir)) {
      console.log(chalk.yellow('⚠️  No work found for this feature.'));
      console.log(chalk.gray(`   Start with: hodge explore ${feature}`));
      return;
    }

    // Check exploration
    const exploreDir = path.join(featureDir, 'explore');
    const hasExploration = existsSync(exploreDir);
    const hasDecision = existsSync(path.join(exploreDir, 'decision.md'));

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

    // Check PM integration
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    let issueId = null;
    if (existsSync(issueIdFile)) {
      issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
    }

    // Display status
    console.log(chalk.bold('Progress:'));
    console.log('  ' + (hasExploration ? chalk.green('✓') : chalk.gray('○')) + ' Exploration');
    console.log('  ' + (hasDecision ? chalk.green('✓') : chalk.gray('○')) + ' Decision');
    console.log('  ' + (hasBuild ? chalk.green('✓') : chalk.gray('○')) + ' Build');
    console.log('  ' + (hasHarden ? chalk.green('✓') : chalk.gray('○')) + ' Harden');
    console.log(
      '  ' + (isProductionReady ? chalk.green('✓') : chalk.gray('○')) + ' Production Ready\n'
    );

    if (issueId) {
      console.log(chalk.bold('PM Integration:'));
      console.log(`  Issue: ${issueId}`);
      if (process.env.HODGE_PM_TOOL) {
        console.log(`  Tool: ${process.env.HODGE_PM_TOOL}`);
      }
      console.log();
    }

    // Suggest next step
    console.log(chalk.bold('Next Step:'));
    if (!hasExploration) {
      console.log(chalk.cyan(`  hodge explore ${feature}`));
    } else if (!hasDecision) {
      console.log(chalk.yellow('  Review exploration and make a decision'));
      console.log(chalk.cyan(`  hodge decide "Your decision here" --feature ${feature}`));
    } else if (!hasBuild) {
      console.log(chalk.cyan(`  hodge build ${feature}`));
    } else if (!hasHarden) {
      console.log(chalk.cyan(`  hodge harden ${feature}`));
    } else if (!isProductionReady) {
      console.log(chalk.yellow('  Fix validation issues and run:'));
      console.log(chalk.cyan(`  hodge harden ${feature}`));
    } else {
      console.log(chalk.green('  ✓ Feature is ready to ship!'));
    }
  }

  private async showOverallStatus(): Promise<void> {
    console.log(chalk.blue('📊 Overall Hodge Status\n'));

    // Generate HODGE.md for cross-tool compatibility
    await this.updateHodgeMD();

    // Check if Hodge is initialized
    const configFile = path.join('.hodge', 'config.json');
    if (!existsSync(configFile)) {
      console.log(chalk.red('❌ Hodge is not initialized in this project.'));
      console.log(chalk.gray('   Run: hodge init'));
      return;
    }

    // Load configuration
    const config = JSON.parse(await fs.readFile(configFile, 'utf-8')) as {
      projectName?: string;
      projectType?: string;
      pmTool?: string;
    };

    console.log(chalk.bold('Project Configuration:'));
    console.log(`  Name: ${config.projectName || 'Unknown'}`);
    console.log(`  Type: ${config.projectType || 'Unknown'}`);
    if (config.pmTool) {
      console.log(`  PM Tool: ${config.pmTool}`);
    }
    console.log();

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
    console.log(chalk.bold('Statistics:'));
    console.log(`  Features: ${chalk.green(featureCount.toString())}`);
    console.log(`  Active: ${chalk.yellow(activeFeatures.length.toString())}`);
    console.log(`  Patterns: ${chalk.green(patternCount.toString())}`);
    console.log(`  Decisions: ${chalk.green(decisionCount.toString())}`);
    console.log();

    // Show active features
    if (activeFeatures.length > 0) {
      console.log(chalk.bold('Active Features:'));
      for (const feature of activeFeatures.slice(0, 5)) {
        console.log(`  • ${feature}`);
      }
      if (activeFeatures.length > 5) {
        console.log(chalk.gray(`  ... and ${activeFeatures.length - 5} more`));
      }
      console.log();
    }

    // AI Context
    console.log(chalk.bold('═'.repeat(60)));
    console.log(chalk.blue.bold('PROJECT CONTEXT SUMMARY:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`Project: ${config.projectName || 'Unknown'}`);
    console.log(`Active Features: ${activeFeatures.join(', ') || 'None'}`);
    console.log(`Patterns Available: ${patternCount}`);
    console.log(`Decisions Made: ${decisionCount}`);
    console.log('\nUse this context to maintain consistency across the project.');
    console.log(chalk.bold('═'.repeat(60)));

    // Notify about HODGE.md
    console.log();
    console.log(chalk.gray('💡 HODGE.md updated for AI tool compatibility'));
  }

  private async updateHodgeMD(): Promise<void> {
    try {
      const generator = new HodgeMDGenerator();

      // Get the most recent active feature if any
      const featuresDir = path.join('.hodge', 'features');
      let currentFeature = 'general';

      if (existsSync(featuresDir)) {
        const features = await fs.readdir(featuresDir);
        // Find most recently modified feature
        let mostRecent: { name: string; time: number } | null = null;

        for (const feature of features) {
          const featurePath = path.join(featuresDir, feature);
          const stat = await fs.stat(featurePath);
          if (!mostRecent || stat.mtimeMs > mostRecent.time) {
            mostRecent = { name: feature, time: stat.mtimeMs };
          }
        }

        if (mostRecent) {
          currentFeature = mostRecent.name;
        }
      }

      // Generate and save HODGE.md
      await generator.saveToFile(currentFeature);

      // Add tool-specific enhancements
      await generator.addToolSpecificEnhancements(path.join('.hodge', 'HODGE.md'));
    } catch (error) {
      // Log error for debugging but don't break command
      if (process.env.DEBUG) {
        console.error('Failed to generate HODGE.md:', error);
      }
    }
  }
}
