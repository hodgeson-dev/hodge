import chalk from 'chalk';
import { findTodos, displayTodos } from '../lib/todo-checker.js';
import { createCommandLogger } from '../lib/logger.js';

export interface TodosOptions {
  dir?: string;
  json?: boolean;
}

export class TodosCommand {
  private logger = createCommandLogger('todos', { enableConsole: true });
  execute(options: TodosOptions = {}): void {
    this.logger.info(chalk.cyan('🔍 Scanning for TODOs...\n'));

    const baseDir = options.dir || 'src';
    const todos = findTodos(baseDir);

    if (options.json) {
      this.logger.info(JSON.stringify(todos, null, 2));
      return;
    }

    displayTodos(todos);

    if (todos.length > 0) {
      this.logger.info('\n' + chalk.bold('Tips:'));
      this.logger.info('  • High priority TODOs should be addressed before shipping');
      this.logger.info('  • Use descriptive TODO comments for better tracking');
      this.logger.info('  • Consider creating issues for complex TODOs');
      this.logger.info('');
      this.logger.info(chalk.dim('Directory searched: ' + baseDir));
    }
  }
}
