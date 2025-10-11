/**
 * ToolRegistryLoader: Loads and parses the tool registry
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import type { ToolRegistry } from '../types/toolchain.js';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('tool-registry-loader');

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for loading the tool registry
 */
export class ToolRegistryLoader {
  private registryPath: string;
  private cachedRegistry?: ToolRegistry;

  constructor(registryPath?: string) {
    // Default to bundled registry
    this.registryPath =
      registryPath ?? join(__dirname, '..', 'bundled-config', 'tool-registry.yaml');
  }

  /**
   * Load the tool registry (cached after first load)
   */
  async load(): Promise<ToolRegistry> {
    if (this.cachedRegistry) {
      return this.cachedRegistry;
    }

    try {
      const content = await fs.readFile(this.registryPath, 'utf-8');
      const parsed = yaml.load(content);

      // Type guard for registry structure
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Tool registry is not a valid object');
      }

      if (!('tools' in parsed) || typeof (parsed as { tools?: unknown }).tools !== 'object') {
        throw new Error('Tool registry is missing tools object');
      }

      const registry = parsed as ToolRegistry;
      this.cachedRegistry = registry;

      logger.debug('Loaded tool registry', {
        toolCount: Object.keys(registry.tools).length,
        tools: Object.keys(registry.tools),
      });

      return registry;
    } catch (error) {
      logger.error('Failed to load tool registry', {
        error: error as Error,
        registryPath: this.registryPath,
      });
      throw new Error(
        `Failed to load tool registry from ${this.registryPath}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get a specific tool from the registry
   */
  async getTool(toolName: string): Promise<ToolRegistry['tools'][string] | undefined> {
    const registry = await this.load();
    return registry.tools[toolName];
  }

  /**
   * Get all tools that support a specific language
   */
  async getToolsForLanguage(language: string): Promise<string[]> {
    const registry = await this.load();
    return Object.entries(registry.tools)
      .filter(([, tool]) => tool.languages.includes(language))
      .map(([name]) => name);
  }

  /**
   * Get all tools that provide a specific quality check category
   */
  async getToolsForCategory(category: string): Promise<string[]> {
    const registry = await this.load();
    return Object.entries(registry.tools)
      .filter(([, tool]) => tool.categories.some((c) => c === category))
      .map(([name]) => name);
  }

  /**
   * Clear the cached registry (useful for testing)
   */
  clearCache(): void {
    this.cachedRegistry = undefined;
  }
}
