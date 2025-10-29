/**
 * Smoke tests for ArchitectureGraphService
 * HODGE-362: Basic sanity checks for graph generation and loading
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ArchitectureGraphService } from './architecture-graph-service.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import type { ToolchainConfig, ToolRegistry } from '../types/toolchain.js';
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
    const toolchainConfig: ToolchainConfig = {
      version: '1.0',
      language: 'typescript',
      commands: {},
      quality_checks: {
        type_checking: [],
        linting: [],
        testing: [],
        formatting: [],
      },
    };

    const toolRegistry: ToolRegistry = {
      tools: {},
    };

    const result = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      toolRegistry,
      quiet: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  smokeTest('should skip graph generation when explicitly disabled', async () => {
    const toolchainConfig: ToolchainConfig = {
      version: '1.0',
      language: 'typescript',
      commands: {},
      quality_checks: {
        type_checking: [],
        linting: [],
        testing: [],
        formatting: [],
      },
      codebase_analysis: {
        architecture_graph: {
          tool: 'dependency-cruiser',
          enabled: false,
        },
      },
    };

    const toolRegistry: ToolRegistry = {
      tools: {
        'dependency-cruiser': {
          languages: ['typescript'],
          detection: [],
          installation: { external: false },
          default_command: 'depcruise',
          graph_command: 'depcruise --output-type dot . > .hodge/architecture-graph.dot',
          categories: ['architecture', 'architecture_graphing'],
        },
      },
    };

    const result = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      toolRegistry,
      quiet: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('disabled');
  });

  smokeTest('should return error when no architecture graphing tool available', async () => {
    const toolchainConfig: ToolchainConfig = {
      version: '1.0',
      language: 'python', // Language with no tool in registry
      commands: {},
      quality_checks: {
        type_checking: [],
        linting: [],
        testing: [],
        formatting: [],
      },
    };

    const toolRegistry: ToolRegistry = {
      tools: {
        mypy: {
          languages: ['python'],
          detection: [],
          installation: { external: true },
          default_command: 'mypy',
          categories: ['type_checking'], // No architecture_graphing
        },
      },
    };

    const result = await service.generateGraph({
      projectRoot: fixture.getPath(),
      toolchainConfig,
      toolRegistry,
      quiet: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No graph tool available');
  });

  smokeTest('should load custom output path when specified', async () => {
    const customPath = 'custom/path/graph.dot';
    const graphContent = 'digraph { "test" }';
    await fixture.writeFile(customPath, graphContent);

    const content = await service.loadGraph(fixture.getPath(), customPath);
    expect(content).toBe(graphContent);
  });
});
