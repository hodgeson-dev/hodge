/**
 * Review Manifest Generator
 *
 * Generates review-manifest.yaml files that describe:
 * - Recommended review tier
 * - Changed files analysis
 * - Context files to load (pre-filtered by file types)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import micromatch from 'micromatch';
import * as yaml from 'js-yaml';
import { glob } from 'glob';
import * as semver from 'semver';
import { createCommandLogger } from './logger.js';
import type { TierRecommendation } from './review-tier-classifier.js';
import type { GitDiffResult } from './git-diff-analyzer.js';
import type {
  ReviewManifest,
  ChangedFile,
  ManifestContext,
  CriticalFilesSection,
} from '../types/review-manifest.js';
import type { CriticalFilesReport } from './critical-file-selector.js';

/**
 * Service for generating review manifests
 */
export class ReviewManifestGenerator {
  private logger = createCommandLogger('review-manifest-generator', { enableConsole: false });

  constructor(private basePath: string = process.cwd()) {}

  /**
   * Generate complete review manifest
   *
   * HODGE-344.2: Enhanced to support optional file list for file-based reviews
   * HODGE-360: Enhanced to include critical files section when provided
   *
   * @param feature - Feature ID
   * @param changedFiles - Git diff results
   * @param recommendation - Tier recommendation
   * @param options - Optional configuration
   * @param options.fileList - Optional explicit file list for file-based reviews
   * @param options.scope - Optional scope metadata for traceability
   * @param options.criticalFiles - Optional critical files analysis for risk-based review
   * @returns Review manifest
   */
  generateManifest(
    feature: string,
    changedFiles: GitDiffResult[],
    recommendation: TierRecommendation,
    options?: {
      fileList?: string[];
      scope?: {
        type: 'file' | 'directory' | 'commits' | 'feature';
        target: string;
      };
      criticalFiles?: CriticalFilesReport;
    }
  ): ReviewManifest {
    this.logger.debug('Generating review manifest', {
      feature,
      tier: recommendation.tier,
      fileBasedReview: !!options?.fileList,
    });

    // Build changed files list
    const changedFilesList = this.buildChangedFilesList(changedFiles);

    // Build context section
    const context = this.buildContextSection(changedFiles, recommendation.tier);

    const manifest: ReviewManifest = {
      version: '1.0',
      feature,
      generated_at: new Date().toISOString(),
      recommended_tier: recommendation.tier,
      change_analysis: {
        total_files: recommendation.metrics.totalFiles,
        total_lines: recommendation.metrics.totalLines,
        breakdown: recommendation.metrics.fileTypeBreakdown,
      },
      changed_files: changedFilesList,
      context,
    };

    // Add scope metadata if provided (HODGE-344.2)
    if (options?.scope) {
      manifest.scope = {
        type: options.scope.type,
        target: options.scope.target,
        fileCount: changedFiles.length,
      };
      this.logger.debug('Added scope metadata to manifest', { scope: manifest.scope });
    }

    // Add critical files section if provided (HODGE-360)
    if (options?.criticalFiles) {
      manifest.critical_files = this.buildCriticalFilesSection(options.criticalFiles);
      this.logger.debug('Added critical files section to manifest', {
        topFilesCount: manifest.critical_files.top_n,
      });
    }

    this.logger.debug('Manifest generated', { tier: recommendation.tier });

    return manifest;
  }

  /**
   * Filter patterns relevant to changed files
   *
   * @param changedFiles - List of changed files
   * @returns Array of relevant pattern file names
   */
  filterRelevantPatterns(changedFiles: GitDiffResult[]): string[] {
    const patternsDir = join(this.basePath, '.hodge/patterns');

    if (!existsSync(patternsDir)) {
      this.logger.warn('Patterns directory not found');
      return [];
    }

    const relevantPatterns: string[] = [];

    // Determine relevant patterns based on file types
    const hasTests = changedFiles.some((f) => /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(f.path));
    const hasImplementation = changedFiles.some(
      (f) => /\.(ts|js|tsx|jsx)$/.test(f.path) && !/\.(test|spec)\./.test(f.path)
    );
    const hasDocs = changedFiles.some((f) => /\.md$/.test(f.path));

    if (hasTests) {
      relevantPatterns.push('test-pattern.md');
    }
    if (hasImplementation) {
      relevantPatterns.push('error-boundary.md', 'input-validation.md');
    }
    if (hasDocs) {
      relevantPatterns.push('README.md');
    }

    // Filter to only include patterns that actually exist
    const existing = relevantPatterns.filter((p) => existsSync(join(patternsDir, p)));

    this.logger.debug('Filtered patterns', { count: existing.length });

    return existing;
  }

  /**
   * Filter profiles relevant to changed files
   *
   * @param changedFiles - List of changed files
   * @returns Array of relevant profile paths
   */
  filterRelevantProfiles(changedFiles: GitDiffResult[]): string[] {
    const profilesDir = join(this.basePath, '.hodge/review-profiles');

    if (!existsSync(profilesDir)) {
      this.logger.warn('Review profiles directory not found');
      return [];
    }

    const projectDependencies = this.loadProjectDependencies();
    const relevantProfiles = new Set<string>();
    const profileFiles = glob.sync(`${profilesDir}/**/*.yaml`);

    for (const profileFile of profileFiles) {
      if (this.isProfileRelevant(profileFile, changedFiles, projectDependencies)) {
        const relativePath = profileFile.replace(`${profilesDir}/`, '');
        relevantProfiles.add(relativePath);
      }
    }

    const profiles = Array.from(relevantProfiles);
    this.logger.debug('Filtered profiles', { count: profiles.length });

    return profiles;
  }

  /**
   * Load project dependencies from package.json
   */
  private loadProjectDependencies(): string[] {
    const packageJsonPath = join(this.basePath, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return [];
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      return [
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
      ];
    } catch (error) {
      this.logger.warn('Failed to parse package.json', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Check if a profile is relevant to changed files
   */
  private isProfileRelevant(
    profileFile: string,
    changedFiles: GitDiffResult[],
    projectDependencies: string[]
  ): boolean {
    try {
      const content = readFileSync(profileFile, 'utf-8');
      const profile = yaml.load(content) as Record<string, unknown>;

      if (!profile.meta) {
        return false;
      }

      const frontmatter = profile.meta as Record<string, unknown>;

      // Check dependency requirements
      if (!this.checkDependencyRequirements(frontmatter, projectDependencies)) {
        return false;
      }

      // Check if profile applies to changed files
      return this.profileMatchesChangedFiles(frontmatter, changedFiles);
    } catch (error) {
      this.logger.warn('Failed to parse profile', {
        file: profileFile,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Check if profile's dependency requirements are met
   */
  private checkDependencyRequirements(
    frontmatter: Record<string, unknown>,
    projectDependencies: string[]
  ): boolean {
    const detection = frontmatter.detection as
      | {
          dependencies?: string[];
          deps?: string[];
          files?: string[];
        }
      | undefined;

    const depsList = detection?.dependencies ?? detection?.deps;

    if (!depsList) {
      return true; // No dependency requirements
    }

    // Check if required dependencies exist
    const hasRequiredDependency = depsList.some((dep) => projectDependencies.includes(dep));

    if (!hasRequiredDependency) {
      return false;
    }

    // Check version range if specified
    const versionRange = frontmatter.version_range as string | undefined;
    if (versionRange) {
      return this.checkVersionRange(depsList[0], versionRange);
    }

    return true;
  }

  /**
   * Check if installed version satisfies required range
   */
  private checkVersionRange(dependency: string, versionRange: string): boolean {
    const packageJsonPath = join(this.basePath, 'package.json');
    const installedVersion = this.getInstalledVersion(dependency, packageJsonPath);

    if (!installedVersion || !semver.satisfies(installedVersion, versionRange)) {
      this.logger.debug('Skipping profile - version mismatch', {
        dependency,
        required: versionRange,
        installed: installedVersion,
      });
      return false;
    }

    return true;
  }

  /**
   * Check if profile applies to any changed files
   */
  private profileMatchesChangedFiles(
    frontmatter: Record<string, unknown>,
    changedFiles: GitDiffResult[]
  ): boolean {
    if (!frontmatter.applies_to || !Array.isArray(frontmatter.applies_to)) {
      return false;
    }

    const patterns = frontmatter.applies_to as string[];

    // Check if any changed file matches profile patterns
    for (const file of changedFiles) {
      if (patterns.some((pattern) => micromatch.isMatch(file.path, pattern))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get installed version of a dependency from package.json
   *
   * @param dependencyName - Name of the dependency (e.g., "vitest", "typescript")
   * @param packageJsonPath - Path to package.json
   * @returns Installed version string or null if not found
   */
  private getInstalledVersion(dependencyName: string, packageJsonPath: string): string | null {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      const version =
        packageJson.dependencies?.[dependencyName] ?? packageJson.devDependencies?.[dependencyName];

      if (!version) {
        this.logger.debug('Dependency not found in package.json', { dependency: dependencyName });
        return null;
      }

      // Remove version prefix (^, ~, >=, etc.) to get actual version number
      const coerced = semver.coerce(version);
      if (!coerced) {
        this.logger.warn('Failed to parse version', { dependency: dependencyName, version });
        return null;
      }

      this.logger.debug('Found installed version', {
        dependency: dependencyName,
        version: coerced.version,
      });

      return coerced.version;
    } catch (error) {
      this.logger.warn('Failed to get installed version', {
        dependency: dependencyName,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Build changed files list for manifest
   *
   * @param changedFiles - Git diff results
   * @param recommendation - Tier recommendation
   * @returns List of changed files with metadata
   */
  private buildChangedFilesList(changedFiles: GitDiffResult[]): ChangedFile[] {
    return changedFiles.map((file) => {
      // Determine file type (simplified - could use ReviewTierClassifier)
      let changeType: ChangedFile['change_type'] = 'implementation';
      if (/\.(test|spec)\.(ts|js|tsx|jsx)$/.test(file.path)) {
        changeType = 'test';
      } else if (/\.md$/.test(file.path)) {
        changeType = 'documentation';
      } else if (/(package\.json|tsconfig|\.config\.)/.test(file.path)) {
        changeType = 'config';
      }

      return {
        path: file.path,
        lines_changed: file.linesChanged,
        change_type: changeType,
      };
    });
  }

  /**
   * Build context section based on tier
   *
   * @param changedFiles - Changed files
   * @param tier - Review tier
   * @returns Context section
   */
  private buildContextSection(changedFiles: GitDiffResult[], tier: string): ManifestContext {
    // Filter patterns and profiles
    const patterns = this.filterRelevantPatterns(changedFiles);
    const profiles = this.filterRelevantProfiles(changedFiles);

    // Build context based on tier (Decision 5: skip decisions.md in STANDARD)
    const context: ManifestContext = {
      project_standards: {
        path: '.hodge/standards.md',
        precedence: 1,
        required_for_tiers: ['quick', 'standard', 'full'],
      },
      project_principles: {
        path: '.hodge/principles.md',
        precedence: 2,
        required_for_tiers: ['standard', 'full'],
      },
      matched_patterns: {
        precedence: 4,
        required_for_tiers: ['quick', 'standard', 'full'],
        files: patterns.map((p) => p),
      },
      matched_profiles: {
        precedence: 5,
        required_for_tiers: ['quick', 'standard', 'full'],
        files: profiles,
      },
    };

    // Add decisions.md only for FULL tier (Decision 5)
    if (tier === 'full') {
      const decisionsPath = '.hodge/decisions.md';
      if (existsSync(join(this.basePath, decisionsPath))) {
        context.project_decisions = {
          path: decisionsPath,
          precedence: 3,
          required_for_tiers: ['full'],
          note: 'Large file - read selectively if needed',
        };
      }

      // Add lessons learned for FULL tier
      const lessonsDir = join(this.basePath, '.hodge/lessons');
      if (existsSync(lessonsDir)) {
        context.lessons_learned = {
          precedence: 6,
          required_for_tiers: ['full'],
          files: [],
          note: 'Read relevant lessons as needed',
        };
      }
    }

    return context;
  }

  /**
   * Build critical files section from CriticalFilesReport (HODGE-360)
   *
   * @param report - Critical files analysis report
   * @returns Critical files section for manifest
   */
  private buildCriticalFilesSection(report: CriticalFilesReport): CriticalFilesSection {
    return {
      algorithm: report.algorithm,
      total_files: report.allFiles.length,
      top_n: report.topFiles.length,
      files: report.topFiles.map((file, index) => ({
        path: file.path,
        rank: index + 1,
        score: file.score,
        risk_factors: file.riskFactors,
      })),
    };
  }
}
