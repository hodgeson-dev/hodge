import { promises as fs } from 'fs';
import path from 'path';
import type { PatternFile } from '../types/context-manifest.js';
import { createCommandLogger } from './logger.js';

/**
 * Service for extracting metadata from pattern files (HODGE-363)
 *
 * Extracts titles and overviews from markdown pattern files to enable
 * pattern awareness without loading full files upfront (token efficiency).
 *
 * Follows HODGE-334: CLI discovers structure (extracts metadata),
 * AI interprets content (reads full files when needed).
 */
export class PatternMetadataService {
  private logger = createCommandLogger('pattern-metadata', { enableConsole: false });

  /**
   * Extract metadata from all pattern files in directory
   *
   * @param patternsDir - Path to patterns directory (e.g., ".hodge/patterns")
   * @returns Array of pattern files with extracted metadata
   */
  async extractAllPatterns(patternsDir: string): Promise<PatternFile[]> {
    try {
      const files = await fs.readdir(patternsDir);

      // Filter for markdown files, exclude README
      const markdownFiles = files.filter(
        (file) => file.endsWith('.md') && file.toLowerCase() !== 'readme.md'
      );

      const patterns: PatternFile[] = [];

      for (const file of markdownFiles) {
        const filePath = path.join(patternsDir, file);

        try {
          const metadata = await this.extractPattern(filePath);
          if (metadata) {
            patterns.push({
              path: file,
              title: metadata.title,
              overview: metadata.overview,
            });
          }
        } catch (error) {
          // Skip files that can't be parsed
          this.logger.debug(`Failed to extract pattern from ${file}`, {
            error: error as Error,
          });
        }
      }

      return patterns;
    } catch (error) {
      this.logger.error('Failed to extract patterns', { error: error as Error });
      return [];
    }
  }

  /**
   * Extract title and overview from a single pattern file
   *
   * Expected format:
   * ```markdown
   * # Pattern Title
   *
   * ## Overview
   * This is the overview section...
   * Multiple lines...
   *
   * ## Other Section
   * ```
   *
   * @param filePath - Path to pattern markdown file
   * @returns Extracted metadata or null if parsing fails
   */
  async extractPattern(filePath: string): Promise<{ title: string; overview: string } | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Extract title from first # line
      // eslint-disable-next-line sonarjs/slow-regex
      const titleMatch = /^#\s+(.+)$/m.exec(content);
      if (!titleMatch) {
        return null;
      }

      const title = titleMatch[1].trim();

      // Extract overview section content
      const overviewMatch = /^##\s+Overview\s*\n([\s\S]*?)(?=\n##|\n#|$)/im.exec(content);
      if (!overviewMatch) {
        return null;
      }

      // Extract overview text, clean up whitespace
      let overview = overviewMatch[1].trim();

      // Truncate if too long (keep first 200 characters for token efficiency)
      if (overview.length > 200) {
        overview = overview.substring(0, 197) + '...';
      }

      return { title, overview };
    } catch (error) {
      this.logger.debug(`Failed to parse pattern file: ${filePath}`, {
        error: error as Error,
      });
      return null;
    }
  }
}
