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
  [key: string]: unknown;
}

export class LogsCommand {
  private logger = createCommandLogger('logs', { enableConsole: true });

  async execute(options: LogsOptions = {}): Promise<void> {
    // Find log file
    const logPath = this.getLogPath();

    // Handle clear option
    if (options.clear) {
      await this.clearLogs(logPath);
      return;
    }

    if (!(await fs.pathExists(logPath))) {
      this.logger.info(chalk.yellow('No log file found.'));
      this.logger.info(chalk.gray('Logs will be created when hodge commands are executed.'));
      this.logger.info(chalk.gray(`Expected location: ${logPath}`));
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

  private getLogPath(): string {
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

        this.logger.info(chalk.green('✓ Logs cleared successfully'));
        this.logger.info('Logs cleared by user');
      } else {
        this.logger.info(chalk.yellow('No logs to clear'));
      }
    } catch (error) {
      this.logger.error(chalk.red('Failed to clear logs:', error));
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
      this.logger.info(chalk.yellow('No matching log entries found.'));
      if (options.level ?? options.command) {
        this.logger.info(chalk.gray('Try adjusting your filters or run without filters.'));
      }
    } else {
      output.forEach((line) => this.logger.info(line));
      this.logger.info(chalk.gray(`\nShowing ${output.length} log entries`));
    }
  }

  private async followLogs(logPath: string, options: LogsOptions, pretty: boolean): Promise<void> {
    this.logger.info(chalk.cyan('Following log file... (Ctrl+C to stop)\n'));

    // First, show existing logs with tail
    const tailOptions = { ...options, tail: options.tail ?? 10 };
    await this.viewLogs(logPath, tailOptions, pretty);
    this.logger.info(chalk.gray('\n--- Following new entries ---\n'));

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
              this.logger.info(formatted);
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
      if (options.level && log.level !== options.level.toLowerCase()) return null;
      if (options.command && log.command !== options.command) return null;

      if (!pretty) {
        return line;
      }

      // Pretty print format
      const timestamp = new Date(log.time).toLocaleString();
      const level = (log.level ?? 'info').toUpperCase().padEnd(5);
      const command = log.command ? chalk.blue(`[${log.command}]`) : '';
      const msg = log.msg ?? '';

      // Color coding for levels
      let levelStr: string;
      switch (level.trim()) {
        case 'ERROR':
          levelStr = chalk.red(level);
          break;
        case 'WARN':
          levelStr = chalk.yellow(level);
          break;
        case 'INFO':
          levelStr = chalk.cyan(level);
          break;
        case 'DEBUG':
          levelStr = chalk.gray(level);
          break;
        default:
          levelStr = chalk.white(level);
      }

      let output = `${chalk.gray(timestamp)} ${levelStr} ${command} ${msg}`;

      // Add extra data if present
      const extras: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(log)) {
        if (
          !['time', 'level', 'pid', 'msg', 'command', 'timestamp', 'hodgeVersion'].includes(key)
        ) {
          extras[key] = value;
        }
      }

      if (Object.keys(extras).length > 0) {
        output += ' ' + chalk.dim(JSON.stringify(extras, null, 2));
      }

      return output;
    } catch (e) {
      // Not valid JSON, might be an error stack trace
      return pretty ? chalk.dim(line) : line;
    }
  }
}
