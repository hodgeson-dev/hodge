/**
 * ToolCategoryMapper: Maps tools to quality check categories
 * Extracted from ToolchainGenerator to reduce complexity
 */

import type { DetectedTool, ToolRegistryEntry, ToolchainConfig } from '../types/toolchain.js';

/**
 * Helper class for mapping tools to quality check categories
 */
export class ToolCategoryMapper {
  /**
   * Add tool to appropriate quality check category
   * @param config - The toolchain config object to modify
   * @param toolName - Name of the tool
   * @param category - Category to map to
   */
  addToolToCategory(config: ToolchainConfig, toolName: string, category: string): void {
    switch (category) {
      case 'type_checking':
        config.quality_checks.type_checking.push(toolName);
        break;
      case 'linting':
        config.quality_checks.linting.push(toolName);
        break;
      case 'testing':
        config.quality_checks.testing.push(toolName);
        break;
      case 'formatting':
        config.quality_checks.formatting.push(toolName);
        break;
      case 'complexity':
        if (!config.quality_checks.complexity?.includes(toolName)) {
          config.quality_checks.complexity?.push(toolName);
        }
        break;
      case 'code_smells':
        if (!config.quality_checks.code_smells?.includes(toolName)) {
          config.quality_checks.code_smells?.push(toolName);
        }
        break;
      case 'duplication':
        if (!config.quality_checks.duplication?.includes(toolName)) {
          config.quality_checks.duplication?.push(toolName);
        }
        break;
      case 'architecture':
        if (!config.quality_checks.architecture?.includes(toolName)) {
          config.quality_checks.architecture?.push(toolName);
        }
        break;
      case 'security':
      case 'patterns':
        // Both 'security' and 'patterns' map to security checks
        if (!config.quality_checks.security?.includes(toolName)) {
          config.quality_checks.security?.push(toolName);
        }
        break;
    }
  }

  /**
   * Build command configuration for a tool
   * @param tool - The detected tool
   * @param toolInfo - Tool information from registry
   * @returns Command configuration object
   */
  buildCommandConfig(
    _tool: DetectedTool,
    toolInfo: ToolRegistryEntry
  ): { command: string; provides: string[] } | null {
    if (!toolInfo.default_command) {
      return null;
    }

    return {
      command: toolInfo.default_command,
      provides: toolInfo.categories,
    };
  }
}
