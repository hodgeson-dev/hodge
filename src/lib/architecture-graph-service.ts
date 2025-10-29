/**
 * Architecture Graph Service
 * HODGE-362: Generates DOT format dependency graphs for AI codebase structure awareness
 *
 * Handles graph generation logic extracted from ship command
 * Non-blocking failures ensure graph generation never disrupts workflow
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createCommandLogger } from './logger.js';
import type { ToolchainConfig, ToolRegistryEntry } from '../types/toolchain.js';
import type { ToolRegistry } from '../types/toolchain.js';

export interface ArchitectureGraphOptions {
  /** Project root directory */
  projectRoot: string;
  /** Toolchain configuration */
  toolchainConfig: ToolchainConfig;
  /** Tool registry for finding graph commands */
  toolRegistry: ToolRegistry;
  /** Suppress warning messages */
  quiet?: boolean;
}

export interface GraphGenerationResult {
  /** Whether graph generation succeeded */
  success: boolean;
  /** Path to generated graph file (if successful) */
  graphPath?: string;
  /** Tool used for generation */
  tool?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Service for generating architecture dependency graphs
 */
export class ArchitectureGraphService {
  private logger = createCommandLogger('architecture-graph', { enableConsole: false });
  private defaultOutputPath = '.hodge/architecture-graph.dot';

  /**
   * Generate architecture graph for the project
   * Non-blocking: logs warnings on failure but doesn't throw
   */
  async generateGraph(options: ArchitectureGraphOptions): Promise<GraphGenerationResult> {
    const { projectRoot, toolchainConfig, toolRegistry, quiet = false } = options;

    try {
      // Check if codebase analysis is configured
      const analysisConfig = toolchainConfig.codebase_analysis;
      if (analysisConfig?.architecture_graph?.enabled === false) {
        this.logger.info('Architecture graph generation disabled in toolchain config');
        return { success: false, error: 'Graph generation disabled' };
      }

      // Find tool with graph_command support for this language
      const tool = this.findGraphTool(toolchainConfig.language, toolRegistry);
      if (!tool) {
        this.logger.warn(
          `No architecture graphing tool found for language: ${toolchainConfig.language}`
        );
        if (!quiet) {
          console.warn(
            `⚠️  No architecture graphing tool available for ${toolchainConfig.language}`
          );
        }
        return { success: false, error: 'No graph tool available' };
      }

      // Determine output path
      const outputPath = analysisConfig?.architecture_graph?.output_path ?? this.defaultOutputPath;
      const absoluteOutputPath = path.join(projectRoot, outputPath);

      // Ensure output directory exists
      const outputDir = path.dirname(absoluteOutputPath);
      if (!existsSync(outputDir)) {
        await fs.mkdir(outputDir, { recursive: true });
      }

      // Execute graph generation command
      this.logger.info(`Generating architecture graph using ${tool.name}`, {
        tool: tool.name,
        outputPath,
      });

      const command = tool.entry.graph_command!.replace(
        '.hodge/architecture-graph.dot',
        absoluteOutputPath
      );

      // Validate command for security (tool-registry.yaml is trusted, but validate as defense-in-depth)
      this.validateCommand(command);

      try {
        // eslint-disable-next-line sonarjs/os-command -- Command from trusted bundled tool-registry.yaml, validated above
        execSync(command, {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe', // Capture output
        });

        // Verify graph file was created
        if (existsSync(absoluteOutputPath)) {
          this.logger.info('Architecture graph generated successfully', {
            path: outputPath,
            tool: tool.name,
          });
          if (!quiet) {
            console.log(`✓ Architecture graph: ${outputPath}`);
          }
          return {
            success: true,
            graphPath: outputPath,
            tool: tool.name,
          };
        } else {
          throw new Error('Graph file not created');
        }
      } catch (execError) {
        const error = execError as Error;
        this.logger.warn('Graph generation command failed', {
          tool: tool.name,
          error: error.message,
        });
        if (!quiet) {
          console.warn(`⚠️  Failed to generate architecture graph: ${error.message}`);
        }
        return {
          success: false,
          tool: tool.name,
          error: error.message,
        };
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error('Architecture graph generation failed', { error: err });
      if (!quiet) {
        console.warn(`⚠️  Architecture graph generation failed: ${err.message}`);
      }
      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Load architecture graph content for AI context
   * Returns undefined if graph doesn't exist (graceful fallback)
   */
  async loadGraph(projectRoot: string, outputPath?: string): Promise<string | undefined> {
    const graphPath = path.join(projectRoot, outputPath ?? this.defaultOutputPath);

    if (!existsSync(graphPath)) {
      this.logger.debug('Architecture graph file not found', { path: graphPath });
      return undefined;
    }

    try {
      const content = await fs.readFile(graphPath, 'utf-8');
      this.logger.info('Architecture graph loaded', {
        path: outputPath ?? this.defaultOutputPath,
        size: content.length,
      });
      return content;
    } catch (error) {
      const err = error as Error;
      this.logger.warn('Failed to read architecture graph', {
        path: graphPath,
        error: err,
      });
      return undefined;
    }
  }

  /**
   * Find a tool that supports graph generation for the given language
   */
  private findGraphTool(
    language: string,
    toolRegistry: ToolRegistry
  ): { name: string; entry: ToolRegistryEntry } | undefined {
    for (const [toolName, toolEntry] of Object.entries(toolRegistry.tools)) {
      // Check if tool supports this language
      if (!toolEntry.languages.includes(language)) {
        continue;
      }

      // Check if tool has graph_command
      if (!toolEntry.graph_command) {
        continue;
      }

      // Check if tool includes architecture_graphing category
      if (!toolEntry.categories.includes('architecture_graphing')) {
        continue;
      }

      return { name: toolName, entry: toolEntry };
    }

    return undefined;
  }

  /**
   * Check if architecture graph exists
   */
  graphExists(projectRoot: string, outputPath?: string): boolean {
    const graphPath = path.join(projectRoot, outputPath ?? this.defaultOutputPath);
    return existsSync(graphPath);
  }

  /**
   * Validate command for basic security checks
   * Prevents shell injection even though tool-registry.yaml is a trusted source
   */
  private validateCommand(command: string): void {
    // Check for dangerous shell characters that could indicate injection
    // Allow '>' for output redirection, but reject other shell metacharacters
    const dangerousChars = [';', '&', '|', '`', '$', '(', ')', '<'];

    for (const char of dangerousChars) {
      if (command.includes(char)) {
        throw new Error(
          `Command contains potentially unsafe character '${char}': ${command.substring(0, 50)}...`
        );
      }
    }
  }
}
