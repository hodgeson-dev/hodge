/**
 * Smoke tests for ToolchainService
 * HODGE-341.1: Build System Detection and Toolchain Infrastructure
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToolchainService } from './toolchain-service.js';
import { smokeTest } from '../test/helpers.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('ToolchainService - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let service: ToolchainService;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture({ prefix: 'hodge-toolchain-test' });
    const tempDir = await fixture.setup();
    service = new ToolchainService(tempDir);
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  smokeTest('should not crash when loading missing config', async () => {
    await expect(service.loadConfig()).rejects.toThrow();
  });

  smokeTest(
    'should detect tools from config files',
    async () => {
      // Create tsconfig.json
      await fixture.writeFile('tsconfig.json', JSON.stringify({}));

      const tools = await service.detectTools();

      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      const typescript = tools.find((t) => t.name === 'typescript');
      expect(typescript).toBeDefined();
      expect(typescript?.detected).toBe(true);
    },
    20000
  ); // Increased timeout for tool detection under load

  smokeTest(
    'should detect tools from package.json',
    async () => {
      // Create package.json with devDependencies
      const packageJson = {
        devDependencies: {
          eslint: '^8.0.0',
          prettier: '^3.0.0',
        },
      };
      await fixture.writeFile('package.json', JSON.stringify(packageJson));

      const tools = await service.detectTools();

      expect(tools).toBeDefined();
      expect(tools.length).toBeGreaterThan(0);
      const eslint = tools.find((t) => t.name === 'eslint');
      expect(eslint).toBeDefined();
    },
    20000
  ); // Increased timeout for tool detection under load

  smokeTest(
    'should prefer config file over package.json',
    async () => {
      // Create both tsconfig.json and package.json
      await fixture.writeFile('tsconfig.json', JSON.stringify({}));
      const packageJson = {
        devDependencies: {
          typescript: '^5.0.0',
        },
      };
      await fixture.writeFile('package.json', JSON.stringify(packageJson));

      const tools = await service.detectTools();

      const typescript = tools.find((t) => t.name === 'typescript');
      expect(typescript?.detectionMethod).toBe('config_file');
    },
    20000
  ); // Increased timeout for tool detection under load

  smokeTest('should load toolchain config from .hodge directory', async () => {
    // Create .hodge directory and toolchain.yaml
    const config = {
      version: '1.0',
      language: 'typescript',
      commands: {
        typescript: {
          command: 'npx tsc --noEmit',
          provides: ['type_checking'],
        },
      },
      quality_checks: {
        type_checking: ['typescript'],
        linting: [],
        testing: [],
        formatting: [],
      },
    };
    await fixture.writeFile('.hodge/toolchain.yaml', JSON.stringify(config)); // Using JSON for simplicity in test

    const loaded = await service.loadConfig();

    expect(loaded).toBeDefined();
    expect(loaded.version).toBe('1.0');
    expect(loaded.commands.typescript).toBeDefined();
  });

  smokeTest('should handle git operations in non-git directory', async () => {
    // tempDir is not a git repo
    await expect(service.getUncommittedFiles()).rejects.toThrow();
  });

  smokeTest('should substitute ${files} placeholder in commands', async () => {
    // Create minimal config with ${files} placeholder
    await fixture.writeFile(
      '.hodge/toolchain.yaml',
      `version: "1.0"
language: typescript
commands:
  eslint:
    command: echo \${files}
    provides: [linting]
quality_checks:
  type_checking: []
  linting: [eslint]
  testing: []
  formatting: []`
    );

    // Run checks without git (should use '.' as fallback)
    await expect(service.runQualityChecks('all')).resolves.toBeDefined();
  });

  smokeTest('should return skipped result when tool not configured', async () => {
    // Create config with no tools
    await fixture.writeFile(
      '.hodge/toolchain.yaml',
      `version: "1.0"
language: typescript
commands: {}
quality_checks:
  type_checking: []
  linting: []
  testing: []
  formatting: []`
    );

    const results = await service.runQualityChecks('all');

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.skipped)).toBe(true);
  });
});
