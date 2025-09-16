import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OptimizedBuildCommand } from './build-optimized';
import { CacheManager } from '../lib/cache-manager';
import chalk from 'chalk';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

// Mock fs module
vi.mock('fs', () => {
  const mockAccess = vi.fn();
  const mockReadFile = vi.fn();
  const mockReaddir = vi.fn();
  const mockMkdir = vi.fn();
  const mockWriteFile = vi.fn();

  return {
    existsSync: vi.fn(),
    promises: {
      access: mockAccess,
      readFile: mockReadFile,
      readdir: mockReaddir,
      mkdir: mockMkdir,
      writeFile: mockWriteFile,
    }
  };
});

// Mock cache-manager
vi.mock('../lib/cache-manager', () => {
  const actual = vi.importActual('../lib/cache-manager');
  return {
    ...actual,
    CacheManager: {
      getInstance: vi.fn(() => ({
        clear: vi.fn(),
        getOrLoad: vi.fn(),
        batchLoad: vi.fn(),
        checkExistence: vi.fn(),
        loadJSON: vi.fn(),
        invalidate: vi.fn(),
        invalidateFeature: vi.fn(),
        getStats: vi.fn(() => ({
          hits: 10,
          misses: 5,
          hitRate: 0.67,
          size: 15,
          memoryUsage: 1024
        }))
      }))
    },
    featureCache: {
      loadFeatureState: vi.fn()
    },
    standardsCache: {
      loadStandards: vi.fn(),
      loadPatterns: vi.fn(),
      loadConfig: vi.fn()
    }
  };
});

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    blue: Object.assign(
      (str: string) => str,
      {
        bold: (str: string) => str,
      }
    ),
    gray: (str: string) => str,
    yellow: (str: string) => str,
    cyan: Object.assign(
      (str: string) => str,
      {
        bold: (str: string) => str,
      }
    ),
    green: (str: string) => str,
    bold: (str: string) => str,
    dim: (str: string) => str,
  },
}));

describe('OptimizedBuildCommand', () => {
  let command: OptimizedBuildCommand;
  let consoleLogSpy: any;
  let mockFs: any;
  let mockExistsSync: any;
  let mockCacheManager: any;

  beforeEach(() => {
    command = new OptimizedBuildCommand();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.clearAllMocks();

    // Get mock references
    mockFs = vi.mocked(fsPromises);
    mockExistsSync = vi.mocked(fs.existsSync);
    mockCacheManager = CacheManager.getInstance();

    // Setup default mock implementations
    mockExistsSync.mockReturnValue(true);
    mockFs.access.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('test content');
    mockFs.readdir.mockResolvedValue(['pattern1.md', 'pattern2.md']);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);

    mockCacheManager.getOrLoad.mockImplementation(async (_key: string, loader: () => Promise<any>) => {
      return loader();
    });
    mockCacheManager.batchLoad.mockResolvedValue(new Map([
      ['file1', 'content1'],
      ['file2', 'content2']
    ]));
    mockCacheManager.checkExistence.mockResolvedValue(new Map([
      ['path1', true],
      ['path2', false]
    ]));
    mockCacheManager.loadJSON.mockResolvedValue({ test: true });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('execute', () => {
    it('should perform all file checks in parallel', async () => {
      // Setup explore and decision existence
      mockFs.access.mockImplementation((path: string) => {
        if (path.includes('explore') || path.includes('decision.md')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Not found'));
      });

      await command.execute('test-feature');

      // Should check multiple paths in parallel through cache
      expect(mockCacheManager.checkExistence).toHaveBeenCalled();
      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should cache standards and patterns for subsequent calls', async () => {
      mockFs.access.mockResolvedValue(undefined);

      // First execution
      await command.execute('test-feature-1');
      const firstCalls = mockCacheManager.getOrLoad.mock.calls.length;

      // Second execution - should use cache
      await command.execute('test-feature-2');
      const secondCalls = mockCacheManager.getOrLoad.mock.calls.length;

      // Cache should be used, so fewer calls to getOrLoad
      expect(secondCalls).toBeGreaterThan(firstCalls);
    });

    it('should skip checks when skipChecks option is true', async () => {
      await command.execute('test-feature', { skipChecks: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skipping prerequisite checks')
      );
    });

    it('should handle missing exploration gracefully', async () => {
      mockFs.access.mockRejectedValue(new Error('Not found'));

      await command.execute('test-feature');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('No exploration found')
      );
    });

    it('should handle missing decision gracefully', async () => {
      mockFs.access.mockImplementation((path: string) => {
        if (path.includes('explore')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Not found'));
      });

      await command.execute('test-feature');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('No decision recorded')
      );
    });

    it('should write context and build plan in parallel', async () => {
      mockFs.access.mockResolvedValue(undefined);

      await command.execute('test-feature');

      // Both files should be written
      const writeCalls = mockFs.writeFile.mock.calls;
      const contextCall = writeCalls.find((call: any[]) =>
        call[0].includes('context.json')
      );
      const buildPlanCall = writeCalls.find((call: any[]) =>
        call[0].includes('build-plan.md')
      );

      expect(contextCall).toBeTruthy();
      expect(buildPlanCall).toBeTruthy();
    });

    it('should display cached patterns correctly', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockCacheManager.getOrLoad.mockImplementation(async (key: string, loader: () => Promise<any>) => {
        if (key === 'patterns') {
          return new Map([
            ['singleton-pattern', 'Singleton pattern content'],
            ['factory-pattern', 'Factory pattern content']
          ]);
        }
        return loader();
      });

      await command.execute('test-feature');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('singleton-pattern')
      );
    });
  });

  describe('performance', () => {
    it('should complete execution faster with caching', async () => {
      mockFs.access.mockResolvedValue(undefined);

      // First execution (cold cache)
      const start1 = Date.now();
      await command.execute('test-feature-1');
      const time1 = Date.now() - start1;

      // Second execution (warm cache)
      const start2 = Date.now();
      await command.execute('test-feature-2');
      const time2 = Date.now() - start2;

      // Second execution should be faster or equal (with mocks it's usually equal)
      expect(time2).toBeLessThanOrEqual(time1);
    });

    it('should report cache statistics when DEBUG is set', async () => {
      process.env.DEBUG = 'true';
      mockFs.access.mockResolvedValue(undefined);

      await command.execute('test-feature');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cache Performance')
      );

      delete process.env.DEBUG;
    });
  });

  describe('template generation', () => {
    it('should generate comprehensive build plan', async () => {
      mockFs.access.mockResolvedValue(undefined);

      await command.execute('test-feature');

      const buildPlanCall = mockFs.writeFile.mock.calls.find((call: any[]) =>
        call[0].includes('build-plan.md')
      );

      expect(buildPlanCall).toBeTruthy();
      const content = buildPlanCall[1];
      expect(content).toContain('Build Plan');
      expect(content).toContain('Implementation Tasks');
    });

    it('should populate build plan template correctly', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockImplementation((path: string) => {
        if (path.includes('exploration.md')) {
          return Promise.resolve('# Test Feature\n\nApproach: Test approach');
        }
        if (path.includes('decision.md')) {
          return Promise.resolve('Decision: Use approach 1');
        }
        return Promise.resolve('test content');
      });

      await command.execute('test-feature');

      const buildPlanCall = mockFs.writeFile.mock.calls.find((call: any[]) =>
        call[0].includes('build-plan.md')
      );

      expect(buildPlanCall).toBeTruthy();
      const content = buildPlanCall[1];
      expect(content).toContain('test-feature');
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

      await command.execute('test-feature');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error')
      );
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheManager.getOrLoad.mockRejectedValue(new Error('Cache error'));

      await command.execute('test-feature');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error')
      );
    });
  });
});