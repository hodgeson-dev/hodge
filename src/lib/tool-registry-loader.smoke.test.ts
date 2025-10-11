/**
 * Smoke tests for ToolRegistryLoader
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 */

import { describe, it, expect } from 'vitest';
import { ToolRegistryLoader } from './tool-registry-loader.js';
import { smokeTest } from '../test/helpers.js';

describe('ToolRegistryLoader', () => {
  smokeTest('should load bundled tool registry without crashing', async () => {
    const loader = new ToolRegistryLoader();
    const registry = await loader.load();

    expect(registry).toBeDefined();
    expect(registry.tools).toBeDefined();
    expect(typeof registry.tools).toBe('object');
  });

  smokeTest('should have expected tools in registry', async () => {
    const loader = new ToolRegistryLoader();
    const registry = await loader.load();

    // Check for basic tools from HODGE-341.1
    expect(registry.tools.typescript).toBeDefined();
    expect(registry.tools.eslint).toBeDefined();
    expect(registry.tools.prettier).toBeDefined();
    expect(registry.tools.vitest).toBeDefined();

    // Check for advanced tools from HODGE-341.2
    expect(registry.tools['eslint-plugin-sonarjs']).toBeDefined();
    expect(registry.tools.jscpd).toBeDefined();
    expect(registry.tools['dependency-cruiser']).toBeDefined();
    expect(registry.tools.semgrep).toBeDefined();
  });

  smokeTest('should return tool information with required fields', async () => {
    const loader = new ToolRegistryLoader();
    const tool = await loader.getTool('typescript');

    expect(tool).toBeDefined();
    expect(tool?.languages).toBeDefined();
    expect(Array.isArray(tool?.languages)).toBe(true);
    expect(tool?.detection).toBeDefined();
    expect(Array.isArray(tool?.detection)).toBe(true);
    expect(tool?.installation).toBeDefined();
    expect(tool?.categories).toBeDefined();
    expect(Array.isArray(tool?.categories)).toBe(true);
  });

  smokeTest('should get tools for TypeScript language', async () => {
    const loader = new ToolRegistryLoader();
    const tools = await loader.getToolsForLanguage('typescript');

    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
    expect(tools).toContain('typescript');
    expect(tools).toContain('eslint');
  });

  smokeTest('should get tools for type_checking category', async () => {
    const loader = new ToolRegistryLoader();
    const tools = await loader.getToolsForCategory('type_checking');

    expect(Array.isArray(tools)).toBe(true);
    expect(tools).toContain('typescript');
  });

  smokeTest('should cache registry after first load', async () => {
    const loader = new ToolRegistryLoader();

    const registry1 = await loader.load();
    const registry2 = await loader.load();

    // Same object reference = cached
    expect(registry1).toBe(registry2);
  });

  smokeTest('should clear cache when requested', async () => {
    const loader = new ToolRegistryLoader();

    const registry1 = await loader.load();
    loader.clearCache();
    const registry2 = await loader.load();

    // Different object reference = reloaded
    expect(registry1).not.toBe(registry2);
    // But same content
    expect(registry1).toEqual(registry2);
  });
});
