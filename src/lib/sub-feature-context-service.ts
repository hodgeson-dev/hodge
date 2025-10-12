/**
 * Sub-Feature Context Service
 *
 * Detects sub-feature patterns (e.g., HODGE-333.1 is child of HODGE-333)
 * and loads context from parent feature and shipped sibling features.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Ship record from feature-root/ship-record.json
 * Tracks entire feature lifecycle (build, harden, ship phases)
 * HODGE-341.2: Moved to feature root and added commit tracking for toolchain file scoping
 */
export interface ShipRecord {
  feature: string;
  timestamp: string;
  validationPassed: boolean;
  commitMessage: string;
  shipChecks: {
    tests: boolean;
    coverage: boolean;
    docs: boolean;
    changelog: boolean;
  };
  // Commit tracking for toolchain file scoping (HODGE-341.2)
  buildStartCommit?: string;  // First commit when build started
  hardenStartCommit?: string; // First commit when harden started
  shipCommit?: string;         // Commit SHA when shipped
}

/**
 * Parent feature context
 */
export interface ParentContext {
  feature: string;
  problemStatement?: string;
  recommendation?: string;
  decisions: string[];
}

/**
 * Shipped sibling feature context
 */
export interface ShippedSibling {
  feature: string;
  shipRecord: ShipRecord;
  decisions: string[];
  infrastructure: string[];
  lessonsLearned?: string;
}

/**
 * Complete sub-feature context
 */
export interface SubFeatureContext {
  isSubFeature: boolean;
  parent?: ParentContext;
  shippedSiblings: ShippedSibling[];
}

/**
 * File manifest entry with metadata
 */
export interface FileManifestEntry {
  path: string;
  type: 'exploration' | 'decisions' | 'ship-record' | 'lessons';
  feature: string;
  precedence: number; // Lower = read first
  timestamp?: string; // For ship records
}

/**
 * File manifest for sub-feature context
 */
export interface FileManifest {
  parent?: {
    feature: string;
    files: FileManifestEntry[];
  };
  siblings: Array<{
    feature: string;
    shippedAt: string;
    files: FileManifestEntry[];
  }>;
  suggestedReadingOrder: string;
}

/**
 * Service for loading sub-feature context
 */
export class SubFeatureContextService {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Detect if a feature is a sub-feature and identify its parent
   *
   * Current pattern: HODGE-333.1 → parent is HODGE-333
   * Constraints: Only numeric sub-features, one level deep
   */
  detectSubFeature(feature: string): { isSubFeature: boolean; parent?: string } {
    // Pattern: HODGE-NNN.N (numeric sub-feature)
    const subFeaturePattern = /^(HODGE-\d+)\.(\d+)$/;
    const match = feature.match(subFeaturePattern);

    if (match) {
      return {
        isSubFeature: true,
        parent: match[1], // e.g., HODGE-333
      };
    }

    return { isSubFeature: false };
  }

  /**
   * Find all shipped siblings for a given parent feature
   *
   * @param parent Parent feature ID (e.g., HODGE-333)
   * @param exclude List of sibling IDs to exclude (e.g., ['333.1', '333.2'])
   * @returns Array of shipped siblings
   */
  findShippedSiblings(parent: string, exclude: string[] = []): ShippedSibling[] {
    const featuresDir = join(this.basePath, '.hodge', 'features');

    if (!existsSync(featuresDir)) {
      return [];
    }

    const allFeatures = readdirSync(featuresDir);
    const siblings: ShippedSibling[] = [];

    // Pattern to match siblings: HODGE-333.1, HODGE-333.2, etc.
    const siblingPattern = new RegExp(`^${parent}\\.(\\d+)$`);

    for (const featureDir of allFeatures) {
      const match = featureDir.match(siblingPattern);
      if (!match) continue;

      // Check if excluded
      const siblingNumber = match[1];
      const shortId = `${parent.split('-')[1]}.${siblingNumber}`; // e.g., "333.1"
      if (exclude.includes(shortId) || exclude.includes(featureDir)) {
        continue;
      }

      // Check if shipped (has valid ship record)
      const shipRecord = this.loadShipRecord(featureDir);
      if (!shipRecord || !shipRecord.validationPassed) {
        continue;
      }

      // Load sibling context
      const sibling: ShippedSibling = {
        feature: featureDir,
        shipRecord,
        decisions: this.loadSiblingDecisions(featureDir),
        infrastructure: this.extractInfrastructure(shipRecord),
        lessonsLearned: this.loadLessonsLearned(featureDir),
      };

      siblings.push(sibling);
    }

    return siblings.sort((a, b) => a.feature.localeCompare(b.feature));
  }

  /**
   * Load parent feature context (exploration + decisions)
   */
  loadParentContext(parent: string): ParentContext | null {
    const parentDir = join(this.basePath, '.hodge', 'features', parent);

    if (!existsSync(parentDir)) {
      return null;
    }

    const explorationPath = join(parentDir, 'explore', 'exploration.md');
    const decisionsPath = join(parentDir, 'decisions.md');

    const context: ParentContext = {
      feature: parent,
      decisions: [],
    };

    // Extract from exploration.md
    if (existsSync(explorationPath)) {
      const exploration = readFileSync(explorationPath, 'utf-8');

      // Extract Problem Statement
      const problemMatch = exploration.match(/## Problem Statement\s+([\s\S]*?)(?=\n## |\n---|$)/);
      if (problemMatch) {
        context.problemStatement = problemMatch[1].trim();
      }

      // Extract Recommendation
      const recommendationMatch = exploration.match(
        /## Recommendation\s*\n+([\s\S]*?)(?=\n## |\n---|\n\*|$)/
      );
      if (recommendationMatch) {
        context.recommendation = recommendationMatch[1].trim();
      }

      // Extract decisions from exploration
      const decisionsMatch = exploration.match(
        /## Decisions Decided During Exploration\s+([\s\S]*?)(?=\n## |\n---|$)/
      );
      if (decisionsMatch) {
        const decisionsText = decisionsMatch[1];
        const decisionLines = decisionsText.match(/^\d+\.\s*✓\s*\*\*(.+?)\*\*/gm);
        if (decisionLines) {
          context.decisions.push(...decisionLines.map((line) => line.trim()));
        }
      }
    }

    // Load from decisions.md if exists
    if (existsSync(decisionsPath)) {
      const decisionsContent = readFileSync(decisionsPath, 'utf-8');
      // Extract decision summaries (simplified)
      const decisionMatches = decisionsContent.match(/^### .+$/gm);
      if (decisionMatches) {
        context.decisions.push(...decisionMatches.map((d) => d.replace('### ', '').trim()));
      }
    }

    return context;
  }

  /**
   * Build file manifest for AI to read
   * CLI identifies files, AI reads and synthesizes
   */
  buildFileManifest(parent: string, exclude: string[] = []): FileManifest | null {
    const parentContext = this.identifyParentFiles(parent);
    const siblings = this.identifyShippedSiblings(parent, exclude);

    if (!parentContext && siblings.length === 0) {
      return null;
    }

    return {
      parent: parentContext || undefined,
      siblings,
      suggestedReadingOrder:
        'parent exploration → parent decisions → sibling ship records → sibling lessons',
    };
  }

  /**
   * Identify parent files (doesn't read, just checks existence)
   */
  private identifyParentFiles(parent: string): {
    feature: string;
    files: FileManifestEntry[];
  } | null {
    const parentDir = join(this.basePath, '.hodge', 'features', parent);

    if (!existsSync(parentDir)) {
      return null;
    }

    const files: FileManifestEntry[] = [];

    // Check for exploration
    const explorationPath = join(parentDir, 'explore', 'exploration.md');
    if (existsSync(explorationPath)) {
      files.push({
        path: explorationPath,
        type: 'exploration',
        feature: parent,
        precedence: 1,
      });
    }

    // Check for decisions
    const decisionsPath = join(parentDir, 'decisions.md');
    if (existsSync(decisionsPath)) {
      files.push({
        path: decisionsPath,
        type: 'decisions',
        feature: parent,
        precedence: 2,
      });
    }

    return files.length > 0 ? { feature: parent, files } : null;
  }

  /**
   * Identify shipped sibling files (doesn't read, just checks)
   */
  private identifyShippedSiblings(
    parent: string,
    exclude: string[] = []
  ): Array<{
    feature: string;
    shippedAt: string;
    files: FileManifestEntry[];
  }> {
    const featuresDir = join(this.basePath, '.hodge', 'features');

    if (!existsSync(featuresDir)) {
      return [];
    }

    const allFeatures = readdirSync(featuresDir);
    const siblings: Array<{
      feature: string;
      shippedAt: string;
      files: FileManifestEntry[];
    }> = [];

    const siblingPattern = new RegExp(`^${parent}\\.(\\d+)$`);

    for (const featureDir of allFeatures) {
      const match = featureDir.match(siblingPattern);
      if (!match) continue;

      // Check exclusion
      const siblingNumber = match[1];
      const shortId = `${parent.split('-')[1]}.${siblingNumber}`;
      if (exclude.includes(shortId) || exclude.includes(featureDir)) {
        continue;
      }

      // Check ship record
      const shipRecord = this.loadShipRecord(featureDir);
      if (!shipRecord || !shipRecord.validationPassed) {
        continue;
      }

      const files: FileManifestEntry[] = [];

      // Ship record (precedence 3)
      // HODGE-341.2: ship-record.json moved to feature root
      const shipRecordPath = join(
        this.basePath,
        '.hodge',
        'features',
        featureDir,
        'ship-record.json'
      );
      files.push({
        path: shipRecordPath,
        type: 'ship-record',
        feature: featureDir,
        precedence: 3,
        timestamp: shipRecord.timestamp,
      });

      // Lessons learned (precedence 4)
      const lessonsDir = join(this.basePath, '.hodge', 'lessons');
      if (existsSync(lessonsDir)) {
        const lessonFiles = readdirSync(lessonsDir);
        const lessonFile = lessonFiles.find((file) => file.startsWith(featureDir));
        if (lessonFile) {
          files.push({
            path: join(lessonsDir, lessonFile),
            type: 'lessons',
            feature: featureDir,
            precedence: 4,
          });
        }
      }

      siblings.push({
        feature: featureDir,
        shippedAt: shipRecord.timestamp,
        files,
      });
    }

    return siblings.sort((a, b) => a.feature.localeCompare(b.feature));
  }

  /**
   * Build context summary for display to user
   */
  buildContextSummary(context: SubFeatureContext): string {
    const lines: string[] = [];

    if (context.parent) {
      lines.push(`📚 Loaded context from ${context.parent.feature} (parent)`);
      if (context.shippedSiblings.length > 0) {
        const siblingIds = context.shippedSiblings.map((s) => s.feature).join(', ');
        lines.push(`   + ${context.shippedSiblings.length} shipped siblings (${siblingIds})`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Load ship record for a feature
   * HODGE-341.2: ship-record.json moved to feature root
   */
  private loadShipRecord(feature: string): ShipRecord | null {
    const shipRecordPath = join(
      this.basePath,
      '.hodge',
      'features',
      feature,
      'ship-record.json'
    );

    if (!existsSync(shipRecordPath)) {
      return null;
    }

    try {
      const content = readFileSync(shipRecordPath, 'utf-8');
      return JSON.parse(content) as ShipRecord;
    } catch {
      return null;
    }
  }

  /**
   * Load decisions from sibling feature
   */
  private loadSiblingDecisions(feature: string): string[] {
    const decisions: string[] = [];
    const featureDir = join(this.basePath, '.hodge', 'features', feature);

    // Check decisions.md
    const decisionsPath = join(featureDir, 'decisions.md');
    if (existsSync(decisionsPath)) {
      const content = readFileSync(decisionsPath, 'utf-8');
      const decisionMatches = content.match(/^### .+$/gm);
      if (decisionMatches) {
        decisions.push(...decisionMatches.map((d) => d.replace('### ', '').trim()));
      }
    }

    // Check exploration decisions
    const explorationPath = join(featureDir, 'explore', 'exploration.md');
    if (existsSync(explorationPath)) {
      const exploration = readFileSync(explorationPath, 'utf-8');
      const decisionsMatch = exploration.match(
        /## Decisions Decided During Exploration\s+([\s\S]*?)(?=\n## |\n---|$)/
      );
      if (decisionsMatch) {
        const decisionsText = decisionsMatch[1];
        const decisionLines = decisionsText.match(/^\d+\.\s*✓\s*\*\*(.+?)\*\*/gm);
        if (decisionLines) {
          decisions.push(...decisionLines.map((line) => line.trim()));
        }
      }
    }

    return decisions;
  }

  /**
   * Extract infrastructure files created from ship record commit message
   */
  private extractInfrastructure(shipRecord: ShipRecord): string[] {
    const infrastructure: string[] = [];
    const commitMessage = shipRecord.commitMessage;

    // Look for file paths in commit message
    // Pattern: src/lib/something.ts or similar
    const fileMatches = commitMessage.match(/[a-z]+\/[a-z-]+\/[a-z-]+\.ts/gi);
    if (fileMatches) {
      infrastructure.push(...fileMatches);
    }

    // Look for explicit "New Infrastructure" or "Files created" sections
    const infraMatch = commitMessage.match(
      /\*\*New Infrastructure\*\*[\s\S]*?:\s*(.+?)(?:\n-|\n\*\*)/gim
    );
    if (infraMatch) {
      for (const match of infraMatch) {
        const files = match.match(/[a-z]+\/[a-z-]+\/[a-z-]+\.ts/gi);
        if (files) infrastructure.push(...files);
      }
    }

    return [...new Set(infrastructure)]; // Remove duplicates
  }

  /**
   * Load lessons learned for a sibling feature
   */
  private loadLessonsLearned(feature: string): string | undefined {
    const lessonsDir = join(this.basePath, '.hodge', 'lessons');

    if (!existsSync(lessonsDir)) {
      return undefined;
    }

    // Look for lesson file matching feature pattern
    const lessonFiles = readdirSync(lessonsDir);
    const lessonFile = lessonFiles.find((file) => file.startsWith(feature));

    if (lessonFile) {
      const lessonPath = join(lessonsDir, lessonFile);
      try {
        return readFileSync(lessonPath, 'utf-8');
      } catch {
        return undefined;
      }
    }

    return undefined;
  }
}
