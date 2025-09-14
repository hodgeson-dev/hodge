#!/usr/bin/env node

/**
 * List available Linear teams and their IDs
 * Helps users find the LINEAR_TEAM_ID to use in .env
 */

const { LinearClient } = require('@linear/sdk');
const dotenv = require('dotenv');

dotenv.config();

async function listTeams() {
  if (!process.env.LINEAR_API_KEY) {
    console.error('❌ LINEAR_API_KEY is required in .env file');
    console.error('   Get your API key from: https://linear.app/settings/api');
    process.exit(1);
  }

  const linear = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
  });

  try {
    console.log('🔍 Fetching Linear teams...\n');

    const teams = await linear.teams();

    if (teams.nodes.length === 0) {
      console.log('No teams found. Make sure your API key has access to at least one team.');
      return;
    }

    console.log('Available Linear Teams:');
    console.log('─'.repeat(60));

    for (const team of teams.nodes) {
      console.log(`\n📋 Team: ${team.name}`);
      console.log(`   ID: ${team.id}`);
      console.log(`   Key: ${team.key}`);

      // Show if this is the currently configured team
      if (process.env.LINEAR_TEAM_ID === team.id) {
        console.log('   ✅ Currently configured in .env');
      }
      if (process.env.LINEAR_TEAM_NAME === team.name) {
        console.log('   📝 Matches LINEAR_TEAM_NAME in .env');
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log('\nTo use a team, add this to your .env file:');
    console.log('LINEAR_TEAM_ID=<team-id-from-above>');

    if (teams.nodes.length === 1) {
      console.log(`\nOnly one team found. Add this to your .env:`);
      console.log(`LINEAR_TEAM_ID=${teams.nodes[0].id}`);
    }
  } catch (error) {
    console.error('❌ Failed to fetch teams:', error.message);
    console.error('\nMake sure your LINEAR_API_KEY is valid and has the required permissions.');
    process.exit(1);
  }
}

listTeams();
