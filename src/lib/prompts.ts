import inquirer from 'inquirer';
import chalk from 'chalk';
import { type ShipInteractionData } from './interaction-state.js';

/**
 * Interactive prompts for terminal environments
 * Provides rich terminal UI for commands when TTY is available
 */
export class InteractivePrompts {
  /**
   * Prompt for ship commit message in terminal
   */
  async promptShipCommit(data: ShipInteractionData): Promise<string> {
    console.log(chalk.bold('\n📝 Commit Message Generator\n'));

    // Show file changes
    if (data.analysis.files.length > 0) {
      console.log(chalk.gray('Changed files:'));
      data.analysis.files.forEach(f => {
        const statusIcon = f.status === 'added' ? '✚' :
                          f.status === 'deleted' ? '✖' :
                          '✎';
        console.log(chalk.gray(`  ${statusIcon} ${f.path} (+${f.insertions}, -${f.deletions})`));
      });
      console.log();
    }

    // Show suggested message
    console.log(chalk.gray('Suggested commit message:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(data.suggested);
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    // Prompt for action
    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices: [
          { name: 'Use suggested message', value: 'use' },
          { name: 'Edit message interactively', value: 'edit' },
          { name: 'Enter custom message', value: 'custom' },
          { name: 'Cancel ship', value: 'cancel' }
        ]
      }
    ]);

    if (action === 'cancel') {
      throw new Error('Ship cancelled by user');
    }

    if (action === 'use') {
      return data.suggested;
    }

    if (action === 'custom') {
      const { message } = await inquirer.prompt<{ message: string }>([
        {
          type: 'input',
          name: 'message',
          message: 'Enter commit message:',
          validate: (input: string) => input.trim().length > 0 || 'Message cannot be empty'
        }
      ]);
      return message;
    }

    // Edit mode - prompt for each part
    if (action === 'edit') {
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
            { name: 'revert - Revert previous commit', value: 'revert' }
          ],
          default: data.analysis.type
        }
      ]);

      const { scope } = await inquirer.prompt<{ scope: string }>([
        {
          type: 'input',
          name: 'scope',
          message: 'Enter scope (optional):',
          default: data.analysis.scope !== 'general' ? data.analysis.scope : ''
        }
      ]);

      const { breaking } = await inquirer.prompt<{ breaking: boolean }>([
        {
          type: 'confirm',
          name: 'breaking',
          message: 'Is this a breaking change?',
          default: false
        }
      ]);

      const { subject } = await inquirer.prompt<{ subject: string }>([
        {
          type: 'input',
          name: 'subject',
          message: 'Enter commit subject (short description):',
          validate: (input: string) => {
            if (input.trim().length === 0) return 'Subject cannot be empty';
            if (input.length > 50) return 'Subject should be 50 characters or less';
            return true;
          }
        }
      ]);

      const { body } = await inquirer.prompt<{ body: string }>([
        {
          type: 'editor',
          name: 'body',
          message: 'Enter commit body (detailed description):',
          default: `- Implementation complete\n- Tests passing\n- Documentation updated${data.issueId ? `\n- Closes ${data.issueId}` : ''}`
        }
      ]);

      // Construct conventional commit message
      let message = type;
      if (scope) message += `(${scope})`;
      if (breaking) message += '!';
      message += `: ${subject}\n\n${body}`;

      if (breaking) {
        const { breakingDescription } = await inquirer.prompt<{ breakingDescription: string }>([
          {
            type: 'input',
            name: 'breakingDescription',
            message: 'Describe the breaking change:'
          }
        ]);
        if (breakingDescription) {
          message += `\n\nBREAKING CHANGE: ${breakingDescription}`;
        }
      }

      return message;
    }

    return data.suggested;
  }

  /**
   * Prompt for explore mode confirmation
   */
  async promptExploreStart(feature: string, description?: string): Promise<boolean> {
    console.log(chalk.bold('\n🔍 Explore Mode\n'));
    console.log(`Feature: ${chalk.cyan(feature)}`);
    if (description) {
      console.log(`Description: ${description}`);
    }
    console.log();

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Start exploring this feature?',
        default: true
      }
    ]);

    return confirm;
  }

  /**
   * Prompt for build mode confirmation with exploration review
   */
  async promptBuildStart(feature: string, hasExploration: boolean): Promise<boolean> {
    console.log(chalk.bold('\n🔨 Build Mode\n'));
    console.log(`Feature: ${chalk.cyan(feature)}`);

    if (hasExploration) {
      console.log(chalk.green('✓ Exploration phase completed'));
    } else {
      console.log(chalk.yellow('⚠ No exploration found for this feature'));
    }
    console.log();

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: hasExploration ?
          'Proceed to build phase?' :
          'Start build without exploration?',
        default: hasExploration
      }
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
    console.log(chalk.bold('\n🛡️ Harden Mode - Quality Checks\n'));

    const { checks } = await inquirer.prompt<{ checks: string[] }>([
      {
        type: 'checkbox',
        name: 'checks',
        message: 'Select quality checks to run:',
        choices: [
          { name: 'Run tests', value: 'tests', checked: true },
          { name: 'Run linting', value: 'lint', checked: true },
          { name: 'Run type checking', value: 'typecheck', checked: true }
        ]
      }
    ]);

    return {
      skipTests: !checks.includes('tests'),
      skipLint: !checks.includes('lint'),
      skipTypecheck: !checks.includes('typecheck')
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
    console.log(chalk.bold('\n📋 Record Decision\n'));

    const answers = await inquirer.prompt<{
      title: string;
      rationale: string;
      alternatives?: string;
    }>([
      {
        type: 'input',
        name: 'title',
        message: 'Decision title:',
        validate: (input: string) => input.trim().length > 0 || 'Title cannot be empty'
      },
      {
        type: 'editor',
        name: 'rationale',
        message: 'Explain the rationale:'
      },
      {
        type: 'editor',
        name: 'alternatives',
        message: 'What alternatives were considered? (optional):'
      }
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