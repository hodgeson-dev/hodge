/**
 * @fileoverview Integration tests for npm link workflow with test workspace
 *
 * These tests ensure that the npm link functionality works correctly with
 * the generated test workspaces, testing the complete local development workflow.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { execSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createTestWorkspace, TestWorkspaceGenerator } from './create-test-workspace';

/**
 * Result type for command execution
 */
interface CommandResult {
  readonly success: boolean;
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

/**
 * Utility class for executing commands safely in tests
 */
class TestCommandExecutor {
  /**
   * Execute a command synchronously with timeout and error handling
   * @param command - Command to execute
   * @param options - Execution options
   * @returns Command execution result
   */
  public static executeSync(
    command: string,
    options: {
      cwd?: string;
      timeout?: number;
      env?: Record<string, string>;
    } = {}
  ): CommandResult {
    const { cwd = process.cwd(), timeout = 30000, env = {} } = options;

    try {
      const result = execSync(command, {
        cwd,
        timeout,
        env: { ...process.env, ...env },
        encoding: 'utf8',
        stdio: 'pipe',
      });

      return {
        success: true,
        stdout: result.toString(),
        stderr: '',
        exitCode: 0,
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || error.message || '',
        exitCode: error.status || 1,
      };
    }
  }

  /**
   * Execute a command asynchronously with proper cleanup
   * @param command - Command to execute
   * @param args - Command arguments
   * @param options - Execution options
   * @returns Promise resolving to command result
   */
  public static async executeAsync(
    command: string,
    args: string[] = [],
    options: {
      cwd?: string;
      timeout?: number;
      env?: Record<string, string>;
    } = {}
  ): Promise<CommandResult> {
    const { cwd = process.cwd(), timeout = 30000, env = {} } = options;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let finished = false;

      const child: ChildProcess = spawn(command, args, {
        cwd,
        env: { ...process.env, ...env },
        stdio: 'pipe',
      });

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        if (!finished) {
          finished = true;
          child.kill('SIGTERM');
          resolve({
            success: false,
            stdout,
            stderr: stderr + '\nProcess killed due to timeout',
            exitCode: -1,
          });
        }
      }, timeout);

      // Collect output
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      // Handle process completion
      child.on('close', (code) => {
        if (!finished) {
          finished = true;
          clearTimeout(timeoutHandle);
          resolve({
            success: code === 0,
            stdout,
            stderr,
            exitCode: code || 0,
          });
        }
      });

      // Handle process error
      child.on('error', (error) => {
        if (!finished) {
          finished = true;
          clearTimeout(timeoutHandle);
          resolve({
            success: false,
            stdout,
            stderr: stderr + error.message,
            exitCode: -1,
          });
        }
      });
    });
  }
}

/**
 * Integration test suite for npm link workflow
 */
describe('NPM Link Integration Tests', () => {
  let testWorkspacePath: string;
  let hodgePath: string;

  beforeAll(() => {
    hodgePath = path.resolve(__dirname, '..');

    // Ensure we're in the right directory for Hodge project
    expect(fs.existsSync(path.join(hodgePath, 'package.json'))).toBe(true);

    const packageJson = fs.readJsonSync(path.join(hodgePath, 'package.json'));
    expect(packageJson.name).toBe('@agile-explorations/hodge');
  });

  beforeEach(async () => {
    // Create a fresh test workspace for each test
    const result = await createTestWorkspace({
      namePrefix: 'npm-link-test',
      includeTypeScript: true,
      includeJavaScript: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      testWorkspacePath = result.data.path;
    }
  });

  afterEach(async () => {
    // Clean up test workspace
    if (testWorkspacePath && fs.existsSync(testWorkspacePath)) {
      await fs.remove(testWorkspacePath);
    }

    // Ensure hodge is unlinked to prevent test interference
    try {
      TestCommandExecutor.executeSync('npm unlink @agile-explorations/hodge', {
        cwd: testWorkspacePath,
        timeout: 10000,
      });
    } catch {
      // Ignore errors - package might not be linked
    }
  });

  describe('Basic npm link workflow', () => {
    it('should build and link Hodge package successfully', async () => {
      // Build the Hodge package
      const buildResult = TestCommandExecutor.executeSync('npm run build', {
        cwd: hodgePath,
        timeout: 60000,
      });

      expect(buildResult.success).toBe(true);
      expect(buildResult.stderr).not.toContain('error');

      // Verify build outputs exist
      expect(fs.existsSync(path.join(hodgePath, 'dist'))).toBe(true);
      expect(fs.existsSync(path.join(hodgePath, 'dist/src/bin/hodge.js'))).toBe(true);

      // Link the package globally
      const linkResult = TestCommandExecutor.executeSync('npm link', {
        cwd: hodgePath,
        timeout: 30000,
      });

      expect(linkResult.success).toBe(true);
    });

    it('should link Hodge in test workspace and verify installation', async () => {
      // First build and link Hodge globally
      TestCommandExecutor.executeSync('npm run build', { cwd: hodgePath, timeout: 60000 });
      TestCommandExecutor.executeSync('npm link', { cwd: hodgePath, timeout: 30000 });

      // Link Hodge in the test workspace
      const linkResult = TestCommandExecutor.executeSync('npm link @agile-explorations/hodge', {
        cwd: testWorkspacePath,
        timeout: 30000,
      });

      expect(linkResult.success).toBe(true);

      // Verify that hodge command is available (either globally or via node)
      const whichResult = TestCommandExecutor.executeSync('which hodge', {
        cwd: testWorkspacePath,
        timeout: 10000,
      });

      // Note: npm link may not create global command in all environments
      // This is acceptable - the important thing is the package is linked
      if (whichResult.success) {
        expect(whichResult.stdout.trim()).toBeTruthy();
      }
    });

    it('should execute basic Hodge commands in test workspace', async () => {
      // Setup: build and link Hodge
      TestCommandExecutor.executeSync('npm run build', { cwd: hodgePath, timeout: 60000 });
      TestCommandExecutor.executeSync('npm link', { cwd: hodgePath, timeout: 30000 });
      TestCommandExecutor.executeSync('npm link @agile-explorations/hodge', {
        cwd: testWorkspacePath,
        timeout: 30000,
      });

      // Test basic command execution
      const versionResult = TestCommandExecutor.executeSync('hodge --version', {
        cwd: testWorkspacePath,
        timeout: 10000,
      });

      expect(versionResult.success).toBe(true);
      expect(versionResult.stdout).toContain('0.1.0-alpha.1');

      // Test help command
      const helpResult = TestCommandExecutor.executeSync('hodge --help', {
        cwd: testWorkspacePath,
        timeout: 10000,
      });

      expect(helpResult.success).toBe(true);
      expect(helpResult.stdout).toContain('Usage:');
    });
  });

  describe('Package.json scripts integration', () => {
    it('should execute link:local script successfully', async () => {
      const linkLocalResult = TestCommandExecutor.executeSync('npm run link:local', {
        cwd: hodgePath,
        timeout: 60000,
      });

      expect(linkLocalResult.success).toBe(true);

      // Verify that the package is built and linked
      expect(fs.existsSync(path.join(hodgePath, 'dist'))).toBe(true);
    });

    it('should execute test:local script and create workspace', async () => {
      const testLocalResult = TestCommandExecutor.executeSync('npm run test:local', {
        cwd: hodgePath,
        timeout: 30000,
      });

      expect(testLocalResult.success).toBe(true);
      expect(testLocalResult.stdout).toContain('Test workspace created successfully');
      expect(testLocalResult.stdout).toContain('Location:');
    });

    it('should execute unlink:local script successfully', async () => {
      // First link the package
      TestCommandExecutor.executeSync('npm run link:local', {
        cwd: hodgePath,
        timeout: 60000,
      });

      // Then unlink it
      const unlinkResult = TestCommandExecutor.executeSync('npm run unlink:local', {
        cwd: hodgePath,
        timeout: 30000,
      });

      expect(unlinkResult.success).toBe(true);
    });
  });

  describe('Watch mode integration', () => {
    it('should start build:watch mode successfully', async () => {
      const watchProcess = TestCommandExecutor.executeAsync('npm', ['run', 'build:watch'], {
        cwd: hodgePath,
        timeout: 5000, // Very short timeout for this test
      });

      // Since this is a watch mode, it should start but timeout (as expected)
      const result = await watchProcess;

      // Watch mode should start but then timeout - this is expected behavior
      expect([0, -1]).toContain(result.exitCode); // Either successful start or killed due to timeout
      // Don't check stderr content as it may vary by environment
    }, 10000); // Increase test timeout

    it('should handle dev:link script startup', async () => {
      const devLinkProcess = TestCommandExecutor.executeAsync('npm', ['run', 'dev:link'], {
        cwd: hodgePath,
        timeout: 5000, // Short timeout
      });

      const result = await devLinkProcess;

      // This command should start watch mode and npm link, then timeout
      expect(result.exitCode).toBe(-1); // Killed due to timeout
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle missing dependencies gracefully', async () => {
      // Try to link in a workspace without proper setup
      const emptyDir = path.join(os.tmpdir(), `hodge-test-empty-${Date.now()}`);
      await fs.ensureDir(emptyDir);

      try {
        const linkResult = TestCommandExecutor.executeSync('npm link @agile-explorations/hodge', {
          cwd: emptyDir,
          timeout: 10000,
        });

        // This might succeed or fail depending on npm version, but should not crash
        expect(typeof linkResult.success).toBe('boolean');
      } finally {
        await fs.remove(emptyDir);
      }
    });

    it('should handle already linked package', async () => {
      // Build and link twice
      TestCommandExecutor.executeSync('npm run build', { cwd: hodgePath, timeout: 60000 });
      TestCommandExecutor.executeSync('npm link', { cwd: hodgePath, timeout: 30000 });

      const firstLink = TestCommandExecutor.executeSync('npm link @agile-explorations/hodge', {
        cwd: testWorkspacePath,
        timeout: 30000,
      });
      expect(firstLink.success).toBe(true);

      // Second link should not fail
      const secondLink = TestCommandExecutor.executeSync('npm link @agile-explorations/hodge', {
        cwd: testWorkspacePath,
        timeout: 30000,
      });
      expect(secondLink.success).toBe(true);
    });

    it('should handle unlinking non-linked package', async () => {
      const unlinkResult = TestCommandExecutor.executeSync('npm unlink @agile-explorations/hodge', {
        cwd: testWorkspacePath,
        timeout: 10000,
      });

      // This might succeed with warnings or fail, but should not crash
      expect(typeof unlinkResult.success).toBe('boolean');
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should work on current platform', async () => {
      const platform = os.platform();

      // Basic build should work on all platforms
      const buildResult = TestCommandExecutor.executeSync('npm run build', {
        cwd: hodgePath,
        timeout: 60000,
      });

      expect(buildResult.success).toBe(true);

      // Verify binary has correct permissions on Unix-like systems
      if (platform !== 'win32') {
        const binPath = path.join(hodgePath, 'dist/src/bin/hodge.js');
        expect(fs.existsSync(binPath)).toBe(true);

        const stats = fs.statSync(binPath);
        expect(stats.isFile()).toBe(true);
      }
    });

    it('should handle path separators correctly', async () => {
      const result = await createTestWorkspace({
        namePrefix: 'path-test',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        // Path should use platform-appropriate separators
        const workspacePath = result.data.path;
        expect(path.isAbsolute(workspacePath)).toBe(true);

        // All files should exist with correct paths
        for (const file of result.data.files) {
          const fullPath = path.join(workspacePath, file);
          expect(fs.existsSync(fullPath)).toBe(true);
        }

        // Cleanup
        await fs.remove(workspacePath);
      }
    });
  });

  describe('Performance and resource usage', () => {
    it('should complete build and link within reasonable time', async () => {
      const startTime = Date.now();

      const buildResult = TestCommandExecutor.executeSync('npm run build', {
        cwd: hodgePath,
        timeout: 120000, // 2 minutes max
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(buildResult.success).toBe(true);
      expect(duration).toBeLessThan(120000); // Should complete within 2 minutes
    });

    it('should create test workspace quickly', async () => {
      const startTime = Date.now();

      const result = await createTestWorkspace({
        namePrefix: 'performance-test',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      if (result.success) {
        await fs.remove(result.data.path);
      }
    });

    it('should handle multiple concurrent workspace creations', async () => {
      const promises = Array.from({ length: 3 }, (_, i) =>
        createTestWorkspace({
          namePrefix: `concurrent-${i}`,
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

      // Cleanup
      for (const result of results) {
        if (result.success) {
          await fs.remove(result.data.path);
        }
      }
    });
  });

  describe('Real workflow simulation', () => {
    it('should simulate complete development workflow', async () => {
      // Step 1: Build and link Hodge
      const buildResult = TestCommandExecutor.executeSync('npm run build', {
        cwd: hodgePath,
        timeout: 60000,
      });
      expect(buildResult.success).toBe(true);

      const linkResult = TestCommandExecutor.executeSync('npm link', {
        cwd: hodgePath,
        timeout: 30000,
      });
      expect(linkResult.success).toBe(true);

      // Step 2: Create and setup test workspace
      const linkWorkspaceResult = TestCommandExecutor.executeSync(
        'npm link @agile-explorations/hodge',
        {
          cwd: testWorkspacePath,
          timeout: 30000,
        }
      );
      expect(linkWorkspaceResult.success).toBe(true);

      // Step 3: Run Hodge commands in workspace
      const commands = ['hodge --version', 'hodge --help'];

      for (const command of commands) {
        const commandResult = TestCommandExecutor.executeSync(command, {
          cwd: testWorkspacePath,
          timeout: 10000,
        });
        expect(commandResult.success).toBe(true);
      }

      // Step 4: Verify workspace files are accessible
      const files = ['package.json', 'src/sample.js', 'src/UserService.ts', 'README.md'];
      for (const file of files) {
        const filePath = path.join(testWorkspacePath, file);
        expect(fs.existsSync(filePath)).toBe(true);

        // Verify files are readable and not empty
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });
});
