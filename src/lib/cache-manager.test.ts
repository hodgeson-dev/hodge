/**
 * Unit tests for Cache Manager
 * Ensures production-ready quality with >80% coverage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { CacheManager, FeatureStateCache, StandardsCache } from './cache-manager';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  promises: {
    readFile: vi.fn(),
    readdir: vi.fn(),
    access: vi.fn(),
  },
  readFile: vi.fn(),
  access: vi.fn(),
}));

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    // Reset singleton instance
    (CacheManager as any).instance = undefined;
    cacheManager = CacheManager.getInstance(100); // 100ms TTL for tests
    cacheManager.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = CacheManager.getInstance();
      const instance2 = CacheManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should maintain singleton even with different TTL', () => {
      const instance1 = CacheManager.getInstance(100);
      const instance2 = CacheManager.getInstance(200);
      expect(instance1).toBe(instance2);
    });
  });

  describe('getOrLoad', () => {
    it('should load data on cache miss', async () => {
      const loader = vi.fn().mockResolvedValue('test-data');
      const result = await cacheManager.getOrLoad('test-key', loader);

      expect(result).toBe('test-data');
      expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should return cached data on cache hit', async () => {
      const loader = vi.fn().mockResolvedValue('test-data');

      // First call - cache miss
      await cacheManager.getOrLoad('test-key', loader);

      // Second call - cache hit
      const result = await cacheManager.getOrLoad('test-key', loader);

      expect(result).toBe('test-data');
      expect(loader).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should respect TTL expiration', async () => {
      const loader = vi.fn().mockResolvedValueOnce('data-1').mockResolvedValueOnce('data-2');

      // First call
      const result1 = await cacheManager.getOrLoad('test-key', loader, { ttl: 50 });
      expect(result1).toBe('data-1');

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Second call after TTL
      const result2 = await cacheManager.getOrLoad('test-key', loader, { ttl: 50 });
      expect(result2).toBe('data-2');
      expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should throw error for empty key', async () => {
      const loader = vi.fn().mockResolvedValue('data');
      await expect(cacheManager.getOrLoad('', loader)).rejects.toThrow('Cache key cannot be empty');
    });

    it('should throw error for non-function loader', async () => {
      await expect(cacheManager.getOrLoad('key', 'not-a-function' as any)).rejects.toThrow(
        'Loader must be a function'
      );
    });

    it('should propagate loader errors with context', async () => {
      const loader = vi.fn().mockRejectedValue(new Error('Load failed'));
      await expect(cacheManager.getOrLoad('test-key', loader)).rejects.toThrow(
        'Failed to load data for key "test-key": Load failed'
      );
    });
  });

  describe('batchLoad', () => {
    it('should load multiple files in parallel', async () => {
      const mockReadFile = vi.mocked(fsPromises.readFile);
      mockReadFile
        .mockResolvedValueOnce('content1' as any)
        .mockResolvedValueOnce('content2' as any);

      const paths = ['/path/1.txt', '/path/2.txt'];
      const results = await cacheManager.batchLoad(paths);

      expect(results.get('/path/1.txt')).toBe('content1');
      expect(results.get('/path/2.txt')).toBe('content2');
      expect(mockReadFile).toHaveBeenCalledTimes(2);
    });

    it('should apply transformer function', async () => {
      const mockReadFile = vi.mocked(fsPromises.readFile);
      mockReadFile.mockResolvedValue('{"key": "value"}' as any);

      const paths = ['/path/data.json'];
      const results = await cacheManager.batchLoad(paths, JSON.parse);

      expect(results.get('/path/data.json')).toEqual({ key: 'value' });
    });

    it('should handle file read errors gracefully', async () => {
      const mockReadFile = vi.mocked(fsPromises.readFile);
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const paths = ['/missing/file.txt'];
      const results = await cacheManager.batchLoad(paths);

      expect(results.get('/missing/file.txt')).toBeNull();
    });
  });

  describe('checkExistence', () => {
    it('should check multiple paths in parallel', async () => {
      const mockAccess = vi.mocked(fsPromises.access);
      mockAccess.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Not found'));

      const paths = ['/exists.txt', '/missing.txt'];
      const results = await cacheManager.checkExistence(paths);

      expect(results.get('/exists.txt')).toBe(true);
      expect(results.get('/missing.txt')).toBe(false);
    });

    it('should cache existence checks', async () => {
      const mockAccess = vi.mocked(fsPromises.access);
      mockAccess.mockResolvedValue(undefined);

      const paths = ['/file.txt'];

      // First check
      await cacheManager.checkExistence(paths);

      // Second check (should use cache)
      await cacheManager.checkExistence(paths);

      expect(mockAccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadJSON', () => {
    it('should parse JSON files', async () => {
      const mockReadFile = vi.mocked(fsPromises.readFile);
      mockReadFile.mockResolvedValue('{"test": true}' as any);

      const result = await cacheManager.loadJSON('/config.json');
      expect(result).toEqual({ test: true });
    });

    it('should return null for invalid JSON', async () => {
      const mockReadFile = vi.mocked(fsPromises.readFile);
      mockReadFile.mockResolvedValue('invalid json' as any);

      const result = await cacheManager.loadJSON('/invalid.json');
      expect(result).toBeNull();
    });

    it('should return null for missing files', async () => {
      const mockReadFile = vi.mocked(fsPromises.readFile);
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const result = await cacheManager.loadJSON('/missing.json');
      expect(result).toBeNull();
    });
  });

  describe('invalidate', () => {
    it('should clear all cache when no pattern provided', async () => {
      const loader = vi.fn().mockResolvedValue('data');

      await cacheManager.getOrLoad('key1', loader);
      await cacheManager.getOrLoad('key2', loader);

      cacheManager.invalidate();

      // Should reload after invalidation
      await cacheManager.getOrLoad('key1', loader);
      await cacheManager.getOrLoad('key2', loader);

      expect(loader).toHaveBeenCalledTimes(4); // 2 initial + 2 after invalidation
    });

    it('should clear cache matching pattern', async () => {
      const loader1 = vi.fn().mockResolvedValue('data1');
      const loader2 = vi.fn().mockResolvedValue('data2');

      await cacheManager.getOrLoad('file:test.txt', loader1);
      await cacheManager.getOrLoad('json:config.json', loader2);

      cacheManager.invalidate('file:.*');

      // File cache should be invalidated
      await cacheManager.getOrLoad('file:test.txt', loader1);
      expect(loader1).toHaveBeenCalledTimes(2);

      // JSON cache should remain
      await cacheManager.getOrLoad('json:config.json', loader2);
      expect(loader2).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStats', () => {
    it('should track cache statistics', async () => {
      const loader = vi.fn().mockResolvedValue('data');

      // Create some cache activity
      await cacheManager.getOrLoad('key1', loader); // miss
      await cacheManager.getOrLoad('key1', loader); // hit
      await cacheManager.getOrLoad('key2', loader); // miss
      await cacheManager.getOrLoad('key2', loader); // hit

      const stats = cacheManager.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.size).toBe(2);
    });

    it('should calculate memory usage', async () => {
      const loader = vi.fn().mockResolvedValue({ large: 'x'.repeat(1000) });

      await cacheManager.getOrLoad('key', loader);

      const stats = cacheManager.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(1000);
    });
  });
});

describe('FeatureStateCache', () => {
  let featureCache: FeatureStateCache;
  let mockReadFile: any;
  let mockAccess: any;

  beforeEach(() => {
    (CacheManager as any).instance = undefined;
    featureCache = new FeatureStateCache();

    // mockExistsSync assignment removed - was unused
    mockReadFile = vi.mocked(fs.promises.readFile);
    mockAccess = vi.mocked(fs.promises.access);
  });

  describe('loadFeatureState', () => {
    it('should load complete feature state', async () => {
      // Mock file existence
      mockAccess
        .mockResolvedValueOnce(undefined) // explore dir exists
        .mockRejectedValueOnce(new Error()) // decision doesn't exist
        .mockResolvedValueOnce(undefined) // build exists
        .mockResolvedValueOnce(undefined) // harden exists
        .mockResolvedValueOnce(undefined) // validation exists
        .mockResolvedValueOnce(undefined); // issue-id exists

      // Mock file reads
      mockReadFile
        .mockResolvedValueOnce('{"tests": {"passed": true}, "build": {"passed": true}}' as any)
        .mockResolvedValueOnce('TEST-123' as any);

      const state = await featureCache.loadFeatureState('test-feature');

      expect(state).toMatchObject({
        hasExploration: true,
        hasDecision: false,
        hasBuild: true,
        hasHarden: true,
        isProductionReady: true,
        issueId: 'TEST-123',
      });
    });

    it('should handle missing feature gracefully', async () => {
      mockAccess.mockRejectedValue(new Error('Not found'));

      const state = await featureCache.loadFeatureState('missing-feature');

      expect(state).toMatchObject({
        hasExploration: false,
        hasDecision: false,
        hasBuild: false,
        hasHarden: false,
        isProductionReady: false,
        issueId: null,
        validation: null,
      });
    });
  });
});

describe('StandardsCache', () => {
  let standardsCache: StandardsCache;
  let mockExistsSync: any;
  let mockReadFile: any;
  let mockReaddir: any;

  beforeEach(() => {
    (CacheManager as any).instance = undefined;
    standardsCache = new StandardsCache();

    mockExistsSync = vi.mocked(fs.existsSync);
    mockReadFile = vi.mocked(fs.promises.readFile);
    mockReaddir = vi.mocked(fs.promises.readdir);
  });

  describe('loadStandards', () => {
    it('should load standards file', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFile.mockResolvedValue('# Standards\n- Use TypeScript' as any);

      const standards = await standardsCache.loadStandards();
      expect(standards).toBe('# Standards\n- Use TypeScript');
    });

    it('should return null if standards file missing', async () => {
      mockExistsSync.mockReturnValue(false);

      const standards = await standardsCache.loadStandards();
      expect(standards).toBeNull();
    });
  });

  describe('loadPatterns', () => {
    it('should load all pattern files', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockResolvedValue(['pattern1.md', 'pattern2.md'] as any);
      mockReadFile
        .mockResolvedValueOnce('Pattern 1 content' as any)
        .mockResolvedValueOnce('Pattern 2 content' as any);

      const patterns = await standardsCache.loadPatterns();

      expect(patterns.get('pattern1')).toBe('Pattern 1 content');
      expect(patterns.get('pattern2')).toBe('Pattern 2 content');
      expect(patterns.size).toBe(2);
    });

    it('should return empty map if patterns directory missing', async () => {
      mockExistsSync.mockReturnValue(false);

      const patterns = await standardsCache.loadPatterns();
      expect(patterns.size).toBe(0);
    });
  });

  describe('loadConfig', () => {
    it('should load and parse config JSON', async () => {
      mockReadFile.mockResolvedValue('{"version": "1.0.0"}' as any);

      const config = await standardsCache.loadConfig();
      expect(config).toEqual({ version: '1.0.0' });
    });

    it('should return null for missing config', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const config = await standardsCache.loadConfig();
      expect(config).toBeNull();
    });
  });
});
