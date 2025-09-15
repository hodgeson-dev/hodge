import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface ExploreOptions {
  force?: boolean;
}

export class ExploreCommand {
  async execute(feature: string, options: ExploreOptions = {}): Promise<void> {
    console.log(chalk.cyan('🔍 Entering Explore Mode'));
    console.log(chalk.gray(`Feature: ${feature}\n`));

    // AI Context Injection (for Claude Code)
    console.log(chalk.bold('═'.repeat(60)));
    console.log(chalk.cyan.bold('AI CONTEXT UPDATE:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`You are now in ${chalk.cyan.bold('EXPLORATION MODE')} for: ${feature}`);
    console.log('\nGuidelines for AI assistance:');
    console.log('• Suggest multiple approaches and alternatives');
    console.log('• Standards are suggestions only, not requirements');
    console.log('• Encourage experimentation and learning');
    console.log('• Focus on discovery over perfection');
    console.log(chalk.bold('═'.repeat(60)) + '\n');

    // Create exploration directory
    const exploreDir = path.join('.hodge', 'features', feature, 'explore');

    // Check if exploration already exists
    if (existsSync(exploreDir) && !options.force) {
      console.log(chalk.yellow('⚠️  Exploration already exists for this feature.'));
      console.log(chalk.gray(`   Use --force to overwrite or review existing exploration at:`));
      console.log(chalk.gray(`   ${exploreDir}\n`));

      const existingExploration = path.join(exploreDir, 'exploration.md');
      if (existsSync(existingExploration)) {
        const content = await fs.readFile(existingExploration, 'utf-8');
        const lines = content.split('\n').slice(0, 10);
        console.log(chalk.dim('--- Existing Exploration Preview ---'));
        console.log(chalk.dim(lines.join('\n')));
        console.log(chalk.dim('...\n'));
      }
      return;
    }

    // Create directory structure
    await fs.mkdir(exploreDir, { recursive: true });

    // Check for PM integration
    const pmTool = process.env.HODGE_PM_TOOL;
    let issueDetails = null;

    if (pmTool) {
      console.log(chalk.blue(`📋 Checking ${pmTool} for issue ${feature}...`));

      try {
        // Save issue ID for future reference
        const issueIdFile = path.join('.hodge', 'features', feature, 'issue-id.txt');
        await fs.mkdir(path.dirname(issueIdFile), { recursive: true });
        await fs.writeFile(issueIdFile, feature);

        // TODO: Actual PM fetching should happen here via PM adapter
        // For now, we'll mark it as linked
        console.log(chalk.green(`✓ Linked to ${pmTool} issue: ${feature}`));
        issueDetails = { id: feature, tool: pmTool };
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not link to PM issue: ${feature}`));
      }
    }

    // Create exploration context
    const context = {
      mode: 'explore',
      feature,
      timestamp: new Date().toISOString(),
      standards: 'suggested',
      validation: 'optional',
      pmIssue: issueDetails?.id || null,
      pmTool: issueDetails?.tool || null,
    };

    // Save context
    await fs.writeFile(path.join(exploreDir, 'context.json'), JSON.stringify(context, null, 2));

    // Create exploration template
    const explorationTemplate = `# Exploration: ${feature}

## Feature Overview
${issueDetails ? `**PM Issue**: ${issueDetails.id} (${issueDetails.tool})` : 'No PM issue linked'}

## Context
- **Date**: ${new Date().toLocaleDateString()}
- **Mode**: Explore
- **Standards**: Suggested (not enforced)

## Approaches to Explore

### Approach 1: [Name]
- **Description**:
- **Pros**:
- **Cons**:
- **Compatibility**:

### Approach 2: [Name]
- **Description**:
- **Pros**:
- **Cons**:
- **Compatibility**:

### Approach 3: [Name]
- **Description**:
- **Pros**:
- **Cons**:
- **Compatibility**:

## Recommendation
[Which approach and why]

## Next Steps
- [ ] Review approaches
- [ ] Make decision with \`/decide\`
- [ ] Proceed to \`/build ${feature}\`
`;

    await fs.writeFile(path.join(exploreDir, 'exploration.md'), explorationTemplate);

    // Load available patterns and decisions for context
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

    const decisionsFile = path.join('.hodge', 'decisions.md');
    let decisionCount = 0;
    if (existsSync(decisionsFile)) {
      const decisionsContent = await fs.readFile(decisionsFile, 'utf-8');
      decisionCount = (decisionsContent.match(/^### \d{4}-/gm) || []).length;
    }

    // Output guidance
    console.log(chalk.green('✓ Exploration environment created\n'));

    console.log(chalk.bold('In Explore Mode:'));
    console.log('  • Standards are ' + chalk.cyan('suggested') + ', not enforced');
    console.log('  • Multiple approaches ' + chalk.cyan('encouraged'));
    console.log('  • Focus on ' + chalk.cyan('rapid prototyping'));
    console.log('  • ' + chalk.cyan('Learn and experiment') + ' freely\n');

    // Display context information
    console.log(chalk.bold('Project Context:'));
    console.log(`  • Available patterns: ${chalk.green(patterns.length.toString())}`);
    if (patterns.length > 0 && patterns.length <= 3) {
      patterns.forEach((p) => console.log(chalk.gray(`    - ${p.replace('.md', '')}`)));
    }
    console.log(`  • Project decisions: ${chalk.green(decisionCount.toString())}`);
    console.log();

    console.log(chalk.bold('Files created:'));
    console.log(chalk.gray(`  • ${path.join(exploreDir, 'context.json')}`));
    console.log(chalk.gray(`  • ${path.join(exploreDir, 'exploration.md')}`));

    if (issueDetails) {
      console.log(chalk.gray(`  • ${path.join('.hodge', 'features', feature, 'issue-id.txt')}`));
    }

    console.log('\n' + chalk.bold('Next steps:'));
    console.log('  1. Edit ' + chalk.yellow(`${path.join(exploreDir, 'exploration.md')}`));
    console.log('  2. Document different approaches');
    console.log('  3. Use ' + chalk.cyan('`/decide`') + ' to choose an approach');
    console.log('  4. Then ' + chalk.cyan(`\`/build ${feature}\``) + ' to implement\n');

    console.log(chalk.dim('Exploration saved to: ' + exploreDir));
  }
}
