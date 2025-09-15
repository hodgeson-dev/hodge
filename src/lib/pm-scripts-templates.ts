/**
 * PM Scripts Templates
 * Comprehensive project management scripts for all supported tools
 */

export interface PMScript {
  name: string;
  description: string;
  content: string;
}

export function getLinearScripts(): PMScript[] {
  return [
    {
      name: 'create-issue.js',
      description: 'Create a new Linear issue',
      content: `#!/usr/bin/env node
/**
 * Create Linear Issue
 * Usage: node create-issue.js "Title" "Description" [priority]
 */
'use strict';

const { LINEAR_API_KEY, LINEAR_TEAM_ID } = process.env;

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY environment variable is required');
  console.log('Get your API key from: https://linear.app/settings/api');
  process.exit(1);
}

const title = process.argv[2];
const description = process.argv[3] || '';
const priority = parseInt(process.argv[4] || '3');

if (!title) {
  console.error('Usage: node create-issue.js "Title" "Description" [priority]');
  process.exit(1);
}

async function createIssue() {
  try {
    const { LinearClient } = require('@linear/sdk');
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });
    
    // Get team if not specified
    let teamId = LINEAR_TEAM_ID;
    if (!teamId) {
      const teams = await linear.teams();
      if (teams.nodes.length === 0) {
        console.error('No teams found');
        process.exit(1);
      }
      teamId = teams.nodes[0].id;
      console.log(\`Using team: \${teams.nodes[0].name}\`);
    }
    
    const issue = await linear.createIssue({
      title,
      description,
      priority,
      teamId
    });
    
    console.log(\`✅ Created issue: \${issue.issue.identifier}\`);
    console.log(\`   URL: \${issue.issue.url}\`);
  } catch (error) {
    console.error('❌ Error creating issue:', error.message);
    process.exit(1);
  }
}

createIssue();
`,
    },
    {
      name: 'update-issue.js',
      description: 'Update Linear issue status',
      content: `#!/usr/bin/env node
/**
 * Update Linear Issue Status
 * Usage: node update-issue.js <issue-id> <status>
 * Status: backlog, todo, in_progress, in_review, done, canceled
 */
'use strict';

const { LINEAR_API_KEY } = process.env;

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY environment variable is required');
  process.exit(1);
}

const issueId = process.argv[2];
const status = process.argv[3];

if (!issueId || !status) {
  console.error('Usage: node update-issue.js <issue-id> <status>');
  console.error('Status: backlog, todo, in_progress, in_review, done, canceled');
  process.exit(1);
}

async function updateIssue() {
  try {
    const { LinearClient } = require('@linear/sdk');
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });
    
    // Fetch the issue
    const issue = await linear.issue(issueId);
    
    // Get workflow states
    const states = await linear.workflowStates({
      filter: { team: { id: { eq: issue.team.id } } }
    });
    
    // Map friendly names to actual states
    const statusMap = {
      'backlog': 'Backlog',
      'todo': 'Todo',
      'in_progress': 'In Progress',
      'in_review': 'In Review',
      'done': 'Done',
      'canceled': 'Canceled'
    };
    
    const targetStateName = statusMap[status.toLowerCase()] || status;
    const targetState = states.nodes.find(s => 
      s.name.toLowerCase() === targetStateName.toLowerCase()
    );
    
    if (!targetState) {
      console.error(\`❌ State not found: \${targetStateName}\`);
      console.error('Available states:', states.nodes.map(s => s.name).join(', '));
      process.exit(1);
    }
    
    await linear.updateIssue(issue.id, { stateId: targetState.id });
    console.log(\`✅ Updated \${issueId} to \${targetState.name}\`);
  } catch (error) {
    console.error('❌ Error updating issue:', error.message);
    process.exit(1);
  }
}

updateIssue();
`,
    },
    {
      name: 'fetch-issue.js',
      description: 'Fetch Linear issue details',
      content: `#!/usr/bin/env node
/**
 * Fetch Linear Issue Details
 * Usage: node fetch-issue.js <issue-id>
 */
'use strict';

const { LINEAR_API_KEY } = process.env;

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY environment variable is required');
  process.exit(1);
}

const issueId = process.argv[2];

if (!issueId) {
  console.error('Usage: node fetch-issue.js <issue-id>');
  process.exit(1);
}

async function fetchIssue() {
  try {
    const { LinearClient } = require('@linear/sdk');
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });
    
    const issue = await linear.issue(issueId);
    const state = await issue.state;
    const assignee = await issue.assignee;
    const labels = await issue.labels();
    
    console.log('📋 Issue Details');
    console.log(\`   ID: \${issue.identifier}\`);
    console.log(\`   Title: \${issue.title}\`);
    console.log(\`   State: \${state?.name || 'Unknown'}\`);
    console.log(\`   Priority: \${issue.priority}\`);
    console.log(\`   Assignee: \${assignee?.name || 'Unassigned'}\`);
    console.log(\`   Labels: \${labels.nodes.map(l => l.name).join(', ') || 'None'}\`);
    console.log(\`   URL: \${issue.url}\`);
    
    if (issue.description) {
      console.log('\\n📝 Description:');
      console.log(issue.description);
    }
  } catch (error) {
    console.error('❌ Error fetching issue:', error.message);
    process.exit(1);
  }
}

fetchIssue();
`,
    },
    {
      name: 'create-project.js',
      description: 'Create a new Linear project',
      content: `#!/usr/bin/env node
/**
 * Create Linear Project
 * Usage: node create-project.js "Project Name" "Description"
 */
'use strict';

const { LINEAR_API_KEY, LINEAR_TEAM_ID } = process.env;

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY environment variable is required');
  process.exit(1);
}

const name = process.argv[2];
const description = process.argv[3] || '';

if (!name) {
  console.error('Usage: node create-project.js "Project Name" "Description"');
  process.exit(1);
}

async function createProject() {
  try {
    const { LinearClient } = require('@linear/sdk');
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });
    
    let teamId = LINEAR_TEAM_ID;
    if (!teamId) {
      const teams = await linear.teams();
      teamId = teams.nodes[0]?.id;
    }
    
    const project = await linear.createProject({
      name,
      description,
      teamIds: [teamId]
    });
    
    console.log(\`✅ Created project: \${project.project.name}\`);
    console.log(\`   ID: \${project.project.id}\`);
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  }
}

createProject();
`,
    },
    {
      name: 'add-comment.js',
      description: 'Add comment to Linear issue',
      content: `#!/usr/bin/env node
/**
 * Add Comment to Linear Issue
 * Usage: node add-comment.js <issue-id> <comment>
 */
'use strict';

const { LINEAR_API_KEY } = process.env;

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY environment variable is required');
  process.exit(1);
}

const issueId = process.argv[2];
const comment = process.argv.slice(3).join(' ') || process.argv[3];

if (!issueId || !comment) {
  console.error('Usage: node add-comment.js <issue-id> <comment>');
  console.error('Example: node add-comment.js HOD-20 "Decision made: using lightweight pattern"');
  process.exit(1);
}

async function addComment() {
  try {
    const { LinearClient } = require('@linear/sdk');
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

    // Create comment on the issue
    await linear.createComment({
      issueId: issueId,
      body: comment
    });

    console.log(\`✅ Comment added to \${issueId}\`);
  } catch (error) {
    console.error('❌ Error adding comment:', error.message);
    process.exit(1);
  }
}

addComment();
`,
    },
  ];
}

export function getGitHubScripts(): PMScript[] {
  return [
    {
      name: 'create-issue.js',
      description: 'Create a new GitHub issue',
      content: `#!/usr/bin/env node
/**
 * Create GitHub Issue
 * Usage: node create-issue.js "Title" "Body" [labels]
 */
'use strict';

const fs = require('fs');
const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.log('Create a token at: https://github.com/settings/tokens');
  process.exit(1);
}

const title = process.argv[2];
const body = process.argv[3] || '';
const labels = process.argv[4]?.split(',') || [];

if (!title) {
  console.error('Usage: node create-issue.js "Title" "Body" [labels]');
  process.exit(1);
}

async function createIssue() {
  try {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    // Get repo info from environment or config
    let owner = GITHUB_OWNER;
    let repo = GITHUB_REPO;
    
    if (!owner || !repo) {
      // Try to read from .git/config instead of using execSync
      try {
        const gitConfig = fs.readFileSync('.git/config', 'utf8');
        const remoteMatch = gitConfig.match(/url = .*github\\.com[:/]([^/]+)\\/(.+?)(\\.git)?$/m);
        if (remoteMatch) {
          owner = remoteMatch[1];
          repo = remoteMatch[2];
        }
      } catch (e) {
        // Git config not readable
      }
      
      if (!owner || !repo) {
        console.error('Could not detect GitHub repo. Set GITHUB_OWNER and GITHUB_REPO environment variables.');
        console.error('Example: GITHUB_OWNER=myorg GITHUB_REPO=myrepo');
        process.exit(1);
      }
    }
    
    const { data } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels
    });
    
    console.log(\`✅ Created issue #\${data.number}\`);
    console.log(\`   URL: \${data.html_url}\`);
  } catch (error) {
    console.error('❌ Error creating issue:', error.message);
    process.exit(1);
  }
}

createIssue();
`,
    },
    {
      name: 'update-issue.js',
      description: 'Update GitHub issue status',
      content: `#!/usr/bin/env node
/**
 * Update GitHub Issue
 * Usage: node update-issue.js <issue-number> <state>
 * State: open, closed
 */
'use strict';

const fs = require('fs');
const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const issueNumber = parseInt(process.argv[2]);
const state = process.argv[3];

if (!issueNumber || !state) {
  console.error('Usage: node update-issue.js <issue-number> <state>');
  console.error('State: open, closed');
  process.exit(1);
}

async function updateIssue() {
  try {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    let owner = GITHUB_OWNER;
    let repo = GITHUB_REPO;
    
    if (!owner || !repo) {
      // Try to read from .git/config instead of using execSync
      try {
        const gitConfig = fs.readFileSync('.git/config', 'utf8');
        const remoteMatch = gitConfig.match(/url = .*github\\.com[:/]([^/]+)\\/(.+?)(\\.git)?$/m);
        if (remoteMatch) {
          owner = remoteMatch[1];
          repo = remoteMatch[2];
        }
      } catch (e) {
        // Git config not readable
      }
    }
    
    await octokit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state
    });
    
    console.log(\`✅ Updated issue #\${issueNumber} to \${state}\`);
  } catch (error) {
    console.error('❌ Error updating issue:', error.message);
    process.exit(1);
  }
}

updateIssue();
`,
    },
    {
      name: 'create-milestone.js',
      description: 'Create a GitHub milestone',
      content: `#!/usr/bin/env node
/**
 * Create GitHub Milestone
 * Usage: node create-milestone.js "Title" "Description" [due_date]
 */
'use strict';

const fs = require('fs');
const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const title = process.argv[2];
const description = process.argv[3] || '';
const dueDate = process.argv[4]; // Format: YYYY-MM-DD

if (!title) {
  console.error('Usage: node create-milestone.js "Title" "Description" [YYYY-MM-DD]');
  process.exit(1);
}

async function createMilestone() {
  try {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    let owner = GITHUB_OWNER;
    let repo = GITHUB_REPO;
    
    if (!owner || !repo) {
      // Try to read from .git/config instead of using execSync
      try {
        const gitConfig = fs.readFileSync('.git/config', 'utf8');
        const remoteMatch = gitConfig.match(/url = .*github\\.com[:/]([^/]+)\\/(.+?)(\\.git)?$/m);
        if (remoteMatch) {
          owner = remoteMatch[1];
          repo = remoteMatch[2];
        }
      } catch (e) {
        // Git config not readable
      }
    }
    
    const params = {
      owner,
      repo,
      title,
      description
    };
    
    if (dueDate) {
      params.due_on = new Date(dueDate).toISOString();
    }
    
    const { data } = await octokit.issues.createMilestone(params);
    
    console.log(\`✅ Created milestone: \${data.title}\`);
    console.log(\`   Number: \${data.number}\`);
    console.log(\`   URL: \${data.html_url}\`);
  } catch (error) {
    console.error('❌ Error creating milestone:', error.message);
    process.exit(1);
  }
}

createMilestone();
`,
    },
  ];
}

export function getJiraScripts(): PMScript[] {
  return [
    {
      name: 'create-issue.js',
      description: 'Create a new Jira issue',
      content: `#!/usr/bin/env node
/**
 * Create Jira Issue
 * Usage: node create-issue.js "Summary" "Description" [type] [project]
 * Type: task, bug, story, epic (default: task)
 */
'use strict';

const { JIRA_API_TOKEN, JIRA_EMAIL, JIRA_DOMAIN, JIRA_PROJECT } = process.env;

if (!JIRA_API_TOKEN || !JIRA_EMAIL || !JIRA_DOMAIN) {
  console.error('❌ Required environment variables: JIRA_API_TOKEN, JIRA_EMAIL, JIRA_DOMAIN');
  console.log('Get your API token at: https://id.atlassian.com/manage-profile/security/api-tokens');
  process.exit(1);
}

const summary = process.argv[2];
const description = process.argv[3] || '';
const issueType = process.argv[4] || 'Task';
const project = process.argv[5] || JIRA_PROJECT;

if (!summary) {
  console.error('Usage: node create-issue.js "Summary" "Description" [type] [project]');
  process.exit(1);
}

if (!project) {
  console.error('❌ Project key required (set JIRA_PROJECT or pass as argument)');
  process.exit(1);
}

async function createIssue() {
  try {
    const JiraClient = require('jira-client');
    const jira = new JiraClient({
      protocol: 'https',
      host: JIRA_DOMAIN,
      username: JIRA_EMAIL,
      password: JIRA_API_TOKEN,
      apiVersion: '2',
      strictSSL: true
    });
    
    const issue = await jira.addNewIssue({
      fields: {
        project: { key: project },
        summary: summary,
        description: description,
        issuetype: { name: issueType }
      }
    });
    
    console.log(\`✅ Created issue: \${issue.key}\`);
    console.log(\`   URL: https://\${JIRA_DOMAIN}/browse/\${issue.key}\`);
  } catch (error) {
    console.error('❌ Error creating issue:', error.message);
    process.exit(1);
  }
}

createIssue();
`,
    },
    {
      name: 'update-issue.js',
      description: 'Update Jira issue status',
      content: `#!/usr/bin/env node
/**
 * Update Jira Issue Status
 * Usage: node update-issue.js <issue-key> <status>
 * Status: todo, in_progress, done (or exact transition name)
 */
'use strict';

const { JIRA_API_TOKEN, JIRA_EMAIL, JIRA_DOMAIN } = process.env;

if (!JIRA_API_TOKEN || !JIRA_EMAIL || !JIRA_DOMAIN) {
  console.error('❌ Required: JIRA_API_TOKEN, JIRA_EMAIL, JIRA_DOMAIN');
  process.exit(1);
}

const issueKey = process.argv[2];
const status = process.argv[3];

if (!issueKey || !status) {
  console.error('Usage: node update-issue.js <issue-key> <status>');
  process.exit(1);
}

async function updateIssue() {
  try {
    const JiraClient = require('jira-client');
    const jira = new JiraClient({
      protocol: 'https',
      host: JIRA_DOMAIN,
      username: JIRA_EMAIL,
      password: JIRA_API_TOKEN,
      apiVersion: '2',
      strictSSL: true
    });
    
    // Get available transitions
    const transitions = await jira.listTransitions(issueKey);
    
    // Map friendly names
    const statusMap = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'done': 'Done'
    };
    
    const targetStatus = statusMap[status.toLowerCase()] || status;
    const transition = transitions.transitions.find(t => 
      t.name.toLowerCase() === targetStatus.toLowerCase()
    );
    
    if (!transition) {
      console.error(\`❌ Status not found: \${targetStatus}\`);
      console.error('Available:', transitions.transitions.map(t => t.name).join(', '));
      process.exit(1);
    }
    
    await jira.transitionIssue(issueKey, { 
      transition: { id: transition.id } 
    });
    
    console.log(\`✅ Updated \${issueKey} to \${transition.name}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateIssue();
`,
    },
    {
      name: 'create-epic.js',
      description: 'Create a Jira epic',
      content: `#!/usr/bin/env node
/**
 * Create Jira Epic
 * Usage: node create-epic.js "Epic Name" "Description" [project]
 */
'use strict';

const { JIRA_API_TOKEN, JIRA_EMAIL, JIRA_DOMAIN, JIRA_PROJECT } = process.env;

if (!JIRA_API_TOKEN || !JIRA_EMAIL || !JIRA_DOMAIN) {
  console.error('❌ Required: JIRA_API_TOKEN, JIRA_EMAIL, JIRA_DOMAIN');
  process.exit(1);
}

const epicName = process.argv[2];
const description = process.argv[3] || '';
const project = process.argv[4] || JIRA_PROJECT;

if (!epicName || !project) {
  console.error('Usage: node create-epic.js "Epic Name" "Description" [project]');
  process.exit(1);
}

async function createEpic() {
  try {
    const JiraClient = require('jira-client');
    const jira = new JiraClient({
      protocol: 'https',
      host: JIRA_DOMAIN,
      username: JIRA_EMAIL,
      password: JIRA_API_TOKEN,
      apiVersion: '2',
      strictSSL: true
    });
    
    const epic = await jira.addNewIssue({
      fields: {
        project: { key: project },
        summary: epicName,
        description: description,
        issuetype: { name: 'Epic' },
        customfield_10011: epicName // Epic name field
      }
    });
    
    console.log(\`✅ Created epic: \${epic.key}\`);
    console.log(\`   URL: https://\${JIRA_DOMAIN}/browse/\${epic.key}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createEpic();
`,
    },
  ];
}

export function getTrelloScripts(): PMScript[] {
  return [
    {
      name: 'create-card.js',
      description: 'Create a new Trello card',
      content: `#!/usr/bin/env node
/**
 * Create Trello Card
 * Usage: node create-card.js "Name" "Description" [list-id]
 */
'use strict';

const { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_LIST_ID } = process.env;

if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
  console.error('❌ Required: TRELLO_API_KEY, TRELLO_TOKEN');
  console.log('Get your API key at: https://trello.com/app-key');
  process.exit(1);
}

const name = process.argv[2];
const desc = process.argv[3] || '';
const listId = process.argv[4] || TRELLO_LIST_ID;

if (!name) {
  console.error('Usage: node create-card.js "Name" "Description" [list-id]');
  process.exit(1);
}

if (!listId) {
  console.error('❌ List ID required (set TRELLO_LIST_ID or pass as argument)');
  console.log('Find list ID: Open board > Add card > Copy URL > Extract ID from URL');
  process.exit(1);
}

async function createCard() {
  try {
    const Trello = require('node-trello');
    const trello = new Trello(TRELLO_API_KEY, TRELLO_TOKEN);
    
    const card = await new Promise((resolve, reject) => {
      trello.post('/1/cards', {
        name: name,
        desc: desc,
        idList: listId
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    console.log(\`✅ Created card: \${card.name}\`);
    console.log(\`   URL: \${card.url}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createCard();
`,
    },
    {
      name: 'move-card.js',
      description: 'Move Trello card to another list',
      content: `#!/usr/bin/env node
/**
 * Move Trello Card
 * Usage: node move-card.js <card-id> <list-id>
 */
'use strict';

const { TRELLO_API_KEY, TRELLO_TOKEN } = process.env;

if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
  console.error('❌ Required: TRELLO_API_KEY, TRELLO_TOKEN');
  process.exit(1);
}

const cardId = process.argv[2];
const listId = process.argv[3];

if (!cardId || !listId) {
  console.error('Usage: node move-card.js <card-id> <list-id>');
  process.exit(1);
}

async function moveCard() {
  try {
    const Trello = require('node-trello');
    const trello = new Trello(TRELLO_API_KEY, TRELLO_TOKEN);
    
    await new Promise((resolve, reject) => {
      trello.put(\`/1/cards/\${cardId}\`, {
        idList: listId
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    console.log(\`✅ Moved card \${cardId} to list \${listId}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

moveCard();
`,
    },
    {
      name: 'create-board.js',
      description: 'Create a new Trello board',
      content: `#!/usr/bin/env node
/**
 * Create Trello Board
 * Usage: node create-board.js "Board Name" [description]
 */
'use strict';

const { TRELLO_API_KEY, TRELLO_TOKEN } = process.env;

if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
  console.error('❌ Required: TRELLO_API_KEY, TRELLO_TOKEN');
  process.exit(1);
}

const name = process.argv[2];
const desc = process.argv[3] || '';

if (!name) {
  console.error('Usage: node create-board.js "Board Name" [description]');
  process.exit(1);
}

async function createBoard() {
  try {
    const Trello = require('node-trello');
    const trello = new Trello(TRELLO_API_KEY, TRELLO_TOKEN);
    
    const board = await new Promise((resolve, reject) => {
      trello.post('/1/boards', {
        name: name,
        desc: desc,
        defaultLists: true
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    console.log(\`✅ Created board: \${board.name}\`);
    console.log(\`   ID: \${board.id}\`);
    console.log(\`   URL: \${board.url}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createBoard();
`,
    },
  ];
}

export function getAsanaScripts(): PMScript[] {
  return [
    {
      name: 'create-task.js',
      description: 'Create a new Asana task',
      content: `#!/usr/bin/env node
/**
 * Create Asana Task
 * Usage: node create-task.js "Name" "Notes" [project-id]
 */
'use strict';

const { ASANA_TOKEN, ASANA_PROJECT_ID, ASANA_WORKSPACE_ID } = process.env;

if (!ASANA_TOKEN) {
  console.error('❌ ASANA_TOKEN environment variable is required');
  console.log('Get your token at: https://app.asana.com/0/developer-console');
  process.exit(1);
}

const name = process.argv[2];
const notes = process.argv[3] || '';
const projectId = process.argv[4] || ASANA_PROJECT_ID;

if (!name) {
  console.error('Usage: node create-task.js "Name" "Notes" [project-id]');
  process.exit(1);
}

async function createTask() {
  try {
    const asana = require('asana');
    const client = asana.Client.create().useAccessToken(ASANA_TOKEN);
    
    const taskData = {
      name: name,
      notes: notes
    };
    
    if (projectId) {
      taskData.projects = [projectId];
    } else if (ASANA_WORKSPACE_ID) {
      taskData.workspace = ASANA_WORKSPACE_ID;
    } else {
      // Get first workspace
      const workspaces = await client.workspaces.findAll();
      const workspace = workspaces.data[0];
      if (!workspace) {
        console.error('❌ No workspace found');
        process.exit(1);
      }
      taskData.workspace = workspace.gid;
    }
    
    const task = await client.tasks.create(taskData);
    
    console.log(\`✅ Created task: \${task.name}\`);
    console.log(\`   ID: \${task.gid}\`);
    console.log(\`   URL: \${task.permalink_url}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTask();
`,
    },
    {
      name: 'update-task.js',
      description: 'Update Asana task status',
      content: `#!/usr/bin/env node
/**
 * Update Asana Task
 * Usage: node update-task.js <task-id> <completed>
 * completed: true or false
 */
'use strict';

const { ASANA_TOKEN } = process.env;

if (!ASANA_TOKEN) {
  console.error('❌ ASANA_TOKEN environment variable is required');
  process.exit(1);
}

const taskId = process.argv[2];
const completed = process.argv[3] === 'true';

if (!taskId || process.argv[3] === undefined) {
  console.error('Usage: node update-task.js <task-id> <true|false>');
  process.exit(1);
}

async function updateTask() {
  try {
    const asana = require('asana');
    const client = asana.Client.create().useAccessToken(ASANA_TOKEN);
    
    await client.tasks.update(taskId, {
      completed: completed
    });
    
    console.log(\`✅ Updated task \${taskId}: completed=\${completed}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateTask();
`,
    },
    {
      name: 'create-project.js',
      description: 'Create a new Asana project',
      content: `#!/usr/bin/env node
/**
 * Create Asana Project
 * Usage: node create-project.js "Name" "Notes" [workspace-id]
 */
'use strict';

const { ASANA_TOKEN, ASANA_WORKSPACE_ID } = process.env;

if (!ASANA_TOKEN) {
  console.error('❌ ASANA_TOKEN environment variable is required');
  process.exit(1);
}

const name = process.argv[2];
const notes = process.argv[3] || '';
const workspaceId = process.argv[4] || ASANA_WORKSPACE_ID;

if (!name) {
  console.error('Usage: node create-project.js "Name" "Notes" [workspace-id]');
  process.exit(1);
}

async function createProject() {
  try {
    const asana = require('asana');
    const client = asana.Client.create().useAccessToken(ASANA_TOKEN);
    
    let workspace = workspaceId;
    if (!workspace) {
      const workspaces = await client.workspaces.findAll();
      workspace = workspaces.data[0]?.gid;
      if (!workspace) {
        console.error('❌ No workspace found');
        process.exit(1);
      }
    }
    
    const project = await client.projects.create({
      name: name,
      notes: notes,
      workspace: workspace
    });
    
    console.log(\`✅ Created project: \${project.name}\`);
    console.log(\`   ID: \${project.gid}\`);
    console.log(\`   URL: https://app.asana.com/0/\${project.gid}\`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createProject();
`,
    },
  ];
}

export function getCommonScripts(): PMScript[] {
  return [
    {
      name: 'pm-status.js',
      description: 'Check PM tool configuration status',
      content: `#!/usr/bin/env node
/**
 * PM Tool Status Check
 * Verifies that your PM tool is properly configured
 */
'use strict';

const pmTools = {
  linear: {
    name: 'Linear',
    envVars: ['LINEAR_API_KEY', 'LINEAR_TEAM_ID'],
    setupUrl: 'https://linear.app/settings/api'
  },
  github: {
    name: 'GitHub',
    envVars: ['GITHUB_TOKEN'],
    setupUrl: 'https://github.com/settings/tokens'
  },
  jira: {
    name: 'Jira',
    envVars: ['JIRA_API_TOKEN', 'JIRA_EMAIL', 'JIRA_DOMAIN'],
    setupUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens'
  },
  trello: {
    name: 'Trello',
    envVars: ['TRELLO_API_KEY', 'TRELLO_TOKEN'],
    setupUrl: 'https://trello.com/app-key'
  },
  asana: {
    name: 'Asana',
    envVars: ['ASANA_TOKEN'],
    setupUrl: 'https://app.asana.com/0/developer-console'
  }
};

// Detect which PM tool is configured
let configuredTool = null;
for (const [key, tool] of Object.entries(pmTools)) {
  const hasAllVars = tool.envVars.every(v => process.env[v]);
  if (hasAllVars) {
    configuredTool = key;
    break;
  }
}

if (!configuredTool) {
  console.log('❌ No PM tool is fully configured');
  console.log('\\nTo configure a PM tool, set the required environment variables:');
  
  for (const [key, tool] of Object.entries(pmTools)) {
    console.log(\`\\n\${tool.name}:\`);
    tool.envVars.forEach(v => {
      const isSet = process.env[v] ? '✅' : '❌';
      console.log(\`  \${isSet} \${v}\`);
    });
    console.log(\`  Setup: \${tool.setupUrl}\`);
  }
} else {
  const tool = pmTools[configuredTool];
  console.log(\`✅ \${tool.name} is configured\`);
  console.log('\\nEnvironment variables:');
  tool.envVars.forEach(v => {
    console.log(\`  ✅ \${v} is set\`);
  });
  console.log(\`\\nYou can use the \${configuredTool} scripts in this directory.\`);
}
`,
    },
    {
      name: 'install-dependencies.js',
      description: 'Install PM tool dependencies',
      content: `#!/usr/bin/env node
/**
 * Install PM Tool Dependencies
 * Shows the necessary npm packages for your PM tool
 */
'use strict';

const fs = require('fs');
const path = require('path');

const dependencies = {
  linear: ['@linear/sdk'],
  github: ['@octokit/rest'],
  jira: ['jira-client'],
  trello: ['node-trello'],
  asana: ['asana']
};

// Check which PM tool is configured
let pmTool;
try {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf8')
  );
  pmTool = config.pmTool;
} catch (error) {
  console.error('❌ Could not read config.json');
  console.error('   Run "hodge init" first to configure your PM tool');
  process.exit(1);
}

if (!pmTool || pmTool === 'custom') {
  console.log('No standard PM tool configured');
  process.exit(0);
}

const deps = dependencies[pmTool];
if (!deps || deps.length === 0) {
  console.log(\`No dependencies needed for \${pmTool}\`);
  process.exit(0);
}

console.log(\`📦 Dependencies needed for \${pmTool}:\`);
console.log(\`   \${deps.join(', ')}\`);
console.log('');
console.log('To install, run:');
console.log(\`   npm install \${deps.join(' ')}\`);
console.log('');
console.log('Or if using yarn:');
console.log(\`   yarn add \${deps.join(' ')}\`);
console.log('');
console.log('Or if using pnpm:');
console.log(\`   pnpm add \${deps.join(' ')}\`);
`,
    },
  ];
}
