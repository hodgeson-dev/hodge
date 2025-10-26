#!/usr/bin/env node

/**
 * Release Check Script
 *
 * Checks the status of GitHub Actions CI validation for the latest release tag.
 * This is an optional helper to monitor CI progress without blocking.
 *
 * Usage:
 *   npm run release:check
 *   npm run release:check -- v0.1.0-alpha.2  (check specific tag)
 */

import {
  getLatestTag,
  checkCIStatus,
  getWorkflowRunUrl,
  getPackageInfo,
} from './lib/release-utils.js';

/**
 * Format elapsed time in human-readable format
 * @param {Date} startTime - When the check started
 * @returns {string} Formatted time (e.g., "2m 15s")
 */
function formatElapsedTime(startTime) {
  const elapsedMs = Date.now() - startTime.getTime();
  const seconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 Release Check\n');

  // Get tag to check (from args or latest)
  const tag = process.argv[2] || `v${getPackageInfo().version}`;
  console.log(`Checking CI status for: ${tag}\n`);

  // Check CI status
  const status = await checkCIStatus(tag);
  const workflowUrl = await getWorkflowRunUrl(tag);

  const urlLine = workflowUrl ? `\n   ${workflowUrl}` : '';

  switch (status) {
    case 'running':
      console.log('⏳ CI validation in progress...');
      if (workflowUrl) {
        console.log(`   View progress: ${workflowUrl}`);
      }
      console.log('\n   Run this command again to check status');
      console.log('   Or wait for completion and run: npm run release:publish\n');
      break;

    case 'success':
      console.log('✅ CI validation passed!');
      if (workflowUrl) {
        console.log(`   Results: ${workflowUrl}`);
      }
      console.log('\n   Ready to publish:');
      console.log('   npm run release:publish\n');
      break;

    case 'failure':
      console.log('❌ CI validation failed');
      if (workflowUrl) {
        console.log(`   Check logs: ${workflowUrl}`);
      }
      console.log('\n   To recover:');
      console.log('   1. Fix the issue on main branch');
      console.log('   2. Clean up failed release:');
      console.log(`      git reset --hard HEAD~2  # Remove CHANGELOG and version commits`);
      console.log(`      git tag -d ${tag}         # Delete local tag`);
      console.log(`      git push origin :refs/tags/${tag}  # Delete remote tag`);
      console.log('   3. Re-run: npm run release:prepare\n');
      break;

    case 'not_found':
      console.log('⚠️  No CI workflow found for this tag');
      console.log(`   Tag: ${tag}`);
      console.log('\n   Possible reasons:');
      console.log("   1. GitHub Actions workflow hasn't started yet (wait a moment)");
      console.log("   2. Tag hasn't been pushed to GitHub");
      console.log('   3. No workflow configured for tag pushes\n');
      console.log('   Check GitHub Actions:');
      const { owner, repo } = getRepoInfo();
      console.log(`   https://github.com/${owner}/${repo}/actions\n`);
      break;
  }
}

// Inline getRepoInfo to avoid import issues
function getRepoInfo() {
  const pkg = JSON.parse(require('fs').readFileSync('./package.json', 'utf-8'));
  const repoUrl = pkg.repository?.url || pkg.repository;
  const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

// Run main with error handling
main().catch((error) => {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
});
