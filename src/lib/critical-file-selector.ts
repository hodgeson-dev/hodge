import { ImportAnalyzer } from './import-analyzer.js';
import { SeverityExtractor, SeverityLevel } from './severity-extractor.js';
import { GitDiffResult } from './git-diff-analyzer.js';
import { RawToolResult } from '../types/toolchain.js';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('critical-file-selector');

/**
 * Scored file with risk analysis
 */
export interface FileScore {
  /** File path relative to repository root */
  path: string;

  /** Risk score (higher = more critical) */
  score: number;

  /** Human-readable risk factors */
  riskFactors: string[];

  /** Total lines changed */
  linesChanged: number;

  /** Number of files that import this file */
  importFanIn: number;

  /** Severity counts from tool diagnostics */
  severityCounts: Map<SeverityLevel, number>;
}

/**
 * Complete critical files analysis report
 */
export interface CriticalFilesReport {
  /** Top N files selected for deep review */
  topFiles: FileScore[];

  /** All changed files with scores */
  allFiles: FileScore[];

  /** Critical paths inferred from import fan-in */
  inferredCriticalPaths: string[];

  /** Critical paths configured by user */
  configuredCriticalPaths: string[];

  /** Algorithm version for tracking */
  algorithm: string;
}

/**
 * Configuration for critical file selection
 */
export interface CriticalFileConfig {
  /** Maximum files to select for deep review */
  maxFiles?: number;

  /** User-configured critical paths (glob patterns) */
  criticalPaths?: string[];
}

/**
 * Selects critical files for AI review based on risk scoring.
 * Combines multiple risk factors: tool diagnostics, import fan-in, change size, critical paths.
 */
export class CriticalFileSelector {
  constructor(
    private importAnalyzer: ImportAnalyzer,
    private severityExtractor: SeverityExtractor
  ) {}

  /**
   * Select critical files for AI review based on risk scoring
   */
  selectCriticalFiles(
    changedFiles: GitDiffResult[],
    qualityCheckResults: RawToolResult[],
    config: CriticalFileConfig = {}
  ): CriticalFilesReport {
    const maxFiles = config.maxFiles || 10;

    logger.debug('Selecting critical files', {
      changedFilesCount: changedFiles.length,
      maxFiles,
    });

    // 1. Analyze import fan-in across project
    const fanInMap = this.importAnalyzer.analyzeFanIn(process.cwd());

    // 2. Identify inferred critical paths (high fan-in files)
    const inferredCriticalPaths = this.inferCriticalPaths(fanInMap);

    // 3. Score each changed file
    const scoredFiles: FileScore[] = changedFiles.map((file) => {
      return this.scoreFile(
        file,
        fanInMap,
        qualityCheckResults,
        config.criticalPaths || [],
        inferredCriticalPaths
      );
    });

    // 4. Sort by score (highest first) and cap at maxFiles
    const sorted = [...scoredFiles].sort((a, b) => b.score - a.score);
    const topFiles = sorted.slice(0, maxFiles);

    logger.info('Critical file selection complete', {
      totalFiles: changedFiles.length,
      topFiles: topFiles.length,
      inferredCriticalPaths: inferredCriticalPaths.length,
    });

    return {
      topFiles,
      allFiles: sorted,
      inferredCriticalPaths,
      configuredCriticalPaths: config.criticalPaths || [],
      algorithm: 'risk-weighted-v1.0',
    };
  }

  /**
   * Score a single file based on multiple risk factors
   */
  private scoreFile(
    file: GitDiffResult,
    fanInMap: Map<string, number>,
    qualityCheckResults: RawToolResult[],
    configuredPaths: string[],
    inferredPaths: string[]
  ): FileScore {
    let score = 0;
    const riskFactors: string[] = [];

    // Extract severity counts from quality check results
    const severityCounts = this.extractSeverityForFile(file.path, qualityCheckResults);
    const importFanIn = fanInMap.get(file.path) ?? 0;

    // Apply scoring factors
    score += this.scoreSeverityIssues(severityCounts, riskFactors);
    score += this.scoreImportFanIn(importFanIn, riskFactors);
    score += this.scoreLinesChanged(file.linesChanged, riskFactors);
    score += this.scoreNewFiles(file, riskFactors);
    score += this.scoreCriticalPaths(file.path, configuredPaths, riskFactors);
    this.addInferredPathRiskFactor(file.path, inferredPaths, riskFactors);
    score = this.adjustScoreForTestFiles(file.path, score, riskFactors);

    return {
      path: file.path,
      score: Math.round(score),
      riskFactors,
      linesChanged: file.linesChanged,
      importFanIn,
      severityCounts,
    };
  }

  /**
   * Score based on tool diagnostic severity
   */
  private scoreSeverityIssues(
    severityCounts: Map<SeverityLevel, number>,
    riskFactors: string[]
  ): number {
    let score = 0;
    const blockerCount = severityCounts.get('blocker') ?? 0;
    const criticalCount = severityCounts.get('critical') ?? 0;
    const warningCount = severityCounts.get('warning') ?? 0;

    if (blockerCount > 0) {
      score += blockerCount * 100;
      riskFactors.push(`${blockerCount} blocker issue${blockerCount > 1 ? 's' : ''}`);
    }
    if (criticalCount > 0) {
      score += criticalCount * 75;
      riskFactors.push(`${criticalCount} critical issue${criticalCount > 1 ? 's' : ''}`);
    }
    if (warningCount > 0) {
      score += warningCount * 25;
      riskFactors.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
    }
    return score;
  }

  /**
   * Score based on import fan-in (architectural impact)
   */
  private scoreImportFanIn(importFanIn: number, riskFactors: string[]): number {
    if (importFanIn > 20) {
      riskFactors.push(`high impact (${importFanIn} imports)`);
      return importFanIn * 2;
    }
    if (importFanIn > 5) {
      riskFactors.push(`medium impact (${importFanIn} imports)`);
      return importFanIn * 1;
    }
    return 0;
  }

  /**
   * Score based on lines changed
   */
  private scoreLinesChanged(linesChanged: number, riskFactors: string[]): number {
    if (linesChanged > 200) {
      riskFactors.push(`large change (${linesChanged} lines)`);
      return 50;
    }
    if (linesChanged > 100) {
      riskFactors.push(`medium change (${linesChanged} lines)`);
      return 25;
    }
    return linesChanged * 0.5;
  }

  /**
   * Score bonus for new files
   */
  private scoreNewFiles(file: GitDiffResult, riskFactors: string[]): number {
    if (file.linesDeleted === 0 && file.linesAdded > 0) {
      riskFactors.push('new file');
      return 50;
    }
    return 0;
  }

  /**
   * Score bonus for configured critical paths
   */
  private scoreCriticalPaths(
    filePath: string,
    configuredPaths: string[],
    riskFactors: string[]
  ): number {
    for (const criticalPath of configuredPaths) {
      if (this.matchesPath(filePath, criticalPath)) {
        riskFactors.push(`critical path: ${criticalPath}`);
        return 50;
      }
    }
    return 0;
  }

  /**
   * Add risk factor for inferred critical paths
   */
  private addInferredPathRiskFactor(
    filePath: string,
    inferredPaths: string[],
    riskFactors: string[]
  ): void {
    if (inferredPaths.includes(filePath)) {
      riskFactors.push('inferred critical (high fan-in)');
    }
  }

  /**
   * Adjust score downward for test files
   */
  private adjustScoreForTestFiles(filePath: string, score: number, riskFactors: string[]): number {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      riskFactors.push('test file (lower priority)');
      return Math.max(0, score - 50);
    }
    return score;
  }

  /**
   * Identify files with high import fan-in as critical infrastructure
   */
  private inferCriticalPaths(fanInMap: Map<string, number>): string[] {
    // Files with >20 imports are considered critical infrastructure
    const threshold = 20;
    return Array.from(fanInMap.entries())
      .filter(([, count]) => count > threshold)
      .map(([path]) => path)
      .sort((a, b) => (fanInMap.get(b) || 0) - (fanInMap.get(a) || 0));
  }

  /**
   * Extract severity counts for a specific file from tool results
   */
  private extractSeverityForFile(
    filePath: string,
    results: RawToolResult[]
  ): Map<SeverityLevel, number> {
    const counts = new Map<SeverityLevel, number>([
      ['blocker', 0],
      ['critical', 0],
      ['warning', 0],
      ['info', 0],
    ]);

    for (const result of results) {
      if (result.skipped) continue;

      // Check if tool output mentions this file
      const output = (result.stdout || '') + (result.stderr || '');
      if (!output.includes(filePath)) continue;

      // Extract severity from lines mentioning this file
      const lines = output.split('\n').filter((line) => line.includes(filePath));
      const fileOutput = lines.join('\n');

      const severities = this.severityExtractor.extractSeverity(fileOutput);

      for (const [level, count] of severities.entries()) {
        counts.set(level, counts.get(level)! + count);
      }
    }

    return counts;
  }

  /**
   * Check if file path matches a glob pattern
   */
  private matchesPath(filePath: string, pattern: string): boolean {
    // Support glob patterns: src/payments/, src/lib/*-service.ts
    const globPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(globPattern);
    return regex.test(filePath);
  }
}
