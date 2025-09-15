import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export interface TodoItem {
  file: string;
  line: number;
  text: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Recursively finds all files matching extensions
 */
function findFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (
        stat.isDirectory() &&
        !entry.startsWith('.') &&
        entry !== 'node_modules' &&
        entry !== 'dist'
      ) {
        files.push(...findFiles(fullPath, extensions));
      } else if (stat.isFile()) {
        const hasValidExt = extensions.some((ext) => fullPath.endsWith(ext));
        if (hasValidExt) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return files;
}

/**
 * Finds all TODO comments in the codebase
 */
export function findTodos(baseDir = 'src'): TodoItem[] {
  const todos: TodoItem[] = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const files = findFiles(baseDir, extensions);

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const todoMatch = line.match(/\/\/\s*TODO:?\s*(.*)/);
        if (todoMatch) {
          const text = todoMatch[1].trim();
          const priority = determinePriority(text);

          todos.push({
            file,
            line: index + 1,
            text: text || 'No description provided',
            priority,
          });
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }

  return todos;
}

/**
 * Determines priority based on TODO text
 */
function determinePriority(text: string): 'high' | 'medium' | 'low' {
  const lowercaseText = text.toLowerCase();

  if (
    lowercaseText.includes('critical') ||
    lowercaseText.includes('urgent') ||
    lowercaseText.includes('asap')
  ) {
    return 'high';
  }

  if (
    lowercaseText.includes('important') ||
    lowercaseText.includes('fix') ||
    lowercaseText.includes('bug')
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Displays TODOs in a formatted way
 */
export function displayTodos(todos: TodoItem[]): void {
  if (todos.length === 0) {
    console.log(chalk.green('✓ No TODOs found in the codebase'));
    return;
  }

  console.log(chalk.yellow(`\n📝 Found ${todos.length} TODO${todos.length > 1 ? 's' : ''}:\n`));

  // Group by priority
  const highPriority = todos.filter((t) => t.priority === 'high');
  const mediumPriority = todos.filter((t) => t.priority === 'medium');
  const lowPriority = todos.filter((t) => t.priority === 'low');

  if (highPriority.length > 0) {
    console.log(chalk.red.bold('High Priority:'));
    highPriority.forEach((todo) => {
      console.log(chalk.red(`  • ${todo.file}:${todo.line}`));
      console.log(chalk.gray(`    ${todo.text}`));
    });
    console.log();
  }

  if (mediumPriority.length > 0) {
    console.log(chalk.yellow.bold('Medium Priority:'));
    mediumPriority.forEach((todo) => {
      console.log(chalk.yellow(`  • ${todo.file}:${todo.line}`));
      console.log(chalk.gray(`    ${todo.text}`));
    });
    console.log();
  }

  if (lowPriority.length > 0) {
    console.log(chalk.blue.bold('Low Priority:'));
    lowPriority.forEach((todo) => {
      console.log(chalk.blue(`  • ${todo.file}:${todo.line}`));
      console.log(chalk.gray(`    ${todo.text}`));
    });
  }
}

/**
 * Checks if there are unfinished TODOs that should block shipping
 */
export function checkTodosForShip(todos: TodoItem[]): boolean {
  const highPriorityTodos = todos.filter((t) => t.priority === 'high');

  if (highPriorityTodos.length > 0) {
    console.log(chalk.red('\n⚠️  High priority TODOs must be resolved before shipping:'));
    highPriorityTodos.forEach((todo) => {
      console.log(chalk.red(`  • ${todo.file}:${todo.line} - ${todo.text}`));
    });
    return false;
  }

  if (todos.length > 10) {
    console.log(
      chalk.yellow(`\n⚠️  ${todos.length} TODOs found. Consider reducing before shipping.`)
    );
  }

  return true;
}
