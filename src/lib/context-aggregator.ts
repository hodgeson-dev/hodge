/**
 * Context Aggregator
 *
 * Loads project context (standards, principles, patterns, lessons) for review.
 * These are automatically merged into every review regardless of profile.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { ProjectContext } from '../types/review-profile.js';

export class ContextAggregator {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Load all project context for review
   * @returns Project context with standards, principles, patterns, and lessons
   */
  loadContext(): ProjectContext {
    return {
      standards: this.loadStandards(),
      principles: this.loadPrinciples(),
      patterns: this.loadPatterns(),
      lessons: this.loadLessons(),
    };
  }

  /**
   * Load standards.md content
   * Returns empty string if file doesn't exist (warn but don't fail)
   */
  private loadStandards(): string {
    const standardsPath = join(this.basePath, '.hodge', 'standards.md');
    if (!existsSync(standardsPath)) {
      console.warn('⚠️  Warning: .hodge/standards.md not found');
      return '';
    }
    return readFileSync(standardsPath, 'utf-8');
  }

  /**
   * Load principles.md content
   * Returns empty string if file doesn't exist (warn but don't fail)
   */
  private loadPrinciples(): string {
    const principlesPath = join(this.basePath, '.hodge', 'principles.md');
    if (!existsSync(principlesPath)) {
      console.warn('⚠️  Warning: .hodge/principles.md not found');
      return '';
    }
    return readFileSync(principlesPath, 'utf-8');
  }

  /**
   * Load all pattern files
   * Returns list of pattern file paths
   */
  private loadPatterns(): string[] {
    const patternsDir = join(this.basePath, '.hodge', 'patterns');
    if (!existsSync(patternsDir)) {
      console.warn('⚠️  Warning: .hodge/patterns/ directory not found');
      return [];
    }

    try {
      const files = readdirSync(patternsDir);
      return files
        .filter((file) => file.endsWith('.md'))
        .map((file) => join(patternsDir, file))
        .filter((filePath) => {
          try {
            return statSync(filePath).isFile();
          } catch {
            return false;
          }
        });
    } catch (error) {
      console.warn(
        `⚠️  Warning: Could not read .hodge/patterns/ directory: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }

  /**
   * Load all lesson files
   * Returns list of lesson file paths
   */
  private loadLessons(): string[] {
    const lessonsDir = join(this.basePath, '.hodge', 'lessons');
    if (!existsSync(lessonsDir)) {
      console.warn('⚠️  Warning: .hodge/lessons/ directory not found');
      return [];
    }

    try {
      const files = readdirSync(lessonsDir);
      return files
        .filter((file) => file.endsWith('.md'))
        .map((file) => join(lessonsDir, file))
        .filter((filePath) => {
          try {
            return statSync(filePath).isFile();
          } catch {
            return false;
          }
        });
    } catch (error) {
      console.warn(
        `⚠️  Warning: Could not read .hodge/lessons/ directory: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }

  /**
   * Read content of a context file
   * Used by slash command template to load pattern/lesson content
   */
  readContextFile(filePath: string): string {
    if (!existsSync(filePath)) {
      throw new Error(`Context file not found: ${filePath}`);
    }
    return readFileSync(filePath, 'utf-8');
  }
}
