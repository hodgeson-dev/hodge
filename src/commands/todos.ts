import chalk from 'chalk';
import { findTodos, displayTodos } from '../lib/todo-checker';

export interface TodosOptions {
  dir?: string;
  json?: boolean;
}

export class TodosCommand {
  execute(options: TodosOptions = {}): void {
    console.log(chalk.cyan('🔍 Scanning for TODOs...\n'));

    const baseDir = options.dir || 'src';
    const todos = findTodos(baseDir);

    if (options.json) {
      console.log(JSON.stringify(todos, null, 2));
      return;
    }

    displayTodos(todos);

    if (todos.length > 0) {
      console.log('\n' + chalk.bold('Tips:'));
      console.log('  • High priority TODOs should be addressed before shipping');
      console.log('  • Use descriptive TODO comments for better tracking');
      console.log('  • Consider creating issues for complex TODOs');
      console.log();
      console.log(chalk.dim('Directory searched: ' + baseDir));
    }
  }
}
