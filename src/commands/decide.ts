import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { createCommandLogger } from '../lib/logger.js';

export interface DecideOptions {
  feature?: string;
}

export class DecideCommand {
  private basePath: string;
  private logger = createCommandLogger('decide', { enableConsole: true });

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
  }

  async execute(decision: string, options: DecideOptions = {}): Promise<void> {
    this.logger.info(chalk.yellow('📝 Recording Decision'));

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

    // Write to global decisions file only if no feature specified
    if (!options.feature) {
      await fs.writeFile(decisionsFile, content);
    }

    // If feature is specified, write to feature directory only
    if (options.feature) {
      const featureDir = path.join(this.basePath, '.hodge', 'features', options.feature);

      // Validate that feature directory exists
      if (!existsSync(featureDir)) {
        const error = new Error(`Feature directory not found: ${options.feature}`);
        this.logger.error(chalk.red('\n✗ Error: Feature directory does not exist'), { error });
        this.logger.error(chalk.gray(`  Expected: ${featureDir}`));
        this.logger.error(
          chalk.yellow('\n  Please run /explore first to create the feature structure.')
        );
        throw error;
      }

      const featureDecisionFile = path.join(featureDir, 'decisions.md');

      // Read existing feature decisions or create template
      let featureContent = '';
      if (existsSync(featureDecisionFile)) {
        featureContent = await fs.readFile(featureDecisionFile, 'utf-8');
      } else {
        featureContent = `# Feature Decisions: ${options.feature}

This file tracks decisions specific to ${options.feature}.

## Decisions

<!-- Add your decisions below -->

`;
      }

      // Append decision to feature file (same logic as global)
      const insertPosition = featureContent.lastIndexOf('<!-- Add your decisions below -->');
      if (insertPosition !== -1) {
        featureContent =
          featureContent.slice(0, insertPosition + '<!-- Add your decisions below -->'.length) +
          '\n' +
          newDecision +
          featureContent.slice(insertPosition + '<!-- Add your decisions below -->'.length);
      } else {
        featureContent += newDecision;
      }

      await fs.writeFile(featureDecisionFile, featureContent);
    }

    // PM integration has moved to /plan command
    // Decisions are now purely about recording technical choices

    // AI Context Update
    this.logger.info('\n' + chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.yellow.bold('DECISION RECORDED:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`Decision: ${chalk.white.bold(decision)}`);
    this.logger.info(`Date: ${date} ${timestamp}`);
    if (options.feature) {
      this.logger.info(`Feature: ${options.feature}`);
    }
    this.logger.info('\nThis decision is now part of the project context and should be');
    this.logger.info('considered in all future implementations.');
    this.logger.info(chalk.bold('═'.repeat(60)));

    // Success message
    this.logger.info('\n' + chalk.green('✓ Decision recorded successfully'));
    if (options.feature) {
      const featureDecisionFile = path.join(
        this.basePath,
        '.hodge',
        'features',
        options.feature,
        'decisions.md'
      );
      this.logger.info(chalk.gray(`  Location: ${featureDecisionFile}`));
      this.logger.info(chalk.gray(`  Feature: ${options.feature}`));

      // Show decision count for feature file
      if (existsSync(featureDecisionFile)) {
        const featureContent = await fs.readFile(featureDecisionFile, 'utf-8');
        const allDecisions = featureContent.match(/^### \d{4}-/gm) || [];
        this.logger.info(chalk.gray(`  Total decisions: ${allDecisions.length}`));
      }
    } else {
      this.logger.info(chalk.gray(`  Location: ${decisionsFile}`));

      // Show decision count for global file
      const allDecisions = content.match(/^### \d{4}-/gm) || [];
      this.logger.info(chalk.gray(`  Total decisions: ${allDecisions.length}`));
    }
  }
}
