import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { createConfigManager } from './config-manager.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('Metadata Clarity Smoke Tests', () => {
  smokeTest('should use project-meta.json for detected metadata', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-metadata-'));

    try {
      // Create project-meta.json with metadata
      await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
      await fs.writeFile(
        path.join(tempDir, '.hodge', 'project-meta.json'),
        JSON.stringify(
          {
            _comment: 'This file contains auto-detected project metadata. DO NOT EDIT.',
            projectName: 'test-project',
            projectType: 'node',
            detectedTools: {
              packageManager: 'npm',
              testFramework: ['jest'],
              linting: ['eslint'],
              buildTools: ['webpack'],
              hasGit: true,
              gitRemote: 'https://github.com/test/repo.git',
            },
            createdAt: new Date().toISOString(),
            version: '0.1.0',
          },
          null,
          2
        )
      );

      const configManager = createConfigManager(tempDir);

      // ConfigManager should be able to load from project-meta.json
      const config = await configManager.load();
      expect(config).toBeDefined();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should have explanatory header in project-meta.json', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-header-test-'));

    try {
      const { StructureGenerator } = await import('./structure-generator.js');
      const generator = new StructureGenerator(tempDir);

      const projectInfo = {
        name: 'test-project',
        type: 'node' as const,
        rootPath: tempDir,
        packageManager: 'npm',
        hasTypeScript: true,
        hasTests: true,
        hasEslint: true,
        pmTool: 'linear' as const,
        detectedTools: {
          packageManager: 'npm',
          testFramework: ['vitest'],
          linting: ['eslint'],
          buildTools: ['typescript'],
          hasGit: true,
          hasClaudeCode: false,
        },
        shouldLearnPatterns: false,
        interactive: false,
      };

      await generator.generateStructure(projectInfo, false);

      // Check project-meta.json has explanatory comment
      const metaPath = path.join(tempDir, '.hodge', 'project-meta.json');
      const content = await fs.readFile(metaPath, 'utf-8');
      const metadata = JSON.parse(content);

      expect(metadata._comment).toContain('auto-detected');
      expect(metadata._comment).toContain('DO NOT EDIT');
      expect(metadata._generated).toBeDefined();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should keep user config and metadata separate', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-separation-'));

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

      // User config in hodge.json
      const hodgeJsonPath = path.join(tempDir, 'hodge.json');
      const hodgeJson = JSON.parse(await fs.readFile(hodgeJsonPath, 'utf-8'));

      // Should have user preferences
      expect(hodgeJson.pm).toBeDefined();
      expect(hodgeJson.features).toBeDefined();
      expect(hodgeJson.ship).toBeDefined();

      // Should NOT have detected metadata
      expect(hodgeJson.projectName).toBeUndefined();
      expect(hodgeJson.projectType).toBeUndefined();
      expect(hodgeJson.detectedTools).toBeUndefined();

      // Metadata in project-meta.json
      const metaPath = path.join(tempDir, '.hodge', 'project-meta.json');
      const metadata = JSON.parse(await fs.readFile(metaPath, 'utf-8'));

      // Should have metadata
      expect(metadata.projectName).toBe('test-project');
      expect(metadata.projectType).toBe('node');
      expect(metadata.detectedTools).toBeDefined();

      // Should NOT have user preferences
      expect(metadata.pm).toBeUndefined();
      expect(metadata.features).toBeUndefined();
      expect(metadata.ship).toBeUndefined();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should not confuse users with misleading filename', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-naming-'));

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

      // Old config.json should NOT exist
      const oldConfigPath = path.join(tempDir, '.hodge', 'config.json');
      const oldConfigExists = await fs
        .access(oldConfigPath)
        .then(() => true)
        .catch(() => false);
      expect(oldConfigExists).toBe(false);

      // New project-meta.json should exist
      const newMetaPath = path.join(tempDir, '.hodge', 'project-meta.json');
      const newMetaExists = await fs
        .access(newMetaPath)
        .then(() => true)
        .catch(() => false);
      expect(newMetaExists).toBe(true);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('should handle legacy config.json gracefully', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-legacy-'));

    try {
      // Create old-style config.json
      await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
      await fs.writeFile(
        path.join(tempDir, '.hodge', 'config.json'),
        JSON.stringify(
          {
            projectName: 'legacy-project',
            projectType: 'node',
            pmTool: 'linear', // Old location for PM tool
            detectedTools: {},
            createdAt: '2024-01-01',
            version: '0.1.0',
          },
          null,
          2
        )
      );

      // ConfigManager should handle missing project-meta.json
      const configManager = createConfigManager(tempDir);
      const config = await configManager.load();

      // Should still work
      expect(config).toBeDefined();

      // Note: In a real migration scenario, we might want to:
      // 1. Rename config.json to project-meta.json
      // 2. Remove pmTool from metadata
      // 3. Create hodge.json with PM configuration
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
