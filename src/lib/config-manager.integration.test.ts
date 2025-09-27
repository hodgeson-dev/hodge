import { describe, expect, beforeEach, afterEach } from 'vitest';
import { integrationTest } from '../test/helpers.js';
import { createConfigManager } from './config-manager.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('ConfigManager Integration Tests', () => {
  let tempDir: string;
  let originalPMTool: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-config-integration-'));
    // Save and clear environment for clean test state
    originalPMTool = process.env.HODGE_PM_TOOL;
    delete process.env.HODGE_PM_TOOL;
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    // Restore environment
    if (originalPMTool) {
      process.env.HODGE_PM_TOOL = originalPMTool;
    }
  });

  integrationTest('should handle full configuration lifecycle', async () => {
    const configManager = createConfigManager(tempDir);

    // 1. Start with defaults
    let config = await configManager.load();
    expect(config.pm?.tool).toBe('local');
    expect(config.features?.autoSave).toBe(true);

    // 2. Save user configuration
    await configManager.save({
      version: '1.0.0',
      pm: {
        tool: 'linear',
        statusMap: {
          explore: 'Backlog',
          build: 'In Development',
          harden: 'Code Review',
          ship: 'Complete',
        },
        verbosity: 'rich',
      },
      features: {
        autoSave: false,
        debugMode: true,
      },
    });

    // 3. Reload and verify persistence
    config = await configManager.load();
    expect(config.pm?.tool).toBe('linear');
    expect(config.pm?.statusMap?.explore).toBe('Backlog');
    expect(config.features?.autoSave).toBe(false);

    // 4. Verify file was created
    const hodgeJsonPath = path.join(tempDir, 'hodge.json');
    const fileContent = await fs.readFile(hodgeJsonPath, 'utf-8');
    const savedConfig = JSON.parse(fileContent);
    expect(savedConfig.pm.tool).toBe('linear');
  });

  integrationTest('should properly layer configuration sources', async () => {
    const configManager = createConfigManager(tempDir);

    // Create user config
    await configManager.save({
      version: '1.0.0',
      pm: {
        tool: 'github',
        verbosity: 'minimal',
      },
    });

    // Create generated config
    await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, '.hodge', 'config.json'),
      JSON.stringify(
        {
          projectName: 'test-project',
          projectType: 'node',
          createdAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    // Test environment variable override
    process.env.HODGE_PM_TOOL = 'linear';
    const pmTool = await configManager.getPMTool();
    expect(pmTool).toBe('linear'); // Env var wins

    delete process.env.HODGE_PM_TOOL;
    const pmToolFromConfig = await configManager.getPMTool();
    expect(pmToolFromConfig).toBe('github'); // User config wins
  });

  integrationTest('should migrate old config to new format', async () => {
    // Create old-style config
    await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, '.hodge', 'config.json'),
      JSON.stringify(
        {
          projectName: 'legacy-project',
          projectType: 'node',
          pmTool: 'linear',
          detectedTools: { npm: true },
          createdAt: '2024-01-01',
        },
        null,
        2
      )
    );

    const configManager = createConfigManager(tempDir);
    const migrated = await configManager.migrateConfig();

    expect(migrated).toBe(true);

    // Check new user config was created
    const hodgeJsonPath = path.join(tempDir, 'hodge.json');
    const userConfig = JSON.parse(await fs.readFile(hodgeJsonPath, 'utf-8'));
    expect(userConfig.pm?.tool).toBe('linear');

    // Check generated config still has metadata
    const generatedPath = path.join(tempDir, '.hodge', 'config.json');
    const generatedConfig = JSON.parse(await fs.readFile(generatedPath, 'utf-8'));
    expect(generatedConfig.projectName).toBe('legacy-project');
    expect(generatedConfig.pmTool).toBe('linear'); // Kept for backward compat
  });

  integrationTest('should integrate with PM configuration', async () => {
    const configManager = createConfigManager(tempDir);

    // Save PM configuration
    await configManager.save({
      version: '1.0.0',
      pm: {
        tool: 'github',
        statusMap: {
          explore: 'Open',
          build: 'In Progress',
          harden: 'Review',
          ship: 'Closed',
        },
        verbosity: 'essential',
      },
    });

    // Test PM config methods
    const pmConfig = await configManager.getPMConfig();
    expect(pmConfig?.tool).toBe('github');
    expect(pmConfig?.statusMap?.build).toBe('In Progress');
    expect(pmConfig?.verbosity).toBe('essential');

    // Test API key retrieval (always from env)
    const originalToken = process.env.GITHUB_TOKEN;
    try {
      process.env.GITHUB_TOKEN = 'test-github-token';
      const apiKey = configManager.getPMApiKey('github');
      expect(apiKey).toBe('test-github-token');
    } finally {
      if (originalToken) {
        process.env.GITHUB_TOKEN = originalToken;
      } else {
        delete process.env.GITHUB_TOKEN;
      }
    }
  });

  integrationTest('should handle ship configuration', async () => {
    const configManager = createConfigManager(tempDir);

    await configManager.save({
      version: '1.0.0',
      ship: {
        autoPush: true,
        push: {
          strategy: 'force',
          createPR: 'always',
          protectedBranches: ['main', 'production'],
          remoteName: 'upstream',
        },
      },
    });

    const config = await configManager.load();
    expect(config.ship?.autoPush).toBe(true);
    expect(config.ship?.push?.strategy).toBe('force');

    const pushConfig = await configManager.getPushConfig();
    expect(pushConfig.strategy).toBe('force');
    expect(pushConfig.protectedBranches).toContain('production');

    const isMainProtected = await configManager.isProtectedBranch('main');
    expect(isMainProtected).toBe(true);

    const isFeatureProtected = await configManager.isProtectedBranch('feature/test');
    expect(isFeatureProtected).toBe(false);
  });

  integrationTest('should handle feature flags correctly', async () => {
    const configManager = createConfigManager(tempDir);
    const originalDebug = process.env.DEBUG;

    try {
      // Test config-based debug mode
      await configManager.save({
        version: '1.0.0',
        features: {
          debugMode: true,
          autoSave: false,
        },
      });

      let isDebug = await configManager.isDebugMode();
      expect(isDebug).toBe(true);

      let isAutoSave = await configManager.isAutoSaveEnabled();
      expect(isAutoSave).toBe(false);

      // Test env override for debug
      delete process.env.DEBUG;
      await configManager.save({
        version: '1.0.0',
        features: {
          debugMode: false,
        },
      });

      isDebug = await configManager.isDebugMode();
      expect(isDebug).toBe(false);

      // Env var should override
      process.env.DEBUG = 'true';
      isDebug = await configManager.isDebugMode();
      expect(isDebug).toBe(true);
    } finally {
      if (originalDebug) {
        process.env.DEBUG = originalDebug;
      } else {
        delete process.env.DEBUG;
      }
    }
  });

  integrationTest('should validate and reject configs with secrets', async () => {
    const configManager = createConfigManager(tempDir);

    // Try various secret patterns
    const configsWithSecrets = [
      {
        version: '1.0.0',
        pm: {
          apiKey: 'lin_api_actualSecretKey12345',
        },
      },
      {
        version: '1.0.0',
        github_token: 'ghp_actualSecretToken12345',
      },
      {
        version: '1.0.0',
        nested: {
          deep: {
            password: 'actualPasswordValue123',
          },
        },
      },
    ];

    for (const badConfig of configsWithSecrets) {
      await expect(configManager.save(badConfig as any)).rejects.toThrow(
        'Potential secret detected'
      );
    }

    // These should be allowed (placeholders)
    const safeConfig = {
      version: '1.0.0',
      pm: {
        apiKey: '${LINEAR_API_KEY}', // Placeholder
      },
      examples: {
        token: 'xxx...', // Placeholder
        password: '***', // Masked
      },
    };

    await expect(configManager.save(safeConfig as any)).resolves.not.toThrow();
  });
});
