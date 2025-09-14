/**
 * Approach 1: Explicit Configuration File
 * User defines PM tool settings in .hodge/pm-config.json
 */

// Example configuration structure
const pmConfig = {
  tool: 'linear',
  connection: {
    apiKey: process.env.LINEAR_API_KEY,
    teamId: process.env.LINEAR_TEAM_ID
  },
  workflows: {
    default: {
      states: [
        { id: 'backlog', name: 'Backlog', type: 'unstarted' },
        { id: 'todo', name: 'Todo', type: 'unstarted' },
        { id: 'in_progress', name: 'In Progress', type: 'started' },
        { id: 'review', name: 'In Review', type: 'started' },
        { id: 'done', name: 'Done', type: 'completed' },
        { id: 'canceled', name: 'Canceled', type: 'canceled' }
      ],
      transitions: {
        start: ['backlog', 'todo', 'in_progress'],
        complete: ['in_progress', 'review', 'done'],
        cancel: ['*', 'canceled']
      }
    }
  },
  mappings: {
    hodgeModes: {
      explore: ['backlog', 'todo'],
      build: ['in_progress'],
      harden: ['review'],
      ship: ['done']
    }
  }
};

class ExplicitConfigAdapter {
  constructor(config) {
    this.config = config;
  }

  async moveToInProgress(issueId) {
    const targetState = this.config.workflows.default.states.find(
      s => s.type === 'started' && s.id === 'in_progress'
    );
    
    // Would call Linear API here
    console.log(`Moving issue ${issueId} to ${targetState.name}`);
  }

  async moveToDone(issueId) {
    const targetState = this.config.workflows.default.states.find(
      s => s.type === 'completed'
    );
    
    // Would call Linear API here
    console.log(`Moving issue ${issueId} to ${targetState.name}`);
  }

  getStateForMode(mode) {
    return this.config.mappings.hodgeModes[mode];
  }
}

/**
 * PROS:
 * - Full control over workflow mapping
 * - Can work with any PM tool
 * - Explicit and debuggable
 * - Can version control the config
 * 
 * CONS:
 * - Requires manual setup
 * - Config can get out of sync with PM tool
 * - Need to maintain configs for each PM tool
 */

module.exports = { ExplicitConfigAdapter };