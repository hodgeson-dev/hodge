/**
 * Unit tests for PatternLearner
 * Ensures production-ready pattern extraction and learning
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { PatternLearner, CodePattern, LearningResult } from './pattern-learner';

// Mock fs and child_process
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('PatternLearner', () => {
  let learner: PatternLearner;

  beforeEach(() => {
    learner = new PatternLearner();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeShippedCode', () => {
    it('should analyze files and extract patterns', async () => {
      const mockExistsSync = vi.mocked(require('fs').existsSync);
      const mockReadFile = vi.mocked(fs.readFile);
      const mockWriteFile = vi.mocked(fs.writeFile);
      const mockMkdir = vi.mocked(fs.mkdir);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      // Mock git diff to return test files
      mockExecSync.mockReturnValue('src/test-file.ts\nsrc/another-file.js\n');

      // Mock file content with patterns
      const fileContent = `
        class UserService {
          private static instance: UserService;

          static getInstance() {
            if (!UserService.instance) {
              UserService.instance = new UserService();
            }
            return UserService.instance;
          }

          async fetchUsers() {
            try {
              const [users, profiles] = await Promise.all([
                this.getUsers(),
                this.getProfiles()
              ]);
              return { users, profiles };
            } catch (error) {
              console.error('Failed to fetch users:', error);
              throw error;
            }
          }

          validateInput(input: any) {
            if (!input) {
              throw new Error('Input is required');
            }
            if (!input.email) {
              throw new Error('Email is required');
            }
          }
        }
      `;

      mockReadFile.mockResolvedValue(fileContent);
      mockExistsSync.mockReturnValue(true);

      const result = await learner.analyzeShippedCode('test-feature');

      expect(result.statistics.filesAnalyzed).toBe(2);
      expect(result.patterns.length).toBeGreaterThan(0);

      // Should detect Singleton pattern
      const singletonPattern = result.patterns.find(p => p.name === 'Singleton Pattern');
      expect(singletonPattern).toBeDefined();
      expect(singletonPattern?.frequency).toBeGreaterThan(0);

      // Should detect async parallel operations
      const parallelPattern = result.patterns.find(p => p.name === 'Async Parallel Operations');
      expect(parallelPattern).toBeDefined();

      // Should detect error handling
      const errorPattern = result.patterns.find(p => p.name === 'Error Boundary');
      expect(errorPattern).toBeDefined();

      // Should detect input validation
      const validationPattern = result.patterns.find(p => p.name === 'Input Validation');
      expect(validationPattern).toBeDefined();

      // Should save patterns
      expect(mockMkdir).toHaveBeenCalledWith('.hodge/patterns', { recursive: true });
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('should handle file read errors gracefully', async () => {
      const mockExecSync = vi.mocked(require('child_process').execSync);
      const mockReadFile = vi.mocked(fs.readFile);

      mockExecSync.mockReturnValue('src/error-file.ts\n');
      mockReadFile.mockRejectedValue(new Error('File read error'));

      const result = await learner.analyzeShippedCode('error-feature');

      expect(result.statistics.filesAnalyzed).toBe(1);
      expect(result.patterns.length).toBe(0);
      expect(result.statistics.patternsFound).toBe(0);
    });

    it('should fall back to src directory when git fails', async () => {
      const mockExecSync = vi.mocked(require('child_process').execSync);
      const mockReaddir = vi.mocked(fs.readdir);
      const mockExistsSync = vi.mocked(require('fs').existsSync);

      mockExecSync.mockImplementation(() => {
        throw new Error('Git not available');
      });

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockResolvedValue([
        { name: 'file1.ts', isDirectory: () => false, isFile: () => true },
        { name: 'file2.js', isDirectory: () => false, isFile: () => true },
        { name: 'test.spec.ts', isDirectory: () => false, isFile: () => true },
      ] as any);

      const result = await learner.analyzeShippedCode('fallback-feature');

      // Should analyze non-test files
      expect(result.statistics.filesAnalyzed).toBe(2);
    });
  });

  describe('pattern detection', () => {
    it('should detect singleton pattern', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      mockExecSync.mockReturnValue('src/singleton.ts\n');
      mockReadFile.mockResolvedValue(`
        class CacheManager {
          private static instance: CacheManager;

          static getInstance(): CacheManager {
            if (!CacheManager.instance) {
              CacheManager.instance = new CacheManager();
            }
            return CacheManager.instance;
          }
        }
      `);

      const result = await learner.analyzeShippedCode('singleton-test');

      const singleton = result.patterns.find(p => p.name === 'Singleton Pattern');
      expect(singleton).toBeDefined();
      expect(singleton?.category).toBe('architecture');
      expect(singleton?.frequency).toBeGreaterThan(0);
    });

    it('should detect error handling patterns', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      mockExecSync.mockReturnValue('src/error-handler.ts\n');
      mockReadFile.mockResolvedValue(`
        async function processData(data: any) {
          try {
            const result = await transform(data);
            return result;
          } catch (error) {
            console.error('Processing failed:', error);
            throw new ProcessingError('Failed to process data', error);
          }
        }
      `);

      const result = await learner.analyzeShippedCode('error-test');

      const errorPattern = result.patterns.find(p => p.name === 'Error Boundary');
      expect(errorPattern).toBeDefined();
      expect(errorPattern?.category).toBe('error-handling');
    });

    it('should detect performance patterns', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      mockExecSync.mockReturnValue('src/performance.ts\n');
      mockReadFile.mockResolvedValue(`
        async function loadData() {
          const [users, posts, comments] = await Promise.all([
            fetchUsers(),
            fetchPosts(),
            fetchComments()
          ]);

          return { users, posts, comments };
        }

        const cache = new Map();
        function getCached(key: string) {
          if (cache.has(key)) {
            return cache.get(key);
          }
          const value = compute(key);
          cache.set(key, value);
          return value;
        }
      `);

      const result = await learner.analyzeShippedCode('perf-test');

      const parallelPattern = result.patterns.find(p => p.name === 'Async Parallel Operations');
      expect(parallelPattern).toBeDefined();
      expect(parallelPattern?.category).toBe('performance');

      const cachePattern = result.patterns.find(p => p.name === 'Caching Strategy');
      expect(cachePattern).toBeDefined();
      expect(cachePattern?.category).toBe('performance');
    });
  });

  describe('standards detection', () => {
    it('should detect TypeScript usage', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      mockExecSync.mockReturnValue('src/typed.ts\n');
      mockReadFile.mockResolvedValue(`
        interface User {
          id: string;
          name: string;
          email: string;
        }

        type UserRole = 'admin' | 'user' | 'guest';

        class UserService {
          async getUser(id: string): Promise<User> {
            return fetchUser(id);
          }
        }
      `);

      const result = await learner.analyzeShippedCode('typescript-test');

      const tsStandard = result.standards.find(s => s.name === 'TypeScript Strict Mode');
      expect(tsStandard).toBeDefined();
      expect(tsStandard?.level).toBe('strict');
    });

    it('should detect JSDoc documentation', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      mockExecSync.mockReturnValue('src/documented.ts\n');
      mockReadFile.mockResolvedValue(`
        /**
         * User service for managing users
         * @class UserService
         */
        export class UserService {
          /**
           * Get user by ID
           * @param {string} id - User ID
           * @returns {Promise<User>} User object
           */
          async getUser(id: string): Promise<User> {
            return fetchUser(id);
          }
        }
      `);

      const result = await learner.analyzeShippedCode('jsdoc-test');

      const jsdocStandard = result.standards.find(s => s.name === 'JSDoc Comments');
      expect(jsdocStandard).toBeDefined();
      expect(jsdocStandard?.level).toBe('recommended');
    });
  });

  describe('recommendations generation', () => {
    it('should generate recommendations based on patterns', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      // Create multiple files with repeated patterns
      mockExecSync.mockReturnValue('file1.ts\nfile2.ts\nfile3.ts\nfile4.ts\n');

      const singletonCode = `
        class Service {
          private static instance: Service;
          static getInstance() {
            if (!Service.instance) {
              Service.instance = new Service();
            }
            return Service.instance;
          }
        }
      `;

      mockReadFile.mockResolvedValue(singletonCode);

      const result = await learner.analyzeShippedCode('recommendation-test');

      expect(result.recommendations.length).toBeGreaterThan(0);

      // Should recommend frequently used patterns
      const singletonRec = result.recommendations.find(r =>
        r.includes('Singleton Pattern')
      );
      expect(singletonRec).toBeDefined();
    });

    it('should recommend missing important patterns', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      mockExecSync.mockReturnValue('src/basic.ts\n');
      mockReadFile.mockResolvedValue(`
        function processData(data: any) {
          return transform(data);
        }
      `);

      const result = await learner.analyzeShippedCode('basic-test');

      // Should recommend error handling
      const errorRec = result.recommendations.find(r =>
        r.toLowerCase().includes('error handling')
      );
      expect(errorRec).toBeDefined();
    });
  });

  describe('confidence calculation', () => {
    it('should calculate confidence based on pattern frequency', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      // Multiple files with same pattern
      mockExecSync.mockReturnValue('f1.ts\nf2.ts\nf3.ts\n');

      const patternCode = `
        try {
          await doSomething();
        } catch (error) {
          console.error('Error:', error);
        }
      `;

      mockReadFile.mockResolvedValue(patternCode);

      const result = await learner.analyzeShippedCode('confidence-test');

      const errorPattern = result.patterns.find(p => p.name === 'Error Boundary');
      expect(errorPattern).toBeDefined();
      expect(errorPattern?.frequency).toBe(3);
      expect(errorPattern?.metadata.confidence).toBeGreaterThanOrEqual(60);
    });

    it('should have low confidence for rare patterns', async () => {
      const mockReadFile = vi.mocked(fs.readFile);
      const mockExecSync = vi.mocked(require('child_process').execSync);

      mockExecSync.mockReturnValue('single.ts\n');
      mockReadFile.mockResolvedValue(`
        class Factory {
          static create() {
            return new Product();
          }
        }
      `);

      const result = await learner.analyzeShippedCode('rare-test');

      const factoryPattern = result.patterns.find(p => p.name === 'Factory Pattern');
      if (factoryPattern) {
        expect(factoryPattern.frequency).toBe(1);
        expect(factoryPattern.metadata.confidence).toBeLessThan(60);
      }
    });
  });

  describe('loadExistingPatterns', () => {
    it('should load patterns from filesystem', async () => {
      const mockExistsSync = vi.mocked(require('fs').existsSync);
      const mockReaddir = vi.mocked(fs.readdir);
      const mockReadFile = vi.mocked(fs.readFile);

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockResolvedValue(['singleton-pattern.md', 'factory-pattern.md']);
      mockReadFile.mockResolvedValue(`# Singleton Pattern

**Category**: architecture
**Frequency**: Used 5 times
**Confidence**: 100%

## Description
Singleton pattern for managing global instances
      `);

      const patterns = await learner.loadExistingPatterns();

      expect(patterns.length).toBe(2);
      expect(patterns[0].name).toBe('Singleton Pattern');
      expect(patterns[0].category).toBe('general'); // Default in simplified loading
    });

    it('should return empty array if patterns directory missing', async () => {
      const mockExistsSync = vi.mocked(require('fs').existsSync);

      mockExistsSync.mockReturnValue(false);

      const patterns = await learner.loadExistingPatterns();

      expect(patterns).toEqual([]);
    });
  });
});