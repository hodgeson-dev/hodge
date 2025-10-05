import chalk from 'chalk';
import { IDManager } from '../lib/id-manager.js';
import { createCommandLogger } from '../lib/logger.js';

export class LinkCommand {
  private logger = createCommandLogger('link', { enableConsole: true });
  private idManager: IDManager;

  constructor() {
    this.idManager = new IDManager();
  }

  async execute(localID: string, externalID: string): Promise<void> {
    try {
      // First check if the local ID exists
      const existing = await this.idManager.resolveID(localID);
      if (!existing) {
        this.logger.error(chalk.red(`❌ Feature ${localID} not found`));
        this.logger.info(chalk.gray('Use `hodge explore <feature>` to create a new feature'));
        return;
      }

      // Link the external ID
      const updated = await this.idManager.linkExternalID(localID, externalID);

      this.logger.info(chalk.green(`✓ Linked ${chalk.bold(localID)} to ${chalk.bold(externalID)}`));
      this.logger.info(chalk.gray(`  PM Tool: ${updated.pmTool}`));

      if (updated.lastSynced) {
        this.logger.info(chalk.gray(`  Last Synced: ${updated.lastSynced.toLocaleString()}`));
      }
    } catch (error) {
      this.logger.info(
        chalk.red(
          `❌ Failed to link IDs: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  }
}
