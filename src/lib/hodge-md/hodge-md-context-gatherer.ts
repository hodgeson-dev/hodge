/**
 * Context Gathering for HODGE.md Generation
 * Collects context from filesystem (decisions, standards, files, etc.)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ContextManager } from '../context-manager.js';
import type { HodgeMDContext } from './types.js';

/**
 * Gathers context for HODGE.md generation
 */
export class HodgeMDContextGatherer {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();
  }

  /**
   * Gather all context for a feature
   */
  async gatherContext(feature: string): Promise<HodgeMDContext> {
    const mode = await this.getCurrentMode(feature);
    const decisions = await this.getRecentDecisions(feature);
    const standards = await this.getActiveStandards();
    const principles = await this.getCorePrinciples();
    const recentCommands = await this.getCommandHistory();
    const workingFiles = await this.getWorkingFiles(feature);
    const nextSteps = this.getNextSteps(feature, mode);
    // HODGE-364: Use ContextManager instead of SessionManager
    const contextManager = new ContextManager(this.basePath);
    const context = await contextManager.load();
    const pmIssue = await this.getPMIssue(feature);

    return {
      feature,
      mode,
      decisions,
      standards,
      principles,
      recentCommands,
      workingFiles,
      nextSteps,
      pmIssue,
      context: context ?? undefined,
    };
  }

  private async getCurrentMode(feature: string): Promise<string> {
    // Check feature directory for current mode
    const featurePath = path.join(this.basePath, '.hodge', 'features', feature);

    try {
      // Check for mode indicators in order
      // First check if feature has been shipped (has ship-record.json with validationPassed: true)
      // HODGE-341.2: ship-record.json moved to feature root
      const shipRecordPath = path.join(featurePath, 'ship-record.json');
      if (await this.fileExists(shipRecordPath)) {
        try {
          const shipRecordContent = await fs.readFile(shipRecordPath, 'utf-8');
          const shipRecord = JSON.parse(shipRecordContent) as { validationPassed?: boolean };
          // Only consider it shipped if validation passed
          if (shipRecord.validationPassed === true) {
            return 'shipped';
          }
        } catch {
          // If we can't read/parse the file, fall through to check other modes
        }
      }

      if (await this.fileExists(path.join(featurePath, 'ship'))) {
        return 'ship';
      }
      if (await this.fileExists(path.join(featurePath, 'harden'))) {
        return 'harden';
      }
      if (await this.fileExists(path.join(featurePath, 'build'))) {
        return 'build';
      }
      if (await this.fileExists(path.join(featurePath, 'explore'))) {
        return 'explore';
      }
    } catch {
      // Feature doesn't exist yet
    }

    return 'explore'; // Default mode
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getRecentDecisions(
    feature: string
  ): Promise<Array<{ date: string; decision: string }>> {
    const decisionsPath = path.join(this.basePath, '.hodge', 'decisions.md');
    const decisions: Array<{ date: string; decision: string }> = [];

    try {
      const content = await fs.readFile(decisionsPath, 'utf-8');
      const lines = content.split('\n');

      // Parse decisions from markdown
      const decisionPattern = /^###\s+(\d{4}-\d{2}-\d{2})\s+-\s+(.+)/;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for date headers like "### 2025-01-16 - Decision text"
        const match = decisionPattern.exec(line);
        if (match) {
          decisions.push({
            date: match[1],
            decision: match[2],
          });
        }
      }

      // Filter for feature-specific decisions if available
      const featureDecisions = decisions.filter((d: { date: string; decision: string }) =>
        d.decision.toLowerCase().includes(feature.toLowerCase())
      );

      // Return feature decisions if found, otherwise return recent 20 (HODGE-297 decision)
      const result = featureDecisions.length > 0 ? featureDecisions : decisions.slice(0, 20);
      return result;
    } catch {
      return [];
    }
  }

  private async getActiveStandards(): Promise<Array<{ category: string; rules: string[] }>> {
    const standardsPath = path.join(this.basePath, '.hodge', 'standards.md');

    try {
      const content = await fs.readFile(standardsPath, 'utf-8');
      return this.parseStandards(content);
    } catch {
      // Return default standards if file doesn't exist
      return [
        {
          category: 'Code Quality',
          rules: [
            'Use TypeScript for type safety',
            'Follow ESLint rules',
            'Write tests for critical paths',
          ],
        },
      ];
    }
  }

  private parseStandards(content: string): Array<{ category: string; rules: string[] }> {
    const standards: Array<{ category: string; rules: string[] }> = [];
    const sections = content.split(/^##\s+/m);

    for (const section of sections) {
      const lines = section.trim().split('\n');
      if (lines.length === 0) continue;

      const category = lines[0].trim();
      const rules = lines
        .slice(1)
        .filter((line) => line.trim().startsWith('- '))
        .map((line) => line.replace(/^-\s*/, '').trim());

      if (rules.length > 0) {
        standards.push({ category, rules });
      }
    }

    return standards;
  }

  private async getCommandHistory(): Promise<string[]> {
    const historyPath = path.join(this.basePath, '.hodge', 'command-history.json');

    try {
      const content = await fs.readFile(historyPath, 'utf-8');
      const history = JSON.parse(content) as { commands?: string[] };
      return history.commands?.slice(-5) ?? [];
    } catch {
      return [];
    }
  }

  private async getWorkingFiles(feature: string): Promise<string[]> {
    const featurePath = path.join(this.basePath, '.hodge', 'features', feature);
    const files: string[] = [];

    try {
      // Check for files in explore directory
      const explorePath = path.join(featurePath, 'explore');
      const exploreFiles = await this.listFiles(explorePath);
      files.push(...exploreFiles.map((f) => path.join('explore', f)));

      // Check for files in build directory
      const buildPath = path.join(featurePath, 'build');
      const buildFiles = await this.listFiles(buildPath);
      files.push(...buildFiles.map((f) => path.join('build', f)));

      // Check for files in ship directory
      const shipPath = path.join(featurePath, 'ship');
      const shipFiles = await this.listFiles(shipPath);
      files.push(...shipFiles.map((f) => path.join('ship', f)));
    } catch {
      // Directory might not exist yet
    }

    return files;
  }

  private async listFiles(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath);
      return entries.filter((entry) => !entry.startsWith('.'));
    } catch {
      return [];
    }
  }

  private getNextSteps(feature: string, mode: string): string[] {
    const steps: string[] = [];

    switch (mode) {
      case 'explore':
        steps.push(
          'Review exploration approaches',
          'Make decision with `hodge decide`',
          'Start building with `hodge build ' + feature + '`'
        );
        break;
      case 'build':
        steps.push(
          'Complete implementation',
          'Run tests with `npm test`',
          'Harden with `hodge harden ' + feature + '`'
        );
        break;
      case 'harden':
        steps.push(
          'Fix all linting issues',
          'Ensure 100% test coverage',
          'Ship with `hodge ship ' + feature + '`'
        );
        break;
      case 'ship':
        steps.push('Commit changes', 'Create pull request', 'Update documentation');
        break;
      case 'shipped':
        steps.push('Feature completed. Start new work with `hodge explore <feature>`');
        break;
      default:
        steps.push('Start exploring with `hodge explore ' + feature + '`');
    }

    return steps;
  }

  private async getPMIssue(feature: string): Promise<string | undefined> {
    const issueIdPath = path.join(this.basePath, '.hodge', 'features', feature, 'issue-id.txt');

    try {
      const issueId = await fs.readFile(issueIdPath, 'utf-8');
      return issueId.trim();
    } catch {
      return undefined;
    }
  }

  private async getCorePrinciples(): Promise<
    Array<{ title: string; description: string }> | undefined
  > {
    const principlesPath = path.join(this.basePath, '.hodge', 'principles.md');

    try {
      const content = await fs.readFile(principlesPath, 'utf-8');
      const principles: Array<{ title: string; description: string }> = [];

      // Parse the Core Principles section
      const corePrinciplesPattern = /## Core Principles\n\n([\s\S]*?)(?=\n##|$)/;
      const corePrinciplesMatch = corePrinciplesPattern.exec(content);
      if (!corePrinciplesMatch) return undefined;

      const principlesText = corePrinciplesMatch[1];
      const principleBlocks = principlesText.split(/\n### /).filter(Boolean);

      for (const block of principleBlocks) {
        const lines = block.split('\n');
        const title = lines[0].replace('### ', '');
        const description = lines.slice(1).join('\n').trim().split('\n')[0]; // Get first line of description

        if (title && description) {
          principles.push({ title, description });
        }
      }

      return principles.length > 0 ? principles : undefined;
    } catch {
      return undefined;
    }
  }
}
