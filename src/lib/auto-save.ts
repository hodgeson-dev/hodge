import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { saveManager } from './save-manager.js';

/**
 * Auto-save utility for preserving context when switching features
 * Now uses optimized incremental saves for speed
 */
export class AutoSave {
  private basePath: string;
  private contextPath: string;
  private savesPath: string;
  private enabled: boolean;
  private lastSaveTime: Map<string, number> = new Map();
  private FULL_SAVE_INTERVAL = 30 * 60 * 1000; // Full save every 30 minutes

  constructor(basePath: string = '.') {
    this.basePath = basePath;
    this.contextPath = path.join(basePath, '.hodge', 'context.json');
    this.savesPath = path.join(basePath, '.hodge', 'saves');
    this.enabled = true;
  }

  /**
   * Check if auto-save should occur and perform it if needed
   * @param newFeature - The feature being switched to
   * @returns true if auto-save occurred, false otherwise
   */
  async checkAndSave(newFeature: string): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const currentContext = await this.loadCurrentContext();

      // No auto-save needed if no current feature or same feature
      if (!currentContext?.feature || currentContext.feature === newFeature) {
        return false;
      }

      // Perform auto-save
      await this.performAutoSave(currentContext.feature);
      return true;
    } catch (error) {
      // Log error but don't block command execution
      console.error(
        chalk.gray(
          `Auto-save check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
      return false;
    }
  }

  /**
   * Load current context from context.json
   * @returns Current context or null if not found
   */
  private async loadCurrentContext(): Promise<{ feature?: string; mode?: string } | null> {
    if (!existsSync(this.contextPath)) {
      return null;
    }

    try {
      const content = await readFile(this.contextPath, 'utf-8');
      return JSON.parse(content) as { feature?: string; mode?: string };
    } catch {
      return null;
    }
  }

  /**
   * Perform optimized auto-save for the specified feature
   * Uses incremental saves when possible for speed
   * @param feature - Feature to auto-save
   */
  private async performAutoSave(feature: string): Promise<void> {
    const startTime = Date.now();

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const saveName = `auto-${feature}-${timestamp}`;

      // Determine if we should do full or incremental save
      const lastSave = this.lastSaveTime.get(feature) || 0;
      const timeSinceLastSave = Date.now() - lastSave;
      const saveType = timeSinceLastSave > this.FULL_SAVE_INTERVAL ? 'full' : 'incremental';

      // Use the new SaveManager for optimized saves
      await saveManager.save(saveName, {
        type: saveType,
        minimal: saveType === 'incremental', // Incremental saves are minimal
        includeGenerated: false, // Never include generated files in auto-saves
      });

      this.lastSaveTime.set(feature, Date.now());

      const elapsed = Date.now() - startTime;
      console.log(
        chalk.blue(
          `📦 Auto-saved: ${feature} → ${path.join(this.savesPath, saveName)} (${elapsed}ms)`
        )
      );
    } catch (error) {
      // Don't let auto-save errors block the workflow
      console.error(
        chalk.gray(
          `Auto-save failed for ${feature}: ${error instanceof Error ? error.message : 'Unknown'}`
        )
      );
    }
  }

  /**
   * Legacy method for compatibility
   * @deprecated Use performAutoSave with SaveManager instead
   * @internal Kept for reference but not used
   */
  // @ts-expect-error - Kept for reference but not used
  private async performLegacyAutoSave(feature: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const saveName = `auto-${feature}-${timestamp}`;
      const saveDir = path.join(this.savesPath, saveName);

      await mkdir(saveDir, { recursive: true });

      if (existsSync(this.contextPath)) {
        await copyFile(this.contextPath, path.join(saveDir, 'context.json'));
      }

      const featureDir = path.join(this.basePath, '.hodge', 'features', feature);
      if (existsSync(featureDir)) {
        const snapshot = {
          feature,
          timestamp: new Date().toISOString(),
          autoSave: true,
          reason: 'Feature switch auto-save',
          files: await this.getFeatureFiles(featureDir),
        };
        await writeFile(path.join(saveDir, 'snapshot.json'), JSON.stringify(snapshot, null, 2));
      }

      // Display notification
      console.log(chalk.yellow(`📦 Auto-saved: ${feature} → .hodge/saves/${saveName}`));
    } catch (error) {
      // Log error but don't throw - auto-save should not block operations
      console.error(
        chalk.red(
          `Auto-save failed for ${feature}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  }

  /**
   * Get list of files in feature directory
   * @param featureDir - Feature directory path
   * @returns List of file paths
   */
  private async getFeatureFiles(featureDir: string): Promise<string[]> {
    try {
      const { readdir } = await import('fs/promises');
      const files: string[] = [];

      const walkDir = async (dir: string): Promise<void> => {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walkDir(fullPath);
          } else {
            files.push(path.relative(featureDir, fullPath));
          }
        }
      };

      await walkDir(featureDir);
      return files;
    } catch {
      return [];
    }
  }

  /**
   * Wrapper to add auto-save to any command that accepts a feature parameter
   * @param command - Command function to wrap
   * @returns Wrapped command function
   */
  wrapCommand<T extends (...args: unknown[]) => Promise<unknown>>(command: T): T {
    return (async (...args: Parameters<T>) => {
      // Extract feature from first argument (common pattern in hodge commands)
      const feature = args[0] as string | undefined;

      if (feature && typeof feature === 'string') {
        await this.checkAndSave(feature);
      }

      // Execute original command
      return command(...args);
    }) as T;
  }

  /**
   * Enable or disable auto-save
   * @param enabled - Whether auto-save should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if auto-save is enabled
   * @returns Whether auto-save is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const autoSave = new AutoSave();
