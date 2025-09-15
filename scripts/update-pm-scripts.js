#!/usr/bin/env node
/**
 * Update PM Scripts
 *
 * Development utility to regenerate .hodge/pm-scripts/ from templates
 * when working on Hodge itself (dogfooding).
 *
 * Usage: npm run update-pm-scripts
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the template functions
import { getLinearScripts, getCommonScripts } from '../dist/src/lib/pm-scripts-templates.js';

async function updatePMScripts() {
  console.log(chalk.cyan('🔄 Updating .hodge/pm-scripts from templates...\n'));

  const projectRoot = path.resolve(__dirname, '..');
  const pmScriptsPath = path.join(projectRoot, '.hodge', 'pm-scripts');

  try {
    // Ensure the directory exists
    await fs.ensureDir(pmScriptsPath);

    // Get all scripts (using Linear as default for Hodge project)
    const linearScripts = getLinearScripts();
    const commonScripts = getCommonScripts();
    const allScripts = [...linearScripts, ...commonScripts];

    // Track what we're updating
    const updates = [];

    // Write each script
    for (const script of allScripts) {
      const scriptPath = path.join(pmScriptsPath, script.name);
      const exists = await fs.pathExists(scriptPath);

      await fs.writeFile(scriptPath, script.content, 'utf8');
      await fs.chmod(scriptPath, 0o755);

      updates.push({
        name: script.name,
        status: exists ? 'updated' : 'created',
      });
    }

    // Report results
    console.log(chalk.green('✅ PM scripts updated successfully!\n'));

    updates.forEach(({ name, status }) => {
      const icon = status === 'created' ? '➕' : '🔄';
      const color = status === 'created' ? chalk.green : chalk.yellow;
      console.log(`  ${icon} ${color(name)} (${status})`);
    });

    console.log(chalk.gray('\nScripts location: .hodge/pm-scripts/'));
    console.log(chalk.gray('Remember to rebuild first: npm run build'));
  } catch (error) {
    console.error(chalk.red('❌ Error updating PM scripts:'), error.message);
    process.exit(1);
  }
}

// Run the update
updatePMScripts().catch(console.error);
