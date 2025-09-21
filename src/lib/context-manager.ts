import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';
import { saveManager } from './save-manager.js';
import { SaveManifest } from '../types/save-manifest.js';

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

export interface LoadedSession {
  context: WorkflowContext | null;
  manifest?: SaveManifest;
  getSummary?: () => {
    feature: string;
    phase: string;
    lastAction: string;
    elapsed: string;
    testStatus: 'passing' | 'failing' | 'unknown';
    tasksComplete: number;
    tasksPending: number;
  };
  exploration?: Promise<string | null>;
  buildPlan?: Promise<string | null>;
  workLog?: Promise<string | null> | string | null;
}

/**
 * Manages workflow context for context-aware commands
 * Implements HODGE-054: Context-Aware Workflow Commands
 */
export class ContextManager {
  private readonly basePath: string;
  private readonly contextPath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
    this.contextPath = join(this.basePath, '.hodge', 'context.json');
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
   * Load saved session with optimized lazy loading
   * @param saveName - Name of the save to load
   * @param options - Loading options (lazy, priority)
   */
  async loadSession(
    saveName: string,
    options: { lazy?: boolean; priority?: 'speed' | 'complete' } = {}
  ): Promise<LoadedSession> {
    try {
      // Use optimized save manager for fast loading
      const session = await saveManager.load(saveName, {
        lazy: options.lazy !== false, // Default to lazy
        priority: options.priority || 'speed',
      });

      // Extract context from loaded session
      const context = session.manifest.session
        ? {
            feature: session.manifest.session.feature,
            mode: session.manifest.session.phase as WorkflowContext['mode'],
            timestamp: session.manifest.timestamp,
            lastCommand: session.manifest.session.lastAction,
          }
        : null;

      // Check if it's a lazy-loaded session (has getSummary) or full load
      if ('getSummary' in session) {
        // LazyLoadedSave type
        return {
          context,
          manifest: session.manifest,
          getSummary: () => session.getSummary(),
          exploration: session.exploration,
          buildPlan: session.buildPlan,
          workLog: session.workLog,
        };
      } else {
        // LoadedSaveData type
        return {
          context,
          manifest: session.manifest,
          workLog: session.workLog,
        };
      }
    } catch (error) {
      console.warn('Warning: Failed to load session:', error);
      return { context: null };
    }
  }

  /**
   * Find and load most recent save
   */
  async loadRecent(options: { lazy?: boolean } = {}): Promise<LoadedSession> {
    try {
      const savesDir = join(this.basePath, '.hodge', 'saves');
      if (!existsSync(savesDir)) {
        return { context: null };
      }

      const saves = await fs.readdir(savesDir);
      if (saves.length === 0) {
        return { context: null };
      }

      // Sort by modification time to find most recent
      const saveStats = await Promise.all(
        saves.map(async (save) => ({
          name: save,
          mtime: (await fs.stat(join(savesDir, save))).mtime.getTime(),
        }))
      );

      saveStats.sort((a, b) => b.mtime - a.mtime);
      const mostRecent = saveStats[0].name;

      return this.loadSession(mostRecent, { lazy: options.lazy });
    } catch (error) {
      console.warn('Warning: Failed to load recent save:', error);
      return { context: null };
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
