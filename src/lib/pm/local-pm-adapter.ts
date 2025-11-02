import { promises as fs } from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { BasePMAdapter } from './base-adapter.js';
import { PMIssue, PMState, StateType } from './types.js';
import { createCommandLogger } from '../logger.js';

/**
 * Feature status type for local PM tracking
 */
type FeatureStatus = 'exploring' | 'building' | 'hardening' | 'shipped';
// Reserved for future use when we implement full project plan parsing
// interface ProjectPlan {
//   phases: Phase[];
//   dependencies: string;
// }

// interface Phase {
//   name: string;
//   duration: string;
//   status: string;
//   items: PhaseItem[];
// }

// interface PhaseItem {
//   id: string;
//   name: string;
//   completed: boolean;
//   inProgress?: boolean;
// }

/**
 * Local PM adapter for managing project_management.md
 * Maintains project plan, dependencies, and feature tracking
 *
 * Extends BasePMAdapter to provide unified interface while preserving
 * special always-on behavior and local file management.
 */
export class LocalPMAdapter extends BasePMAdapter {
  protected logger = createCommandLogger('local-p-m-adapter', { enableConsole: false });
  private pmPath: string;
  private operationQueue: Promise<void> = Promise.resolve();
  private basePath: string;

  constructor(basePath?: string) {
    // Special configuration for local adapter
    super({
      config: {
        tool: 'local',
        baseUrl: basePath || '.',
      },
    });
    this.basePath = basePath || '.';
    this.pmPath = path.join(this.basePath, '.hodge', 'project_management.md');
  }

  /**
   * Serialize file operations to prevent race conditions
   */
  private async serializeOperation<T>(operation: () => Promise<T>): Promise<T> {
    const previousOperation = this.operationQueue;
    let currentOperation: Promise<T>;

    this.operationQueue = this.operationQueue
      .then(async () => {
        currentOperation = operation();
        try {
          await currentOperation;
        } catch {
          // Allow the operation to complete even if it throws
        }
      })
      .catch(() => {
        // Ignore errors to prevent queue from breaking
      });

    await previousOperation.catch(() => {
      // Ignore errors from previous operations
    });

    return currentOperation!;
  }

  /**
   * Initialize project_management.md with default structure
   */
  async init(): Promise<void> {
    try {
      await fs.access(this.pmPath);
    } catch {
      const template = this.getTemplate();
      await fs.mkdir(path.dirname(this.pmPath), { recursive: true });
      await fs.writeFile(this.pmPath, template, 'utf-8');
      this.logger.info(chalk.blue('ℹ️  Created project_management.md with project plan'));
    }
  }

  /**
   * Update feature status in the project plan
   */
  async updateFeatureStatus(feature: string, status: FeatureStatus): Promise<void> {
    return this.serializeOperation(async () => {
      // Ensure file exists first
      await this.init();

      const content = await fs.readFile(this.pmPath, 'utf-8');
      let updated = content;

      // Update in project plan phases
      if (status === 'shipped') {
        // Mark as complete in phases
        const phasePattern = new RegExp(`(\\[ \\])\\s+(${feature}(?::|\\s))`, 'g');
        updated = updated.replace(phasePattern, '[x] $2');

        // Clear any in-progress markers
        const inProgressPattern = new RegExp(`(\\[~\\])\\s+(${feature}(?::|\\s))`, 'g');
        updated = updated.replace(inProgressPattern, '[x] $2');
      } else if (status === 'building' || status === 'hardening') {
        // Mark as in progress in phases
        const phasePattern = new RegExp(`(\\[ \\])\\s+(${feature}(?::|\\s))`, 'g');
        updated = updated.replace(phasePattern, '[~] $2');
      }

      // Update in Active Features section
      const statusMap = {
        exploring: 'exploring',
        building: 'building',
        hardening: 'hardening',
        shipped: 'shipped',
      };

      const featureRegex = new RegExp(`(### ${feature}.*?\\n- \\*\\*Status\\*\\*:) [^\\n]+`, 's');
      if (featureRegex.test(updated)) {
        updated = updated.replace(featureRegex, `$1 ${statusMap[status]}`);
      }

      // Move to completed if shipped
      if (status === 'shipped') {
        updated = this.moveToCompleted(updated, feature);
      }

      await fs.writeFile(this.pmPath, updated, 'utf-8');
      this.logger.info(chalk.green(`✓ Updated ${feature} status to: ${status}`));
    });
  }

  /**
   * Add a new feature to tracking
   */
  async addFeature(feature: string, description: string, phase?: string): Promise<void> {
    return this.serializeOperation(async () => {
      // Ensure file exists first
      await this.init();

      // Read fresh content each time to handle concurrent updates
      const content = await fs.readFile(this.pmPath, 'utf-8');

      // Check if already exists
      if (content.includes(`### ${feature}`)) {
        this.logger.warn(chalk.yellow(`⚠️  Feature ${feature} already exists`));
        return;
      }

      const date = new Date().toISOString().split('T')[0];
      const fullDescription = phase && phase !== 'TBD' ? `${description} (${phase})` : description;
      const entry = `
### ${feature}
- **Status**: exploring
- **Priority**: TBD
- **Created**: ${date}
- **Updated**: ${date}
- **Description**: ${fullDescription}
- **Phase**: ${phase || 'TBD'}
- **Next Steps**:
  - Complete exploration
  - Define test intentions
  - Make architectural decisions
`;

      // Find the Active Features section and append to it
      const activeFeaturesIndex = content.indexOf('## Active Features\n');
      if (activeFeaturesIndex === -1) {
        throw new Error('Active Features section not found in project_management.md');
      }

      // Find the next section after Active Features
      const afterActiveFeatures = content.substring(
        activeFeaturesIndex + '## Active Features\n'.length
      );
      const nextSectionRegex = /^## /m;
      const nextSectionMatch = nextSectionRegex.exec(afterActiveFeatures);
      const nextSectionIndex = nextSectionMatch
        ? activeFeaturesIndex + '## Active Features\n'.length + nextSectionMatch.index
        : content.length;

      // Insert the new feature entry before the next section
      const updated =
        content.substring(0, nextSectionIndex) + entry + '\n' + content.substring(nextSectionIndex);

      await fs.writeFile(this.pmPath, updated, 'utf-8');
      this.logger.info(chalk.green(`✓ Added ${feature} to project management tracking`));
    });
  }

  /**
   * Move feature to completed section
   */
  private moveToCompleted(content: string, feature: string): string {
    // Extract feature entry
    const featureRegex = new RegExp(`(### ${feature}[\\s\\S]*?)\\n##`, 'm');
    const match = featureRegex.exec(content);

    if (!match) {
      // Try fallback pattern for end of file
      const endPattern = new RegExp(`(### ${feature}[\\s\\S]*)$`, 'm');
      const endMatch = endPattern.exec(content);
      if (endMatch) {
        return this.moveToCompletedWithMatch(content, feature, endMatch[1].trim());
      }
      return content;
    }

    return this.moveToCompletedWithMatch(content, feature, match[1].trim());
  }

  private moveToCompletedWithMatch(content: string, feature: string, featureEntry: string): string {
    // Remove from Active Features
    const featureRegex = new RegExp(`### ${feature}[\\s\\S]*?(?=\\n##|$)`, 'm');
    let updated = content.replace(featureRegex, '');

    // Update status and add completion date
    const date = new Date().toISOString().split('T')[0];
    const completedEntry =
      featureEntry
        .replace(/- \*\*Status\*\*: .*/, `- **Status**: shipped`)
        .replace(/- \*\*Updated\*\*: .*/, `- **Updated**: ${date}`) +
      '\n- **Completed**: ' +
      date +
      '\n\n';

    // Add to Completed Features
    const completedRegex = /## Completed Features\n/;
    if (completedRegex.test(updated)) {
      updated = updated.replace(completedRegex, `## Completed Features\n\n${completedEntry}\n`);
    } else {
      // Create Completed Features section if it doesn't exist
      const backlogIndex = updated.indexOf('## Backlog');
      if (backlogIndex > -1) {
        updated =
          updated.substring(0, backlogIndex) +
          `## Completed Features\n\n${completedEntry}\n\n` +
          updated.substring(backlogIndex);
      }
    }

    return updated;
  }

  /**
   * Update project plan phase progress
   */
  async updatePhaseProgress(): Promise<void> {
    const content = await fs.readFile(this.pmPath, 'utf-8');
    let updated = content;

    // Check each phase and update completion status
    const phases = [
      'Phase 1: Foundation',
      'Phase 2: AI Experience Enhancement',
      'Phase 3: Feature Organization',
      'Phase 4: PM Integration',
      'Phase 5: Enhanced Features',
    ];

    for (const phase of phases) {
      const phaseRegex = new RegExp(`(### ${phase}.*?)(?=###|##|$)`, 's');
      const phaseMatch = phaseRegex.exec(updated);

      if (phaseMatch) {
        const phaseContent = phaseMatch[1];
        const totalItems = (phaseContent.match(/\[[ x~]\]/g) ?? []).length;
        const completedItems = (phaseContent.match(/\[x\]/g) ?? []).length;

        if (totalItems > 0 && completedItems === totalItems) {
          // Mark phase as complete
          updated = updated.replace(new RegExp(`(### ${phase} \\([^)]+\\)).*`), `$1 ✅`);
        }
      }
    }

    if (content !== updated) {
      await fs.writeFile(this.pmPath, updated, 'utf-8');
      this.logger.info(chalk.green('✓ Updated project plan phase progress'));
    }
  }

  /**
   * Get the default template for project_management.md
   */
  private getTemplate(): string {
    return `# Project Management

## Overview
This file tracks all Hodge features and their implementation status.

## Implementation Phases

### Phase 1: Foundation (1-2 days) ✅
- [x] cross-tool-compatibility ✅
- [x] HODGE-004: ID Management ✅

### Phase 2: AI Experience Enhancement (3-4 days)
- [x] session-management ✅
- [x] HODGE-051: AI-Executable Slash Commands ✅
- [x] HODGE-052: Persistent Current Feature Context ✅
- [x] HODGE-054: Context-Aware Workflow Commands ✅
- [x] HODGE-053: Discovery Exploration Mode ✅

### Phase 3: Feature Organization (2-3 days)
- [x] HODGE-003: Feature Extraction ✅
- [x] HODGE-005: Feature Auto-Population ✅
- [ ] HODGE-006: Local PM Tracking

### Phase 4: PM Integration (2-3 days)
- [ ] pm-adapter-hooks
- [ ] HODGE-045: PM Auto-Update After Ship
- [ ] HODGE-007: PM Auto-Sync

### Phase 5: Enhanced Features (2-3 days)
- [ ] batch-decision-extraction

## Dependencies Graph

\`\`\`
cross-tool-compatibility
├── session-management
├── HODGE-051 (AI-Executable Commands)
└── batch-decision-extraction

HODGE-004 (ID Management)
├── HODGE-003 (Feature Extraction)
│   └── HODGE-005 (Feature Auto-Population)
├── HODGE-006 (Local PM Tracking)
└── pm-adapter-hooks
    └── HODGE-007 (PM Auto-Sync)
\`\`\`

## Active Features

## Completed Features

## Backlog

---
*Generated by Hodge*
`;
  }

  /**
   * Sync external PM tool status to local file
   */
  async syncFromExternal(updates: Array<{ feature: string; status: string }>): Promise<void> {
    for (const update of updates) {
      const status = update.status.toLowerCase() as FeatureStatus;
      await this.updateFeatureStatus(update.feature, status);
    }
    await this.updatePhaseProgress();
  }

  // ===== BasePMAdapter Abstract Method Implementations =====
  // These methods map file-based operations to the issue-based interface

  /**
   * Fetch available states for local tracking
   * Returns the Hodge workflow states
   */
  async fetchStates(_projectId?: string): Promise<PMState[]> {
    // Return Hodge workflow states - async for interface compatibility
    await Promise.resolve(); // Satisfy linter for async method
    return [
      { id: 'exploring', name: 'Exploring', type: 'unstarted' as StateType },
      { id: 'building', name: 'Building', type: 'started' as StateType },
      { id: 'hardening', name: 'Hardening', type: 'started' as StateType },
      { id: 'shipped', name: 'Shipped', type: 'completed' as StateType },
    ];
  }

  /**
   * Get a specific feature as an issue
   * Maps local feature to PMIssue interface
   */
  async getIssue(issueId: string): Promise<PMIssue> {
    // Ensure file exists
    await this.init();
    const content = await fs.readFile(this.pmPath, 'utf-8');

    // Look for the feature section in both Active Features and Completed Features
    const featurePattern = new RegExp(`### ${issueId}[\\s\\S]*?(?=###|##|$)`, 'g');
    const featureMatches = Array.from(content.matchAll(featurePattern));
    const featureMatch = featureMatches.length > 0 ? featureMatches[0] : null;

    if (!featureMatch) {
      throw new Error(`Feature ${issueId} not found`);
    }

    const featureContent = featureMatch[0];
    let title = issueId;
    let description = '';
    let status: FeatureStatus = 'exploring';

    // Extract description from the feature section
    const descriptionRegex = /- \*\*Description\*\*: (.+)/;
    const descriptionMatch = descriptionRegex.exec(featureContent);
    if (descriptionMatch) {
      title = descriptionMatch[1].trim();
      description = descriptionMatch[1].trim();
    }

    // Extract status from the feature section
    const statusRegex = /- \*\*Status\*\*: (\w+)/;
    const statusMatch = statusRegex.exec(featureContent);
    if (statusMatch) {
      const foundStatus = statusMatch[1];
      if (['exploring', 'building', 'hardening', 'shipped'].includes(foundStatus)) {
        status = foundStatus as FeatureStatus;
      }
    }

    return {
      id: issueId,
      title: title,
      description: description,
      state: this.mapStatusToState(status),
      url: `file://${this.pmPath}#${issueId}`,
    };
  }

  /**
   * Update feature state through issue interface
   * Maps to internal updateFeatureStatus
   */
  async updateIssueState(issueId: string, stateId: string): Promise<void> {
    const validStatuses = ['exploring', 'building', 'hardening', 'shipped'];
    const status = validStatuses.includes(stateId) ? (stateId as FeatureStatus) : 'exploring';

    await this.updateFeatureStatus(issueId, status);
  }

  /**
   * Search for features in project_management.md
   * Returns features matching the query
   */
  async searchIssues(query: string): Promise<PMIssue[]> {
    // Ensure file exists
    await this.init();
    const content = await fs.readFile(this.pmPath, 'utf-8');
    const features = this.searchFeatures(content, query);

    return features.map((feature) => ({
      id: feature.id,
      title: feature.description,
      description: feature.description,
      state: this.mapStatusToState(feature.status),
      url: `file://${this.pmPath}#${feature.id}`,
    }));
  }

  /**
   * Create a new feature through issue interface
   * Maps to internal addFeature
   */
  async createIssue(title: string, description?: string): Promise<PMIssue> {
    await this.addFeature(title, description || title);
    return this.getIssue(title);
  }

  // ===== Helper Methods for Abstract Implementation =====

  /**
   * Search for features matching a query
   */
  private searchFeatures(
    content: string,
    query: string
  ): Array<{
    id: string;
    description: string;
    status: FeatureStatus;
  }> {
    const features: Array<{
      id: string;
      description: string;
      status: FeatureStatus;
    }> = [];
    const queryLower = query.toLowerCase();

    // Find all feature sections
    // Split by headers to avoid regex backtracking issues
    const sections = content.split(/(?=###\s)/);

    for (const section of sections) {
      const headerMatch = /^###\s+([A-Z]+-\d+)/.exec(section);
      if (!headerMatch) continue;

      const featureId = headerMatch[1];
      const featureContent = section;

      // Check if the feature content contains the query
      if (featureContent.toLowerCase().includes(queryLower)) {
        // Extract description
        const descriptionRegex = /- \*\*Description\*\*: (.+)/;
        const descriptionMatch = descriptionRegex.exec(featureContent);
        const description = descriptionMatch ? descriptionMatch[1].trim() : featureId;

        // Extract status
        const statusRegex = /- \*\*Status\*\*: (\w+)/;
        const statusMatch = statusRegex.exec(featureContent);
        let status: FeatureStatus = 'exploring';
        if (
          statusMatch &&
          ['exploring', 'building', 'hardening', 'shipped'].includes(statusMatch[1])
        ) {
          status = statusMatch[1] as FeatureStatus;
        }

        features.push({ id: featureId, description, status });
      }
    }

    return features;
  }

  /**
   * Map local status to PMState
   */
  private mapStatusToState(status: FeatureStatus): PMState {
    const stateMap: Record<string, PMState> = {
      exploring: { id: 'exploring', name: 'Exploring', type: 'unstarted' as StateType },
      building: { id: 'building', name: 'Building', type: 'started' as StateType },
      hardening: { id: 'hardening', name: 'Hardening', type: 'started' as StateType },
      shipped: { id: 'shipped', name: 'Shipped', type: 'completed' as StateType },
    };

    return stateMap[status] || stateMap.exploring;
  }

  /**
   * Check if input is a valid Local PM issue ID
   * Local IDs follow the format: HOD-001, HODGE-123
   * Must match the ENTIRE input, not just part of it
   */
  isValidIssueID(input: string): boolean {
    const trimmed = input.trim();
    return /^HOD(GE)?-\d+$/.test(trimmed);
  }
}
