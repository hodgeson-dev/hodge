/**
 * Profile Composition Service
 *
 * Composes review context by loading and concatenating:
 * 1. Project context (standards, principles, decisions, patterns)
 * 2. Reusable profiles from review-config.md
 *
 * Enforces precedence rules: project files override profile recommendations.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createCommandLogger } from './logger.js';
import { ContextAggregator } from './context-aggregator.js';
import { ReviewProfileLoader } from './review-profile-loader.js';
import type { ProjectContext } from '../types/review-profile.js';

/**
 * Result of composition with metadata
 */
export interface CompositionResult {
  /** Concatenated review context for AI */
  content: string;

  /** List of profiles that were loaded */
  profilesLoaded: string[];

  /** List of profiles that were missing (warnings) */
  profilesMissing: string[];

  /** Whether project context was complete */
  projectContextComplete: boolean;
}

/**
 * Service for composing review context from project files and profiles
 */
export class ProfileCompositionService {
  private logger = createCommandLogger('profile-composition', { enableConsole: false });
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Compose full review context by loading project files and profiles
   *
   * @returns Composition result with concatenated content and metadata
   * @throws Error if critical project files are missing
   */
  composeReviewContext(): CompositionResult {
    this.logger.debug('Starting review context composition');

    // Load project context (standards, principles, decisions, patterns, lessons)
    const contextAggregator = new ContextAggregator(this.basePath);
    const projectContext = contextAggregator.loadContext();

    // Load review-config.md to get profile list
    const profilePaths = this.loadReviewConfig();

    // Load each profile (warn on missing, don't fail)
    const { profiles, missing } = this.loadProfiles(profilePaths);

    // Build concatenated content with precedence markers
    const content = this.buildConcatenatedContent(projectContext, profiles, missing);

    // Check if project context is complete
    const projectContextComplete = this.isProjectContextComplete(projectContext);

    return {
      content,
      profilesLoaded: profiles.map((p) => p.name),
      profilesMissing: missing,
      projectContextComplete,
    };
  }

  /**
   * Load review-config.md and extract profile paths
   *
   * @returns Array of profile paths from Active Profiles section
   */
  private loadReviewConfig(): string[] {
    const configPath = join(this.basePath, '.hodge', 'review-config.md');

    if (!existsSync(configPath)) {
      this.logger.warn('review-config.md not found, using default profiles only');
      // Return default profiles if no config exists
      return ['languages/general-coding-standards', 'testing/general-test-standards'];
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      return this.parseProfilePaths(content);
    } catch (error) {
      this.logger.error('Failed to read review-config.md', { error });
      throw new Error(
        `Could not read review-config.md: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Parse profile paths from review-config.md content
   *
   * Looks for lines like: - `languages/typescript-5.x.md` - Description
   *
   * @param content - review-config.md content
   * @returns Array of profile paths (without .md extension)
   */
  private parseProfilePaths(content: string): string[] {
    const paths: string[] = [];
    const lines = content.split('\n');

    let inActiveProfiles = false;

    for (const line of lines) {
      // Check for Active Profiles section
      if (line.trim() === '## Active Profiles') {
        inActiveProfiles = true;
        continue;
      }

      // Stop at next ## heading (but not ### subsections)
      if (inActiveProfiles && line.trim().startsWith('## ') && !line.trim().startsWith('### ')) {
        break;
      }

      // Parse profile line: - `path/to/profile.md` - Description
      // Skip ### subsection headers
      if (inActiveProfiles && line.trim().startsWith('- `')) {
        const match = /- `([^`]+)`/.exec(line);
        if (match) {
          // Remove .md extension if present
          const path = match[1].replace(/\.md$/, '');
          paths.push(path);
        }
      }
    }

    this.logger.debug('Parsed profile paths from review-config.md', { count: paths.length, paths });

    return paths;
  }

  /**
   * Load profiles from paths, warning on missing files
   *
   * @param profilePaths - Array of profile paths (relative to review-profiles/)
   * @returns Object with loaded profiles and missing paths
   */
  private loadProfiles(profilePaths: string[]): {
    profiles: Array<{ name: string; content: string }>;
    missing: string[];
  } {
    const profileLoader = new ReviewProfileLoader(this.basePath);
    const profiles: Array<{ name: string; content: string }> = [];
    const missing: string[] = [];

    for (const profilePath of profilePaths) {
      try {
        const profile = profileLoader.loadProfile(profilePath);
        profiles.push({
          name: profile.name,
          content: profile.content,
        });
        this.logger.debug('Loaded profile', { name: profile.name });
      } catch (error) {
        // Profile missing - warn but continue
        this.logger.warn('Profile not found, skipping', { path: profilePath });
        missing.push(profilePath);
      }
    }

    return { profiles, missing };
  }

  /**
   * Build concatenated content with precedence markers
   *
   * @param projectContext - Project context from ContextAggregator
   * @param profiles - Loaded review profiles
   * @param missingProfiles - List of missing profile paths
   * @returns Concatenated markdown content for AI
   */
  private buildConcatenatedContent(
    projectContext: ProjectContext,
    profiles: Array<{ name: string; content: string }>,
    missingProfiles: string[]
  ): string {
    const sections: string[] = [];

    // Header with precedence rules
    sections.push('# REVIEW CONTEXT - PRECEDENCE RULES');
    sections.push('');
    sections.push(
      'The following context is loaded for this review. **CRITICAL**: Project-specific'
    );
    sections.push(
      'files (.hodge/standards.md, principles.md, decisions.md, patterns) take PRECEDENCE'
    );
    sections.push('over reusable profiles. If there is ANY conflict between project standards and');
    sections.push(
      'profile recommendations, the PROJECT STANDARD wins. Always defer to project standards.'
    );
    sections.push('');

    // Missing profiles warning (if any)
    if (missingProfiles.length > 0) {
      sections.push('⚠️ **MISSING PROFILES**:');
      for (const path of missingProfiles) {
        sections.push(`- ${path}.md (listed in review-config.md but file does not exist)`);
      }
      sections.push('');
      sections.push('Continuing review with available profiles...');
      sections.push('');
    }

    // Project Context (HIGHEST PRECEDENCE)
    sections.push('## Project Context (HIGHEST PRECEDENCE)');
    sections.push('');

    // Standards
    if (projectContext.standards) {
      sections.push('### Project Standards (.hodge/standards.md)');
      sections.push('');
      sections.push(projectContext.standards);
      sections.push('');
    }

    // Principles
    if (projectContext.principles) {
      sections.push('### Project Principles (.hodge/principles.md)');
      sections.push('');
      sections.push(projectContext.principles);
      sections.push('');
    }

    // Decisions (load from .hodge/decisions.md)
    const decisionsContent = this.loadDecisions();
    if (decisionsContent) {
      sections.push('### Project Decisions (.hodge/decisions.md)');
      sections.push('');
      sections.push(decisionsContent);
      sections.push('');
    }

    // Patterns (load each pattern file)
    if (projectContext.patterns.length > 0) {
      sections.push('### Project Patterns (.hodge/patterns/)');
      sections.push('');
      for (const patternPath of projectContext.patterns) {
        try {
          const patternContent = readFileSync(patternPath, 'utf-8');
          sections.push(patternContent);
          sections.push('');
        } catch (error) {
          this.logger.warn('Could not read pattern file', { path: patternPath });
        }
      }
    }

    // Lessons (load each lesson file)
    if (projectContext.lessons.length > 0) {
      sections.push('### Project Lessons (.hodge/lessons/)');
      sections.push('');
      for (const lessonPath of projectContext.lessons) {
        try {
          const lessonContent = readFileSync(lessonPath, 'utf-8');
          sections.push(lessonContent);
          sections.push('');
        } catch (error) {
          this.logger.warn('Could not read lesson file', { path: lessonPath });
        }
      }
    }

    // Reusable Review Profiles (LOWER PRECEDENCE)
    sections.push('---');
    sections.push('');
    sections.push('## Reusable Review Profiles (LOWER PRECEDENCE)');
    sections.push('');
    sections.push(
      '**Remember**: If any profile guidance conflicts with project standards above, follow the project standards.'
    );
    sections.push('');

    for (const profile of profiles) {
      sections.push(`### Profile: ${profile.name}`);
      sections.push('');
      sections.push(profile.content);
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Load decisions.md if it exists
   *
   * @returns Decisions content or empty string
   */
  private loadDecisions(): string {
    const decisionsPath = join(this.basePath, '.hodge', 'decisions.md');

    if (!existsSync(decisionsPath)) {
      return '';
    }

    try {
      return readFileSync(decisionsPath, 'utf-8');
    } catch (error) {
      this.logger.warn('Could not read decisions.md', { error });
      return '';
    }
  }

  /**
   * Check if project context is complete (no missing critical files)
   *
   * @param projectContext - Project context from ContextAggregator
   * @returns True if all critical files are present
   */
  private isProjectContextComplete(projectContext: ProjectContext): boolean {
    // Standards and principles are critical
    // Patterns and lessons are optional
    return Boolean(projectContext.standards && projectContext.principles);
  }
}
