/**
 * Integration tests for ToolchainService registry-based detection
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 *
 * HODGE-351: These tests were moved from smoke tests because they:
 * - Test actual tool detection behavior (not just "doesn't crash")
 * - Perform real I/O operations on temp directories
 * - Take 3-4 seconds each (40x over smoke test budget)
 *
 * HODGE-357.1: Mock version detection to prevent spawning processes
 * - Tests verify detection logic (config files, package.json)
 * - Version detection is mocked to avoid subprocess spawning
 */

import { describe, expect, vi, beforeEach } from 'vitest';
import { ToolchainService } from './toolchain-service.js';
import { integrationTest } from '../test/helpers.js';
import os from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

describe('ToolchainService - Registry-Based Detection (Integration)', () => {
  beforeEach(() => {
    // HODGE-357.1: Mock getToolVersion to prevent spawning version check processes
    // Integration tests verify detection logic, not version command execution
    vi.spyOn(ToolchainService.prototype as any, 'getToolVersion').mockResolvedValue('1.0.0');
  });

  integrationTest(
    'should detect tool via config file',
    async () => {
      const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

      try {
        // Create a mock tsconfig.json
        await fs.writeFile(join(tmpDir, 'tsconfig.json'), '{}');

        const service = new ToolchainService(tmpDir);
        const tools = await service.detectTools();

        const typescript = tools.find((t) => t.name === 'typescript');
        expect(typescript).toBeDefined();
        expect(typescript?.detectionMethod).toBe('config_file');
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    },
    10000
  );

  integrationTest('should detect tool via package.json', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      // Create a mock package.json with eslint in devDependencies
      await fs.writeFile(
        join(tmpDir, 'package.json'),
        JSON.stringify({
          devDependencies: {
            eslint: '^8.0.0',
          },
        })
      );

      const service = new ToolchainService(tmpDir);
      const tools = await service.detectTools();

      const eslint = tools.find((t) => t.name === 'eslint');
      expect(eslint).toBeDefined();
      expect(eslint?.detectionMethod).toBe('package_json');
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  integrationTest('should detect ESLint plugin', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      // Create eslintrc with sonarjs plugin
      await fs.writeFile(
        join(tmpDir, '.eslintrc.json'),
        JSON.stringify({
          plugins: ['sonarjs'],
          extends: ['plugin:sonarjs/recommended'],
        })
      );

      // Also need package.json for the plugin detection
      await fs.writeFile(
        join(tmpDir, 'package.json'),
        JSON.stringify({
          devDependencies: {
            'eslint-plugin-sonarjs': '^0.24.0',
          },
        })
      );

      const service = new ToolchainService(tmpDir);
      const tools = await service.detectTools();

      const sonarjs = tools.find((t) => t.name === 'eslint-plugin-sonarjs');
      expect(sonarjs).toBeDefined();
      expect(sonarjs?.detectionMethod).toBe('eslint_plugin');
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  integrationTest('should handle missing tools gracefully', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      // Empty directory - no tools
      const service = new ToolchainService(tmpDir);
      const tools = await service.detectTools();

      // Should return empty array, not crash
      expect(Array.isArray(tools)).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
