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
  buildStartCommit?: string; // First commit when build started
  hardenStartCommit?: string; // First commit when harden started
  shipCommit?: string; // Commit SHA when shipped
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
    const match = subFeaturePattern.exec(feature);

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
      const match = siblingPattern.exec(featureDir);
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

    const context: ParentContext = {
      feature: parent,
      decisions: [],
    };

    this.loadExplorationContext(parentDir, context);
    this.loadDecisionsContext(parentDir, context);

    return context;
  }

  /**
   * Load context from exploration.md
   */
  private loadExplorationContext(parentDir: string, context: ParentContext): void {
    const explorationPath = join(parentDir, 'explore', 'exploration.md');

    if (!existsSync(explorationPath)) {
      return;
    }

    const exploration = readFileSync(explorationPath, 'utf-8');

    // Extract sections
    context.problemStatement = this.extractSection(exploration, '## Problem Statement', 20);
    context.recommendation = this.extractSection(exploration, '## Recommendation', 17);

    // Extract decisions from exploration
    const decisionsText = this.extractSection(
      exploration,
      '## Decisions Decided During Exploration',
      39
    );
    if (decisionsText) {
      this.extractDecisionsFromText(decisionsText, context.decisions);
    }
  }

  /**
   * Load context from decisions.md
   */
  private loadDecisionsContext(parentDir: string, context: ParentContext): void {
    const decisionsPath = join(parentDir, 'decisions.md');

    if (!existsSync(decisionsPath)) {
      return;
    }

    const decisionsContent = readFileSync(decisionsPath, 'utf-8');
    const lines = decisionsContent.split('\n');

    for (const line of lines) {
      if (line.startsWith('### ')) {
        context.decisions.push(line.replace('### ', '').trim());
      }
    }
  }

  /**
   * Extract a section from markdown content
   */
  private extractSection(
    content: string,
    sectionHeader: string,
    headerLength: number
  ): string | undefined {
    const sectionIdx = content.indexOf(sectionHeader);
    if (sectionIdx === -1) {
      return undefined;
    }

    const afterSection = content.slice(sectionIdx + headerLength);
    const nextSectionIdx = this.findNextSection(afterSection);
    return afterSection.slice(0, nextSectionIdx).trim();
  }

  /**
   * Extract numbered decisions from text
   */
  private extractDecisionsFromText(text: string, decisions: string[]): void {
    const lines = text.split('\n');
    const decisionPattern = /^\d+\.\s*✓\s*\*\*(.+?)\*\*/;

    for (const line of lines) {
      const match = decisionPattern.exec(line);
      if (match) {
        decisions.push(line.trim());
      }
    }
  }

  /**
   * Find the next markdown section (## header or --- separator)
   * Returns index of next section or end of string
   */
  private findNextSection(text: string): number {
    const lines = text.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('## ') || line.startsWith('---')) {
        // Calculate character position
        return lines.slice(0, i).join('\n').length;
      }
    }
    return text.length;
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
      parent: parentContext ?? undefined,
      siblings,
      suggestedReadingOrder:
        'parent exploration → parent decisions → sibling exploration → sibling decisions → sibling ship records → sibling lessons',
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
    const siblingPattern = new RegExp(`^${parent}\\.(\\d+)$`);
    const siblings: Array<{
      feature: string;
      shippedAt: string;
      files: FileManifestEntry[];
    }> = [];

    for (const featureDir of allFeatures) {
      const sibling = this.processSiblingFeature(featureDir, siblingPattern, parent, exclude);
      if (sibling) {
        siblings.push(sibling);
      }
    }

    return siblings.sort((a, b) => a.feature.localeCompare(b.feature));
  }

  /**
   * Process a potential sibling feature and return its files if valid
   */
  private processSiblingFeature(
    featureDir: string,
    siblingPattern: RegExp,
    parent: string,
    exclude: string[]
  ): { feature: string; shippedAt: string; files: FileManifestEntry[] } | null {
    const match = siblingPattern.exec(featureDir);
    if (!match) return null;

    // Check exclusion
    const siblingNumber = match[1];
    const shortId = `${parent.split('-')[1]}.${siblingNumber}`;
    if (exclude.includes(shortId) || exclude.includes(featureDir)) {
      return null;
    }

    // Check ship record
    const shipRecord = this.loadShipRecord(featureDir);
    if (!shipRecord || !shipRecord.validationPassed) {
      return null;
    }

    const files = this.collectSiblingFiles(featureDir, shipRecord);

    return {
      feature: featureDir,
      shippedAt: shipRecord.timestamp,
      files,
    };
  }

  /**
   * Collect all relevant files for a sibling feature
   */
  private collectSiblingFiles(featureDir: string, shipRecord: ShipRecord): FileManifestEntry[] {
    const files: FileManifestEntry[] = [];

    // Sibling exploration (precedence 3)
    this.addFileIfExists(
      files,
      join(this.basePath, '.hodge', 'features', featureDir, 'explore', 'exploration.md'),
      'exploration',
      featureDir,
      3
    );

    // Sibling decisions (precedence 4)
    this.addFileIfExists(
      files,
      join(this.basePath, '.hodge', 'features', featureDir, 'decisions.md'),
      'decisions',
      featureDir,
      4
    );

    // Ship record (precedence 5) - always include
    files.push({
      path: join(this.basePath, '.hodge', 'features', featureDir, 'ship-record.json'),
      type: 'ship-record',
      feature: featureDir,
      precedence: 5,
      timestamp: shipRecord.timestamp,
    });

    // Lessons learned (precedence 6)
    this.addLessonsFileIfExists(files, featureDir);

    return files;
  }

  /**
   * Add a file to the manifest if it exists
   */
  private addFileIfExists(
    files: FileManifestEntry[],
    path: string,
    type: 'exploration' | 'decisions' | 'ship-record' | 'lessons',
    feature: string,
    precedence: number
  ): void {
    if (existsSync(path)) {
      files.push({ path, type, feature, precedence });
    }
  }

  /**
   * Add lessons file to manifest if it exists
   */
  private addLessonsFileIfExists(files: FileManifestEntry[], featureDir: string): void {
    const lessonsDir = join(this.basePath, '.hodge', 'lessons');

    if (!existsSync(lessonsDir)) {
      return;
    }

    const lessonFiles = readdirSync(lessonsDir);
    const lessonFile = lessonFiles.find((file) => file.startsWith(featureDir));

    if (lessonFile) {
      files.push({
        path: join(lessonsDir, lessonFile),
        type: 'lessons',
        feature: featureDir,
        precedence: 6,
      });
    }
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
    const shipRecordPath = join(this.basePath, '.hodge', 'features', feature, 'ship-record.json');

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

    this.loadDecisionsFromFile(featureDir, decisions);
    this.loadDecisionsFromExploration(featureDir, decisions);

    return decisions;
  }

  /**
   * Load decisions from decisions.md file
   */
  private loadDecisionsFromFile(featureDir: string, decisions: string[]): void {
    const decisionsPath = join(featureDir, 'decisions.md');
    if (!existsSync(decisionsPath)) {
      return;
    }

    const content = readFileSync(decisionsPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('### ')) {
        decisions.push(line.replace('### ', '').trim());
      }
    }
  }

  /**
   * Load decisions from exploration.md file
   */
  private loadDecisionsFromExploration(featureDir: string, decisions: string[]): void {
    const explorationPath = join(featureDir, 'explore', 'exploration.md');
    if (!existsSync(explorationPath)) {
      return;
    }

    const exploration = readFileSync(explorationPath, 'utf-8');
    const decisionsIdx = exploration.indexOf('## Decisions Decided During Exploration');
    if (decisionsIdx === -1) {
      return;
    }

    const afterDecisions = exploration.slice(decisionsIdx + 39);
    const nextSectionIdx = this.findNextSection(afterDecisions);
    const decisionsText = afterDecisions.slice(0, nextSectionIdx);

    this.extractDecisionLines(decisionsText, decisions);
  }

  /**
   * Extract decision lines from text
   */
  private extractDecisionLines(text: string, decisions: string[]): void {
    const lines = text.split('\n');
    // Fixed regex: simplified pattern to avoid backtracking
    const decisionPattern = /^\d+\.\s*✓\s*\*\*[^*]+\*\*/;

    for (const line of lines) {
      if (decisionPattern.test(line)) {
        decisions.push(line.trim());
      }
    }
  }

  /**
   * Extract infrastructure files created from ship record commit message
   */
  private extractInfrastructure(shipRecord: ShipRecord): string[] {
    const commitMessage = shipRecord.commitMessage;
    // Fixed regex: simple pattern with word boundaries to prevent backtracking
    // Pattern matches: word/word-word/word.ts (e.g., src/lib/service-name.ts)
    // Hyphen at end of character class doesn't need escaping
    const filePattern = /\b[a-z]+\/[a-z-]+\/[a-z-]+\.ts\b/gi;
    const infrastructureSet = new Set<string>();

    // Split message into lines to limit regex scope and prevent ReDoS
    const lines = commitMessage.split('\n');
    for (const line of lines) {
      const matches = line.match(filePattern);
      if (matches) {
        matches.forEach((match) => infrastructureSet.add(match));
      }
    }

    return Array.from(infrastructureSet);
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
