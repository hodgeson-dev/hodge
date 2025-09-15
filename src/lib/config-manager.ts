import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Configuration management for Hodge
 */

export interface PushConfig {
  autoPush?: boolean;
  strategy?: 'safe' | 'force' | 'interactive';
  createPR?: 'always' | 'never' | 'prompt';
  protectedBranches?: string[];
  remoteName?: string;
  branchPatterns?: {
    feature?: string;
    fix?: string;
    release?: string;
  };
  issuePatterns?: Record<string, string>;
}

export interface ShipConfig {
  autoPush?: boolean;
  push?: PushConfig;
}

export interface HodgeConfig {
  version?: string;
  projectType?: string;
  ship?: ShipConfig;
  commitTypes?: string[];
  standards?: {
    enforceInHarden?: boolean;
    customRules?: string[];
  };
}

/**
 * Manages Hodge configuration
 */
export class ConfigManager {
  private configPath = '.hodge/config.json';
  private config: HodgeConfig | null = null;

  /**
   * Load configuration from file
   */
  async load(): Promise<HodgeConfig> {
    if (this.config) {
      return this.config;
    }

    if (!existsSync(this.configPath)) {
      // Return default config if file doesn't exist
      this.config = this.getDefaultConfig();
      return this.config;
    }

    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(content) as HodgeConfig;

      // Merge with defaults for any missing fields
      this.config = this.mergeWithDefaults(this.config);

      return this.config;
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
      this.config = this.getDefaultConfig();
      return this.config;
    }
  }

  /**
   * Save configuration to file
   */
  async save(config: HodgeConfig): Promise<void> {
    this.config = config;

    // Ensure directory exists
    const configDir = path.dirname(this.configPath);
    await fs.mkdir(configDir, { recursive: true });

    // Save config
    await fs.writeFile(
      this.configPath,
      JSON.stringify(config, null, 2)
    );
  }

  /**
   * Get a specific configuration value
   */
  async get<K extends keyof HodgeConfig>(key: K): Promise<HodgeConfig[K]> {
    const config = await this.load();
    return config[key];
  }

  /**
   * Set a specific configuration value
   */
  async set<K extends keyof HodgeConfig>(key: K, value: HodgeConfig[K]): Promise<void> {
    const config = await this.load();
    config[key] = value;
    await this.save(config);
  }

  /**
   * Get push configuration
   */
  async getPushConfig(): Promise<PushConfig> {
    const config = await this.load();
    return config.ship?.push || this.getDefaultPushConfig();
  }

  /**
   * Check if a branch is protected
   */
  async isProtectedBranch(branch: string): Promise<boolean> {
    const pushConfig = await this.getPushConfig();
    const protectedBranches = pushConfig.protectedBranches || ['main', 'master', 'develop'];

    return protectedBranches.includes(branch);
  }

  /**
   * Check if auto-push is enabled
   */
  async isAutoPushEnabled(): Promise<boolean> {
    const config = await this.load();
    return config.ship?.autoPush || false;
  }

  /**
   * Get commit types
   */
  async getCommitTypes(): Promise<string[]> {
    const config = await this.load();
    return config.commitTypes || this.getDefaultCommitTypes();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): HodgeConfig {
    return {
      version: '1.0.0',
      projectType: 'node',
      ship: {
        autoPush: false,
        push: this.getDefaultPushConfig()
      },
      commitTypes: this.getDefaultCommitTypes(),
      standards: {
        enforceInHarden: true,
        customRules: []
      }
    };
  }

  /**
   * Get default push configuration
   */
  private getDefaultPushConfig(): PushConfig {
    return {
      autoPush: false,
      strategy: 'safe',
      createPR: 'prompt',
      protectedBranches: ['main', 'master', 'develop', 'staging', 'production'],
      remoteName: 'origin',
      branchPatterns: {
        feature: '^feature/',
        fix: '^(fix|bugfix|hotfix)/',
        release: '^(release|rc)/'
      },
      issuePatterns: {
        linear: '(?:LIN|HOD)-\\d+',
        jira: '[A-Z]{2,}-\\d+',
        github: '#\\d+'
      }
    };
  }

  /**
   * Get default commit types
   */
  private getDefaultCommitTypes(): string[] {
    return ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert'];
  }

  /**
   * Merge config with defaults
   */
  private mergeWithDefaults(config: HodgeConfig): HodgeConfig {
    const defaults = this.getDefaultConfig();

    return {
      version: config.version || defaults.version,
      projectType: config.projectType || defaults.projectType,
      ship: {
        autoPush: config.ship?.autoPush ?? defaults.ship?.autoPush,
        push: {
          ...defaults.ship?.push,
          ...config.ship?.push
        }
      },
      commitTypes: config.commitTypes || defaults.commitTypes,
      standards: {
        ...defaults.standards,
        ...config.standards
      }
    };
  }

  /**
   * Initialize config file with defaults
   */
  async init(): Promise<void> {
    if (!existsSync(this.configPath)) {
      await this.save(this.getDefaultConfig());
    }
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

/**
 * Get or create config manager instance
 */
export function getConfigManager(): ConfigManager {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  return configManager;
}