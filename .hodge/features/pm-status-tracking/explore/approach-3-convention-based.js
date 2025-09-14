/**
 * Approach 3: Convention-Based with Smart Defaults
 * Use conventions that work across PM tools with override capability
 */

class ConventionBasedAdapter {
  constructor(pmTool = 'linear') {
    this.pmTool = pmTool;
    this.conventions = this.loadConventions();
    this.overrides = this.loadOverrides();
  }

  loadConventions() {
    // Universal conventions that work across most PM tools
    return {
      statePatterns: {
        unstarted: [
          /backlog/i,
          /todo/i,
          /upcoming/i,
          /planned/i,
          /ready/i
        ],
        inProgress: [
          /in.?progress/i,
          /doing/i,
          /working/i,
          /development/i,
          /active/i
        ],
        review: [
          /review/i,
          /testing/i,
          /qa/i,
          /verification/i,
          /pr/i
        ],
        done: [
          /done/i,
          /complete/i,
          /shipped/i,
          /deployed/i,
          /closed/i
        ],
        canceled: [
          /cancel/i,
          /abandon/i,
          /declined/i,
          /rejected/i
        ]
      },
      // Mode transitions
      transitions: {
        'explore->build': 'inProgress',
        'build->harden': 'review',
        'harden->ship': 'done',
        'any->cancel': 'canceled'
      }
    };
  }

  loadOverrides() {
    // Check for user overrides in .hodge/pm-overrides.json
    try {
      const fs = require('fs');
      const path = require('path');
      const overridePath = path.join('.hodge', 'pm-overrides.json');
      
      if (fs.existsSync(overridePath)) {
        return JSON.parse(fs.readFileSync(overridePath, 'utf8'));
      }
    } catch (e) {
      // No overrides, use conventions
    }
    return {};
  }

  async detectStateType(stateName) {
    // Match state name against patterns
    for (const [type, patterns] of Object.entries(this.conventions.statePatterns)) {
      if (patterns.some(pattern => pattern.test(stateName))) {
        return type;
      }
    }
    return 'unknown';
  }

  async moveToInProgress(issueId, currentMode = 'explore') {
    // First check overrides
    if (this.overrides.transitions?.toInProgress) {
      return this.applyTransition(issueId, this.overrides.transitions.toInProgress);
    }

    // Use convention
    const transition = `${currentMode}->build`;
    const targetType = this.conventions.transitions[transition];
    
    return this.applyTransitionByType(issueId, targetType);
  }

  async moveToDone(issueId, currentMode = 'harden') {
    // Check overrides
    if (this.overrides.transitions?.toDone) {
      return this.applyTransition(issueId, this.overrides.transitions.toDone);
    }

    // Use convention
    const transition = `${currentMode}->ship`;
    const targetType = this.conventions.transitions[transition];
    
    return this.applyTransitionByType(issueId, targetType);
  }

  async applyTransitionByType(issueId, targetType) {
    // Would fetch available states from PM tool
    // Then find best match using conventions
    console.log(`Finding state matching type: ${targetType}`);
    
    // Pseudo code for actual implementation
    const states = await this.fetchStates();
    const targetState = states.find(state => 
      this.detectStateType(state.name) === targetType
    );
    
    if (targetState) {
      await this.updateIssueState(issueId, targetState.id);
    } else {
      // Fallback: let user choose
      throw new Error(`No ${targetType} state found. Please configure in .hodge/pm-overrides.json`);
    }
  }

  async fetchStates() {
    // Would implement based on PM tool
    // For now, mock data
    return [
      { id: '1', name: 'Backlog' },
      { id: '2', name: 'In Progress' },
      { id: '3', name: 'In Review' },
      { id: '4', name: 'Done' }
    ];
  }

  async updateIssueState(issueId, stateId) {
    console.log(`Moving issue ${issueId} to state ${stateId}`);
    // Would call actual PM tool API
  }

  // Helper to generate override template
  generateOverrideTemplate() {
    return {
      pmTool: this.pmTool,
      transitions: {
        toInProgress: "state-id-here",
        toReview: "state-id-here",
        toDone: "state-id-here"
      },
      customPatterns: {
        inProgress: ["custom-pattern"],
        review: ["custom-pattern"]
      },
      issueUrlPattern: "https://linear.app/team/issue/{{id}}"
    };
  }
}

/**
 * PROS:
 * - Works across PM tools with same code
 * - Smart defaults that usually work
 * - Optional overrides for customization
 * - No config required to start
 * - Learns from usage patterns
 * 
 * CONS:
 * - Pattern matching might miss edge cases
 * - Still needs API access to PM tool
 * - Conventions might not fit all workflows
 */

module.exports = { ConventionBasedAdapter };