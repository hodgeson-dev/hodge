/**
 * Smoke tests for ToolchainService registry-based detection
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 */

import { describe, it, expect } from 'vitest';
import { ToolchainService } from './toolchain-service.js';
import { smokeTest } from '../test/helpers.js';
import os from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

describe('ToolchainService - Registry-Based Detection (HODGE-341.2)', () => {
  smokeTest('should detect tools using registry without crashing', async () => {
    const service = new ToolchainService();
    const tools = await service.detectTools();

    expect(Array.isArray(tools)).toBe(true);
    // Should detect at least some tools in this project
    expect(tools.length).toBeGreaterThan(0);
  }, 10000); // Increased timeout for slow tool detection

  smokeTest('should detect TypeScript in this project', async () => {
    const service = new ToolchainService();
    const tools = await service.detectTools();

    const typescript = tools.find((t) => t.name === 'typescript');
    expect(typescript).toBeDefined();
    expect(typescript?.detected).toBe(true);
    expect(typescript?.detectionMethod).toBeDefined();
  }, 10000); // Increased timeout for slow tool detection

  smokeTest('should detect ESLint in this project', async () => {
    const service = new ToolchainService();
    const tools = await service.detectTools();

    const eslint = tools.find((t) => t.name === 'eslint');
    expect(eslint).toBeDefined();
    expect(eslint?.detected).toBe(true);
  });

  smokeTest('should detect tool via config file', async () => {
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
  });

  smokeTest('should detect tool via package.json', async () => {
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

  smokeTest('should detect ESLint plugin', async () => {
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

  smokeTest('should handle missing tools gracefully', async () => {
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

  smokeTest('should detect version information when available', async () => {
    const service = new ToolchainService();
    const tools = await service.detectTools();

    const typescript = tools.find((t) => t.name === 'typescript');
    if (typescript) {
      // Version might be undefined if tool not executable, but should be string if present
      if (typescript.version) {
        expect(typeof typescript.version).toBe('string');
        expect(typescript.version).toMatch(/\d+\.\d+\.\d+/);
      }
    }
  });
});
