#!/usr/bin/env node
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
      console.log(`Using team: ${teams.nodes[0].name}`);
    }

    const issue = await linear.createIssue({
      title,
      description,
      priority,
      teamId,
    });

    console.log(`✅ Created issue: ${issue.issue.identifier}`);
    console.log(`   URL: ${issue.issue.url}`);
  } catch (error) {
    console.error('❌ Error creating issue:', error.message);
    process.exit(1);
  }
}

createIssue();
