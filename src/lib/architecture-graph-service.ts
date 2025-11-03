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
import type { ToolchainConfig } from '../types/toolchain.js';

export interface ArchitectureGraphOptions {
  /** Project root directory */
  projectRoot: string;
  /** Toolchain configuration */
  toolchainConfig: ToolchainConfig;
  /** Enable console output (for user-facing commands like init). Defaults to false */
  enableConsole?: boolean;
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
    const { projectRoot, toolchainConfig, enableConsole = false } = options;

    try {
      // Validate tool configuration
      const validation = this.validateToolConfig(toolchainConfig, enableConsole);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      const { toolName, graphCommand, outputPath: configuredPath } = validation;

      // Determine output path
      const outputPath = configuredPath ?? this.defaultOutputPath;
      const absoluteOutputPath = path.join(projectRoot, outputPath);

      // Ensure output directory exists
      const outputDir = path.dirname(absoluteOutputPath);
      if (!existsSync(outputDir)) {
        await fs.mkdir(outputDir, { recursive: true });
      }

      // Execute graph generation command
      return this.executeGraphCommand({
        toolName,
        graphCommand,
        absoluteOutputPath,
        outputPath,
        projectRoot,
        enableConsole,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error('Architecture graph generation failed', { error: err });
      if (enableConsole) {
        console.warn(`⚠️  Architecture graph generation failed: ${err.message}`);
      }
      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Execute the graph generation command and handle result
   */
  private executeGraphCommand(options: {
    toolName: string;
    graphCommand: string;
    absoluteOutputPath: string;
    outputPath: string;
    projectRoot: string;
    enableConsole: boolean;
  }): Promise<GraphGenerationResult> {
    const { toolName, graphCommand, absoluteOutputPath, outputPath, projectRoot, enableConsole } =
      options;

    this.logger.info(`Generating architecture graph using ${toolName}`, {
      tool: toolName,
      outputPath,
    });

    const command = graphCommand.replace('.hodge/architecture-graph.dot', absoluteOutputPath);

    // Validate command for security (tool-registry.yaml is trusted, but validate as defense-in-depth)
    this.validateCommand(command);

    try {
      // eslint-disable-next-line sonarjs/os-command -- Command from trusted bundled tool-registry.yaml, validated above
      execSync(command, {
        cwd: projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe', // Capture output
      });

      return Promise.resolve(
        this.verifyGraphCreation(absoluteOutputPath, outputPath, toolName, enableConsole)
      );
    } catch (execError) {
      return Promise.resolve(this.handleGraphError(execError as Error, toolName, enableConsole));
    }
  }

  /**
   * Verify that the graph file was created successfully
   */
  private verifyGraphCreation(
    absoluteOutputPath: string,
    outputPath: string,
    toolName: string,
    enableConsole: boolean
  ): GraphGenerationResult {
    if (existsSync(absoluteOutputPath)) {
      this.logger.info('Architecture graph generated successfully', {
        path: outputPath,
        tool: toolName,
      });
      if (enableConsole) {
        console.log(`✓ Architecture graph: ${outputPath}`);
      }
      return {
        success: true,
        graphPath: outputPath,
        tool: toolName,
      };
    } else {
      throw new Error('Graph file not created');
    }
  }

  /**
   * Handle errors during graph generation
   */
  private handleGraphError(
    error: Error,
    toolName: string,
    enableConsole: boolean
  ): GraphGenerationResult {
    this.logger.warn('Graph generation command failed', {
      tool: toolName,
      error: error.message,
    });
    if (enableConsole) {
      console.warn(`⚠️  Failed to generate architecture graph: ${error.message}`);
    }
    return {
      success: false,
      tool: toolName,
      error: error.message,
    };
  }

  /**
   * Validate tool configuration for graph generation
   * Returns validation result with tool details or error
   */
  private validateToolConfig(
    toolchainConfig: ToolchainConfig,
    enableConsole: boolean
  ):
    | { valid: true; toolName: string; graphCommand: string; outputPath?: string }
    | { valid: false; error: string } {
    const analysisConfig = toolchainConfig.codebase_analysis;

    // Check if graph generation is disabled
    if (analysisConfig?.architecture_graph?.enabled === false) {
      this.logger.info('Architecture graph generation disabled in toolchain config');
      return { valid: false, error: 'Graph generation disabled' };
    }

    // Check if tool is configured
    const toolName = analysisConfig?.architecture_graph?.tool;
    if (!toolName) {
      this.logger.warn('No architecture graph tool specified in toolchain config');
      if (enableConsole) {
        console.warn(`⚠️  No architecture graph tool configured`);
      }
      return { valid: false, error: 'No graph tool configured' };
    }

    // Check if tool has graph_command
    const toolConfig = toolchainConfig.commands[toolName];
    if (!toolConfig.graph_command) {
      this.logger.warn(`Tool ${toolName} does not have graph_command configured in toolchain.yaml`);
      if (enableConsole) {
        console.warn(`⚠️  Tool ${toolName} missing graph_command in .hodge/toolchain.yaml`);
      }
      return { valid: false, error: 'No graph command configured' };
    }

    return {
      valid: true,
      toolName,
      graphCommand: toolConfig.graph_command,
      outputPath: analysisConfig.architecture_graph?.output_path,
    };
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
   * Check if architecture graph exists
   */
  graphExists(projectRoot: string, outputPath?: string): boolean {
    const graphPath = path.join(projectRoot, outputPath ?? this.defaultOutputPath);
    return existsSync(graphPath);
  }

  /**
   * Validate command for basic security checks
   * Prevents shell injection even though toolchain.yaml is a trusted source
   */
  private validateCommand(command: string): void {
    // Check for dangerous shell patterns that could indicate injection
    // Allow safe constructs: '>' (redirection), '||' (boolean OR), '&&' (boolean AND)
    // Reject: ';' (chaining), single '|' (pipes), '`' (backticks), '$(' (substitution), '<' (input)
    const dangerousPatterns = [
      { pattern: /;/, description: 'command chaining (;)' },
      { pattern: /&(?!&)/, description: 'background execution (&)' },
      // HODGE-377.3: Fixed pipe detection - must not be preceded OR followed by another pipe
      { pattern: /(?<!\|)\|(?!\|)/, description: 'pipe (|)' },
      { pattern: /`/, description: 'command substitution (`)' },
      { pattern: /\$\(/, description: 'command substitution ($())' },
      { pattern: /</, description: 'input redirection (<)' },
    ];

    for (const { pattern, description } of dangerousPatterns) {
      if (pattern.test(command)) {
        throw new Error(
          `Command contains potentially unsafe ${description}: ${command.substring(0, 50)}...`
        );
      }
    }
  }
}
