#!/usr/bin/env node

/**
 * Release Utilities - Shared helper functions for release scripts
 *
 * Provides git, GitHub API, NPM registry, and conventional commit utilities
 * used across release:prepare, release:check, and release:publish scripts.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { Octokit } from '@octokit/rest';

/**
 * Git Utilities
 */

/**
 * Check if there are uncommitted changes in the working directory
 * @returns {boolean} True if there are uncommitted changes
 */
export function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    return status.trim().length > 0;
  } catch (error) {
    throw new Error(`Failed to check git status: ${error.message}`);
  }
}

/**
 * Get the current git branch name
 * @returns {string} Current branch name
 */
export function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch (error) {
    throw new Error(`Failed to get current branch: ${error.message}`);
  }
}

/**
 * Get the most recent git tag
 * @returns {string|null} Most recent tag or null if no tags exist
 */
export function getLatestTag() {
  try {
    const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
    return tag || null;
  } catch (error) {
    // No tags exist yet
    return null;
  }
}

/**
 * Get git commits since a given tag
 * @param {string|null} since - Tag to start from (or null for all commits)
 * @returns {Array<{hash: string, message: string}>} Array of commit objects
 */
export function getCommitsSince(since) {
  try {
    // If no tag exists, get commits from the last release date in CHANGELOG
    // This prevents including the entire repository history
    let range;
    if (since) {
      range = `${since}..HEAD`;
    } else {
      // When no tags exist, default to commits since the last release date
      // Parse CHANGELOG.md to find the most recent release date
      try {
        const changelogPath = './CHANGELOG.md';
        const changelog = readFileSync(changelogPath, 'utf-8');
        const releaseMatch = changelog.match(/## \[[\d.a-z-]+\] - (\d{4}-\d{2}-\d{2})/);
        if (releaseMatch) {
          const lastReleaseDate = releaseMatch[1];
          range = `--since="${lastReleaseDate}" HEAD`;
        } else {
          // Fallback: last 30 days if no release found
          range = '--since="30 days ago" HEAD';
        }
      } catch (err) {
        // Fallback: last 30 days if CHANGELOG doesn't exist
        range = '--since="30 days ago" HEAD';
      }
    }

    const log = execSync(`git log --oneline --no-merges ${range}`, { encoding: 'utf-8' });

    if (!log.trim()) {
      return [];
    }

    return log
      .trim()
      .split('\n')
      .map((line) => {
        const match = line.match(/^(\w+)\s+(.+)$/);
        if (!match) return null;

        // Extract only the first line (before first \n\n or \n#)
        // Some commits have multi-paragraph messages in the subject line
        let message = match[2];
        const firstParagraphEnd = message.indexOf('\n\n');
        const firstMarkdownSection = message.indexOf('\n#');

        if (firstParagraphEnd !== -1) {
          message = message.substring(0, firstParagraphEnd);
        } else if (firstMarkdownSection !== -1) {
          message = message.substring(0, firstMarkdownSection);
        }

        return {
          hash: match[1],
          message: message.trim(),
        };
      })
      .filter(Boolean);
  } catch (error) {
    throw new Error(`Failed to get commits: ${error.message}`);
  }
}

/**
 * Conventional Commits Utilities
 */

/**
 * Parse a conventional commit message
 * @param {string} message - Commit message
 * @returns {{type: string, scope: string|null, subject: string, breaking: boolean}|null}
 */
export function parseConventionalCommit(message) {
  // Pattern: type(scope)!: subject
  const pattern =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\(([^)]+)\))?(!)?:\s*(.+)$/;
  const match = message.match(pattern);

  if (!match) {
    return null;
  }

  return {
    type: match[1],
    scope: match[3] || null,
    subject: match[5],
    breaking: match[4] === '!',
  };
}

/**
 * Group commits by conventional commit type
 * @param {Array<{hash: string, message: string}>} commits
 * @returns {Object} Commits grouped by type
 */
export function groupCommitsByType(commits) {
  const groups = {
    feat: [],
    fix: [],
    docs: [],
    style: [],
    refactor: [],
    perf: [],
    test: [],
    build: [],
    ci: [],
    chore: [],
    other: [],
  };

  commits.forEach((commit) => {
    const parsed = parseConventionalCommit(commit.message);
    if (parsed) {
      groups[parsed.type].push({ ...commit, parsed });
    } else {
      groups.other.push(commit);
    }
  });

  return groups;
}

/**
 * Generate CHANGELOG section from commits
 * @param {string} version - Version being released
 * @param {Array<{hash: string, message: string}>} commits
 * @returns {string} Markdown formatted CHANGELOG section
 */
export function generateChangelogSection(version, commits) {
  const grouped = groupCommitsByType(commits);
  const date = new Date().toISOString().split('T')[0];

  let changelog = `## [${version}] - ${date}\n\n`;

  // Map commit types to CHANGELOG sections
  const sections = [
    { type: 'feat', title: 'Added', items: grouped.feat },
    { type: 'fix', title: 'Fixed', items: grouped.fix },
    { type: 'docs', title: 'Documentation', items: grouped.docs },
    { type: 'refactor', title: 'Changed', items: grouped.refactor },
    { type: 'perf', title: 'Performance', items: grouped.perf },
    { type: 'build', title: 'Build System', items: grouped.build },
    { type: 'other', title: 'Other', items: grouped.other },
  ];

  sections.forEach((section) => {
    if (section.items.length > 0) {
      changelog += `### ${section.title}\n`;
      section.items.forEach((commit) => {
        const subject = commit.parsed ? commit.parsed.subject : commit.message;
        const scope = commit.parsed?.scope ? ` (${commit.parsed.scope})` : '';
        changelog += `- ${subject}${scope}\n`;
      });
      changelog += '\n';
    }
  });

  return changelog;
}

/**
 * GitHub API Utilities
 */

/**
 * Create authenticated Octokit instance
 * @returns {Octokit} Authenticated GitHub API client
 * @throws {Error} If GITHUB_TOKEN is not set
 */
export function createGitHubClient() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  return new Octokit({ auth: token });
}

/**
 * Get repository info from package.json
 * @returns {{owner: string, repo: string}} Repository owner and name
 */
export function getRepoInfo() {
  try {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
    const repoUrl = pkg.repository?.url || pkg.repository;

    if (!repoUrl) {
      throw new Error('No repository URL found in package.json');
    }

    // Parse GitHub URL (supports both https and git formats)
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL in package.json');
    }

    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  } catch (error) {
    throw new Error(`Failed to get repo info: ${error.message}`);
  }
}

/**
 * Check GitHub Actions workflow status for a tag
 * @param {string} tag - Git tag to check
 * @returns {Promise<'running'|'success'|'failure'|'not_found'>}
 */
export async function checkCIStatus(tag) {
  const octokit = createGitHubClient();
  const { owner, repo } = getRepoInfo();

  try {
    const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      event: 'push',
      per_page: 10,
    });

    // Find workflow run for this tag
    const tagRun = runs.workflow_runs.find(
      (run) => run.head_branch === tag || run.head_sha === tag
    );

    if (!tagRun) {
      return 'not_found';
    }

    if (tagRun.status === 'in_progress' || tagRun.status === 'queued') {
      return 'running';
    }

    if (tagRun.conclusion === 'success') {
      return 'success';
    }

    return 'failure';
  } catch (error) {
    throw new Error(`Failed to check CI status: ${error.message}`);
  }
}

/**
 * Get GitHub Actions workflow run URL for a tag
 * @param {string} tag - Git tag
 * @returns {Promise<string|null>} Workflow run URL or null if not found
 */
export async function getWorkflowRunUrl(tag) {
  const octokit = createGitHubClient();
  const { owner, repo } = getRepoInfo();

  try {
    const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      event: 'push',
      per_page: 10,
    });

    const tagRun = runs.workflow_runs.find(
      (run) => run.head_branch === tag || run.head_sha === tag
    );

    return tagRun ? tagRun.html_url : null;
  } catch (error) {
    return null;
  }
}

/**
 * Create a GitHub Release
 * @param {string} tag - Git tag
 * @param {string} name - Release name
 * @param {string} body - Release notes
 * @param {boolean} prerelease - Whether this is a prerelease
 * @returns {Promise<string>} URL of created release
 */
export async function createGitHubRelease(tag, name, body, prerelease = false) {
  const octokit = createGitHubClient();
  const { owner, repo } = getRepoInfo();

  try {
    // Check if release already exists
    try {
      const { data: existing } = await octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag,
      });

      // Release exists, update it
      const { data: updated } = await octokit.rest.repos.updateRelease({
        owner,
        repo,
        release_id: existing.id,
        name,
        body,
        prerelease,
      });

      return updated.html_url;
    } catch (error) {
      // Release doesn't exist, create it
      if (error.status === 404) {
        const { data: created } = await octokit.rest.repos.createRelease({
          owner,
          repo,
          tag_name: tag,
          name,
          body,
          prerelease,
        });

        return created.html_url;
      }
      throw error;
    }
  } catch (error) {
    throw new Error(`Failed to create GitHub release: ${error.message}`);
  }
}

/**
 * NPM Registry Utilities
 */

/**
 * Check if a version is already published to NPM
 * @param {string} packageName - Package name (e.g., '@hodgeson/hodge')
 * @param {string} version - Version to check
 * @returns {Promise<boolean>} True if version exists on NPM
 */
export async function isVersionPublished(packageName, version) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
      if (response.status === 404) {
        // Package doesn't exist yet
        return false;
      }
      throw new Error(`NPM registry returned ${response.status}`);
    }

    const data = await response.json();
    return version in (data.versions || {});
  } catch (error) {
    throw new Error(`Failed to check NPM registry: ${error.message}`);
  }
}

/**
 * Get package info from package.json
 * @returns {{name: string, version: string}} Package name and version
 */
export function getPackageInfo() {
  try {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
    return {
      name: pkg.name,
      version: pkg.version,
    };
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error.message}`);
  }
}

/**
 * Interactive Prompt Utilities
 */

/**
 * Show a preview and get user approval
 * @param {string} title - Preview title
 * @param {string} content - Content to preview
 * @param {string} prompt - Approval prompt
 * @returns {Promise<'yes'|'no'|'edit'>}
 */
export async function promptForApproval(title, content, prompt = 'Approve? (y/n/e)') {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));
  console.log(content);
  console.log('='.repeat(60));
  console.log(`\n${prompt}`);
  console.log('  y = yes, proceed');
  console.log('  n = no, abort');
  console.log('  e = edit manually\n');

  // Read from stdin (simplified for v1, can enhance later)
  const response = await new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim().toLowerCase());
    });
  });

  if (response === 'y' || response === 'yes') return 'yes';
  if (response === 'n' || response === 'no') return 'no';
  if (response === 'e' || response === 'edit') return 'edit';

  // Default to no on unrecognized input
  return 'no';
}
