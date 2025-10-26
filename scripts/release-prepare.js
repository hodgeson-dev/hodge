#!/usr/bin/env node

/**
 * Release Prepare Script
 *
 * Automates steps 1-4 of the release workflow:
 * 1. Generate CHANGELOG from git commits
 * 2. Show preview and get approval
 * 3. Commit CHANGELOG
 * 4. Run npm version
 * 5. Push tags
 *
 * Usage:
 *   npm run release:prepare
 *   npm run release:prepare -- prerelease --preid=alpha
 *   npm run release:prepare -- patch
 *   npm run release:prepare -- minor
 *   npm run release:prepare -- major
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import {
  hasUncommittedChanges,
  getCurrentBranch,
  getLatestTag,
  getCommitsSince,
  generateChangelogSection,
  getPackageInfo,
  getWorkflowRunUrl,
  promptForApproval,
} from './lib/release-utils.js';

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Release Prepare\n');

  // Step 1: Validate preconditions
  console.log('📋 Validating preconditions...');

  if (hasUncommittedChanges()) {
    console.error('❌ Error: You have uncommitted changes');
    console.error('   Please commit or stash your changes before releasing\n');
    console.error('   git status');
    process.exit(1);
  }

  const branch = getCurrentBranch();
  if (branch !== 'main') {
    console.error(`❌ Error: You are on branch '${branch}', not 'main'`);
    console.error('   Releases must be created from the main branch\n');
    console.error('   git checkout main');
    process.exit(1);
  }

  console.log('✓ No uncommitted changes');
  console.log(`✓ On main branch\n`);

  // Step 2: Get commits since last release
  console.log('📝 Generating CHANGELOG...');
  const latestTag = getLatestTag();
  console.log(`   Last release: ${latestTag || 'none (first release)'}`);

  const commits = getCommitsSince(latestTag);
  if (commits.length === 0) {
    console.error('❌ Error: No new commits since last release');
    console.error('   Nothing to release\n');
    process.exit(1);
  }

  console.log(`   Found ${commits.length} commits\n`);

  // Step 3: Determine next version
  const versionType = process.argv[2] || 'prerelease';
  const preid = process.argv.find((arg) => arg.startsWith('--preid='))?.split('=')[1] || 'alpha';

  console.log('🔢 Calculating next version...');
  const { version: currentVersion } = getPackageInfo();
  console.log(`   Current: ${currentVersion}`);

  // Dry run to get next version
  const nextVersion = execSync(
    versionType === 'prerelease'
      ? `npm version ${versionType} --preid=${preid} --no-git-tag-version`
      : `npm version ${versionType} --no-git-tag-version`,
    { encoding: 'utf-8' }
  ).trim();

  // Revert package.json change (dry run)
  execSync(`git checkout package.json package-lock.json`);

  console.log(`   Next:    ${nextVersion}`);
  console.log(`   Type:    ${versionType}${versionType === 'prerelease' ? ` (${preid})` : ''}\n`);

  // Step 4: Generate CHANGELOG section
  const changelogSection = generateChangelogSection(nextVersion, commits);

  // Step 5: Show preview and get approval
  const approval = await promptForApproval(
    'CHANGELOG Preview',
    changelogSection,
    'Approve this CHANGELOG? (y/n/e)'
  );

  if (approval === 'no') {
    console.log('\n❌ Release cancelled by user\n');
    process.exit(1);
  }

  if (approval === 'edit') {
    console.log('\n📝 Opening CHANGELOG.md for manual editing...');
    console.log('   After editing, run this script again\n');

    // Insert the section after the "# Changelog" title
    const changelogPath = './CHANGELOG.md';
    const existingChangelog = readFileSync(changelogPath, 'utf-8');

    // Find the position after "# Changelog" header and any following blank lines
    const headerMatch = existingChangelog.match(/(# Changelog\s*\n(?:\s*\n)*)/);
    if (!headerMatch) {
      throw new Error('Could not find "# Changelog" header in CHANGELOG.md');
    }

    const headerEndIndex = headerMatch.index + headerMatch[0].length;
    const updatedChangelog =
      existingChangelog.slice(0, headerEndIndex) +
      changelogSection +
      '\n' +
      existingChangelog.slice(headerEndIndex);

    writeFileSync(changelogPath, updatedChangelog);

    // Open in editor
    const editor = process.env.EDITOR || 'vim';
    try {
      execSync(`${editor} ${changelogPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('   (Editor closed)');
    }

    console.log('\n✓ CHANGELOG.md updated');
    console.log('   Review the changes, then run this script again\n');
    process.exit(0);
  }

  // Step 6: Update CHANGELOG.md
  console.log('\n📝 Updating CHANGELOG.md...');
  const changelogPath = './CHANGELOG.md';
  const existingChangelog = readFileSync(changelogPath, 'utf-8');

  // Find the position after "# Changelog" header and any following blank lines
  const headerMatch = existingChangelog.match(/(# Changelog\s*\n(?:\s*\n)*)/);
  if (!headerMatch) {
    throw new Error('Could not find "# Changelog" header in CHANGELOG.md');
  }

  const headerEndIndex = headerMatch.index + headerMatch[0].length;
  const updatedChangelog =
    existingChangelog.slice(0, headerEndIndex) +
    changelogSection +
    '\n' +
    existingChangelog.slice(headerEndIndex);

  writeFileSync(changelogPath, updatedChangelog);
  console.log('✓ CHANGELOG.md updated\n');

  // Step 7: Commit CHANGELOG
  console.log('📦 Committing CHANGELOG...');
  execSync('git add CHANGELOG.md');
  execSync(`git commit -m "docs: update CHANGELOG for ${nextVersion}"`);
  console.log('✓ CHANGELOG committed\n');

  // Step 8: Run npm version (creates version commit and tag)
  console.log('🔖 Bumping version and creating tag...');
  execSync(
    versionType === 'prerelease'
      ? `npm version ${versionType} --preid=${preid} --message "chore: release ${nextVersion}"`
      : `npm version ${versionType} --message "chore: release ${nextVersion}"`,
    { stdio: 'inherit' }
  );
  console.log(`✓ Version bumped to ${nextVersion}\n`);

  // Step 9: Push commits and tags
  console.log('⬆️  Pushing to remote...');
  execSync('git push --follow-tags', { stdio: 'inherit' });
  console.log('✓ Pushed to remote\n');

  // Step 10: Show next steps
  console.log('════════════════════════════════════════════════════════════');
  console.log('✅ Release preparation complete!');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`\nVersion: ${nextVersion}`);
  console.log(`Tag:     v${nextVersion}`);

  // Try to get workflow URL
  const workflowUrl = await getWorkflowRunUrl(`v${nextVersion}`);
  if (workflowUrl) {
    console.log(`\n🔄 CI validation running:`);
    console.log(`   ${workflowUrl}`);
  } else {
    console.log(`\n🔄 CI validation should be running on GitHub Actions`);
  }

  console.log(`\n📊 Monitor status:`);
  console.log(`   npm run release:check`);
  console.log(`\n📦 After CI passes, publish:`);
  console.log(`   npm run release:publish\n`);
}

// Run main with error handling
main().catch((error) => {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
});
