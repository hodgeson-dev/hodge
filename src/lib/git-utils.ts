import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

/**
 * Git utilities for branch management and push operations
 */

export interface GitStatus {
  branch: string;
  remote?: string;
  ahead: number;
  behind: number;
  hasUncommitted: boolean;
  hasUntracked: boolean;
}

export interface PushResult {
  success: boolean;
  branch: string;
  remote: string;
  message?: string;
  error?: Error;
}

export interface BranchInfo {
  name: string;
  isProtected: boolean;
  type: 'main' | 'feature' | 'fix' | 'release' | 'other';
  issueId?: string;
}

/**
 * Get the current git branch name
 */
export async function getCurrentBranch(): Promise<string> {
  try {
    const { stdout } = await execAsync('git branch --show-current');
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get current branch: ${String(error)}`);
  }
}

/**
 * Get detailed git status including ahead/behind counts
 */
export async function getGitStatus(): Promise<GitStatus> {
  const branch = await getCurrentBranch();

  // Check for uncommitted changes
  const { stdout: statusOut } = await execAsync('git status --porcelain');
  const hasUncommitted = statusOut.trim().length > 0;
  const hasUntracked = statusOut.includes('??');

  // Get remote tracking branch
  let remote: string | undefined;
  let ahead = 0;
  let behind = 0;

  try {
    const { stdout: upstreamOut } = await execAsync(`git rev-parse --abbrev-ref ${branch}@{upstream} 2>/dev/null`);
    remote = upstreamOut.trim();

    // Get ahead/behind counts
    const { stdout: revListOut } = await execAsync(`git rev-list --left-right --count ${branch}...${remote} 2>/dev/null`);
    const [aheadStr, behindStr] = revListOut.trim().split('\t');
    ahead = parseInt(aheadStr, 10) || 0;
    behind = parseInt(behindStr, 10) || 0;
  } catch {
    // No upstream branch set
    remote = undefined;
  }

  return {
    branch,
    remote,
    ahead,
    behind,
    hasUncommitted,
    hasUntracked
  };
}

/**
 * Analyze branch to determine type and extract metadata
 */
export function analyzeBranch(branchName: string): BranchInfo {
  // TODO: Make protected branch patterns configurable
  const protectedBranches = ['main', 'master', 'develop', 'staging', 'production'];

  // Check if protected
  const isProtected = protectedBranches.includes(branchName);

  // Determine branch type
  let type: BranchInfo['type'] = 'other';
  if (isProtected) {
    type = 'main';
  } else if (branchName.match(/^feature\//)) {
    type = 'feature';
  } else if (branchName.match(/^(fix|bugfix|hotfix)\//)) {
    type = 'fix';
  } else if (branchName.match(/^(release|rc)\//)) {
    type = 'release';
  }

  // Extract issue ID if present
  // TODO: Make issue patterns configurable
  const issuePatterns = [
    /(?:LIN|HOD)-\d+/i,  // Linear
    /[A-Z]{2,}-\d+/,     // Jira
    /#\d+/,              // GitHub
    /PSILO-\d+/          // Custom example
  ];

  let issueId: string | undefined;
  for (const pattern of issuePatterns) {
    const match = branchName.match(pattern);
    if (match) {
      issueId = match[0];
      break;
    }
  }

  return {
    name: branchName,
    isProtected,
    type,
    issueId
  };
}

/**
 * Check if there are commits to push
 */
export async function hasCommitsToPush(): Promise<boolean> {
  const status = await getGitStatus();
  return status.ahead > 0;
}

/**
 * Execute git push with safety checks
 */
export async function gitPush(options: {
  branch?: string;
  remote?: string;
  force?: boolean;
  setUpstream?: boolean;
  dryRun?: boolean;
}): Promise<PushResult> {
  const branch = options.branch || await getCurrentBranch();
  const remote = options.remote || 'origin';

  // Build push command
  let pushCommand = `git push`;

  if (options.dryRun) {
    pushCommand += ' --dry-run';
  }

  if (options.force) {
    pushCommand += ' --force-with-lease'; // Safer than --force
  }

  if (options.setUpstream) {
    pushCommand += ' -u';
  }

  pushCommand += ` ${remote} ${branch}`;

  try {
    const { stdout, stderr } = await execAsync(pushCommand);
    const output = stdout || stderr;

    return {
      success: true,
      branch,
      remote,
      message: output.trim()
    };
  } catch (error) {
    return {
      success: false,
      branch,
      remote,
      error: error as Error,
      message: (error as Error).message
    };
  }
}

/**
 * Check if remote branch exists
 */
export async function remoteExists(branch: string, remote = 'origin'): Promise<boolean> {
  try {
    await execAsync(`git ls-remote --heads ${remote} ${branch}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch latest from remote
 */
export async function fetchRemote(remote = 'origin'): Promise<void> {
  await execAsync(`git fetch ${remote}`);
}

/**
 * Check for potential conflicts with remote
 */
export async function checkForConflicts(branch: string, remote = 'origin'): Promise<boolean> {
  try {
    // Fetch latest
    await fetchRemote(remote);

    // Try a dry-run merge to detect conflicts
    const { stdout } = await execAsync(
      `git merge-tree $(git merge-base HEAD ${remote}/${branch}) HEAD ${remote}/${branch} 2>/dev/null || echo ""`
    );

    // If output contains conflict markers, there are conflicts
    return stdout.includes('<<<<<<<');
  } catch {
    // If command fails, assume no conflicts (branch might not exist remotely)
    return false;
  }
}

/**
 * Format push preview for display
 */
export function formatPushPreview(status: GitStatus, branchInfo: BranchInfo): string {
  const lines: string[] = [];

  lines.push(chalk.bold('📤 Push Preview'));
  lines.push('');

  // Branch info
  lines.push(`Branch: ${chalk.cyan(status.branch)}`);
  if (branchInfo.isProtected) {
    lines.push(chalk.yellow('⚠️  This is a protected branch'));
  }
  if (branchInfo.issueId) {
    lines.push(`Issue: ${chalk.blue(branchInfo.issueId)}`);
  }

  // Remote info
  if (status.remote) {
    lines.push(`Remote: ${status.remote}`);
    lines.push(`Status: ${status.ahead} ahead, ${status.behind} behind`);
  } else {
    lines.push(chalk.yellow('No remote tracking branch (will create new)'));
  }

  // Warnings
  if (status.hasUncommitted) {
    lines.push('');
    lines.push(chalk.yellow('⚠️  You have uncommitted changes'));
  }

  return lines.join('\n');
}

/**
 * Generate push summary after successful push
 */
export function formatPushSummary(result: PushResult, branchInfo: BranchInfo): string {
  const lines: string[] = [];

  if (result.success) {
    lines.push(chalk.green('✅ Push successful!'));
    lines.push('');
    lines.push(`Branch: ${result.branch}`);
    lines.push(`Remote: ${result.remote}`);

    if (branchInfo.type === 'feature' || branchInfo.type === 'fix') {
      lines.push('');
      lines.push('Next steps:');
      lines.push('- Create a pull request');
      lines.push('- Request code review');
      if (branchInfo.issueId) {
        lines.push(`- Update issue ${branchInfo.issueId}`);
      }
    }
  } else {
    lines.push(chalk.red('❌ Push failed'));
    lines.push('');
    lines.push(`Error: ${result.message}`);
    lines.push('');
    lines.push('Troubleshooting:');
    lines.push('- Check your network connection');
    lines.push('- Verify remote repository permissions');
    lines.push('- Try pulling latest changes first');
  }

  return lines.join('\n');
}