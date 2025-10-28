/**
 * Decision Analysis for Plan Command
 * Handles cascading decision discovery from multiple sources
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { createCommandLogger } from '../../lib/logger.js';

/**
 * Analyzes and extracts decisions for feature planning
 */
export class PlanDecisionAnalyzer {
  private logger = createCommandLogger('plan-decision-analyzer', { enableConsole: true });

  constructor(private basePath: string) {}

  /**
   * Analyzes decisions using cascading file check strategy:
   * 1. Feature-specific decisions.md
   * 2. exploration.md (Recommendation + Decisions Needed)
   * 3. Global decisions.md (fallback)
   */
  async analyzeDecisions(feature: string): Promise<string[]> {
    // Strategy 1: Check feature-specific decisions.md
    const featureDecisions = await this.checkFeatureDecisions(feature);
    if (featureDecisions.length > 0) {
      return featureDecisions;
    }

    // Strategy 2: Extract from exploration.md
    const explorationDecisions = await this.extractFromExploration(feature);
    if (explorationDecisions.length > 0) {
      return explorationDecisions;
    }

    // Strategy 3: Fall back to global decisions.md
    return this.checkGlobalDecisions(feature);
  }

  /**
   * Check for decisions in feature-specific decisions.md file
   */
  private async checkFeatureDecisions(feature: string): Promise<string[]> {
    const featureDecisionsFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      feature,
      'decisions.md'
    );

    if (!existsSync(featureDecisionsFile)) {
      return [];
    }

    const content = await fs.readFile(featureDecisionsFile, 'utf-8');
    return this.parseDecisionsFromMarkdown(content, feature);
  }

  /**
   * Extract decisions from exploration.md (Recommendation + Decisions Needed sections)
   */
  private async extractFromExploration(feature: string): Promise<string[]> {
    const explorationFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      feature,
      'explore',
      'exploration.md'
    );

    if (!existsSync(explorationFile)) {
      return [];
    }

    try {
      const content = await fs.readFile(explorationFile, 'utf-8');
      const decisions: string[] = [];

      // Extract Recommendation section
      const recommendationPattern = /## Recommendation\s*\n\n\*\*(.+?)\*\*/;
      const recommendationMatch = recommendationPattern.exec(content);
      if (recommendationMatch?.[1]) {
        decisions.push(recommendationMatch[1].trim());
      }

      // Extract Decisions Needed section
      const decisionsNeededPattern = /## Decisions Needed([\s\S]*?)(?=\n## |\n---|$)/;
      const decisionsNeededMatch = decisionsNeededPattern.exec(content);
      if (decisionsNeededMatch?.[1]) {
        // Parse individual decision titles from "### Decision N:" headers
        const decisionTitles = decisionsNeededMatch[1].match(/### Decision \d+: (.+)/g);
        if (decisionTitles) {
          const decisionPattern = /### Decision \d+: (.+)/;
          decisionTitles.forEach((title) => {
            const match = decisionPattern.exec(title);
            if (match?.[1]) {
              decisions.push(match[1].trim());
            }
          });
        }
      }

      // If we have decisions from exploration, check for uncovered decisions
      if (decisions.length > 0) {
        this.checkUncoveredDecisions(content, recommendationMatch?.[1] || '');
      }

      return decisions;
    } catch (error) {
      // Failed to read exploration file, return empty array
      this.logger.debug('Failed to read exploration file', { error: error as Error });
      return [];
    }
  }

  /**
   * Check for uncovered decisions in Decisions Needed section
   * Prompts user interactively if uncovered decisions are found
   */
  private checkUncoveredDecisions(explorationContent: string, recommendation: string): void {
    const decisionsNeededPattern = /## Decisions Needed([\s\S]*?)(?=\n## |\n---|$)/;
    const decisionsNeededMatch = decisionsNeededPattern.exec(explorationContent);

    if (!decisionsNeededMatch) {
      return;
    }

    // Extract decision titles
    const decisionTitles = decisionsNeededMatch[1].match(/### Decision \d+: (.+)/g);
    if (!decisionTitles || decisionTitles.length === 0) {
      return;
    }

    // Check if recommendation covers all decisions
    const decisionPattern = /### Decision \d+: (.+)/;
    const uncoveredDecisions = decisionTitles.filter((title) => {
      const match = decisionPattern.exec(title);
      if (!match) return false;
      const decisionTopic = match[1].toLowerCase();
      return !recommendation.toLowerCase().includes(decisionTopic);
    });

    if (uncoveredDecisions.length > 0) {
      this.logger.warn(chalk.yellow('\n⚠️  Uncovered Decisions Detected:'));
      this.logger.info(
        chalk.yellow(
          `The Recommendation doesn't address ${uncoveredDecisions.length} decision(s) from Decisions Needed:`
        )
      );
      const decisionPattern = /### Decision \d+: (.+)/;
      uncoveredDecisions.forEach((decision, index) => {
        const match = decisionPattern.exec(decision);
        if (match) {
          this.logger.warn(chalk.yellow(`  ${index + 1}. ${match[1]}`));
        }
      });
      this.logger.info(
        chalk.yellow('\nNote: You may want to revisit /decide to address these before proceeding.')
      );
      this.logger.warn(chalk.yellow('Continuing with plan generation...\n'));
    }
  }

  /**
   * Check global decisions.md file (final fallback)
   */
  private async checkGlobalDecisions(feature: string): Promise<string[]> {
    const decisionsFile = path.join(this.basePath, '.hodge', 'decisions.md');
    if (!existsSync(decisionsFile)) {
      return [];
    }

    const content = await fs.readFile(decisionsFile, 'utf-8');
    return this.parseDecisionsFromMarkdown(content, feature);
  }

  /**
   * Parse decisions from markdown content with feature filtering
   * @note Cognitive complexity 25 - Pre-existing technical debt, requires refactoring (HODGE-349)
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  private parseDecisionsFromMarkdown(content: string, feature: string): string[] {
    const decisions: string[] = [];
    const lines = content.split('\n');
    let inDecisionBlock = false;
    let currentDecision = '';
    const decisionPattern = /\*\*Decision\*\*:\s*([^\n]+)/;

    for (const line of lines) {
      if (line.startsWith('### ')) {
        if (currentDecision && currentDecision.includes(`Feature: ${feature}`)) {
          const decisionMatch = decisionPattern.exec(currentDecision);
          if (decisionMatch) {
            decisions.push(decisionMatch[1]);
          }
        }
        currentDecision = line + '\n';
        inDecisionBlock = true;
      } else if (inDecisionBlock) {
        if (line.startsWith('---')) {
          if (currentDecision.includes(`Feature: ${feature}`)) {
            const decisionMatch = decisionPattern.exec(currentDecision);
            if (decisionMatch) {
              decisions.push(decisionMatch[1]);
            }
          }
          currentDecision = '';
          inDecisionBlock = false;
        } else {
          currentDecision += line + '\n';
        }
      }
    }

    return decisions;
  }

  /**
   * Extract feature description from exploration.md for epic title (public for testing)
   * @note Cognitive complexity 18 - Pre-existing technical debt, requires refactoring (HODGE-349)
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async getFeatureDescription(feature: string): Promise<string> {
    const explorationFile = path.join(
      this.basePath,
      '.hodge',
      'features',
      feature,
      'explore',
      'exploration.md'
    );

    // Try exploration.md first
    if (existsSync(explorationFile)) {
      try {
        const content = await fs.readFile(explorationFile, 'utf-8');

        // Priority 1: Extract from Title field (AI-generated)
        const titlePattern = /\*\*Title\*\*:\s*([^\n]+)/;
        const titleMatch = titlePattern.exec(content);
        if (titleMatch?.[1]) {
          return this.truncateDescription(titleMatch[1].trim());
        }

        // Priority 2: Extract from ## Problem Statement heading
        const headingPattern = /## Problem Statement\s*\n([^\n]+)/;
        const headingMatch = headingPattern.exec(content);
        if (headingMatch?.[1]) {
          return this.truncateDescription(headingMatch[1].trim());
        }

        // Priority 3: Extract from **Problem Statement:** inline format
        const inlinePattern = /\*\*Problem Statement:\*\*\s*\n([^\n]+)/;
        const inlineMatch = inlinePattern.exec(content);
        if (inlineMatch?.[1]) {
          return this.truncateDescription(inlineMatch[1].trim());
        }

        // Priority 4: Try to extract from "Type:" line
        const typePattern = /\*\*Type\*\*:\s*([^\n]+)/;
        const typeMatch = typePattern.exec(content);
        if (typeMatch?.[1]) {
          return this.truncateDescription(typeMatch[1].trim());
        }

        // Priority 5: Use first non-header line after Feature Overview
        const overviewPattern = /## Feature Overview[\s\S]*?\n\n([^\n#]+)/;
        const overviewMatch = overviewPattern.exec(content);
        if (overviewMatch?.[1]) {
          return this.truncateDescription(overviewMatch[1].trim());
        }
      } catch (error) {
        // Fall through to decision extraction
        this.logger.debug('Failed to extract from exploration file', {
          error: error as Error,
        });
      }
    }

    // Fallback: Try to extract from decisions
    const decisions = await this.analyzeDecisions(feature);
    if (decisions.length > 0) {
      // Strategy 1: Look for implementation approach decision
      const approachDecision = decisions.find(
        (d) =>
          d.toLowerCase().includes('implement') ||
          d.toLowerCase().includes('approach') ||
          d.toLowerCase().includes('use')
      );
      if (approachDecision) {
        return this.truncateDescription(this.cleanDecisionText(approachDecision));
      }

      // Strategy 2: Use first substantial decision
      const substantialDecision = decisions.find((d) => d.length > 30);
      if (substantialDecision) {
        return this.truncateDescription(this.cleanDecisionText(substantialDecision));
      }

      // Strategy 3: Synthesize from decision count
      return `Implementing ${decisions.length} technical decisions`;
    }

    return 'No description available';
  }

  /**
   * Clean decision text by removing phase markers and extra formatting
   */
  private cleanDecisionText(decision: string): string {
    // Remove phase markers like [harden] - simple split approach avoids regex issues
    const parts = decision.split('[');
    const cleanParts = parts.map((part) => {
      const bracketEnd = part.indexOf(']');
      return bracketEnd >= 0 ? part.substring(bracketEnd + 1) : part;
    });
    const withoutBrackets = cleanParts.join('');
    // Take first part before dash
    const beforeDash = withoutBrackets.split('-')[0];
    return beforeDash.trim();
  }

  /**
   * Truncate description at 100 chars with word boundary
   */
  private truncateDescription(text: string): string {
    if (text.length <= 100) {
      return text;
    }

    // Find last space before 100 chars
    const truncated = text.substring(0, 100);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    // No space found, just truncate at 100
    return truncated + '...';
  }
}
