import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import { HodgeMDGenerator } from '../lib/hodge-md-generator.js';

export interface ContextOptions {
  list?: boolean;
  recent?: boolean;
  feature?: string;
  verbose?: boolean;
}

interface SavedContext {
  name: string;
  path: string;
  feature?: string;
  mode?: string;
  timestamp: string;
  summary?: string;
}

/**
 * Context command for managing Hodge sessions
 * Handles loading project context, discovering saves, and restoring sessions
 *
 * Implements HODGE-297 decisions:
 * 1. Load recent 20 decisions (not full 1100+ line history)
 * 2. Load id-mappings.json only when feature has linked PM issue
 * 3. Keep pattern loading on-demand (no change)
 * 4. Load all .md and .json files in current phase directory
 * 5. Update both /hodge and /load commands consistently
 */
export class ContextCommand {
  private hodgeMDGenerator: HodgeMDGenerator;
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
    this.hodgeMDGenerator = new HodgeMDGenerator(this.basePath);
  }

  async execute(options: ContextOptions = {}): Promise<void> {
    try {
      if (options.list) {
        await this.listSaves();
      } else if (options.recent) {
        await this.loadRecentSave();
      } else if (options.feature) {
        await this.loadFeatureContext(options.feature);
      } else {
        await this.loadDefaultContext();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Context command failed: ${errorMessage}`));
      throw error;
    }
  }

  /**
   * Load default context (HODGE.md + save discovery)
   */
  private async loadDefaultContext(): Promise<void> {
    console.log(chalk.cyan('📚 Loading Hodge Context'));
    console.log();

    // Generate fresh HODGE.md (use 'general' for non-feature context)
    await this.hodgeMDGenerator.saveToFile('general');
    console.log(chalk.green('✓ Generated fresh HODGE.md'));

    // Load and display principles if they exist
    await this.displayPrinciples();

    // Discover recent saves
    const saves = await this.discoverSaves();
    if (saves.length > 0) {
      console.log();
      console.log(chalk.bold('Recent Saved Sessions:'));

      saves.slice(0, 5).forEach((save, index) => {
        console.log(
          chalk.gray(`${index + 1}. `) +
            chalk.yellow(save.name) +
            chalk.gray(` (${this.formatTimeAgo(save.timestamp)})`)
        );
        if (save.feature) {
          console.log(chalk.gray(`   Feature: ${save.feature}, Mode: ${save.mode || 'unknown'}`));
        }
        if (save.summary) {
          console.log(chalk.gray(`   ${save.summary}`));
        }
      });

      console.log();
      console.log(chalk.gray('To load a save: ') + chalk.cyan('hodge context --recent'));
      console.log(chalk.gray('To list all saves: ') + chalk.cyan('hodge context --list'));
    } else {
      console.log(chalk.gray('No saved sessions found.'));
    }

    console.log();
    console.log(chalk.bold('Context loaded. Ready to work!'));
  }

  /**
   * List all available saves
   */
  private async listSaves(): Promise<void> {
    console.log(chalk.cyan('📋 Available Saved Sessions'));
    console.log();

    const saves = await this.discoverSaves();

    if (saves.length === 0) {
      console.log(chalk.gray('No saved sessions found.'));
      return;
    }

    saves.forEach((save, index) => {
      console.log(chalk.bold(`${index + 1}. ${save.name}`));
      console.log(chalk.gray(`   Path: ${save.path}`));
      console.log(
        chalk.gray(`   Saved: ${save.timestamp} (${this.formatTimeAgo(save.timestamp)})`)
      );

      if (save.feature) {
        console.log(chalk.gray(`   Feature: ${save.feature}`));
      }

      if (save.mode) {
        console.log(chalk.gray(`   Mode: ${save.mode}`));
      }

      if (save.summary) {
        console.log(chalk.gray(`   Summary: ${save.summary}`));
      }

      console.log();
    });

    console.log(chalk.gray(`Total: ${saves.length} saved sessions`));
  }

  /**
   * Load the most recent save
   */
  private async loadRecentSave(): Promise<void> {
    console.log(chalk.cyan('🔄 Loading Most Recent Save'));
    console.log();

    const saves = await this.discoverSaves();

    if (saves.length === 0) {
      console.log(chalk.yellow('No saved sessions found.'));
      return;
    }

    const mostRecent = saves[0];
    console.log(chalk.green(`✓ Loading: ${mostRecent.name}`));
    console.log();

    // Display the snapshot
    const snapshotPath = path.join(mostRecent.path, 'snapshot.md');
    try {
      const snapshot = await fs.readFile(snapshotPath, 'utf-8');
      console.log(snapshot);
    } catch (error) {
      console.log(chalk.yellow('Could not load snapshot.md'));
    }

    console.log();
    console.log(chalk.bold('Session restored!'));

    if (mostRecent.feature) {
      console.log(
        chalk.gray(`Continue with: `) +
          chalk.cyan(`/${mostRecent.mode || 'explore'} ${mostRecent.feature}`)
      );
    }
  }

  /**
   * Load context for a specific feature
   */
  private async loadFeatureContext(feature: string): Promise<void> {
    console.log(chalk.cyan(`📂 Loading Context for: ${feature}`));
    console.log();

    // Generate HODGE.md with feature focus
    await this.hodgeMDGenerator.saveToFile(feature);
    console.log(chalk.green('✓ Generated feature-specific HODGE.md'));

    // Check for feature directory
    const featureDir = path.join('.hodge', 'features', feature);
    const featureExists = await this.fileExists(featureDir);

    if (featureExists) {
      console.log(chalk.green(`✓ Found feature directory`));

      // List key files
      const exploreFile = path.join(featureDir, 'explore', 'exploration.md');
      const buildFile = path.join(featureDir, 'build', 'build-plan.md');
      const decisionsFile = path.join(featureDir, 'linked-decisions.md');

      console.log();
      console.log(chalk.bold('Feature Files:'));

      if (await this.fileExists(exploreFile)) {
        console.log(chalk.gray('• ') + 'exploration.md');
      }
      if (await this.fileExists(buildFile)) {
        console.log(chalk.gray('• ') + 'build-plan.md');
      }
      if (await this.fileExists(decisionsFile)) {
        console.log(chalk.gray('• ') + 'linked-decisions.md');
      }
    } else {
      console.log(chalk.yellow(`Feature directory not found: ${feature}`));
      console.log(chalk.gray('Start with: ') + chalk.cyan(`/explore ${feature}`));
    }

    // Find feature-specific saves
    const saves = await this.discoverSaves();
    const featureSaves = saves.filter((s) => s.feature === feature);

    if (featureSaves.length > 0) {
      console.log();
      console.log(chalk.bold('Feature-Specific Saves:'));

      featureSaves.slice(0, 3).forEach((save, index) => {
        console.log(
          chalk.gray(`${index + 1}. `) +
            chalk.yellow(save.name) +
            chalk.gray(` (${this.formatTimeAgo(save.timestamp)})`)
        );
      });
    }

    console.log();
    console.log(chalk.bold(`Context loaded for ${feature}!`));
  }

  /**
   * Display principles if they exist
   */
  private async displayPrinciples(): Promise<void> {
    const principlesPath = path.join('.hodge', 'principles.md');

    try {
      const principles = await fs.readFile(principlesPath, 'utf-8');

      // Extract just core principles section
      const coreMatch = principles.match(/## Core Principles\n\n([\s\S]*?)(?=\n##|$)/);

      if (coreMatch) {
        console.log();
        console.log(chalk.bold('Core Principles:'));

        // Extract and display just the principle titles
        const lines = coreMatch[1].split('\n');
        lines.forEach((line) => {
          if (line.startsWith('### ')) {
            console.log(chalk.yellow(`  ${line.substring(4)}`));
          }
        });
      }
    } catch {
      // No principles file, that's OK
    }
  }

  /**
   * Discover saved contexts
   */
  private async discoverSaves(): Promise<SavedContext[]> {
    const savesDir = path.join('.hodge', 'saves');

    try {
      const dirs = await fs.readdir(savesDir);
      const saves: SavedContext[] = [];

      for (const dir of dirs) {
        const contextPath = path.join(savesDir, dir, 'context.json');

        try {
          const contextData = await fs.readFile(contextPath, 'utf-8');
          const context = JSON.parse(contextData) as {
            feature?: string;
            mode?: string;
            timestamp?: string;
            session?: { keyAchievements?: string[] };
            nextPhase?: string;
          };

          saves.push({
            name: dir,
            path: path.join(savesDir, dir),
            feature: context.feature || 'unknown',
            mode: context.mode || 'unknown',
            timestamp: context.timestamp || 'unknown',
            summary: context.session?.keyAchievements?.[0] || context.nextPhase || '',
          });
        } catch {
          // Skip invalid saves
        }
      }

      // Sort by timestamp (most recent first)
      saves.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      return saves;
    } catch {
      return [];
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format timestamp as time ago
   */
  private formatTimeAgo(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      }
    } catch {
      return 'recently';
    }
  }

  /**
   * HODGE-297: Load recent N decisions instead of full file
   * Decision 1: Load recent 20 decisions (not full 1100+ line history)
   */
  async loadRecentDecisions(limit: number = 20): Promise<string> {
    const decisionsPath = path.join(this.basePath, '.hodge', 'decisions.md');

    try {
      const content = await fs.readFile(decisionsPath, 'utf-8');
      const lines = content.split('\n');

      // Find decision headers (### YYYY-MM-DD - Title)
      const decisionIndices: number[] = [];
      lines.forEach((line, index) => {
        if (line.match(/^###\s+\d{4}-\d{2}-\d{2}\s+-\s+/)) {
          decisionIndices.push(index);
        }
      });

      if (decisionIndices.length === 0) {
        return content; // No decisions found, return full file
      }

      // Take first N decision indices (most recent at top)
      const limitedIndices = decisionIndices.slice(0, limit);
      const lastDecisionIndex = limitedIndices[limitedIndices.length - 1];

      // Find end of last decision (next decision or end of file)
      let endIndex = lines.length;
      for (let i = lastDecisionIndex + 1; i < lines.length; i++) {
        if (lines[i].match(/^###\s+\d{4}-\d{2}-\d{2}\s+-\s+/)) {
          endIndex = i;
          break;
        }
      }

      // Extract header section (before first decision)
      const headerEndIndex = decisionIndices[0];
      const header = lines.slice(0, headerEndIndex).join('\n');

      // Extract recent decisions
      const recentDecisions = lines.slice(decisionIndices[0], endIndex).join('\n');

      // Add truncation note if limited
      const truncationNote =
        decisionIndices.length > limit
          ? `\n\n---\n*Showing ${limit} most recent decisions of ${decisionIndices.length} total*\n`
          : '';

      return `${header}\n${recentDecisions}${truncationNote}`;
    } catch {
      return '';
    }
  }

  /**
   * HODGE-297: Check if feature has linked PM issue
   * Decision 2: Load id-mappings.json only when feature has PM issue
   */
  async hasLinkedPMIssue(feature: string): Promise<boolean> {
    const issueIdPath = path.join(this.basePath, '.hodge', 'features', feature, 'issue-id.txt');
    return this.fileExists(issueIdPath);
  }

  /**
   * HODGE-297: Detect current phase for feature
   * Decision 4: Load all .md and .json files in current phase directory
   */
  async detectPhase(feature: string): Promise<'explore' | 'build' | 'harden' | 'ship' | null> {
    const featurePath = path.join(this.basePath, '.hodge', 'features', feature);

    // Check in reverse order (most advanced phase first)
    const phases: Array<'ship' | 'harden' | 'build' | 'explore'> = [
      'ship',
      'harden',
      'build',
      'explore',
    ];

    for (const phase of phases) {
      if (await this.fileExists(path.join(featurePath, phase))) {
        return phase;
      }
    }

    return null;
  }

  /**
   * HODGE-297: Load all .md and .json files from phase directory
   * Decision 4: Load all .md and .json files in current phase directory
   */
  async loadPhaseFiles(feature: string, phase: string): Promise<string[]> {
    const phasePath = path.join(this.basePath, '.hodge', 'features', feature, phase);

    if (!(await this.fileExists(phasePath))) {
      return [];
    }

    try {
      const entries = await fs.readdir(phasePath, { withFileTypes: true });

      return entries
        .filter((entry) => entry.isFile())
        .filter((entry) => {
          const ext = path.extname(entry.name);
          return ext === '.md' || ext === '.json';
        })
        .map((entry) => entry.name);
    } catch {
      return [];
    }
  }
}
