/**
 * ToolchainGenerator: Generates toolchain.yaml from detected tools
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 */

import { promises as fs } from 'fs';
import { dirname } from 'path';
import yaml from 'js-yaml';
import type { DetectedTool, ToolchainConfig } from '../types/toolchain.js';
import { ToolRegistryLoader } from './tool-registry-loader.js';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('toolchain-generator');

/**
 * Service for generating toolchain.yaml from detected tools
 */
export class ToolchainGenerator {
  private registryLoader: ToolRegistryLoader;

  constructor(registryLoader?: ToolRegistryLoader) {
    this.registryLoader = registryLoader ?? new ToolRegistryLoader();
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
          // Map registry categories to toolchain quality_checks
          if (category === 'type_checking' && toolInfo.default_command) {
            config.quality_checks.type_checking.push(detectedTool.name);
          } else if (category === 'linting' && toolInfo.default_command) {
            config.quality_checks.linting.push(detectedTool.name);
          } else if (category === 'testing' && toolInfo.default_command) {
            config.quality_checks.testing.push(detectedTool.name);
          } else if (category === 'formatting' && toolInfo.default_command) {
            config.quality_checks.formatting.push(detectedTool.name);
          }
        }

        // Add command configuration if default_command exists
        if (toolInfo.default_command) {
          config.commands[detectedTool.name] = {
            command: toolInfo.default_command,
            provides: toolInfo.categories,
          };
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
      });
    } catch (error) {
      logger.error('Failed to generate toolchain.yaml', { error: error as Error });
      throw new Error(
        `Failed to generate toolchain.yaml: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
