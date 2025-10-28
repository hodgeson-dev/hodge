/**
 * Convention-based pattern matching for PM state detection
 */

import { StateType, ConventionPattern, PMState } from './types.js';

/**
 * State conventions for detecting PM tool state types
 * Uses pattern matching to identify state types across different PM tools
 */
export class StateConventions {
  private patterns: ConventionPattern[] = [
    {
      type: 'unstarted',
      priority: 1,
      patterns: [
        /^backlog$/i,
        /^todo$/i,
        /^upcoming$/i,
        /^planned$/i,
        /^ready$/i,
        /^triage$/i,
        /^icebox$/i,
        /^queued$/i,
      ],
    },
    {
      type: 'started',
      priority: 2,
      patterns: [
        /in[\s-]?progress/i,
        /^doing$/i,
        /^working$/i,
        /^development$/i,
        /^active$/i,
        /^wip$/i,
        /^started$/i,
        /in[\s-]?review/i,
        /^reviewing$/i,
        /^testing$/i,
        /^qa$/i,
        /^verification$/i,
      ],
    },
    {
      type: 'completed',
      priority: 3,
      patterns: [
        /^done$/i,
        /^completed?$/i,
        /^shipped$/i,
        /^deployed$/i,
        /^closed$/i,
        /^resolved$/i,
        /^finished$/i,
        /^released$/i,
      ],
    },
    {
      type: 'canceled',
      priority: 4,
      patterns: [
        /^cancell?ed$/i,
        /^abandoned$/i,
        /^declined$/i,
        /^rejected$/i,
        /^invalid$/i,
        /won'?t[\s-]?fix/i,
        /^duplicate$/i,
      ],
    },
  ];

  /**
   * Detect state type from state name using patterns
   * @param stateName - The name of the state to analyze
   * @returns The detected state type
   * @example
   * conventions.detectStateType('In Progress') // returns 'started'
   */
  detectStateType(stateName: string): StateType {
    // First, try exact matches with higher priority
    for (const convention of this.patterns) {
      for (const pattern of convention.patterns) {
        if (pattern.test(stateName)) {
          return convention.type;
        }
      }
    }

    return 'unknown';
  }

  /**
   * Find best matching state for a target type
   * @param states - Available states to search
   * @param targetType - The type of state to find
   * @returns The best matching state or undefined
   * @example
   * conventions.findBestMatch(states, 'started') // returns In Progress state
   */
  findBestMatch(states: PMState[], targetType: StateType): PMState | undefined {
    // First try: exact type match
    const exactMatches = states.filter((s) => s.type === targetType);
    if (exactMatches.length > 0) {
      return exactMatches[0];
    }

    // Second try: pattern matching
    const convention = this.patterns.find((p) => p.type === targetType);
    if (!convention) return undefined;

    for (const pattern of convention.patterns) {
      const match = states.find((s) => pattern.test(s.name));
      if (match) return match;
    }

    return undefined;
  }

  /**
   * Get suggested state type for Hodge mode transition
   * @param fromMode - Current Hodge mode
   * @param toMode - Target Hodge mode
   * @returns The appropriate state type for the transition
   * @example
   * conventions.getTargetStateType('explore', 'build') // returns 'started'
   */
  getTargetStateType(fromMode: string, toMode: string): StateType {
    const transitions: Record<string, StateType> = {
      'explore->build': 'started',
      'build->harden': 'started', // Still in progress, but reviewing
      'harden->ship': 'completed',
      'any->cancel': 'canceled',
    };

    return transitions[`${fromMode}->${toMode}`] || 'unknown';
  }

  /**
   * Check if a state name indicates review/testing
   */
  isReviewState(stateName: string): boolean {
    const reviewPatterns = [
      /review/i,
      /^pr$/i,
      /pull[\s-]?request/i,
      /^testing$/i,
      /^qa$/i,
      /verification/i,
      /approval/i,
    ];

    return reviewPatterns.some((p) => p.test(stateName));
  }

  /**
   * Add custom patterns (from overrides)
   */
  addCustomPatterns(type: StateType, patterns: RegExp[]): void {
    const existing = this.patterns.find((p) => p.type === type);
    if (existing) {
      existing.patterns.push(...patterns);
    } else {
      this.patterns.push({
        type,
        patterns,
        priority: 10, // Lower priority for custom patterns
      });
    }
  }
}
