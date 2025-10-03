/**
 * Install Claude slash commands for Hodge integration
 */

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { getClaudeCommands } from '../lib/claude-commands.js';

// Simple logger for this module
const log = {
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development' || process.env.HODGE_DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  },
};

export async function installClaudeSlashCommands(rootPath: string): Promise<void> {
  const claudeDir = path.join(rootPath, '.claude');
  const commandsDir = path.join(claudeDir, 'commands');

  // Ensure .claude/commands directory exists
  await fs.ensureDir(commandsDir);

  // Get all 9 Hodge slash commands
  const commands = getClaudeCommands();

  // Install each command
  let installedCount = 0;
  let skippedCount = 0;

  for (const command of commands) {
    const commandPath = path.join(commandsDir, `${command.name}.md`);

    // Check if command already exists
    if (await fs.pathExists(commandPath)) {
      log.debug(`Skipping existing command: ${command.name}`);
      skippedCount++;
      continue;
    }

    // Write the command file
    await fs.writeFile(commandPath, command.content, 'utf8');
    installedCount++;
    log.debug(`Installed command: ${command.name}`);
  }

  if (installedCount > 0) {
    log.debug(`Installed ${installedCount} Claude slash commands`);
  }
  if (skippedCount > 0) {
    log.debug(`Skipped ${skippedCount} existing commands`);
  }
}
