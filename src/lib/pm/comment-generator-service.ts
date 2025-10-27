import { ShipContext } from './types.js';
import { getConfigManager } from '../config-manager.js';

/**
 * Generates rich PM comments for ship notifications
 * Extracted from PMHooks to reduce complexity
 */
export class CommentGeneratorService {
  private configManager = getConfigManager();

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
    message += '\n\`\`\`\n';

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
