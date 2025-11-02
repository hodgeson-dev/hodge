/**
 * Unit tests for the project detection engine
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { ProjectDetector, DetectionError, ValidationError } from './detection';

// Mock external dependencies
vi.mock('fs-extra');
vi.mock('child_process');

const mockFs = vi.mocked(fs);
const mockExecSync = vi.mocked(execSync);

describe('ProjectDetector', () => {
  let mockRootPath: string;
  let detector: ProjectDetector;

  beforeEach(() => {
    mockRootPath = '/test/project';
    vi.clearAllMocks();

    // Default mock implementations
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create detector with valid absolute path', () => {
      expect(() => new ProjectDetector('/valid/path')).not.toThrow();
    });

    it('should convert relative path to absolute', () => {
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as any);

      expect(() => new ProjectDetector('relative/path')).not.toThrow();
    });

    it('should throw ValidationError for empty path', () => {
      expect(() => new ProjectDetector('')).toThrow(ValidationError);
      expect(() => new ProjectDetector(null as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-directory path', () => {
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      } as any);

      expect(() => new ProjectDetector('/file/path')).toThrow(ValidationError);
    });

    it('should throw ValidationError for inaccessible path', () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => new ProjectDetector('/nonexistent/path')).toThrow(ValidationError);
    });
  });

  describe('detectProject', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
    });

    it('should detect complete project information', async () => {
      // Mock package.json exists with name
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue({
        name: 'test-project',
        dependencies: { vitest: '^1.0.0' },
        devDependencies: { eslint: '^8.0.0', typescript: '^5.0.0' },
      });

      // Mock git status
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('git status')) return '';
        if (cmd.toString().includes('git remote'))
          return 'https://github.com/user/test-project.git';
        return '';
      });

      // Mock Hodge config doesn't exist
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('.hodge')) return Promise.resolve(false);
        if (pathStr.includes('yarn.lock')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      const result = await detector.detectProject();

      expect(result.name).toBe('test-project');
      expect(result.type).toBe('node');
      expect(result.hasExistingConfig).toBe(false);
      expect(result.detectedTools.packageManager).toBe('yarn');
      expect(result.detectedTools.testFramework).toContain('vitest');
      expect(result.detectedTools.linting).toContain('eslint');
      expect(result.detectedTools.buildTools).toContain('typescript');
      expect(result.detectedTools.hasGit).toBe(true);
    });

    it('should handle detection errors gracefully', async () => {
      mockFs.pathExists.mockRejectedValue(new Error('Permission denied'));

      await expect(detector.detectProject()).rejects.toThrow(DetectionError);
    });
  });

  describe('project name detection', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
    });

    it('should extract name from package.json', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue({ name: 'my-package' });
      mockExecSync.mockImplementation(() => {
        throw new Error('git not available');
      });

      const result = await detector.detectProject();
      expect(result.name).toBe('my-package');
    });

    it('should remove scope from package name', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue({ name: '@scope/my-package' });
      mockExecSync.mockImplementation(() => {
        throw new Error('git not available');
      });

      const result = await detector.detectProject();
      expect(result.name).toBe('my-package');
    });

    it('should extract name from git remote', async () => {
      mockFs.pathExists.mockResolvedValue(false); // No package.json
      mockExecSync.mockReturnValue('https://github.com/user/repo-name.git');

      const result = await detector.detectProject();
      expect(result.name).toBe('repo-name');
    });

    it('should use directory name as fallback', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      mockExecSync.mockImplementation(() => {
        throw new Error('git not available');
      });

      const result = await detector.detectProject();
      expect(result.name).toBe('project'); // from /test/project
    });

    it('should reject invalid project names', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue({ name: 'invalid<name>' });
      mockExecSync.mockImplementation(() => {
        throw new Error('git not available');
      });

      // Should fall back to directory name since package name is invalid
      const result = await detector.detectProject();
      expect(result.name).toBe('project');
    });

    it('should handle package.json read errors gracefully', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockRejectedValue(new Error('Malformed JSON'));
      mockExecSync.mockImplementation(() => {
        throw new Error('git not available');
      });

      const result = await detector.detectProject();
      expect(result.name).toBe('project'); // Falls back to directory name
    });
  });

  describe('project type detection', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
    });

    it('should detect Node.js project from package.json', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('package.json'));
      });

      const result = await detector.detectProject();
      expect(result.type).toBe('node');
    });

    it('should detect Node.js project from node_modules', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('node_modules'));
      });

      const result = await detector.detectProject();
      expect(result.type).toBe('node');
    });

    it('should detect Python project from requirements.txt', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('requirements.txt'));
      });

      const result = await detector.detectProject();
      expect(result.type).toBe('python');
    });

    it('should detect Python project from pyproject.toml', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('pyproject.toml'));
      });

      const result = await detector.detectProject();
      expect(result.type).toBe('python');
    });

    it('should return unknown for unrecognized project', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      const result = await detector.detectProject();
      expect(result.type).toBe('unknown');
    });
  });

  describe('PM tool detection', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
    });

    it('should detect Linear from environment variable', async () => {
      process.env.LINEAR_API_KEY = 'test-key';

      const result = await detector.detectProject();
      expect(result.pmTool).toBe('linear');

      delete process.env.LINEAR_API_KEY;
    });

    it('should detect GitHub from environment variable', async () => {
      process.env.GITHUB_TOKEN = 'test-token';

      const result = await detector.detectProject();
      expect(result.pmTool).toBe('github');

      delete process.env.GITHUB_TOKEN;
    });

    it('should detect GitHub from git remote', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('git remote')) {
          return 'https://github.com/user/repo.git';
        }
        throw new Error('git not available');
      });

      const result = await detector.detectProject();
      expect(result.pmTool).toBe('github');
    });

    it('should detect Jira from environment variable', async () => {
      process.env.JIRA_API_TOKEN = 'test-token';

      const result = await detector.detectProject();
      expect(result.pmTool).toBe('jira');

      delete process.env.JIRA_API_TOKEN;
    });

    it('should return null when no PM tool detected', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('git not available');
      });

      const result = await detector.detectProject();
      expect(result.pmTool).toBe(null);
    });
  });

  describe('package manager detection', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
    });

    it('should detect pnpm from lock file', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('pnpm-lock.yaml'));
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.packageManager).toBe('pnpm');
    });

    it('should detect yarn from lock file', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('yarn.lock'));
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.packageManager).toBe('yarn');
    });

    it('should detect npm from lock file', async () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('package-lock.json'));
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.packageManager).toBe('npm');
    });
  });

  describe('test framework detection', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mockFs.pathExists.mockImplementation((path) => {
        return Promise.resolve(path.toString().includes('package.json'));
      });
    });

    it('should detect vitest', async () => {
      mockFs.readJson.mockResolvedValue({
        devDependencies: { vitest: '^1.0.0' },
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.testFramework).toContain('vitest');
    });

    it('should detect jest', async () => {
      mockFs.readJson.mockResolvedValue({
        dependencies: { jest: '^29.0.0' },
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.testFramework).toContain('jest');
    });

    it('should detect multiple test frameworks', async () => {
      mockFs.readJson.mockResolvedValue({
        devDependencies: {
          vitest: '^1.0.0',
          '@testing-library/react': '^13.0.0',
          cypress: '^13.0.0',
        },
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.testFramework).toContain('vitest');
      expect(result.detectedTools.testFramework).toContain('testing-library');
      expect(result.detectedTools.testFramework).toContain('cypress');
    });

    it('should handle missing package.json gracefully', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      const result = await detector.detectProject();
      expect(result.detectedTools.testFramework).toEqual([]);
    });

    it('should handle malformed package.json gracefully', async () => {
      mockFs.readJson.mockRejectedValue(new Error('Invalid JSON'));

      const result = await detector.detectProject();
      expect(result.detectedTools.testFramework).toEqual([]);
    });
  });

  describe('git detection', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
    });

    it('should detect git when git status succeeds', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('git status')) return '';
        if (cmd.toString().includes('git remote')) return 'origin';
        throw new Error('Unknown git command');
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.hasGit).toBe(true);
      expect(result.detectedTools.gitRemote).toBe('origin');
    });

    it('should handle git not available', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('git: command not found');
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.hasGit).toBe(false);
      expect(result.detectedTools.gitRemote).toBeUndefined();
    });

    it('should handle git timeout', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command timed out');
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.hasGit).toBe(false);
    });
  });

  describe('security validation', () => {
    it('should reject path traversal attempts', () => {
      expect(() => new ProjectDetector('/valid/../../../etc')).toThrow();
    });

    it('should validate project names against malicious patterns', async () => {
      detector = new ProjectDetector(mockRootPath);
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue({
        name: 'malicious<script>alert("xss")</script>',
      });
      mockExecSync.mockImplementation(() => {
        throw new Error('git not available');
      });

      const result = await detector.detectProject();
      // Should fallback to directory name since package name is invalid
      expect(result.name).toBe('project');
    });
  });

  describe('performance and timeouts', () => {
    beforeEach(() => {
      detector = new ProjectDetector(mockRootPath);
      mockFs.pathExists.mockResolvedValue(false);
    });

    it('should timeout git operations', async () => {
      mockExecSync.mockImplementation((cmd, options) => {
        if (cmd.toString().includes('git')) {
          expect(options).toHaveProperty('timeout', 5000);
          throw new Error('Command timed out');
        }
        return '';
      });

      const result = await detector.detectProject();
      expect(result.detectedTools.hasGit).toBe(false);
    });
  });
});
