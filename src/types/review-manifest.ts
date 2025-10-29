/**
 * Type definitions for review manifest
 *
 * The review manifest is a YAML file that describes:
 * - Recommended review tier
 * - Analysis of changed files
 * - Context files to load for each tier
 */

import type { ReviewTier, FileType } from '../lib/review-tier-classifier.js';

/**
 * Scope metadata for file-based reviews (HODGE-344.2)
 */
export interface ScopeMetadata {
  /** Type of scope used */
  type: 'file' | 'directory' | 'commits' | 'feature';

  /** Target of the scope (file path, directory, commit count, or feature ID) */
  target: string;

  /** Number of files in scope */
  fileCount: number;
}

/**
 * Complete review manifest structure
 */
export interface ReviewManifest {
  /** Manifest version */
  version: string;

  /** Feature being reviewed */
  feature: string;

  /** Timestamp when manifest was generated */
  generated_at: string;

  /** Recommended review tier from classification */
  recommended_tier: ReviewTier;

  /** Analysis of changes */
  change_analysis: ChangeAnalysis;

  /** List of changed files with details */
  changed_files: ChangedFile[];

  /** Context files to load, organized by precedence */
  context: ManifestContext;

  /** Optional scope metadata for file-based reviews (HODGE-344.2) */
  scope?: ScopeMetadata;

  /** Optional critical files section for risk-based review prioritization (HODGE-360) */
  critical_files?: CriticalFilesSection;
}

/**
 * Analysis of changes
 */
export interface ChangeAnalysis {
  /** Total number of files changed */
  total_files: number;

  /** Total lines changed (added + deleted) */
  total_lines: number;

  /** Breakdown by file type */
  breakdown: Record<FileType, number>;
}

/**
 * Single changed file entry
 */
export interface ChangedFile {
  /** File path relative to repository root */
  path: string;

  /** Total lines changed in this file */
  lines_changed: number;

  /** Type of file */
  change_type: FileType;
}

/**
 * Context files organized by precedence
 */
export interface ManifestContext {
  /** Project standards (precedence 1) */
  project_standards: ContextFile;

  /** Project principles (precedence 2) */
  project_principles: ContextFile;

  /** Project decisions (precedence 3, optional for FULL tier only) */
  project_decisions?: ContextFile;

  /** Matched patterns (precedence 4) */
  matched_patterns: ContextFileList;

  /** Matched review profiles (precedence 5) */
  matched_profiles: ContextFileList;

  /** Lessons learned (precedence 6, optional for FULL tier only) */
  lessons_learned?: ContextFileList;
}

/**
 * Single context file reference
 */
export interface ContextFile {
  /** Path to file */
  path: string;

  /** Precedence level (lower = higher precedence) */
  precedence: number;

  /** Which tiers require this file */
  required_for_tiers: ReviewTier[];

  /** Optional note about the file */
  note?: string;
}

/**
 * List of context files (for patterns, profiles, lessons)
 */
export interface ContextFileList {
  /** Precedence level */
  precedence: number;

  /** Which tiers require these files */
  required_for_tiers: ReviewTier[];

  /** List of file paths */
  files: string[];

  /** Optional note */
  note?: string;
}

/**
 * Critical files section with risk scoring (HODGE-360)
 */
export interface CriticalFilesSection {
  /** Algorithm version for tracking */
  algorithm: string;

  /** Total files analyzed */
  total_files: number;

  /** Number of top files selected */
  top_n: number;

  /** Top N files ranked by risk score */
  files: CriticalFileEntry[];
}

/**
 * Single critical file entry with risk analysis (HODGE-360)
 */
export interface CriticalFileEntry {
  /** File path relative to repository root */
  path: string;

  /** Rank in priority order (1 = highest priority) */
  rank: number;

  /** Risk score (higher = more critical) */
  score: number;

  /** Human-readable risk factors */
  risk_factors: string[];
}
