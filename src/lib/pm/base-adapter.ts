/**
 * Base PM Adapter - Abstract class for PM tool integrations
 */

import { StateConventions } from './conventions.js';
import { PMAdapterOptions, PMIssue, PMState, PMOverrides, HodgeMode, StateType } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import { createCommandLogger } from '../logger.js';

export abstract class BasePMAdapter {
  protected conventions: StateConventions;
  protected overrides: PMOverrides;
  protected stateCache: Map<string, PMState[]> = new Map();
  protected cacheTimeout: number;
  protected lastCacheTime: number = 0;
  protected logger = createCommandLogger('pm-adapter');

  constructor(protected options: PMAdapterOptions) {
    this.conventions = new StateConventions();
    this.overrides = this.loadOverrides();
    this.cacheTimeout = options.cacheTimeout ?? 5 * 60 * 1000; // 5 minutes default

    // Apply custom patterns if provided
    if (this.overrides.customPatterns) {
      for (const [type, patterns] of Object.entries(this.overrides.customPatterns)) {
        // Convert string patterns to RegExp if needed
        const regexPatterns = patterns.map((p) => (typeof p === 'string' ? new RegExp(p, 'i') : p));
        this.conventions.addCustomPatterns(type as StateType, regexPatterns);
      }
    }
  }

  /**
   * Load overrides from .hodge/pm-overrides.json
   */
  protected loadOverrides(): PMOverrides {
    const overridePath = path.join('.hodge', 'pm-overrides.json');

    try {
      if (fs.existsSync(overridePath)) {
        const content = fs.readFileSync(overridePath, 'utf8');
        return JSON.parse(content) as PMOverrides;
      }
    } catch (error) {
      this.logger.warn('Failed to load PM overrides', { error: error as Error });
    }

    return this.options.overrides ?? {};
  }

  /**
   * Save overrides to file
   */
  protected saveOverrides(overrides: PMOverrides): void {
    const overridePath = path.join('.hodge', 'pm-overrides.json');
    const hodgeDir = path.dirname(overridePath);

    if (!fs.existsSync(hodgeDir)) {
      fs.mkdirSync(hodgeDir, { recursive: true });
    }

    fs.writeFileSync(overridePath, JSON.stringify(overrides, null, 2), 'utf8');
  }

  /**
   * Get available states (with caching)
   */
  async getStates(projectId?: string): Promise<PMState[]> {
    const cacheKey = projectId ?? 'default';
    const now = Date.now();

    // Check cache
    if (this.stateCache.has(cacheKey) && now - this.lastCacheTime < this.cacheTimeout) {
      return this.stateCache.get(cacheKey)!;
    }

    // Fetch fresh states
    const states = await this.fetchStates(projectId);

    // Update cache
    this.stateCache.set(cacheKey, states);
    this.lastCacheTime = now;

    return states;
  }

  /**
   * Move issue to target state based on mode transition
   * @param issueId - The ID of the issue to transition
   * @param fromMode - Current Hodge mode
   * @param toMode - Target Hodge mode
   * @throws {Error} If issue ID is invalid or transition fails
   */
  async transitionIssue(issueId: string, fromMode: HodgeMode, toMode: HodgeMode): Promise<void> {
    // Input validation
    if (!issueId || typeof issueId !== 'string') {
      throw new Error('Invalid issue ID provided');
    }

    const validModes: HodgeMode[] = ['explore', 'build', 'harden', 'ship'];
    if (!validModes.includes(fromMode) || !validModes.includes(toMode)) {
      throw new Error(`Invalid mode transition: ${fromMode} -> ${toMode}`);
    }
    // Check for override first
    const transitionKey = `${fromMode}->${toMode}`;
    if (this.overrides.transitions?.[transitionKey]) {
      await this.updateIssueState(issueId, this.overrides.transitions[transitionKey]);
      return;
    }

    // Use conventions
    const targetType = this.conventions.getTargetStateType(fromMode, toMode);
    const states = await this.getStates();
    const targetState = this.conventions.findBestMatch(states, targetType);

    if (!targetState) {
      throw new Error(
        `No state found for transition ${fromMode}->${toMode}. ` +
          `Consider adding an override in .hodge/pm-overrides.json`
      );
    }

    await this.updateIssueState(issueId, targetState.id);
  }

  /**
   * Detect current Hodge mode from issue state
   * @param issueId - The ID of the issue to check
   * @returns The detected Hodge mode
   * @throws {Error} If issue ID is invalid
   */
  async detectModeFromIssue(issueId: string): Promise<HodgeMode> {
    if (!issueId || typeof issueId !== 'string') {
      throw new Error('Invalid issue ID provided');
    }
    const issue = await this.getIssue(issueId);

    switch (issue.state.type) {
      case 'unstarted':
        return 'explore';
      case 'started':
        // Check if it's in review
        if (this.conventions.isReviewState(issue.state.name)) {
          return 'harden';
        }
        return 'build';
      case 'completed':
        return 'ship';
      default:
        return 'explore';
    }
  }

  /**
   * Generate override template for user
   */
  generateOverrideTemplate(): PMOverrides {
    return {
      transitions: {
        'explore->build': 'state-id-here',
        'build->harden': 'state-id-here',
        'harden->ship': 'state-id-here',
      },
      customPatterns: {
        started: ['/custom-in-progress-pattern/i'],
      },
      issueUrlPattern: 'https://your-pm-tool.com/issue/{{id}}',
    };
  }

  /**
   * Abstract methods to be implemented by specific PM tools
   */
  abstract fetchStates(projectId?: string): Promise<PMState[]>;
  abstract getIssue(issueId: string): Promise<PMIssue>;
  abstract updateIssueState(issueId: string, stateId: string): Promise<void>;
  abstract searchIssues(query: string): Promise<PMIssue[]>;
  abstract createIssue(title: string, description?: string): Promise<PMIssue>;

  /**
   * Append a comment to an issue
   * HODGE-377.4: Added for PM synchronization (decision comments, ship notifications, blockers)
   * @param issueId - The ID of the issue to comment on
   * @param comment - The comment body (markdown format)
   */
  abstract appendComment(issueId: string, comment: string): Promise<void>;

  /**
   * Check if input string is a valid issue ID for this PM adapter
   * Must match the ENTIRE input string, not just part of it
   * @param input - The input string to check
   * @returns true if input is a valid issue ID format for this adapter
   */
  abstract isValidIssueID(input: string): boolean;
}
