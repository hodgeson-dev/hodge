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

    const date = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toLocaleTimeString();
    const newDecision = this.formatDecision(decision, options, date, timestamp);

    if (options.feature) {
      await this.writeFeatureDecision(options.feature, newDecision);
    } else {
      await this.writeGlobalDecision(newDecision);
    }

    await this.printDecisionConfirmation(decision, options, date, timestamp);
  }

  /**
   * Format a new decision entry
   */
  private formatDecision(
    decision: string,
    options: DecideOptions,
    date: string,
    timestamp: string
  ): string {
    const titleMatch = /^([^.!?]+)/.exec(decision);
    const title = titleMatch ? titleMatch[1].trim() : decision.substring(0, 50);

    return `
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
  }

  /**
   * Write decision to global decisions file
   */
  private async writeGlobalDecision(newDecision: string): Promise<void> {
    const decisionsFile = path.join(this.basePath, '.hodge', 'decisions.md');

    await fs.mkdir(path.dirname(decisionsFile), { recursive: true });

    let content = '';
    if (existsSync(decisionsFile)) {
      content = await fs.readFile(decisionsFile, 'utf-8');
    } else {
      content = this.getGlobalDecisionTemplate();
    }

    content = this.insertDecision(content, newDecision);
    await fs.writeFile(decisionsFile, content);
  }

  /**
   * Write decision to feature-specific decisions file
   */
  private async writeFeatureDecision(feature: string, newDecision: string): Promise<void> {
    const featureDir = path.join(this.basePath, '.hodge', 'features', feature);

    if (!existsSync(featureDir)) {
      const error = new Error(`Feature directory not found: ${feature}`);
      this.logger.error(chalk.red('\n✗ Error: Feature directory does not exist'), { error });
      this.logger.error(chalk.gray(`  Expected: ${featureDir}`));
      this.logger.error(
        chalk.yellow('\n  Please run /explore first to create the feature structure.')
      );
      throw error;
    }

    const featureDecisionFile = path.join(featureDir, 'decisions.md');

    let content = '';
    if (existsSync(featureDecisionFile)) {
      content = await fs.readFile(featureDecisionFile, 'utf-8');
    } else {
      content = this.getFeatureDecisionTemplate(feature);
    }

    content = this.insertDecision(content, newDecision);
    await fs.writeFile(featureDecisionFile, content);
  }

  /**
   * Insert decision into content at the correct position
   */
  private insertDecision(content: string, newDecision: string): string {
    const marker = '<!-- Add your decisions below -->';
    const insertPosition = content.lastIndexOf(marker);

    if (insertPosition !== -1) {
      return (
        content.slice(0, insertPosition + marker.length) +
        '\n' +
        newDecision +
        content.slice(insertPosition + marker.length)
      );
    }

    return content + newDecision;
  }

  /**
   * Get global decision file template
   */
  private getGlobalDecisionTemplate(): string {
    return `# Architecture Decisions

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

  /**
   * Get feature decision file template
   */
  private getFeatureDecisionTemplate(feature: string): string {
    return `# Feature Decisions: ${feature}

This file tracks decisions specific to ${feature}.

## Decisions

<!-- Add your decisions below -->

`;
  }

  /**
   * Print decision confirmation to console
   */
  private async printDecisionConfirmation(
    decision: string,
    options: DecideOptions,
    date: string,
    timestamp: string
  ): Promise<void> {
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

    this.logger.info('\n' + chalk.green('✓ Decision recorded successfully'));

    await this.printDecisionStats(options);
  }

  /**
   * Print decision statistics
   */
  private async printDecisionStats(options: DecideOptions): Promise<void> {
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

      if (existsSync(featureDecisionFile)) {
        const content = await fs.readFile(featureDecisionFile, 'utf-8');
        const count = (content.match(/^### \d{4}-/gm) || []).length;
        this.logger.info(chalk.gray(`  Total decisions: ${count}`));
      }
    } else {
      const decisionsFile = path.join(this.basePath, '.hodge', 'decisions.md');
      this.logger.info(chalk.gray(`  Location: ${decisionsFile}`));

      if (existsSync(decisionsFile)) {
        const content = await fs.readFile(decisionsFile, 'utf-8');
        const count = (content.match(/^### \d{4}-/gm) || []).length;
        this.logger.info(chalk.gray(`  Total decisions: ${count}`));
      }
    }
  }
}
