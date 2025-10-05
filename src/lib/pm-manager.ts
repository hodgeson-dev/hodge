import { promises as fs } from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { LocalPMAdapter } from './pm/local-pm-adapter.js';

import { createCommandLogger } from './logger.js';
interface FeatureConfig {
  status: string;
  description: string;
  decisions?: string[];
  priority?: number;
  dependencies?: string[];
}

/**
 * Manages project management file updates
 * Handles both local project_management.md and external PM tool integration
 */
export class PMManager {
  private logger = createCommandLogger('p-m-manager', { enableConsole: false });

  private pmPath = path.join('.hodge', 'project_management.md');
  private localAdapter: LocalPMAdapter;

  constructor() {
    this.localAdapter = new LocalPMAdapter();
  }

  /**
   * Initialize PM tracking
   */
  async init(): Promise<void> {
    await this.localAdapter.init();
  }

  /**
   * Add a new feature to project management tracking
   */
  async addFeature(feature: string, config: FeatureConfig): Promise<void> {
    try {
      // Ensure PM file exists
      await this.ensurePMFile();

      // Read current content
      const content = await fs.readFile(this.pmPath, 'utf-8');

      // Check if feature already exists
      if (content.includes(`### ${feature}`)) {
        this.logger.warn(chalk.yellow(`⚠️  Feature ${feature} already exists in PM tracking`));
        return;
      }

      // Format new feature entry
      const newFeatureEntry = this.formatFeature(feature, config);

      // Insert into Active Features section
      const updated = this.insertFeature(content, newFeatureEntry);

      // Write updated content
      await fs.writeFile(this.pmPath, updated, 'utf-8');

      this.logger.info(chalk.green(`✓ Added ${feature} to project management tracking`));

      // TODO: Add external PM integration here when configured
      await this.syncExternalPM(feature, config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to update PM tracking: ${errorMessage}`));
      // Non-fatal error - don't block feature creation
    }
  }

  /**
   * Update feature status in PM tracking
   */
  async updateFeatureStatus(feature: string, newStatus: string): Promise<void> {
    try {
      const content = await fs.readFile(this.pmPath, 'utf-8');

      // Find and update the status line for this feature
      const featureRegex = new RegExp(`(### ${feature}.*?\\n- \\*\\*Status\\*\\*:) [^\\n]+`, 's');

      if (!featureRegex.test(content)) {
        this.logger.warn(chalk.yellow(`⚠️  Feature ${feature} not found in PM tracking`));
        return;
      }

      const updated = content.replace(featureRegex, `$1 ${newStatus}`);
      await fs.writeFile(this.pmPath, updated, 'utf-8');

      this.logger.info(chalk.green(`✓ Updated ${feature} status to: ${newStatus}`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to update feature status: ${errorMessage}`));
    }
  }

  /**
   * Format a feature entry for PM file
   */
  private formatFeature(feature: string, config: FeatureConfig): string {
    const date = new Date().toISOString().split('T')[0];

    let entry = `
### ${feature}
- **Status**: ${config.status || 'Exploring'}
- **Priority**: ${config.priority || 'TBD'}
- **Created**: ${date}
- **Updated**: ${date}
- **Description**: ${config.description}`;

    if (config.dependencies && config.dependencies.length > 0) {
      entry += `\n- **Dependencies**: ${config.dependencies.join(', ')}`;
    }

    if (config.decisions && config.decisions.length > 0) {
      entry += `\n- **Decisions**:`;
      config.decisions.forEach((decision) => {
        // Truncate long decisions
        const truncated = decision.length > 80 ? decision.substring(0, 77) + '...' : decision;
        entry += `\n  - ${truncated}`;
      });
    }

    entry += `
- **Next Steps**:
  - Complete exploration
  - Define test intentions
  - Make architectural decisions
`;

    return entry;
  }

  /**
   * Insert feature into the Active Features section
   */
  private insertFeature(content: string, newFeature: string): string {
    // Find the Active Features section
    const activeFeaturesRegex = /## Active Features\n/;

    if (activeFeaturesRegex.test(content)) {
      // Insert after the Active Features header
      return content.replace(activeFeaturesRegex, `## Active Features\n${newFeature}\n`);
    } else {
      // No Active Features section found, create one
      const completedIndex = content.indexOf('## Completed Features');
      if (completedIndex > -1) {
        // Insert before Completed Features
        return (
          content.substring(0, completedIndex) +
          `## Active Features\n${newFeature}\n\n` +
          content.substring(completedIndex)
        );
      } else {
        // Append at the end
        return content + `\n## Active Features\n${newFeature}\n`;
      }
    }
  }

  /**
   * Ensure PM file exists with basic structure
   */
  private async ensurePMFile(): Promise<void> {
    try {
      await fs.access(this.pmPath);
    } catch {
      // File doesn't exist, create it
      const template = `# Project Management

## Overview
This file tracks all Hodge features and their implementation status.

## Active Features

## Completed Features

## Backlog

`;
      await fs.mkdir(path.dirname(this.pmPath), { recursive: true });
      await fs.writeFile(this.pmPath, template, 'utf-8');
      this.logger.info(chalk.blue('ℹ️  Created project_management.md'));
    }
  }

  /**
   * Sync with external PM tool if configured
   */
  private async syncExternalPM(feature: string, _config: FeatureConfig): Promise<void> {
    // Check if external PM is configured
    const configPath = path.join('.hodge', 'config.json');

    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const hodgeConfig = JSON.parse(configContent) as { pmTool?: string };

      if (hodgeConfig.pmTool) {
        // TODO: Implement actual PM tool integration
        // For now, just log that we would sync
        this.logger.info(chalk.gray(`  Would sync ${feature} to ${hodgeConfig.pmTool}`));

        // Example for Linear integration:
        // if (hodgeConfig.pmTool === 'linear' && hodgeConfig.linearApiKey) {
        //   await this.createLinearIssue(feature, config);
        // }
      }
    } catch {
      // No config or PM tool configured, skip external sync
    }
  }
}
