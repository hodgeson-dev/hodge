import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { createConfigManager } from './config-manager.js';
import { PMHooks } from './pm/pm-hooks.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('Config Defaults Smoke Tests', () => {
  smokeTest('should provide PM status mapping defaults from config', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-defaults-'));

    try {
      // Don't create any config files - rely on defaults
      const configManager = createConfigManager(tempDir);
      const pmConfig = await configManager.getPMConfig();

      // Should have default status mappings
      expect(pmConfig?.statusMap).toBeDefined();
      expect(pmConfig?.statusMap?.explore).toBe('To Do');
      expect(pmConfig?.statusMap?.build).toBe('In Progress');
      expect(pmConfig?.statusMap?.harden).toBe('In Review');
      expect(pmConfig?.statusMap?.ship).toBe('Done');
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should allow custom PM status mapping override', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-custom-status-'));

    try {
      // Create hodge.json with custom status mapping
      await fs.writeFile(
        path.join(tempDir, 'hodge.json'),
        JSON.stringify(
          {
            version: '1.0.0',
            pm: {
              tool: 'linear',
              statusMap: {
                explore: 'Backlog',
                build: 'In Development',
                harden: 'Code Review',
                ship: 'Complete',
              },
            },
          },
          null,
          2
        )
      );

      const configManager = createConfigManager(tempDir);
      const pmConfig = await configManager.getPMConfig();

      // Should use custom mappings
      expect(pmConfig?.statusMap?.explore).toBe('Backlog');
      expect(pmConfig?.statusMap?.build).toBe('In Development');
      expect(pmConfig?.statusMap?.harden).toBe('Code Review');
      expect(pmConfig?.statusMap?.ship).toBe('Complete');
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should not have hardcoded defaults in pm-hooks', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-no-hardcode-'));

    try {
      const pmHooks = new PMHooks(tempDir);

      // getDefaultStatusMap should not exist anymore
      expect((pmHooks as any).getDefaultStatusMap).toBeUndefined();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should create comprehensive hodge.json on init', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-init-defaults-'));

    try {
      const { StructureGenerator } = await import('./structure-generator.js');
      const generator = new StructureGenerator(tempDir);

      const projectInfo = {
        name: 'test-project',
        type: 'node' as const,
        rootPath: tempDir,
        packageManager: 'npm',
        hasTypeScript: false,
        hasTests: false,
        hasEslint: false,
        pmTool: 'github' as const,
        detectedTools: {
          packageManager: 'npm',
          testFramework: [],
          linting: [],
          buildTools: [],
          hasGit: false,
          hasClaudeCode: false,
        },
        shouldLearnPatterns: false,
        interactive: false,
      };

      await generator.generateStructure(projectInfo, false);

      // Check hodge.json was created with comprehensive defaults
      const hodgeJsonPath = path.join(tempDir, 'hodge.json');
      const hodgeJson = JSON.parse(
        (await fs.readFile(hodgeJsonPath, 'utf-8')).replace(/^\/\/.*$/gm, '') // Remove comments
      );

      // Should have all sections
      expect(hodgeJson.pm).toBeDefined();
      expect(hodgeJson.pm.statusMap).toBeDefined();
      expect(hodgeJson.pm.tool).toBe('github');
      expect(hodgeJson.pm.verbosity).toBe('essential');
      expect(hodgeJson.ship).toBeDefined();
      expect(hodgeJson.features).toBeDefined();
      expect(hodgeJson.commitTypes).toBeDefined();
      expect(hodgeJson.commitTypes.length).toBeGreaterThan(0);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should keep only metadata in .hodge/project-meta.json', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-metadata-only-'));

    try {
      const { StructureGenerator } = await import('./structure-generator.js');
      const generator = new StructureGenerator(tempDir);

      const projectInfo = {
        name: 'test-project',
        type: 'node' as const,
        rootPath: tempDir,
        packageManager: 'npm',
        hasTypeScript: false,
        hasTests: false,
        hasEslint: false,
        pmTool: 'linear' as const,
        detectedTools: {
          packageManager: 'npm',
          testFramework: [],
          linting: [],
          buildTools: [],
          hasGit: false,
          hasClaudeCode: false,
        },
        shouldLearnPatterns: false,
        interactive: false,
      };

      await generator.generateStructure(projectInfo, false);

      // Check .hodge/project-meta.json only has metadata
      const configPath = path.join(tempDir, '.hodge', 'project-meta.json');
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

      // Should have metadata
      expect(config.projectName).toBe('test-project');
      expect(config.projectType).toBe('node');
      expect(config.detectedTools).toBeDefined();
      expect(config.createdAt).toBeDefined();
      expect(config.version).toBeDefined();

      // Should NOT have user preferences
      expect(config.pmTool).toBeUndefined();
      expect(config.pm).toBeUndefined();
      expect(config.statusMap).toBeUndefined();
      expect(config.features).toBeUndefined();
      expect(config.ship).toBeUndefined();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
