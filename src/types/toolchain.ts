/**
 * Toolchain configuration and tool detection types
 * Part of HODGE-341.1: Build System Detection and Toolchain Infrastructure
 */

/**
 * Detected tool information
 */
export interface DetectedTool {
  /** Tool name (e.g., 'typescript', 'eslint') */
  name: string;

  /** Whether the tool was detected */
  detected: boolean;

  /** Tool version if detected */
  // TODO: [HODGE-341.5] Persist to toolchain.yaml for version-based profile matching
  version?: string;

  /** Method used to detect the tool */
  detectionMethod?: 'config_file' | 'package_json' | 'path';
}

/**
 * Tool command configuration
 */
export interface ToolCommand {
  /** Command to execute (supports ${files} template placeholder) */
  command: string;

  /** Quality check types this tool provides */
  provides: string[];
}

/**
 * Toolchain configuration (loaded from .hodge/toolchain.yaml)
 */
export interface ToolchainConfig {
  /** Configuration version */
  version: string;

  /** Primary language (typescript, python, go, etc.) */
  language: string;

  /** Available tools with their commands */
  commands: Record<string, ToolCommand>;

  /** Mapping of quality check types to tool names */
  quality_checks: QualityChecksMapping;
}

/**
 * Quality check type to tool name mappings
 */
export interface QualityChecksMapping {
  /** Type checking tools (tsc, mypy, etc.) */
  type_checking: string[];

  /** Linting tools (eslint, pylint, etc.) */
  linting: string[];

  /** Test execution tools (vitest, pytest, etc.) */
  testing: string[];

  /** Code formatting tools (prettier, black, etc.) */
  formatting: string[];
}

/**
 * Raw tool execution result
 */
export interface RawToolResult {
  /** Type of check performed */
  type: keyof QualityChecksMapping;

  /** Tool name that produced this result */
  tool: string;

  /** Whether execution succeeded (exit code 0) */
  success?: boolean;

  /** Standard output from tool */
  stdout?: string;

  /** Standard error from tool */
  stderr?: string;

  /** Whether check was skipped */
  skipped?: boolean;

  /** Reason for skipping */
  reason?: string;
}

/**
 * Severity levels for diagnostic issues
 */
export type Severity = 'blocker' | 'critical' | 'major' | 'minor' | 'info';

/**
 * A single diagnostic issue found by a tool
 */
export interface Diagnostic {
  /** Issue severity */
  severity: Severity;

  /** Human-readable message */
  message: string;

  /** File path where issue was found */
  file?: string;

  /** Line number in file */
  line?: number;

  /** Column number in file */
  column?: number;

  /** Tool that found this issue */
  tool: string;

  /** Rule identifier (e.g., ESLint rule name) */
  rule?: string;
}

/**
 * Aggregated diagnostic report from all tools
 */
export interface DiagnosticReport {
  /** Summary statistics */
  summary: {
    /** Total number of issues across all tools */
    total_issues: number;

    /** Count of issues by severity level */
    by_severity: Record<Severity, number>;

    /** Percentage of checks with zero issues (0-100) */
    pass_rate: number;

    /** Total number of checks executed */
    checks_run: number;

    /** Number of checks that passed (0 issues) */
    checks_passed: number;
  };

  /** All diagnostic issues found */
  issues: Diagnostic[];
}

/**
 * File scope for running quality checks
 */
export type FileScope = 'uncommitted' | 'all';
