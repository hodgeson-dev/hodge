/**
 * HODGE.md Generator (Thin Orchestrator)
 * Coordinates context gathering, formatting, and file writing
 */

import * as path from 'path';
import { HodgeMDContextGatherer } from './hodge-md/hodge-md-context-gatherer.js';
import { HodgeMDFormatter } from './hodge-md/hodge-md-formatter.js';
import { HodgeMDFileWriter } from './hodge-md/hodge-md-file-writer.js';

// Re-export types for backward compatibility
export type { HodgeMDSection, HodgeMDContext } from './hodge-md/types.js';

/**
 * Generates HODGE.md files for cross-tool AI compatibility
 * Provides context about current Hodge workflow state to any AI assistant
 */
export class HodgeMDGenerator {
  private basePath: string;
  private contextGatherer: HodgeMDContextGatherer;
  private formatter: HodgeMDFormatter;
  private fileWriter: HodgeMDFileWriter;

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();
    this.contextGatherer = new HodgeMDContextGatherer(this.basePath);
    this.formatter = new HodgeMDFormatter();
    this.fileWriter = new HodgeMDFileWriter(this.basePath);
  }

  /**
   * Generate HODGE.md content for a specific feature
   * @param feature - The feature name to generate context for
   * @returns Markdown content for HODGE.md file
   * @throws Error if feature name is invalid
   */
  async generate(feature: string): Promise<string> {
    if (!feature || typeof feature !== 'string') {
      throw new Error('Feature name must be a non-empty string');
    }

    const context = await this.contextGatherer.gatherContext(feature);
    return this.formatter.formatAsMarkdown(context);
  }

  /**
   * Save generated HODGE.md to file system
   * @param feature - The feature to generate context for
   * @param outputPath - Optional custom output path (defaults to {basePath}/.hodge/HODGE.md)
   */
  async saveToFile(feature: string, outputPath?: string): Promise<void> {
    const markdown = await this.generate(feature);
    const filePath = outputPath ?? path.join(this.basePath, '.hodge', 'HODGE.md');
    await this.fileWriter.saveToFile(markdown, filePath);
  }

  /**
   * Detect which AI tool is being used based on file markers
   * @returns Tool name: 'claude', 'cursor', 'copilot', or 'generic'
   */
  async detectAITool(): Promise<string> {
    return this.fileWriter.detectAITool();
  }

  /**
   * Add tool-specific optimizations based on detected AI tool
   * @param hodgeMDPath - Path to the HODGE.md file
   */
  async addToolSpecificEnhancements(hodgeMDPath: string): Promise<void> {
    await this.fileWriter.addToolSpecificEnhancements(hodgeMDPath);
  }
}
