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
    // Interactive question flow test suites removed - implementation tests deleted

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
      // Display, PM tool, and validation test suites removed - implementation tests deleted
    });
  });
});
