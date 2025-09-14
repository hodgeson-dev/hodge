/**
 * Approach 2: Auto-Discovery via PM Tool API
 * Hodge queries the PM tool to understand available states
 */

const { LinearClient } = require('@linear/sdk');

class AutoDiscoveryAdapter {
  constructor(apiKey) {
    this.client = new LinearClient({ apiKey });
    this.workflowStates = null;
    this.stateMap = null;
  }

  async initialize() {
    // Fetch workflow states from Linear
    const team = await this.client.team(process.env.LINEAR_TEAM_ID);
    const workflows = await team.workflowStates();
    
    this.workflowStates = workflows.nodes;
    this.stateMap = this.inferStateMapping(workflows.nodes);
  }

  inferStateMapping(states) {
    // Intelligent mapping based on state names and types
    const map = {
      unstarted: [],
      started: [],
      completed: [],
      canceled: []
    };

    states.forEach(state => {
      // Linear provides a 'type' field
      map[state.type].push(state);

      // Also infer from names for better mapping
      const name = state.name.toLowerCase();
      if (name.includes('progress') || name.includes('doing')) {
        map.inProgress = state;
      }
      if (name.includes('done') || name.includes('complete')) {
        map.done = state;
      }
      if (name.includes('review') || name.includes('pr')) {
        map.review = state;
      }
    });

    return map;
  }

  async moveToInProgress(issueId) {
    if (!this.stateMap) await this.initialize();
    
    const issue = await this.client.issue(issueId);
    const targetState = this.stateMap.inProgress || 
                       this.stateMap.started[0];
    
    if (targetState) {
      await issue.update({ stateId: targetState.id });
      console.log(`Moved to ${targetState.name}`);
    } else {
      throw new Error('No in-progress state found');
    }
  }

  async moveToDone(issueId) {
    if (!this.stateMap) await this.initialize();
    
    const issue = await this.client.issue(issueId);
    const targetState = this.stateMap.done || 
                       this.stateMap.completed[0];
    
    if (targetState) {
      await issue.update({ stateId: targetState.id });
      console.log(`Moved to ${targetState.name}`);
    }
  }

  async detectCurrentState(issueId) {
    const issue = await this.client.issue(issueId);
    const state = await issue.state;
    
    // Map to Hodge modes
    if (state.type === 'unstarted') return 'explore';
    if (state.type === 'started') {
      if (state.name.toLowerCase().includes('review')) return 'harden';
      return 'build';
    }
    if (state.type === 'completed') return 'shipped';
    
    return 'unknown';
  }
}

/**
 * PROS:
 * - Always in sync with PM tool
 * - No manual configuration needed
 * - Adapts to workflow changes
 * - Can detect custom workflows
 * 
 * CONS:
 * - Requires API calls to initialize
 * - Inference might not be perfect
 * - Different for each PM tool
 * - Need fallback for offline mode
 */

module.exports = { AutoDiscoveryAdapter };