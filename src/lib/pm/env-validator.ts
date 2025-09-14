/**
 * Environment variable validation for PM integrations
 */

import { PMTool } from './types';

export interface PMEnvironmentConfig {
  tool: PMTool;
  apiKey?: string;
  teamId?: string;
  projectId?: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Validate environment variables for PM tool integration
 * @returns Configuration object with validation results
 */
export function validatePMEnvironment(): PMEnvironmentConfig {
  const errors: string[] = [];
  const tool = process.env.HODGE_PM_TOOL as PMTool;

  const config: PMEnvironmentConfig = {
    tool,
    apiKey: process.env.LINEAR_API_KEY || process.env.GITHUB_TOKEN,
    teamId: process.env.LINEAR_TEAM_ID,
    projectId: process.env.LINEAR_PROJECT_ID,
    isValid: true,
    errors,
  };

  // Check if PM tool is configured
  if (!tool) {
    config.isValid = false;
    errors.push('HODGE_PM_TOOL environment variable is not set');
    return config;
  }

  // Validate tool-specific requirements
  switch (tool) {
    case 'linear':
      if (!config.apiKey) {
        errors.push('LINEAR_API_KEY environment variable is required for Linear');
        config.isValid = false;
      } else if (config.apiKey.length < 20) {
        errors.push('LINEAR_API_KEY appears to be invalid (too short)');
        config.isValid = false;
      }

      if (!config.teamId) {
        errors.push('LINEAR_TEAM_ID environment variable is required for Linear');
        config.isValid = false;
      }
      break;

    case 'github':
      if (!config.apiKey) {
        errors.push('GITHUB_TOKEN environment variable is required for GitHub');
        config.isValid = false;
      }
      break;

    case 'jira':
      errors.push('Jira integration is not yet implemented');
      config.isValid = false;
      break;

    default:
      errors.push(`Unknown PM tool: ${tool}`);
      config.isValid = false;
  }

  return config;
}

/**
 * Print environment validation results
 * @param config - The validation results to print
 */
export function printValidationResults(config: PMEnvironmentConfig): void {
  if (config.isValid) {
    process.stdout.write('✅ PM tool environment is properly configured\n');
    process.stdout.write(`   Tool: ${config.tool}\n`);
    process.stdout.write(`   Team: ${config.teamId || 'default'}\n`);
  } else {
    process.stdout.write('❌ PM tool environment validation failed:\n');
    config.errors.forEach((error) => {
      process.stdout.write(`   - ${error}\n`);
    });
    process.stdout.write('\nRequired environment variables:\n');
    process.stdout.write('   HODGE_PM_TOOL=linear|github|jira\n');

    if (config.tool === 'linear') {
      process.stdout.write('   LINEAR_API_KEY=your-api-key\n');
      process.stdout.write('   LINEAR_TEAM_ID=your-team-id\n');
    } else if (config.tool === 'github') {
      process.stdout.write('   GITHUB_TOKEN=your-github-token\n');
    }
  }
}

/**
 * Check if PM integration is available
 * @returns True if PM tool is configured and valid
 */
export function isPMAvailable(): boolean {
  const config = validatePMEnvironment();
  return config.isValid;
}
