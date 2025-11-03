import { ShipContext } from './types.js';
import { getConfigManager } from '../config-manager.js';

export interface Decision {
  title: string;
  rationale: string;
  timestamp: string;
}

export interface QualityGate {
  name: string;
  passed: boolean;
  details?: string;
}

/**
 * Generates rich PM comments for ship notifications, decisions, and blockers
 * HODGE-377.4: Extended to support decision and blocker comments
 */
export class CommentGeneratorService {
  private configManager = getConfigManager();

  /**
   * Generates a decision comment for PM issues
   * @param decisions - Array of decisions made
   * @param hasNewDecisions - Whether these are new or reviewed decisions
   * @returns Formatted markdown comment
   */
  generateDecisionComment(decisions: Decision[], hasNewDecisions: boolean): string {
    const action = hasNewDecisions ? 'Finalized' : 'Reviewed';
    const count = decisions.length;

    let comment = `📋 Decisions ${action} (${count} decision${count !== 1 ? 's' : ''})\n\n`;

    // Add decision summaries
    if (decisions.length > 0) {
      decisions.forEach((decision, index) => {
        comment += `${index + 1}. **${decision.title}**\n`;
        if (decision.rationale) {
          comment += `   ${decision.rationale}\n`;
        }
      });
      comment += '\n';
    }

    comment += `Status: Ready to build`;

    return comment;
  }

  /**
   * Generates a ship comment for PM issues
   * @param commitSha - Git commit SHA
   * @param qualityGates - Quality gate results
   * @param timestamp - Ship timestamp
   * @param commitLink - Optional link to commit (if constructible)
   * @returns Formatted markdown comment
   */
  generateShipComment(
    commitSha: string,
    qualityGates: QualityGate[],
    timestamp: Date,
    commitLink?: string
  ): string {
    let comment = `🚀 Shipped in commit ${commitSha.substring(0, 7)}\n\n`;

    if (commitLink) {
      comment += `${commitLink}\n\n`;
    }

    // Quality gates summary
    if (qualityGates.length > 0) {
      comment += '**Quality Gates:**\n';
      qualityGates.forEach((gate) => {
        const status = gate.passed ? '✓' : '✗';
        comment += `${status} ${gate.name}`;
        if (gate.details) {
          comment += ` (${gate.details})`;
        }
        comment += '\n';
      });
      comment += '\n';
    }

    comment += `Shipped: ${timestamp.toISOString()}`;

    return comment;
  }

  /**
   * Generates a blocker comment for PM issues
   * @param blockerDetails - Description of what's blocked and why
   * @returns Formatted markdown comment
   */
  generateBlockerComment(blockerDetails: string): string {
    return `⚠️ Blocked\n\n${blockerDetails}`;
  }

  /**
   * Generates a rich comment based on ship context and configured verbosity
   * @param context - The ship context with metrics and information
   * @returns Formatted markdown comment
   */
  async generate(context: ShipContext): Promise<string> {
    const pmConfig = await this.configManager.getPMConfig();
    const verbosity = pmConfig?.verbosity ?? 'essential';

    if (verbosity === 'minimal') {
      return this.generateMinimalComment(context);
    }

    let comment = `## 🚀 Shipped via Hodge\n\n`;

    // Essential information
    comment += this.addEssentialInfo(context);

    // Add metrics for essential and rich
    if (verbosity === 'essential' || verbosity === 'rich') {
      comment += this.addMetrics(context);
      comment += this.addTestResults(context);
    }

    // Add rich details
    if (verbosity === 'rich') {
      comment += this.addCoverage(context);
      comment += this.addPatterns(context);
      comment += this.addCommitMessage(context);
    }

    comment += this.addFooter(context);

    return comment;
  }

  /**
   * Generates a minimal one-line comment
   */
  private generateMinimalComment(context: ShipContext): string {
    const commitInfo = context.commitHash ? ` in ${context.commitHash.substring(0, 7)}` : '';
    return `✅ Feature ${context.feature} has been shipped${commitInfo}.`;
  }

  /**
   * Adds essential information (commit hash, branch)
   */
  private addEssentialInfo(context: ShipContext): string {
    let info = '';

    if (context.commitHash) {
      info += `**Commit**: \`${context.commitHash.substring(0, 7)}\`\n`;
    }
    if (context.branch) {
      info += `**Branch**: \`${context.branch}\`\n`;
    }

    return info ? info + '\n' : '';
  }

  /**
   * Adds change metrics (files, lines added/removed)
   */
  private addMetrics(context: ShipContext): string {
    if (!context.filesChanged && !context.linesAdded && !context.linesRemoved) {
      return '';
    }

    let metrics = `### 📊 Changes\n`;
    if (context.filesChanged) metrics += `- Files: ${context.filesChanged}\n`;
    if (context.linesAdded) metrics += `- Added: +${context.linesAdded}\n`;
    if (context.linesRemoved) metrics += `- Removed: -${context.linesRemoved}\n`;

    return metrics + '\n';
  }

  /**
   * Adds test results
   */
  private addTestResults(context: ShipContext): string {
    if (!context.testsResults) {
      return '';
    }

    return `### ✅ Tests\n${context.testsResults.passed}/${context.testsResults.total} passing\n\n`;
  }

  /**
   * Adds coverage percentage
   */
  private addCoverage(context: ShipContext): string {
    if (context.coverage === undefined) {
      return '';
    }

    return `### 📈 Coverage\n${context.coverage}%\n\n`;
  }

  /**
   * Adds patterns applied
   */
  private addPatterns(context: ShipContext): string {
    if (!context.patterns || context.patterns.length === 0) {
      return '';
    }

    let patterns = `### 🎯 Patterns Applied\n`;
    context.patterns.forEach((p) => {
      patterns += `- ${p}\n`;
    });

    return patterns + '\n';
  }

  /**
   * Adds commit message (truncated if needed)
   */
  private addCommitMessage(context: ShipContext): string {
    if (!context.commitMessage) {
      return '';
    }

    let message = `### 📝 Commit Message\n\`\`\`\n`;
    message += context.commitMessage.substring(0, 500);
    if (context.commitMessage.length > 500) {
      message += '...';
    }
    message += '\n```\n';

    return message;
  }

  /**
   * Adds footer with version info
   */
  private addFooter(context: ShipContext): string {
    const versionInfo = context.hodgeVersion ? ` v${context.hodgeVersion}` : '';
    return `\n---\n_Updated by Hodge${versionInfo}_`;
  }
}
