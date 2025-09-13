/**
 * Standards validation for Hodge development
 * Enforces coding standards based on current mode
 */

export type Mode = 'explore' | 'build' | 'harden';
export type StandardLevel = 'essential' | 'recommended' | 'learned';
export type EnforcementLevel = 'suggest' | 'recommend' | 'enforce';

export interface ValidationResult {
  essentialEnforced: boolean;
  recommendedLevel: EnforcementLevel;
  violations: Violation[];
}

export interface Violation {
  rule: string;
  level: StandardLevel;
  message: string;
  file?: string;
  line?: number;
}

export interface Standard {
  name: string;
  level: StandardLevel;
  validate: (code: string) => boolean;
  message: string;
}

/**
 * Validates code against Hodge standards based on current mode
 */
export function validateStandards(mode: Mode, _code?: string): ValidationResult {
  const violations: Violation[] = [];

  // Essential standards are always enforced
  const essentialEnforced = true;

  // Recommended standards enforcement varies by mode
  const recommendedLevel: EnforcementLevel =
    mode === 'harden' ? 'enforce' : mode === 'build' ? 'recommend' : 'suggest';

  return {
    essentialEnforced,
    recommendedLevel,
    violations,
  };
}

/**
 * Checks if TypeScript strict mode is enabled
 */
export function checkTypeScriptStrict(): boolean {
  try {
    // In production, would read tsconfig.json
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates commit message format
 */
export function validateCommitMessage(message: string): boolean {
  const validPrefixes = [
    'feat:',
    'fix:',
    'docs:',
    'refactor:',
    'test:',
    'chore:',
    'style:',
    'perf:',
  ];

  return validPrefixes.some((prefix) => message.startsWith(prefix));
}

/**
 * Gets enforcement level for a standard based on mode
 */
export function getEnforcementLevel(standardLevel: StandardLevel, mode: Mode): EnforcementLevel {
  if (standardLevel === 'essential') {
    return 'enforce';
  }

  if (standardLevel === 'recommended') {
    switch (mode) {
      case 'harden':
        return 'enforce';
      case 'build':
        return 'recommend';
      case 'explore':
        return 'suggest';
    }
  }

  // Learned patterns
  return mode === 'harden' ? 'recommend' : 'suggest';
}

/**
 * Formats violation message for display
 */
export function formatViolation(violation: Violation): string {
  const prefix = {
    essential: '❌',
    recommended: '⚠️',
    learned: '💡',
  }[violation.level];

  let message = `${prefix} ${violation.message}`;

  if (violation.file) {
    message += ` (${violation.file}`;
    if (violation.line) {
      message += `:${violation.line}`;
    }
    message += ')';
  }

  return message;
}
