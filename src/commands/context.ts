import chalk from 'chalk';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { HodgeMDGenerator } from '../lib/hodge-md-generator.js';
import { sessionManager } from '../lib/session-manager.js';
import { createCommandLogger } from '../lib/logger.js';

export interface ContextOptions {
  list?: boolean;
  recent?: boolean;
  feature?: string;
  verbose?: boolean;
  todos?: boolean;
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
  private logger = createCommandLogger('context', { enableConsole: true });

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
    this.hodgeMDGenerator = new HodgeMDGenerator(this.basePath);
  }

  async execute(options: ContextOptions = {}): Promise<void> {
    try {
      if (options.todos) {
        await this.countTodos(options.feature);
      } else if (options.list) {
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
      this.logger.error(chalk.red(`Context command failed: ${errorMessage}`), {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Load default context (HODGE.md + save discovery)
   */
  private async loadDefaultContext(): Promise<void> {
    this.logger.info(chalk.cyan('📚 Loading Hodge Context'));
    this.logger.info('');

    // Load session first to get actual feature for accurate mode detection (HODGE-313)
    const session = await sessionManager.load();
    const featureToCheck = session?.feature || 'general';

    // Generate fresh HODGE.md with actual feature for accurate mode detection
    await this.hodgeMDGenerator.saveToFile(featureToCheck);
    this.logger.info(chalk.green('✓ Generated fresh HODGE.md'));

    // Load and display principles if they exist
    await this.displayPrinciples();

    // Discover recent saves
    const saves = await this.discoverSaves();
    if (saves.length > 0) {
      this.logger.info('');
      this.logger.info(chalk.bold('Recent Saved Sessions:'));

      saves.slice(0, 5).forEach((save, index) => {
        this.logger.info(
          chalk.gray(`${index + 1}. `) +
            chalk.yellow(save.name) +
            chalk.gray(` (${this.formatTimeAgo(save.timestamp)})`)
        );
        if (save.feature) {
          this.logger.info(
            chalk.gray(`   Feature: ${save.feature}, Mode: ${save.mode || 'unknown'}`)
          );
        }
        if (save.summary) {
          this.logger.info(chalk.gray(`   ${save.summary}`));
        }
      });

      this.logger.info('');
      this.logger.info(chalk.gray('To load a save: ') + chalk.cyan('hodge context --recent'));
      this.logger.info(chalk.gray('To list all saves: ') + chalk.cyan('hodge context --list'));
    } else {
      this.logger.info(chalk.gray('No saved sessions found.'));
    }

    this.logger.info('');
    this.logger.info(chalk.bold('Context loaded. Ready to work!'));
  }

  /**
   * List all available saves
   */
  private async listSaves(): Promise<void> {
    this.logger.info(chalk.cyan('📋 Available Saved Sessions'));
    this.logger.info('');

    const saves = await this.discoverSaves();

    if (saves.length === 0) {
      this.logger.info(chalk.gray('No saved sessions found.'));
      return;
    }

    saves.forEach((save, index) => {
      this.logger.info(chalk.bold(`${index + 1}. ${save.name}`));
      this.logger.info(chalk.gray(`   Path: ${save.path}`));
      this.logger.info(
        chalk.gray(`   Saved: ${save.timestamp} (${this.formatTimeAgo(save.timestamp)})`)
      );

      if (save.feature) {
        this.logger.info(chalk.gray(`   Feature: ${save.feature}`));
      }

      if (save.mode) {
        this.logger.info(chalk.gray(`   Mode: ${save.mode}`));
      }

      if (save.summary) {
        this.logger.info(chalk.gray(`   Summary: ${save.summary}`));
      }

      this.logger.info('');
    });

    this.logger.info(chalk.gray(`Total: ${saves.length} saved sessions`));
  }

  /**
   * Load the most recent save
   */
  private async loadRecentSave(): Promise<void> {
    this.logger.info(chalk.cyan('🔄 Loading Most Recent Save'));
    this.logger.info('');

    const saves = await this.discoverSaves();

    if (saves.length === 0) {
      this.logger.info(chalk.yellow('No saved sessions found.'));
      return;
    }

    const mostRecent = saves[0];
    this.logger.info(chalk.green(`✓ Loading: ${mostRecent.name}`));
    this.logger.info('');

    // Display the snapshot
    const snapshotPath = path.join(mostRecent.path, 'snapshot.md');
    try {
      const snapshot = await fs.readFile(snapshotPath, 'utf-8');
      this.logger.info(snapshot);
    } catch {
      // Snapshot file missing or unreadable - not critical
      this.logger.info(chalk.yellow('Could not load snapshot.md'));
    }

    this.logger.info('');
    this.logger.info(chalk.bold('Session restored!'));

    if (mostRecent.feature) {
      this.logger.info(
        chalk.gray(`Continue with: `) +
          chalk.cyan(`/${mostRecent.mode || 'explore'} ${mostRecent.feature}`)
      );
    }
  }

  /**
   * Load context for a specific feature
   */
  private async loadFeatureContext(feature: string): Promise<void> {
    this.logger.info(chalk.cyan(`📂 Loading Context for: ${feature}`));
    this.logger.info('');

    // Generate HODGE.md with feature focus
    await this.hodgeMDGenerator.saveToFile(feature);
    this.logger.info(chalk.green('✓ Generated feature-specific HODGE.md'));

    // Check for feature directory
    const featureDir = path.join('.hodge', 'features', feature);
    const featureExists = await this.fileExists(featureDir);

    if (featureExists) {
      this.logger.info(chalk.green(`✓ Found feature directory`));

      // List key files
      const exploreFile = path.join(featureDir, 'explore', 'exploration.md');
      const buildFile = path.join(featureDir, 'build', 'build-plan.md');
      const decisionsFile = path.join(featureDir, 'linked-decisions.md');

      this.logger.info('');
      this.logger.info(chalk.bold('Feature Files:'));

      if (await this.fileExists(exploreFile)) {
        this.logger.info(chalk.gray('• ') + 'exploration.md');
      }
      if (await this.fileExists(buildFile)) {
        this.logger.info(chalk.gray('• ') + 'build-plan.md');
      }
      if (await this.fileExists(decisionsFile)) {
        this.logger.info(chalk.gray('• ') + 'linked-decisions.md');
      }
    } else {
      this.logger.info(chalk.yellow(`Feature directory not found: ${feature}`));
      this.logger.info(chalk.gray('Start with: ') + chalk.cyan(`/explore ${feature}`));
    }

    // Find feature-specific saves
    const saves = await this.discoverSaves();
    const featureSaves = saves.filter((s) => s.feature === feature);

    if (featureSaves.length > 0) {
      this.logger.info('');
      this.logger.info(chalk.bold('Feature-Specific Saves:'));

      featureSaves.slice(0, 3).forEach((save, index) => {
        this.logger.info(
          chalk.gray(`${index + 1}. `) +
            chalk.yellow(save.name) +
            chalk.gray(` (${this.formatTimeAgo(save.timestamp)})`)
        );
      });
    }

    this.logger.info('');
    this.logger.info(chalk.bold(`Context loaded for ${feature}!`));
  }

  /**
   * Display principles if they exist
   */
  private async displayPrinciples(): Promise<void> {
    const principlesPath = path.join('.hodge', 'principles.md');

    try {
      const principles = await fs.readFile(principlesPath, 'utf-8');

      // Extract just core principles section
      const coreRegex = /## Core Principles\n\n([\s\S]*?)(?=\n##|$)/;
      const coreMatch = coreRegex.exec(principles);

      if (coreMatch) {
        this.logger.info('');
        this.logger.info(chalk.bold('Core Principles:'));

        // Extract and display just the principle titles
        const lines = coreMatch[1].split('\n');
        lines.forEach((line) => {
          if (line.startsWith('### ')) {
            this.logger.info(chalk.yellow(`  ${line.substring(4)}`));
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
      const decisionRegex = /^###\s+\d{4}-\d{2}-\d{2}\s+-\s+/;
      const decisionIndices: number[] = [];
      lines.forEach((line, index) => {
        if (decisionRegex.exec(line)) {
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
        if (decisionRegex.exec(lines[i])) {
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

  /**
   * Count TODO comments in exploration.md
   */
  private async countTodos(featureArg?: string): Promise<void> {
    try {
      // Determine which feature to check
      let feature = featureArg;
      if (!feature) {
        const session = await sessionManager.load();
        feature = session?.feature;
      }

      if (!feature) {
        this.logger.error(chalk.red('No feature specified and no active session found'));
        this.logger.info('Usage: hodge context --todos [--feature HODGE-XXX]');
        throw new Error('No feature specified and no active session found');
      }

      // Check if exploration.md exists
      const explorationPath = path.join('.hodge', 'features', feature, 'explore', 'exploration.md');

      if (!existsSync(explorationPath)) {
        this.logger.info(chalk.yellow(`No exploration.md found for ${feature}`));
        this.logger.info(chalk.gray(`Expected at: ${explorationPath}`));
        return;
      }

      // Read exploration.md
      const content = await fs.readFile(explorationPath, 'utf-8');

      // Count TODOs using various patterns
      const todoPatterns = [
        /\/\/\s*TODO:/gi, // // TODO:
        /TODO:/gi, // TODO: (standalone)
        /\[ \]\s*TODO/gi, // [ ] TODO (checklist)
        /-\s*\[ \]\s*TODO/gi, // - [ ] TODO (markdown checklist)
      ];

      let totalCount = 0;

      for (const pattern of todoPatterns) {
        const found = content.match(pattern);
        if (found) {
          totalCount += found.length;
        }
      }

      // Display results
      this.logger.info(chalk.blue('📝 TODO Count\n'));
      this.logger.info(chalk.bold(`TODOs Found: ${chalk.yellow(totalCount.toString())}`));
      this.logger.info(`Feature: ${chalk.cyan(feature)}`);
      this.logger.info(`Location: ${chalk.gray(explorationPath)}`);

      if (totalCount > 0) {
        this.logger.info(
          chalk.gray(`\n  ℹ  Use 'grep -n "TODO:" ${explorationPath}' to see specific items`)
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to count TODOs: ${errorMessage}`), {
        error: error as Error,
      });
      throw error;
    }
  }
}
