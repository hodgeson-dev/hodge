#!/usr/bin/env node
/**
 * PM Tool Status Check
 * Verifies that your PM tool is properly configured
 */
'use strict';

const pmTools = {
  linear: {
    name: 'Linear',
    envVars: ['LINEAR_API_KEY', 'LINEAR_TEAM_ID'],
    setupUrl: 'https://linear.app/settings/api',
  },
  github: {
    name: 'GitHub',
    envVars: ['GITHUB_TOKEN'],
    setupUrl: 'https://github.com/settings/tokens',
  },
  jira: {
    name: 'Jira',
    envVars: ['JIRA_API_TOKEN', 'JIRA_EMAIL', 'JIRA_DOMAIN'],
    setupUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
  },
  trello: {
    name: 'Trello',
    envVars: ['TRELLO_API_KEY', 'TRELLO_TOKEN'],
    setupUrl: 'https://trello.com/app-key',
  },
  asana: {
    name: 'Asana',
    envVars: ['ASANA_TOKEN'],
    setupUrl: 'https://app.asana.com/0/developer-console',
  },
};

// Detect which PM tool is configured
let configuredTool = null;
for (const [key, tool] of Object.entries(pmTools)) {
  const hasAllVars = tool.envVars.every((v) => process.env[v]);
  if (hasAllVars) {
    configuredTool = key;
    break;
  }
}

if (!configuredTool) {
  console.log('❌ No PM tool is fully configured');
  console.log('\nTo configure a PM tool, set the required environment variables:');

  for (const [key, tool] of Object.entries(pmTools)) {
    console.log(`\n${tool.name}:`);
    tool.envVars.forEach((v) => {
      const isSet = process.env[v] ? '✅' : '❌';
      console.log(`  ${isSet} ${v}`);
    });
    console.log(`  Setup: ${tool.setupUrl}`);
  }
} else {
  const tool = pmTools[configuredTool];
  console.log(`✅ ${tool.name} is configured`);
  console.log('\nEnvironment variables:');
  tool.envVars.forEach((v) => {
    console.log(`  ✅ ${v} is set`);
  });
  console.log(`\nYou can use the ${configuredTool} scripts in this directory.`);
}
