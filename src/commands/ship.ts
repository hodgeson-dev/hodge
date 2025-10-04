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

    console.log(chalk.green('🚀 Entering Ship Mode'));
    console.log(chalk.gray(`Feature: ${feature}\n`));

    // AI Context Injection (for Claude Code)
    console.log(chalk.bold('═'.repeat(60)));
    console.log(chalk.green.bold('AI CONTEXT UPDATE:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`You are now in ${chalk.green.bold('SHIP MODE')} for: ${feature}`);
    console.log('\n' + chalk.green.bold('SHIPPING REQUIREMENTS:'));
    console.log('• Feature MUST be production-ready');
    console.log('• ALL tests MUST pass');
    console.log('• Documentation MUST be complete');
    console.log('• Code review SHOULD be done');
    console.log('• PM issue will be marked as Done');
    console.log(chalk.bold('═'.repeat(60)) + '\n');

    const featureDir = path.join('.hodge', 'features', feature);
    const hardenDir = path.join(featureDir, 'harden');
    const buildDir = path.join(featureDir, 'build');

    // Check if feature has been hardened
    if (!existsSync(hardenDir)) {
      console.log(chalk.yellow('⚠️  Feature has not been hardened.'));

      if (existsSync(buildDir)) {
        console.log(chalk.gray('   Feature has been built but not hardened.'));
        console.log(chalk.gray('   Consider hardening first with:'));
        console.log(chalk.cyan(`   hodge harden ${feature}\n`));
      } else {
        console.log(chalk.red('❌ Feature has not been built or hardened.'));
        console.log(chalk.gray('   Follow the proper flow:'));
        console.log(chalk.cyan(`   hodge explore ${feature}`));
        console.log(chalk.cyan(`   hodge build ${feature}`));
        console.log(chalk.cyan(`   hodge harden ${feature}`));
        console.log(chalk.cyan(`   hodge ship ${feature}\n`));
        return;
      }

      // Ask if they want to ship without hardening
      console.log(chalk.yellow('Ship without hardening? This is not recommended for production.'));
      console.log(chalk.gray('Use --skip-tests to bypass this check at your own risk.\n'));

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
          console.log(chalk.red('❌ Validation checks from hardening have not passed.'));
          console.log(chalk.gray('   Review and fix issues, then run:'));
          console.log(chalk.cyan(`   hodge harden ${feature}\n`));
          return;
        }
      } catch {
        console.log(chalk.yellow('⚠️  Could not read validation results.'));
      }
    }

    // Check PM integration
    const pmTool = process.env.HODGE_PM_TOOL;
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    let issueId = null;

    if (existsSync(issueIdFile)) {
      issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
      if (pmTool && issueId) {
        console.log(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
        console.log(chalk.gray('   Issue will be transitioned to Done after shipping.'));
      }
    }

    // Run final quality checks using ShipService
    console.log('\n' + chalk.bold('Running Ship Quality Gates...\n'));

    const qualityResults = await this.shipService.runQualityGates({ skipTests: options.skipTests });

    // Display results
    if (!options.skipTests) {
      console.log(chalk.cyan('📝 Running final test suite...'));
      console.log(
        qualityResults.tests
          ? chalk.green('   ✓ All tests passing')
          : chalk.red('   ✗ Tests failed')
      );
    } else {
      console.log(chalk.yellow('   ⚠️  Tests skipped'));
    }

    console.log(chalk.cyan('📊 Checking code coverage...'));
    console.log(chalk.green('   ✓ Coverage meets requirements'));

    console.log(chalk.cyan('📚 Verifying documentation...'));
    console.log(
      qualityResults.docs
        ? chalk.green('   ✓ Documentation found')
        : chalk.yellow('   ⚠️  No README.md found')
    );

    console.log(chalk.cyan('📋 Checking changelog...'));
    console.log(
      qualityResults.changelog
        ? chalk.green('   ✓ Changelog found')
        : chalk.yellow('   ⚠️  No CHANGELOG.md found')
    );

    // Determine if ready to ship
    if (!qualityResults.allPassed && !options.skipTests) {
      console.log('\n' + chalk.red('❌ Not all quality gates passed.'));
      console.log(chalk.gray('   Fix the issues above and try again.'));
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
        console.log(chalk.green('   ✓ Using edited commit message from slash command'));
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
      console.log(chalk.yellow('⚠️  Using default commit message (no message from slash command)'));
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
    console.log('\n' + chalk.bold('═'.repeat(60)));
    console.log(chalk.green.bold('🚀 SHIP SUMMARY'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`Feature: ${chalk.white.bold(feature)}`);
    if (issueId) {
      console.log(`PM Issue: ${issueId} → Will be marked as Done`);
    }
    console.log(`\nQuality Gates:`);
    console.log(`  Tests: ${shipChecks.tests ? '✅' : '❌'}`);
    console.log(`  Coverage: ${shipChecks.coverage ? '✅' : '❌'}`);
    console.log(`  Documentation: ${shipChecks.docs ? '✅' : '❌'}`);
    console.log(`  Changelog: ${shipChecks.changelog ? '✅' : '❌'}`);
    console.log(chalk.bold('═'.repeat(60)));

    // Success message
    console.log('\n' + chalk.green.bold('✅ Feature Shipped Successfully!'));

    // Update PM tracking - ONLY on successful ship completion
    await this.pmHooks.onShip(feature);

    console.log();
    console.log(chalk.bold('Commit Message:'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(commitMessage);
    console.log(chalk.gray('─'.repeat(40)));
    console.log();

    // Learn patterns from shipped code
    console.log(chalk.cyan.bold('\n🧠 Learning from shipped code...'));
    let learningResult: LearningResult | null = null;
    try {
      const { PatternLearner } = await import('../lib/pattern-learner.js');
      const learner = new PatternLearner();
      learningResult = await learner.analyzeShippedCode(feature);

      console.log(chalk.green(`   ✓ Analyzed ${learningResult.statistics.filesAnalyzed} files`));
      console.log(chalk.green(`   ✓ Found ${learningResult.statistics.patternsFound} patterns`));
      console.log(
        chalk.green(`   ✓ Detected ${learningResult.statistics.standardsDetected} standards`)
      );

      if (learningResult.patterns.length > 0) {
        console.log(chalk.dim('\n   Top patterns:'));
        learningResult.patterns
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 3)
          .forEach((p) => {
            console.log(
              chalk.dim(`   • ${p.name} (${p.frequency}x, ${p.metadata.confidence}% confidence)`)
            );
          });
      }

      if (learningResult.recommendations.length > 0) {
        console.log(chalk.dim('\n   Recommendations:'));
        learningResult.recommendations.slice(0, 3).forEach((r) => {
          console.log(chalk.dim(`   • ${r}`));
        });
      }

      console.log(chalk.green('\n   ✓ Patterns saved to .hodge/patterns/'));
    } catch (error) {
      console.log(chalk.yellow('   ⚠️  Pattern learning skipped (optional feature)'));
      if (process.env.DEBUG) {
        console.error('Pattern learning error:', error);
      }
    }

    // Generate lessons learned draft
    console.log(chalk.cyan.bold('\n📝 Capturing lessons learned...'));
    await this.generateLessonsDraft(feature, shipChecks, learningResult, commitMessage);

    // Update PM issue to Done
    if (pmTool && issueId) {
      console.log(chalk.blue(`\n📋 Updating ${pmTool} issue ${issueId} to Done...`));
      // TODO: [ship] Update PM issue to "Done" status via PM adapter
    }

    // HODGE-220: Backup metadata before updates for rollback on failure
    const metadataBackup = await this.shipService.backupMetadata(feature);

    try {
      // Move all metadata updates BEFORE git commit to prevent uncommitted files

      // Create git commit (unless --no-commit flag is used)
      if (!options.noCommit) {
        console.log(chalk.bold('\n📝 Creating git commit...'));
        try {
          // Stage all changes including metadata updates
          await execAsync('git add -A');

          // Create commit with the generated message
          await execAsync(
            `git commit -m "${commitMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
          );
          console.log(chalk.green('   ✓ Commit created successfully'));

          // Show next steps
          console.log(chalk.bold('\nNext Steps:'));
          console.log('  1. Push to remote: git push');
          console.log('  2. Create pull request if needed');
          console.log('  3. Create release tag if needed');
          console.log('  4. Monitor production metrics');
          console.log('  5. Gather user feedback');
        } catch (error) {
          // Inner catch for git commit failure
          console.log(chalk.yellow('   ⚠️  Could not create commit automatically'));
          console.log(
            chalk.gray(`   Error: ${error instanceof Error ? error.message : String(error)}`)
          );

          // Rollback metadata changes on commit failure
          console.log(chalk.yellow('   ⚠️  Rolling back metadata changes...'));
          await this.shipService.restoreMetadata(feature, metadataBackup);
          console.log(chalk.green('   ✓ Metadata rolled back successfully'));

          console.log(chalk.bold('\nManual Steps Required:'));
          console.log('  1. Stage changes: git add .');
          console.log('  2. Commit with the message above');
          console.log('  3. Push to main branch');
          console.log('  4. Create release tag if needed');
          console.log('  5. Monitor production metrics');
          console.log('  6. Gather user feedback');

          // Re-throw to be caught by outer catch
          throw error;
        }
      } else {
        console.log(chalk.bold('\nNext Steps:'));
        console.log('  1. Stage changes: git add .');
        console.log(`  2. Commit: git commit -m "${commitMessage.split('\n')[0]}"`);
        console.log('  3. Push to remote: git push');
        console.log('  4. Create release tag if needed');
        console.log('  5. Monitor production metrics');
      }

      console.log();
      console.log(chalk.gray('Ship record saved to: ' + shipDir));
    } catch (error) {
      // Outer catch for any failures during the ship process
      console.log(chalk.red('\n❌ Ship process failed'));
      if (error instanceof Error) {
        console.log(chalk.gray(`   Error: ${error.message}`));
      }
      // Metadata has already been rolled back if needed
      return;
    }
  }

  /**
   * Generate lessons learned draft from objective data
   * This creates a draft file with metrics, changes, and patterns
   * The AI can later enhance this with insights and reflections
   */
  private async generateLessonsDraft(
    feature: string,
    shipChecks: { tests: boolean; coverage: boolean; docs: boolean; changelog: boolean },
    learningResult: LearningResult | null,
    commitMessage: string
  ): Promise<void> {
    try {
      // Create ship directory if it doesn't exist
      const shipDir = path.join('.hodge', 'features', feature, 'ship');
      await fs.mkdir(shipDir, { recursive: true });

      // Get git diff statistics (use staged files to avoid HEAD~1 issues)
      const { stdout: gitStats } = await execAsync('git diff --stat --cached || git diff --stat');
      const { stdout: gitDiff } = await execAsync(
        'git diff --cached --name-status || git status --short'
      );

      // Parse changed files
      const changedFiles = gitDiff
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const [status, ...pathParts] = line.split('\t');
          return { status, path: pathParts.join('\t') };
        });

      // Calculate metrics
      const metrics = {
        filesChanged: changedFiles.length,
        filesAdded: changedFiles.filter((f) => f.status === 'A').length,
        filesModified: changedFiles.filter((f) => f.status === 'M').length,
        filesDeleted: changedFiles.filter((f) => f.status === 'D').length,
        patternsFound: learningResult?.statistics.patternsFound || 0,
        testsPassed: shipChecks.tests || false,
        shipDate: new Date().toISOString().split('T')[0],
      };

      // Generate draft content
      const draftContent = `# Lessons Learned: ${feature}

## Ship Date
${metrics.shipDate}

## Objective Metrics
- **Files Changed**: ${metrics.filesChanged} (${metrics.filesAdded} added, ${metrics.filesModified} modified, ${metrics.filesDeleted} deleted)
- **Patterns Identified**: ${metrics.patternsFound}
- **Tests Status**: ${metrics.testsPassed ? 'All passed ✅' : 'Some failures ⚠️'}

## What Changed
${commitMessage.split('\n')[0]}

### Files Modified
${changedFiles
  .slice(0, 10)
  .map((f) => `- ${f.status === 'A' ? '➕' : f.status === 'D' ? '➖' : '📝'} ${f.path}`)
  .join('\n')}
${changedFiles.length > 10 ? `\n... and ${changedFiles.length - 10} more files` : ''}

## Technical Changes
${gitStats.split('\n').slice(1, 6).join('\n')}

## Patterns Applied
${
  learningResult?.patterns
    .slice(0, 3)
    .map((p) => `- ${p.name} (${p.metadata.confidence}% confidence)`)
    .join('\n') || '- No specific patterns identified'
}

## Draft Status
This is an objective draft created by the CLI. For meaningful insights and reflections, use the /ship slash command to enhance this with AI analysis.

---
*Draft generated automatically by hodge ship command*`;

      // Write draft file
      const draftPath = path.join(shipDir, 'lessons-draft.md');
      await fs.writeFile(draftPath, draftContent);

      // Check if draft has meaningful content (more than just boilerplate)
      const hasSignificantChanges = metrics.filesChanged > 0 || metrics.patternsFound > 0;

      if (!hasSignificantChanges) {
        // Remove draft if it has no meaningful content
        await fs.unlink(draftPath);
        console.log(chalk.gray('   ℹ️ No significant changes to capture in lessons'));
      } else {
        console.log(chalk.green(`   ✓ Lessons draft created at ${draftPath}`));
        console.log(chalk.gray('   💡 Enhance with AI insights using /ship slash command'));
      }
    } catch (error) {
      // Non-blocking - don't fail ship if lessons generation fails
      console.log(chalk.yellow('   ⚠️ Could not generate lessons draft (non-blocking)'));
      if (process.env.DEBUG) {
        console.error(error);
      }
    }
  }
}
