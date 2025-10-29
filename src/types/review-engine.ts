/**
 * Review Engine Types
 * Part of HODGE-344.3: ReviewEngineService - shared review workflow core
 */

import type { ReviewManifest, ScopeMetadata } from './review-manifest.js';
import type { CriticalFilesReport } from '../lib/critical-file-selector.js';
import type { RawToolResult } from './toolchain.js';

/**
 * Configuration options for review engine
 */
export interface ReviewOptions {
  /** Scope metadata describing what's being reviewed */
  scope: {
    /** Type of scope */
    type: 'file' | 'directory' | 'commits' | 'feature';
    /** Target identifier (file path, directory, commit count, feature ID) */
    target: string;
  };
  /** Whether to enable critical file selection (risk-based prioritization) */
  enableCriticalSelection: boolean;
}

/**
 * Enriched tool result with auto-fix information
 */
export interface EnrichedToolResult {
  /** Tool name that produced this result */
  tool: string;
  /** Type of quality check performed */
  checkType: string;
  /** Whether execution succeeded (exit code 0) */
  success: boolean;
  /** Combined stdout and stderr output (raw, unparsed) */
  output: string;
  /** Whether this tool can auto-fix issues (has fix_command in registry) */
  autoFixable: boolean;
  /** Whether check was skipped */
  skipped?: boolean;
  /** Reason for skipping (if applicable) */
  reason?: string;
}

/**
 * Review findings returned to AI for interpretation
 */
export interface ReviewFindings {
  /** Raw tool results enriched with auto-fix flags */
  toolResults: EnrichedToolResult[];
  /** Raw unprocessed tool results (HODGE-359.1: for validation-results.json) */
  rawToolResults: RawToolResult[];
  /** Critical files analysis (if enabled) */
  criticalFiles?: CriticalFilesReport;
  /** Review manifest with profiles and context */
  manifest: ReviewManifest;
  /** Metadata about the review */
  metadata: {
    /** Scope of what was reviewed */
    scope: ScopeMetadata;
    /** Timestamp when review was performed */
    timestamp: string;
    /** Recommended review tier */
    tier: string;
  };
}
