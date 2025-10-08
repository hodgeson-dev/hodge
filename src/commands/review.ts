/**
 * Review Command
 *
 * AI-driven architectural code review for quality issues automated tools can't detect.
 * Supports file-level review in HODGE-327.1 (directory/pattern/recent in later stories).
 */

import { Command } from 'commander';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ProfileCompositionService } from '../lib/profile-composition-service.js';
import { createCommandLogger } from '../lib/logger.js';

const execAsync = promisify(exec);

export class ReviewCommand {
  private logger = createCommandLogger('review', { enableConsole: true });

  async execute(scope: string, pathOrCount: string, options?: { last?: number }): Promise<void> {
    // Validate scope
    const validScopes = ['file', 'directory', 'recent'];
    if (!validScopes.includes(scope)) {
      throw new Error(`Scope "${scope}" not supported. Valid scopes: ${validScopes.join(', ')}`);
    }

    try {
      // Get files to review based on scope
      let filesToReview: string[] = [];

      switch (scope) {
        case 'file':
          filesToReview = this.getFileScope(pathOrCount);
          break;
        case 'directory':
          filesToReview = this.getDirectoryScope(pathOrCount);
          break;
        case 'recent':
          filesToReview = await this.getRecentScope(options?.last || 1);
          break;
      }

      if (filesToReview.length === 0) {
        this.logger.warn('⚠️  No files found to review');
        return;
      }

      // Compose review context
      const compositionService = new ProfileCompositionService();
      let compositionResult;

      try {
        compositionResult = compositionService.composeReviewContext();
      } catch (error) {
        this.logger.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
        this.logger.info('\nFailed to load review context. Please check your configuration.');
        process.exit(1);
      }

      // Output review summary
      this.logger.info('🔍 Performing AI-driven code review...\n');
      this.logger.info(`**Scope**: ${scope}`);
      this.logger.info(`**Files**: ${filesToReview.length} file(s)`);
      this.logger.info(`**Profiles Loaded**: ${compositionResult.profilesLoaded.join(', ')}`);
      this.logger.info(
        `**Project Context**: ${compositionResult.projectContextComplete ? '✓ Complete' : '⚠️ Incomplete'}`
      );

      if (compositionResult.profilesMissing.length > 0) {
        this.logger.warn(`**Missing Profiles**: ${compositionResult.profilesMissing.join(', ')}`);
      }

      this.logger.info('\n---\n');
      this.logger.info('📋 Review Context Prepared');
      this.logger.info(`\nReview context includes:`);
      this.logger.info(`1. Project standards, principles, decisions, and patterns`);
      this.logger.info(`2. ${compositionResult.profilesLoaded.length} review profiles`);
      this.logger.info(`3. Precedence rules (project overrides profiles)`);
      this.logger.info(`4. Ready for AI analysis\n`);

      this.logger.info('✅ Review infrastructure ready');
      this.logger.info('\nNote: Full AI analysis integration coming in build completion.');
    } catch (error) {
      this.logger.error(
        `❌ Review failed: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  }

  /**
   * Get single file for review
   */
  private getFileScope(filePath: string): string[] {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (!statSync(filePath).isFile()) {
      throw new Error(`Path is not a file: ${filePath}`);
    }

    return [filePath];
  }

  /**
   * Get all files in directory recursively
   */
  private getDirectoryScope(dirPath: string): string[] {
    if (!existsSync(dirPath)) {
      throw new Error(`Directory not found: ${dirPath}`);
    }

    if (!statSync(dirPath).isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }

    return this.getFilesRecursive(dirPath);
  }

  /**
   * Get files changed in recent commits
   */
  private async getRecentScope(commitCount: number): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`git diff --name-only HEAD~${commitCount}..HEAD`);
      const files = stdout
        .trim()
        .split('\n')
        .filter((file) => file.length > 0)
        .filter((file) => existsSync(file)); // Only include files that still exist

      return files;
    } catch (error) {
      throw new Error(
        `Failed to get recent files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get files recursively from directory
   */
  private getFilesRecursive(dir: string): string[] {
    const files: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip .git, node_modules, and .hodge directories
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.hodge') {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath));
      } else if (entry.isFile()) {
        // Only include code files (basic filter)
        const ext = entry.name.split('.').pop() || '';
        const codeExtensions = ['ts', 'js', 'tsx', 'jsx', 'py', 'java', 'kt', 'go', 'rs'];
        if (codeExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }
}

/**
 * CLI Entry Point
 */
export function createReviewCommand(): Command {
  const command = new Command('review');

  command
    .description('AI-driven architectural code review')
    .argument('<scope>', 'Review scope (file|directory|recent)')
    .argument('[path]', 'File path, directory path, or commit count for recent scope')
    .option('--last <count>', 'Number of commits to review (for recent scope)', '1')
    .action(async (scope: string, path: string | undefined, options: { last: string }) => {
      const reviewCommand = new ReviewCommand();

      // Parse --last option for recent scope
      const lastCount = scope === 'recent' ? parseInt(options.last, 10) : undefined;

      // For recent scope, path is optional (defaults to options.last)
      const pathOrCount = path || (scope === 'recent' ? options.last : '');

      if (!pathOrCount && scope !== 'recent') {
        throw new Error(`Path argument is required for ${scope} scope`);
      }

      await reviewCommand.execute(scope, pathOrCount, { last: lastCount });
    });

  return command;
}
