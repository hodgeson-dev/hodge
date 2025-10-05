import chalk from 'chalk';
import { saveManager } from '../lib/save-manager.js';
import { LoadOptions } from '../types/save-manifest.js';
import { ContextManager } from '../lib/context-manager.js';
import { promises as fs } from 'fs';
import path from 'path';
import { createCommandLogger } from '../lib/logger.js';

export interface LoadCommandOptions extends LoadOptions {
  recent?: boolean;
  list?: boolean;
}

/**
 * CLI load command for restoring session snapshots
 * Uses optimized SaveManager with lazy loading for speed
 * This command handles the mechanics (what code does best)
 */
export class LoadCommand {
  private logger = createCommandLogger('load', { enableConsole: true });
  private _contextManager?: ContextManager;

  private get contextManager(): ContextManager {
    if (!this._contextManager) {
      this._contextManager = new ContextManager();
    }
    return this._contextManager;
  }
  private get savesDir(): string {
    return path.join(process.cwd(), '.hodge', 'saves');
  }

  async execute(name?: string, options: LoadCommandOptions = {}): Promise<void> {
    try {
      // Handle list option
      if (options.list) {
        await this.listSaves();
        return;
      }

      // Handle recent option or find most recent
      let saveName = name;
      if (options.recent || !saveName) {
        const mostRecent = await this.findMostRecentSave();
        if (!mostRecent) {
          this.logger.info(chalk.yellow('No saved sessions found'));
          return;
        }
        saveName = mostRecent;
        this.logger.info(chalk.blue(`Loading most recent save: ${saveName}`));
      }

      // Load the save using SaveManager
      const startTime = Date.now();

      const loadOptions: LoadOptions = {
        lazy: options.lazy !== false, // Default to lazy loading
        priority: options.priority || 'speed',
        includeGenerated: options.includeGenerated || false,
      };

      this.logger.info(chalk.blue('📂 Loading session...'));

      const session = await saveManager.load(saveName, loadOptions);
      const elapsed = Date.now() - startTime;

      // Present the loaded session info
      if (session.manifest) {
        this.logger.info(chalk.green(`✓ Session loaded successfully (${elapsed}ms)`));
        this.logger.info('');
        this.logger.info(chalk.bold('Session Overview:'));
        this.logger.info(`  Feature: ${chalk.cyan(session.manifest.session.feature)}`);
        this.logger.info(`  Phase: ${chalk.cyan(session.manifest.session.phase)}`);
        this.logger.info(`  Last Action: ${session.manifest.session.lastAction}`);
        this.logger.info(`  Duration: ${session.manifest.session.elapsedMinutes} minutes`);
        this.logger.info('');
        this.logger.info(chalk.bold('Current State:'));
        this.logger.info(
          `  Test Status: ${this.formatTestStatus(session.manifest.state.testStatus)}`
        );
        this.logger.info(`  Completed Tasks: ${session.manifest.state.completedTasks.length}`);
        this.logger.info(`  Pending Tasks: ${session.manifest.state.pendingTasks.length}`);
        this.logger.info(`  Modified Files: ${session.manifest.state.modifiedFiles.length}`);

        // Update context with loaded session
        await this.contextManager.save({
          feature: session.manifest.session.feature,
          mode: session.manifest.session.phase as 'explore' | 'build' | 'harden' | 'ship',
          timestamp: new Date().toISOString(),
          lastCommand: `load ${saveName}`,
        });

        // Show quick actions based on phase
        this.logger.info('');
        this.logger.info(chalk.bold('Quick Actions:'));
        this.showQuickActions(session.manifest.session.phase, session.manifest.session.feature);
      } else {
        this.logger.info(chalk.green(`✓ Session loaded (${elapsed}ms)`));
        this.logger.info(chalk.gray('Note: This save uses legacy format'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`❌ Load failed: ${errorMessage}`));

      if (error instanceof Error && error.stack) {
        this.logger.error(chalk.gray(error.stack));
      }

      throw error;
    }
  }

  /**
   * List all available saves
   */
  private async listSaves(): Promise<void> {
    try {
      const saves = await fs.readdir(this.savesDir);

      if (saves.length === 0) {
        this.logger.info(chalk.yellow('No saved sessions found'));
        return;
      }

      this.logger.info(chalk.bold(`Found ${saves.length} saved sessions:`));
      this.logger.info('');

      // Get details for each save
      const saveDetails = await Promise.all(
        saves.map(async (save) => {
          const manifestPath = path.join(this.savesDir, save, 'manifest.json');
          try {
            const manifestContent = await fs.readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent) as {
              session?: { feature?: string; phase?: string };
              timestamp?: string;
              type?: string;
            };
            const stat = await fs.stat(path.join(this.savesDir, save));
            return {
              name: save,
              feature: manifest.session?.feature || 'unknown',
              phase: manifest.session?.phase || 'unknown',
              timestamp: manifest.timestamp || stat.mtime.toISOString(),
              type: manifest.type || 'full',
            };
          } catch {
            // Legacy save without manifest
            const stat = await fs.stat(path.join(this.savesDir, save));
            return {
              name: save,
              feature: 'unknown',
              phase: 'unknown',
              timestamp: stat.mtime.toISOString(),
              type: 'legacy',
            };
          }
        })
      );

      // Sort by timestamp (newest first)
      saveDetails.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      // Display saves
      for (const save of saveDetails) {
        const age = this.formatAge(save.timestamp);
        this.logger.info(`  ${chalk.cyan(save.name)}`);
        this.logger.info(`    Feature: ${save.feature}, Phase: ${save.phase}`);
        this.logger.info(`    Type: ${save.type}, Age: ${age}`);
        this.logger.info('');
      }

      this.logger.info(chalk.gray(`To load a specific save: hodge load <name>`));
      this.logger.info(chalk.gray(`To load most recent: hodge load --recent`));
    } catch (error) {
      this.logger.error(chalk.red('Failed to list saves:', error));
    }
  }

  /**
   * Find the most recent save
   */
  private async findMostRecentSave(): Promise<string | null> {
    try {
      const saves = await fs.readdir(this.savesDir);
      if (saves.length === 0) {
        return null;
      }

      // Get modification times
      const saveStats = await Promise.all(
        saves.map(async (save) => ({
          name: save,
          mtime: (await fs.stat(path.join(this.savesDir, save))).mtime.getTime(),
        }))
      );

      // Sort by modification time
      saveStats.sort((a, b) => b.mtime - a.mtime);
      return saveStats[0].name;
    } catch {
      return null;
    }
  }

  /**
   * Format test status with color
   */
  private formatTestStatus(status: string): string {
    switch (status) {
      case 'passing':
        return chalk.green('✓ passing');
      case 'failing':
        return chalk.red('✗ failing');
      default:
        return chalk.gray('unknown');
    }
  }

  /**
   * Show quick actions based on current phase
   */
  private showQuickActions(phase: string, feature: string): void {
    switch (phase) {
      case 'explore':
        this.logger.info(`  • Continue exploring: ${chalk.cyan(`/explore ${feature}`)}`);
        this.logger.info(`  • Make decision: ${chalk.cyan('/decide')}`);
        break;
      case 'build':
        this.logger.info(`  • Continue building: ${chalk.cyan(`/build ${feature}`)}`);
        this.logger.info(`  • Run tests: ${chalk.cyan('npm test')}`);
        break;
      case 'harden':
        this.logger.info(`  • Continue hardening: ${chalk.cyan(`/harden ${feature}`)}`);
        this.logger.info(`  • Run integration tests: ${chalk.cyan('npm run test:integration')}`);
        break;
      case 'ship':
        this.logger.info(`  • Continue shipping: ${chalk.cyan(`/ship ${feature}`)}`);
        this.logger.info(`  • Check quality: ${chalk.cyan('npm run quality')}`);
        break;
    }
  }

  /**
   * Format age of a timestamp
   */
  private formatAge(timestamp: string): string {
    const age = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(age / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return 'just now';
    }
  }
}
