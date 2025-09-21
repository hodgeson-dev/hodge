/**
 * Optimized save/load system for fast session management
 * Implements incremental saves, lazy loading, and manifest-based tracking
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import {
  SaveManifest,
  SaveOptions,
  LoadOptions,
  LoadedSaveData,
  LazyLoadedSave,
} from '../types/save-manifest.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

export class SaveManager {
  private get saveDir(): string {
    return path.join(process.cwd(), '.hodge', 'saves');
  }

  /**
   * Create an optimized save with manifest
   */
  async save(name: string, options: SaveOptions = {}): Promise<string> {
    const startTime = Date.now();
    const manifest = await this.createManifest(name, options);

    // Ensure save directory exists
    await fs.mkdir(this.saveDir, { recursive: true });

    const savePath = path.join(this.saveDir, name);
    await fs.mkdir(savePath, { recursive: true });

    // Always save manifest (this is fast)
    await fs.writeFile(path.join(savePath, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // For minimal saves, we're done!
    if (options.minimal) {
      const elapsed = Date.now() - startTime;
      console.log(chalk.green(`✓ Minimal save complete in ${elapsed}ms`));
      return savePath;
    }

    // For incremental saves, only save changes
    if (options.type === 'incremental' || options.type === 'auto') {
      await this.saveIncremental(savePath, manifest);
    } else {
      // Full save - but still optimized
      await this.saveEssentials(savePath, manifest);
    }

    const elapsed = Date.now() - startTime;
    console.log(chalk.green(`✓ Save complete in ${elapsed}ms`));
    return savePath;
  }

  /**
   * Load a save with lazy loading support
   */
  async load(name: string, options: LoadOptions = {}): Promise<LazyLoadedSave | LoadedSaveData> {
    const startTime = Date.now();
    const savePath = path.join(this.saveDir, name);

    // Always load manifest first
    const manifestPath = path.join(savePath, 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8')) as SaveManifest;

    // For lazy loading, return proxy object
    if (options.lazy || options.priority === 'speed') {
      const elapsed = Date.now() - startTime;
      console.log(chalk.green(`✓ Manifest loaded in ${elapsed}ms`));

      return this.createLazyProxy(savePath, manifest);
    }

    // Full load - but still optimized
    const data = await this.loadEssentials(savePath, manifest);

    const elapsed = Date.now() - startTime;
    console.log(chalk.green(`✓ Full load complete in ${elapsed}ms`));
    return data;
  }

  /**
   * Create manifest without copying files
   */
  private async createManifest(name: string, options: SaveOptions): Promise<SaveManifest> {
    // Get current git status and context
    const { feature, phase, lastAction } = await this.getCurrentContext();
    const modifiedFiles = await this.getModifiedFiles();
    const decisions = await this.getRecentDecisions();
    const testStatus = await this.getTestStatus();

    const manifest: SaveManifest = {
      version: '2.0',
      type: options.type || 'full',
      timestamp: new Date().toISOString(),
      session: {
        feature,
        phase: phase as 'explore' | 'build' | 'harden' | 'ship',
        lastAction,
        startTime: await this.getSessionStartTime(),
        elapsedMinutes: await this.getElapsedMinutes(),
      },
      state: {
        decisions,
        completedTasks: this.getCompletedTasks(),
        pendingTasks: this.getPendingTasks(),
        testStatus,
        modifiedFiles,
        lastCommit: await this.getLastCommit(),
      },
      references: {
        featureDir: `.hodge/features/${feature}`,
        exploration: `.hodge/features/${feature}/explore/exploration.md`,
        buildPlan: `.hodge/features/${feature}/build/build-plan.md`,
        hardenReport: `.hodge/features/${feature}/harden/harden-report.md`,
        workLog: `.hodge/features/${feature}/work-log.md`,
      },
      excluded: ['node_modules', 'dist', 'coverage', '*.log', '.hodge/temp', '.hodge/saves/auto-*'],
    };

    // For incremental saves, calculate changes
    if (options.type === 'incremental' || options.type === 'auto') {
      const lastSave = await this.findLastSave(name);
      if (lastSave) {
        const changes = await this.calculateChanges(lastSave, manifest);
        if (changes) {
          manifest.incremental = changes;
        }
      }
    }

    return manifest;
  }

  /**
   * Save only essential files (not copies)
   */
  private async saveEssentials(savePath: string, manifest: SaveManifest): Promise<void> {
    // Save only critical working files that aren't in git
    const essentials = [
      path.join(process.cwd(), '.hodge', 'context.json'),
      path.join(process.cwd(), '.hodge', '.session'),
      manifest.references.workLog ? path.join(process.cwd(), manifest.references.workLog) : '',
    ].filter(Boolean);

    for (const file of essentials) {
      if (file && (await this.fileExists(file))) {
        const content = await fs.readFile(file, 'utf-8');
        const fileName = path.basename(file);
        await fs.writeFile(path.join(savePath, fileName), content);
      }
    }

    // Save git diff for modified files (not full files)
    if (manifest.state.modifiedFiles.length > 0) {
      const diff = await this.getGitDiff();
      await fs.writeFile(path.join(savePath, 'changes.diff'), diff);
    }
  }

  /**
   * Save only incremental changes
   */
  private async saveIncremental(savePath: string, manifest: SaveManifest): Promise<void> {
    if (!manifest.incremental) {
      return this.saveEssentials(savePath, manifest);
    }

    // Save only the delta
    const delta = {
      manifest: manifest.incremental,
      timestamp: manifest.timestamp,
      changes: await this.getGitDiff(manifest.incremental.baseManifest),
    };

    await fs.writeFile(path.join(savePath, 'delta.json'), JSON.stringify(delta, null, 2));
  }

  /**
   * Create lazy-loading proxy
   */
  private createLazyProxy(savePath: string, manifest: SaveManifest): LazyLoadedSave {
    return {
      manifest,
      // These load on demand
      get exploration() {
        return manifest.references.exploration
          ? fs.readFile(manifest.references.exploration, 'utf-8').catch(() => null)
          : Promise.resolve(null);
      },
      get buildPlan() {
        return manifest.references.buildPlan
          ? fs.readFile(manifest.references.buildPlan, 'utf-8').catch(() => null)
          : Promise.resolve(null);
      },
      get workLog() {
        return manifest.references.workLog
          ? fs.readFile(manifest.references.workLog, 'utf-8').catch(() => null)
          : Promise.resolve(null);
      },
      get context() {
        return fs
          .readFile(path.join(savePath, 'context.json'), 'utf-8')
          .then(JSON.parse)
          .catch(() => ({}));
      },
      // Quick summary without loading files
      getSummary() {
        return {
          feature: manifest.session.feature,
          phase: manifest.session.phase,
          lastAction: manifest.session.lastAction,
          elapsed: `${manifest.session.elapsedMinutes} minutes`,
          testStatus: manifest.state.testStatus,
          tasksComplete: manifest.state.completedTasks.length,
          tasksPending: manifest.state.pendingTasks.length,
        };
      },
    };
  }

  /**
   * Load only essential data
   */
  private async loadEssentials(savePath: string, manifest: SaveManifest): Promise<LoadedSaveData> {
    const data: LoadedSaveData = {
      manifest,
      context: {},
      session: {},
      workLog: null,
    };

    // Load saved essentials if they exist
    try {
      const contextContent = await fs.readFile(path.join(savePath, 'context.json'), 'utf-8');
      data.context = JSON.parse(contextContent) as Record<string, unknown>;
    } catch {
      // context remains empty object if file doesn't exist
    }

    try {
      const sessionContent = await fs.readFile(path.join(savePath, '.session'), 'utf-8');
      data.session = JSON.parse(sessionContent) as Record<string, unknown>;
    } catch {
      // session remains empty object if file doesn't exist
    }

    try {
      data.workLog = await fs.readFile(path.join(savePath, 'work-log.md'), 'utf-8');
    } catch {
      // workLog remains null if file doesn't exist
    }

    return data;
  }

  // Helper methods
  private async getCurrentContext(): Promise<{
    feature: string;
    phase: string;
    lastAction: string;
  }> {
    try {
      const contextPath = path.join(process.cwd(), '.hodge', 'context.json');
      const contextContent = await fs.readFile(contextPath, 'utf-8');
      const contextData = JSON.parse(contextContent) as {
        feature?: string;
        phase?: string;
        mode?: string;
        lastAction?: string;
        lastCommand?: string;
      };

      // Map 'mode' to 'phase' for compatibility
      return {
        feature: contextData.feature || 'unknown',
        phase: contextData.phase || contextData.mode || 'explore',
        lastAction: contextData.lastAction || contextData.lastCommand || 'none',
      };
    } catch {
      return { feature: 'unknown', phase: 'explore', lastAction: 'none' };
    }
  }

  private async getModifiedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git diff --name-only HEAD', { cwd: process.cwd() });
      return stdout.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  private async getGitDiff(base?: string): Promise<string> {
    try {
      const cmd = base ? `git diff ${base}..HEAD` : 'git diff HEAD';
      const { stdout } = await execAsync(cmd, { cwd: process.cwd() });
      return stdout;
    } catch {
      return '';
    }
  }

  private async getRecentDecisions(): Promise<string[]> {
    // Get last 5 decisions from decisions.md
    try {
      const decisionsPath = path.join(process.cwd(), '.hodge', 'decisions.md');
      const decisions = await fs.readFile(decisionsPath, 'utf-8');
      const matches = decisions.match(/### \d{4}-\d{2}-\d{2} - (.+)/g) || [];
      return matches.slice(-5).map((m) => m.replace(/### \d{4}-\d{2}-\d{2} - /, ''));
    } catch {
      return [];
    }
  }

  private async getTestStatus(): Promise<'passing' | 'failing' | 'unknown'> {
    // Don't run tests during save - too slow and can hang
    // Instead, check for recent test results file or return unknown
    try {
      // Check if we have a recent test results file (future enhancement)
      const testResultsPath = path.join(process.cwd(), '.hodge', 'test-results.json');
      await fs.access(testResultsPath);
      const stats = await fs.stat(testResultsPath);

      // If results are less than 5 minutes old, use them
      if (Date.now() - stats.mtime.getTime() < 5 * 60 * 1000) {
        const resultsContent = await fs.readFile(testResultsPath, 'utf-8');
        const results = JSON.parse(resultsContent) as { success?: boolean };
        return results.success ? 'passing' : 'failing';
      }
    } catch {
      // No recent test results
    }

    return 'unknown';
  }

  private getCompletedTasks(): string[] {
    // This would integrate with TodoWrite in production
    return [];
  }

  private getPendingTasks(): string[] {
    // This would integrate with TodoWrite in production
    return [];
  }

  private async getLastCommit(): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD', { cwd: process.cwd() });
      return stdout.trim();
    } catch {
      return '';
    }
  }

  private async getSessionStartTime(): Promise<string> {
    try {
      const sessionPath = path.join(process.cwd(), '.hodge', '.session');
      const sessionContent = await fs.readFile(sessionPath, 'utf-8');
      const session = JSON.parse(sessionContent) as { startTime?: string };
      return session.startTime || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private async getElapsedMinutes(): Promise<number> {
    const start = await this.getSessionStartTime();
    return Math.floor((Date.now() - new Date(start).getTime()) / 60000);
  }

  private async findLastSave(pattern: string): Promise<string | null> {
    try {
      const saves = await fs.readdir(this.saveDir);
      const matching = saves.filter((s) => s.includes(pattern)).sort();
      return matching.length > 0 ? matching[matching.length - 1] : null;
    } catch {
      return null;
    }
  }

  private async calculateChanges(
    lastSave: string,
    current: SaveManifest
  ): Promise<SaveManifest['incremental'] | null> {
    const lastManifestPath = path.join(this.saveDir, lastSave, 'manifest.json');
    try {
      const lastManifestContent = await fs.readFile(lastManifestPath, 'utf-8');
      const lastManifest = JSON.parse(lastManifestContent) as SaveManifest;
      return {
        baseManifest: lastSave,
        changes: {
          addedFiles: current.state.modifiedFiles.filter(
            (f) => !lastManifest.state.modifiedFiles.includes(f)
          ),
          modifiedFiles: current.state.modifiedFiles.filter((f) =>
            lastManifest.state.modifiedFiles.includes(f)
          ),
          deletedFiles: lastManifest.state.modifiedFiles.filter(
            (f: string) => !current.state.modifiedFiles.includes(f)
          ),
          newDecisions: current.state.decisions.filter(
            (d) => !lastManifest.state.decisions.includes(d)
          ),
          completedTasks: current.state.completedTasks.filter(
            (t) => !lastManifest.state.completedTasks.includes(t)
          ),
        },
      };
    } catch {
      return null;
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const saveManager = new SaveManager();
