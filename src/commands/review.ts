/**
 * Review Command
 *
 * AI-driven architectural code review for quality issues automated tools can't detect.
 * Supports file-level review in HODGE-327.1 (directory/pattern/recent in later stories).
 */

import { Command } from 'commander';
import { existsSync, readFileSync } from 'fs';
import { ProfileLoader } from '../lib/profile-loader.js';
import { ContextAggregator } from '../lib/context-aggregator.js';
import type { ReviewProfile, ProjectContext } from '../types/review-profile.js';

export class ReviewCommand {
  execute(scope: string, filePath: string): void {
    // Validate scope (only 'file' supported in HODGE-327.1)
    if (scope !== 'file') {
      throw new Error(
        `Scope "${scope}" not supported in HODGE-327.1. Only "file" scope is available. Future: directory, pattern, recent`
      );
    }

    try {
      // Load profile
      const profileLoader = new ProfileLoader();
      let profile: ReviewProfile;
      try {
        profile = profileLoader.loadProfile('default');
      } catch (error) {
        console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
        console.log('\nPlease ensure .hodge/review-profiles/default.yml exists.');
        process.exit(1);
      }

      // Load project context (standards, principles, patterns, lessons)
      const contextAggregator = new ContextAggregator();
      const context: ProjectContext = contextAggregator.loadContext();

      // Validate target file exists
      if (!existsSync(filePath)) {
        console.error(`❌ Error: File not found: ${filePath}`);
        console.log('\nPlease check the file path and try again.');
        process.exit(1);
      }

      // Read target file (will be used in future AI integration)
      const _fileContent = readFileSync(filePath, 'utf-8');
      void _fileContent; // Suppress unused warning - placeholder for HODGE-327.2+

      // Output review context for AI (slash command template will process this)
      console.log('🔍 Performing AI-driven code review...\n');
      console.log(`**File**: ${filePath}`);
      console.log(`**Profile**: ${profile.name}`);
      console.log(`**Standards Loaded**: ${context.standards ? '✓' : '⚠️ Missing'}`);
      console.log(`**Principles Loaded**: ${context.principles ? '✓' : '⚠️ Missing'}`);
      console.log(`**Patterns**: ${context.patterns.length} files`);
      console.log(`**Lessons**: ${context.lessons.length} files`);
      console.log('\n---\n');

      // TODO: In HODGE-327.1, this is a placeholder
      // The actual AI analysis happens via the slash command template
      // For now, just output the context that would be passed to AI
      console.log('📋 Review Context Prepared');
      console.log(`\nTo complete the review, the slash command template will:`);
      console.log(`1. Analyze ${filePath} using ${profile.name} profile`);
      console.log(`2. Check against ${context.lessons.length} lessons learned`);
      console.log(`3. Apply ${profile.criteria.length} review criteria`);
      console.log(`4. Generate markdown report with findings\n`);

      // In a complete implementation, we would:
      // 1. Format all context into a structured payload
      // 2. Pass to slash command template via some mechanism
      // 3. Capture AI-generated report
      // 4. Display formatted report to user
      //
      // For HODGE-327.1 story, the integration with slash commands
      // is pending - focusing on core infrastructure first.

      console.log('✅ Review infrastructure ready');
      console.log('\nNote: Full AI analysis integration coming in build completion.');
    } catch (error) {
      console.error(`❌ Review failed: ${error instanceof Error ? error.message : String(error)}`);
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
