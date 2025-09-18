import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

export interface WorkflowContext {
  feature?: string;
  mode?: 'explore' | 'build' | 'harden' | 'ship';
  timestamp?: string;
  localID?: string;
  externalID?: string;
  pmTool?: string;
  pmIssue?: string;
  lastCommand?: string;
  sessionId?: string;
}

/**
 * Manages workflow context for context-aware commands
 * Implements HODGE-054: Context-Aware Workflow Commands
 */
export class ContextManager {
  private readonly basePath: string;
  private readonly contextPath: string;

  constructor(basePath: string = '.') {
    this.basePath = basePath;
    this.contextPath = join(basePath, '.hodge', 'context.json');
  }

  /**
   * Load current context from context.json
   */
  async load(): Promise<WorkflowContext | null> {
    try {
      if (!existsSync(this.contextPath)) {
        return null;
      }

      const content = await fs.readFile(this.contextPath, 'utf-8');
      return JSON.parse(content) as WorkflowContext;
    } catch (error) {
      // Handle corrupted context gracefully
      console.warn('Warning: Failed to load context.json:', error);
      return null;
    }
  }

  /**
   * Save or update context
   */
  async save(context: Partial<WorkflowContext>): Promise<void> {
    try {
      // Ensure directory exists
      const dir = join(this.basePath, '.hodge');
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }

      // Load existing context and merge
      const existing = (await this.load()) || {};
      const updated: WorkflowContext = {
        ...existing,
        ...context,
        timestamp: new Date().toISOString(),
      };

      // Write context
      await fs.writeFile(this.contextPath, JSON.stringify(updated, null, 2));
    } catch (error) {
      // Non-blocking - don't fail the command if context save fails
      console.warn('Warning: Failed to save context:', error);
    }
  }

  /**
   * Clear the current context
   */
  async clear(): Promise<void> {
    try {
      if (existsSync(this.contextPath)) {
        await fs.unlink(this.contextPath);
      }
    } catch (error) {
      console.warn('Warning: Failed to clear context:', error);
    }
  }

  /**
   * Get the current feature from context or argument
   * Returns the feature to use, preferring explicit argument over context
   */
  async getFeature(explicitFeature?: string): Promise<string | null> {
    // Explicit feature always wins
    if (explicitFeature) {
      return explicitFeature;
    }

    // Try to load from context
    const context = await this.load();
    return context?.feature || null;
  }

  /**
   * Update context when switching features or modes
   */
  async updateForCommand(
    command: string,
    feature?: string,
    mode?: WorkflowContext['mode']
  ): Promise<void> {
    const updates: Partial<WorkflowContext> = {
      lastCommand: command,
    };

    if (feature) {
      updates.feature = feature;
    }

    if (mode) {
      updates.mode = mode;
    }

    await this.save(updates);
  }
}

// Singleton instance for the application
export const contextManager = new ContextManager();
