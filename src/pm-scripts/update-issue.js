#!/usr/bin/env node
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
      filter: { team: { id: { eq: issue.team.id } } },
    });

    // Map friendly names to actual states
    const statusMap = {
      backlog: 'Backlog',
      todo: 'Todo',
      in_progress: 'In Progress',
      in_review: 'In Review',
      done: 'Done',
      canceled: 'Canceled',
    };

    const targetStateName = statusMap[status.toLowerCase()] || status;
    const targetState = states.nodes.find(
      (s) => s.name.toLowerCase() === targetStateName.toLowerCase()
    );

    if (!targetState) {
      console.error(`❌ State not found: ${targetStateName}`);
      console.error('Available states:', states.nodes.map((s) => s.name).join(', '));
      process.exit(1);
    }

    await linear.updateIssue(issue.id, { stateId: targetState.id });
    console.log(`✅ Updated ${issueId} to ${targetState.name}`);
  } catch (error) {
    console.error('❌ Error updating issue:', error.message);
    process.exit(1);
  }
}

updateIssue();
