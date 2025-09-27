import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Configuration management for Hodge
 * Implements layered configuration:
 * 1. Environment variables (highest priority)
 * 2. hodge.json (user config, committed to git)
 * 3. .hodge/config.json (generated metadata, not in git)
 * 4. Built-in defaults (lowest priority)
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

export interface PMConfig {
  tool?: 'linear' | 'github' | 'jira' | 'local';
  statusMap?: Record<string, string>;
  verbosity?: 'minimal' | 'essential' | 'rich';
}

export interface HodgeConfig {
  version?: string;
  pm?: PMConfig;
  ship?: ShipConfig;
  commitTypes?: string[];
  standards?: {
    enforceInHarden?: boolean;
    customRules?: string[];
  };
  features?: {
    autoSave?: boolean;
    debugMode?: boolean;
  };
}

export interface GeneratedConfig {
  projectName?: string;
  projectType?: string;
  pmTool?: string; // Backward compatibility
  detectedTools?: Record<string, unknown>;
  createdAt?: string;
  version?: string;
}

/**
 * Manages Hodge configuration with layered approach
 */
export class ConfigManager {
  private userConfigPath: string;
  private generatedConfigPath: string;
  private userConfig: HodgeConfig | null = null;
  private generatedConfig: GeneratedConfig | null = null;
  private configLoaded = false;

  constructor(basePath?: string) {
    const base = basePath || process.cwd();
    this.userConfigPath = path.join(base, 'hodge.json');
    this.generatedConfigPath = path.join(base, '.hodge', 'config.json');
  }

  /**
   * Load configuration from all sources
   */
  async load(): Promise<HodgeConfig> {
    if (!this.configLoaded) {
      await this.loadUserConfig();
      await this.loadGeneratedConfig();
      this.configLoaded = true;
    }

    // Merge all config sources with proper priority
    return this.getMergedConfig();
  }

  /**
   * Load user configuration from hodge.json
   */
  private async loadUserConfig(): Promise<void> {
    if (!existsSync(this.userConfigPath)) {
      return; // User config is optional
    }

    try {
      const content = await fs.readFile(this.userConfigPath, 'utf-8');
      this.userConfig = JSON.parse(content) as HodgeConfig;

      // Validate no secrets in user config
      this.validateNoSecrets(this.userConfig);
    } catch (error) {
      if (process.env.DEBUG) {
        console.warn(chalk.yellow('Failed to load hodge.json:', String(error)));
      }
    }
  }

  /**
   * Load generated configuration from .hodge/config.json
   */
  private async loadGeneratedConfig(): Promise<void> {
    if (!existsSync(this.generatedConfigPath)) {
      return; // Generated config might not exist yet
    }

    try {
      const content = await fs.readFile(this.generatedConfigPath, 'utf-8');
      this.generatedConfig = JSON.parse(content) as GeneratedConfig;
    } catch (error) {
      if (process.env.DEBUG) {
        console.warn(chalk.yellow('Failed to load .hodge/config.json:', String(error)));
      }
    }
  }

  /**
   * Get merged configuration with proper priority
   */
  private getMergedConfig(): HodgeConfig {
    const defaults = this.getDefaultConfig();
    const config: HodgeConfig = { ...defaults };

    // Merge user config
    if (this.userConfig) {
      Object.assign(config, this.userConfig);
    }

    // Apply environment variable overrides
    const pmToolFromEnv = process.env.HODGE_PM_TOOL as PMConfig['tool'];
    if (pmToolFromEnv) {
      config.pm = config.pm || {};
      config.pm.tool = pmToolFromEnv;
    }

    // Apply debug mode from environment
    if (process.env.DEBUG || process.env.HODGE_DEBUG) {
      config.features = config.features || {};
      config.features.debugMode = true;
    }

    return config;
  }

  /**
   * Save user configuration to hodge.json
   */
  async save(config: HodgeConfig): Promise<void> {
    // Validate no secrets
    this.validateNoSecrets(config);

    // Ensure version is set
    if (!config.version) {
      config.version = '1.0.0';
    }

    // Save to hodge.json
    await fs.writeFile(this.userConfigPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    this.userConfig = config;
  }

  /**
   * Update generated configuration
   */
  async updateGeneratedConfig(updates: Partial<GeneratedConfig>): Promise<void> {
    // Ensure directory exists
    const configDir = path.dirname(this.generatedConfigPath);
    await fs.mkdir(configDir, { recursive: true });

    // Merge with existing
    const config = { ...this.generatedConfig, ...updates };

    // Save
    await fs.writeFile(this.generatedConfigPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    this.generatedConfig = config;
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
   * Get PM tool with environment override
   */
  async getPMTool(): Promise<string | undefined> {
    // Environment variable takes precedence
    if (process.env.HODGE_PM_TOOL) {
      return process.env.HODGE_PM_TOOL;
    }

    const config = await this.load();
    if (config.pm?.tool) {
      return config.pm.tool;
    }

    // Check backward compatibility in generated config
    if (this.generatedConfig?.pmTool) {
      return this.generatedConfig.pmTool;
    }

    return undefined;
  }

  /**
   * Get PM API key (always from environment)
   */
  getPMApiKey(tool?: string): string | undefined {
    const pmTool = tool || process.env.HODGE_PM_TOOL;

    switch (pmTool) {
      case 'linear':
        return process.env.LINEAR_API_KEY;
      case 'github':
        return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      case 'jira':
        return process.env.JIRA_API_TOKEN;
      default:
        return undefined;
    }
  }

  /**
   * Get PM team ID (always from environment)
   */
  getPMTeamId(): string | undefined {
    return process.env.LINEAR_TEAM_ID;
  }

  /**
   * Get PM configuration
   */
  async getPMConfig(): Promise<PMConfig | undefined> {
    const config = await this.load();
    return config.pm;
  }

  /**
   * Check if debug mode is enabled
   */
  async isDebugMode(): Promise<boolean> {
    const config = await this.load();
    return Boolean(config.features?.debugMode);
  }

  /**
   * Check if auto-save is enabled
   */
  async isAutoSaveEnabled(): Promise<boolean> {
    const config = await this.load();
    return config.features?.autoSave !== false; // Default true
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
   * Migrate configuration from old format to new format
   */
  async migrateConfig(): Promise<boolean> {
    try {
      // Check if migration is needed
      const hasOldConfig = existsSync(this.generatedConfigPath);
      const hasNewConfig = existsSync(this.userConfigPath);

      if (!hasOldConfig || hasNewConfig) {
        return false; // No migration needed
      }

      // Read old config
      const oldContent = await fs.readFile(this.generatedConfigPath, 'utf-8');
      const oldConfig = JSON.parse(oldContent) as GeneratedConfig;

      // Create new user config from migratable settings
      const newUserConfig: HodgeConfig = {
        version: '1.0.0',
      };

      // Migrate PM settings
      if (oldConfig.pmTool) {
        newUserConfig.pm = {
          tool: oldConfig.pmTool as PMConfig['tool'],
        };
      }

      // Save new user config
      await this.save(newUserConfig);

      // Update generated config to only have metadata
      const newGeneratedConfig: GeneratedConfig = {
        projectName: oldConfig.projectName,
        projectType: oldConfig.projectType,
        detectedTools: oldConfig.detectedTools,
        createdAt: oldConfig.createdAt,
        version: oldConfig.version,
        pmTool: oldConfig.pmTool, // Keep for backward compatibility
      };

      await this.updateGeneratedConfig(newGeneratedConfig);

      console.log(chalk.green('✓ Migrated configuration to hodge.json'));
      return true;
    } catch (error) {
      if (process.env.DEBUG) {
        console.log(chalk.yellow('Could not migrate config:', String(error)));
      }
      return false;
    }
  }

  /**
   * Validate that configuration contains no secrets
   */
  private validateNoSecrets(config: unknown): void {
    const secretPatterns = [/api[_-]?key/i, /token/i, /password/i, /secret/i, /credential/i];

    const checkForSecrets = (obj: unknown, path = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Check if key name suggests a secret
        const keyLooksLikeSecret = secretPatterns.some((pattern) => pattern.test(key));

        if (typeof value === 'string') {
          // Check if value looks like an actual secret (not a placeholder)
          const valueLooksLikeSecret =
            value.length > 10 &&
            !value.startsWith('${') &&
            !value.includes('xxx') &&
            !value.includes('...');

          if (keyLooksLikeSecret && valueLooksLikeSecret) {
            throw new Error(
              `Potential secret detected in config at "${currentPath}". ` +
                `Secrets should only be stored in environment variables.`
            );
          }
        } else if (typeof value === 'object' && value !== null) {
          checkForSecrets(value, currentPath);
        }
      }
    };

    checkForSecrets(config);
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): HodgeConfig {
    return {
      version: '1.0.0',
      pm: {
        tool: 'local',
        verbosity: 'essential',
      },
      ship: {
        autoPush: false,
        push: this.getDefaultPushConfig(),
      },
      commitTypes: this.getDefaultCommitTypes(),
      standards: {
        enforceInHarden: true,
        customRules: [],
      },
      features: {
        autoSave: true,
        debugMode: false,
      },
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
        release: '^(release|rc)/',
      },
      issuePatterns: {
        linear: '(?:LIN|HOD)-\\d+',
        jira: '[A-Z]{2,}-\\d+',
        github: '#\\d+',
      },
    };
  }

  /**
   * Get default commit types
   */
  private getDefaultCommitTypes(): string[] {
    return [
      'feat',
      'fix',
      'docs',
      'style',
      'refactor',
      'test',
      'chore',
      'perf',
      'ci',
      'build',
      'revert',
    ];
  }

  /**
   * Initialize config file with defaults
   */
  async init(): Promise<void> {
    if (!existsSync(this.userConfigPath)) {
      await this.save(this.getDefaultConfig());
    }
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

/**
 * Get or create config manager instance
 */
export function getConfigManager(basePath?: string): ConfigManager {
  if (!configManager) {
    configManager = new ConfigManager(basePath);
  }
  return configManager;
}

/**
 * Create a new config manager instance (for testing)
 */
export function createConfigManager(basePath?: string): ConfigManager {
  return new ConfigManager(basePath);
}
