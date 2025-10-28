/**
 * PM Tool Configuration for Init Command
 * Handles environment setup and configuration for PM tools
 */

import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { PMTool } from '../../lib/pm/types.js';
import { createCommandLogger } from '../../lib/logger.js';

/**
 * Valid PM tool values that can be selected by users
 */
export const VALID_PM_TOOLS: readonly PMTool[] = [
  'linear',
  'github',
  'jira',
  'trello',
  'asana',
  'custom',
] as const;

/**
 * Handles PM tool environment configuration
 */
export class InitPMConfig {
  private logger = createCommandLogger('init-pm-config', { enableConsole: true });

  /**
   * Get environment variable templates for a PM tool
   */
  getPMToolEnvTemplate(pmTool: PMTool): Record<string, { value: string; comment: string }> {
    const templates: Record<PMTool, Record<string, { value: string; comment: string }>> = {
      linear: {
        LINEAR_API_KEY: {
          value: 'lin_api_xxxxx',
          comment: '# Get your API key from: https://linear.app/settings/api',
        },
        LINEAR_TEAM_ID: {
          value: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          comment: '# Get your team ID using the list-linear-teams.js script',
        },
        LINEAR_TEAM_NAME: {
          value: 'YourTeamName',
          comment: '# Used by create-linear-project script',
        },
      },
      github: {
        GITHUB_TOKEN: {
          value: 'ghp_xxxxx',
          comment: '# Create a token at: https://github.com/settings/tokens',
        },
        GITHUB_OWNER: {
          value: 'owner',
          comment: '# GitHub organization or username',
        },
        GITHUB_REPO: {
          value: 'repository',
          comment: '# GitHub repository name',
        },
      },
      jira: {
        JIRA_HOST: {
          value: 'https://yourcompany.atlassian.net',
          comment: '# Your Jira instance URL',
        },
        JIRA_EMAIL: {
          value: 'your-email@company.com',
          comment: '# Your Jira account email',
        },
        JIRA_API_TOKEN: {
          value: 'xxxxx',
          comment: '# Get token from: https://id.atlassian.com/manage-profile/security/api-tokens',
        },
        JIRA_PROJECT_KEY: {
          value: 'PROJ',
          comment: '# Your Jira project key',
        },
      },
      trello: {
        TRELLO_API_KEY: {
          value: 'xxxxx',
          comment: '# Get your API key from: https://trello.com/app-key',
        },
        TRELLO_TOKEN: {
          value: 'xxxxx',
          comment: '# Authorize and get token from the API key page',
        },
        TRELLO_LIST_ID: {
          value: 'xxxxx',
          comment: '# Your default Trello list ID',
        },
      },
      asana: {
        ASANA_TOKEN: {
          value: 'xxxxx',
          comment: '# Get token from: https://app.asana.com/0/developer-console',
        },
        ASANA_WORKSPACE_ID: {
          value: 'xxxxx',
          comment: '# Your Asana workspace ID',
        },
        ASANA_PROJECT_ID: {
          value: 'xxxxx',
          comment: '# Your default Asana project ID',
        },
      },
      custom: {},
      local: {}, // Local PM doesn't need any env vars
    };

    return templates[pmTool] || {};
  }

  /**
   * Updates .env file with placeholder values for PM tool
   */
  async updateEnvFile(pmTool: PMTool, missingVars: string[]): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = await this.readExistingEnvFile(envPath);

    const template = this.getPMToolEnvTemplate(pmTool);
    if (!template) return;

    envContent = this.addEnvFileHeader(envContent, pmTool);
    envContent = this.addPMToolVariable(envContent, pmTool);
    envContent = this.addMissingVariables(envContent, missingVars, template);
    envContent = this.addOptionalVariables(envContent, missingVars, template);

    await fs.writeFile(envPath, envContent, 'utf8');
    await this.updateGitignoreForEnv();
  }

  /**
   * Checks if required environment variables are configured for a PM tool
   */
  checkPMToolEnvironment(pmTool: PMTool): { configured: boolean; missing: string[] } {
    const requirements: Record<PMTool, string[]> = {
      linear: ['LINEAR_API_KEY', 'LINEAR_TEAM_ID'],
      github: ['GITHUB_TOKEN'],
      jira: ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
      trello: ['TRELLO_API_KEY', 'TRELLO_TOKEN'],
      asana: ['ASANA_TOKEN'],
      custom: [], // Custom integrations define their own requirements
      local: [], // Local PM doesn't require any environment variables
    };

    const required = requirements[pmTool];
    const missing = required.filter((envVar) => !process.env[envVar]);

    return {
      configured: missing.length === 0,
      missing,
    };
  }

  /**
   * Validates if a PM tool selection is valid
   */
  isValidPMTool(pmTool: string): pmTool is PMTool {
    return VALID_PM_TOOLS.includes(pmTool as PMTool);
  }

  /**
   * Checks and configures environment for a PM tool
   */
  async checkAndConfigureEnvironment(pmTool: PMTool): Promise<void> {
    const envStatus = this.checkPMToolEnvironment(pmTool);
    this.logger.debug('PM tool environment status', envStatus);

    if (envStatus.configured) {
      this.logger.info(chalk.green(`✓ Environment configured for ${pmTool}`));
    } else {
      await this.handleMissingEnvironment(pmTool, envStatus);
    }
  }

  /**
   * Handles missing environment variables by prompting user
   */
  async handleMissingEnvironment(
    pmTool: PMTool,
    envStatus: { configured: boolean; missing: string[] }
  ): Promise<void> {
    this.logger.info(
      chalk.yellow(
        `⚠️  Missing environment variables for ${pmTool}: ${envStatus.missing.join(', ')}`
      )
    );
    this.logger.info(chalk.gray(`   Set these variables to enable full ${pmTool} integration`));

    const { updateEnv } = await inquirer.prompt<{ updateEnv: boolean }>([
      {
        type: 'confirm',
        name: 'updateEnv',
        message: 'Would you like to add placeholder values to your .env file?',
        default: true,
      },
    ]);

    if (updateEnv) {
      await this.updateEnvFile(pmTool, envStatus.missing);
      this.logger.info(chalk.green('✓ Added placeholder values to .env file'));
      this.logger.info(chalk.gray('   Edit .env to add your actual API keys'));
    }
  }

  // Private helper methods

  private async readExistingEnvFile(envPath: string): Promise<string> {
    if (await fs.pathExists(envPath)) {
      return await fs.readFile(envPath, 'utf8');
    }
    return '';
  }

  private addEnvFileHeader(envContent: string, pmTool: PMTool): string {
    if (!envContent) {
      return `# Hodge PM Tool Configuration\n# PM Tool: ${pmTool}\n\n`;
    } else if (!envContent.includes('# Hodge PM Tool Configuration')) {
      return envContent + `\n\n# Hodge PM Tool Configuration\n# PM Tool: ${pmTool}\n`;
    }
    return envContent;
  }

  private addPMToolVariable(envContent: string, pmTool: PMTool): string {
    if (!envContent.includes('HODGE_PM_TOOL')) {
      return envContent + `\nHODGE_PM_TOOL=${pmTool}\n`;
    }
    return envContent;
  }

  private addMissingVariables(
    envContent: string,
    missingVars: string[],
    template: Record<string, { comment: string; value: string }>
  ): string {
    let result = envContent;
    for (const varName of missingVars) {
      if (!result.includes(varName)) {
        const config = template[varName];
        if (config) {
          result += `\n${config.comment}\n${varName}=${config.value}\n`;
        }
      }
    }
    return result;
  }

  private addOptionalVariables(
    envContent: string,
    missingVars: string[],
    template: Record<string, { comment: string; value: string }>
  ): string {
    let result = envContent;
    for (const [varName, config] of Object.entries(template)) {
      if (!missingVars.includes(varName) && !result.includes(varName)) {
        result += `\n${config.comment}\n# ${varName}=${config.value}  # Optional\n`;
      }
    }
    return result;
  }

  private async updateGitignoreForEnv(): Promise<void> {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (await fs.pathExists(gitignorePath)) {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env')) {
        await fs.appendFile(gitignorePath, '\n# Environment variables\n.env\n.env.local\n');
      }
    }
  }
}
