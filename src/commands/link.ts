import chalk from 'chalk';
import { IDManager } from '../lib/id-manager.js';

export class LinkCommand {
  private idManager: IDManager;

  constructor() {
    this.idManager = new IDManager();
  }

  async execute(localID: string, externalID: string): Promise<void> {
    try {
      // First check if the local ID exists
      const existing = await this.idManager.resolveID(localID);
      if (!existing) {
        console.log(chalk.red(`❌ Feature ${localID} not found`));
        console.log(chalk.gray('Use `hodge explore <feature>` to create a new feature'));
        return;
      }

      // Link the external ID
      const updated = await this.idManager.linkExternalID(localID, externalID);

      console.log(chalk.green(`✓ Linked ${chalk.bold(localID)} to ${chalk.bold(externalID)}`));
      console.log(chalk.gray(`  PM Tool: ${updated.pmTool}`));

      if (updated.lastSynced) {
        console.log(chalk.gray(`  Last Synced: ${updated.lastSynced.toLocaleString()}`));
      }
    } catch (error) {
      console.log(
        chalk.red(
          `❌ Failed to link IDs: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  }
}
