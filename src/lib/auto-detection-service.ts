/**
 * Auto-Detection Service
 *
 * Evaluates detection rules from review profiles against a project
 * to determine which profiles apply.
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import type { DetectionRules } from './frontmatter-parser.js';
import type { ProfileEntry } from './profile-discovery-service.js';
import { createCommandLogger } from './logger.js';

/**
 * Detection result for a single profile
 */
export interface DetectionResult {
  /** Profile that was checked */
  profile: ProfileEntry;

  /** Whether the profile was detected */
  detected: boolean;

  /** Reason for detection (or non-detection) */
  reason: string;
}

/**
 * Service for auto-detecting applicable review profiles
 */
export class AutoDetectionService {
  private logger = createCommandLogger('auto-detection', { enableConsole: false });

  /**
   * Creates a new AutoDetectionService
   * @param projectRoot - Root directory of the project to analyze
   */
  constructor(private projectRoot: string) {}

  /**
   * Detect which profiles apply to the project
   *
   * @param profiles - Profiles with detection rules to evaluate
   * @returns Detection results for each profile
   */
  async detectProfiles(profiles: ProfileEntry[]): Promise<DetectionResult[]> {
    this.logger.debug('Starting auto-detection', {
      projectRoot: this.projectRoot,
      profileCount: profiles.length,
    });

    const results: DetectionResult[] = [];

    // Load package.json once for all detection checks
    const packageJson = await this.loadPackageJson();

    for (const profile of profiles) {
      try {
        let detected: { match: boolean; reason: string };

        if (!profile.detection) {
          // No explicit detection rules - use applies_to globs if available
          if (profile.frontmatter.applies_to && profile.frontmatter.applies_to.length > 0) {
            detected = await this.checkAppliesTo(profile.frontmatter.applies_to);
            this.logger.debug(`Using applies_to detection for ${profile.path}`, {
              detected: detected.match,
              reason: detected.reason,
            });
          } else {
            // No detection rules and no applies_to - skip
            this.logger.debug(
              `Skipping profile without detection rules or applies_to: ${profile.path}`
            );
            continue;
          }
        } else {
          // Has explicit detection rules
          detected = await this.evaluateDetectionRules(profile.detection, packageJson);
        }

        results.push({
          profile,
          detected: detected.match,
          reason: detected.reason,
        });

        this.logger.debug(`Detection result for ${profile.path}`, {
          detected: detected.match,
          reason: detected.reason,
        });
      } catch (error) {
        // Log error but continue with other profiles
        this.logger.warn(`Detection failed for ${profile.path}`, {
          error: error instanceof Error ? error.message : String(error),
        });

        results.push({
          profile,
          detected: false,
          reason: `Detection error: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    const detectedCount = results.filter((r) => r.detected).length;
    this.logger.debug('Auto-detection complete', {
      total: results.length,
      detected: detectedCount,
    });

    return results;
  }

  /**
   * Evaluate detection rules for a single profile
   *
   * @param rules - Detection rules to evaluate
   * @param packageJson - Parsed package.json (null if not found)
   * @returns Match result and reason
   */
  private async evaluateDetectionRules(
    rules: DetectionRules,
    packageJson: Record<string, unknown> | null
  ): Promise<{ match: boolean; reason: string }> {
    const matchMode = rules.match || 'any'; // Default to 'any' (OR logic)
    const checks: { type: string; matched: boolean; details: string }[] = [];

    // Check files
    if (rules.files && rules.files.length > 0) {
      const fileResults = await Promise.all(
        rules.files.map(async (file) => {
          const filePath = path.join(this.projectRoot, file);
          const exists = await fs.pathExists(filePath);
          return { file, exists };
        })
      );

      const matchedFiles = fileResults.filter((r) => r.exists);

      if (matchedFiles.length > 0) {
        checks.push({
          type: 'files',
          matched: true,
          details: `Found: ${matchedFiles.map((r) => r.file).join(', ')}`,
        });
      } else {
        checks.push({
          type: 'files',
          matched: false,
          details: `Not found: ${rules.files.join(', ')}`,
        });
      }
    }

    // Check dependencies
    if (rules.dependencies && rules.dependencies.length > 0) {
      if (!packageJson) {
        checks.push({
          type: 'dependencies',
          matched: false,
          details: 'No package.json found',
        });
      } else {
        const allDeps = {
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {}),
        };

        const matchedDeps = rules.dependencies.filter((dep) => dep in allDeps);

        if (matchedDeps.length > 0) {
          checks.push({
            type: 'dependencies',
            matched: true,
            details: `Found: ${matchedDeps.join(', ')}`,
          });
        } else {
          checks.push({
            type: 'dependencies',
            matched: false,
            details: `Not found: ${rules.dependencies.join(', ')}`,
          });
        }
      }
    }

    // Evaluate match logic
    let finalMatch: boolean;
    if (matchMode === 'all') {
      // AND logic: all checks must pass
      finalMatch = checks.length > 0 && checks.every((c) => c.matched);
    } else {
      // OR logic: at least one check must pass
      finalMatch = checks.some((c) => c.matched);
    }

    // Build reason string
    const matchedChecks = checks.filter((c) => c.matched);
    const failedChecks = checks.filter((c) => !c.matched);

    let reason: string;
    if (finalMatch) {
      reason = matchedChecks.map((c) => c.details).join('; ');
    } else {
      if (matchMode === 'all') {
        reason = `Failed (requires all): ${failedChecks.map((c) => c.details).join('; ')}`;
      } else {
        reason = `No matches found: ${failedChecks.map((c) => c.details).join('; ')}`;
      }
    }

    return { match: finalMatch, reason };
  }

  /**
   * Check if any files matching applies_to patterns exist
   *
   * @param patterns - Glob patterns to check
   * @returns Match result and reason
   */
  private async checkAppliesTo(patterns: string[]): Promise<{ match: boolean; reason: string }> {
    const matchedPatterns: string[] = [];

    for (const pattern of patterns) {
      try {
        const matches = await glob(pattern, {
          cwd: this.projectRoot,
          nodir: true, // Only match files, not directories
          dot: false, // Don't match hidden files
        });

        if (matches.length > 0) {
          matchedPatterns.push(
            `${pattern} (${matches.length} file${matches.length > 1 ? 's' : ''})`
          );
        }
      } catch (error) {
        this.logger.warn(`Failed to check applies_to pattern: ${pattern}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (matchedPatterns.length > 0) {
      return {
        match: true,
        reason: `Found matching files: ${matchedPatterns.join(', ')}`,
      };
    }

    return {
      match: false,
      reason: `No files matching patterns: ${patterns.join(', ')}`,
    };
  }

  /**
   * Load and parse package.json from project root
   *
   * @returns Parsed package.json or null if not found
   */
  private async loadPackageJson(): Promise<Record<string, unknown> | null> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    try {
      if (await fs.pathExists(packageJsonPath)) {
        this.logger.debug('Loaded package.json for detection');
        return (await fs.readJson(packageJsonPath)) as Record<string, unknown>;
      }
    } catch (error) {
      this.logger.warn('Failed to load package.json', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return null;
  }
}
