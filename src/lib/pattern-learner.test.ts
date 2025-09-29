/**
 * Unit tests for PatternLearner
 * Ensures production-ready pattern extraction and learning
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PatternLearner, CodePattern, LearningResult } from './pattern-learner';
import * as fs from 'fs';
import * as childProcess from 'child_process';

// Mock modules
vi.mock('fs');
vi.mock('child_process');

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
      const mockExistsSync = vi.mocked(fs.existsSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);
      const mockExecSync = vi.mocked(childProcess.execSync);

      // Mock git diff to return non-test files
      mockExecSync.mockReturnValue('src/auth-manager.ts\nsrc/data-fetcher.js\n' as any);

      // Mock file content with patterns
      const fileContent = `
        class AuthManager {
          private static instance: AuthManager;

          static getInstance() {
            if (!this.instance) {
              this.instance = new AuthManager();
            }
            return this.instance;
          }
        }

        async function fetchData() {
          const [users, posts, comments] = await Promise.all([
            getUsers(),
            getPosts(),
            getComments()
          ]);
        }

        try {
          await performOperation();
        } catch (error) {
          console.error('Operation failed:', error);
        }

        function validateInput(input: string) {
          if (!input) {
            throw new Error('Input is required');
          }
        }
      `;

      mockReadFile.mockResolvedValue(fileContent);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('test-feature');

      expect(result.statistics.filesAnalyzed).toBe(2);
      expect(result.patterns.length).toBeGreaterThan(0);

      // Should detect Singleton pattern
      const singletonPattern = result.patterns.find((p) => p.name === 'Singleton Pattern');
      expect(singletonPattern).toBeDefined();
      expect(singletonPattern?.frequency).toBeGreaterThan(0);

      // Should detect async parallel operations
      const parallelPattern = result.patterns.find((p) => p.name === 'Async Parallel Operations');
      expect(parallelPattern).toBeDefined();

      // Should detect error handling
      const errorPattern = result.patterns.find((p) => p.name === 'Error Boundary');
      expect(errorPattern).toBeDefined();

      // Should detect input validation
      const validationPattern = result.patterns.find((p) => p.name === 'Input Validation');
      expect(validationPattern).toBeDefined();

      // Should save patterns
      expect(mockMkdir).toHaveBeenCalledWith('.hodge/patterns', { recursive: true });
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('should handle file read errors gracefully', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);

      mockExecSync.mockReturnValue('src/error-file.ts\n' as any);
      mockReadFile.mockRejectedValue(new Error('File read error'));

      const result = await learner.analyzeShippedCode('test-feature');

      expect(result.statistics.filesAnalyzed).toBe(1);
      expect(result.patterns.length).toBe(0);
    });

    it('should fall back to src directory when git fails', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockExistsSync = vi.mocked(fs.existsSync);
      const mockReaddir = vi.mocked(fs.promises.readdir);
      const mockReadFile = vi.mocked(fs.promises.readFile);

      // Git fails
      mockExecSync.mockImplementation(() => {
        throw new Error('Git error');
      });

      // Mock src directory exists
      mockExistsSync.mockReturnValue(true);

      // Mock directory contents
      mockReaddir.mockResolvedValue([
        { name: 'file1.ts', isDirectory: () => false, isFile: () => true },
        { name: 'file2.js', isDirectory: () => false, isFile: () => true },
        { name: 'test.spec.ts', isDirectory: () => false, isFile: () => true },
      ] as any);

      mockReadFile.mockResolvedValue('const x = 1;');

      const result = await learner.analyzeShippedCode('test-feature');

      // Should only analyze non-test files
      expect(result.statistics.filesAnalyzed).toBe(2);
    });
  });

  describe('pattern detection', () => {
    it('should detect singleton pattern', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/singleton.ts\n' as any);

      const singletonCode = `
        class DatabaseConnection {
          private static instance: DatabaseConnection;

          private constructor() {}

          static getInstance(): DatabaseConnection {
            if (!this.instance) {
              this.instance = new DatabaseConnection();
            }
            return this.instance;
          }
        }
      `;

      mockReadFile.mockResolvedValue(singletonCode);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('singleton-feature');

      const singleton = result.patterns.find((p) => p.name === 'Singleton Pattern');
      expect(singleton).toBeDefined();
      expect(singleton?.category).toBe('architecture');
    });

    it('should detect error handling patterns', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/error-handler.ts\n' as any);

      const errorCode = `
        async function processData() {
          try {
            const data = await fetchData();
            return processData(data);
          } catch (error) {
            console.error('Failed to process data:', error);
            throw error;
          }
        }

        fetchPromise()
          .then(result => handleResult(result))
          .catch(error => {
            console.error('Promise failed:', error);
          });
      `;

      mockReadFile.mockResolvedValue(errorCode);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('error-feature');

      const errorPattern = result.patterns.find((p) => p.name === 'Error Boundary');
      expect(errorPattern).toBeDefined();
      expect(errorPattern?.category).toBe('error-handling');
    });

    it('should detect performance patterns', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/performance.ts\n' as any);

      const perfCode = `
        async function loadAllData() {
          const [users, posts, comments] = await Promise.all([
            fetchUsers(),
            fetchPosts(),
            fetchComments()
          ]);

          return { users, posts, comments };
        }

        const cache = new Map();

        function getCachedData(key: string) {
          if (cache.has(key)) {
            return cache.get(key);
          }

          const data = computeExpensiveData(key);
          cache.set(key, data);
          return data;
        }
      `;

      mockReadFile.mockResolvedValue(perfCode);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('performance-feature');

      const parallelPattern = result.patterns.find((p) => p.name === 'Async Parallel Operations');
      expect(parallelPattern).toBeDefined();
      expect(parallelPattern?.category).toBe('performance');

      const cachePattern = result.patterns.find((p) => p.name === 'Caching Strategy');
      expect(cachePattern).toBeDefined();
      expect(cachePattern?.category).toBe('performance');
    });
  });

  describe('standards detection', () => {
    it('should detect TypeScript usage', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/typed.ts\n' as any);

      const typedCode = `
        interface User {
          id: string;
          name: string;
          email: string;
        }

        type UserRole = 'admin' | 'user' | 'guest';

        function getUser(id: string): User {
          return { id, name: 'John', email: 'john@example.com' };
        }
      `;

      mockReadFile.mockResolvedValue(typedCode);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('typed-feature');

      const tsStandard = result.standards.find((s) => s.name === 'TypeScript Strict Mode');
      expect(tsStandard).toBeDefined();
      expect(tsStandard?.level).toBe('strict');
    });

    it('should detect JSDoc documentation', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/documented.ts\n' as any);

      const documentedCode = `
        /**
         * Calculates the sum of two numbers
         * @param a First number
         * @param b Second number
         * @returns The sum of a and b
         */
        export function add(a: number, b: number): number {
          return a + b;
        }

        /**
         * User service for managing users
         */
        export class UserService {
          /**
           * Gets a user by ID
           */
          getUser(id: string) {
            // Implementation
          }
        }
      `;

      mockReadFile.mockResolvedValue(documentedCode);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('documented-feature');

      const jsdocStandard = result.standards.find((s) => s.name === 'JSDoc Comments');
      expect(jsdocStandard).toBeDefined();
      expect(jsdocStandard?.level).toBe('recommended');
    });
  });

  describe('recommendations generation', () => {
    it('should generate recommendations based on patterns', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/file1.ts\nsrc/file2.ts\nsrc/file3.ts\n' as any);

      // Code with repeated singleton pattern (high frequency)
      const codeWithPattern = `
        class Manager {
          private static instance: Manager;
          static getInstance() {
            if (!this.instance) {
              this.instance = new Manager();
            }
            return this.instance;
          }
        }
      `;

      mockReadFile.mockResolvedValue(codeWithPattern);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('pattern-heavy-feature');

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);

      // Should recommend using frequently used patterns
      const singletonRec = result.recommendations.find((r) => r.includes('Singleton Pattern'));
      expect(singletonRec).toBeDefined();
    });

    it('should recommend missing important patterns', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/basic.ts\n' as any);

      // Basic code without error handling or caching
      const basicCode = `
        function getData() {
          return fetchFromAPI();
        }

        function processData(data: any) {
          return data.map(item => item.value);
        }
      `;

      mockReadFile.mockResolvedValue(basicCode);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('basic-feature');

      // Should recommend implementing error handling
      const errorRec = result.recommendations.find((r) =>
        r.toLowerCase().includes('error handling')
      );
      expect(errorRec).toBeDefined();
    });
  });

  describe('confidence calculation', () => {
    it('should calculate confidence based on pattern frequency', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      // Multiple files to increase pattern frequency
      mockExecSync.mockReturnValue(
        'src/file1.ts\nsrc/file2.ts\nsrc/file3.ts\nsrc/file4.ts\n' as any
      );

      const codeWithPatterns = `
        class Service {
          private static instance: Service;
          static getInstance() { return this.instance; }
        }

        await Promise.all([fetch1(), fetch2()]);

        try { doSomething(); } catch (e) { console.error(e); }
      `;

      mockReadFile.mockResolvedValue(codeWithPatterns);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('confident-feature');

      expect(result.statistics.confidence).toBeGreaterThan(0);
      expect(result.statistics.confidence).toBeLessThanOrEqual(100);
    });

    it('should have low confidence for rare patterns', async () => {
      const mockExecSync = vi.mocked(childProcess.execSync);
      const mockReadFile = vi.mocked(fs.promises.readFile);
      const mockWriteFile = vi.mocked(fs.promises.writeFile);
      const mockMkdir = vi.mocked(fs.promises.mkdir);

      mockExecSync.mockReturnValue('src/single.ts\n' as any);

      const simpleCode = `const x = 1; const y = 2;`;

      mockReadFile.mockResolvedValue(simpleCode);
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      const result = await learner.analyzeShippedCode('simple-feature');

      expect(result.statistics.confidence).toBeLessThan(50);
    });
  });

  describe('loadExistingPatterns', () => {
    it('should load patterns from filesystem', async () => {
      const mockExistsSync = vi.mocked(fs.existsSync);
      const mockReaddir = vi.mocked(fs.promises.readdir);
      const mockReadFile = vi.mocked(fs.promises.readFile);

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockResolvedValue([
        'singleton-pattern.md',
        'factory-pattern.md',
        'learned-patterns.md',
      ] as any);

      const patternContent = `# Singleton Pattern

**Category**: architecture
**Frequency**: Used 5 times
**Confidence**: 80%

## Description
Singleton pattern for managing global instances`;

      mockReadFile.mockResolvedValue(patternContent);

      const patterns = await learner.loadExistingPatterns();

      expect(patterns.length).toBe(2); // Should exclude learned-patterns.md
      expect(patterns[0].name).toBe('Singleton Pattern');
      expect(patterns[0].metadata.confidence).toBe(80);
    });

    it('should return empty array if patterns directory missing', async () => {
      const mockExistsSync = vi.mocked(fs.existsSync);

      mockExistsSync.mockReturnValue(false);

      const patterns = await learner.loadExistingPatterns();

      expect(patterns).toEqual([]);
    });
  });
});
