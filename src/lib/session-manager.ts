import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

import { createCommandLogger } from './logger.js';
/**
 * Lightweight session format for quick persistence
 * Follows the Hybrid with HODGE.md Enhancement approach
 */
export interface LightSession {
  v: 1; // Schema version
  ts: number; // Timestamp
  feature: string; // Current feature
  mode: 'explore' | 'build' | 'harden' | 'ship'; // Current mode
  recentCommands: string[]; // Last 10 commands
  recentDecisions: string[]; // Last 5 decisions
  summary?: string; // One-line summary of progress
  nextAction?: string; // Suggested next action
}

/**
 * Session manager for context persistence across AI sessions
 * Implements lightweight checkpoints that enhance HODGE.md
 */
export class SessionManager {
  private logger = createCommandLogger('session-manager', { enableConsole: false });

  private readonly sessionFile: string;
  private readonly maxCommands = 10;
  private readonly maxDecisions = 5;
  private readonly sessionTTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(basePath: string = '.') {
    this.sessionFile = join(basePath, '.hodge', '.session');
  }

  /**
   * Save or update the current session
   */
  async save(data: Partial<LightSession>): Promise<void> {
    try {
      const current = await this.load();
      const updated: LightSession = {
        v: 1,
        ts: Date.now(),
        feature: data.feature || current?.feature || '',
        mode: data.mode || current?.mode || 'explore',
        recentCommands: data.recentCommands || current?.recentCommands || [],
        recentDecisions: data.recentDecisions || current?.recentDecisions || [],
        summary: data.summary || current?.summary,
        nextAction: data.nextAction || current?.nextAction,
      };

      // Trim arrays to max size
      updated.recentCommands = updated.recentCommands.slice(-this.maxCommands);
      updated.recentDecisions = updated.recentDecisions.slice(-this.maxDecisions);

      // Ensure directory exists
      const dir = join('.hodge');
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }

      await fs.writeFile(this.sessionFile, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (error) {
      // Don't fail commands if session save fails
      this.logger.warn('Session save failed:', error);
    }
  }

  /**
   * Load the current session if it exists and is valid
   */
  async load(): Promise<LightSession | null> {
    try {
      if (!existsSync(this.sessionFile)) {
        return null;
      }

      const content = await fs.readFile(this.sessionFile, 'utf-8');
      const session = JSON.parse(content) as LightSession;

      // Check if session is expired
      if (Date.now() - session.ts > this.sessionTTL) {
        await this.cleanup();
        return null;
      }

      return session;
    } catch (error) {
      this.logger.debug('Could not load session file (corrupted or invalid)', { error });
      return null;
    }
  }

  /**
   * Add a command to the session history
   */
  async addCommand(command: string): Promise<void> {
    const session = await this.load();
    const commands = session?.recentCommands || [];
    commands.push(command);
    await this.save({ recentCommands: commands });
  }

  /**
   * Add a decision to the session history
   */
  async addDecision(decision: string): Promise<void> {
    const session = await this.load();
    const decisions = session?.recentDecisions || [];
    decisions.push(decision);
    await this.save({ recentDecisions: decisions });
  }

  /**
   * Update session with feature and mode
   */
  async updateContext(feature: string, mode: LightSession['mode']): Promise<void> {
    await this.save({ feature, mode });
  }

  /**
   * Set a summary of current progress
   */
  async setSummary(summary: string): Promise<void> {
    await this.save({ summary });
  }

  /**
   * Suggest next action
   */
  async suggestNext(action: string): Promise<void> {
    await this.save({ nextAction: action });
  }

  /**
   * Cleanup expired session
   */
  async cleanup(): Promise<void> {
    try {
      if (existsSync(this.sessionFile)) {
        await fs.unlink(this.sessionFile);
      }
    } catch (error) {
      this.logger.debug('Could not delete session file during cleanup', { error });
    }
  }

  /**
   * Format session for display
   */
  formatForDisplay(session: LightSession): string {
    const age = Date.now() - session.ts;
    const ageMinutes = Math.floor(age / 60000);
    const ageHours = Math.floor(ageMinutes / 60);
    const ageDays = Math.floor(ageHours / 24);

    let ageStr = `${ageMinutes} minutes ago`;
    if (ageDays > 0) {
      ageStr = `${ageDays} days ago`;
    } else if (ageHours > 0) {
      ageStr = `${ageHours} hours ago`;
    }

    return `
## Session Context
**Feature**: ${session.feature}
**Mode**: ${session.mode}
**Last activity**: ${ageStr}
${session.summary ? `**Progress**: ${session.summary}` : ''}
${session.nextAction ? `**Suggested next**: ${session.nextAction}` : ''}

### Recent Commands
${
  session.recentCommands
    .slice(-3)
    .map((cmd) => `- ${cmd}`)
    .join('\n') || '- No recent commands'
}

### Recent Decisions
${
  session.recentDecisions
    .slice(-2)
    .map((dec) => `- ${dec}`)
    .join('\n') || '- No recent decisions'
}
`;
  }

  /**
   * Check if a session exists and prompt to continue
   */
  async promptToContinue(): Promise<boolean> {
    const session = await this.load();
    if (!session) {
      return false;
    }

    this.logger.info(this.formatForDisplay(session));
    this.logger.info('\nContinue from previous session? (y/n)');

    // Note: In real implementation, this would use inquirer or similar
    // For now, we'll return true to indicate a session exists
    return true;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
