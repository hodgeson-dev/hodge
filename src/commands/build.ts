import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface BuildOptions {
  skipChecks?: boolean;
}

export class BuildCommand {
  async execute(feature: string, options: BuildOptions = {}): Promise<void> {
    // Use optimized version if available
    if (process.env.HODGE_USE_OPTIMIZED || process.env.NODE_ENV === 'production') {
      try {
        const { OptimizedBuildCommand } = await import('./build-optimized.js');
        const optimizedCommand = new OptimizedBuildCommand();
        return await optimizedCommand.execute(feature, options);
      } catch (error) {
        // Fall back to standard implementation if optimized version fails to load
        console.warn(
          chalk.yellow('Warning: Failed to load optimized build command, using standard version')
        );
      }
    }

    // Standard implementation follows
    console.log(chalk.blue('🔨 Entering Build Mode'));
    console.log(chalk.gray(`Feature: ${feature}\n`));

    // AI Context Injection (for Claude Code)
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

    const featureDir = path.join('.hodge', 'features', feature);
    const buildDir = path.join(featureDir, 'build');
    const exploreDir = path.join(featureDir, 'explore');

    // Check for exploration or decision
    if (!options.skipChecks) {
      const hasExploration = existsSync(exploreDir);
      const decisionFile = path.join(exploreDir, 'decision.md');
      const hasDecision = existsSync(decisionFile);

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

    // Create build directory
    await fs.mkdir(buildDir, { recursive: true });

    // Check for PM integration
    const pmTool = process.env.HODGE_PM_TOOL;
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    let issueId = null;

    if (existsSync(issueIdFile)) {
      issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
      if (pmTool && issueId) {
        console.log(chalk.blue(`📋 Linked to ${pmTool} issue: ${issueId}`));
        // TODO: Update PM issue status to "In Progress" via PM adapter
      }
    }

    // Load standards
    const standardsFile = path.join('.hodge', 'standards.md');
    if (existsSync(standardsFile)) {
      await fs.readFile(standardsFile, 'utf-8');
      console.log(chalk.green('✓ Loaded project standards'));
    }

    // Create build context
    const context = {
      mode: 'build',
      feature,
      timestamp: new Date().toISOString(),
      standards: 'recommended',
      validation: 'suggested',
      pmIssue: issueId,
      pmTool: pmTool || null,
    };

    // Save context
    await fs.writeFile(path.join(buildDir, 'context.json'), JSON.stringify(context, null, 2));

    // Create build plan template
    const buildPlanTemplate = `# Build Plan: ${feature}

## Feature Overview
${issueId && pmTool ? `**PM Issue**: ${issueId} (${pmTool})` : 'No PM issue linked'}
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
4. Proceed to \`/harden ${feature}\` for production readiness
`;

    await fs.writeFile(path.join(buildDir, 'build-plan.md'), buildPlanTemplate);

    // Load and display relevant patterns
    const patternsDir = path.join('.hodge', 'patterns');
    const patterns: string[] = [];
    if (existsSync(patternsDir)) {
      try {
        const files = await fs.readdir(patternsDir);
        patterns.push(...files.filter((f) => f.endsWith('.md')));
      } catch {
        // Patterns directory might be empty
      }
    }

    // Output guidance
    console.log(chalk.green('✓ Build environment prepared\n'));

    console.log(chalk.bold('In Build Mode:'));
    console.log('  • Standards are ' + chalk.blue('recommended'));
    console.log('  • Patterns should be ' + chalk.blue('reused'));
    console.log('  • Focus on ' + chalk.blue('structured implementation'));
    console.log('  • Balance ' + chalk.blue('quality and speed') + '\n');

    if (patterns.length > 0) {
      console.log(chalk.bold('Available patterns:'));
      patterns.forEach((p) => {
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
    console.log('  4. Use ' + chalk.cyan(`\`/harden ${feature}\``) + ' for production readiness\n');

    console.log(chalk.dim('Build context saved to: ' + buildDir));
  }
}
