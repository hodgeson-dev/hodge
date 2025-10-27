/**
 * ToolchainGenerator: Generates toolchain.yaml from detected tools
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 */

import { promises as fs } from 'fs';
import { dirname } from 'path';
import yaml from 'js-yaml';
import type { DetectedTool, ToolchainConfig } from '../types/toolchain.js';
import { ToolRegistryLoader } from './tool-registry-loader.js';
import { ToolCategoryMapper } from './tool-category-mapper.js';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('toolchain-generator');

/**
 * Service for generating toolchain.yaml from detected tools
 */
export class ToolchainGenerator {
  private registryLoader: ToolRegistryLoader;
  private categoryMapper: ToolCategoryMapper;

  constructor(registryLoader?: ToolRegistryLoader, categoryMapper?: ToolCategoryMapper) {
    this.registryLoader = registryLoader ?? new ToolRegistryLoader();
    this.categoryMapper = categoryMapper ?? new ToolCategoryMapper();
  }

  /**
   * Generate toolchain.yaml from detected tools
   * @param detectedTools - List of detected tools
   * @param outputPath - Path where toolchain.yaml should be written
   */
  async generate(detectedTools: DetectedTool[], outputPath: string): Promise<void> {
    try {
      logger.debug('Starting toolchain.yaml generation', {
        detectedToolCount: detectedTools.length,
        outputPath,
      });

      const registry = await this.registryLoader.load();
      const config: ToolchainConfig = {
        version: '1.0',
        language: 'typescript', // TODO: Detect language from project
        quality_checks: {
          type_checking: [],
          linting: [],
          testing: [],
          formatting: [],
          complexity: [],
          code_smells: [],
          duplication: [],
          architecture: [],
          security: [],
        },
        commands: {},
      };

      // Build quality_checks mapping and commands from detected tools
      for (const detectedTool of detectedTools) {
        const toolInfo = registry.tools[detectedTool.name];
        if (!toolInfo) {
          logger.warn(`Tool ${detectedTool.name} not found in registry, skipping`);
          continue;
        }

        // Add tool to appropriate quality check categories
        for (const category of toolInfo.categories) {
          // Skip tools without default commands (e.g., eslint plugins that run via eslint)
          if (!toolInfo.default_command) {
            continue;
          }

          this.categoryMapper.addToolToCategory(config, detectedTool.name, category);
        }

        // Add command configuration if default_command exists
        const commandConfig = this.categoryMapper.buildCommandConfig(detectedTool, toolInfo);
        if (commandConfig) {
          config.commands[detectedTool.name] = commandConfig;
        }
      }

      // Ensure parent directory exists
      await fs.mkdir(dirname(outputPath), { recursive: true });

      // Write toolchain.yaml
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
      });

      await fs.writeFile(outputPath, yamlContent, 'utf-8');

      logger.info('Generated toolchain.yaml successfully', {
        toolCount: Object.keys(config.commands).length,
        typeChecking: config.quality_checks.type_checking.length,
        linting: config.quality_checks.linting.length,
        testing: config.quality_checks.testing.length,
        formatting: config.quality_checks.formatting.length,
        complexity: config.quality_checks.complexity?.length ?? 0,
        codeSmells: config.quality_checks.code_smells?.length ?? 0,
        duplication: config.quality_checks.duplication?.length ?? 0,
        architecture: config.quality_checks.architecture?.length ?? 0,
        security: config.quality_checks.security?.length ?? 0,
      });
    } catch (error) {
      logger.error('Failed to generate toolchain.yaml', { error: error as Error });
      throw new Error(
        `Failed to generate toolchain.yaml: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
