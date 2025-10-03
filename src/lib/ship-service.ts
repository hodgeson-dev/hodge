/**
 * ShipService - Testable business logic for ship operations
 *
 * Extracts testable business logic from ShipCommand per HODGE-321.
 * Focused on key validation and decision logic without console I/O.
 * Note: ShipCommand is complex (1000+ lines), so this service extracts
 * the most testable business logic rather than attempting full refactoring.
 */
export class ShipService {
  /**
   * Validate commit message format
   * @param message - Commit message to validate
   * @returns boolean - True if valid
   */
  validateCommitMessage(message: string): boolean {
    if (!message || message.trim().length === 0) {
      return false;
    }

    // Commit message should have reasonable length
    if (message.length > 5000) {
      return false;
    }

    return true;
  }

  /**
   * Detect if branch is protected (main/master)
   * @param branch - Branch name
   * @returns boolean - True if protected
   */
  isProtectedBranch(branch: string): boolean {
    const protectedBranches = ['main', 'master', 'production', 'prod'];
    return protectedBranches.includes(branch.toLowerCase());
  }

  /**
   * Check if push should be skipped based on options and branch
   * @param branch - Current branch
   * @param options - Ship options
   * @returns object - Skip decision and reason
   */
  shouldSkipPush(
    branch: string,
    options: { noPush?: boolean; push?: boolean; forcePush?: boolean }
  ): { skip: boolean; reason?: string } {
    // Explicit --no-push flag
    if (options.noPush) {
      return { skip: true, reason: '--no-push flag set' };
    }

    // Protected branch without force or explicit push
    if (this.isProtectedBranch(branch)) {
      if (!options.forcePush && !options.push) {
        return {
          skip: true,
          reason: `Protected branch '${branch}' - use --push or --force-push to override`,
        };
      }
    }

    return { skip: false };
  }

  /**
   * Generate commit metadata
   * @param feature - Feature name
   * @param message - Commit message
   * @returns Commit metadata object
   */
  generateCommitMetadata(
    feature: string,
    message: string
  ): {
    feature: string;
    message: string;
    timestamp: string;
    valid: boolean;
  } {
    return {
      feature,
      message,
      timestamp: new Date().toISOString(),
      valid: this.validateCommitMessage(message),
    };
  }
}
