import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface DecideOptions {
  feature?: string;
}

export class DecideCommand {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
  }

  async execute(decision: string, options: DecideOptions = {}): Promise<void> {
    console.log(chalk.yellow('📝 Recording Decision'));

    // Ensure decisions file exists
    const decisionsFile = path.join(this.basePath, '.hodge', 'decisions.md');

    if (!existsSync(path.dirname(decisionsFile))) {
      await fs.mkdir(path.dirname(decisionsFile), { recursive: true });
    }

    // Read existing decisions or create template
    let content = '';
    if (existsSync(decisionsFile)) {
      content = await fs.readFile(decisionsFile, 'utf-8');
    } else {
      content = `# Architecture Decisions

This file tracks key architectural and technical decisions made during development.

## Decision Template

### [Date] - Decision Title

**Status**: Proposed | Accepted | Deprecated | Superseded

**Context**:
Describe the context and problem that led to this decision.

**Decision**:
State the decision clearly.

**Rationale**:
Explain why this decision was made, considering alternatives.

**Consequences**:
List the positive and negative consequences of this decision.

---

## Decisions

<!-- Add your decisions below -->

`;
    }

    // Format the new decision
    const date = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toLocaleTimeString();

    // Extract decision title (first sentence or up to 50 chars)
    const titleMatch = decision.match(/^([^.!?]+)/);
    const title = titleMatch ? titleMatch[1].trim() : decision.substring(0, 50);

    const newDecision = `
### ${date} - ${title}

**Status**: Accepted

**Context**:
${options.feature ? `Feature: ${options.feature}` : 'General project decision'}

**Decision**:
${decision}

**Rationale**:
Recorded via \`hodge decide\` command at ${timestamp}

**Consequences**:
To be determined based on implementation.

---
`;

    // Append the decision
    const insertPosition = content.lastIndexOf('<!-- Add your decisions below -->');
    if (insertPosition !== -1) {
      content =
        content.slice(0, insertPosition + '<!-- Add your decisions below -->'.length) +
        '\n' +
        newDecision +
        content.slice(insertPosition + '<!-- Add your decisions below -->'.length);
    } else {
      content += newDecision;
    }

    await fs.writeFile(decisionsFile, content);

    // If feature is specified, also save to feature directory
    if (options.feature) {
      const featureDecisionFile = path.join(
        this.basePath,
        '.hodge',
        'features',
        options.feature,
        'decision.md'
      );
      if (existsSync(path.dirname(featureDecisionFile))) {
        await fs.writeFile(
          featureDecisionFile,
          `# Decision for ${options.feature}

**Date**: ${date}
**Time**: ${timestamp}

## Decision
${decision}

## Status
This decision has been recorded in the main decisions file.
`
        );
      }
    }

    // PM integration has moved to /plan command
    // Decisions are now purely about recording technical choices

    // AI Context Update
    console.log('\n' + chalk.bold('═'.repeat(60)));
    console.log(chalk.yellow.bold('DECISION RECORDED:'));
    console.log(chalk.bold('═'.repeat(60)));
    console.log(`Decision: ${chalk.white.bold(decision)}`);
    console.log(`Date: ${date} ${timestamp}`);
    if (options.feature) {
      console.log(`Feature: ${options.feature}`);
    }
    console.log('\nThis decision is now part of the project context and should be');
    console.log('considered in all future implementations.');
    console.log(chalk.bold('═'.repeat(60)));

    // Success message
    console.log('\n' + chalk.green('✓ Decision recorded successfully'));
    console.log(chalk.gray(`  Location: ${decisionsFile}`));
    if (options.feature) {
      console.log(chalk.gray(`  Feature: ${options.feature}`));
    }

    // Show decision count
    const allDecisions = content.match(/^### \d{4}-/gm) || [];
    console.log(chalk.gray(`  Total decisions: ${allDecisions.length}`));
  }
}
