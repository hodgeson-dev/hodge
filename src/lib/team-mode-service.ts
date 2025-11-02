/**
 * Team Mode Detection Service
 *
 * Determines whether to operate in team mode (PM-integrated) or solo mode (local-only)
 * based on configuration and environment credentials.
 *
 * Key Principles:
 * - pm.enabled flag is the master switch
 * - Credentials are checked when pm.enabled: true
 * - Missing credentials triggers queue mode (graceful degradation)
 * - pm.enabled: false provides hard override (ignore credentials)
 */

import { createCommandLogger } from './logger.js';
import { PMTool } from './pm/types.js';
import fs from 'fs-extra';
import path from 'path';

const logger = createCommandLogger('team-mode-service', { enableConsole: false });

/**
 * PM configuration from hodge.json
 */
export interface PMConfiguration {
  enabled?: boolean;
  tool?: PMTool;
  teamId?: string;
  statusMap?: Record<string, string>;
  verbosity?: 'minimal' | 'normal' | 'detailed';
  queueOfflineRequests?: boolean;
}

/**
 * Result of team mode detection
 */
export interface TeamModeDetectionResult {
  teamMode: boolean;
  queueMode: boolean;
  provider?: PMTool;
  reason: string;
}

/**
 * Credential requirements for each PM provider
 */
const CREDENTIAL_REQUIREMENTS: Record<PMTool, string[]> = {
  linear: ['LINEAR_API_KEY', 'LINEAR_TEAM_ID'],
  github: ['GITHUB_TOKEN'],
  jira: ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
  trello: ['TRELLO_API_KEY', 'TRELLO_TOKEN'],
  asana: ['ASANA_TOKEN'],
  local: [], // Local doesn't require credentials
  custom: [], // Custom integrations define their own
};

/**
 * Service for detecting and managing team mode state
 */
export class TeamModeService {
  constructor(private basePath: string) {}

  /**
   * Detects team mode based on configuration and credentials
   *
   * Detection Logic:
   * 1. Load pm config from hodge.json
   * 2. If pm.enabled is false → solo mode (hard override)
   * 3. If pm.enabled is true → check credentials
   * 4. If credentials present → team mode
   * 5. If credentials missing → queue mode (effectively solo mode with queuing)
   */
  async detectTeamMode(): Promise<TeamModeDetectionResult> {
    const config = await this.loadPMConfiguration();

    // Default to solo mode if no PM config
    if (!config) {
      logger.debug('No PM configuration found, defaulting to solo mode');
      return {
        teamMode: false,
        queueMode: false,
        reason: 'No PM configuration in hodge.json',
      };
    }

    // Hard override: pm.enabled: false
    if (config.enabled === false) {
      logger.debug('PM explicitly disabled via pm.enabled: false');
      return {
        teamMode: false,
        queueMode: false,
        provider: config.tool,
        reason: 'PM integration disabled via configuration',
      };
    }

    // If pm.enabled is not explicitly set, default to false (solo mode)
    if (config.enabled === undefined) {
      logger.debug('PM enabled flag not set, defaulting to solo mode');
      return {
        teamMode: false,
        queueMode: false,
        provider: config.tool,
        reason: 'PM integration not explicitly enabled',
      };
    }

    // pm.enabled is true - check for credentials
    const provider = config.tool ?? 'local';
    const hasCredentials = this.checkCredentials(provider);

    if (!hasCredentials) {
      // Queue mode: pm.enabled but credentials missing
      logger.warn(`PM integration enabled but credentials missing for ${provider}`);
      return {
        teamMode: false,
        queueMode: config.queueOfflineRequests ?? true,
        provider,
        reason: `Missing credentials for ${provider} (queuing operations)`,
      };
    }

    // Team mode active!
    logger.info(`Team mode active with ${provider} provider`);
    return {
      teamMode: true,
      queueMode: false,
      provider,
      reason: `PM integration active with ${provider}`,
    };
  }

  /**
   * Checks if required credentials are present for a provider
   */
  checkCredentials(provider: PMTool): boolean {
    const required = CREDENTIAL_REQUIREMENTS[provider] ?? [];

    // Local provider doesn't need credentials
    if (required.length === 0) {
      return true;
    }

    const missing = required.filter((envVar) => !process.env[envVar]);

    if (missing.length > 0) {
      logger.debug(`Missing credentials for ${provider}: ${missing.join(', ')}`);
      return false;
    }

    return true;
  }

  /**
   * Validates provider-specific required configuration
   */
  validateProviderConfig(
    provider: PMTool,
    config: PMConfiguration
  ): { valid: boolean; missing: string[] } {
    const requirements: Record<PMTool, string[]> = {
      linear: ['teamId'], // Linear requires teamId in config
      github: [], // GitHub auto-detects from git remote
      jira: [], // Jira config is in environment
      trello: [], // Trello config is in environment
      asana: [], // Asana config is in environment
      local: [], // Local requires no config
      custom: [], // Custom defines its own
    };

    const required = requirements[provider] ?? [];
    const missing = required.filter((field) => !config[field as keyof PMConfiguration]);

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Loads PM configuration from hodge.json
   */
  private async loadPMConfiguration(): Promise<PMConfiguration | null> {
    const configPath = path.join(this.basePath, 'hodge.json');

    try {
      if (!(await fs.pathExists(configPath))) {
        logger.debug('hodge.json not found');
        return null;
      }

      const content = await fs.readFile(configPath, 'utf8');
      const parsed = JSON.parse(content) as unknown;

      // Type guard: ensure parsed is an object before accessing .pm
      if (!parsed || typeof parsed !== 'object') {
        logger.debug('Invalid hodge.json format');
        return null;
      }

      const config = parsed as { pm?: PMConfiguration };

      // If no pm section, return null (solo mode)
      if (!config.pm) {
        logger.debug('No pm section in hodge.json');
        return null;
      }

      return config.pm;
    } catch (error) {
      logger.error('Failed to load PM configuration', { error: error as Error });
      return null;
    }
  }
}
