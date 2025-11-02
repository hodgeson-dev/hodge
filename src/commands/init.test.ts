/**
 * Integration tests for the init command
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import inquirer from 'inquirer';
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
      // Both hodge.json and project-meta.json should be created
      // project-meta.json uses writeFile (for header comment)
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('project-meta.json'),
        expect.stringContaining('"projectName": "test-project"'),
        'utf-8'
      );
      // hodge.json uses writeJson
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('hodge.json'),
        expect.anything(),
        { spaces: 2 }
      );

      // Verify success message
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Hodge initialized successfully')
      );
    });

    it('should initialize Python project successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('requirements.txt')) return Promise.resolve(true);
        if (pathStr.includes('.hodge')) return Promise.resolve(false);
        return Promise.resolve(false);
      });

      await initCommand.execute({ force: true });

      // Both files should be created for Python project too
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('project-meta.json'),
        expect.stringContaining('"projectType": "python"'),
        'utf-8'
      );
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('hodge.json'),
        expect.anything(),
        { spaces: 2 }
      );
    });

    it('should handle unknown project type gracefully', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await initCommand.execute({ force: true });

      // Both files should be created for unknown project too
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('project-meta.json'),
        expect.stringContaining('"projectType": "unknown"'),
        'utf-8'
      );
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('hodge.json'),
        expect.anything(),
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
        // eslint-disable-next-line sonarjs/no-nested-functions -- Test pattern requires nested functions
        expect(() => new InitCommand('')).toThrow();

        // eslint-disable-next-line sonarjs/no-nested-functions -- Test pattern requires nested functions
        expect(() => {
          // eslint-disable-next-line sonarjs/constructor-for-side-effects -- Testing constructor throws
          new InitCommand('');
        }).toThrow(ValidationError);
      });
      // Display, PM tool, and validation test suites removed - implementation tests deleted
    });
  });
});
