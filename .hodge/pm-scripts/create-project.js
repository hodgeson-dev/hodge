#!/usr/bin/env node
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
      teamIds: [teamId],
    });

    console.log(`✅ Created project: ${project.project.name}`);
    console.log(`   ID: ${project.project.id}`);
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  }
}

createProject();
