/**
 * Optimized save manifest for fast save/load operations
 * Instead of copying entire directories, we store references and state
 */

export interface SaveManifest {
  version: '2.0';
  type: 'full' | 'incremental' | 'auto';
  timestamp: string;

  // Essential session state
  session: {
    feature: string;
    phase: 'explore' | 'build' | 'harden' | 'ship';
    lastAction: string;
    startTime: string;
    elapsedMinutes: number;
  };

  // Current state without file contents
  state: {
    decisions: string[];
    completedTasks: string[];
    pendingTasks: string[];
    testStatus: 'passing' | 'failing' | 'unknown';
    modifiedFiles: string[]; // Just paths, not contents
    lastCommit?: string;
  };

  // References to actual files (not copies)
  references: {
    featureDir: string;
    exploration?: string;
    buildPlan?: string;
    hardenReport?: string;
    workLog?: string;
  };

  // Incremental save data
  incremental?: {
    baseManifest: string; // Reference to previous save
    changes: {
      addedFiles: string[];
      modifiedFiles: string[];
      deletedFiles: string[];
      newDecisions: string[];
      completedTasks: string[];
    };
  };

  // What NOT to save (explicitly documented)
  excluded: string[];
}

export interface SaveOptions {
  type?: 'full' | 'incremental' | 'auto';
  minimal?: boolean; // Ultra-fast, manifest only
  includeGenerated?: boolean; // Include generated files (default: false)
}

export interface LoadOptions {
  lazy?: boolean; // Load manifest only, defer file loading
  priority?: 'speed' | 'complete'; // Trade-off between speed and completeness
  includeGenerated?: boolean; // Load generated files (default: false)
}

/**
 * Data returned from loading a save (full load)
 */
export interface LoadedSaveData {
  manifest: SaveManifest;
  context: Record<string, unknown>;
  session: Record<string, unknown>;
  workLog: string | null;
}

/**
 * Lazy-loaded proxy for deferred file access
 */
export interface LazyLoadedSave {
  manifest: SaveManifest;
  exploration: Promise<string | null>;
  buildPlan: Promise<string | null>;
  workLog: Promise<string | null>;
  context: Promise<Record<string, unknown>>;
  getSummary(): {
    feature: string;
    phase: string;
    lastAction: string;
    elapsed: string;
    testStatus: 'passing' | 'failing' | 'unknown';
    tasksComplete: number;
    tasksPending: number;
  };
}
