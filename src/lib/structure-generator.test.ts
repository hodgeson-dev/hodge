/**
 * Unit tests for the structure generator
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { StructureGenerator, StructureGenerationError } from './structure-generator';
import { ProjectInfo, ProjectType } from './detection';
import { installHodgeWay } from './install-hodge-way';

// Mock external dependencies
vi.mock('fs-extra');
vi.mock('./install-hodge-way');

const mockFs = vi.mocked(fs);
const mockInstallHodgeWay = vi.mocked(installHodgeWay);

describe('StructureGenerator', () => {
  let mockRootPath: string;
  let generator: StructureGenerator;
  let mockProjectInfo: ProjectInfo;

  beforeEach(() => {
    mockRootPath = '/test/project';
    vi.clearAllMocks();

    // Mock installHodgeWay to succeed
    mockInstallHodgeWay.mockResolvedValue(undefined);

    // Default mock implementations
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
    } as any);

    // Mock successful write test
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.unlinkSync.mockImplementation(() => {});

    mockProjectInfo = {
      name: 'test-project',
      type: 'node' as ProjectType,
      pmTool: 'github',
      hasExistingConfig: false,
      detectedTools: {
        packageManager: 'npm',
        testFramework: ['vitest'],
        linting: ['eslint', 'prettier'],
        buildTools: ['typescript'],
        hasGit: true,
        gitRemote: 'https://github.com/user/test-project.git',
      },
      rootPath: mockRootPath,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create generator with valid absolute path', () => {
      expect(() => new StructureGenerator('/valid/path')).not.toThrow();
    });

    it('should convert relative path to absolute', () => {
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as any);

      expect(() => new StructureGenerator('relative/path')).not.toThrow();
    });

    it('should throw StructureGenerationError for empty path', () => {
      expect(() => new StructureGenerator('')).toThrow(StructureGenerationError);
      expect(() => new StructureGenerator(null as any)).toThrow(StructureGenerationError);
    });

    it('should throw StructureGenerationError for non-directory path', () => {
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      } as any);

      expect(() => new StructureGenerator('/file/path')).toThrow(StructureGenerationError);
    });

    it('should throw StructureGenerationError for non-writable directory', () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      expect(() => new StructureGenerator('/readonly/path')).toThrow(StructureGenerationError);
    });
  });

  describe('generateStructure', () => {
    beforeEach(() => {
      generator = new StructureGenerator(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false); // No existing .hodge
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue('');
      mockFs.appendFile.mockResolvedValue(undefined);
    });

    it('should generate complete structure successfully', async () => {
      await generator.generateStructure(mockProjectInfo);

      // Verify directories are created
      expect(mockFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.hodge'));
      expect(mockFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('features'));

      // Verify both hodge.json and project-meta.json are created
      // hodge.json should be created with user configuration (using writeJson)
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('hodge.json'),
        expect.objectContaining({
          version: '1.0.0',
          pm: expect.objectContaining({
            tool: 'github',
          }),
        }),
        { spaces: 2 }
      );

      // project-meta.json should be created with metadata (using writeFile for header comment)
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('project-meta.json'),
        expect.stringContaining('"projectName": "test-project"'),
        'utf-8'
      );

      // Verify installHodgeWay is called to install template files
      expect(mockInstallHodgeWay).toHaveBeenCalledWith(expect.stringContaining('.hodge'));
    });

    it('should throw error when project info is null', async () => {
      await expect(generator.generateStructure(null as any)).rejects.toThrow(
        StructureGenerationError
      );
    });

    // Note: Existence check moved to InitCommand.smartQuestionFlow() in HODGE-333.2
    // StructureGenerator no longer checks for existing .hodge directory
    it('should create structure even when .hodge exists (existence check moved to InitCommand)', async () => {
      mockFs.pathExists.mockResolvedValue(true);

      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.ensureDir).toHaveBeenCalled();
    });

    it('should handle directory creation failures', async () => {
      mockFs.ensureDir.mockRejectedValue(new Error('Permission denied'));

      await expect(generator.generateStructure(mockProjectInfo)).rejects.toThrow(
        StructureGenerationError
      );
    });

    it('should handle file writing failures', async () => {
      mockFs.writeJson.mockRejectedValue(new Error('Disk full'));

      await expect(generator.generateStructure(mockProjectInfo)).rejects.toThrow(
        StructureGenerationError
      );
    });

    it('should update .gitignore when git is present', async () => {
      mockFs.pathExists.mockImplementation(
        (path) => Promise.resolve(path.toString().includes('.gitignore')) as any
      );
      mockFs.readFile.mockResolvedValue('existing content');

      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.readFile).toHaveBeenCalledWith(expect.stringContaining('.gitignore'), 'utf-8');
    });

    it('should not update .gitignore when git is not present', async () => {
      mockProjectInfo.detectedTools.hasGit = false;

      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.readFile).not.toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        'utf-8'
      );
    });
  });

  describe('config generation', () => {
    beforeEach(() => {
      generator = new StructureGenerator(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should generate valid project-meta.json', async () => {
      await generator.generateStructure(mockProjectInfo);

      // hodge.json created with writeJson, project-meta.json with writeFile
      expect(mockFs.writeJson).toHaveBeenCalledTimes(1); // Only hodge.json
      expect(mockFs.writeFile).toHaveBeenCalled(); // For project-meta.json

      // Verify project-meta.json content (using writeFile)
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('project-meta.json'),
        expect.stringContaining('"projectName": "test-project"'),
        'utf-8'
      );

      // Verify it contains the expected metadata
      const writeFileCall = mockFs.writeFile.mock.calls.find((call: any) =>
        call[0].includes('project-meta.json')
      );
      expect(writeFileCall).toBeDefined();
      if (writeFileCall) {
        const content = writeFileCall[1];
        expect(content).toContain('"projectType": "node"');
        expect(content).toContain('"_comment"');
        expect(content).toContain('auto-detected project metadata');
      }
    });

    it('should handle config writing errors', async () => {
      mockFs.writeJson.mockRejectedValue(new Error('Write failed'));

      await expect(generator.generateStructure(mockProjectInfo)).rejects.toThrow(
        StructureGenerationError
      );
    });
  });

  describe('Hodge Way template installation', () => {
    beforeEach(() => {
      generator = new StructureGenerator(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should install Hodge Way templates for all project types', async () => {
      await generator.generateStructure(mockProjectInfo);

      // Verify installHodgeWay is called with the hodge directory path
      expect(mockInstallHodgeWay).toHaveBeenCalledWith(path.join(mockRootPath, '.hodge'));
    });

    it('should install templates for Python project', async () => {
      mockProjectInfo.type = 'python';
      mockProjectInfo.detectedTools.testFramework = ['pytest'];

      await generator.generateStructure(mockProjectInfo);

      // Verify installHodgeWay is called regardless of project type
      expect(mockInstallHodgeWay).toHaveBeenCalledWith(path.join(mockRootPath, '.hodge'));
    });

    it('should handle template installation errors gracefully', async () => {
      mockInstallHodgeWay.mockRejectedValue(new Error('Template copy failed'));

      await expect(generator.generateStructure(mockProjectInfo)).rejects.toThrow(
        StructureGenerationError
      );
    });

    it('should handle unknown project type gracefully', async () => {
      mockProjectInfo.type = 'unknown';

      await generator.generateStructure(mockProjectInfo);

      // Should still install templates even for unknown project types
      expect(mockInstallHodgeWay).toHaveBeenCalledWith(path.join(mockRootPath, '.hodge'));
    });
  });

  describe('gitignore updates', () => {
    beforeEach(() => {
      generator = new StructureGenerator(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.appendFile.mockResolvedValue(undefined);
    });

    it('should create new .gitignore if none exists', async () => {
      mockFs.pathExists.mockImplementation(() => Promise.resolve(false) as any); // No .gitignore or .hodge

      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        expect.stringContaining('.hodge/local/'),
        'utf8'
      );
    });

    it('should append to existing .gitignore', async () => {
      mockFs.pathExists.mockImplementation(
        (path) => Promise.resolve(path.toString().includes('.gitignore')) as any
      );
      mockFs.readFile.mockResolvedValue('existing content');

      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        expect.stringContaining('.hodge/local/')
      );
    });

    it('should not duplicate .gitignore entries', async () => {
      mockFs.pathExists.mockImplementation(
        (path) => Promise.resolve(path.toString().includes('.gitignore')) as any
      );
      // HODGE-377.3: Mock file content that includes all patterns (old + new)
      mockFs.readFile.mockResolvedValue(
        'existing\n.hodge/local/\narchitecture-graph.dot\nfeatures/**/ship-record.json\ncontent'
      );

      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.appendFile).not.toHaveBeenCalled();
    });

    it('should not fail generation if gitignore update fails', async () => {
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

      // Should not throw, just warn
      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.ensureDir).toHaveBeenCalled();
    });
  });

  describe('security validation', () => {
    it('should reject path traversal attempts', () => {
      expect(() => new StructureGenerator('/valid/../../../etc')).toThrow();
    });

    it('should validate file paths for safety', async () => {
      generator = new StructureGenerator(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      // This should work without throwing security errors
      await generator.generateStructure(mockProjectInfo);

      expect(mockFs.ensureDir).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      generator = new StructureGenerator(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
    });

    it('should wrap filesystem errors properly', async () => {
      mockFs.ensureDir.mockRejectedValue(new Error('ENOSPC: no space left on device'));

      await expect(generator.generateStructure(mockProjectInfo)).rejects.toThrow(
        StructureGenerationError
      );
    });

    it('should provide meaningful error messages', async () => {
      mockFs.writeJson.mockRejectedValue(new Error('Disk full'));

      try {
        await generator.generateStructure(mockProjectInfo);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(StructureGenerationError);
        expect((error as StructureGenerationError).message).toContain('Disk full');
      }
    });
  });
});
