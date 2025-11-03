/**
 * Smoke tests for ArchitectureGraphService
 * HODGE-362: Basic sanity checks for graph generation and loading
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { ArchitectureGraphService } from './architecture-graph-service.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import type { ToolchainConfig } from '../types/toolchain.js';
import { smokeTest } from '../test/helpers.js';

describe('ArchitectureGraphService - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let service: ArchitectureGraphService;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    await fixture.setup();
    service = new ArchitectureGraphService();
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  // Helper to create minimal toolchain config for testing
  const createMinimalToolchainConfig = (overrides?: Partial<ToolchainConfig>): ToolchainConfig => ({
    version: '1.0',
    language: 'typescript',
    commands: {},
    quality_checks: {
      type_checking: [],
      linting: [],
      testing: [],
      formatting: [],
    },
    ...overrides,
  });

  smokeTest('should create instance without errors', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ArchitectureGraphService);
  });

  smokeTest('should check if graph exists (returns false for non-existent)', () => {
    const exists = service.graphExists(fixture.getPath());
    expect(exists).toBe(false);
  });

  smokeTest('should load graph gracefully when file does not exist', async () => {
    const content = await service.loadGraph(fixture.getPath());
    expect(content).toBeUndefined();
  });

  smokeTest('should load graph content when file exists', async () => {
    // Create a minimal DOT graph file
    const graphContent = 'digraph { "moduleA" -> "moduleB"; }';
    await fixture.writeFile('.hodge/architecture-graph.dot', graphContent);

    const content = await service.loadGraph(fixture.getPath());
    expect(content).toBe(graphContent);
  });

  smokeTest('should report graph exists when file is present', async () => {
    await fixture.writeFile('.hodge/architecture-graph.dot', 'digraph { }');

    const exists = service.graphExists(fixture.getPath());
    expect(exists).toBe(true);
  });

  smokeTest('should handle missing toolchain config gracefully', async () => {
    const toolchainConfig = createMinimalToolchainConfig();

    const result = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      enableConsole: false,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  smokeTest('should skip graph generation when explicitly disabled', async () => {
    const toolchainConfig = createMinimalToolchainConfig({
      codebase_analysis: {
        architecture_graph: {
          tool: 'dependency-cruiser',
          enabled: false,
        },
      },
    });

    const result = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      enableConsole: false,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('disabled');
  });

  smokeTest('should return error when no architecture graphing tool configured', async () => {
    const toolchainConfig = createMinimalToolchainConfig({
      language: 'python',
    });

    const result = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      enableConsole: false,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No graph tool configured');
  });

  // HODGE-378.3: Dual-logging pattern tests
  smokeTest('should accept enableConsole parameter (defaults to false)', async () => {
    const toolchainConfig = createMinimalToolchainConfig();

    // Test default (should not throw)
    const result1 = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
    });
    expect(result1).toBeDefined();

    // Test explicit false
    const result2 = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      enableConsole: false,
    });
    expect(result2).toBeDefined();

    // Test explicit true
    const result3 = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      enableConsole: true,
    });
    expect(result3).toBeDefined();
  });

  smokeTest('should load custom output path when specified', async () => {
    const customPath = 'custom/path/graph.dot';
    const graphContent = 'digraph { "test" }';
    await fixture.writeFile(customPath, graphContent);

    const content = await service.loadGraph(fixture.getPath(), customPath);
    expect(content).toBe(graphContent);
  });
});
