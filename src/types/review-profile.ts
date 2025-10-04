/**
 * Review Profile Types
 *
 * Defines the schema for YAML review profiles that specify code quality criteria.
 * Profiles use a layered system where project standards override profile defaults.
 */

export interface ReviewProfile {
  /** Profile name (e.g., "Default Code Quality") */
  name: string;

  /** Profile description */
  description: string;

  /** File patterns this profile applies to (glob patterns) */
  applies_to: string[];

  /** Review criteria to check */
  criteria: ReviewCriteria[];
}

export interface ReviewCriteria {
  /** Criteria name (e.g., "Single Responsibility Principle") */
  name: string;

  /** Severity level for findings */
  severity: SeverityLevel;

  /** Natural language patterns for AI to check */
  patterns: string[];

  /** Optional reference to project files (e.g., ".hodge/lessons/") */
  reference?: string;

  /** Optional custom AI instructions for analysis guidance */
  custom_instructions?: string;
}

export type SeverityLevel = 'blocker' | 'warning' | 'suggestion';

export interface ReviewFinding {
  /** Criteria name that triggered this finding */
  criteria: string;

  /** Severity level */
  severity: SeverityLevel;

  /** Description of the issue */
  description: string;

  /** File path */
  file: string;

  /** Line number (if applicable) */
  line?: number;

  /** Why this matters (rationale) */
  rationale: string;

  /** Suggested /explore command to fix */
  suggested_action: string;
}

export interface ReviewReport {
  /** File path that was reviewed */
  file: string;

  /** Profile used */
  profile: string;

  /** Findings grouped by severity */
  blockers: ReviewFinding[];
  warnings: ReviewFinding[];
  suggestions: ReviewFinding[];

  /** Timestamp */
  timestamp: string;
}

export interface ProjectContext {
  /** Content from .hodge/standards.md */
  standards: string;

  /** Content from .hodge/principles.md */
  principles: string;

  /** List of pattern files */
  patterns: string[];

  /** List of lesson files */
  lessons: string[];
}
