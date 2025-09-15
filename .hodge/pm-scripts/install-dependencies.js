#!/usr/bin/env node
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
  asana: ['asana'],
};

// Check which PM tool is configured
let pmTool;
try {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf8'));
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
  console.log(`No dependencies needed for ${pmTool}`);
  process.exit(0);
}

console.log(`📦 Dependencies needed for ${pmTool}:`);
console.log(`   ${deps.join(', ')}`);
console.log('');
console.log('To install, run:');
console.log(`   npm install ${deps.join(' ')}`);
console.log('');
console.log('Or if using yarn:');
console.log(`   yarn add ${deps.join(' ')}`);
console.log('');
console.log('Or if using pnpm:');
console.log(`   pnpm add ${deps.join(' ')}`);
