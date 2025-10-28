/**
 * File/Tool Integration for HODGE.md
 * Handles file I/O and tool-specific enhancements
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Handles file writing and tool-specific enhancements
 */
export class HodgeMDFileWriter {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();
  }

  /**
   * Save HODGE.md to file system
   */
  async saveToFile(markdown: string, outputPath?: string): Promise<void> {
    const filePath = outputPath ?? path.join(this.basePath, '.hodge', 'HODGE.md');
    await fs.writeFile(filePath, markdown, 'utf-8');
  }

  /**
   * Detect which AI tool is being used based on file markers
   */
  async detectAITool(): Promise<string> {
    // Check for various AI tool indicators
    try {
      await fs.access('.claude');
      return 'claude';
    } catch {
      // Not Claude
    }

    try {
      await fs.access('.cursorrules');
      return 'cursor';
    } catch {
      // Not Cursor
    }

    try {
      await fs.access('.github/copilot');
      return 'copilot';
    } catch {
      // Not Copilot
    }

    return 'generic';
  }

  /**
   * Add tool-specific optimizations based on detected AI tool
   */
  async addToolSpecificEnhancements(hodgeMDPath: string): Promise<void> {
    const tool = await this.detectAITool();

    switch (tool) {
      case 'claude':
        // Create symlink for Claude compatibility
        try {
          const claudePath = path.join('.claude', 'CLAUDE.md');
          await fs.mkdir('.claude', { recursive: true });
          await fs.symlink(path.resolve(hodgeMDPath), claudePath);
        } catch {
          // Symlink might already exist or not be supported
        }
        break;

      case 'cursor':
        // Add cursor-specific rules
        try {
          await fs.readFile(hodgeMDPath, 'utf-8');
          const cursorRules = this.extractCursorRules();
          await fs.writeFile('.cursorrules', cursorRules, 'utf-8');
        } catch {
          // Cursor rules generation failed
        }
        break;

      default:
        // No specific enhancements for generic tools
        break;
    }
  }

  private extractCursorRules(): string {
    // Extract key rules for Cursor from HODGE.md
    const rules = [
      'You are working with Hodge, an AI development framework.',
      'Current mode and context are defined in .hodge/HODGE.md',
      'Follow the standards and patterns documented there.',
      'Use the suggested next steps as guidance.',
    ];

    return rules.join('\n');
  }
}
