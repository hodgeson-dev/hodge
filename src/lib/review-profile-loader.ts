/**
 * Review Profile Loader
 *
 * Loads markdown-based review profiles from .hodge/review-profiles/
 * Replaces the old YAML-based ProfileLoader with simplified markdown approach.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseFrontmatter, type FrontmatterData } from './frontmatter-parser.js';
import { countLevel2Headings } from './markdown-utils.js';

/**
 * Loaded review profile (markdown-based)
 */
export interface ReviewProfile {
  /** Profile name from frontmatter */
  name: string;

  /** Profile description from frontmatter */
  description: string;

  /** File patterns this profile applies to */
  applies_to: string[];

  /** Full markdown content (including headings and guidance) */
  content: string;

  /** Number of criteria (## headings) */
  criteria_count: number;

  /** Profile version from frontmatter */
  version: string;

  /** Profile scope (reusable or project) */
  scope: string;
}

export class ReviewProfileLoader {
  private profilesDir: string;

  constructor(basePath: string = process.cwd()) {
    this.profilesDir = join(basePath, '.hodge', 'review-profiles');
  }

  /**
   * Load a review profile by name
   *
   * @param profileName Name of profile (without .md extension)
   * @returns Loaded profile with metadata and content
   * @throws Error if profile not found or invalid
   */
  loadProfile(profileName: string): ReviewProfile {
    const profilePath = join(this.profilesDir, `${profileName}.md`);

    if (!existsSync(profilePath)) {
      throw new Error(`Profile not found: ${profilePath}`);
    }

    try {
      const fileContent = readFileSync(profilePath, 'utf-8');
      const { data, content } = parseFrontmatter(fileContent);

      // Build profile from frontmatter + content
      return this.buildProfile(data, content, profileName);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Profile not found')) {
        throw error;
      }
      throw new Error(
        `Invalid profile ${profileName}.md: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Build profile object from parsed frontmatter and content
   */
  private buildProfile(data: FrontmatterData, content: string, profileName: string): ReviewProfile {
    // Use frontmatter name or default to profile filename
    const name = data.name || profileName;

    // Description is required in frontmatter
    if (!data.description) {
      throw new Error(`Profile ${profileName} missing required frontmatter field: description`);
    }

    // applies_to is required (either in frontmatter or use default)
    const applies_to = data.applies_to || ['**/*'];

    // Count criteria (## headings in content)
    const criteria_count = countLevel2Headings(content);

    return {
      name,
      description: data.description,
      applies_to,
      content,
      criteria_count,
      version: data.version,
      scope: data.scope,
    };
  }
}
