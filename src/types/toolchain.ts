/**
 * Toolchain configuration and tool detection types
 * Part of HODGE-341.1: Build System Detection and Toolchain Infrastructure
 * Extended in HODGE-341.2: Tool Registry Architecture
 */

// ==================== Tool Registry Types (HODGE-341.2) ====================

/**
 * Detection rule types for tool registry
 */
export type DetectionRuleType = 'config_file' | 'package_json' | 'command' | 'eslint_plugin';

/**
 * Base detection rule interface
 */
export interface DetectionRule {
  type: DetectionRuleType;
}

/**
 * Config file detection rule
 */
export interface ConfigFileDetectionRule extends DetectionRule {
  type: 'config_file';
  /** List of config file paths to check */
  paths: string[];
}

/**
 * Package.json detection rule
 */
export interface PackageJsonDetectionRule extends DetectionRule {
  type: 'package_json';
  /** Package name to look for in dependencies/devDependencies */
  package: string;
}

/**
 * Command availability detection rule
 */
export interface CommandDetectionRule extends DetectionRule {
  type: 'command';
  /** Command name to check in PATH */
  command: string;
}

/**
 * ESLint plugin detection rule
 */
export interface EslintPluginDetectionRule extends DetectionRule {
  type: 'eslint_plugin';
  /** Plugin name to look for in .eslintrc */
  plugin_name: string;
}

/**
 * Union type for all detection rules
 */
export type AnyDetectionRule =
  | ConfigFileDetectionRule
  | PackageJsonDetectionRule
  | CommandDetectionRule
  | EslintPluginDetectionRule;

/**
 * Package manager types
 */
export type PackageManager = 'npm' | 'pip' | 'poetry' | 'gradle' | 'maven' | 'cargo';

/**
 * Installation configuration for a specific package manager
 */
export interface PackageManagerInstallation {
  /** Package name */
  package: string;
  /** Install command */
  install_command: string;
  /** Optional post-install instructions */
  post_install?: string;
}

/**
 * Tool installation configuration
 */
export interface ToolInstallation {
  /** Whether this is an external tool (not installable via package manager) */
  external?: boolean;
  /** External installation instructions */
  install_instructions?: string;
  /** Installation config per package manager */
  package_managers?: Partial<Record<PackageManager, PackageManagerInstallation>>;
}

/**
 * Quality check category types
 */
export type QualityCheckCategory =
  | 'type_checking'
  | 'linting'
  | 'testing'
  | 'formatting'
  | 'complexity'
  | 'code_smells'
  | 'duplication'
  | 'architecture'
  | 'security'
  | 'patterns';

/**
 * Tool information in registry
 */
export interface ToolRegistryEntry {
  /** Supported languages for this tool */
  languages: string[];
  /** Detection rules (checked in order) */
  detection: AnyDetectionRule[];
  /** Installation configuration */
  installation: ToolInstallation;
  /** Default command template (null if runs via another tool) */
  default_command: string | null;
  /** Command to auto-fix issues (optional, HODGE-341.6) */
  fix_command?: string;
  /** Command to detect tool version */
  version_command?: string;
  /** Quality check categories this tool provides */
  categories: QualityCheckCategory[];
  /** Regex pattern for extracting errors (HODGE-359.1) */
  error_pattern?: string;
  /** Regex pattern for extracting warnings (HODGE-359.1) */
  warning_pattern?: string;
}

/**
 * Complete tool registry structure
 */
export interface ToolRegistry {
  /** Map of tool name to tool information */
  tools: Record<string, ToolRegistryEntry>;
}

// ==================== Existing Types (HODGE-341.1) ====================

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
  detectionMethod?: 'config_file' | 'package_json' | 'path' | 'command' | 'eslint_plugin';
}

/**
 * Tool command configuration
 */
export interface ToolCommand {
  /** Command to execute (supports ${files} template placeholder) */
  command: string;

  /** Quality check types this tool provides */
  provides: string[];

  /** Regex pattern for extracting errors (HODGE-359.1) */
  error_pattern?: string;

  /** Regex pattern for extracting warnings (HODGE-359.1) */
  warning_pattern?: string;
}

/**
 * Quality gate configuration for different phases
 * HODGE-341.5: AI-driven warning review
 */
export interface QualityGateConfig {
  /** Should AI review warnings after errors are fixed? */
  review_warnings?: boolean;

  /** Optional guidance text for AI when reviewing warnings (not rigid rules) */
  warning_guidance?: string;
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

  /** Quality gate configuration for each phase (HODGE-341.5) */
  quality_gates?: {
    harden?: QualityGateConfig;
    ship?: QualityGateConfig;
  };
}

/**
 * Quality check type to tool name mappings
 * Extended in HODGE-341.2 with additional check types
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

  // HODGE-341.2: Advanced quality checks
  /** Complexity analysis tools (eslint-plugin-sonarjs, radon, etc.) */
  complexity?: string[];

  /** Code smell detection tools (eslint-plugin-sonarjs, etc.) */
  code_smells?: string[];

  /** Code duplication detection tools (jscpd, cpd, etc.) */
  duplication?: string[];

  /** Architecture validation tools (dependency-cruiser, etc.) */
  architecture?: string[];

  /** Security pattern detection tools (semgrep, etc.) */
  security?: string[];

  /** Custom pattern detection tools (semgrep, etc.) */
  patterns?: string[];
}

/**
 * Raw tool execution result
 * HODGE-359.1: Enhanced with structured error/warning extraction
 */
export interface RawToolResult {
  /** Type of check performed */
  type: keyof QualityChecksMapping;

  /** Tool name that produced this result */
  tool: string;

  /** Exit code from tool execution */
  exitCode?: number;

  /** Number of errors found (HODGE-359.1) */
  errorCount?: number;

  /** Number of warnings found (HODGE-359.1) */
  warningCount?: number;

  /** Extracted error messages (HODGE-359.1) */
  errors?: string[];

  /** Extracted warning messages (HODGE-359.1) */
  warnings?: string[];

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
 * Helper to check if a tool result indicates success
 * HODGE-359.1: Replaces deprecated `success` field
 * @param result Tool execution result
 * @returns true if no errors found and not skipped
 */
export function isToolResultSuccessful(result: RawToolResult): boolean {
  if (result.skipped) {
    return true; // Skipped checks are considered passing
  }
  // Success means no errors found (errorCount === 0 or undefined)
  const success = (result.errorCount ?? 0) === 0;
  // TEMP DEBUG
  if (!success) {
    console.error(
      `DEBUG isToolResultSuccessful: ${result.tool} - errorCount=${result.errorCount}, success=${success}`
    );
  }
  return success;
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
export type FileScope = 'uncommitted' | 'feature' | 'all';
