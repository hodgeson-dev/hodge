import inquirer from 'inquirer';
import chalk from 'chalk';
import { type ShipInteractionData } from './interaction-state.js';

import { createCommandLogger } from './logger.js';
/**
 * Interactive prompts for terminal environments
 * Provides rich terminal UI for commands when TTY is available
 */
export class InteractivePrompts {
  private logger = createCommandLogger('interactive-prompts', { enableConsole: false });

  /**
   * Prompt for ship commit message in terminal
   */
  async promptShipCommit(data: ShipInteractionData): Promise<string> {
    this.logger.info(chalk.bold('\n📝 Commit Message Generator\n'));

    this.showFileChanges(data);
    this.showSuggestedMessage(data);

    const action = await this.promptForAction();

    if (action === 'cancel') {
      throw new Error('Ship cancelled by user');
    }

    if (action === 'use') {
      return data.suggested;
    }

    if (action === 'custom') {
      return await this.promptCustomMessage();
    }

    if (action === 'edit') {
      return await this.promptEditMode(data);
    }

    return data.suggested;
  }

  private showFileChanges(data: ShipInteractionData): void {
    if (data.analysis.files.length > 0) {
      this.logger.info(chalk.gray('Changed files:'));
      data.analysis.files.forEach((f) => {
        const statusIcon = this.getFileStatusIcon(f.status);
        this.logger.info(
          chalk.gray(`  ${statusIcon} ${f.path} (+${f.insertions}, -${f.deletions})`)
        );
      });
      this.logger.info('');
    }
  }

  private getFileStatusIcon(status: string): string {
    if (status === 'added') return '✚';
    if (status === 'deleted') return '✖';
    return '✎';
  }

  private showSuggestedMessage(data: ShipInteractionData): void {
    this.logger.info(chalk.gray('Suggested commit message:'));
    this.logger.info(chalk.gray('─'.repeat(60)));
    this.logger.info(data.suggested);
    this.logger.info(chalk.gray('─'.repeat(60)));
    this.logger.info('');
  }

  private async promptForAction(): Promise<string> {
    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices: [
          { name: 'Use suggested message', value: 'use' },
          { name: 'Edit message interactively', value: 'edit' },
          { name: 'Enter custom message', value: 'custom' },
          { name: 'Cancel ship', value: 'cancel' },
        ],
      },
    ]);
    return action;
  }

  private async promptCustomMessage(): Promise<string> {
    const { message } = await inquirer.prompt<{ message: string }>([
      {
        type: 'input',
        name: 'message',
        message: 'Enter commit message:',
        validate: (input: string) => input.trim().length > 0 || 'Message cannot be empty',
      },
    ]);
    return message;
  }

  private async promptEditMode(data: ShipInteractionData): Promise<string> {
    const type = await this.promptCommitType(data);
    const scope = await this.promptScope(data);
    const breaking = await this.promptBreaking();
    const subject = await this.promptSubject();
    const body = await this.promptBody(data);

    let message = this.constructMessage(type, scope, breaking, subject, body);

    if (breaking) {
      message = await this.addBreakingChangeDescription(message);
    }

    return message;
  }

  private async promptCommitType(data: ShipInteractionData): Promise<string> {
    const { type } = await inquirer.prompt<{ type: string }>([
      {
        type: 'list',
        name: 'type',
        message: 'Select commit type:',
        choices: [
          { name: 'feat - New feature', value: 'feat' },
          { name: 'fix - Bug fix', value: 'fix' },
          { name: 'docs - Documentation', value: 'docs' },
          { name: 'style - Code style changes', value: 'style' },
          { name: 'refactor - Code refactoring', value: 'refactor' },
          { name: 'test - Add/update tests', value: 'test' },
          { name: 'chore - Maintenance tasks', value: 'chore' },
          { name: 'perf - Performance improvements', value: 'perf' },
          { name: 'ci - CI/CD changes', value: 'ci' },
          { name: 'build - Build system changes', value: 'build' },
          { name: 'revert - Revert previous commit', value: 'revert' },
        ],
        default: data.analysis.type,
      },
    ]);
    return type;
  }

  private async promptScope(data: ShipInteractionData): Promise<string> {
    const { scope } = await inquirer.prompt<{ scope: string }>([
      {
        type: 'input',
        name: 'scope',
        message: 'Enter scope (optional):',
        default: data.analysis.scope !== 'general' ? data.analysis.scope : '',
      },
    ]);
    return scope;
  }

  private async promptBreaking(): Promise<boolean> {
    const { breaking } = await inquirer.prompt<{ breaking: boolean }>([
      {
        type: 'confirm',
        name: 'breaking',
        message: 'Is this a breaking change?',
        default: false,
      },
    ]);
    return breaking;
  }

  // eslint-disable-next-line sonarjs/function-return-type
  private validateSubject(input: string): string | boolean {
    if (input.trim().length === 0) return 'Subject cannot be empty';
    if (input.length > 50) return 'Subject should be 50 characters or less';
    return true;
  }

  private async promptSubject(): Promise<string> {
    const { subject } = await inquirer.prompt<{ subject: string }>([
      {
        type: 'input',
        name: 'subject',
        message: 'Enter commit subject (short description):',
        validate: this.validateSubject.bind(this),
      },
    ]);
    return subject;
  }

  private async promptBody(data: ShipInteractionData): Promise<string> {
    const closesLine = data.issueId ? `\n- Closes ${data.issueId}` : '';
    const { body } = await inquirer.prompt<{ body: string }>([
      {
        type: 'editor',
        name: 'body',
        message: 'Enter commit body (detailed description):',
        default: `- Implementation complete\n- Tests passing\n- Documentation updated${closesLine}`,
      },
    ]);
    return body;
  }

  private constructMessage(
    type: string,
    scope: string,
    breaking: boolean,
    subject: string,
    body: string
  ): string {
    let message = type;
    if (scope) message += `(${scope})`;
    if (breaking) message += '!';
    message += `: ${subject}\n\n${body}`;
    return message;
  }

  private async addBreakingChangeDescription(message: string): Promise<string> {
    const { breakingDescription } = await inquirer.prompt<{ breakingDescription: string }>([
      {
        type: 'input',
        name: 'breakingDescription',
        message: 'Describe the breaking change:',
      },
    ]);
    if (breakingDescription) {
      return message + `\n\nBREAKING CHANGE: ${breakingDescription}`;
    }
    return message;
  }

  /**
   * Prompt for explore mode confirmation
   */
  async promptExploreStart(feature: string, description?: string): Promise<boolean> {
    this.logger.info(chalk.bold('\n🔍 Explore Mode\n'));
    this.logger.info(`Feature: ${chalk.cyan(feature)}`);
    if (description) {
      this.logger.info(`Description: ${description}`);
    }
    this.logger.info('');

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Start exploring this feature?',
        default: true,
      },
    ]);

    return confirm;
  }

  /**
   * Prompt for build mode confirmation with exploration review
   */
  async promptBuildStart(feature: string, hasExploration: boolean): Promise<boolean> {
    this.logger.info(chalk.bold('\n🔨 Build Mode\n'));
    this.logger.info(`Feature: ${chalk.cyan(feature)}`);

    if (hasExploration) {
      this.logger.info(chalk.green('✓ Exploration phase completed'));
    } else {
      this.logger.warn(chalk.yellow('⚠ No exploration found for this feature'));
    }
    this.logger.info('');

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: hasExploration ? 'Proceed to build phase?' : 'Start build without exploration?',
        default: hasExploration,
      },
    ]);

    return confirm;
  }

  /**
   * Prompt for harden mode options
   */
  async promptHardenOptions(): Promise<{
    skipTests?: boolean;
    skipLint?: boolean;
    skipTypecheck?: boolean;
  }> {
    this.logger.info(chalk.bold('\n🛡️ Harden Mode - Quality Checks\n'));

    const { checks } = await inquirer.prompt<{ checks: string[] }>([
      {
        type: 'checkbox',
        name: 'checks',
        message: 'Select quality checks to run:',
        choices: [
          { name: 'Run tests', value: 'tests', checked: true },
          { name: 'Run linting', value: 'lint', checked: true },
          { name: 'Run type checking', value: 'typecheck', checked: true },
        ],
      },
    ]);

    return {
      skipTests: !checks.includes('tests'),
      skipLint: !checks.includes('lint'),
      skipTypecheck: !checks.includes('typecheck'),
    };
  }

  /**
   * Prompt for protected branch push confirmation
   */
  async promptProtectedBranchPush(branch: string): Promise<boolean> {
    this.logger.info(chalk.bold('\n⚠️  Protected Branch Warning\n'));
    this.logger.warn(chalk.yellow(`You are about to push to '${branch}'`));
    this.logger.warn(chalk.yellow('This is a protected branch typically used for production.'));
    this.logger.info('');

    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices: [
          { name: 'Create and push to feature branch instead', value: 'feature' },
          { name: 'Push to protected branch anyway', value: 'push' },
          { name: 'Cancel push', value: 'cancel' },
        ],
        default: 'feature',
      },
    ]);

    if (action === 'cancel') {
      return false;
    }

    if (action === 'feature') {
      // eslint-disable-next-line sonarjs/function-return-type
      const validateBranchName = (input: string): string | boolean => {
        if (!input.trim()) return 'Branch name cannot be empty';
        if (input === branch) return 'Cannot be the same as current branch';
        return true;
      };

      const { branchName } = await inquirer.prompt<{ branchName: string }>([
        {
          type: 'input',
          name: 'branchName',
          message: 'Enter feature branch name:',
          default: `feature/${Date.now()}`,
          validate: validateBranchName,
        },
      ]);

      this.logger.info(chalk.cyan(`\nCreating branch: ${branchName}`));
      // The actual branch creation will be handled by the caller
      throw new Error(`CREATE_BRANCH:${branchName}`);
    }

    // If action === 'push', confirm once more
    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.red(`Are you SURE you want to push to ${branch}?`),
        default: false,
      },
    ]);

    return confirm;
  }

  /**
   * Prompt for push options
   */
  async promptPushOptions(status: {
    branch: string;
    ahead: number;
    behind: number;
    hasUncommitted: boolean;
  }): Promise<{
    proceed: boolean;
    pullFirst?: boolean;
    stashChanges?: boolean;
  }> {
    const issues: string[] = [];

    if (status.behind > 0) {
      issues.push(`Branch is ${status.behind} commits behind remote`);
    }
    if (status.hasUncommitted) {
      issues.push('You have uncommitted changes');
    }

    if (issues.length === 0) {
      return { proceed: true };
    }

    this.logger.info(chalk.bold('\n📋 Pre-Push Check\n'));
    this.logger.warn(chalk.yellow('Issues detected:'));
    issues.forEach((issue) => this.logger.warn(chalk.yellow(`  • ${issue}`)));
    this.logger.info('');

    const choices: Array<{ name: string; value: string }> = [];

    if (status.behind > 0) {
      choices.push({ name: 'Pull and rebase first', value: 'pull-rebase' });
      choices.push({ name: 'Pull and merge', value: 'pull-merge' });
    }

    if (status.hasUncommitted) {
      choices.push({ name: 'Stash changes and continue', value: 'stash' });
    }

    choices.push({ name: 'Push anyway', value: 'force' });
    choices.push({ name: 'Cancel', value: 'cancel' });

    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices,
      },
    ]);

    if (action === 'cancel') {
      return { proceed: false };
    }

    return {
      proceed: true,
      pullFirst: action.startsWith('pull'),
      stashChanges: action === 'stash',
    };
  }

  /**
   * Prompt for decision recording
   */
  async promptDecision(): Promise<{
    title: string;
    rationale: string;
    alternatives?: string;
  }> {
    this.logger.info(chalk.bold('\n📋 Record Decision\n'));

    const answers = await inquirer.prompt<{
      title: string;
      rationale: string;
      alternatives?: string;
    }>([
      {
        type: 'input',
        name: 'title',
        message: 'Decision title:',
        validate: (input: string) => input.trim().length > 0 || 'Title cannot be empty',
      },
      {
        type: 'editor',
        name: 'rationale',
        message: 'Explain the rationale:',
      },
      {
        type: 'editor',
        name: 'alternatives',
        message: 'What alternatives were considered? (optional):',
      },
    ]);

    return answers;
  }
}

// Singleton instance
let promptsInstance: InteractivePrompts | null = null;

/**
 * Get or create the prompts instance
 */
export function getPrompts(): InteractivePrompts {
  if (!promptsInstance) {
    promptsInstance = new InteractivePrompts();
  }
  return promptsInstance;
}
