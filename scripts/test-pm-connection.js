#!/usr/bin/env node

/**
 * Test PM tool connection and configuration
 */

require('dotenv').config();
const { validatePMEnvironment, printValidationResults } = require('../dist/src/lib');

console.log('🔍 Testing PM Tool Connection\n');

// Validate environment
const config = validatePMEnvironment();
printValidationResults(config);

if (!config.isValid) {
  process.exit(1);
}

// If valid, try to create adapter
const { getPMAdapterFromEnv } = require('../dist/src/lib');

const adapter = getPMAdapterFromEnv();
if (adapter) {
  console.log('\n✅ PM adapter created successfully');
  console.log('   You can now use Hodge PM integration features');

  // Note: We can't test actual API calls without LINEAR_TEAM_ID
  if (!process.env.LINEAR_TEAM_ID) {
    console.log('\n⚠️  Note: LINEAR_TEAM_ID is not set');
    console.log('   Run the create-linear-project.js script to find your team ID');
  }
} else {
  console.log('\n❌ Failed to create PM adapter');
  process.exit(1);
}
