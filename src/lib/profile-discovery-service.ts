/**
 * Profile Discovery Service
 *
 * Scans review-profiles/ directory recursively and parses frontmatter
 * to build a registry of profiles with detection rules.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseFrontmatter,
  type FrontmatterData,
  type DetectionRules,
} from './frontmatter-parser.js';
import { createCommandLogger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Profile registry entry
 */
export interface ProfileEntry {
  /** Relative path to profile (e.g., "languages/typescript.md") */
  path: string;

  /** Profile frontmatter data */
  frontmatter: FrontmatterData;

  /** Detection rules (undefined if profile has no detection rules) */
  detection?: DetectionRules;
}

/**
 * Result of profile discovery
 */
export interface ProfileRegistry {
  /** All discovered profiles */
  profiles: ProfileEntry[];

  /** Profiles with detection rules (subset of profiles) */
  detectableProfiles: ProfileEntry[];
}

/**
 * Service for discovering and parsing review profiles
 */
export class ProfileDiscoveryService {
  private logger = createCommandLogger('profile-discovery', { enableConsole: false });

  /**
   * Creates a new ProfileDiscoveryService
   * @param profilesDir - Directory containing review profiles (defaults to review-profiles/ in package)
   */
  constructor(private profilesDir?: string) {
    // Default to review-profiles/ directory at package root
    if (!profilesDir) {
      // Navigate from src/lib/ to package root
      const packageRoot = path.resolve(__dirname, '..', '..');
      this.profilesDir = path.join(packageRoot, 'review-profiles');
    }
  }

  /**
   * Discover all review profiles and parse their frontmatter
   *
   * @returns Profile registry with all profiles and detectable profiles
   */
  async discoverProfiles(): Promise<ProfileRegistry> {
    this.logger.debug('Starting profile discovery', { profilesDir: this.profilesDir });

    const profiles: ProfileEntry[] = [];

    try {
      // Check if profiles directory exists
      if (!(await fs.pathExists(this.profilesDir!))) {
        this.logger.warn('Profiles directory does not exist', { profilesDir: this.profilesDir });
        return { profiles: [], detectableProfiles: [] };
      }

      // Scan recursively for .md files
      const mdFiles = await this.scanForMarkdownFiles(this.profilesDir!);
      this.logger.debug(`Found ${mdFiles.length} markdown files`, { files: mdFiles });

      // Parse frontmatter from each file
      for (const filePath of mdFiles) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const parsed = parseFrontmatter(content);

          // Calculate relative path from profiles directory
          const relativePath = path.relative(this.profilesDir!, filePath);

          const entry: ProfileEntry = {
            path: relativePath,
            frontmatter: parsed.data,
            detection: parsed.data.detection,
          };

          profiles.push(entry);
          this.logger.debug(`Parsed profile: ${relativePath}`, {
            hasDetection: !!entry.detection,
          });
        } catch (error) {
          // Log warning but continue (malformed profiles should not break discovery)
          this.logger.warn(`Failed to parse profile: ${filePath}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Filter profiles with detection rules
      const detectableProfiles = profiles.filter((p) => p.detection !== undefined);

      this.logger.debug('Profile discovery complete', {
        totalProfiles: profiles.length,
        detectableProfiles: detectableProfiles.length,
      });

      return {
        profiles,
        detectableProfiles,
      };
    } catch (error) {
      this.logger.error('Profile discovery failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to discover profiles: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Recursively scan directory for .md files
   *
   * @param dir - Directory to scan
   * @returns Array of absolute file paths
   */
  private async scanForMarkdownFiles(dir: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subResults = await this.scanForMarkdownFiles(fullPath);
          results.push(...subResults);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to scan directory: ${dir}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return results;
  }
}
