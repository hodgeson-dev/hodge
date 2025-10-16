/**
 * Git Diff Analyzer
 *
 * Analyzes git changes to determine what files changed and by how much.
 * Uses `git diff HEAD --numstat` to get precise line counts.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createCommandLogger } from './logger.js';

const execAsync = promisify(exec);

/**
 * Result of analyzing a single changed file
 */
export interface GitDiffResult {
  /** File path relative to repository root */
  path: string;

  /** Number of lines added */
  linesAdded: number;

  /** Number of lines deleted */
  linesDeleted: number;

  /** Total lines changed (added + deleted) */
  linesChanged: number;
}

/**
 * Service for analyzing git diff output
 */
export class GitDiffAnalyzer {
  private logger = createCommandLogger('git-diff-analyzer', { enableConsole: false });

  /**
   * Get list of changed files with line counts
   * Includes both staged and unstaged changes
   *
   * @returns Array of changed files with statistics
   * @throws Error if not in a git repository or git command fails
   */
  async getChangedFiles(): Promise<GitDiffResult[]> {
    this.logger.debug('Getting changed files from git (staged + unstaged)');

    try {
      // Get both staged and unstaged changes
      // Staged: files that were added with 'git add'
      // Unstaged: modified tracked files not yet staged
      // --diff-filter=d excludes deleted files (prevents checking non-existent files)
      const { stdout: staged } = await execAsync('git diff --staged --numstat --diff-filter=d');
      const { stdout: unstaged } = await execAsync('git diff HEAD --numstat --diff-filter=d');

      const combined = [staged, unstaged].filter((s) => s.trim()).join('\n');

      if (!combined.trim()) {
        this.logger.debug('No changes detected (staged or unstaged)');
        return [];
      }

      const results = this.parseNumstat(combined);

      // Remove duplicates (files that appear in both staged and unstaged)
      const deduplicated = this.deduplicateResults(results);

      this.logger.debug('Parsed git diff results', {
        staged: staged.trim() ? staged.trim().split('\n').length : 0,
        unstaged: unstaged.trim() ? unstaged.trim().split('\n').length : 0,
        total: deduplicated.length,
      });

      return deduplicated;
    } catch (error) {
      this.logger.error('Failed to get git diff', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to analyze git changes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Deduplicate results by file path, summing line counts for files that appear multiple times
   *
   * @param results - Array of GitDiffResults that may contain duplicates
   * @returns Deduplicated array
   */
  private deduplicateResults(results: GitDiffResult[]): GitDiffResult[] {
    const fileMap = new Map<string, GitDiffResult>();

    for (const result of results) {
      const existing = fileMap.get(result.path);
      if (existing) {
        // File appears in both staged and unstaged - sum the changes
        fileMap.set(result.path, {
          path: result.path,
          linesAdded: existing.linesAdded + result.linesAdded,
          linesDeleted: existing.linesDeleted + result.linesDeleted,
          linesChanged: existing.linesChanged + result.linesChanged,
        });
      } else {
        fileMap.set(result.path, result);
      }
    }

    return Array.from(fileMap.values());
  }

  /**
   * Parse git rename notation to extract the actual file path
   * Git shows renames as: path/{old => new}/file or {old => new}path/file
   * We need to extract the new path: path/new/file or newpath/file
   */
  private parseRenamedPath(gitPath: string): string {
    // Match rename pattern: {old => new}
    const startBrace = gitPath.indexOf('{');
    const arrow = gitPath.indexOf(' => ', startBrace);
    const endBrace = gitPath.indexOf('}', arrow);

    if (startBrace !== -1 && arrow !== -1 && endBrace !== -1) {
      // Extract the new name from {old => new}
      const newName = gitPath.substring(arrow + 4, endBrace); // +4 to skip ' => '
      // Replace the entire {old => new} with just the new part
      return gitPath.substring(0, startBrace) + newName + gitPath.substring(endBrace + 1);
    }

    // Not a rename, return as-is
    return gitPath;
  }

  /**
   * Parse git diff --numstat output
   *
   * @param output - Raw stdout from git diff --numstat
   * @returns Parsed results
   */
  parseNumstat(output: string): GitDiffResult[] {
    const lines = output.trim().split('\n');
    const results: GitDiffResult[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Format: {added}\t{deleted}\t{filename}
      const parts = line.split('\t');
      if (parts.length < 3) {
        this.logger.warn('Skipping malformed numstat line', { line });
        continue;
      }

      const [addedStr, deletedStr, rawFilePath] = parts;

      // Parse renamed files to extract actual path
      const filePath = this.parseRenamedPath(rawFilePath);

      // Handle binary files (shows '-' for added/deleted)
      const linesAdded = addedStr === '-' ? 0 : parseInt(addedStr, 10);
      const linesDeleted = deletedStr === '-' ? 0 : parseInt(deletedStr, 10);

      if (isNaN(linesAdded) || isNaN(linesDeleted)) {
        this.logger.warn('Skipping line with invalid numbers', { line });
        continue;
      }

      results.push({
        path: filePath,
        linesAdded,
        linesDeleted,
        linesChanged: linesAdded + linesDeleted,
      });
    }

    return results;
  }
}
