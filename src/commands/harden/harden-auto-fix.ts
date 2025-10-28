/**
 * Harden Auto-Fix Mode
 * Handles auto-fix workflow for staged files
 */

import chalk from 'chalk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { createCommandLogger } from '../../lib/logger.js';
import { AutoFixService } from '../../lib/auto-fix-service.js';
import type { ToolchainConfig } from '../../types/toolchain.js';

/**
 * Handles auto-fix workflow
 */
export class HardenAutoFix {
  private logger = createCommandLogger('harden-auto-fix', { enableConsole: true });

  /**
   * Handle auto-fix mode - run auto-fix on staged files
   */
  async handleAutoFix(feature: string): Promise<void> {
    this.logger.info(chalk.blue('🔧 Auto-Fix Mode: Running auto-fixable tools on staged files\n'));

    try {
      // Define paths
      const featureDir = path.join('.hodge', 'features', feature);
      const hardenDir = path.join(featureDir, 'harden');

      // Create harden directory
      await fs.mkdir(hardenDir, { recursive: true });

      // Load toolchain config
      const toolchainConfigPath = path.join(process.cwd(), '.hodge', 'toolchain.yaml');
      if (!existsSync(toolchainConfigPath)) {
        this.logger.error(chalk.red('❌ No toolchain.yaml found'));
        this.logger.info(chalk.gray('   Run `hodge init` to create toolchain configuration'));
        throw new Error('Toolchain configuration not found');
      }

      const toolchainYaml = await fs.readFile(toolchainConfigPath, 'utf-8');
      const toolchainConfig = yaml.load(toolchainYaml) as ToolchainConfig;

      // Run auto-fix
      const autoFixService = new AutoFixService();
      const report = await autoFixService.runAutoFix(toolchainConfig);

      // Save report for reference
      await fs.writeFile(
        path.join(hardenDir, 'auto-fix-report.json'),
        JSON.stringify(report, null, 2)
      );

      // Check for failures
      if (report.failures.length > 0) {
        this.logger.warn(
          chalk.yellow(`\n⚠️  ${report.failures.length} tool(s) failed to auto-fix`)
        );
        this.logger.info(chalk.gray('Failures will be included in quality check report\n'));
      }

      this.logger.info(chalk.green('✅ Auto-fix complete\n'));
    } catch (error) {
      this.logger.error(chalk.red('❌ Auto-fix failed'), { error: error as Error });
      throw error;
    }
  }
}
