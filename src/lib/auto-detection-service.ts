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
    const packageJson = await this.loadPackageJson();

    for (const profile of profiles) {
      const result = await this.detectSingleProfile(profile, packageJson);
      if (result) {
        results.push(result);
      }
    }

    this.logDetectionSummary(results);
    return results;
  }

  /**
   * Detect a single profile
   */
  private async detectSingleProfile(
    profile: ProfileEntry,
    packageJson: Record<string, unknown> | null
  ): Promise<DetectionResult | null> {
    try {
      const detected = await this.runProfileDetection(profile, packageJson);

      if (!detected) {
        return null; // Skip profiles without detection rules
      }

      this.logger.debug(`Detection result for ${profile.path}`, {
        detected: detected.match,
        reason: detected.reason,
      });

      return {
        profile,
        detected: detected.match,
        reason: detected.reason,
      };
    } catch (error) {
      return this.createErrorResult(profile, error);
    }
  }

  /**
   * Run detection for a profile
   */
  private async runProfileDetection(
    profile: ProfileEntry,
    packageJson: Record<string, unknown> | null
  ): Promise<{ match: boolean; reason: string } | null> {
    if (!profile.detection) {
      return this.detectViaAppliesTo(profile);
    }

    return await this.evaluateDetectionRules(profile.detection, packageJson);
  }

  /**
   * Detect using applies_to globs
   */
  private async detectViaAppliesTo(
    profile: ProfileEntry
  ): Promise<{ match: boolean; reason: string } | null> {
    if (profile.frontmatter.applies_to && profile.frontmatter.applies_to.length > 0) {
      const detected = await this.checkAppliesTo(profile.frontmatter.applies_to);
      this.logger.debug(`Using applies_to detection for ${profile.path}`, {
        detected: detected.match,
        reason: detected.reason,
      });
      return detected;
    }

    this.logger.debug(`Skipping profile without detection rules or applies_to: ${profile.path}`);
    return null;
  }

  /**
   * Create error result for failed detection
   */
  private createErrorResult(profile: ProfileEntry, error: unknown): DetectionResult {
    this.logger.warn(`Detection failed for ${profile.path}`, {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      profile,
      detected: false,
      reason: `Detection error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  /**
   * Log detection summary
   */
  private logDetectionSummary(results: DetectionResult[]): void {
    const detectedCount = results.filter((r) => r.detected).length;
    this.logger.debug('Auto-detection complete', {
      total: results.length,
      detected: detectedCount,
    });
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
    const matchMode = rules.match || 'any';
    const checks: { type: string; matched: boolean; details: string }[] = [];

    // Run all checks
    await this.checkFiles(rules, checks);
    this.checkDependencies(rules, packageJson, checks);

    // Evaluate match logic
    const finalMatch = this.evaluateMatchLogic(matchMode, checks);

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
   * Check files existence
   */
  private async checkFiles(
    rules: DetectionRules,
    checks: { type: string; matched: boolean; details: string }[]
  ): Promise<void> {
    if (!rules.files || rules.files.length === 0) {
      return;
    }

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

  /**
   * Check dependencies
   */
  private checkDependencies(
    rules: DetectionRules,
    packageJson: Record<string, unknown> | null,
    checks: { type: string; matched: boolean; details: string }[]
  ): void {
    if (!rules.dependencies || rules.dependencies.length === 0) {
      return;
    }

    if (!packageJson) {
      checks.push({
        type: 'dependencies',
        matched: false,
        details: 'No package.json found',
      });
      return;
    }

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

  /**
   * Evaluate match logic based on mode
   */
  private evaluateMatchLogic(
    matchMode: string,
    checks: { type: string; matched: boolean; details: string }[]
  ): boolean {
    if (matchMode === 'all') {
      return checks.length > 0 && checks.every((c) => c.matched);
    }
    return checks.some((c) => c.matched);
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
