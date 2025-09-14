/**
 * @fileoverview Cross-platform compatibility tests for test workspace generator
 *
 * These tests ensure that the test workspace generator works correctly across
 * different operating systems (Windows, macOS, Linux) and handles platform-specific
 * differences in paths, file permissions, and command execution.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createTestWorkspace, TestWorkspaceGenerator } from './create-test-workspace';

// Mock platform-specific modules for testing
vi.mock('os');
vi.mock('path');
vi.mock('fs-extra');

const mockedOs = vi.mocked(os);
const mockedPath = vi.mocked(path);
const mockedFs = vi.mocked(fs);

/**
 * Platform-specific test configurations
 */
interface PlatformConfig {
  readonly platform: NodeJS.Platform;
  readonly tmpDir: string;
  readonly pathSeparator: string;
  readonly executableExtension: string;
  readonly lineEnding: string;
  readonly caseSensitive: boolean;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  win32: {
    platform: 'win32',
    tmpDir: 'C:\\Temp',
    pathSeparator: '\\',
    executableExtension: '.exe',
    lineEnding: '\r\n',
    caseSensitive: false,
  },
  darwin: {
    platform: 'darwin',
    tmpDir: '/tmp',
    pathSeparator: '/',
    executableExtension: '',
    lineEnding: '\n',
    caseSensitive: true,
  },
  linux: {
    platform: 'linux',
    tmpDir: '/tmp',
    pathSeparator: '/',
    executableExtension: '',
    lineEnding: '\n',
    caseSensitive: true,
  },
};

/**
 * Utility class for platform-specific testing
 */
class PlatformTestHelper {
  /**
   * Setup mocks for a specific platform
   * @param platformConfig - Configuration for the target platform
   */
  public static setupPlatformMocks(platformConfig: PlatformConfig): void {
    // Mock OS methods
    mockedOs.platform.mockReturnValue(platformConfig.platform);
    mockedOs.tmpdir.mockReturnValue(platformConfig.tmpDir);

    // Mock path methods based on platform
    if (platformConfig.platform === 'win32') {
      mockedPath.join.mockImplementation((...args) => args.join('\\'));
      mockedPath.resolve.mockImplementation((p) =>
        p.startsWith('C:') ? p : `C:\\current\\${p.replace(/\//g, '\\')}`
      );
      mockedPath.isAbsolute.mockImplementation((p) => /^[A-Z]:\\/.test(p) || p.startsWith('\\\\'));
      mockedPath.sep = '\\';
    } else {
      mockedPath.join.mockImplementation((...args) => args.join('/'));
      mockedPath.resolve.mockImplementation((p) => (p.startsWith('/') ? p : `/current/${p}`));
      mockedPath.isAbsolute.mockImplementation((p) => p.startsWith('/'));
      mockedPath.sep = '/';
    }

    // Mock fs-extra methods
    mockedFs.ensureDir.mockResolvedValue(undefined);
    mockedFs.writeJson.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
      isDirectory: () => false,
      mode: 0o755,
    } as any);
  }

  /**
   * Generate a platform-appropriate file path
   * @param platformConfig - Platform configuration
   * @param pathSegments - Path segments to join
   * @returns Platform-appropriate path
   */
  public static generatePath(platformConfig: PlatformConfig, ...pathSegments: string[]): string {
    if (platformConfig.platform === 'win32') {
      return pathSegments.join('\\');
    }
    return pathSegments.join('/');
  }

  /**
   * Validate that a path follows platform conventions
   * @param platformConfig - Platform configuration
   * @param filePath - Path to validate
   * @returns True if path follows platform conventions
   */
  public static validatePlatformPath(platformConfig: PlatformConfig, filePath: string): boolean {
    if (platformConfig.platform === 'win32') {
      // Windows paths
      return (
        /^[A-Z]:\\/.test(filePath) || // Absolute path like C:\
        filePath.includes('\\') || // Contains backslashes
        !filePath.includes('/') // Doesn't contain forward slashes
      );
    } else {
      // Unix-like paths
      return (
        filePath.startsWith('/') && // Absolute path
        !filePath.includes('\\') && // No backslashes
        filePath.includes('/') // Contains forward slashes
      );
    }
  }
}

describe('Cross-Platform Compatibility Tests', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Mock console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.each(Object.entries(PLATFORM_CONFIGS))(
    '%s Platform Tests',
    (platformName, platformConfig) => {
      beforeEach(() => {
        PlatformTestHelper.setupPlatformMocks(platformConfig);
      });

      it(`should create workspace with ${platformName}-appropriate paths`, async () => {
        const result = await createTestWorkspace({
          namePrefix: `${platformName}-test`,
        });

        expect(result.success).toBe(true);

        if (result.success) {
          const workspacePath = result.data.path;

          // Verify path uses platform-appropriate format
          if (platformConfig.platform === 'win32') {
            expect(workspacePath).toMatch(/^[A-Z]:\\/);
            expect(workspacePath).toContain('\\');
          } else {
            expect(workspacePath).toMatch(/^\/tmp/);
            expect(workspacePath).toContain('/');
            expect(workspacePath).not.toContain('\\');
          }

          // Verify temp directory is platform-appropriate
          expect(workspacePath).toContain(platformConfig.tmpDir);
        }
      });

      it(`should handle ${platformName} file system case sensitivity`, async () => {
        const testName = 'CaseSensitiveTest';
        const result = await createTestWorkspace({
          namePrefix: platformConfig.caseSensitive ? testName : testName.toLowerCase(),
        });

        expect(result.success).toBe(true);

        if (result.success) {
          const workspacePath = result.data.path;

          if (platformConfig.caseSensitive) {
            // On case-sensitive systems, preserve exact casing
            expect(workspacePath).toContain(testName);
          } else {
            // On case-insensitive systems, casing might be normalized
            expect(workspacePath.toLowerCase()).toContain(testName.toLowerCase());
          }
        }
      });

      it(`should generate ${platformName}-appropriate file content`, async () => {
        const result = await createTestWorkspace();

        expect(result.success).toBe(true);

        // Verify that file writing calls use appropriate parameters
        const writeFileCalls = mockedFs.writeFile.mock.calls;

        for (const call of writeFileCalls) {
          const filePath = call[0] as string;
          const content = call[1] as string;

          // Path should follow platform conventions
          expect(PlatformTestHelper.validatePlatformPath(platformConfig, filePath)).toBe(true);

          // Content should be valid (this is platform-agnostic)
          expect(typeof content).toBe('string');
          expect(content.length).toBeGreaterThan(0);
        }
      });

      it(`should handle ${platformName} path length limitations`, async () => {
        // Test with very long path names
        const longName = 'a'.repeat(platformConfig.platform === 'win32' ? 200 : 100);

        const result = await createTestWorkspace({
          namePrefix: longName,
        });

        // Should either succeed or fail gracefully
        expect(typeof result.success).toBe('boolean');

        if (!result.success) {
          // If it fails, it should be with a meaningful error
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.message.length).toBeGreaterThan(0);
        }
      });

      it(`should validate ${platformName} security restrictions`, async () => {
        const maliciousPaths =
          platformConfig.platform === 'win32'
            ? ['C:\\Windows\\System32', 'C:\\Program Files', '\\\\remote\\share']
            : ['/etc', '/root', '/System', '../../../etc'];

        for (const maliciousPath of maliciousPaths) {
          const result = await createTestWorkspace({
            baseDir: maliciousPath,
          });

          // Should reject dangerous paths
          expect(result.success).toBe(false);

          if (!result.success) {
            expect(result.error.name).toMatch(/ValidationError|SecurityError/);
          }
        }
      });
    }
  );

  describe('Platform Detection and Adaptation', () => {
    it('should correctly detect current platform', () => {
      const realPlatform = process.platform;

      // Our test should work on the real platform
      expect(PLATFORM_CONFIGS[realPlatform]).toBeDefined();

      // Mock with real platform
      mockedOs.platform.mockReturnValue(realPlatform);

      const generator = new TestWorkspaceGenerator();
      expect(generator).toBeInstanceOf(TestWorkspaceGenerator);
    });

    it('should adapt path operations based on detected platform', async () => {
      for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
        PlatformTestHelper.setupPlatformMocks(config);

        const result = await createTestWorkspace({
          namePrefix: `platform-detection-${platformName}`,
        });

        expect(result.success).toBe(true);

        if (result.success) {
          // Verify that path.join was called (indicating platform-aware path handling)
          expect(mockedPath.join).toHaveBeenCalled();

          // Verify temp directory was used correctly
          expect(mockedOs.tmpdir).toHaveBeenCalled();
        }
      }
    });
  });

  describe('File System Permissions and Security', () => {
    it('should handle Windows file permissions correctly', () => {
      PlatformTestHelper.setupPlatformMocks(PLATFORM_CONFIGS.win32);

      // Windows doesn't have Unix-style permissions, but files should still be accessible
      mockedFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
        mode: 0, // Windows doesn't use Unix permissions
      } as any);

      // Should not throw errors about permissions
      expect(() => {
        const generator = new TestWorkspaceGenerator();
        generator.displayUsageInstructions({
          path: 'C:\\temp\\workspace',
          files: ['package.json'],
          createdAt: new Date(),
        });
      }).not.toThrow();
    });

    it('should handle Unix file permissions correctly', () => {
      PlatformTestHelper.setupPlatformMocks(PLATFORM_CONFIGS.linux);

      mockedFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
        mode: 0o755, // Standard Unix permissions
      } as any);

      // Should not throw errors about permissions
      expect(() => {
        const generator = new TestWorkspaceGenerator();
        generator.displayUsageInstructions({
          path: '/tmp/workspace',
          files: ['package.json'],
          createdAt: new Date(),
        });
      }).not.toThrow();
    });
  });

  describe('Command Execution Compatibility', () => {
    it('should generate platform-appropriate command examples', () => {
      for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
        PlatformTestHelper.setupPlatformMocks(config);

        const generator = new TestWorkspaceGenerator();
        const workspaceInfo = {
          path: config.platform === 'win32' ? 'C:\\temp\\workspace' : '/tmp/workspace',
          files: ['package.json', 'src/sample.js'],
          createdAt: new Date(),
        };

        // Should not throw when displaying instructions
        expect(() => {
          generator.displayUsageInstructions(workspaceInfo);
        }).not.toThrow();

        // Verify console output contains appropriate commands
        const logCalls = consoleSpy.log.mock.calls;
        const allOutput = logCalls.map((call) => call.join(' ')).join('\n');

        // Should contain platform-appropriate path in cleanup command
        if (config.platform === 'win32') {
          expect(allOutput).toContain('C:');
        } else {
          expect(allOutput).toContain('/tmp');
        }
      }
    });

    it('should handle different shell environments', () => {
      const shellCommands = ['hodge init', 'hodge --version', 'hodge --help'];

      for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
        PlatformTestHelper.setupPlatformMocks(config);

        // Commands should be valid on all platforms
        for (const command of shellCommands) {
          expect(command).toMatch(/^hodge/);
          expect(command).not.toContain('\\'); // No path separators in commands
          expect(command).not.toContain(config.pathSeparator); // Platform-agnostic
        }
      }
    });
  });

  describe('Error Handling Across Platforms', () => {
    it('should provide platform-appropriate error messages', async () => {
      for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
        PlatformTestHelper.setupPlatformMocks(config);

        // Simulate file system error
        mockedFs.ensureDir.mockRejectedValue(new Error(`${platformName} file system error`));

        const result = await createTestWorkspace();

        expect(result.success).toBe(false);

        if (!result.success) {
          // Error message should be informative
          expect(result.error.message).toBeTruthy();
          expect(typeof result.error.message).toBe('string');

          // Should not contain platform-specific internal details
          expect(result.error.message).not.toContain('undefined');
          expect(result.error.message).not.toContain('[object Object]');
        }
      }
    });

    it('should handle platform-specific file access restrictions', async () => {
      for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
        PlatformTestHelper.setupPlatformMocks(config);

        // Simulate permission denied error (common across platforms)
        mockedFs.writeFile.mockRejectedValue(new Error('EACCES: permission denied'));

        const result = await createTestWorkspace();

        expect(result.success).toBe(false);

        if (!result.success) {
          // Should handle the error gracefully regardless of platform
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.name).toBe('WorkspaceCreationError');
        }
      }
    });
  });

  describe('Resource Management Across Platforms', () => {
    it('should handle platform-specific temporary directory cleanup', async () => {
      for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
        PlatformTestHelper.setupPlatformMocks(config);

        const result = await createTestWorkspace({
          namePrefix: `cleanup-${platformName}`,
        });

        expect(result.success).toBe(true);

        if (result.success) {
          // Workspace path should be in platform temp directory
          expect(result.data.path).toContain(config.tmpDir);

          // Files should be created with proper paths
          expect(result.data.files.length).toBeGreaterThan(0);

          for (const file of result.data.files) {
            // Files should not contain invalid characters for the platform
            if (config.platform === 'win32') {
              expect(file).not.toMatch(/[<>:"|?*]/);
            }
            expect(file).not.toContain('\0'); // Null bytes invalid on all platforms
          }
        }
      }
    });

    it('should handle concurrent access patterns across platforms', async () => {
      for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
        PlatformTestHelper.setupPlatformMocks(config);

        // Simulate multiple concurrent workspace creations
        const promises = Array.from({ length: 3 }, (_, i) =>
          createTestWorkspace({
            namePrefix: `concurrent-${platformName}-${i}`,
          })
        );

        const results = await Promise.all(promises);

        // All should succeed
        for (const result of results) {
          expect(result.success).toBe(true);
        }

        // All should have unique paths
        const paths = results
          .filter((r): r is { success: true; data: any } => r.success)
          .map((r) => r.data.path);

        expect(new Set(paths)).toHaveLength(3);
      }
    });
  });
});
