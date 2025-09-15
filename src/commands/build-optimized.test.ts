import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OptimizedBuildCommand } from './build-optimized';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import { CacheManager } from '../lib/cache-manager';

// Mock modules
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
    readFile: vi.fn(),
    readdir: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  },
  access: vi.fn(),
  readFile: vi.fn(),
  readdir: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('chalk', () => ({
  default: {
    blue: Object.assign(
      vi.fn((str) => str),
      {
        bold: vi.fn((str) => str),
      }
    ),
    gray: vi.fn((str) => str),
    yellow: vi.fn((str) => str),
    cyan: vi.fn((str) => str),
    green: vi.fn((str) => str),
    bold: vi.fn((str) => str),
    dim: vi.fn((str) => str),
  },
}));

describe('OptimizedBuildCommand', () => {
  let command: OptimizedBuildCommand;
  let consoleLogSpy: any;

  beforeEach(() => {
    command = new OptimizedBuildCommand();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.clearAllMocks();

    // Clear cache before each test
    CacheManager.getInstance().clear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('execute', () => {
    it('should perform all file checks in parallel', async () => {
      const mockAccess = vi.mocked(fs.access);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockReaddir = vi.mocked(fs.readdir);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockWriteFile = vi.mocked(fs.writeFile);

      // Set up mocks
      mockAccess.mockImplementation((path) => {
        if (path.toString().includes('explore')) {
          return Promise.resolve();
        }
        if (path.toString().includes('decision.md')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Not found'));
      });

      mockReadFile.mockResolvedValue('test content');
      mockReaddir.mockResolvedValue(['pattern1.md', 'pattern2.md'] as any);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      // Execute command
      await command.execute('test-feature', { skipChecks: false });

      // Verify parallel access calls (should be called together)
      expect(mockAccess).toHaveBeenCalledTimes(5);

      // Check that all paths were checked
      const accessCalls = mockAccess.mock.calls.map((call) => call[0]);
      expect(accessCalls).toContain('.hodge/features/test-feature/explore');
      expect(accessCalls).toContain('.hodge/features/test-feature/explore/decision.md');
      expect(accessCalls).toContain('.hodge/features/test-feature/issue-id.txt');
      expect(accessCalls).toContain('.hodge/standards.md');
      expect(accessCalls).toContain('.hodge/patterns');
    });

    it('should cache standards and patterns for subsequent calls', async () => {
      const mockAccess = vi.mocked(fs.access);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockReaddir = vi.mocked(fs.readdir);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockWriteFile = vi.mocked(fs.writeFile);

      // Set up successful mocks
      mockAccess.mockResolvedValue();
      mockReadFile.mockResolvedValue('cached content');
      mockReaddir.mockResolvedValue(['pattern.md'] as any);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      // First execution - should read from filesystem
      await command.execute('feature1', { skipChecks: true });
      const firstReadFileCalls = mockReadFile.mock.calls.length;
      const firstReaddirCalls = mockReaddir.mock.calls.length;

      // Second execution - should use cache
      await command.execute('feature2', { skipChecks: true });
      const secondReadFileCalls = mockReadFile.mock.calls.length;
      const secondReaddirCalls = mockReaddir.mock.calls.length;

      // Standards and patterns should not be re-read (cached)
      // Only issue-id.txt should be read again (not cached)
      expect(secondReadFileCalls).toBeLessThan(firstReadFileCalls * 2);
      expect(secondReaddirCalls).toBe(firstReaddirCalls); // Patterns cached
    });

    it('should handle missing exploration gracefully', async () => {
      const mockAccess = vi.mocked(fs.access);

      // Mock no exploration found
      mockAccess.mockRejectedValue(new Error('Not found'));

      await command.execute('no-exploration', { skipChecks: false });

      // Should show warning about missing exploration
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No exploration found'));
    });

    it('should skip checks when skipChecks option is true', async () => {
      const mockAccess = vi.mocked(fs.access);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockWriteFile = vi.mocked(fs.writeFile);

      // Mock no exploration
      mockAccess.mockImplementation((path) => {
        if (path.toString().includes('explore')) {
          return Promise.reject(new Error('Not found'));
        }
        return Promise.resolve();
      });

      mockReadFile.mockResolvedValue('content');
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      // Should not return early even without exploration
      await command.execute('skip-checks-feature', { skipChecks: true });

      // Should create build directory
      expect(mockMkdir).toHaveBeenCalledWith('.hodge/features/skip-checks-feature/build', {
        recursive: true,
      });
    });

    it('should write context and build plan in parallel', async () => {
      const mockAccess = vi.mocked(fs.access);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockWriteFile = vi.mocked(fs.writeFile);

      mockAccess.mockResolvedValue();
      mockReadFile.mockResolvedValue('content');
      mockMkdir.mockResolvedValue(undefined);

      let writeStartTimes: number[] = [];
      mockWriteFile.mockImplementation(async () => {
        writeStartTimes.push(Date.now());
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      await command.execute('parallel-writes', { skipChecks: true });

      // Both writes should start at nearly the same time (parallel)
      expect(mockWriteFile).toHaveBeenCalledTimes(2);
      expect(writeStartTimes.length).toBe(2);

      // Time difference should be minimal (< 5ms) if parallel
      const timeDiff = Math.abs(writeStartTimes[1] - writeStartTimes[0]);
      expect(timeDiff).toBeLessThan(5);
    });

    it('should display cached patterns correctly', async () => {
      const mockAccess = vi.mocked(fs.access);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockReaddir = vi.mocked(fs.readdir);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockWriteFile = vi.mocked(fs.writeFile);

      mockAccess.mockResolvedValue();
      mockReadFile.mockResolvedValue('content');
      mockReaddir.mockResolvedValue([
        'singleton-pattern.md',
        'factory-pattern.md',
        'not-a-pattern.txt', // Should be filtered out
      ] as any);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      await command.execute('patterns-test', { skipChecks: true });

      // Should display only .md patterns
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('singleton-pattern'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('factory-pattern'));
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('not-a-pattern'));
    });
  });

  describe('performance', () => {
    it('should complete execution faster with caching', async () => {
      const mockAccess = vi.mocked(fs.access);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockReaddir = vi.mocked(fs.readdir);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockWriteFile = vi.mocked(fs.writeFile);

      // Set up mocks with delays
      mockAccess.mockResolvedValue();
      mockReadFile.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'content';
      });
      mockReaddir.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return ['pattern.md'] as any;
      });
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      // First execution
      const start1 = Date.now();
      await command.execute('perf-test-1', { skipChecks: true });
      const time1 = Date.now() - start1;

      // Second execution (should use cache)
      const start2 = Date.now();
      await command.execute('perf-test-2', { skipChecks: true });
      const time2 = Date.now() - start2;

      // Second execution should be significantly faster
      expect(time2).toBeLessThan(time1);

      // Cache should have hits
      const stats = CacheManager.getInstance().getStats();
      expect(stats.hits).toBeGreaterThan(0);
    });
  });

  describe('template generation', () => {
    it('should populate build plan template correctly', async () => {
      const mockAccess = vi.mocked(fs.access);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockWriteFile = vi.mocked(fs.writeFile);

      mockAccess.mockResolvedValue();
      mockReadFile.mockImplementation((path) => {
        if (path.toString().includes('issue-id.txt')) {
          return Promise.resolve('LIN-123');
        }
        return Promise.resolve('content');
      });
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      process.env.HODGE_PM_TOOL = 'Linear';

      await command.execute('template-test', { skipChecks: true });

      // Check that build plan was written with correct substitutions
      const buildPlanCall = mockWriteFile.mock.calls.find((call) =>
        call[0].toString().includes('build-plan.md')
      );

      expect(buildPlanCall).toBeDefined();
      const buildPlanContent = buildPlanCall![1] as string;

      // Should contain feature name
      expect(buildPlanContent).toContain('template-test');

      // Should contain PM info
      expect(buildPlanContent).toContain('LIN-123');
      expect(buildPlanContent).toContain('Linear');

      delete process.env.HODGE_PM_TOOL;
    });
  });
});
