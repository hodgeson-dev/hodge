import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

import { createCommandLogger } from './logger.js';
/**
 * Represents the state of an interactive command session
 * Used for file-based communication between portable commands and UI layers
 */
export interface InteractionState<T = unknown> {
  command: string;
  feature?: string;
  status: 'pending' | 'reviewing' | 'edited' | 'confirmed' | 'cancelled';
  timestamp: string;
  environment: string;
  data: T;
  userChoice?: string;
  history: InteractionEvent[];
}

/**
 * Represents an event in the interaction history
 */
export interface InteractionEvent {
  timestamp: string;
  type: 'init' | 'display' | 'choice' | 'edit' | 'confirm' | 'cancel';
  data?: unknown;
}

/**
 * Ship-specific interaction data
 */
export interface ShipInteractionData {
  analysis: {
    files: Array<{
      path: string;
      status: 'added' | 'modified' | 'deleted';
      insertions: number;
      deletions: number;
    }>;
    type: string;
    scope: string;
    breaking: boolean;
  };
  suggested: string;
  edited?: string;
  commitMessage?: string;
  issueId?: string;
  workLogPath?: string;
}

/**
 * Manages file-based interaction state for commands
 * Implements the file-based protocol for Progressive Enhancement
 */
export class InteractionStateManager<T = unknown> {
  private logger = createCommandLogger('interaction-state-manager', { enableConsole: false });
  private baseDir: string;
  private stateFile: string;
  private command: string;

  constructor(command: string, feature?: string) {
    this.command = command;
    this.baseDir = join('.hodge', 'temp', `${command}-interaction`);
    if (feature) {
      this.baseDir = join(this.baseDir, feature);
    }
    this.stateFile = join(this.baseDir, 'state.json');
  }

  /**
   * Initialize the interaction state
   */
  async initialize(data: T, environment: string): Promise<InteractionState<T>> {
    // Create directory structure
    await fs.mkdir(this.baseDir, { recursive: true });

    const state: InteractionState<T> = {
      command: this.command,
      status: 'pending',
      timestamp: new Date().toISOString(),
      environment,
      data,
      history: [
        {
          timestamp: new Date().toISOString(),
          type: 'init',
        },
      ],
    };

    await this.save(state);
    return state;
  }

  /**
   * Load the current state
   */
  async load(): Promise<InteractionState<T> | null> {
    if (!existsSync(this.stateFile)) {
      return null;
    }

    try {
      const content = await fs.readFile(this.stateFile, 'utf-8');
      return JSON.parse(content) as InteractionState<T>;
    } catch (error) {
      this.logger.error('Failed to load interaction state:', error);
      return null;
    }
  }

  /**
   * Save the current state
   */
  async save(state: InteractionState<T>): Promise<void> {
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }

  /**
   * Update the state with user choice
   */
  async updateChoice(choice: string): Promise<void> {
    const state = await this.load();
    if (!state) throw new Error('No state to update');

    state.userChoice = choice;
    state.status = 'reviewing';
    state.history.push({
      timestamp: new Date().toISOString(),
      type: 'choice',
      data: choice,
    });

    await this.save(state);
  }

  /**
   * Update the state with edited content
   */
  async updateEdited(edited: unknown): Promise<void> {
    const state = await this.load();
    if (!state) throw new Error('No state to update');

    if (state.data && typeof state.data === 'object' && 'edited' in state.data) {
      (state.data as Record<string, unknown>).edited = edited;
    }
    state.status = 'edited';
    state.history.push({
      timestamp: new Date().toISOString(),
      type: 'edit',
      data: edited,
    });

    await this.save(state);
  }

  /**
   * Confirm the interaction
   */
  async confirm(): Promise<void> {
    const state = await this.load();
    if (!state) throw new Error('No state to confirm');

    state.status = 'confirmed';
    state.history.push({
      timestamp: new Date().toISOString(),
      type: 'confirm',
    });

    await this.save(state);
  }

  /**
   * Cancel the interaction
   */
  async cancel(): Promise<void> {
    const state = await this.load();
    if (!state) throw new Error('No state to cancel');

    state.status = 'cancelled';
    state.history.push({
      timestamp: new Date().toISOString(),
      type: 'cancel',
    });

    await this.save(state);
  }

  /**
   * Write content to a specific file
   */
  async writeFile(filename: string, content: string): Promise<void> {
    const filepath = join(this.baseDir, filename);
    await fs.writeFile(filepath, content);
  }

  /**
   * Read content from a specific file
   */
  async readFile(filename: string): Promise<string | null> {
    const filepath = join(this.baseDir, filename);
    if (!existsSync(filepath)) {
      return null;
    }
    return fs.readFile(filepath, 'utf-8');
  }

  /**
   * Clean up interaction files
   */
  async cleanup(): Promise<void> {
    if (existsSync(this.baseDir)) {
      await fs.rm(this.baseDir, { recursive: true, force: true });
    }
  }

  /**
   * Get the base directory path
   */
  getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * Check if state exists
   */
  exists(): boolean {
    return existsSync(this.stateFile);
  }

  /**
   * Get a specific file path
   */
  getFilePath(filename: string): string {
    return join(this.baseDir, filename);
  }
}

/**
 * Helper to format file changes for display
 */
export function formatFileChanges(files: ShipInteractionData['analysis']['files']): string {
  return files
    .map(
      (f) =>
        `${f.status === 'added' ? 'A' : f.status === 'modified' ? 'M' : 'D'} ${f.path} (+${f.insertions}, -${f.deletions})`
    )
    .join('\n');
}

/**
 * Helper to detect commit type from files
 */
export function detectCommitType(files: Array<{ path: string }>): string {
  // TODO: Make this configurable via .hodge/config.json
  const patterns = {
    feat: /\.(ts|js|tsx|jsx)$/,
    test: /\.(test|spec)\./,
    docs: /\.(md|txt)$/,
    style: /\.(css|scss|less)$/,
    refactor: /refactor/i,
    fix: /fix|bug|patch/i,
    chore: /package\.json|config|build/,
  };

  // Count matches for each type
  const typeCounts: Record<string, number> = {};

  for (const file of files) {
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(file.path)) {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    }
  }

  // Return the type with most matches
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  return sortedTypes[0]?.[0] || 'feat';
}

/**
 * Helper to detect scope from files
 */
export function detectScope(files: Array<{ path: string }>): string {
  // Find common directory
  if (files.length === 0) return 'general';

  const paths = files.map((f) => f.path.split('/'));
  const commonParts: string[] = [];

  for (let i = 0; i < paths[0].length; i++) {
    const part = paths[0][i];
    if (paths.every((p) => p[i] === part)) {
      commonParts.push(part);
    } else {
      break;
    }
  }

  // Use the last common directory as scope, or first unique directory
  if (commonParts.length > 0) {
    const lastDir = commonParts[commonParts.length - 1];
    if (lastDir !== 'src' && lastDir !== 'lib') {
      return lastDir;
    }
  }

  // Try to extract from first differing directory
  const firstFile = files[0].path;
  const parts = firstFile.split('/');
  for (const part of parts) {
    if (part !== 'src' && part !== 'lib' && !part.includes('.')) {
      return part;
    }
  }

  return 'general';
}
