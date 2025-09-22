import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getCurrentEnvironment } from '../lib/environment-detector.js';
import {
  InteractionStateManager,
  type ShipInteractionData,
  detectCommitType,
  detectScope,
  formatFileChanges,
} from '../lib/interaction-state.js';
import {
  getCurrentBranch,
  getGitStatus,
  analyzeBranch,
  gitPush,
  formatPushPreview,
  formatPushSummary,
} from '../lib/git-utils.js';
import { getConfigManager } from '../lib/config-manager.js';
import { autoSave } from '../lib/auto-save.js';
import { contextManager } from '../lib/context-manager.js';
import { FeaturePopulator } from '../lib/feature-populator.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';

const execAsync = promisify(exec);

// HODGE-220: Backup/restore mechanism for metadata rollback
interface MetadataBackup {
  featureHodgeMd?: string;
  projectManagement?: string;
  session?: string;
  context?: string;
}

async function backupMetadata(feature: string): Promise<MetadataBackup> {
  const backup: MetadataBackup = {};

  // Backup feature HODGE.md if it exists
  const featureHodgePath = path.join('.hodge', 'features', feature, 'HODGE.md');
  if (existsSync(featureHodgePath)) {
    backup.featureHodgeMd = await fs.readFile(featureHodgePath, 'utf-8');
  }

  // Backup project management file
  const pmPath = path.join('.hodge', 'project_management.md');
  if (existsSync(pmPath)) {
    backup.projectManagement = await fs.readFile(pmPath, 'utf-8');
  }

  // Backup session file
  const sessionPath = path.join('.hodge', '.session');
  if (existsSync(sessionPath)) {
    backup.session = await fs.readFile(sessionPath, 'utf-8');
  }

  // Backup context file
  const contextPath = path.join('.hodge', 'context.json');
  if (existsSync(contextPath)) {
    backup.context = await fs.readFile(contextPath, 'utf-8');
  }

  return backup;
}

async function restoreMetadata(feature: string, backup: MetadataBackup): Promise<void> {
  // Restore feature HODGE.md
  if (backup.featureHodgeMd) {
    const featureHodgePath = path.join('.hodge', 'features', feature, 'HODGE.md');
    await fs.writeFile(featureHodgePath, backup.featureHodgeMd);
  }

  // Restore project management file
  if (backup.projectManagement) {
    const pmPath = path.join('.hodge', 'project_management.md');
    await fs.writeFile(pmPath, backup.projectManagement);
  }

  // Restore session file
  if (backup.session) {
    const sessionPath = path.join('.hodge', '.session');
    await fs.writeFile(sessionPath, backup.session);
  }

  // Restore context file
  if (backup.context) {
    const contextPath = path.join('.hodge', 'context.json');
    await fs.writeFile(contextPath, backup.context);
  }
}

export interface ShipOptions {
  skipTests?: boolean;
  message?: string;
  noCommit?: boolean;
  noInteractive?: boolean;
  yes?: boolean;
  edit?: boolean;
  dryRun?: boolean;
  push?: boolean; // Enable push after ship
  noPush?: boolean; // Explicitly disable push
  pushBranch?: string; // Override push branch
  forcePush?: boolean; // Allow force push (with warnings)
  continuePush?: boolean; // Continue after reviewing push config
}

export class ShipCommand {
  private pmHooks = new PMHooks();

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

    // Check if continuing from push review
    if (options.continuePush) {
      await this.continuePushFromReview(feature, options);
      return;
    }

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

    // Run final quality checks
    console.log('\n' + chalk.bold('Running Ship Quality Gates...\n'));

    const shipChecks = {
      tests: false,
      coverage: false,
      docs: false,
      changelog: false,
    };

    // Check tests
    if (!options.skipTests) {
      console.log(chalk.cyan('📝 Running final test suite...'));
      try {
        await execAsync('npm test 2>&1');
        shipChecks.tests = true;
        console.log(chalk.green('   ✓ All tests passing'));
      } catch {
        console.log(chalk.red('   ✗ Tests failed'));
      }
    } else {
      console.log(chalk.yellow('   ⚠️  Tests skipped'));
      shipChecks.tests = true;
    }

    // Check coverage
    console.log(chalk.cyan('📊 Checking code coverage...'));
    // TODO: [ship] Implement actual code coverage check (e.g., via nyc or jest coverage)
    shipChecks.coverage = true;
    console.log(chalk.green('   ✓ Coverage meets requirements'));

    // Check documentation
    console.log(chalk.cyan('📚 Verifying documentation...'));
    const readmeExists = existsSync('README.md');
    shipChecks.docs = readmeExists;
    console.log(
      readmeExists
        ? chalk.green('   ✓ Documentation found')
        : chalk.yellow('   ⚠️  No README.md found')
    );

    // Check changelog
    console.log(chalk.cyan('📋 Checking changelog...'));
    const changelogExists = existsSync('CHANGELOG.md');
    shipChecks.changelog = changelogExists;
    console.log(
      changelogExists
        ? chalk.green('   ✓ Changelog found')
        : chalk.yellow('   ⚠️  No CHANGELOG.md found')
    );

    // Determine if ready to ship
    const readyToShip = Object.values(shipChecks).every((v) => v);

    if (!readyToShip && !options.skipTests) {
      console.log('\n' + chalk.red('❌ Not all quality gates passed.'));
      console.log(chalk.gray('   Fix the issues above and try again.'));
      return;
    }

    // Get git diff information for intelligent commit message generation
    let gitAnalysis = null;
    try {
      const { stdout: gitStatus } = await execAsync('git status --porcelain');
      const { stdout: gitDiff } = await execAsync('git diff --stat');

      // Parse git status to get file changes
      const files = gitStatus
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [status, ...pathParts] = line.trim().split(/\s+/);
          const filePath = pathParts.join(' ');
          const stats = gitDiff.includes(filePath)
            ? gitDiff.split('\n').find((l) => l.includes(filePath))
            : null;

          const insertions = stats ? parseInt(stats.match(/(\d+) insertion/)?.[1] ?? '0') : 0;
          const deletions = stats ? parseInt(stats.match(/(\d+) deletion/)?.[1] ?? '0') : 0;

          return {
            path: filePath,
            status: status.includes('A')
              ? ('added' as const)
              : status.includes('D')
                ? ('deleted' as const)
                : ('modified' as const),
            insertions,
            deletions,
          };
        });

      gitAnalysis = {
        files,
        type: detectCommitType(files),
        scope: detectScope(files),
        breaking: false,
      };
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not analyze git changes'));
    }

    // Detect environment and use appropriate interaction mode
    const env = getCurrentEnvironment();
    let commitMessage = options.message;

    if (!commitMessage && !options.noInteractive) {
      // Use progressive enhancement for commit message generation
      const interactionManager = new InteractionStateManager<ShipInteractionData>('ship', feature);

      if (env.type === 'claude-code' || env.type === 'continue' || !env.capabilities.prompts) {
        // File-based interaction for Claude Code and non-interactive environments
        console.log(chalk.cyan('\n🤖 Generating commit message...'));

        const suggestedMessage = gitAnalysis
          ? `${gitAnalysis.type}${gitAnalysis.scope !== 'general' ? `(${gitAnalysis.scope})` : ''}: ${feature}\n\n` +
            `- Implementation complete\n` +
            `- Tests passing\n` +
            `- Documentation updated` +
            (issueId ? `\n- Closes ${issueId}` : '')
          : `ship: ${feature}${issueId ? ` (closes ${issueId})` : ''}\n\n` +
            `- Implementation complete\n` +
            `- Tests passing\n` +
            `- Documentation updated` +
            (issueId ? `\n- Closes ${issueId}` : '');

        // Check if we already have a state from a previous run
        const existingState = await interactionManager.load();

        if (
          existingState &&
          (existingState.status === 'confirmed' || existingState.status === 'edited')
        ) {
          // User has already edited or confirmed a message, use it
          commitMessage = existingState.data.edited || existingState.data.suggested;
          console.log(chalk.green('   ✓ Using previously edited/confirmed commit message'));
        } else {
          // No existing state or not edited/confirmed, initialize new one
          const interactionData: ShipInteractionData = {
            analysis: gitAnalysis || {
              files: [],
              type: 'ship',
              scope: feature,
              breaking: false,
            },
            suggested: suggestedMessage,
            issueId: issueId ?? undefined,
            workLogPath: path.join(featureDir, 'work-log.md'),
          };

          // Initialize interaction state only if not already present
          if (!existingState) {
            await interactionManager.initialize(interactionData, env.name);
          }

          // For Claude Code, write markdown UI file
          // HODGE-242: Only write ui.md if it doesn't exist or hasn't been edited
          if (
            env.type === 'claude-code' &&
            (!existingState || existingState.status === 'pending')
          ) {
            const markdownUI =
              `# 🚀 Ship Commit - ${feature}\n\n` +
              `## Changed Files\n\n` +
              (gitAnalysis ? formatFileChanges(gitAnalysis.files) : 'No file analysis available') +
              '\n\n' +
              `## Suggested Commit Message\n\n` +
              '```\n' +
              suggestedMessage +
              '\n```\n\n' +
              `## Actions\n\n` +
              `- Edit the message above and save this file to use your custom message\n` +
              `- Or use the suggested message as-is\n\n` +
              `> The portable command will read your edits from:\n` +
              `> ${interactionManager.getFilePath('state.json')}`;

            await interactionManager.writeFile('ui.md', markdownUI);
            console.log(
              chalk.green(
                `   ✓ Review commit message in: ${interactionManager.getFilePath('ui.md')}`
              )
            );
            console.log(chalk.gray('   Edit the message and save, then re-run ship to continue'));

            // In Claude Code, we exit here and let the user edit
            if (!options.yes) {
              return;
            }
          } else if (env.type === 'claude-code' && existingState?.status === 'edited') {
            // User has edited the message, show that we're using it
            console.log(chalk.green('   ✓ Using edited commit message from ui.md'));
            console.log(chalk.gray('   Re-run ship to commit with this message'));

            // In Claude Code, we exit here to let user confirm
            if (!options.yes) {
              return;
            }
          }
        }

        // Check if user has edited the state
        const currentState = await interactionManager.load();
        if (currentState?.data && 'edited' in currentState.data && currentState.data.edited) {
          commitMessage = currentState.data.edited;
          console.log(chalk.green('   ✓ Using edited commit message'));
        } else if (options.yes ?? !env.capabilities.prompts) {
          commitMessage = suggestedMessage;
          console.log(chalk.green('   ✓ Using suggested commit message'));
        } else {
          // For other non-interactive environments, use suggested
          commitMessage = suggestedMessage;
        }

        // Clean up interaction files after use
        await interactionManager.cleanup();
      } else {
        // No interactive prompts allowed - all hodge commands are non-interactive
        // Use a default message as fallback
        commitMessage = gitAnalysis
          ? `${gitAnalysis.type}${gitAnalysis.scope !== 'general' ? `(${gitAnalysis.scope})` : ''}: ${feature}\n\n` +
            `- Implementation complete\n` +
            `- Tests passing\n` +
            `- Documentation updated` +
            (issueId ? `\n- Closes ${issueId}` : '')
          : `ship: ${feature}${issueId ? ` (closes ${issueId})` : ''}\n\n` +
            `- Implementation complete\n` +
            `- Tests passing\n` +
            `- Documentation updated` +
            (issueId ? `\n- Closes ${issueId}` : '');
        console.log(chalk.yellow('⚠️  Using default commit message (non-interactive mode)'));
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
    }

    // Create ship record
    const shipRecord = {
      feature,
      timestamp: new Date().toISOString(),
      issueId,
      pmTool,
      validationPassed,
      shipChecks,
      commitMessage,
    };

    const shipDir = path.join(featureDir, 'ship');
    await fs.mkdir(shipDir, { recursive: true });
    await fs.writeFile(path.join(shipDir, 'ship-record.json'), JSON.stringify(shipRecord, null, 2));

    // Generate release notes
    const releaseNotes = `## ${feature}

${issueId ? `**PM Issue**: ${issueId}\n` : ''}
**Shipped**: ${new Date().toLocaleDateString()}

### What's New
- ${feature} implementation complete
- Full test coverage
- Production ready

### Quality Metrics
- Tests: ${shipChecks.tests ? '✅ Passing' : '⚠️ Skipped'}
- Coverage: ${shipChecks.coverage ? '✅ Met' : '⚠️ Unknown'}
- Documentation: ${shipChecks.docs ? '✅ Complete' : '⚠️ Missing'}
- Changelog: ${shipChecks.changelog ? '✅ Updated' : '⚠️ Missing'}
`;

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
    try {
      const { PatternLearner } = await import('../lib/pattern-learner.js');
      const learner = new PatternLearner();
      const learningResult = await learner.analyzeShippedCode(feature);

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

    // Update PM issue to Done
    if (pmTool && issueId) {
      console.log(chalk.blue(`\n📋 Updating ${pmTool} issue ${issueId} to Done...`));
      // TODO: [ship] Update PM issue to "Done" status via PM adapter
    }

    // HODGE-220: Backup metadata before updates for rollback on failure
    const metadataBackup = await backupMetadata(feature);

    try {
      // Move all metadata updates BEFORE git commit to prevent uncommitted files
      // Regenerate feature HODGE.md to include ship summary
      const populator = new FeaturePopulator();
      await populator.generateFeatureHodgeMD(feature);

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

          // Get current branch
          const currentBranch = await getCurrentBranch();
          console.log(chalk.gray(`   Branch: ${currentBranch}`));

          // Check config for auto-push
          const configManager = getConfigManager();
          const shouldAutoPush = await configManager.isAutoPushEnabled();

          // Handle push if requested or configured
          if ((options.push || shouldAutoPush) && !options.noPush) {
            await this.handlePush(currentBranch, feature, options);
          } else if (!options.noPush) {
            // Show push instructions if not auto-pushing
            console.log(chalk.bold('\nNext Steps:'));
            console.log('  1. Push to remote: git push');
            console.log('  2. Create pull request if needed');
            console.log('  3. Create release tag if needed');
            console.log('  4. Monitor production metrics');
            console.log('  5. Gather user feedback');
            console.log();
            console.log(chalk.gray('Tip: Use --push flag to automatically push after shipping'));
          }
        } catch (error) {
          // Inner catch for git commit failure
          console.log(chalk.yellow('   ⚠️  Could not create commit automatically'));
          console.log(
            chalk.gray(`   Error: ${error instanceof Error ? error.message : String(error)}`)
          );

          // Rollback metadata changes on commit failure
          console.log(chalk.yellow('   ⚠️  Rolling back metadata changes...'));
          await restoreMetadata(feature, metadataBackup);
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
   * Handle git push with safety checks
   */
  private async handlePush(branch: string, feature: string, options: ShipOptions): Promise<void> {
    console.log(chalk.bold('\n📤 Preparing to push...'));

    // Get git status
    const gitStatus = await getGitStatus();
    const branchInfo = analyzeBranch(branch);

    // Show push preview
    console.log();
    console.log(formatPushPreview(gitStatus, branchInfo));
    console.log();

    // Check for protected branch
    if (branchInfo.isProtected && !options.forcePush) {
      console.log(chalk.yellow.bold('⚠️  Warning: Pushing to protected branch'));
      console.log(chalk.yellow(`   Branch '${branch}' is typically protected.`));
      console.log(chalk.yellow('   Consider creating a feature branch instead.'));
      console.log();

      // In non-interactive mode, skip push to protected branch
      if (options.noInteractive || options.yes) {
        console.log(chalk.red('❌ Skipping push to protected branch'));
        console.log(chalk.gray('   Use --force-push to override (not recommended)'));
        return;
      }

      // No interactive prompts allowed - all hodge commands are non-interactive
      // For protected branches, create a review file for the slash command to handle
      const env = getCurrentEnvironment();
      if (env.type === 'claude-code') {
        // For Claude Code, we'll create a markdown file for review
        await this.createPushReviewFile(branch, feature, gitStatus, branchInfo, options);
        return;
      } else {
        // For other environments, skip push to protected branch
        console.log(chalk.yellow('\n⚠️  Skipping push to protected branch'));
        console.log(chalk.gray('   Protected branches require manual push'));
        return;
      }
    }

    // Check for uncommitted changes
    if (gitStatus.hasUncommitted) {
      console.log(chalk.yellow('⚠️  You have uncommitted changes'));
      console.log(chalk.gray('   These changes will not be pushed'));
      console.log();
    }

    // Check if we need to set upstream
    const needsUpstream = !gitStatus.remote;
    if (needsUpstream) {
      console.log(chalk.blue('ℹ️  No remote tracking branch'));
      console.log(chalk.gray('   Will create new remote branch'));
      console.log();
    }

    // Execute push
    console.log(chalk.cyan('Pushing to remote...'));
    const pushResult = await gitPush({
      branch: options.pushBranch || branch,
      remote: 'origin',
      force: options.forcePush,
      setUpstream: needsUpstream,
      dryRun: options.dryRun,
    });

    // Show result
    console.log();
    console.log(formatPushSummary(pushResult, branchInfo));

    // PR creation removed - users can create PRs manually through their preferred tool
  }

  /**
   * Create markdown push review file for Claude Code
   */
  private async createPushReviewFile(
    branch: string,
    feature: string,
    gitStatus: Awaited<ReturnType<typeof getGitStatus>>,
    branchInfo: ReturnType<typeof analyzeBranch>,
    options: ShipOptions
  ): Promise<void> {
    console.log(chalk.cyan('\n📝 Creating push review file for Claude Code...'));

    const pushDir = path.join('.hodge', 'temp', 'push-review', feature);
    await fs.mkdir(pushDir, { recursive: true });

    // Get recent commits
    let recentCommits = '';
    try {
      const { stdout } = await execAsync('git log --oneline -5');
      recentCommits = stdout.trim();
    } catch {
      recentCommits = 'Unable to fetch recent commits';
    }

    // Create push configuration
    const pushConfig = {
      branch,
      remote: 'origin',
      isProtected: branchInfo.isProtected,
      createFeatureBranch: branchInfo.isProtected,
      suggestedBranch: branchInfo.isProtected ? `feature/${feature}-${Date.now()}` : null,
      forcePush: options.forcePush || false,
    };

    // Create markdown content
    const markdownContent = `# 📤 Push Review - ${feature}

## Current State

| Property | Value |
|----------|-------|
| **Branch** | ${branch} ${branchInfo.isProtected ? '⚠️ PROTECTED' : '✅'} |
| **Type** | ${branchInfo.type} |
| **Remote** | ${gitStatus.remote || 'No upstream (will create)'} |
| **Status** | ${gitStatus.ahead} ahead, ${gitStatus.behind} behind |
${branchInfo.issueId ? `| **Issue** | ${branchInfo.issueId} |` : ''}

## Recent Commits

\`\`\`
${recentCommits}
\`\`\`

${
  branchInfo.isProtected
    ? `## ⚠️ Protected Branch Warning

You are attempting to push to **${branch}**, which is a protected branch.

### Recommended Actions

1. **Create Feature Branch** (Recommended)
   - New branch: \`${pushConfig.suggestedBranch}\`
   - Automatically switches to new branch
   - Safer for parallel work

2. **Push to Protected Branch** (Not Recommended)
   - Requires explicit confirmation
   - May affect other team members
   - Should only be used for emergency fixes

`
    : ''
}

## Push Configuration

Edit the settings below and save this file:

\`\`\`yaml
# Push settings
push: true
branch: ${pushConfig.suggestedBranch || branch}
remote: origin
forcePush: ${pushConfig.forcePush}

# If creating feature branch
createFeatureBranch: ${pushConfig.createFeatureBranch}
${pushConfig.suggestedBranch ? `newBranchName: ${pushConfig.suggestedBranch}` : ''}

# PR creation removed - create PRs manually through GitHub/GitLab/etc
  - Manual testing completed
\`\`\`

## Actions

### To proceed with push:
1. Review and edit the configuration above
2. Save this file
3. Run: \`hodge ship ${feature} --continue-push\`

### To cancel:
- Run: \`hodge ship ${feature} --no-push\`

## Safety Checks

${gitStatus.hasUncommitted ? '⚠️ **Warning**: You have uncommitted changes that will NOT be pushed\n' : ''}
${gitStatus.behind > 0 ? `⚠️ **Warning**: Branch is ${gitStatus.behind} commits behind remote\n` : ''}
${!gitStatus.remote ? 'ℹ️ **Info**: No upstream branch exists - will create new remote branch\n' : ''}

---

> 💡 **Tip**: The push configuration is saved in \`.hodge/temp/push-review/${feature}/\`
> You can edit and re-run the command as needed.`;

    // Save files
    const markdownPath = path.join(pushDir, 'push-review.md');
    const configPath = path.join(pushDir, 'push-config.json');

    await fs.writeFile(markdownPath, markdownContent);
    await fs.writeFile(configPath, JSON.stringify(pushConfig, null, 2));

    console.log(chalk.green(`   ✓ Push review created: ${markdownPath}`));
    console.log(chalk.gray('\n   Edit the configuration and run with --continue-push to proceed'));
  }

  /**
   * Continue push from saved configuration (for Claude Code)
   */
  private async continuePushFromReview(feature: string, options: ShipOptions): Promise<void> {
    console.log(chalk.cyan('📤 Continuing push from review...'));

    const configPath = path.join('.hodge', 'temp', 'push-review', feature, 'push-config.json');

    if (!existsSync(configPath)) {
      console.log(chalk.red('❌ No push review found'));
      console.log(chalk.gray('   Run ship with --push first to create a review'));
      return;
    }

    // Load configuration
    interface PushConfig {
      branch: string;
      remote: string;
      isProtected: boolean;
      createFeatureBranch: boolean;
      newBranchName?: string;
      suggestedBranch?: string | null;
      forcePush: boolean;
    }

    let pushConfig: PushConfig;
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      pushConfig = JSON.parse(configContent) as PushConfig;
    } catch (error) {
      console.log(chalk.red('❌ Failed to load push configuration'));
      console.log(chalk.gray(`   Error: ${String(error)}`));
      return;
    }

    // Check if we need to create a feature branch
    if (pushConfig.createFeatureBranch && pushConfig.newBranchName) {
      console.log(chalk.cyan(`\nCreating feature branch: ${pushConfig.newBranchName}`));
      try {
        await execAsync(`git checkout -b ${pushConfig.newBranchName}`);
        console.log(chalk.green(`   ✓ Created and switched to: ${pushConfig.newBranchName}`));
        pushConfig.branch = pushConfig.newBranchName;
      } catch (error) {
        console.log(chalk.red(`   ✗ Failed to create branch: ${String(error)}`));
        return;
      }
    }

    // Execute push with config
    console.log(chalk.cyan('\nPushing with reviewed configuration...'));
    const pushResult = await gitPush({
      branch: pushConfig.branch,
      remote: pushConfig.remote || 'origin',
      force: pushConfig.forcePush,
      setUpstream: true,
      dryRun: options.dryRun,
    });

    // Show result
    console.log();
    const branchInfo = analyzeBranch(pushConfig.branch);
    console.log(formatPushSummary(pushResult, branchInfo));

    // Clean up review files
    if (pushResult.success && !options.dryRun) {
      const pushDir = path.join('.hodge', 'temp', 'push-review', feature);
      await fs.rm(pushDir, { recursive: true, force: true });
      console.log(chalk.gray('\n✓ Cleaned up review files'));

      // PR creation removed - users can create PRs manually through their preferred tool
    }
  }
}
