import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { glob } from 'glob';
import { createCommandLogger } from '../lib/logger.js';
import matter from 'gray-matter';

export interface LessonsOptions {
  match?: string;
  files?: string;
}

interface LessonMetadata {
  feature?: string;
  title?: string;
  severity?: 'critical' | 'warning' | 'info';
  tags?: string[];
  related_files?: string[];
}

interface LessonMatch {
  feature: string;
  title: string;
  excerpt: string;
  confidence: 'high' | 'medium' | 'low';
  severity: 'critical' | 'warning' | 'info';
  relevance: string;
}

export class LessonsCommand {
  private logger = createCommandLogger('lessons', { enableConsole: true });

  async execute(options: LessonsOptions = {}): Promise<void> {
    const { match, files } = options;

    if (!match) {
      // No options provided - show help
      this.showHelp();
      return;
    }

    try {
      const matches = await this.matchLessons(match, files);

      // Output as JSON for AI consumption
      console.log(JSON.stringify({ lessons: matches }, null, 2));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to match lessons: ${errorMessage}`), {
        error: error as Error,
      });
      process.exit(1);
    }
  }

  private showHelp(): void {
    this.logger.info(chalk.blue('📚 Lessons Command\n'));
    this.logger.info('Match lessons based on keywords and changed files.\n');
    this.logger.info(chalk.bold('Usage:'));
    this.logger.info('  hodge lessons --match <keywords> [--files <file-paths>]\n');
    this.logger.info(chalk.bold('Options:'));
    this.logger.info('  --match <keywords>    Comma-separated keywords to search for');
    this.logger.info('  --files <file-paths>  Comma-separated file paths to check overlap\n');
    this.logger.info(chalk.bold('Examples:'));
    this.logger.info('  hodge lessons --match "subprocess,testing"');
    this.logger.info('  hodge lessons --match "subprocess" --files "src/commands/build.ts"');
  }

  /**
   * Match lessons based on keywords and optionally file paths
   */
  private async matchLessons(match: string, files?: string): Promise<LessonMatch[]> {
    // Check if lessons directory exists
    const lessonsDir = path.join('.hodge', 'lessons');
    if (!existsSync(lessonsDir)) {
      return []; // No lessons directory - return empty
    }

    // Parse keywords and files
    const keywords = this.parseKeywords(match);
    const changedFiles = this.parseFilePaths(files);

    // Find all lesson files
    const lessonFiles = await glob(path.join(lessonsDir, '*.md'), { absolute: true });

    const matches: LessonMatch[] = [];

    for (const lessonFile of lessonFiles) {
      const lessonMatch = await this.processLessonFile(lessonFile, keywords, changedFiles);
      if (lessonMatch) {
        matches.push(lessonMatch);
      }
    }

    // Sort by confidence (high → medium → low) and then by severity (critical → warning → info)
    matches.sort((a, b) => {
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      const severityOrder = { critical: 0, warning: 1, info: 2 };

      const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
      if (confDiff !== 0) return confDiff;

      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return matches;
  }

  /**
   * Calculate confidence score based on keyword matches and file overlap
   */
  private calculateConfidence(
    keywordMatches: number,
    fileOverlap: number
  ): 'high' | 'medium' | 'low' {
    // High: 3+ keyword matches + file overlap
    if (keywordMatches >= 3 && fileOverlap > 0) return 'high';

    // Medium: 2+ keyword matches OR file overlap
    if (keywordMatches >= 2 || fileOverlap > 0) return 'medium';

    // Low: 1 keyword match, no file overlap
    return 'low';
  }

  /**
   * Check if file path matches glob pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  /**
   * Extract first paragraph as excerpt
   */
  private extractExcerpt(content: string): string {
    // Remove leading/trailing whitespace
    const trimmed = content.trim();

    // Find first paragraph (text before first double newline)
    const firstParagraph = trimmed.split('\n\n')[0];

    // Remove markdown headers if present
    const withoutHeaders = firstParagraph.replace(/^#+\s+/gm, '');

    // Truncate to 200 characters
    const excerpt =
      withoutHeaders.length > 200 ? withoutHeaders.substring(0, 197) + '...' : withoutHeaders;

    return excerpt;
  }

  /**
   * Extract title from content (first heading or first line)
   */
  private extractTitle(content: string): string {
    const lines = content.trim().split('\n');

    // Look for first heading
    for (const line of lines) {
      if (line.startsWith('#')) {
        // Remove leading # characters and whitespace
        const title = line.replace(/^#+\s*/, '').trim();
        if (title) {
          return title;
        }
      }
    }

    // Fall back to first line
    return lines[0]?.trim().substring(0, 100) || 'Untitled Lesson';
  }

  /**
   * Build relevance message explaining why this lesson matches
   */
  private buildRelevance(
    changedFiles: string[],
    relatedFiles: string[],
    keywordMatches: number,
    keywords: string[]
  ): string {
    const parts: string[] = [];

    if (keywordMatches > 0) {
      parts.push(`Matches ${keywordMatches} keyword(s): ${keywords.slice(0, 3).join(', ')}`);
    }

    if (changedFiles.length > 0 && relatedFiles.length > 0) {
      // Check for overlaps
      const overlaps = changedFiles.filter((file) =>
        relatedFiles.some((pattern) => this.matchesPattern(file, pattern))
      );

      if (overlaps.length > 0) {
        parts.push(`Your changes modify ${overlaps.slice(0, 2).join(', ')}`);
      }
    }

    return parts.join('. ') || 'General match';
  }

  /**
   * Parse comma-separated keywords
   */
  private parseKeywords(match: string): string[] {
    return match
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
  }

  /**
   * Parse comma-separated file paths
   */
  private parseFilePaths(files?: string): string[] {
    return files
      ? files
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean)
      : [];
  }

  /**
   * Process a single lesson file and return match if relevant
   */
  private async processLessonFile(
    lessonFile: string,
    keywords: string[],
    changedFiles: string[]
  ): Promise<LessonMatch | null> {
    try {
      const content = await fs.readFile(lessonFile, 'utf-8');

      // Parse frontmatter if present
      const { metadata, lessonContent } = this.parseLessonFrontmatter(content);

      // Calculate keyword matches
      const keywordMatches = this.countKeywordMatches(content, keywords);

      // Only include if at least one keyword matched
      if (keywordMatches === 0) return null;

      // Calculate file overlap
      const fileOverlap = this.calculateFileOverlap(changedFiles, metadata.related_files ?? []);

      // Calculate confidence score
      const confidence = this.calculateConfidence(keywordMatches, fileOverlap);

      // Extract excerpt and feature ID
      const excerpt = this.extractExcerpt(lessonContent);
      const feature = this.extractFeatureId(lessonFile, metadata);

      // Build relevance message
      const relevance = this.buildRelevance(
        changedFiles,
        metadata.related_files ?? [],
        keywordMatches,
        keywords
      );

      return {
        feature,
        title: metadata.title ?? this.extractTitle(lessonContent),
        excerpt,
        confidence,
        severity: metadata.severity ?? 'info',
        relevance,
      };
    } catch (error) {
      // Skip files that can't be read
      this.logger.debug(`Skipping lesson file: ${lessonFile}`, { error: error as Error });
      return null;
    }
  }

  /**
   * Parse lesson frontmatter
   */
  private parseLessonFrontmatter(content: string): {
    metadata: LessonMetadata;
    lessonContent: string;
  } {
    try {
      const parsed = matter(content);
      return {
        metadata: parsed.data as LessonMetadata,
        lessonContent: parsed.content,
      };
    } catch {
      // No frontmatter or parsing failed - use content as-is
      return {
        metadata: {},
        lessonContent: content,
      };
    }
  }

  /**
   * Count keyword matches in content
   */
  private countKeywordMatches(content: string, keywords: string[]): number {
    const contentLower = content.toLowerCase();
    return keywords.filter((keyword) => contentLower.includes(keyword)).length;
  }

  /**
   * Calculate file overlap between changed files and related patterns
   */
  private calculateFileOverlap(changedFiles: string[], relatedFiles: string[]): number {
    let overlap = 0;
    for (const changedFile of changedFiles) {
      for (const pattern of relatedFiles) {
        if (this.matchesPattern(changedFile, pattern)) {
          overlap++;
          break;
        }
      }
    }
    return overlap;
  }

  /**
   * Extract feature ID from filename or metadata
   */
  private extractFeatureId(lessonFile: string, metadata: LessonMetadata): string {
    const featureIdRegex = /^(HODGE-\d+(?:\.\d+)?)/;
    const featureIdMatch = featureIdRegex.exec(path.basename(lessonFile, '.md'));
    return metadata.feature ?? featureIdMatch?.[1] ?? 'Unknown';
  }
}
