import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { getConfigManager, createConfigManager } from './config-manager.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('ConfigManager Smoke Tests', () => {
  smokeTest('should load configuration without crashing', async () => {
    const configManager = getConfigManager();
    const config = await configManager.load();

    // Should return a config object
    expect(config).toBeDefined();
    expect(config.version).toBeDefined();
  });

  smokeTest('should handle missing config files gracefully', async () => {
    // Create a temp directory without any config files
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-config-test-'));
    const originalPMTool = process.env.HODGE_PM_TOOL;

    try {
      // Clear env var for test
      delete process.env.HODGE_PM_TOOL;

      const configManager = createConfigManager(tempDir);
      const config = await configManager.load();

      // Should return defaults
      expect(config).toBeDefined();
      expect(config.pm?.tool).toBe('local');
    } finally {
      // Restore env var
      if (originalPMTool) process.env.HODGE_PM_TOOL = originalPMTool;
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should get PM tool with environment override', async () => {
    const originalEnv = process.env.HODGE_PM_TOOL;

    try {
      process.env.HODGE_PM_TOOL = 'github';

      const configManager = getConfigManager();
      const pmTool = await configManager.getPMTool();

      expect(pmTool).toBe('github');
    } finally {
      if (originalEnv) {
        process.env.HODGE_PM_TOOL = originalEnv;
      } else {
        delete process.env.HODGE_PM_TOOL;
      }
    }
  });

  smokeTest('should get PM API key from environment', async () => {
    const originalKey = process.env.LINEAR_API_KEY;

    try {
      process.env.LINEAR_API_KEY = 'test-key';

      const configManager = getConfigManager();
      const apiKey = configManager.getPMApiKey('linear');

      expect(apiKey).toBe('test-key');
    } finally {
      if (originalKey) {
        process.env.LINEAR_API_KEY = originalKey;
      } else {
        delete process.env.LINEAR_API_KEY;
      }
    }
  });

  smokeTest('should validate no secrets in config', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-config-test-'));

    try {
      const configManager = createConfigManager(tempDir);

      // Try to save config with a secret
      const configWithSecret = {
        version: '1.0.0',
        pm: {
          tool: 'linear' as const,
          apiKey: 'lin_api_actualSecretKey123', // This should fail
        },
      };

      await expect(configManager.save(configWithSecret as any)).rejects.toThrow(
        'Potential secret detected'
      );
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should save and load user configuration', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-config-test-'));
    const originalPMTool = process.env.HODGE_PM_TOOL;

    try {
      // Clear env var for test
      delete process.env.HODGE_PM_TOOL;

      const configManager = createConfigManager(tempDir);

      const testConfig = {
        version: '1.0.0',
        pm: {
          tool: 'github' as const,
          verbosity: 'rich' as const,
        },
        features: {
          autoSave: false,
        },
      };

      await configManager.save(testConfig);

      // Load it back
      const loadedConfig = await configManager.load();
      expect(loadedConfig.pm?.tool).toBe('github');
      expect(loadedConfig.pm?.verbosity).toBe('rich');
      expect(loadedConfig.features?.autoSave).toBe(false);

      // Verify file was created
      const configPath = path.join(tempDir, 'hodge.json');
      const fileExists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    } finally {
      // Restore env var
      if (originalPMTool) process.env.HODGE_PM_TOOL = originalPMTool;
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should check debug mode from multiple sources', async () => {
    const originalDebug = process.env.DEBUG;
    const originalHodgeDebug = process.env.HODGE_DEBUG;

    try {
      // Test with DEBUG env var
      process.env.DEBUG = 'true';
      delete process.env.HODGE_DEBUG;

      const configManager = getConfigManager();
      let isDebug = await configManager.isDebugMode();
      expect(isDebug).toBe(true);

      // Test with HODGE_DEBUG env var
      delete process.env.DEBUG;
      process.env.HODGE_DEBUG = 'true';

      isDebug = await configManager.isDebugMode();
      expect(isDebug).toBe(true);
    } finally {
      if (originalDebug) {
        process.env.DEBUG = originalDebug;
      } else {
        delete process.env.DEBUG;
      }
      if (originalHodgeDebug) {
        process.env.HODGE_DEBUG = originalHodgeDebug;
      } else {
        delete process.env.HODGE_DEBUG;
      }
    }
  });

  smokeTest('should handle push configuration', async () => {
    const configManager = getConfigManager();
    const pushConfig = await configManager.getPushConfig();

    expect(pushConfig).toBeDefined();
    expect(pushConfig.strategy).toBe('safe');
    expect(pushConfig.protectedBranches).toContain('main');
  });

  smokeTest('should check if branch is protected', async () => {
    const configManager = getConfigManager();

    const isMainProtected = await configManager.isProtectedBranch('main');
    expect(isMainProtected).toBe(true);

    const isFeatureProtected = await configManager.isProtectedBranch('feature/test');
    expect(isFeatureProtected).toBe(false);
  });

  smokeTest('should get commit types with defaults', async () => {
    const configManager = getConfigManager();
    const commitTypes = await configManager.getCommitTypes();

    expect(commitTypes).toBeDefined();
    expect(Array.isArray(commitTypes)).toBe(true);
    expect(commitTypes).toContain('feat');
    expect(commitTypes).toContain('fix');
  });
});
