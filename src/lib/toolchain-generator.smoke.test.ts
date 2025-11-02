/**
 * Smoke tests for ToolchainGenerator
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 */

import { describe, expect } from 'vitest';
import { ToolchainGenerator } from './toolchain-generator.js';
import { smokeTest } from '../test/helpers.js';
import os from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import type { DetectedTool, ToolchainConfig } from '../types/toolchain.js';

describe('ToolchainGenerator (HODGE-341.2)', () => {
  smokeTest('should generate toolchain.yaml without crashing', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      const outputPath = join(tmpDir, '.hodge', 'toolchain.yaml');
      const generator = new ToolchainGenerator();

      const detectedTools: DetectedTool[] = [
        { name: 'typescript', detected: true, detectionMethod: 'config_file' },
        { name: 'eslint', detected: true, detectionMethod: 'config_file' },
      ];

      await generator.generate(detectedTools, outputPath);

      // Verify file was created
      const exists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should generate valid YAML structure', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      const outputPath = join(tmpDir, '.hodge', 'toolchain.yaml');
      const generator = new ToolchainGenerator();

      const detectedTools: DetectedTool[] = [
        { name: 'typescript', detected: true, detectionMethod: 'config_file', version: '5.3.3' },
        { name: 'eslint', detected: true, detectionMethod: 'package_json', version: '8.56.0' },
        { name: 'prettier', detected: true, detectionMethod: 'config_file' },
      ];

      await generator.generate(detectedTools, outputPath);

      // Read and parse the generated file
      const content = await fs.readFile(outputPath, 'utf-8');
      const config = yaml.load(content) as ToolchainConfig;

      // Verify structure
      expect(config).toBeDefined();
      expect(config.quality_checks).toBeDefined();
      expect(config.commands).toBeDefined();
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should map tools to correct quality check categories', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      const outputPath = join(tmpDir, '.hodge', 'toolchain.yaml');
      const generator = new ToolchainGenerator();

      const detectedTools: DetectedTool[] = [
        { name: 'typescript', detected: true, detectionMethod: 'config_file' },
        { name: 'eslint', detected: true, detectionMethod: 'config_file' },
        { name: 'prettier', detected: true, detectionMethod: 'config_file' },
        { name: 'vitest', detected: true, detectionMethod: 'package_json' },
      ];

      await generator.generate(detectedTools, outputPath);

      const content = await fs.readFile(outputPath, 'utf-8');
      const config = yaml.load(content) as ToolchainConfig;

      // Verify type checking
      expect(config.quality_checks.type_checking).toContain('typescript');

      // Verify linting
      expect(config.quality_checks.linting).toContain('eslint');

      // Verify formatting
      expect(config.quality_checks.formatting).toContain('prettier');

      // Verify testing
      expect(config.quality_checks.testing).toContain('vitest');
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should include default commands from registry', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      const outputPath = join(tmpDir, '.hodge', 'toolchain.yaml');
      const generator = new ToolchainGenerator();

      const detectedTools: DetectedTool[] = [
        { name: 'typescript', detected: true, detectionMethod: 'config_file' },
        { name: 'eslint', detected: true, detectionMethod: 'config_file' },
      ];

      await generator.generate(detectedTools, outputPath);

      const content = await fs.readFile(outputPath, 'utf-8');
      const config = yaml.load(content) as ToolchainConfig;

      // Verify commands exist
      expect(config.commands.typescript).toBeDefined();
      expect(config.commands.typescript.command).toBeDefined();
      expect(config.commands.eslint).toBeDefined();
      expect(config.commands.eslint.command).toBeDefined();

      // Verify commands are from registry defaults
      expect(config.commands.typescript.command).toContain('tsc');
      expect(config.commands.eslint.command).toContain('eslint');
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should handle empty detected tools list', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      const outputPath = join(tmpDir, '.hodge', 'toolchain.yaml');
      const generator = new ToolchainGenerator();

      await generator.generate([], outputPath);

      const content = await fs.readFile(outputPath, 'utf-8');
      const config = yaml.load(content) as ToolchainConfig;

      // Should still have structure but empty
      expect(config.quality_checks.type_checking).toEqual([]);
      expect(config.quality_checks.linting).toEqual([]);
      expect(config.quality_checks.testing).toEqual([]);
      expect(config.quality_checks.formatting).toEqual([]);
      expect(config.commands).toEqual({});
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should create parent directory if missing', async () => {
    const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'hodge-test-'));

    try {
      // Path includes nested directories that don't exist
      const outputPath = join(tmpDir, '.hodge', 'config', 'toolchain.yaml');
      const generator = new ToolchainGenerator();

      const detectedTools: DetectedTool[] = [
        { name: 'typescript', detected: true, detectionMethod: 'config_file' },
      ];

      await generator.generate(detectedTools, outputPath);

      // Verify file was created in nested path
      const exists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
