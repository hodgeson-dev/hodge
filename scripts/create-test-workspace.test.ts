/**
 * @fileoverview Unit tests for the test workspace generator
 *
 * These tests ensure that the test workspace generator follows all standards,
 * handles errors properly, validates inputs, and creates workspaces correctly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { TestWorkspaceGenerator, createTestWorkspace } from './create-test-workspace';

// Mock external dependencies
vi.mock('fs-extra');
vi.mock('os');
vi.mock('path');

const mockedFs = vi.mocked(fs);
const mockedOs = vi.mocked(os);
const mockedPath = vi.mocked(path);

describe('TestWorkspaceGenerator', () => {
  let generator: TestWorkspaceGenerator;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    generator = new TestWorkspaceGenerator();

    // Mock console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    };

    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementations
    mockedOs.tmpdir.mockReturnValue('/tmp');
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedPath.resolve.mockImplementation((p) => (p.startsWith('/') ? p : `/current/${p}`));
    mockedPath.isAbsolute.mockImplementation((p) => p.startsWith('/'));
    mockedFs.ensureDir.mockResolvedValue(undefined);
    mockedFs.writeJson.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration Validation', () => {
    it('should reject configuration with relative baseDir', async () => {
      const config = {
        baseDir: './relative/path',
      };

      const result = await generator.createTestWorkspace(config);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ValidationError');
        expect(result.error.message).toContain('absolute');
      }
    });

    it('should reject configuration with path traversal in baseDir', async () => {
      const config = {
        baseDir: '/valid/../path',
      };

      const result = await generator.createTestWorkspace(config);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ValidationError');
        expect(result.error.message).toContain('..');
      }
    });

    it('should reject configuration with invalid namePrefix', async () => {
      const config = {
        namePrefix: 'invalid name with spaces!',
      };

      const result = await generator.createTestWorkspace(config);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ValidationError');
        expect(result.error.message).toContain('alphanumeric');
      }
    });

    it('should use default values for optional configuration', async () => {
      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(true);

      // Verify default behavior - should create TypeScript and JavaScript files
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('UserService.ts'),
        expect.any(String)
      );
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('sample.js'),
        expect.any(String)
      );
    });
  });

  describe('Security Validation', () => {
    it('should prevent path traversal attacks', async () => {
      mockedPath.resolve.mockReturnValue('/tmp/../../../etc/passwd');

      const result = await generator.createTestWorkspace({
        baseDir: '/tmp/../../../etc',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ValidationError');
      }
    });

    it('should sanitize file names properly', async () => {
      const config = {
        namePrefix: 'test-workspace-with-special-chars',
      };

      const result = await generator.createTestWorkspace(config);

      // Should succeed with valid name
      expect(result.success).toBe(true);

      // Verify that the path doesn't contain special characters
      if (result.success) {
        expect(result.data.path).not.toMatch(/[<>|*?]/);
      }
    });

    it('should reject paths containing null bytes', async () => {
      // This test would need to be adjusted based on how we handle the security validation
      // in the actual path generation process
      mockedPath.join.mockReturnValue('/tmp/workspace\0malicious');

      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(false);
    });

    it('should validate workspace path is within allowed directories', async () => {
      mockedOs.tmpdir.mockReturnValue('/tmp');
      mockedPath.resolve.mockReturnValue('/outside/allowed/directories');

      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('SecurityError');
        expect(result.error.message).toContain('outside of allowed directories');
      }
    });
  });

  describe('File Generation', () => {
    it('should create all required files by default', async () => {
      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(true);

      if (result.success) {
        const expectedFiles = [
          'package.json',
          'src/sample.js',
          'src/UserService.ts',
          'README.md',
          '.gitignore',
        ];

        expect(result.data.files).toEqual(expect.arrayContaining(expectedFiles));
        expect(result.data.files).toHaveLength(expectedFiles.length);
      }
    });

    it('should create only JavaScript files when TypeScript is disabled', async () => {
      const config = {
        includeTypeScript: false,
        includeJavaScript: true,
      };

      const result = await generator.createTestWorkspace(config);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.files).toContain('src/sample.js');
        expect(result.data.files).not.toContain('src/UserService.ts');
      }
    });

    it('should create only TypeScript files when JavaScript is disabled', async () => {
      const config = {
        includeTypeScript: true,
        includeJavaScript: false,
      };

      const result = await generator.createTestWorkspace(config);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.files).toContain('src/UserService.ts');
        expect(result.data.files).not.toContain('src/sample.js');
      }
    });

    it('should create valid package.json content', async () => {
      await generator.createTestWorkspace();

      expect(mockedFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          name: 'hodge-test-workspace',
          version: '1.0.0',
          description: 'Test workspace for Hodge development',
          scripts: expect.objectContaining({
            test: expect.any(String),
            lint: expect.any(String),
            format: expect.any(String),
          }),
          keywords: expect.arrayContaining(['hodge', 'test', 'workspace']),
          author: 'Hodge Development Team',
          license: 'MIT',
        }),
        { spaces: 2 }
      );
    });

    it('should generate valid TypeScript content with proper types', async () => {
      await generator.createTestWorkspace({ includeTypeScript: true });

      const tsCall = mockedFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes('UserService.ts')
      );

      expect(tsCall).toBeDefined();
      expect(tsCall![1]).toContain('export interface User');
      expect(tsCall![1]).toContain('export type Result<T, E = Error>');
      expect(tsCall![1]).toContain('export class UserService');
      expect(tsCall![1]).toContain('readonly');
    });

    it('should generate valid JavaScript content with JSDoc', async () => {
      await generator.createTestWorkspace({ includeJavaScript: true });

      const jsCall = mockedFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes('sample.js')
      );

      expect(jsCall).toBeDefined();
      expect(jsCall![1]).toContain('/**');
      expect(jsCall![1]).toContain('@param');
      expect(jsCall![1]).toContain('@returns');
      expect(jsCall![1]).toContain('module.exports');
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockedFs.ensureDir.mockRejectedValue(new Error('Permission denied'));

      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('WorkspaceCreationError');
        expect(result.error.message).toContain('workspace directory');
      }
    });

    it('should handle JSON writing errors', async () => {
      mockedFs.writeJson.mockRejectedValue(new Error('Disk full'));

      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('WorkspaceCreationError');
        expect(result.error.message).toContain('package.json');
      }
    });

    it('should handle file writing errors', async () => {
      mockedFs.writeFile.mockRejectedValue(new Error('Write failed'));

      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('WorkspaceCreationError');
      }
    });

    it('should provide meaningful error messages with context', async () => {
      const originalError = new Error('Original file system error');
      mockedFs.ensureDir.mockRejectedValue(originalError);

      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.cause).toBe(originalError);
        expect(result.error.message).toContain('workspace directory');
      }
    });
  });

  describe('Logging', () => {
    it('should log workspace creation start', async () => {
      await generator.createTestWorkspace();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('🚀 Starting test workspace creation'),
        expect.any(String)
      );
    });

    it('should log success message with workspace details', async () => {
      const result = await generator.createTestWorkspace();

      expect(result.success).toBe(true);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ Test workspace created successfully'),
        expect.any(String)
      );
    });

    it('should log debug information in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await generator.createTestWorkspace();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        expect.any(String)
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug information in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await generator.createTestWorkspace();

      const debugCalls = consoleSpy.log.mock.calls.filter((call) =>
        call[0]?.toString().includes('[DEBUG]')
      );
      expect(debugCalls).toHaveLength(0);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Usage Instructions', () => {
    it('should display comprehensive usage instructions', () => {
      const workspaceInfo = {
        path: '/tmp/test-workspace',
        files: ['package.json', 'src/sample.js', 'README.md'],
        createdAt: new Date(),
      };

      generator.displayUsageInstructions(workspaceInfo);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Test workspace created successfully!')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('/tmp/test-workspace'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Files created: 3'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('hodge init'));
    });
  });
});

describe('createTestWorkspace Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Default mock implementations
    mockedOs.tmpdir.mockReturnValue('/tmp');
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedPath.resolve.mockImplementation((p) => (p.startsWith('/') ? p : `/current/${p}`));
    mockedPath.isAbsolute.mockImplementation((p) => p.startsWith('/'));
    mockedFs.ensureDir.mockResolvedValue(undefined);
    mockedFs.writeJson.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create workspace with default configuration', async () => {
    const result = await createTestWorkspace();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        path: expect.any(String),
        files: expect.any(Array),
        createdAt: expect.any(Date),
      });
    }
  });

  it('should create workspace with custom configuration', async () => {
    const config = {
      namePrefix: 'custom-test',
      includeTypeScript: false,
    };

    const result = await createTestWorkspace(config);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).not.toContain('src/UserService.ts');
      expect(result.data.files).toContain('src/sample.js');
    }
  });

  it('should handle errors from generator', async () => {
    mockedFs.ensureDir.mockRejectedValue(new Error('File system error'));

    const result = await createTestWorkspace();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
    }
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // More realistic mock implementations for integration tests
    mockedOs.tmpdir.mockReturnValue('/tmp');
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedPath.resolve.mockImplementation((p) => {
      if (p.startsWith('/')) return p;
      return `/current/working/directory/${p}`;
    });
    mockedPath.isAbsolute.mockImplementation((p) => p.startsWith('/'));
    mockedFs.ensureDir.mockResolvedValue(undefined);
    mockedFs.writeJson.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a complete workspace with all components', async () => {
    const result = await createTestWorkspace({
      namePrefix: 'integration-test',
      includeTypeScript: true,
      includeJavaScript: true,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      // Verify workspace structure
      expect(result.data.path).toContain('integration-test');
      expect(result.data.files).toHaveLength(5);

      // Verify all expected files are created
      const expectedFiles = [
        'package.json',
        'src/sample.js',
        'src/UserService.ts',
        'README.md',
        '.gitignore',
      ];

      for (const file of expectedFiles) {
        expect(result.data.files).toContain(file);
      }

      // Verify directory creation
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('integration-test'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('src'));

      // Verify file creation calls
      expect(mockedFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.any(Object),
        { spaces: 2 }
      );

      expect(mockedFs.writeFile).toHaveBeenCalledTimes(4); // JS, TS, README, .gitignore
    }
  });
});

describe('Edge Cases and Boundary Conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Default mocks
    mockedOs.tmpdir.mockReturnValue('/tmp');
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedPath.resolve.mockImplementation((p) => (p.startsWith('/') ? p : `/current/${p}`));
    mockedPath.isAbsolute.mockImplementation((p) => p.startsWith('/'));
    mockedFs.ensureDir.mockResolvedValue(undefined);
    mockedFs.writeJson.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle empty configuration object', async () => {
    const result = await createTestWorkspace({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toContain('src/sample.js');
      expect(result.data.files).toContain('src/UserService.ts');
    }
  });

  it('should handle configuration with all options disabled', async () => {
    const config = {
      includeTypeScript: false,
      includeJavaScript: false,
    };

    const result = await createTestWorkspace(config);

    expect(result.success).toBe(true);
    if (result.success) {
      // Should still create package.json, README, and .gitignore
      expect(result.data.files).toContain('package.json');
      expect(result.data.files).toContain('README.md');
      expect(result.data.files).toContain('.gitignore');
      expect(result.data.files).not.toContain('src/sample.js');
      expect(result.data.files).not.toContain('src/UserService.ts');
    }
  });

  it('should generate unique workspace paths for concurrent calls', async () => {
    const results = await Promise.all([
      createTestWorkspace({ namePrefix: 'concurrent-1' }),
      createTestWorkspace({ namePrefix: 'concurrent-2' }),
      createTestWorkspace({ namePrefix: 'concurrent-3' }),
    ]);

    for (const result of results) {
      expect(result.success).toBe(true);
    }

    // Extract paths and verify they're unique
    const paths = results
      .filter((r): r is { success: true; data: any } => r.success)
      .map((r) => r.data.path);

    expect(new Set(paths)).toHaveLength(3);
  });

  it('should handle very long namePrefix gracefully', async () => {
    const longPrefix = 'a'.repeat(200);

    const result = await createTestWorkspace({ namePrefix: longPrefix });

    expect(result.success).toBe(true);
    // The system should handle this gracefully, possibly by truncating or sanitizing
  });
});
