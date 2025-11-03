import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { createCommandLogger } from '../lib/logger.js';
import { ArchitectureGraphService } from '../lib/architecture-graph-service.js';
import { PatternMetadataService } from '../lib/pattern-metadata-service.js';
import type {
  ContextManifest,
  GlobalFile,
  ArchitectureGraph,
  FeatureContext,
  FileStatus,
} from '../types/context-manifest.js';

export interface ContextOptions {
  feature?: string;
  verbose?: boolean;
}

// SavedContext type moved to SaveDiscoveryService (HODGE-363 refactoring)

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
  private basePath: string;
  private logger = createCommandLogger('context', { enableConsole: true });

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();
  }

  async execute(options: ContextOptions = {}): Promise<void> {
    try {
      // HODGE-363: Generate YAML manifest for AI consumption
      await this.generateManifest(options.feature);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Context command failed: ${errorMessage}`), {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Generate YAML manifest for AI context loading (HODGE-363)
   *
   * Outputs structured YAML manifest to stdout containing:
   * - Global files (standards, decisions, principles, etc.)
   * - Architecture graph statistics
   * - Pattern metadata (titles and overviews)
   * - Feature context (when feature specified or from session)
   *
   * Follows HODGE-334: CLI discovers structure, AI interprets content
   */
  private async generateManifest(featureArg?: string): Promise<void> {
    this.logger.info('Generating context manifest');

    // HODGE-364: Removed session fallback - only use explicit feature argument
    // Users expect /hodge with no args to load ONLY global context
    const feature = featureArg;

    // HODGE-372: HODGE.md generation removed - use context.json for session state
    // Git history preserves the HodgeMDGenerator implementation if needed

    // Build manifest
    const manifest: ContextManifest = {
      version: '1.0',
      global_files: await this.buildGlobalFiles(),
      patterns: await this.buildPatternsSection(),
    };

    // Add architecture graph if available
    const graphSection = await this.buildArchitectureGraphSection();
    if (graphSection) {
      manifest.architecture_graph = graphSection;
    }

    // Add feature context if feature specified
    if (feature) {
      manifest.feature_context = await this.buildFeatureContext(feature);
    }

    // Output YAML to stdout (for AI consumption)
    // Use console.log (not logger) - logger goes to pino files, console.log to stdout
    // eslint-disable-next-line no-console -- Intentional: outputs YAML to stdout for AI parsing
    console.log(yaml.dump(manifest, { lineWidth: 100, noRefs: true }));

    this.logger.info(`Context manifest generated for ${feature ?? 'project'}`);
  }

  /**
   * Build global files list with availability status
   */
  private async buildGlobalFiles(): Promise<GlobalFile[]> {
    // HODGE-372: Removed HODGE.md from global files (no longer generated)
    const globalFilePaths = [
      { path: '.hodge/standards.md', note: 'Enforceable project standards' },
      { path: '.hodge/decisions.md', note: 'Architectural decisions' },
      { path: '.hodge/principles.md' },
      { path: '.hodge/architecture-graph.dot' },
      { path: '.hodge/context.json', note: 'Session state and current feature' },
    ];

    const globalFiles: GlobalFile[] = [];

    for (const { path: filePath, note } of globalFilePaths) {
      const fullPath = path.join(this.basePath, filePath);
      const status: FileStatus = (await this.fileExists(fullPath)) ? 'available' : 'not_found';

      globalFiles.push({
        path: filePath,
        status,
        ...(note && { note }),
      });
    }

    return globalFiles;
  }

  /**
   * Build patterns section with extracted metadata
   */
  private async buildPatternsSection() {
    const patternsDir = path.join(this.basePath, '.hodge', 'patterns');
    const patternService = new PatternMetadataService();

    const patterns = await patternService.extractAllPatterns(patternsDir);

    return {
      location: '.hodge/patterns/',
      files: patterns,
    };
  }

  /**
   * Build architecture graph section with statistics
   */
  private async buildArchitectureGraphSection(): Promise<ArchitectureGraph | null> {
    try {
      const graphService = new ArchitectureGraphService();
      const graphExists = graphService.graphExists(this.basePath);

      if (!graphExists) {
        return null;
      }

      const graphContent = await graphService.loadGraph(this.basePath);

      if (!graphContent) {
        return null;
      }

      // Count modules and dependencies from DOT format
      const nodeMatches = graphContent.match(/"\w+"/g);
      const edgeMatches = graphContent.match(/->/g);

      const modules = nodeMatches ? Math.floor(nodeMatches.length / 2) : 0;
      const dependencies = edgeMatches ? edgeMatches.length : 0;

      return {
        status: 'available',
        modules,
        dependencies,
        location: '.hodge/architecture-graph.dot',
        note: 'Updated after each successful /ship',
      };
    } catch (error) {
      this.logger.debug('Failed to build architecture graph section', {
        error: error as Error,
      });
      return null;
    }
  }

  /**
   * Build feature context section
   */
  private async buildFeatureContext(feature: string): Promise<FeatureContext> {
    const featureDir = path.join(this.basePath, '.hodge', 'features', feature);

    // Recursively discover all files in feature directory
    const files = await this.discoverFeatureFiles(featureDir);

    return {
      feature_id: feature,
      files,
    };
  }

  /**
   * Recursively discover all files in feature directory
   */
  private async discoverFeatureFiles(
    dir: string,
    baseDir: string = dir
  ): Promise<Array<{ path: string; status: FileStatus }>> {
    const files: Array<{ path: string; status: FileStatus }> = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.discoverFeatureFiles(fullPath, baseDir);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Add file with relative path from feature directory
          const relativePath = path.relative(this.basePath, fullPath);
          files.push({
            path: relativePath,
            status: 'available',
          });
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to scan directory: ${dir}`, { error: error as Error });
    }

    return files;
  }

  // HODGE-363: loadDefaultContext() removed - replaced by generateManifest() YAML approach
  // Previously loaded context with hardcoded console output for human-readable display
  // Now outputs structured YAML manifest for AI consumption via /hodge slash command

  // HODGE-371: listSaves() and loadRecentSave() removed - options not used in slash commands

  // HODGE-363: loadFeatureContext() removed - replaced by generateManifest() YAML approach
  // Previously loaded feature context with console output for human-readable display
  // Now outputs structured YAML manifest including feature_context section for AI consumption

  // HODGE-363: displayPrinciples() removed - principles now included in YAML manifest
  // Principles file path and availability status provided in global_files section

  // HODGE-363: discoverSaves() and discoverCheckpoints() moved to SaveDiscoveryService
  // Extracted for file length compliance (reduce from 574 to <400 lines)

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

  // HODGE-363: formatTimeAgo() moved to SaveDiscoveryService for file length compliance

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

  // HODGE-371: countTodos() removed - --todos option not used in slash commands

  // HODGE-363: displayArchitectureGraph() removed - graph info now in YAML manifest
  // Architecture graph statistics (module count, dependency count) included in architecture_graph section
  // Graph content available for AI to read from .hodge/architecture-graph.dot when needed
}
