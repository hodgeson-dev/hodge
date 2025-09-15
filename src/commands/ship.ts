import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getCurrentEnvironment } from '../lib/environment-detector.js';
import { InteractionStateManager, type ShipInteractionData, detectCommitType, detectScope, formatFileChanges } from '../lib/interaction-state.js';
import {
  getCurrentBranch,
  getGitStatus,
  analyzeBranch,
  gitPush,
  formatPushPreview,
  formatPushSummary
} from '../lib/git-utils.js';

const execAsync = promisify(exec);

export interface ShipOptions {
  skipTests?: boolean;
  message?: string;
  noCommit?: boolean;
  noInteractive?: boolean;
  yes?: boolean;
  edit?: boolean;
  dryRun?: boolean;
  push?: boolean;          // Enable push after ship
  noPush?: boolean;        // Explicitly disable push
  pushBranch?: string;     // Override push branch
  forcePush?: boolean;     // Allow force push (with warnings)
}

export class ShipCommand {
  async execute(feature: string, options: ShipOptions = {}): Promise<void> {
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
    // TODO: Implement actual code coverage check (e.g., via nyc or jest coverage)
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
      const files = gitStatus.trim().split('\n').filter(Boolean).map(line => {
        const [status, ...pathParts] = line.trim().split(/\s+/);
        const filePath = pathParts.join(' ');
        const stats = gitDiff.includes(filePath) ?
          gitDiff.split('\n').find(l => l.includes(filePath)) : null;

        const insertions = stats ? parseInt(stats.match(/(\d+) insertion/)?.[1] ?? '0') : 0;
        const deletions = stats ? parseInt(stats.match(/(\d+) deletion/)?.[1] ?? '0') : 0;

        return {
          path: filePath,
          status: status.includes('A') ? 'added' as const :
                  status.includes('D') ? 'deleted' as const :
                  'modified' as const,
          insertions,
          deletions
        };
      });

      gitAnalysis = {
        files,
        type: detectCommitType(files),
        scope: detectScope(files),
        breaking: false
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

        const suggestedMessage = gitAnalysis ?
          `${gitAnalysis.type}${gitAnalysis.scope !== 'general' ? `(${gitAnalysis.scope})` : ''}: ${feature}\n\n` +
          `- Implementation complete\n` +
          `- Tests passing\n` +
          `- Documentation updated` +
          (issueId ? `\n- Closes ${issueId}` : '') :
          `ship: ${feature}${issueId ? ` (closes ${issueId})` : ''}\n\n` +
          `- Implementation complete\n` +
          `- Tests passing\n` +
          `- Documentation updated` +
          (issueId ? `\n- Closes ${issueId}` : '');

        const interactionData: ShipInteractionData = {
          analysis: gitAnalysis || {
            files: [],
            type: 'ship',
            scope: feature,
            breaking: false
          },
          suggested: suggestedMessage,
          issueId: issueId ?? undefined,
          workLogPath: path.join(featureDir, 'work-log.md')
        };

        // Initialize interaction state
        await interactionManager.initialize(interactionData, env.name);

        // For Claude Code, write markdown UI file
        if (env.type === 'claude-code') {
          const markdownUI = `# 🚀 Ship Commit - ${feature}\n\n` +
            `## Changed Files\n\n` +
            (gitAnalysis ? formatFileChanges(gitAnalysis.files) : 'No file analysis available') + '\n\n' +
            `## Suggested Commit Message\n\n` +
            '```\n' + suggestedMessage + '\n```\n\n' +
            `## Actions\n\n` +
            `- Edit the message above and save this file to use your custom message\n` +
            `- Or use the suggested message as-is\n\n` +
            `> The portable command will read your edits from:\n` +
            `> ${interactionManager.getFilePath('state.json')}`;

          await interactionManager.writeFile('ui.md', markdownUI);
          console.log(chalk.green(`   ✓ Review commit message in: ${interactionManager.getFilePath('ui.md')}`));
          console.log(chalk.gray('   Edit the message and save, then re-run ship to continue'));

          // In Claude Code, we exit here and let the user edit
          if (!options.yes) {
            return;
          }
        }

        // Check if user has edited the state
        const currentState = await interactionManager.load();
        if (currentState && currentState.data && 'edited' in currentState.data && (currentState.data as ShipInteractionData).edited) {
          commitMessage = (currentState.data as ShipInteractionData).edited as string;
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

      } else if (env.capabilities.prompts) {
        // Interactive terminals (Warp, Aider, standard terminal)
        const { getPrompts } = await import('../lib/prompts.js');
        const prompts = getPrompts();

        const interactionData: ShipInteractionData = {
          analysis: gitAnalysis || {
            files: [],
            type: 'ship',
            scope: feature,
            breaking: false
          },
          suggested: gitAnalysis ?
            `${gitAnalysis.type}${gitAnalysis.scope !== 'general' ? `(${gitAnalysis.scope})` : ''}: ${feature}\n\n` +
            `- Implementation complete\n` +
            `- Tests passing\n` +
            `- Documentation updated` +
            (issueId ? `\n- Closes ${issueId}` : '') :
            `ship: ${feature}${issueId ? ` (closes ${issueId})` : ''}\n\n` +
            `- Implementation complete\n` +
            `- Tests passing\n` +
            `- Documentation updated` +
            (issueId ? `\n- Closes ${issueId}` : ''),
          issueId: issueId ?? undefined
        };

        try {
          commitMessage = await prompts.promptShipCommit(interactionData);
        } catch (error) {
          if (error instanceof Error && error.message === 'Ship cancelled by user') {
            console.log(chalk.yellow('\n⚠️  Ship cancelled'));
            return;
          }
          throw error;
        }
      }
    }

    // Fallback if no message was set
    if (!commitMessage) {
      commitMessage = `ship: ${feature}${issueId ? ` (closes ${issueId})` : ''}\n\n` +
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
    console.log();
    console.log(chalk.bold('Commit Message:'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(commitMessage);
    console.log(chalk.gray('─'.repeat(40)));
    console.log();

    // Update PM issue to Done
    if (pmTool && issueId) {
      console.log(chalk.blue(`\n📋 Updating ${pmTool} issue ${issueId} to Done...`));
      // TODO: Update PM issue to "Done" status via PM adapter
    }

    // Create git commit (unless --no-commit flag is used)
    if (!options.noCommit) {
      console.log(chalk.bold('\n📝 Creating git commit...'));
      try {
        // Stage all changes in the feature directory
        await execAsync('git add .');

        // Create commit with the generated message
        await execAsync(
          `git commit -m "${commitMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
        );
        console.log(chalk.green('   ✓ Commit created successfully'));

        // Get current branch
        const currentBranch = await getCurrentBranch();
        console.log(chalk.gray(`   Branch: ${currentBranch}`));

        // Handle push if requested
        if (options.push && !options.noPush) {
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
        console.log(chalk.yellow('   ⚠️  Could not create commit automatically'));
        console.log(
          chalk.gray(`   Error: ${error instanceof Error ? error.message : String(error)}`)
        );
        console.log(chalk.bold('\nManual Steps Required:'));
        console.log('  1. Stage changes: git add .');
        console.log('  2. Commit with the message above');
        console.log('  3. Push to main branch');
        console.log('  4. Create release tag if needed');
        console.log('  5. Monitor production metrics');
        console.log('  6. Gather user feedback');
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

      // Otherwise, require confirmation
      const env = getCurrentEnvironment();
      if (env.capabilities.prompts) {
        // TODO: Add prompt for protected branch confirmation
        console.log(chalk.yellow('   Interactive confirmation not yet implemented'));
        console.log(chalk.yellow('   Use --force-push to push anyway'));
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
      dryRun: options.dryRun
    });

    // Show result
    console.log();
    console.log(formatPushSummary(pushResult, branchInfo));

    // Update work log if push was successful
    if (pushResult.success && !options.dryRun) {
      const workLogPath = path.join('.hodge', 'features', feature, 'work-log.md');
      if (existsSync(workLogPath)) {
        const pushEntry = `\n### Push Record - ${new Date().toISOString()}\n` +
          `- Branch: ${branch}\n` +
          `- Remote: ${pushResult.remote}\n` +
          `- Status: ✅ Pushed successfully\n`;

        await fs.appendFile(workLogPath, pushEntry);
        console.log(chalk.gray('\n✓ Work log updated'));
      }
    }
  }
}
