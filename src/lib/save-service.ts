import { ContextManager } from './context-manager.js';

export interface SaveNameOptions {
  feature?: string;
  timestamp?: string;
}

/**
 * SaveService - Testable business logic for save operations
 *
 * Extracts testable business logic from SaveCommand per HODGE-321.
 * Handles save name generation and validation without console I/O.
 */
export class SaveService {
  private contextManager: ContextManager;

  constructor(contextManager?: ContextManager) {
    this.contextManager = contextManager || new ContextManager();
  }

  /**
   * Generate automatic save name based on context
   * @param options - Optional feature and timestamp override
   * @returns Promise<string> - Generated save name
   */
  async generateSaveName(options: SaveNameOptions = {}): Promise<string> {
    const timestamp =
      options.timestamp || new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

    // Use provided feature or try to get from context
    let feature = options.feature;

    if (!feature) {
      try {
        const context = await this.contextManager.load();
        feature = context?.feature || 'general';
      } catch {
        feature = 'general';
      }
    }

    return `${feature}-${timestamp}`;
  }

  /**
   * Validate save name format
   * @param name - Save name to validate
   * @returns boolean - True if valid
   */
  validateSaveName(name: string): boolean {
    // Save names should be non-empty and not contain special characters that break file systems
    if (!name || name.trim().length === 0) {
      return false;
    }

    // Check for invalid filesystem characters
    const invalidChars = /[<>:"|?*\\/]/;
    if (invalidChars.test(name)) {
      return false;
    }

    return true;
  }

  /**
   * Determine save type description
   * @param options - Save options
   * @returns string - Human-readable save type
   */
  getSaveTypeDescription(options: {
    minimal?: boolean;
    type?: 'full' | 'incremental' | 'auto';
  }): string {
    if (options.minimal) {
      return 'Minimal (manifest only)';
    } else if (options.type === 'incremental') {
      return 'Incremental (changes only)';
    } else if (options.type === 'auto') {
      return 'Auto-save';
    } else {
      return 'Full save';
    }
  }
}
