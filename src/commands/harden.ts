import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface HardenOptions {
  skipTests?: boolean;
  autoFix?: boolean;
}

export class HardenCommand {
  async execute(feature: string, options: HardenOptions = {}): Promise<void> {
    // Use optimized version if available
    if (process.env.HODGE_USE_OPTIMIZED || process.env.NODE_ENV === 'production') {
      try {
        const { OptimizedHardenCommand } = await import('./harden-optimized.js');
        const optimizedCommand = new OptimizedHardenCommand();
        return await optimizedCommand.execute(feature, options);
      } catch (error) {
        // Fall back to standard implementation if optimized version fails to load
        console.warn(
          chalk.yellow('Warning: Failed to load optimized harden command, using standard version')
        );
      }
    }

    // Standard implementation follows
    console.log(chalk.magenta('🛡️  Entering Harden Mode'));
    console.log(chalk.gray(`Feature: ${feature}\n`));

    // AI Context Injection (for Claude Code)
    console.log(chalk.bold('═'.repeat(60)));
    console.log(chalk.red.bold('AI CONTEXT UPDATE:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`You are now in ${chalk.red.bold('HARDEN MODE')} for: ${feature}`);
    console.log('\n' + chalk.red.bold('STRICT REQUIREMENTS for AI assistance:'));
    console.log('• ALL standards MUST be followed - NO exceptions');
    console.log('• Use ONLY established patterns');
    console.log('• Include COMPREHENSIVE error handling');
    console.log('• Code MUST be production-ready');
    console.log('• ALL tests MUST pass');
    console.log('• NO warnings or errors allowed');
    console.log(chalk.bold('═'.repeat(60)) + '\n');

    const featureDir = path.join('.hodge', 'features', feature);
    const hardenDir = path.join(featureDir, 'harden');
    const buildDir = path.join(featureDir, 'build');

    // Check for build completion
    if (!existsSync(buildDir)) {
      console.log(chalk.red('❌ No build found for this feature.'));
      console.log(chalk.gray('   Build the feature first with:'));
      console.log(chalk.cyan(`   hodge build ${feature}\n`));
      return;
    }

    // Create harden directory
    await fs.mkdir(hardenDir, { recursive: true });

    // Check for PM integration
    const pmTool = process.env.HODGE_PM_TOOL;
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    let issueId = null;

    if (existsSync(issueIdFile)) {
      issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
      if (pmTool && issueId) {
        console.log(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
        // TODO: Update PM issue status to "In Review" via PM adapter
      }
    }

    // Create harden context
    const context = {
      mode: 'harden',
      feature,
      timestamp: new Date().toISOString(),
      standards: 'enforced',
      validation: 'required',
      pmIssue: issueId,
      pmTool: pmTool || null,
    };

    // Save context
    await fs.writeFile(path.join(hardenDir, 'context.json'), JSON.stringify(context, null, 2));

    console.log(chalk.bold('In Harden Mode:'));
    console.log('  • Standards are ' + chalk.red('strictly enforced'));
    console.log('  • All tests must ' + chalk.red('pass'));
    console.log('  • Code must be ' + chalk.red('production-ready'));
    console.log('  • No warnings or errors ' + chalk.red('allowed') + '\n');

    // Run validation checks
    console.log(chalk.bold('Running validation checks...\n'));

    const results = {
      tests: { passed: false, output: '' },
      lint: { passed: false, output: '' },
      typecheck: { passed: false, output: '' },
      build: { passed: false, output: '' },
    };

    // Run tests
    if (!options.skipTests) {
      console.log(chalk.cyan('📝 Running tests...'));
      try {
        const { stdout, stderr } = await execAsync('npm test 2>&1');
        results.tests.output = stdout + stderr;
        results.tests.passed = !stderr || !stderr.includes('FAIL');
        console.log(
          results.tests.passed ? chalk.green('   ✓ Tests passed') : chalk.red('   ✗ Tests failed')
        );
      } catch (error) {
        results.tests.output = error instanceof Error ? error.message : String(error);
        console.log(chalk.red('   ✗ Tests failed'));
      }
    } else {
      console.log(chalk.yellow('   ⚠️  Tests skipped'));
      results.tests.passed = true; // Tests are considered "passed" when explicitly skipped
      results.tests.output = 'Tests skipped via --skip-tests flag';
    }

    // Run linting
    console.log(chalk.cyan('🔍 Running linter...'));
    try {
      const { stdout, stderr } = await execAsync('npm run lint 2>&1');
      results.lint.output = stdout + stderr;
      results.lint.passed = !stderr || !stderr.includes('error');
      console.log(
        results.lint.passed ? chalk.green('   ✓ Linting passed') : chalk.red('   ✗ Linting failed')
      );

      if (!results.lint.passed && options.autoFix) {
        console.log(chalk.yellow('   🔧 Attempting auto-fix...'));
        try {
          await execAsync('npm run lint -- --fix');
          console.log(chalk.green('   ✓ Auto-fix applied'));
        } catch {
          console.log(chalk.red('   ✗ Auto-fix failed'));
        }
      }
    } catch (error) {
      results.lint.output = error instanceof Error ? error.message : String(error);
      console.log(chalk.red('   ✗ Linting failed'));
    }

    // Run type checking
    console.log(chalk.cyan('📊 Running type check...'));
    try {
      const { stdout, stderr } = await execAsync('npm run typecheck 2>&1');
      results.typecheck.output = stdout + stderr;
      results.typecheck.passed = !stderr || !stderr.includes('error');
      console.log(
        results.typecheck.passed
          ? chalk.green('   ✓ Type check passed')
          : chalk.red('   ✗ Type check failed')
      );
    } catch (error) {
      results.typecheck.output = error instanceof Error ? error.message : String(error);
      console.log(chalk.red('   ✗ Type check failed'));
    }

    // Run build
    console.log(chalk.cyan('🏗️  Running build...'));
    try {
      const { stdout, stderr } = await execAsync('npm run build 2>&1');
      results.build.output = stdout + stderr;
      results.build.passed = !stderr || !stderr.includes('error');
      console.log(
        results.build.passed ? chalk.green('   ✓ Build succeeded') : chalk.red('   ✗ Build failed')
      );
    } catch (error) {
      results.build.output = error instanceof Error ? error.message : String(error);
      console.log(chalk.red('   ✗ Build failed'));
    }

    // Save validation results
    await fs.writeFile(
      path.join(hardenDir, 'validation-results.json'),
      JSON.stringify(results, null, 2)
    );

    // Create harden report
    const allPassed = Object.values(results).every((r) => r.passed || options.skipTests);
    const reportContent = `# Harden Report: ${feature}

## Validation Results
**Date**: ${new Date().toLocaleString()}
**Overall Status**: ${allPassed ? '✅ PASSED' : '❌ FAILED'}

### Test Results
- **Tests**: ${results.tests.passed ? '✅ Passed' : options.skipTests ? '⚠️ Skipped' : '❌ Failed'}
- **Linting**: ${results.lint.passed ? '✅ Passed' : '❌ Failed'}
- **Type Check**: ${results.typecheck.passed ? '✅ Passed' : '❌ Failed'}
- **Build**: ${results.build.passed ? '✅ Passed' : '❌ Failed'}

## Standards Compliance
${allPassed ? 'All standards have been met. Code is production-ready.' : 'Standards violations detected. Please fix before shipping.'}

## Next Steps
${
  allPassed
    ? `✅ Feature is production-ready!
- Use \`/ship ${feature}\` to deploy
- Update PM issue status to "Done"`
    : `❌ Issues need to be resolved:
- Review validation output below
- Fix identified issues
- Run \`/harden ${feature}\` again`
}

## Detailed Output

### Test Output
\`\`\`
${results.tests.output || 'No test output'}
\`\`\`

### Lint Output
\`\`\`
${results.lint.output || 'No lint output'}
\`\`\`

### Type Check Output
\`\`\`
${results.typecheck.output || 'No type check output'}
\`\`\`

### Build Output
\`\`\`
${results.build.output || 'No build output'}
\`\`\`
`;

    await fs.writeFile(path.join(hardenDir, 'harden-report.md'), reportContent);

    // Final summary
    console.log('\n' + chalk.bold('Harden Summary:'));

    if (allPassed) {
      console.log(chalk.green.bold('\n✅ All validation checks passed!'));
      console.log(chalk.green('Feature is production-ready.\n'));

      console.log(chalk.bold('Next steps:'));
      console.log('  1. Review ' + chalk.yellow(`${path.join(hardenDir, 'harden-report.md')}`));
      console.log('  2. Use ' + chalk.cyan(`\`/ship ${feature}\``) + ' to deploy');
      console.log('  3. Update PM issue status to "Done"');
    } else {
      console.log(chalk.red.bold('\n❌ Validation checks failed.'));
      console.log(chalk.red('Please fix issues before shipping.\n'));

      console.log(chalk.bold('Required actions:'));
      console.log('  1. Review ' + chalk.yellow(`${path.join(hardenDir, 'harden-report.md')}`));
      console.log('  2. Fix identified issues');
      console.log('  3. Run ' + chalk.cyan(`\`hodge harden ${feature}\``) + ' again');

      if (options.autoFix) {
        console.log(
          '\n' +
            chalk.yellow('💡 Tip: Some issues may have been auto-fixed. Review and commit changes.')
        );
      }
    }

    console.log('\n' + chalk.dim('Report saved to: ' + path.join(hardenDir, 'harden-report.md')));
  }
}
