import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';
import { sessionManager } from '../lib/session-manager.js';
import { createCommandLogger } from '../lib/logger.js';

export interface StatusOptions {
  stats?: boolean;
}

interface ShipRecord {
  feature: string;
  timestamp: string;
  validationPassed?: boolean;
  shipChecks?: {
    tests?: boolean;
    coverage?: boolean;
  };
}

export class StatusCommand {
  private logger = createCommandLogger('status', { enableConsole: true });
  private statsCache?: { data: StatsData; timestamp: number };
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async execute(feature?: string, options?: StatusOptions): Promise<void> {
    // Handle --stats flag
    if (options?.stats) {
      await this.showStats();
      return;
    }
    // Check for existing session first
    const session = await sessionManager.load();
    if (session && !feature) {
      // Non-interactive: just use the session feature if no feature specified
      feature = session.feature;
      this.logger.info(chalk.blue(`📂 Showing status for ${session.feature} from session\n`));
    }

    if (feature) {
      await this.showFeatureStatus(feature);
    } else {
      await this.showOverallStatus();
    }
  }

  private async showFeatureStatus(feature: string): Promise<void> {
    this.logger.info(chalk.blue(`📊 Status for feature: ${feature}\n`));

    const featureDir = path.join('.hodge', 'features', feature);

    if (!existsSync(featureDir)) {
      this.logger.info(chalk.yellow('⚠️  No work found for this feature.'));
      this.logger.info(chalk.gray(`   Start with: hodge explore ${feature}`));
      return;
    }

    const featureState = await this.getFeatureState(featureDir);
    const issueId = await this.getIssueId(featureDir);

    this.displayFeatureProgress(featureState);
    this.displayPMIntegration(issueId);
    this.displayNextStep(feature, featureState);
  }

  private async getFeatureState(featureDir: string) {
    const hasExploration = existsSync(path.join(featureDir, 'explore'));
    const hasDecision = existsSync(path.join(featureDir, 'decisions.md'));
    const hasBuild = existsSync(path.join(featureDir, 'build'));
    const hasHarden = existsSync(path.join(featureDir, 'harden'));
    const isProductionReady = await this.checkProductionReady(featureDir);
    const isShipped = await this.checkShipped(featureDir);

    return { hasExploration, hasDecision, hasBuild, hasHarden, isProductionReady, isShipped };
  }

  private async checkProductionReady(featureDir: string): Promise<boolean> {
    const validationFile = path.join(featureDir, 'harden', 'validation-results.json');
    if (!existsSync(validationFile)) {
      return false;
    }

    try {
      const results = JSON.parse(await fs.readFile(validationFile, 'utf-8')) as Record<
        string,
        { passed: boolean }
      >;
      return Object.values(results).every((r) => r.passed);
    } catch {
      return false;
    }
  }

  private async checkShipped(featureDir: string): Promise<boolean> {
    const shipRecordFile = path.join(featureDir, 'ship-record.json');
    if (!existsSync(shipRecordFile)) {
      return false;
    }

    try {
      const record = JSON.parse(await fs.readFile(shipRecordFile, 'utf-8')) as ShipRecord;
      return record.validationPassed === true;
    } catch {
      return false;
    }
  }

  private async getIssueId(featureDir: string): Promise<string | null> {
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    if (!existsSync(issueIdFile)) {
      return null;
    }
    return (await fs.readFile(issueIdFile, 'utf-8')).trim();
  }

  private displayFeatureProgress(state: {
    hasExploration: boolean;
    hasDecision: boolean;
    hasBuild: boolean;
    hasHarden: boolean;
    isProductionReady: boolean;
    isShipped: boolean;
  }): void {
    this.logger.info(chalk.bold('Progress:'));
    this.logger.info(
      '  ' + (state.hasExploration ? chalk.green('✓') : chalk.gray('○')) + ' Exploration'
    );
    this.logger.info('  ' + (state.hasDecision ? chalk.green('✓') : chalk.gray('○')) + ' Decision');
    this.logger.info('  ' + (state.hasBuild ? chalk.green('✓') : chalk.gray('○')) + ' Build');
    this.logger.info('  ' + (state.hasHarden ? chalk.green('✓') : chalk.gray('○')) + ' Harden');
    this.logger.info(
      '  ' + (state.isProductionReady ? chalk.green('✓') : chalk.gray('○')) + ' Production Ready'
    );
    this.logger.info('  ' + (state.isShipped ? chalk.green('✓') : chalk.gray('○')) + ' Shipped\n');
  }

  private displayPMIntegration(issueId: string | null): void {
    if (!issueId) {
      return;
    }

    this.logger.info(chalk.bold('PM Integration:'));
    this.logger.info(`  Issue: ${issueId}`);
    if (process.env.HODGE_PM_TOOL) {
      this.logger.info(`  Tool: ${process.env.HODGE_PM_TOOL}`);
    }
    this.logger.info('');
  }

  private displayNextStep(
    feature: string,
    state: {
      hasExploration: boolean;
      hasDecision: boolean;
      hasBuild: boolean;
      hasHarden: boolean;
      isProductionReady: boolean;
      isShipped: boolean;
    }
  ): void {
    this.logger.info(chalk.bold('Next Step:'));

    if (!state.hasExploration) {
      this.logger.info(chalk.cyan(`  hodge explore ${feature}`));
    } else if (!state.hasDecision) {
      this.logger.info(chalk.yellow('  Review exploration and make a decision'));
      this.logger.info(chalk.cyan(`  hodge decide "Your decision here" --feature ${feature}`));
    } else if (!state.hasBuild) {
      this.logger.info(chalk.cyan(`  hodge build ${feature}`));
    } else if (!state.hasHarden) {
      this.logger.info(chalk.cyan(`  hodge harden ${feature}`));
    } else if (!state.isProductionReady) {
      this.logger.info(chalk.yellow('  Fix validation issues and run:'));
      this.logger.info(chalk.cyan(`  hodge harden ${feature}`));
    } else if (state.isShipped) {
      this.logger.info(chalk.green('  ✓ Feature completed. Start new work with:'));
      this.logger.info(chalk.cyan(`  hodge explore <feature>`));
    } else {
      this.logger.info(chalk.green('  ✓ Feature is ready to ship!'));
      this.logger.info(chalk.cyan(`  hodge ship ${feature}`));
    }
  }

  private async showOverallStatus(): Promise<void> {
    this.logger.info(chalk.blue('📊 Overall Hodge Status\n'));

    // Check if Hodge is initialized
    const configFile = path.join('.hodge', 'config.json');
    if (!existsSync(configFile)) {
      this.logger.info(chalk.red('❌ Hodge is not initialized in this project.'));
      this.logger.info(chalk.gray('   Run: hodge init'));
      return;
    }

    // Load configuration
    const config = JSON.parse(await fs.readFile(configFile, 'utf-8')) as {
      projectName?: string;
      projectType?: string;
      pmTool?: string;
    };

    this.logger.info(chalk.bold('Project Configuration:'));
    this.logger.info(`  Name: ${config.projectName ?? 'Unknown'}`);
    this.logger.info(`  Type: ${config.projectType ?? 'Unknown'}`);
    if (config.pmTool) {
      this.logger.info(`  PM Tool: ${config.pmTool}`);
    }
    this.logger.info('');

    // Count features
    const featuresDir = path.join('.hodge', 'features');
    let featureCount = 0;
    const activeFeatures: string[] = [];

    if (existsSync(featuresDir)) {
      const features = await fs.readdir(featuresDir);
      featureCount = features.length;

      for (const feature of features) {
        const hardenDir = path.join(featuresDir, feature, 'harden');
        if (!existsSync(hardenDir)) {
          activeFeatures.push(feature);
        }
      }
    }

    // Count patterns and decisions
    const patternsDir = path.join('.hodge', 'patterns');
    let patternCount = 0;
    if (existsSync(patternsDir)) {
      const patterns = await fs.readdir(patternsDir);
      patternCount = patterns.filter((f) => f.endsWith('.md')).length;
    }

    const decisionsFile = path.join('.hodge', 'decisions.md');
    let decisionCount = 0;
    if (existsSync(decisionsFile)) {
      const content = await fs.readFile(decisionsFile, 'utf-8');
      decisionCount = (content.match(/^### \d{4}-/gm) ?? []).length;
    }

    // Display statistics
    this.logger.info(chalk.bold('Statistics:'));
    this.logger.info(`  Features: ${chalk.green(featureCount.toString())}`);
    this.logger.info(`  Active: ${chalk.yellow(activeFeatures.length.toString())}`);
    this.logger.info(`  Patterns: ${chalk.green(patternCount.toString())}`);
    this.logger.info(`  Decisions: ${chalk.green(decisionCount.toString())}`);
    this.logger.info('');

    // Show active features
    if (activeFeatures.length > 0) {
      this.logger.info(chalk.bold('Active Features:'));
      for (const feature of activeFeatures.slice(0, 5)) {
        this.logger.info(`  • ${feature}`);
      }
      if (activeFeatures.length > 5) {
        this.logger.info(chalk.gray(`  ... and ${activeFeatures.length - 5} more`));
      }
      this.logger.info('');
    }

    // AI Context
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(chalk.blue.bold('PROJECT CONTEXT SUMMARY:'));
    this.logger.info(chalk.bold('═'.repeat(60)));
    this.logger.info(`Project: ${config.projectName ?? 'Unknown'}`);
    this.logger.info(`Active Features: ${activeFeatures.join(', ') || 'None'}`);
    this.logger.info(`Patterns Available: ${patternCount}`);
    this.logger.info(`Decisions Made: ${decisionCount}`);
    this.logger.info('\nUse this context to maintain consistency across the project.');
    this.logger.info(chalk.bold('═'.repeat(60)));
  }

  // Removed updateHodgeMD method - status should be read-only
  // HODGE.md updates now happen in commands that actually change state:
  // - explore, build, harden, ship (for feature HODGE.md)
  // - context (for main HODGE.md when explicitly requested)

  /**
   * Show velocity stats (ships per week/month, streaks, coverage trends)
   * Uses hybrid data source: ship-record.json (primary) + git log (fallback)
   */
  private async showStats(): Promise<void> {
    this.logger.info(chalk.blue('📊 Velocity Stats\n'));

    try {
      const stats = await this.calculateStats();

      this.logger.info(chalk.bold('Shipping Velocity:'));
      this.logger.info(`  Ships This Week: ${chalk.green(stats.shipsThisWeek.toString())}`);
      this.logger.info(`  Ships This Month: ${chalk.green(stats.shipsThisMonth.toString())}`);
      this.logger.info(`  Total Shipped: ${chalk.green(stats.totalShipped.toString())}`);

      if (stats.streak > 0) {
        const streakText = stats.streak === 1 ? '1 week' : `${stats.streak} consecutive weeks`;
        this.logger.info(`  Streak: ${chalk.yellow(streakText)}`);
      }

      if (stats.coverageTrend !== null) {
        const trendSymbol = stats.coverageTrend >= 0 ? '+' : '';
        const trendColor = stats.coverageTrend >= 0 ? chalk.green : chalk.red;
        this.logger.info(
          `  Test Coverage: ${stats.averageCoverage}% (trend: ${trendColor(trendSymbol + stats.coverageTrend + '%')})`
        );
      }

      if (stats.dataSource === 'hybrid') {
        this.logger.info(chalk.gray('\n  ℹ  Using hybrid data (ship records + git history)'));
      } else if (stats.dataSource === 'git-only') {
        this.logger.info(chalk.gray('\n  ℹ  Using git history only (no ship records found)'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(chalk.red(`Failed to calculate stats: ${errorMessage}`));
      process.exit(1);
    }
  }

  /**
   * Calculate stats using hybrid approach (ship-record.json + git log fallback)
   */
  private async calculateStats(): Promise<StatsData> {
    // Check cache first
    if (this.statsCache) {
      const age = Date.now() - this.statsCache.timestamp;
      if (age < this.CACHE_TTL) {
        return this.statsCache.data;
      }
    }

    // Scan ship-record.json files (primary source)
    const shipRecords = await this.scanShipRecords();

    // Parse git history (fallback source)
    const gitShips = this.parseGitHistory();

    // Merge datasets
    const allShips = this.mergeByFeatureId(shipRecords, gitShips);

    // Determine data source
    let dataSource: 'ship-records' | 'git-only' | 'hybrid' = 'ship-records';
    if (shipRecords.length === 0 && gitShips.length > 0) {
      dataSource = 'git-only';
    } else if (shipRecords.length > 0 && gitShips.length > 0) {
      dataSource = 'hybrid';
    }

    // Calculate metrics
    const now = new Date();
    const shipsThisWeek = this.countSince(allShips, 7, now);
    const shipsThisMonth = this.countSince(allShips, 30, now);
    const totalShipped = allShips.length;
    const streak = this.calculateConsecutiveWeeks(allShips, now);
    const coverageTrend = this.calculateCoverageTrend(shipRecords);

    const stats: StatsData = {
      shipsThisWeek,
      shipsThisMonth,
      totalShipped,
      streak,
      coverageTrend: coverageTrend.trend,
      averageCoverage: coverageTrend.average,
      dataSource,
    };

    // Cache results
    this.statsCache = {
      data: stats,
      timestamp: Date.now(),
    };

    return stats;
  }

  /**
   * Scan for ship-record.json files in .hodge/features/
   */
  private async scanShipRecords(): Promise<ShipRecord[]> {
    try {
      const pattern = '.hodge/features/*/ship-record.json';
      const files = await glob(pattern, { absolute: true });

      const records: ShipRecord[] = [];

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const record = JSON.parse(content) as Partial<ShipRecord>;

          if (record.feature && record.timestamp) {
            records.push({
              feature: record.feature,
              timestamp: record.timestamp,
              validationPassed: record.validationPassed,
              shipChecks: record.shipChecks,
            });
          }
        } catch (error) {
          // Skip corrupted files
          this.logger.debug(`Skipping corrupted ship record: ${file}`, { error: error as Error });
        }
      }

      return records;
    } catch {
      // No ship records found or glob failed - suppress error logging
      return [];
    }
  }

  /**
   * Parse git history for shipped features (fallback for deleted directories)
   */
  private parseGitHistory(): ShipRecord[] {
    try {
      // Check if git is available
      // eslint-disable-next-line sonarjs/no-os-command-from-path, sonarjs/os-command
      execSync('git --version', { stdio: 'ignore' });

      // Get commits with Claude Code signature (git command is safe - hardcoded)
      /* eslint-disable sonarjs/no-os-command-from-path, sonarjs/os-command */
      const output = execSync(
        'git log --all --grep="🤖 Generated with" --format="%H|%ai|%s" --since="3 months ago"',
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
      );

      const records: ShipRecord[] = [];
      const lines = output.trim().split('\n').filter(Boolean);
      /* eslint-enable sonarjs/no-os-command-from-path, sonarjs/os-command */
      const featureIdRegex = /\(?(HODGE-\d+(?:\.\d+)?)\)?/;

      for (const line of lines) {
        const [, timestamp, subject] = line.split('|');

        // Extract feature ID from commit message (e.g., "feat(harden): ... (HODGE-123)")
        const featureMatch = featureIdRegex.exec(subject);
        if (featureMatch) {
          records.push({
            feature: featureMatch[1],
            timestamp: new Date(timestamp).toISOString(),
          });
        }
      }

      return records;
    } catch {
      // Git not available or command failed - suppress error logging
      return [];
    }
  }

  /**
   * Merge ship records and git history by feature ID (union, deduplicate)
   */
  private mergeByFeatureId(shipRecords: ShipRecord[], gitShips: ShipRecord[]): ShipRecord[] {
    const merged = new Map<string, ShipRecord>();

    // Add ship records (primary source, more detailed)
    for (const record of shipRecords) {
      merged.set(record.feature, record);
    }

    // Add git ships if not already present
    for (const record of gitShips) {
      if (!merged.has(record.feature)) {
        merged.set(record.feature, record);
      }
    }

    // Sort by timestamp (most recent first)
    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Count ships since N days ago
   */
  private countSince(ships: ShipRecord[], days: number, now: Date): number {
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return ships.filter((ship) => new Date(ship.timestamp) >= cutoff).length;
  }

  /**
   * Calculate consecutive weeks with at least one ship
   */
  private calculateConsecutiveWeeks(ships: ShipRecord[], now: Date): number {
    if (ships.length === 0) return 0;

    let streak = 0;
    let currentWeekStart = this.getWeekStart(now);

    // Check each week going backward
    // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
    while (true) {
      const weekEnd = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Check if any ships in this week
      const hasShipThisWeek = ships.some((ship) => {
        const shipDate = new Date(ship.timestamp);
        return shipDate >= currentWeekStart && shipDate < weekEnd;
      });

      if (!hasShipThisWeek) {
        break;
      }

      streak++;
      // Move to previous week
      currentWeekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Safety limit: don't check more than 52 weeks back
      if (streak >= 52) break;
    }

    return streak;
  }

  /**
   * Get start of week (Monday 00:00:00) for a given date
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Calculate test coverage trend from last 5 ship records
   */
  private calculateCoverageTrend(shipRecords: ShipRecord[]): {
    trend: number | null;
    average: number;
  } {
    // Filter records with coverage data (we'd need to extract from shipChecks)
    // For MVP, return null (insufficient data) - this can be enhanced later
    // when we store coverage percentage in ship-record.json

    if (shipRecords.length < 5) {
      return { trend: null, average: 0 };
    }

    // Placeholder: return mock trend for now
    // TODO: Extract actual coverage from ship records
    return { trend: null, average: 0 };
  }
}

interface StatsData {
  shipsThisWeek: number;
  shipsThisMonth: number;
  totalShipped: number;
  streak: number;
  coverageTrend: number | null;
  averageCoverage: number;
  dataSource: 'ship-records' | 'git-only' | 'hybrid';
}
