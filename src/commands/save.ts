import chalk from 'chalk';
import { saveManager } from '../lib/save-manager.js';
import { SaveOptions } from '../types/save-manifest.js';
import { ContextManager } from '../lib/context-manager.js';
import { SaveService } from '../lib/save-service.js';
import { createCommandLogger } from '../lib/logger.js';

export interface SaveCommandOptions extends SaveOptions {
  name?: string;
  force?: boolean;
}

/**
 * CLI save command for creating optimized session snapshots
 * Delegates to SaveManager for actual implementation (code does the work)
 * This command provides the interface and feedback (what code does best)
 * @note Refactored in HODGE-321 to use SaveService for testable business logic
 */
export class SaveCommand {
  private logger = createCommandLogger('save', { enableConsole: true });
  private _contextManager?: ContextManager;
  private saveService: SaveService;

  constructor() {
    this.saveService = new SaveService();
  }

  private get contextManager(): ContextManager {
    if (!this._contextManager) {
      this._contextManager = new ContextManager();
    }
    return this._contextManager;
  }

  async execute(name?: string, options: SaveCommandOptions = {}): Promise<void> {
    try {
      // Generate save name if not provided (delegate to SaveService)
      const saveName = name || (await this.saveService.generateSaveName());

      // Determine save type based on options
      const saveOptions: SaveOptions = {
        type: options.type || 'full',
        minimal: options.minimal,
        includeGenerated: options.includeGenerated || false,
      };

      // Show what type of save we're doing (delegate to SaveService for description)
      const saveType = this.saveService.getSaveTypeDescription(saveOptions);
      this.logger.info(chalk.blue(`📝 Creating ${saveType.toLowerCase()}...`));

      // Perform the save using SaveManager
      const startTime = Date.now();
      const savePath = await saveManager.save(saveName, saveOptions);
      const elapsed = Date.now() - startTime;

      // Show success with performance info
      this.logger.info(chalk.green(`✓ Session saved successfully`));
      this.logger.info(chalk.gray(`  Name: ${saveName}`));
      this.logger.info(chalk.gray(`  Location: ${savePath}`));
      this.logger.info(chalk.gray(`  Time: ${elapsed}ms`));
      this.logger.info(chalk.gray(`  Type: ${saveType}`));

      // Update context timestamp
      await this.contextManager.save({
        timestamp: new Date().toISOString(),
        lastCommand: `save ${saveName}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`❌ Save failed: ${errorMessage}`));

      if (error instanceof Error && error.stack) {
        this.logger.error(chalk.gray(error.stack));
      }

      throw error;
    }
  }
}
