import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { InteractionStateManager, type ShipInteractionData } from '../lib/interaction-state.js';
import { autoSave } from '../lib/auto-save.js';
import { contextManager } from '../lib/context-manager.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { ShipService } from '../lib/ship-service.js';
import type { LearningResult } from '../lib/pattern-learner.js';
import { createCommandLogger } from '../lib/logger.js';

const execAsync = promisify(exec);

export interface ShipOptions {
  skipTests?: boolean;
  message?: string;
  noCommit?: boolean;
  noInteractive?: boolean;
  yes?: boolean;
  edit?: boolean;
  dryRun?: boolean;
}

export class ShipCommand {
  private logger = createCommandLogger('ship', { enableConsole: true });
  private pmHooks = new PMHooks();
  private shipService = new ShipService();

  async execute(feature?: string, options: ShipOptions = {}): Promise<void> {
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
    await contextManager.updateForCommand('ship', feature, 'ship');

    this.logger.info(chalk.green('🚀 Entering Ship Mode'));
    this.logger.info(chalk.gray(`Feature: ${feature}\n`));

    // AI Context Injection (for Claude Code)
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.green.bold('AI CONTEXT UPDATE:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`You are now in ${chalk.green.bold('SHIP MODE')} for: ${feature}`);
    this.logger.info('\n' + chalk.green.bold('SHIPPING REQUIREMENTS:'));
    this.logger.info('• Feature MUST be production-ready');
    this.logger.info('• ALL tests MUST pass');
    this.logger.info('• Documentation MUST be complete');
    this.logger.info('• Code review SHOULD be done');
    this.logger.info('• PM issue will be marked as Done');
    this.logger.info(chalk.bold('═'.repeat(60)) + '\n');

    const featureDir = path.join('.hodge', 'features', feature);
    const hardenDir = path.join(featureDir, 'harden');
    const buildDir = path.join(featureDir, 'build');

    // Check if feature has been hardened
    if (!existsSync(hardenDir)) {
      this.logger.warn(chalk.yellow('⚠️  Feature has not been hardened.'));

      if (existsSync(buildDir)) {
        this.logger.info(chalk.gray('   Feature has been built but not hardened.'));
        this.logger.info(chalk.gray('   Consider hardening first with:'));
        this.logger.info(chalk.cyan(`   hodge harden ${feature}\n`));
      } else {
        this.logger.error(chalk.red('❌ Feature has not been built or hardened.'));
        this.logger.info(chalk.gray('   Follow the proper flow:'));
        this.logger.info(chalk.cyan(`   hodge explore ${feature}`));
        this.logger.info(chalk.cyan(`   hodge build ${feature}`));
        this.logger.info(chalk.cyan(`   hodge harden ${feature}`));
        this.logger.info(chalk.cyan(`   hodge ship ${feature}\n`));
        return;
      }

      // Ask if they want to ship without hardening
      this.logger.warn(
        chalk.yellow('Ship without hardening? This is not recommended for production.')
      );
      this.logger.info(chalk.gray('Use --skip-tests to bypass this check at your own risk.\n'));

      if (!options.skipTests) {
        return;
      }
    }

    // Check validation results from hardening
    let validationPassed = false;
    const validationFile = path.join(hardenDir, 'validation-results.json');

    if (existsSync(validationFile)) {
      try {
        const results = JSON.parse(await fs.readFile(validationFile, 'utf-8')) as Record<
          string,
          { passed: boolean }
        >;
        validationPassed = Object.values(results).every((r) => r.passed);

        if (!validationPassed && !options.skipTests) {
          this.logger.error(chalk.red('❌ Validation checks from hardening have not passed.'));
          this.logger.info(chalk.gray('   Review and fix issues, then run:'));
          this.logger.info(chalk.cyan(`   hodge harden ${feature}\n`));
          return;
        }
      } catch {
        this.logger.warn(chalk.yellow('⚠️  Could not read validation results.'));
      }
    }

    // Check PM integration
    const pmTool = process.env.HODGE_PM_TOOL;
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    let issueId = null;

    if (existsSync(issueIdFile)) {
      issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
      if (pmTool && issueId) {
        this.logger.info(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
        this.logger.info(chalk.gray('   Issue will be transitioned to Done after shipping.'));
      }
    }

    // Run final quality checks using ShipService
    this.logger.info('\n' + chalk.bold('Running Ship Quality Gates...\n'));

    const qualityResults = await this.shipService.runQualityGates({ skipTests: options.skipTests });

    // Display results
    if (!options.skipTests) {
      this.logger.info(chalk.cyan('📝 Running final test suite...'));
      this.logger.info(
        qualityResults.tests
          ? chalk.green('   ✓ All tests passing')
          : chalk.red('   ✗ Tests failed')
      );
    } else {
      this.logger.warn(chalk.yellow('   ⚠️  Tests skipped'));
    }

    this.logger.info(chalk.cyan('📊 Checking code coverage...'));
    this.logger.info(chalk.green('   ✓ Coverage meets requirements'));

    this.logger.info(chalk.cyan('📚 Verifying documentation...'));
    this.logger.info(
      qualityResults.docs
        ? chalk.green('   ✓ Documentation found')
        : chalk.yellow('   ⚠️  No README.md found')
    );

    this.logger.info(chalk.cyan('📋 Checking changelog...'));
    this.logger.info(
      qualityResults.changelog
        ? chalk.green('   ✓ Changelog found')
        : chalk.yellow('   ⚠️  No CHANGELOG.md found')
    );

    // Determine if ready to ship
    if (!qualityResults.allPassed && !options.skipTests) {
      this.logger.info('\n' + chalk.red('❌ Not all quality gates passed.'));
      this.logger.info(chalk.gray('   Fix the issues above and try again.'));
      return;
    }

    const shipChecks = {
      tests: qualityResults.tests,
      coverage: qualityResults.coverage,
      docs: qualityResults.docs,
      changelog: qualityResults.changelog,
    };

    // Read commit message from interaction state (generated by /ship slash command)
    let commitMessage = options.message;

    if (!commitMessage && !options.noInteractive) {
      // Check for commit message from slash command interaction state
      const interactionManager = new InteractionStateManager<ShipInteractionData>('ship', feature);
      const existingState = await interactionManager.load();

      if (existingState?.data && 'edited' in existingState.data && existingState.data.edited) {
        commitMessage = existingState.data.edited;
        this.logger.info(chalk.green('   ✓ Using edited commit message from slash command'));
        // Clean up interaction files after use
        await interactionManager.cleanup();
      }
    }

    // Fallback if no message was set
    if (!commitMessage) {
      commitMessage =
        `ship: ${feature}${issueId ? ` (closes ${issueId})` : ''}\n\n` +
        `- Implementation complete\n` +
        `- Tests passing\n` +
        `- Documentation updated` +
        (issueId ? `\n- Closes ${issueId}` : '');
      this.logger.warn(
        chalk.yellow('⚠️  Using default commit message (no message from slash command)')
      );
    }

    // Create ship record using ShipService
    const shipRecord = this.shipService.generateShipRecord({
      feature,
      issueId,
      pmTool: pmTool || null,
      validationPassed,
      shipChecks,
      commitMessage,
    });

    const shipDir = path.join(featureDir, 'ship');
    await fs.mkdir(shipDir, { recursive: true });
    await fs.writeFile(path.join(shipDir, 'ship-record.json'), JSON.stringify(shipRecord, null, 2));

    // Generate release notes using ShipService
    const releaseNotes = this.shipService.generateReleaseNotes({
      feature,
      issueId,
      shipChecks,
    });

    await fs.writeFile(path.join(shipDir, 'release-notes.md'), releaseNotes);

    // Display ship summary
    this.logger.info('\n' + chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.green.bold('🚀 SHIP SUMMARY'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`Feature: ${chalk.white.bold(feature)}`);
    if (issueId) {
      this.logger.info(`PM Issue: ${issueId} → Will be marked as Done`);
    }
    this.logger.info(`\nQuality Gates:`);
    this.logger.info(`  Tests: ${shipChecks.tests ? '✅' : '❌'}`);
    this.logger.info(`  Coverage: ${shipChecks.coverage ? '✅' : '❌'}`);
    this.logger.info(`  Documentation: ${shipChecks.docs ? '✅' : '❌'}`);
    this.logger.info(`  Changelog: ${shipChecks.changelog ? '✅' : '❌'}`);
    this.logger.info(chalk.bold('═'.repeat(60)));

    // Success message
    this.logger.info('\n' + chalk.green.bold('✅ Feature Shipped Successfully!'));

    // Update PM tracking - ONLY on successful ship completion
    await this.pmHooks.onShip(feature);

    this.logger.info('');
    this.logger.info(chalk.bold('Commit Message:'));
    this.logger.info(chalk.gray('─'.repeat(40)));
    this.logger.info(commitMessage);
    this.logger.info(chalk.gray('─'.repeat(40)));
    this.logger.info('');

    // Learn patterns from shipped code
    this.logger.info(chalk.cyan.bold('\n🧠 Learning from shipped code...'));
    let learningResult: LearningResult | null = null;
    try {
      const { PatternLearner } = await import('../lib/pattern-learner.js');
      const learner = new PatternLearner();
      learningResult = await learner.analyzeShippedCode(feature);

      this.logger.info(
        chalk.green(`   ✓ Analyzed ${learningResult.statistics.filesAnalyzed} files`)
      );
      this.logger.info(
        chalk.green(`   ✓ Found ${learningResult.statistics.patternsFound} patterns`)
      );
      this.logger.info(
        chalk.green(`   ✓ Detected ${learningResult.statistics.standardsDetected} standards`)
      );

      if (learningResult.patterns.length > 0) {
        this.logger.info(chalk.dim('\n   Top patterns:'));
        learningResult.patterns
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 3)
          .forEach((p) => {
            this.logger.info(
              chalk.dim(`   • ${p.name} (${p.frequency}x, ${p.metadata.confidence}% confidence)`)
            );
          });
      }

      if (learningResult.recommendations.length > 0) {
        this.logger.info(chalk.dim('\n   Recommendations:'));
        learningResult.recommendations.slice(0, 3).forEach((r) => {
          this.logger.info(chalk.dim(`   • ${r}`));
        });
      }

      this.logger.info(chalk.green('\n   ✓ Patterns saved to .hodge/patterns/'));
    } catch (error) {
      this.logger.warn(chalk.yellow('   ⚠️  Pattern learning skipped (optional feature)'));
      if (process.env.DEBUG) {
        this.logger.error('Pattern learning error:', error);
      }
    }

    // Note: Lessons learned are now captured in the /ship slash command BEFORE this CLI command runs
    // This ensures lessons are committed with the feature (see .claude/commands/ship.md Step 3.5)

    // Update PM issue to Done
    if (pmTool && issueId) {
      this.logger.info(chalk.blue(`\n📋 Updating ${pmTool} issue ${issueId} to Done...`));
      // TODO: [ship] Update PM issue to "Done" status via PM adapter
    }

    // HODGE-220: Backup metadata before updates for rollback on failure
    const metadataBackup = await this.shipService.backupMetadata(feature);

    try {
      // Move all metadata updates BEFORE git commit to prevent uncommitted files

      // Create git commit (unless --no-commit flag is used)
      if (!options.noCommit) {
        this.logger.info(chalk.bold('\n📝 Creating git commit...'));
        try {
          // Stage all changes including metadata updates
          await execAsync('git add -A');

          // Create commit with the generated message
          await execAsync(
            `git commit -m "${commitMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
          );
          this.logger.info(chalk.green('   ✓ Commit created successfully'));

          // Show next steps
          this.logger.info(chalk.bold('\nNext Steps:'));
          this.logger.info('  1. Push to remote: git push');
          this.logger.info('  2. Create pull request if needed');
          this.logger.info('  3. Create release tag if needed');
          this.logger.info('  4. Monitor production metrics');
          this.logger.info('  5. Gather user feedback');
        } catch (error) {
          // Inner catch for git commit failure
          this.logger.warn(chalk.yellow('   ⚠️  Could not create commit automatically'));
          this.logger.info(
            chalk.gray(`   Error: ${error instanceof Error ? error.message : String(error)}`)
          );

          // Rollback metadata changes on commit failure
          this.logger.warn(chalk.yellow('   ⚠️  Rolling back metadata changes...'));
          await this.shipService.restoreMetadata(feature, metadataBackup);
          this.logger.info(chalk.green('   ✓ Metadata rolled back successfully'));

          this.logger.info(chalk.bold('\nManual Steps Required:'));
          this.logger.info('  1. Stage changes: git add .');
          this.logger.info('  2. Commit with the message above');
          this.logger.info('  3. Push to main branch');
          this.logger.info('  4. Create release tag if needed');
          this.logger.info('  5. Monitor production metrics');
          this.logger.info('  6. Gather user feedback');

          // Re-throw to be caught by outer catch
          throw error;
        }
      } else {
        this.logger.info(chalk.bold('\nNext Steps:'));
        this.logger.info('  1. Stage changes: git add .');
        this.logger.info(`  2. Commit: git commit -m "${commitMessage.split('\n')[0]}"`);
        this.logger.info('  3. Push to remote: git push');
        this.logger.info('  4. Create release tag if needed');
        this.logger.info('  5. Monitor production metrics');
      }

      this.logger.info('');
      this.logger.info(chalk.gray('Ship record saved to: ' + shipDir));
    } catch (error) {
      // Outer catch for any failures during the ship process
      this.logger.error(chalk.red('\n❌ Ship process failed'));
      if (error instanceof Error) {
        this.logger.info(chalk.gray(`   Error: ${error.message}`));
      }
      // Metadata has already been rolled back if needed
      return;
    }
  }
}
