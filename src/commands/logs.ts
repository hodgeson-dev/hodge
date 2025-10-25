/**
 * Log Viewer Command
 * Provides a way to view and filter Hodge logs
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';
import { createCommandLogger } from '../lib/logger.js';

export interface LogsOptions {
  level?: string;
  command?: string;
  tail?: number;
  pretty?: boolean;
  follow?: boolean;
  clear?: boolean;
}

interface LogEntry {
  time: number;
  level: string;
  msg: string;
  command?: string;
  name?: string;
  [key: string]: unknown;
}

export class LogsCommand {
  private logger = createCommandLogger('logs', { enableConsole: true });
  private logPath: string;

  constructor(logPath?: string) {
    this.logPath = logPath ?? this.getDefaultLogPath();
  }

  async execute(options: LogsOptions = {}): Promise<void> {
    // Find log file
    const logPath = this.logPath;

    // Handle clear option
    if (options.clear) {
      await this.clearLogs(logPath);
      return;
    }

    if (!(await fs.pathExists(logPath))) {
      console.log(chalk.yellow('No log file found.'));
      console.log(chalk.gray('Logs will be created when hodge commands are executed.'));
      console.log(chalk.gray(`Expected location: ${logPath}`));
      return;
    }

    // Check if pretty printing is needed (default true for terminal output)
    const pretty = options.pretty !== false;

    if (options.follow) {
      await this.followLogs(logPath, options, pretty);
    } else {
      await this.viewLogs(logPath, options, pretty);
    }
  }

  private getDefaultLogPath(): string {
    // Try project directory first
    const projectLogPath = path.join(process.cwd(), '.hodge', 'logs', 'hodge.log');
    if (fs.existsSync(projectLogPath)) {
      return projectLogPath;
    }

    // Fallback to home directory
    const homeLogPath = path.join(process.env.HOME ?? '', '.hodge', 'logs', 'hodge.log');
    return homeLogPath;
  }

  private async clearLogs(logPath: string): Promise<void> {
    const logDir = path.dirname(logPath);

    try {
      if (await fs.pathExists(logDir)) {
        const files = await fs.readdir(logDir);
        const logFiles = files.filter((f) => f.endsWith('.log'));

        for (const file of logFiles) {
          await fs.remove(path.join(logDir, file));
        }

        console.log(chalk.green('✓ Logs cleared successfully'));
        this.logger.info('Logs cleared by user');
      } else {
        console.log(chalk.yellow('No logs to clear'));
      }
    } catch (error) {
      console.log(chalk.red('Failed to clear logs:', error));
      this.logger.error('Failed to clear logs', { error });
    }
  }

  private async viewLogs(logPath: string, options: LogsOptions, pretty: boolean): Promise<void> {
    const lines: string[] = [];

    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const formatted = this.formatLogLine(line, options, pretty);
      if (formatted) {
        lines.push(formatted);
      }
    }

    // Apply tail filter
    const output = options.tail ? lines.slice(-options.tail) : lines;

    if (output.length === 0) {
      console.log(chalk.yellow('No matching log entries found.'));
      if (options.level ?? options.command) {
        console.log(chalk.gray('Try adjusting your filters or run without filters.'));
      }
    } else {
      output.forEach((line) => console.log(line));
      console.log(chalk.gray(`\nShowing ${output.length} log entries`));
    }
  }

  private async followLogs(logPath: string, options: LogsOptions, pretty: boolean): Promise<void> {
    console.log(chalk.cyan('Following log file... (Ctrl+C to stop)\n'));

    // First, show existing logs with tail
    const tailOptions = { ...options, tail: options.tail ?? 10 };
    await this.viewLogs(logPath, tailOptions, pretty);
    console.log(chalk.gray('\n--- Following new entries ---\n'));

    // Watch for new lines
    const watcher = fs.watch(logPath, { persistent: true });
    let position = (await fs.stat(logPath)).size;

    watcher.on('change', () => {
      void (async () => {
        const newPosition = (await fs.stat(logPath)).size;
        if (newPosition > position) {
          const stream = fs.createReadStream(logPath, {
            start: position,
            end: newPosition,
          });

          const rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
          });

          for await (const line of rl) {
            const formatted = this.formatLogLine(line, options, pretty);
            if (formatted) {
              console.log(formatted);
            }
          }

          position = newPosition;
        }
      })();
    });

    // Keep process running
    process.on('SIGINT', () => {
      watcher.close();
      process.exit(0);
    });
  }

  private formatLogLine(line: string, options: LogsOptions, pretty: boolean): string | null {
    try {
      const log = JSON.parse(line) as LogEntry;

      // Apply filters
      if (!this.passesFilters(log, options)) {
        return null;
      }

      if (!pretty) {
        return line;
      }

      return this.formatPrettyLog(log);
    } catch {
      // Not valid JSON, might be an error stack trace - return as-is
      return pretty ? chalk.dim(line) : line;
    }
  }

  private passesFilters(log: LogEntry, options: LogsOptions): boolean {
    if (options.level && log.level !== options.level.toLowerCase()) {
      return false;
    }
    if (options.command && log.command !== options.command && log.name !== options.command) {
      return false;
    }
    return true;
  }

  private formatPrettyLog(log: LogEntry): string {
    const timestamp = new Date(log.time).toLocaleString();
    const level = (log.level ?? 'info').toUpperCase().padEnd(5);
    const levelStr = this.colorizeLevel(level);
    const command = this.formatCommand(log.command ?? log.name);
    const msg = log.msg ?? '';

    let output = `${chalk.gray(timestamp)} ${levelStr} ${command} ${msg}`;

    // Add extra user data (excluding pino internals)
    const extras = this.extractUserData(log);
    if (Object.keys(extras).length > 0) {
      output += this.formatExtras(extras);
    }

    return output;
  }

  private colorizeLevel(level: string): string {
    switch (level.trim()) {
      case 'ERROR':
        return chalk.red(level);
      case 'WARN':
        return chalk.yellow(level);
      case 'INFO':
        return chalk.cyan(level);
      case 'DEBUG':
        return chalk.gray(level);
      default:
        return chalk.white(level);
    }
  }

  private formatCommand(rawCommand?: string): string {
    if (!rawCommand) {
      return '';
    }
    const commandName = rawCommand.charAt(0).toUpperCase() + rawCommand.slice(1);
    return chalk.blue(`[${commandName}]`);
  }

  private extractUserData(log: LogEntry): Record<string, unknown> {
    const pinoInternals = [
      'time',
      'level',
      'pid',
      'msg',
      'command',
      'timestamp',
      'hodgeVersion',
      'hostname',
      'name',
      'enableConsole',
      'v', // pino version field
    ];

    const extras: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(log)) {
      if (!pinoInternals.includes(key)) {
        extras[key] = value;
      }
    }
    return extras;
  }

  private formatExtras(extras: Record<string, unknown>): string {
    let output = '';
    for (const [key, value] of Object.entries(extras)) {
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      output += `\n  ${chalk.dim(key)}: ${valueStr}`;
    }
    return output;
  }
}
