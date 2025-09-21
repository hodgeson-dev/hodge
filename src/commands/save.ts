import chalk from 'chalk';
import { saveManager } from '../lib/save-manager.js';
import { SaveOptions } from '../types/save-manifest.js';
import { ContextManager } from '../lib/context-manager.js';

export interface SaveCommandOptions extends SaveOptions {
  name?: string;
  force?: boolean;
}

/**
 * CLI save command for creating optimized session snapshots
 * Delegates to SaveManager for actual implementation (code does the work)
 * This command provides the interface and feedback (what code does best)
 */
export class SaveCommand {
  private _contextManager?: ContextManager;

  private get contextManager(): ContextManager {
    if (!this._contextManager) {
      this._contextManager = new ContextManager();
    }
    return this._contextManager;
  }

  async execute(name?: string, options: SaveCommandOptions = {}): Promise<void> {
    try {
      // Generate save name if not provided
      const saveName = name || (await this.generateSaveName());

      // Determine save type based on options
      const saveOptions: SaveOptions = {
        type: options.type || 'full',
        minimal: options.minimal,
        includeGenerated: options.includeGenerated || false,
      };

      // Show what type of save we're doing
      if (saveOptions.minimal) {
        console.log(chalk.blue('📝 Creating minimal save (manifest only)...'));
      } else if (saveOptions.type === 'incremental') {
        console.log(chalk.blue('📝 Creating incremental save...'));
      } else if (saveOptions.type === 'auto') {
        console.log(chalk.blue('📝 Creating auto-save...'));
      } else {
        console.log(chalk.blue('📝 Creating full save...'));
      }

      // Perform the save using SaveManager
      const startTime = Date.now();
      const savePath = await saveManager.save(saveName, saveOptions);
      const elapsed = Date.now() - startTime;

      // Show success with performance info
      console.log(chalk.green(`✓ Session saved successfully`));
      console.log(chalk.gray(`  Name: ${saveName}`));
      console.log(chalk.gray(`  Location: ${savePath}`));
      console.log(chalk.gray(`  Time: ${elapsed}ms`));

      if (saveOptions.minimal) {
        console.log(chalk.gray(`  Type: Minimal (manifest only)`));
      } else if (saveOptions.type === 'incremental') {
        console.log(chalk.gray(`  Type: Incremental (changes only)`));
      } else {
        console.log(chalk.gray(`  Type: Full save`));
      }

      // Update context timestamp
      await this.contextManager.save({
        timestamp: new Date().toISOString(),
        lastCommand: `save ${saveName}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`❌ Save failed: ${errorMessage}`));

      if (error instanceof Error && error.stack) {
        console.error(chalk.gray(error.stack));
      }

      throw error;
    }
  }

  /**
   * Generate automatic save name based on current context
   */
  private async generateSaveName(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

    // Try to get feature from context
    try {
      const context = await this.contextManager.load();
      const feature = context?.feature || 'general';
      return `${feature}-${timestamp}`;
    } catch {
      return `save-${timestamp}`;
    }
  }
}
