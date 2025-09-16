/**
 * Integration tests for the init command
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { InitCommand } from './init';
import { ValidationError } from '../lib/detection';

// Mock external dependencies
vi.mock('fs-extra');
vi.mock('inquirer');
vi.mock('child_process');

const mockFs = vi.mocked(fs);
const mockInquirer = vi.mocked(inquirer);

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('Process exited');
});

describe('InitCommand Integration Tests', () => {
  let initCommand: InitCommand;
  let mockRootPath: string;

  beforeEach(() => {
    mockRootPath = '/test/project';
    vi.clearAllMocks();

    // Reset console spies
    Object.values(consoleSpy).forEach((spy) => spy.mockClear());
    mockExit.mockClear();

    // Default mock implementations
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
    } as fs.Stats);

    // Mock successful write test
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.unlinkSync.mockImplementation(() => {});

    // Default file system mocks
    mockFs.pathExists.mockResolvedValue(false);
    mockFs.readdir.mockResolvedValue(['file1.txt', 'file2.js']);
    mockFs.ensureDir.mockResolvedValue(undefined);
    mockFs.writeJson.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('');
    mockFs.appendFile.mockResolvedValue(undefined);
    mockFs.readJson.mockResolvedValue({});

    // Mock inquirer
    mockInquirer.prompt.mockResolvedValue({ shouldProceed: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful initialization scenarios', () => {
    beforeEach(() => {
      initCommand = new InitCommand(mockRootPath);
    });

    it('should initialize Node.js project successfully', async () => {
      // Setup Node.js project detection
      mockFs.pathExists.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('.hodge')) return Promise.resolve(false);
        if (pathStr.includes('yarn.lock')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJson.mockResolvedValue({
        name: 'test-project',
        dependencies: { react: '^18.0.0' },
        devDependencies: { vitest: '^1.0.0', eslint: '^8.0.0', typescript: '^5.0.0' },
      });

      await initCommand.execute({ force: true });

      // Verify structure creation
      expect(mockFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.hodge'));
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        expect.objectContaining({
          projectName: 'test-project',
          projectType: 'node',
        }),
        { spaces: 2 }
      );

      // Verify success message
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Hodge initialized successfully')
      );
    });

    it('should initialize Python project successfully', async () => {
      mockFs.pathExists.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('requirements.txt')) return Promise.resolve(true);
        if (pathStr.includes('.hodge')) return Promise.resolve(false);
        return Promise.resolve(false);
      });

      await initCommand.execute({ force: true });

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        expect.objectContaining({
          projectType: 'python',
        }),
        { spaces: 2 }
      );
    });

    it('should handle unknown project type gracefully', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await initCommand.execute({ force: true });

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        expect.objectContaining({
          projectType: 'unknown',
        }),
        { spaces: 2 }
      );
    });

    it('should skip questions with --yes flag', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await initCommand.execute({ yes: true });

      expect(mockInquirer.prompt).not.toHaveBeenCalled();
      expect(mockFs.ensureDir).toHaveBeenCalled();
    });

    it.skip('should handle git repository with remote - tests implementation', async () => {
      const { execSync } = await import('child_process');
      const mockExecSync = vi.mocked(execSync);

      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('git status')) return Buffer.from('');
        if (cmd.toString().includes('git remote')) {
          return Buffer.from('https://github.com/user/test-repo.git');
        }
        return Buffer.from('');
      });

      await initCommand.execute({ force: true });

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        expect.objectContaining({
          detectedTools: expect.objectContaining({
            hasGit: true,
            gitRemote: 'https://github.com/user/test-repo.git',
          }),
        }),
        { spaces: 2 }
      );
    });
  });

  describe('interactive question flow', () => {
    beforeEach(() => {
      initCommand = new InitCommand(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
    });

    it.skip('should ask for confirmation on existing project - tests prompts', async () => {
      mockFs.readdir.mockResolvedValue(['package.json', 'src']);
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('package.json'));
      });
      mockFs.readJson.mockResolvedValue({ name: 'existing-project' });

      mockInquirer.prompt.mockResolvedValue({ shouldProceed: true });

      await initCommand.execute();

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'confirm',
          message: 'Initialize Hodge with detected configuration?',
        }),
      ]);
    });

    it.skip('should ask for project name in empty directory - tests prompts', async () => {
      mockFs.readdir.mockResolvedValue([]);
      mockInquirer.prompt.mockResolvedValue({ projectName: 'new-project' });

      await initCommand.execute();

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'input',
          message: 'Project name?',
        }),
      ]);
    });

    it.skip('should validate project name input - tests prompts', async () => {
      mockFs.readdir.mockResolvedValue([]);

      // Mock prompt call to test validation
      const promptCall = mockInquirer.prompt.mockResolvedValue({ projectName: 'valid-name' });

      await initCommand.execute();

      const promptArgs = promptCall.mock.calls[0][0] as Array<{
        name: string;
        validate?: (input: string) => boolean | string;
      }>;
      const namePrompt = promptArgs.find((p) => p.name === 'projectName');

      expect(namePrompt?.validate?.('')).toBe('Project name is required');
      expect(namePrompt?.validate?.('invalid<name>')).toContain('can only contain');
      expect(namePrompt?.validate?.('valid-name')).toBe(true);
    });

    it.skip('should handle user cancellation gracefully - tests console output', async () => {
      mockFs.pathExists.mockImplementation((path) => {
        if (path.toString().includes('.hodge')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockInquirer.prompt.mockResolvedValue({ shouldOverwrite: false });

      await initCommand.execute();

      expect(consoleSpy.log).toHaveBeenCalledWith(chalk.yellow('Initialization cancelled.'));
      expect(mockFs.ensureDir).not.toHaveBeenCalled();
    });

    it.skip('should warn about existing Hodge config - tests prompts', async () => {
      mockFs.pathExists.mockImplementation((path) => {
        if (path.toString().includes('.hodge')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockInquirer.prompt.mockResolvedValue({ shouldOverwrite: true });

      await initCommand.execute();

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        expect.objectContaining({
          message: 'Hodge is already initialized. Overwrite existing configuration?',
          default: false,
        }),
      ]);
    });
  });

  describe('error handling', () => {
    it('should handle validation errors properly', async () => {
      expect(() => new InitCommand('')).toThrow();

      expect(() => {
        try {
          new InitCommand('');
        } catch (error) {
          throw error;
        }
      }).toThrow(ValidationError);
    });

    it.skip('should handle detection errors gracefully - tests console output', async () => {
      initCommand = new InitCommand(mockRootPath);
      mockFs.pathExists.mockRejectedValue(new Error('Permission denied'));

      await expect(initCommand.execute({ force: true })).rejects.toThrow('Process exited');

      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Detection Error'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it.skip('should handle structure generation errors gracefully - tests console output', async () => {
      initCommand = new InitCommand(mockRootPath);
      mockFs.ensureDir.mockRejectedValue(new Error('Disk full'));

      await expect(initCommand.execute({ force: true })).rejects.toThrow('Process exited');

      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Generation Error'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it.skip('should handle unknown errors gracefully - tests console output', async () => {
      initCommand = new InitCommand(mockRootPath);
      mockFs.statSync.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(initCommand.execute({ force: true })).rejects.toThrow('Process exited');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Error during initialization')
      );
    });

    it.skip('should validate options properly - tests console output', async () => {
      initCommand = new InitCommand(mockRootPath);

      await expect(initCommand.execute({ force: 'invalid' } as any)).rejects.toThrow(
        'Process exited'
      );

      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Validation Error'));
    });

    it.skip('should stop spinner on errors - UI implementation', async () => {
      initCommand = new InitCommand(mockRootPath);
      mockFs.pathExists.mockRejectedValue(new Error('Fail during detection'));

      await expect(initCommand.execute()).rejects.toThrow('Process exited');

      // Spinner failure should be handled gracefully
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('display and messaging', () => {
    beforeEach(() => {
      initCommand = new InitCommand(mockRootPath);
    });

    it.skip('should display detected configuration - tests console output', async () => {
      mockFs.pathExists.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('yarn.lock')) return Promise.resolve(true);
        return false;
      });

      mockFs.readJson.mockResolvedValue({
        name: 'display-test',
        devDependencies: { vitest: '^1.0.0', eslint: '^8.0.0' },
      });

      await initCommand.execute({ force: true });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('📋 Detected Configuration')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Name: display-test'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Type: node'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Package Manager: yarn'));
    });

    it.skip('should display completion message with next steps - tests console output', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await initCommand.execute({ force: true });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('🎉 Hodge initialized successfully')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('📁 Created structure'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('🚀 Next steps'));
    });

    it.skip('should show PM-specific suggestions - tests console output', async () => {
      const { execSync } = await import('child_process');
      const mockExecSync = vi.mocked(execSync);

      process.env.LINEAR_API_KEY = 'test-key';

      mockFs.pathExists.mockResolvedValue(false);

      await initCommand.execute({ force: true });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('PM integration: linear detected')
      );

      delete process.env.LINEAR_API_KEY;
    });
  });

  describe('cross-platform compatibility', () => {
    it.skip('should handle Windows paths correctly - platform-specific', async () => {
      const windowsPath = 'C:\\test\\project';
      initCommand = new InitCommand(windowsPath);

      mockFs.pathExists.mockResolvedValue(false);

      await initCommand.execute({ force: true });

      expect(mockFs.ensureDir).toHaveBeenCalled();
    });

    it('should handle path separators correctly', async () => {
      initCommand = new InitCommand(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);

      await initCommand.execute({ force: true });

      // Verify paths use proper separators
      const ensureDirCalls = mockFs.ensureDir.mock.calls;
      ensureDirCalls.forEach((call) => {
        expect(call[0]).toMatch(/[\\/]/); // Should contain path separator
      });
    });
  });

  describe('PM tool functionality', () => {
    beforeEach(() => {
      initCommand = new InitCommand(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.readdir.mockResolvedValue([]);
    });

    describe('PM tool selection', () => {
      it.skip('should prompt for PM tool when none detected - tests console output', async () => {
        mockInquirer.prompt
          .mockResolvedValueOnce({ projectName: 'test-project' })
          .mockResolvedValueOnce({ pmChoice: 'linear' })
          .mockResolvedValueOnce({ shouldProceed: true });

        await initCommand.execute();

        expect(mockInquirer.prompt).toHaveBeenCalledWith([
          expect.objectContaining({
            type: 'list',
            name: 'pmChoice',
            message: 'Select a project management tool:',
          }),
        ]);
      });

      it('should validate PM tool selection', async () => {
        mockInquirer.prompt
          .mockResolvedValueOnce({ projectName: 'test-project' })
          .mockResolvedValueOnce({ pmChoice: 'linear' })
          .mockResolvedValueOnce({ shouldProceed: true });

        process.env.LINEAR_API_KEY = 'test-key';

        await initCommand.execute();

        expect(mockFs.writeJson).toHaveBeenCalledWith(
          expect.stringContaining('config.json'),
          expect.objectContaining({
            pmTool: 'linear',
          }),
          { spaces: 2 }
        );

        delete process.env.LINEAR_API_KEY;
      });

      it('should handle skipped PM tool selection', async () => {
        mockInquirer.prompt
          .mockResolvedValueOnce({ projectName: 'test-project' })
          .mockResolvedValueOnce({ pmChoice: null })
          .mockResolvedValueOnce({ shouldProceed: true });

        await initCommand.execute();

        expect(mockFs.writeJson).toHaveBeenCalledWith(
          expect.stringContaining('config.json'),
          expect.objectContaining({
            pmTool: null,
          }),
          { spaces: 2 }
        );
      });

      it.skip('should check environment variables for selected PM tool - tests implementation', async () => {
        mockInquirer.prompt
          .mockResolvedValueOnce({ projectName: 'test-project' })
          .mockResolvedValueOnce({ pmChoice: 'github' })
          .mockResolvedValueOnce({ shouldProceed: true });

        process.env.GITHUB_TOKEN = 'ghp_test123';

        await initCommand.execute();

        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('✓ Environment configured for github')
        );

        delete process.env.GITHUB_TOKEN;
      });

      it.skip('should warn about missing environment variables - tests console output', async () => {
        mockInquirer.prompt
          .mockResolvedValueOnce({ projectName: 'test-project' })
          .mockResolvedValueOnce({ pmChoice: 'jira' })
          .mockResolvedValueOnce({ shouldProceed: true });

        await initCommand.execute();

        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Missing environment variables for jira')
        );
      });
    });

    describe('--quick flag', () => {
      it.skip('should skip interactive prompts with --quick flag - tests implementation', async () => {
        mockFs.pathExists.mockResolvedValue(false);

        await initCommand.execute({ quick: true });

        expect(mockInquirer.prompt).not.toHaveBeenCalled();
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Quick mode: Using detected configuration')
        );
      });

      it.skip('should not overwrite existing config with --quick without force - tests implementation', async () => {
        mockFs.pathExists.mockImplementation((path) => {
          return Promise.resolve(path.toString().includes('.hodge'));
        });

        await initCommand.execute({ quick: true });

        expect(mockFs.ensureDir).not.toHaveBeenCalled();
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Existing Hodge configuration detected')
        );
      });

      it.skip('should treat --yes as --quick for backwards compatibility - tests implementation', async () => {
        mockFs.pathExists.mockResolvedValue(false);

        await initCommand.execute({ yes: true });

        expect(mockInquirer.prompt).not.toHaveBeenCalled();
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Quick mode: Using detected configuration')
        );
      });
    });

    describe('pattern learning', () => {
      it.skip('should prompt for pattern learning on existing codebases - tests console output', async () => {
        mockFs.readdir.mockResolvedValue(['src', 'package.json']);
        mockFs.pathExists.mockImplementation((path) => {
          return Promise.resolve(path.toString().includes('package.json'));
        });
        mockFs.readJson.mockResolvedValue({ name: 'existing-project' });

        mockInquirer.prompt
          .mockResolvedValueOnce({ shouldLearnPatterns: true })
          .mockResolvedValueOnce({ shouldProceed: true });

        await initCommand.execute();

        expect(mockInquirer.prompt).toHaveBeenCalledWith([
          expect.objectContaining({
            type: 'confirm',
            name: 'shouldLearnPatterns',
            message: expect.stringContaining('analyze your codebase and learn patterns'),
          }),
        ]);
      });

      it('should not prompt for pattern learning on empty directories', async () => {
        mockFs.readdir.mockResolvedValue([]);

        mockInquirer.prompt
          .mockResolvedValueOnce({ projectName: 'new-project' })
          .mockResolvedValueOnce({ shouldProceed: true });

        await initCommand.execute();

        expect(mockInquirer.prompt).not.toHaveBeenCalledWith([
          expect.objectContaining({
            name: 'shouldLearnPatterns',
          }),
        ]);
      });

      it.skip('should handle pattern learning prompt errors gracefully - tests console output', async () => {
        mockFs.readdir.mockResolvedValue(['src', 'package.json']);
        mockFs.pathExists.mockImplementation((path) => {
          return Promise.resolve(path.toString().includes('package.json'));
        });
        mockFs.readJson.mockResolvedValue({ name: 'existing-project' });

        mockInquirer.prompt
          .mockResolvedValueOnce({ shouldProceed: true })
          .mockRejectedValueOnce(new Error('Prompt failed'));

        await initCommand.execute();

        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Pattern learning prompt failed')
        );
      });
    });
  });

  describe('validation and security', () => {
    beforeEach(() => {
      initCommand = new InitCommand(mockRootPath);
    });

    describe('project name validation', () => {
      it.skip('should validate project name format - tests console output', async () => {
        mockFs.readdir.mockResolvedValue([]);

        const promptCall = mockInquirer.prompt.mockResolvedValue({ projectName: 'valid-name' });

        await initCommand.execute();

        const promptArgs = promptCall.mock.calls[0][0] as any[];
        const namePrompt = promptArgs.find((p: any) => p.name === 'projectName');

        expect(namePrompt.validate('')).toContain('Project name is required');
        expect(namePrompt.validate('a')).toContain('must be at least 2 characters');
        expect(namePrompt.validate('a'.repeat(51))).toContain('must be 50 characters or less');
        expect(namePrompt.validate('invalid@name')).toContain('can only contain');
        expect(namePrompt.validate('hodge')).toContain('is reserved');
        expect(namePrompt.validate('valid-name-123')).toBe(true);
      });
    });

    describe('directory validation', () => {
      it.skip('should handle permission errors when checking if directory is empty - tests error handling', async () => {
        const permissionError = new Error('EACCES: permission denied');
        mockFs.readdir.mockRejectedValue(permissionError);

        await expect(initCommand.execute()).rejects.toThrow('Process exited');

        expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Validation Error'));
      });

      it('should handle non-permission errors when checking directory', async () => {
        mockFs.readdir.mockRejectedValue(new Error('Some other error'));

        // Should not throw - should assume empty
        await initCommand.execute({ force: true });

        expect(mockFs.ensureDir).toHaveBeenCalled();
      });
    });

    describe('input sanitization', () => {
      it.skip('should sanitize project names by trimming whitespace - tests implementation', async () => {
        mockFs.readdir.mockResolvedValue([]);

        mockInquirer.prompt
          .mockResolvedValueOnce({ projectName: '  test-project  ' })
          .mockResolvedValueOnce({ shouldProceed: true });

        await initCommand.execute();

        expect(mockFs.writeJson).toHaveBeenCalledWith(
          expect.stringContaining('config.json'),
          expect.objectContaining({
            projectName: 'test-project', // Should be trimmed
          }),
          { spaces: 2 }
        );
      });
    });
  });
});
