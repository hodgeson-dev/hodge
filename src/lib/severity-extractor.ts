/**
 * Severity levels for tool diagnostics
 */
export type SeverityLevel = 'blocker' | 'critical' | 'warning' | 'info';

/**
 * Extracts severity information from tool output using keyword matching.
 * Provides basic classification of issues to support risk scoring.
 */
export class SeverityExtractor {
  /**
   * Extract severity counts from tool output using keyword matching
   * @param output - Raw output from a quality check tool
   * @returns Map of severity level to count
   */
  extractSeverity(output: string): Map<SeverityLevel, number> {
    const counts = new Map<SeverityLevel, number>([
      ['blocker', 0],
      ['critical', 0],
      ['warning', 0],
      ['info', 0],
    ]);

    const lines = output.split('\n');
    const blockerRegex = /\b(error|blocker|critical|fail)\b/;
    const warningRegex = /\b(warn|warning)\b/;
    const infoRegex = /\b(info|note|hint)\b/;

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Check for blocker/error/critical/fail (highest severity)
      if (blockerRegex.test(lower)) {
        counts.set('blocker', counts.get('blocker')! + 1);
      }
      // Check for warning
      else if (warningRegex.test(lower)) {
        counts.set('warning', counts.get('warning')! + 1);
      }
      // Check for info/note/hint
      else if (infoRegex.test(lower)) {
        counts.set('info', counts.get('info')! + 1);
      }
    }

    return counts;
  }

  /**
   * Get a score multiplier based on severity level
   * Used by scoring algorithms to weight issues appropriately
   */
  getScoreMultiplier(level: SeverityLevel): number {
    switch (level) {
      case 'blocker':
        return 100;
      case 'critical':
        return 75;
      case 'warning':
        return 25;
      case 'info':
        return 5;
    }
  }
}
