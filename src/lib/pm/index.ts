/**
 * PM Module - Exports and factory
 */

import { LinearAdapter } from './linear-adapter.js';
import { BasePMAdapter } from './base-adapter.js';
import { PMTool, PMConfig, PMOverrides, HodgeMode } from './types.js';
import { createCommandLogger } from '../logger.js';

const logger = createCommandLogger('pm');

export * from './types.js';
export { BasePMAdapter } from './base-adapter.js';
export { LinearAdapter } from './linear-adapter.js';
export { StateConventions } from './conventions.js';
export { validatePMEnvironment, isPMAvailable, printValidationResults } from './env-validator.js';

/**
 * Factory to create appropriate PM adapter
 * @param tool - The PM tool to use (linear, github, jira)
 * @param config - Configuration for the PM tool
 * @param overrides - Optional override configurations
 * @returns A configured PM adapter instance
 * @throws {Error} If the tool is not supported
 * @example
 * const adapter = createPMAdapter('linear', {
 *   tool: 'linear',
 *   apiKey: process.env.LINEAR_API_KEY,
 *   teamId: process.env.LINEAR_TEAM_ID
 * });
 */
export function createPMAdapter(
  tool: PMTool,
  config: PMConfig,
  overrides?: PMOverrides
): BasePMAdapter {
  const options = { config, overrides };

  switch (tool) {
    case 'linear':
      return new LinearAdapter(options);

    case 'github':
      // TODO: Implement GitHub adapter
      throw new Error('GitHub adapter not yet implemented');

    case 'jira':
      // TODO: Implement Jira adapter
      throw new Error('Jira adapter not yet implemented');

    default:
      throw new Error(`Unknown PM tool: ${tool}`);
  }
}

/**
 * Get PM adapter from environment variables
 * Requires HODGE_PM_TOOL to be set, along with tool-specific variables
 * @returns Configured PM adapter or null if not configured
 * @example
 * // Set environment variables:
 * // HODGE_PM_TOOL=linear
 * // LINEAR_API_KEY=your-key
 * // LINEAR_TEAM_ID=your-team
 * const adapter = getPMAdapterFromEnv();
 */
export function getPMAdapterFromEnv(): BasePMAdapter | null {
  const tool = process.env.HODGE_PM_TOOL as PMTool;

  if (!tool) {
    return null;
  }

  const config: PMConfig = {
    tool,
    apiKey: process.env.LINEAR_API_KEY ?? process.env.GITHUB_TOKEN,
    teamId: process.env.LINEAR_TEAM_ID,
    projectId: process.env.LINEAR_PROJECT_ID,
  };

  // Validate required fields
  if (tool === 'linear' && (!config.apiKey || !config.teamId)) {
    logger.warn('Linear requires LINEAR_API_KEY and LINEAR_TEAM_ID environment variables');
    return null;
  }

  try {
    return createPMAdapter(tool, config);
  } catch (error) {
    logger.warn('Failed to create PM adapter', { error: error as Error });
    return null;
  }
}

/**
 * Helper to transition issue based on mode change
 * @param issueId - The ID of the issue to transition
 * @param fromMode - Current Hodge mode
 * @param toMode - Target Hodge mode
 * @returns True if transition succeeded, false otherwise
 * @example
 * await transitionIssueForMode('LIN-123', 'explore', 'build');
 */
export async function transitionIssueForMode(
  issueId: string,
  fromMode: HodgeMode,
  toMode: HodgeMode
): Promise<boolean> {
  const adapter = getPMAdapterFromEnv();

  if (!adapter) {
    return false;
  }

  try {
    await adapter.transitionIssue(issueId, fromMode, toMode);
    return true;
  } catch (error) {
    logger.error('Failed to transition issue', {
      error: error as Error,
      issueId,
      fromMode,
      toMode,
    });
    return false;
  }
}
