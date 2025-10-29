/**
 * Type definitions for context manifest (HODGE-363)
 *
 * The context manifest is a YAML file that describes:
 * - Global project files (standards, decisions, principles, etc.)
 * - Feature-specific context files
 * - Available patterns with extracted metadata
 * - Architecture graph statistics
 *
 * This enables the /hodge slash command to load context without hardcoded bash commands,
 * following HODGE-334 separation of concerns (CLI discovers structure, AI interprets content).
 */

/**
 * File availability status
 */
export type FileStatus = 'available' | 'not_found';

/**
 * Complete context manifest structure
 */
export interface ContextManifest {
  /** Manifest version */
  version: string;

  /** Global project files (always loaded) */
  global_files: GlobalFile[];

  /** Architecture graph statistics (optional) */
  architecture_graph?: ArchitectureGraph;

  /** Available patterns with metadata */
  patterns: PatternsSection;

  /** Feature-specific context (optional) */
  feature_context?: FeatureContext;
}

/**
 * Global file reference with availability status
 */
export interface GlobalFile {
  /** Path to file relative to project root */
  path: string;

  /** Whether file exists */
  status: FileStatus;

  /** Optional note about the file */
  note?: string;
}

/**
 * Architecture graph statistics
 */
export interface ArchitectureGraph {
  /** Whether graph file exists */
  status: FileStatus;

  /** Number of modules in graph */
  modules: number;

  /** Number of dependencies in graph */
  dependencies: number;

  /** Path to graph DOT file */
  location: string;

  /** Note about graph updates */
  note: string;
}

/**
 * Patterns section with metadata extraction
 */
export interface PatternsSection {
  /** Directory containing patterns */
  location: string;

  /** Pattern files with extracted metadata */
  files: PatternFile[];
}

/**
 * Pattern file with extracted title and overview
 */
export interface PatternFile {
  /** Pattern filename (e.g., "test-pattern.md") */
  path: string;

  /** Extracted title from `# Title` line */
  title: string;

  /** Extracted overview from `## Overview` section */
  overview: string;
}

/**
 * Feature-specific context files
 */
export interface FeatureContext {
  /** Feature identifier (e.g., "HODGE-363") */
  feature_id: string;

  /** Feature files with availability status */
  files: FeatureFile[];
}

/**
 * Feature file reference with availability status
 */
export interface FeatureFile {
  /** Path to file relative to project root */
  path: string;

  /** Whether file exists */
  status: FileStatus;
}
