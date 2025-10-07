/**
 * Review Command
 *
 * AI-driven architectural code review for quality issues automated tools can't detect.
 * Supports file-level review in HODGE-327.1 (directory/pattern/recent in later stories).
 */

import { Command } from 'commander';
import { existsSync, readFileSync } from 'fs';
import { ReviewProfileLoader, type ReviewProfile } from '../lib/review-profile-loader.js';
import { ContextAggregator } from '../lib/context-aggregator.js';
import type { ProjectContext } from '../types/review-profile.js';
import { createCommandLogger } from '../lib/logger.js';

export class ReviewCommand {
  private logger = createCommandLogger('review', { enableConsole: true });
  execute(scope: string, filePath: string): void {
    // Validate scope (only 'file' supported in HODGE-327.1)
    if (scope !== 'file') {
      throw new Error(
        `Scope "${scope}" not supported in HODGE-327.1. Only "file" scope is available. Future: directory, pattern, recent`
      );
    }

    try {
      // Load profile (try new markdown format, fall back to 'default' if 'general-coding-standards' not found)
      const profileLoader = new ReviewProfileLoader();
      let profile: ReviewProfile;
      try {
        profile = profileLoader.loadProfile('general-coding-standards');
      } catch (error) {
        this.logger.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
        this.logger.info(
          '\nPlease ensure .hodge/review-profiles/general-coding-standards.md exists.'
        );
        process.exit(1);
      }

      // Load project context (standards, principles, patterns, lessons)
      const contextAggregator = new ContextAggregator();
      const context: ProjectContext = contextAggregator.loadContext();

      // Validate target file exists
      if (!existsSync(filePath)) {
        this.logger.error(`❌ Error: File not found: ${filePath}`);
        this.logger.info('\nPlease check the file path and try again.');
        process.exit(1);
      }

      // Read target file (will be used in future AI integration)
      const _fileContent = readFileSync(filePath, 'utf-8');
      void _fileContent; // Suppress unused warning - placeholder for HODGE-327.2+

      // Output review context for AI (slash command template will process this)
      this.logger.info('🔍 Performing AI-driven code review...\n');
      this.logger.info(`**File**: ${filePath}`);
      this.logger.info(`**Profile**: ${profile.name}`);
      this.logger.info(`**Standards Loaded**: ${context.standards ? '✓' : '⚠️ Missing'}`);
      this.logger.info(`**Principles Loaded**: ${context.principles ? '✓' : '⚠️ Missing'}`);
      this.logger.info(`**Patterns**: ${context.patterns.length} files`);
      this.logger.info(`**Lessons**: ${context.lessons.length} files`);
      this.logger.info('\n---\n');

      // TODO: In HODGE-327.1, this is a placeholder
      // The actual AI analysis happens via the slash command template
      // For now, just output the context that would be passed to AI
      this.logger.info('📋 Review Context Prepared');
      this.logger.info(`\nTo complete the review, the slash command template will:`);
      this.logger.info(`1. Analyze ${filePath} using ${profile.name} profile`);
      this.logger.info(`2. Check against ${context.lessons.length} lessons learned`);
      this.logger.info(`3. Apply ${profile.criteria_count} review criteria`);
      this.logger.info(`4. Generate markdown report with findings\n`);

      // In a complete implementation, we would:
      // 1. Format all context into a structured payload
      // 2. Pass to slash command template via some mechanism
      // 3. Capture AI-generated report
      // 4. Display formatted report to user
      //
      // For HODGE-327.1 story, the integration with slash commands
      // is pending - focusing on core infrastructure first.

      this.logger.info('✅ Review infrastructure ready');
      this.logger.info('\nNote: Full AI analysis integration coming in build completion.');
    } catch (error) {
      this.logger.error(
        `❌ Review failed: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  }
}

/**
 * CLI Entry Point
 */
export function createReviewCommand(): Command {
  const command = new Command('review');

  command
    .description('AI-driven architectural code review')
    .argument('<scope>', 'Review scope (file|directory|pattern|recent)')
    .argument('<path>', 'File path or pattern to review')
    .action((scope: string, path: string) => {
      const reviewCommand = new ReviewCommand();
      reviewCommand.execute(scope, path);
    });

  return command;
}
