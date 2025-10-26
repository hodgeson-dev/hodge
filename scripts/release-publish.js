#!/usr/bin/env node

/**
 * Release Publish Script
 *
 * Automates steps 6-7 of the release workflow:
 * 1. Check CI validation status
 * 2. Publish to NPM (if CI passed)
 * 3. Create GitHub Release
 *
 * Usage:
 *   npm run release:publish
 *   npm run release:publish -- v0.1.0-alpha.2  (publish specific version)
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import {
  checkCIStatus,
  getWorkflowRunUrl,
  createGitHubRelease,
  isVersionPublished,
  getPackageInfo,
  getRepoInfo,
} from './lib/release-utils.js';

/**
 * Extract CHANGELOG section for a specific version
 * @param {string} version - Version to extract
 * @returns {string|null} CHANGELOG section or null if not found
 */
function extractChangelogSection(version) {
  try {
    const changelog = readFileSync('./CHANGELOG.md', 'utf-8');

    // Find the section for this version
    const versionPattern = new RegExp(`## \\[${version}\\].*?(?=\\n## |$)`, 's');
    const match = changelog.match(versionPattern);

    if (!match) {
      return null;
    }

    // Clean up the section (remove version header)
    const section = match[0].replace(/^## \[.*?\].*?\n\n/, '');
    return section.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📦 Release Publish\n');

  // Get version to publish (from args or package.json)
  const { name: packageName, version } = getPackageInfo();
  const tag = process.argv[2] || `v${version}`;
  const versionOnly = tag.replace(/^v/, '');

  console.log(`Package: ${packageName}`);
  console.log(`Version: ${versionOnly}`);
  console.log(`Tag:     ${tag}\n`);

  // Step 1: Check CI status
  console.log('🔍 Checking CI validation status...');
  const ciStatus = await checkCIStatus(tag);
  const workflowUrl = await getWorkflowRunUrl(tag);

  switch (ciStatus) {
    case 'running':
      console.log('⏳ CI validation still in progress');
      if (workflowUrl) {
        console.log(`   ${workflowUrl}`);
      }
      console.log('\n   Wait for CI to complete, then run this command again');
      console.log('   Or monitor with: npm run release:check\n');
      process.exit(0);

    case 'failure':
      console.log('❌ CI validation failed');
      if (workflowUrl) {
        console.log(`   ${workflowUrl}`);
      }
      console.log('\n   Cannot publish with failing CI');
      console.log('\n   To recover:');
      console.log('   1. Fix the issue on main branch');
      console.log('   2. Clean up failed release:');
      console.log(`      git reset --hard HEAD~2  # Remove CHANGELOG and version commits`);
      console.log(`      git tag -d ${tag}         # Delete local tag`);
      console.log(`      git push origin :refs/tags/${tag}  # Delete remote tag`);
      console.log('   3. Re-run: npm run release:prepare\n');
      process.exit(1);

    case 'not_found':
      console.log('⚠️  No CI workflow found for this tag');
      console.log('\n   Proceeding with publish anyway (use caution)');
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      break;

    case 'success':
      console.log('✅ CI validation passed');
      if (workflowUrl) {
        console.log(`   ${workflowUrl}`);
      }
      console.log('');
      break;
  }

  // Step 2: Check if already published to NPM
  console.log('🔍 Checking NPM registry...');
  const alreadyPublished = await isVersionPublished(packageName, versionOnly);

  if (alreadyPublished) {
    console.log(`⚠️  Version ${versionOnly} is already published to NPM`);
    console.log('   Skipping NPM publish, proceeding to GitHub Release...\n');
  } else {
    // Step 3: Publish to NPM
    console.log(`📦 Publishing to NPM...`);

    try {
      // Determine NPM tag based on version
      const isPrerelease = versionOnly.includes('-');
      const npmTag = isPrerelease ? 'alpha' : 'latest';

      console.log(`   Tag: ${npmTag}`);

      execSync(`npm publish --tag ${npmTag}`, { stdio: 'inherit' });
      console.log(`\n✅ Published ${packageName}@${versionOnly} to NPM\n`);
    } catch (error) {
      console.error('❌ NPM publish failed');
      console.error(`   ${error.message}`);
      console.error('\n   Common issues:');
      console.error('   - Not logged in to NPM: npm login');
      console.error('   - No publish access: contact package owner');
      console.error('   - Network error: check connection and retry\n');
      process.exit(1);
    }
  }

  // Step 4: Create GitHub Release
  console.log('📝 Creating GitHub Release...');

  // Extract CHANGELOG section for release notes
  const releaseNotes = extractChangelogSection(versionOnly);
  const releaseName = `Release ${versionOnly}`;
  const isPrerelease = versionOnly.includes('-');

  try {
    const releaseUrl = await createGitHubRelease(
      tag,
      releaseName,
      releaseNotes || `Release ${versionOnly}\n\nSee [CHANGELOG.md](./CHANGELOG.md) for details.`,
      isPrerelease
    );

    console.log(`✅ Created GitHub Release`);
    console.log(`   ${releaseUrl}\n`);
  } catch (error) {
    console.error('❌ Failed to create GitHub Release');
    console.error(`   ${error.message}`);
    console.error('\n   Package was published to NPM successfully,');
    console.error("   but you'll need to create the GitHub Release manually:\n");
    const { owner, repo } = getRepoInfo();
    console.error(`   https://github.com/${owner}/${repo}/releases/new?tag=${tag}\n`);
  }

  // Step 5: Success summary
  console.log('════════════════════════════════════════════════════════════');
  console.log('🎉 Release published successfully!');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`\nPackage: ${packageName}@${versionOnly}`);
  console.log(`NPM:     https://www.npmjs.com/package/${packageName}/v/${versionOnly}`);

  const { owner, repo } = getRepoInfo();
  console.log(`GitHub:  https://github.com/${owner}/${repo}/releases/tag/${tag}\n`);

  console.log('🚀 Users can now install with:');
  if (isPrerelease) {
    console.log(`   npm install -g ${packageName}@alpha\n`);
  } else {
    console.log(`   npm install -g ${packageName}\n`);
  }
}

// Run main with error handling
main().catch((error) => {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
});
