import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import type { GitDiffResult } from './git-diff-analyzer.js';

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
 * Get the current commit SHA (HEAD)
 * HODGE-341.2: Used for tracking commit ranges per feature
 */
export async function getCurrentCommitSHA(): Promise<string> {
  try {
    const { stdout } = await execAsync('git rev-parse HEAD');
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get current commit SHA: ${String(error)}`);
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
    const { stdout: upstreamOut } = await execAsync(
      `git rev-parse --abbrev-ref ${branch}@{upstream} 2>/dev/null`
    );
    remote = upstreamOut.trim();

    // Get ahead/behind counts
    const { stdout: revListOut } = await execAsync(
      `git rev-list --left-right --count ${branch}...${remote} 2>/dev/null`
    );
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
    hasUntracked,
  };
}

/**
 * Analyze branch to determine type and extract metadata
 */
export function analyzeBranch(branchName: string): BranchInfo {
  // TODO: [ship] Make protected branch patterns configurable
  const protectedBranches = ['main', 'master', 'develop', 'staging', 'production'];

  // Check if protected
  const isProtected = protectedBranches.includes(branchName);

  // Determine branch type using RegExp.exec() (sonarjs/prefer-regexp-exec)
  let type: BranchInfo['type'] = 'other';
  if (isProtected) {
    type = 'main';
  } else if (/^feature\//.exec(branchName)) {
    type = 'feature';
  } else if (/^(?:fix|bugfix|hotfix)\//.exec(branchName)) {
    type = 'fix';
  } else if (/^(?:release|rc)\//.exec(branchName)) {
    type = 'release';
  }

  // Extract issue ID if present
  // TODO: [ship] Make issue patterns configurable
  // Simplified patterns to avoid backtracking (sonarjs/slow-regex)
  const issuePatterns = [
    /LIN-\d+/i, // Linear (simplified - removed non-capturing group)
    /HOD-\d+/i, // Hodge
    /[A-Z]{2,10}-\d+/, // Jira (limit repetition)
    /#\d+/, // GitHub
    /PSILO-\d+/, // Custom example
  ];

  let issueId: string | undefined;
  for (const pattern of issuePatterns) {
    const match = pattern.exec(branchName);
    if (match) {
      issueId = match[0];
      break;
    }
  }

  return {
    name: branchName,
    isProtected,
    type,
    issueId,
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
  const branch = options.branch ?? (await getCurrentBranch());
  const remote = options.remote ?? 'origin';

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
      message: output.trim(),
    };
  } catch (error) {
    return {
      success: false,
      branch,
      remote,
      error: error as Error,
      message: (error as Error).message,
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

/**
 * Get list of staged files (files in git index)
 * HODGE-341.6: Used by auto-fix to scope fixes to staged files only
 */
export async function getStagedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('git diff --cached --name-only');
    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    throw new Error(`Failed to get staged files: ${String(error)}`);
  }
}

/**
 * Stage files (add to git index)
 * HODGE-341.6: Used by auto-fix to re-stage files after applying fixes
 */
export async function stageFiles(files: string[]): Promise<void> {
  if (files.length === 0) {
    return;
  }

  try {
    // Quote file paths to handle spaces/special characters
    const quotedFiles = files.map((f) => `"${f}"`).join(' ');
    await execAsync(`git add ${quotedFiles}`);
  } catch (error) {
    throw new Error(`Failed to stage files: ${String(error)}`);
  }
}

/**
 * Custom error for expected "no files found" cases in file scoping
 * HODGE-344.1: Allows callers to distinguish expected empty results from unexpected failures
 */
export class FileScopingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileScopingError';
  }
}

/**
 * Validate that a single file exists and is git-tracked
 * HODGE-344.1: Used by `hodge review --file <path>`
 *
 * @param filePath - Path to file to validate
 * @returns Array with single file path if valid
 * @throws FileScopingError if file doesn't exist or isn't git-tracked
 * @throws Error for unexpected git command failures
 */
export async function validateFile(filePath: string): Promise<string[]> {
  try {
    // Use git ls-files to check if file is tracked
    const { stdout } = await execAsync(`git ls-files "${filePath}"`);
    const trackedFiles = stdout.trim();

    if (!trackedFiles) {
      throw new FileScopingError(
        `No files to review. File not found or not git-tracked: ${filePath}`
      );
    }

    return [filePath];
  } catch (error) {
    // Re-throw FileScopingError as-is
    if (error instanceof FileScopingError) {
      throw error;
    }
    // Wrap unexpected errors
    throw new Error(`Failed to validate file: ${String(error)}`);
  }
}

/**
 * Get all git-tracked files in a directory (recursive)
 * HODGE-344.1: Used by `hodge review --directory <path>`
 *
 * Automatically respects .gitignore patterns and excludes build artifacts.
 *
 * @param directory - Directory path to search
 * @returns Array of git-tracked file paths in directory
 * @throws FileScopingError if no git-tracked files found
 * @throws Error for unexpected git command failures
 */
export async function getFilesInDirectory(directory: string): Promise<string[]> {
  try {
    // Use git ls-files to get tracked files in directory
    const { stdout } = await execAsync(`git ls-files "${directory}"`);
    const files = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (files.length === 0) {
      throw new FileScopingError(
        `No files to review. No git-tracked files in directory: ${directory}`
      );
    }

    return files;
  } catch (error) {
    // Re-throw FileScopingError as-is
    if (error instanceof FileScopingError) {
      throw error;
    }
    // Wrap unexpected errors
    throw new Error(`Failed to get files in directory: ${String(error)}`);
  }
}

/**
 * Get files modified in last N commits (excluding deleted files)
 * HODGE-344.1: Used by `hodge review --last <N>`
 *
 * Includes merge commits. Renamed files show as their new path.
 *
 * @param count - Number of commits to look back
 * @returns Array of file paths modified in last N commits
 * @throws FileScopingError if no commits or no files found
 * @throws Error for unexpected git command failures
 */
export async function getFilesFromLastNCommits(count: number): Promise<string[]> {
  // Warn for large values
  if (count > 100) {
    console.warn(
      chalk.yellow(`⚠️  Reviewing files from ${count} commits. This may take a while...`)
    );
  }

  try {
    // Use git log with --diff-filter=d to exclude deleted files
    // --name-only shows file names, --pretty=format: suppresses commit info
    const { stdout } = await execAsync(
      `git log -${count} --name-only --diff-filter=d --pretty=format: | sort -u`
    );

    const files = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (files.length === 0) {
      throw new FileScopingError(
        `No files to review. No commits found or no files modified in last ${count} commits.`
      );
    }

    return files;
  } catch (error) {
    // Re-throw FileScopingError as-is
    if (error instanceof FileScopingError) {
      throw error;
    }
    // Wrap unexpected errors
    throw new Error(`Failed to get files from last ${count} commits: ${String(error)}`);
  }
}

/**
 * Get change statistics for specific files
 * HODGE-344.3: Used by ReviewEngineService to get real change metrics for risk scoring
 *
 * @param filePaths - Array of file paths to analyze
 * @returns Promise resolving to array of GitDiffResult with line change stats
 * @throws Error if git command fails
 */
export async function getFileChangeStats(filePaths: string[]): Promise<GitDiffResult[]> {
  if (filePaths.length === 0) {
    return [];
  }

  try {
    // Use git diff --numstat HEAD to get working tree changes for these files
    // Format: <linesAdded>\t<linesDeleted>\t<filePath>
    // Properly quote each file path to avoid shell expansion issues (e.g., {old => new} in renames)
    const fileArgs = filePaths.map((f) => `'${f.replace(/'/g, "'\\''")}'`).join(' ');
    const { stdout } = await execAsync(`git diff --numstat HEAD -- ${fileArgs}`);

    if (!stdout.trim()) {
      // No changes for these files (they match HEAD)
      // Return zero-change stats for each file
      return filePaths.map((path) => ({
        path,
        linesAdded: 0,
        linesDeleted: 0,
        linesChanged: 0,
      }));
    }

    // Parse numstat output
    const results: GitDiffResult[] = [];
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length !== 3) {
        continue; // Skip malformed lines
      }

      const [added, deleted, path] = parts;

      // Handle binary files (show as "-")
      const linesAdded = added === '-' ? 0 : Number.parseInt(added, 10);
      const linesDeleted = deleted === '-' ? 0 : Number.parseInt(deleted, 10);

      results.push({
        path,
        linesAdded,
        linesDeleted,
        linesChanged: linesAdded + linesDeleted,
      });
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to get file change stats: ${String(error)}`);
  }
}
