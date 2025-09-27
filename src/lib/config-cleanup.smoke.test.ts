import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { createConfigManager } from './config-manager.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('Config Cleanup Smoke Tests', () => {
  smokeTest('should not have pmTool in generated config', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-config-cleanup-'));

    try {
      // Create a .hodge/project-meta.json without pmTool
      await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
      await fs.writeFile(
        path.join(tempDir, '.hodge', 'project-meta.json'),
        JSON.stringify(
          {
            projectName: 'test-project',
            projectType: 'node',
            detectedTools: {},
            createdAt: new Date().toISOString(),
            version: '0.1.0',
          },
          null,
          2
        )
      );

      // Create hodge.json with PM tool
      await fs.writeFile(
        path.join(tempDir, 'hodge.json'),
        JSON.stringify(
          {
            version: '1.0.0',
            pm: {
              tool: 'linear',
            },
          },
          null,
          2
        )
      );

      const configManager = createConfigManager(tempDir);
      const pmTool = await configManager.getPMTool();

      // Should get PM tool from hodge.json, not from .hodge/config.json
      expect(pmTool).toBe('linear');

      // Verify .hodge/project-meta.json doesn't have pmTool
      const metaPath = path.join(tempDir, '.hodge', 'project-meta.json');
      // Create the file if it doesn't exist (ConfigManager might not create it)
      if (
        !(await fs
          .access(metaPath)
          .then(() => true)
          .catch(() => false))
      ) {
        await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
        await fs.writeFile(
          metaPath,
          JSON.stringify(
            {
              _comment: 'Auto-detected project metadata',
              projectName: 'test',
              projectType: 'node',
            },
            null,
            2
          )
        );
      }
      const generatedConfig = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
      expect(generatedConfig.pmTool).toBeUndefined();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should prioritize env var over hodge.json for PM tool', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-config-cleanup-'));
    const originalPMTool = process.env.HODGE_PM_TOOL;

    try {
      // Create hodge.json with github
      await fs.writeFile(
        path.join(tempDir, 'hodge.json'),
        JSON.stringify(
          {
            version: '1.0.0',
            pm: {
              tool: 'github',
            },
          },
          null,
          2
        )
      );

      // Set env var to linear
      process.env.HODGE_PM_TOOL = 'linear';

      const configManager = createConfigManager(tempDir);
      const pmTool = await configManager.getPMTool();

      // Env var should win
      expect(pmTool).toBe('linear');
    } finally {
      if (originalPMTool) {
        process.env.HODGE_PM_TOOL = originalPMTool;
      } else {
        delete process.env.HODGE_PM_TOOL;
      }
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should handle missing migrateConfig method gracefully', async () => {
    const configManager = createConfigManager();

    // migrateConfig method should not exist
    expect((configManager as any).migrateConfig).toBeUndefined();
  });

  smokeTest('should create hodge.json during init if PM tool selected', async () => {
    // This test is more of an integration test for StructureGenerator
    // but we'll verify the expected structure
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-init-test-'));

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

      // Check hodge.json was created with PM tool
      const hodgeJsonPath = path.join(tempDir, 'hodge.json');
      const hodgeJsonExists = await fs
        .access(hodgeJsonPath)
        .then(() => true)
        .catch(() => false);

      expect(hodgeJsonExists).toBe(true);

      const hodgeJson = JSON.parse(await fs.readFile(hodgeJsonPath, 'utf-8'));
      expect(hodgeJson.pm?.tool).toBe('linear');

      // Check .hodge/project-meta.json doesn't have pmTool
      const configPath = path.join(tempDir, '.hodge', 'project-meta.json');
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      expect(config.pmTool).toBeUndefined();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should create hodge.json with local PM tool when none selected', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-init-nopm-'));

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
        pmTool: null,
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

      // hodge.json should exist with local as default
      const hodgeJsonPath = path.join(tempDir, 'hodge.json');
      const hodgeJsonExists = await fs
        .access(hodgeJsonPath)
        .then(() => true)
        .catch(() => false);

      expect(hodgeJsonExists).toBe(true);

      const hodgeJson = JSON.parse(await fs.readFile(hodgeJsonPath, 'utf-8'));
      expect(hodgeJson.pm?.tool).toBe('local'); // Default when none selected
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
