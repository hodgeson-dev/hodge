#!/usr/bin/env node
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
    console.log(`   ID: ${issue.identifier}`);
    console.log(`   Title: ${issue.title}`);
    console.log(`   State: ${state?.name || 'Unknown'}`);
    console.log(`   Priority: ${issue.priority}`);
    console.log(`   Assignee: ${assignee?.name || 'Unassigned'}`);
    console.log(`   Labels: ${labels.nodes.map((l) => l.name).join(', ') || 'None'}`);
    console.log(`   URL: ${issue.url}`);

    if (issue.description) {
      console.log('\n📝 Description:');
      console.log(issue.description);
    }
  } catch (error) {
    console.error('❌ Error fetching issue:', error.message);
    process.exit(1);
  }
}

fetchIssue();
