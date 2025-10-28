/**
 * Review Tier Classifier
 *
 * Classifies code changes into review tiers (SKIP, QUICK, STANDARD, FULL)
 * based on configurable rules, file types, and critical path detection.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import micromatch from 'micromatch';
import { glob } from 'glob';
import { createCommandLogger } from './logger.js';
import type { GitDiffResult } from './git-diff-analyzer.js';

/**
 * Review tier levels
 */
export type ReviewTier = 'skip' | 'quick' | 'standard' | 'full';

/**
 * File type categories
 */
export type FileType = 'implementation' | 'test' | 'documentation' | 'config';

/**
 * Configuration for tier classification
 */
export interface ReviewTierConfig {
  version: string;
  critical_paths: string[];
  tier_thresholds: {
    quick: {
      max_files: number;
      max_lines: number;
      allowed_types: FileType[];
    };
    standard: {
      max_files: number;
      max_lines: number;
    };
    full: {
      min_files: number;
      min_lines: number;
    };
  };
}

/**
 * Metrics about changes
 */
export interface ChangeMetrics {
  totalFiles: number;
  totalLines: number;
  fileTypeBreakdown: Record<FileType, number>;
  hasCriticalPaths: boolean;
}

/**
 * Tier recommendation with reasoning
 */
export interface TierRecommendation {
  tier: ReviewTier;
  reason: string;
  metrics: ChangeMetrics;
}

/**
 * Service for classifying changes into review tiers
 */
export class ReviewTierClassifier {
  private logger = createCommandLogger('review-tier-classifier', { enableConsole: false });
  private config: ReviewTierConfig;
  private profilePatterns: Map<string, string[]>; // profile path -> applies_to patterns

  constructor(
    private basePath: string = process.cwd(),
    configPath: string = '.hodge/review-tier-config.yaml'
  ) {
    this.config = this.loadConfig(configPath);
    this.profilePatterns = this.loadProfilePatterns();
  }

  /**
   * Classify changes into review tier
   *
   * @param changedFiles - List of changed files from git diff
   * @returns Tier recommendation with reasoning
   */
  classifyChanges(changedFiles: GitDiffResult[]): TierRecommendation {
    this.logger.debug('Classifying changes', { fileCount: changedFiles.length });

    // Calculate metrics
    const metrics = this.calculateMetrics(changedFiles);

    // Determine tier based on rules
    const tier = this.determineTier(changedFiles, metrics);
    const reason = this.buildReason(tier, metrics, changedFiles);

    this.logger.debug('Classification complete', { tier, reason });

    return { tier, reason, metrics };
  }

  /**
   * Analyze file type using review profile patterns
   *
   * @param filePath - Path to analyze
   * @returns File type category
   */
  analyzeFileType(filePath: string): FileType {
    // Check against all profile patterns
    for (const [profilePath, patterns] of this.profilePatterns) {
      if (patterns.some((pattern) => micromatch.isMatch(filePath, pattern))) {
        // Determine type from profile directory
        if (profilePath.startsWith('testing/')) return 'test';
        if (profilePath.startsWith('languages/')) return 'implementation';
        if (profilePath.startsWith('frameworks/')) return 'implementation';
      }
    }

    // Fallback heuristics
    if (/\.(test|spec)\.(ts|js|tsx|jsx)$/.test(filePath)) return 'test';
    if (/\.md$/.test(filePath)) return 'documentation';
    if (/(package\.json|tsconfig|\.config\.|vitest\.config|eslint)/.test(filePath)) {
      return 'config';
    }

    return 'implementation';
  }

  /**
   * Check if file path matches critical paths
   *
   * @param filePath - Path to check
   * @returns True if file is in a critical path
   */
  isCriticalPath(filePath: string): boolean {
    return this.config.critical_paths.some((pattern) => micromatch.isMatch(filePath, pattern));
  }

  /**
   * Get matching review profiles for a file
   *
   * @param filePath - Path to check
   * @returns Array of matching profile paths
   */
  getMatchingProfiles(filePath: string): string[] {
    const matches: string[] = [];

    for (const [profilePath, patterns] of this.profilePatterns) {
      if (patterns.some((pattern) => micromatch.isMatch(filePath, pattern))) {
        matches.push(profilePath);
      }
    }

    return matches;
  }

  /**
   * Load configuration from YAML file
   *
   * @param configPath - Path to config file
   * @returns Configuration object
   */
  private loadConfig(configPath: string): ReviewTierConfig {
    const fullPath = join(this.basePath, configPath);

    if (!existsSync(fullPath)) {
      this.logger.warn('Config file not found, using defaults', { path: fullPath });
      return this.getDefaultConfig();
    }

    try {
      const content = readFileSync(fullPath, 'utf-8');
      const config = yaml.load(content) as ReviewTierConfig;
      this.logger.debug('Loaded config', { configPath });
      return config;
    } catch (error) {
      this.logger.error('Failed to load config, using defaults', {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   *
   * @returns Default config
   */
  private getDefaultConfig(): ReviewTierConfig {
    return {
      version: '1.0',
      critical_paths: [
        'src/lib/core/**',
        'src/commands/**',
        '.hodge/standards.md',
        '.hodge/principles.md',
      ],
      tier_thresholds: {
        quick: {
          max_files: 3,
          max_lines: 50,
          allowed_types: ['test', 'config'],
        },
        standard: {
          max_files: 10,
          max_lines: 200,
        },
        full: {
          min_files: 11,
          min_lines: 201,
        },
      },
    };
  }

  /**
   * Load review profile patterns from .hodge/review-profiles
   *
   * @returns Map of profile paths to their applies_to patterns
   */
  private loadProfilePatterns(): Map<string, string[]> {
    const patterns = new Map<string, string[]>();
    const profilesDir = join(this.basePath, '.hodge/review-profiles');

    if (!existsSync(profilesDir)) {
      this.logger.warn('Review profiles directory not found', { path: profilesDir });
      return patterns;
    }

    try {
      const profileFiles = glob.sync(`${profilesDir}/**/*.md`, { cwd: this.basePath });

      for (const profileFile of profileFiles) {
        this.loadSingleProfile(profileFile, profilesDir, patterns);
      }

      this.logger.debug('Loaded profile patterns', { count: patterns.size });
    } catch (error) {
      this.logger.error('Failed to load profile patterns', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return patterns;
  }

  private loadSingleProfile(
    profileFile: string,
    profilesDir: string,
    patterns: Map<string, string[]>
  ): void {
    try {
      const content = readFileSync(join(this.basePath, profileFile), 'utf-8');
      const appliesTo = this.extractAppliesTo(content);

      if (appliesTo) {
        const relativePath = profileFile.replace(`${profilesDir}/`, '');
        patterns.set(relativePath, appliesTo);
      }
    } catch (error) {
      this.logger.warn('Failed to parse profile', {
        file: profileFile,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private extractAppliesTo(content: string): string[] | null {
    const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(content);
    if (!frontmatterMatch) {
      return null;
    }

    const frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, unknown>;

    if (frontmatter.applies_to && Array.isArray(frontmatter.applies_to)) {
      return frontmatter.applies_to as string[];
    }

    return null;
  }

  /**
   * Calculate metrics for changed files
   *
   * @param changedFiles - Files to analyze
   * @returns Metrics object
   */
  private calculateMetrics(changedFiles: GitDiffResult[]): ChangeMetrics {
    const fileTypeBreakdown: Record<FileType, number> = {
      implementation: 0,
      test: 0,
      documentation: 0,
      config: 0,
    };

    let totalLines = 0;
    let hasCriticalPaths = false;

    for (const file of changedFiles) {
      const fileType = this.analyzeFileType(file.path);
      fileTypeBreakdown[fileType]++;
      totalLines += file.linesChanged;

      if (this.isCriticalPath(file.path)) {
        hasCriticalPaths = true;
      }
    }

    return {
      totalFiles: changedFiles.length,
      totalLines,
      fileTypeBreakdown,
      hasCriticalPaths,
    };
  }

  /**
   * Determine appropriate tier based on metrics
   *
   * @param changedFiles - Changed files
   * @param metrics - Calculated metrics
   * @returns Review tier
   */
  private determineTier(changedFiles: GitDiffResult[], metrics: ChangeMetrics): ReviewTier {
    const { totalFiles, totalLines, fileTypeBreakdown, hasCriticalPaths } = metrics;
    const thresholds = this.config.tier_thresholds;

    // Rule 1: Critical path override (highest priority)
    if (hasCriticalPaths) {
      return 'full';
    }

    // Rule 2: File/line count triggers FULL
    if (totalFiles >= thresholds.full.min_files || totalLines >= thresholds.full.min_lines) {
      return 'full';
    }

    // Rule 3: Check for SKIP (pure documentation, no critical files)
    const onlyDocs = fileTypeBreakdown.documentation === totalFiles && totalFiles > 0;
    if (onlyDocs) {
      // Make sure it's not standards.md or principles.md
      const hasNonSkippableDocs = changedFiles.some((f) => this.isCriticalPath(f.path));
      if (!hasNonSkippableDocs) {
        return 'skip';
      }
    }

    // Rule 4: Check for QUICK (test/config only, within thresholds)
    const allowedForQuick = thresholds.quick.allowed_types;
    const onlyAllowedTypes = Object.entries(fileTypeBreakdown).every(([type, count]) => {
      return count === 0 || allowedForQuick.includes(type as FileType);
    });

    if (
      onlyAllowedTypes &&
      totalFiles <= thresholds.quick.max_files &&
      totalLines <= thresholds.quick.max_lines
    ) {
      return 'quick';
    }

    // Rule 5: Check for STANDARD (within thresholds)
    if (
      totalFiles <= thresholds.standard.max_files &&
      totalLines <= thresholds.standard.max_lines
    ) {
      return 'standard';
    }

    // Default to FULL if no other rules match
    return 'full';
  }

  /**
   * Build human-readable reason for tier selection
   *
   * @param tier - Selected tier
   * @param metrics - Calculated metrics
   * @param changedFiles - Changed files
   * @returns Reason string
   */
  private buildReason(
    tier: ReviewTier,
    metrics: ChangeMetrics,
    changedFiles: GitDiffResult[]
  ): string {
    const { totalFiles, totalLines, fileTypeBreakdown, hasCriticalPaths } = metrics;

    if (hasCriticalPaths) {
      const criticalFiles = changedFiles.filter((f) => this.isCriticalPath(f.path));
      return `Critical path changes detected: ${criticalFiles.map((f) => f.path).join(', ')}`;
    }

    if (tier === 'skip') {
      return `Pure documentation changes (${totalFiles} file${totalFiles > 1 ? 's' : ''})`;
    }

    if (tier === 'quick') {
      const types = Object.entries(fileTypeBreakdown)
        .filter(([, count]) => count > 0)
        .map(([type]) => type);
      return `${types.join('/')} only: ${totalFiles} file${totalFiles > 1 ? 's' : ''}, ${totalLines} lines`;
    }

    if (tier === 'standard') {
      return `Implementation changes: ${totalFiles} file${totalFiles > 1 ? 's' : ''}, ${totalLines} lines`;
    }

    // FULL tier
    const thresholds = this.config.tier_thresholds;
    if (totalFiles >= thresholds.full.min_files) {
      return `Large change: ${totalFiles} files (threshold: ${thresholds.full.min_files})`;
    }
    if (totalLines >= thresholds.full.min_lines) {
      return `Large change: ${totalLines} lines (threshold: ${thresholds.full.min_lines})`;
    }

    return `Comprehensive review recommended`;
  }
}
