import { promises as fs } from 'fs';
import * as path from 'path';
import chalk from 'chalk';

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
 */
export class LocalPMAdapter {
  private pmPath: string;
  private operationQueue: Promise<void> = Promise.resolve();

  constructor(basePath?: string) {
    this.pmPath = path.join(basePath || '.', '.hodge', 'project_management.md');
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
      console.log(chalk.blue('ℹ️  Created project_management.md with project plan'));
    }
  }

  /**
   * Update feature status in the project plan
   */
  async updateFeatureStatus(
    feature: string,
    status: 'exploring' | 'building' | 'hardening' | 'shipped'
  ): Promise<void> {
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
      console.log(chalk.green(`✓ Updated ${feature} status to: ${status}`));
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
        console.log(chalk.yellow(`⚠️  Feature ${feature} already exists`));
        return;
      }

      const date = new Date().toISOString().split('T')[0];
      const entry = `
### ${feature}
- **Status**: exploring
- **Priority**: TBD
- **Created**: ${date}
- **Updated**: ${date}
- **Description**: ${description}
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
      const nextSectionMatch = afterActiveFeatures.match(/^## /m);
      const nextSectionIndex = nextSectionMatch
        ? activeFeaturesIndex + '## Active Features\n'.length + nextSectionMatch.index!
        : content.length;

      // Insert the new feature entry before the next section
      const updated =
        content.substring(0, nextSectionIndex) + entry + '\n' + content.substring(nextSectionIndex);

      await fs.writeFile(this.pmPath, updated, 'utf-8');
      console.log(chalk.green(`✓ Added ${feature} to project management tracking`));
    });
  }

  /**
   * Move feature to completed section
   */
  private moveToCompleted(content: string, feature: string): string {
    // Extract feature entry
    const featureRegex = new RegExp(`(### ${feature}[\\s\\S]*?)(?=###|##|$)`, 'm');
    const match = content.match(featureRegex);

    if (!match) return content;

    const featureEntry = match[1].trim();

    // Remove from Active Features
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
      const phaseMatch = updated.match(phaseRegex);

      if (phaseMatch) {
        const phaseContent = phaseMatch[1];
        const totalItems = (phaseContent.match(/\[[ x~]\]/g) || []).length;
        const completedItems = (phaseContent.match(/\[x\]/g) || []).length;

        if (totalItems > 0 && completedItems === totalItems) {
          // Mark phase as complete
          updated = updated.replace(new RegExp(`(### ${phase} \\([^)]+\\)).*`), `$1 ✅`);
        }
      }
    }

    if (content !== updated) {
      await fs.writeFile(this.pmPath, updated, 'utf-8');
      console.log(chalk.green('✓ Updated project plan phase progress'));
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
      const status = update.status.toLowerCase() as
        | 'exploring'
        | 'building'
        | 'hardening'
        | 'shipped';
      await this.updateFeatureStatus(update.feature, status);
    }
    await this.updatePhaseProgress();
  }
}
