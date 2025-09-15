# Branch-Aware Push Workflow

## Intelligent Branch Detection and Behavior

### Branch Classification System

```typescript
export enum BranchType {
  MAIN = 'main',           // main, master
  DEVELOP = 'develop',     // develop, dev
  FEATURE = 'feature',     // feature/*, feat/*
  FIX = 'fix',            // fix/*, bugfix/*, hotfix/*
  RELEASE = 'release',     // release/*, rc/*
  CUSTOM = 'custom'        // any other pattern
}

export interface BranchContext {
  name: string;
  type: BranchType;
  remote: string;
  isProtected: boolean;
  hasUpstream: boolean;
  issueId?: string;        // Extracted from branch name
  ahead: number;
  behind: number;
}
```

### Branch-Specific Behaviors

#### 1. Main/Master Branch
```typescript
// Behavior: Highly cautious, suggest alternatives
{
  type: BranchType.MAIN,
  behavior: {
    requireConfirmation: true,
    suggestFeatureBranch: true,
    allowForcePush: false,
    defaultPRCreation: false,
    warningLevel: 'high'
  },
  messages: {
    warning: '⚠️ You are pushing directly to main branch',
    suggestion: 'Consider creating a feature branch for parallel work',
    alternatives: [
      'Create feature branch and push there',
      'Push to main anyway (not recommended)',
      'Cancel and review changes'
    ]
  }
}
```

**Progressive Enhancement**:
- **Claude Code**: Creates detailed markdown warning with implications
- **Terminal**: Interactive menu with color-coded warnings
- **CI**: Fails unless explicitly allowed with flag

#### 2. Feature Branches
```typescript
// Behavior: Encouraging, PR-focused
{
  type: BranchType.FEATURE,
  behavior: {
    requireConfirmation: false,
    suggestFeatureBranch: false,
    allowForcePush: true,  // with confirmation
    defaultPRCreation: true,
    warningLevel: 'none'
  },
  messages: {
    success: '✅ Pushing feature branch',
    prPrompt: 'Create pull request?',
    prMetadata: {
      title: extractFromBranch(branch),  // feature/PSILO-59-aria -> "PSILO-59: aria"
      labels: ['feature'],
      assignees: [currentUser]
    }
  }
}
```

#### 3. Fix/Hotfix Branches
```typescript
// Behavior: Expedited, priority handling
{
  type: BranchType.FIX,
  behavior: {
    requireConfirmation: false,
    suggestFeatureBranch: false,
    allowForcePush: false,
    defaultPRCreation: true,
    warningLevel: 'info',
    expedited: true
  },
  messages: {
    info: '🔧 Pushing fix branch - expedited flow',
    prMetadata: {
      labels: ['bug', 'priority'],
      reviewers: getCodeOwners()
    }
  }
}
```

### Issue ID Extraction

```typescript
export class IssueExtractor {
  // Patterns for different PM tools
  private patterns = {
    linear: /(?:LIN|HOD)-\d+/i,
    jira: /[A-Z]{2,}-\d+/,
    github: /#\d+/,
    psilo: /PSILO-\d+/
  };

  extractFromBranch(branch: string): IssueReference | null {
    // Try each pattern
    for (const [tool, pattern] of Object.entries(this.patterns)) {
      const match = branch.match(pattern);
      if (match) {
        return {
          tool,
          id: match[0],
          url: this.buildIssueUrl(tool, match[0])
        };
      }
    }
    return null;
  }

  // Smart commit message enhancement
  enhanceCommitMessage(message: string, issue: IssueReference): string {
    if (!message.includes(issue.id)) {
      // Add issue reference if missing
      const [firstLine, ...rest] = message.split('\n');
      return `${firstLine} (${issue.id})\n${rest.join('\n')}`;
    }
    return message;
  }
}
```

### Parallel Work Support

```typescript
export class ParallelWorkflow {
  async handleParallelBranches(current: BranchContext): Promise<WorkflowDecision> {
    // Detect if working on multiple features
    const allBranches = await this.getAllBranches();
    const myFeatureBranches = allBranches.filter(b =>
      b.startsWith('feature/') &&
      b.includes(getCurrentUser())
    );

    if (myFeatureBranches.length > 1) {
      return {
        mode: 'parallel',
        suggestions: [
          `Push to ${current.name} only`,
          'Push all feature branches',
          'Create stacked PRs',
          'Merge to integration branch first'
        ]
      };
    }

    return { mode: 'single' };
  }

  async createStackedPRs(branches: string[]): Promise<void> {
    // Create PRs that depend on each other
    let baseBranch = 'main';

    for (const branch of branches) {
      await this.createPR({
        head: branch,
        base: baseBranch,
        title: `[Stack ${branches.indexOf(branch) + 1}/${branches.length}] ${branch}`,
        body: this.generateStackedPRBody(branch, branches)
      });

      baseBranch = branch; // Next PR builds on this one
    }
  }
}
```

### Conflict Detection and Resolution

```typescript
export class ConflictHandler {
  async checkForConflicts(branch: string, remote: string): Promise<ConflictInfo> {
    // Fetch latest from remote
    await execAsync(`git fetch ${remote} ${branch}`);

    // Check for conflicts
    const { stdout } = await execAsync(
      `git merge-tree $(git merge-base HEAD ${remote}/${branch}) HEAD ${remote}/${branch}`
    );

    if (stdout.includes('<<<<<<<')) {
      return {
        hasConflicts: true,
        files: this.parseConflictedFiles(stdout),
        resolution: this.suggestResolution(branch)
      };
    }

    return { hasConflicts: false };
  }

  private suggestResolution(branch: string): ResolutionStrategy {
    const branchType = this.detectBranchType(branch);

    switch (branchType) {
      case BranchType.FEATURE:
        return {
          strategy: 'rebase',
          command: `git pull --rebase ${remote} ${branch}`,
          explanation: 'Rebasing keeps feature branch history clean'
        };

      case BranchType.FIX:
        return {
          strategy: 'merge',
          command: `git pull ${remote} ${branch}`,
          explanation: 'Merging preserves fix history for auditing'
        };

      case BranchType.MAIN:
        return {
          strategy: 'manual',
          command: 'Review conflicts carefully',
          explanation: 'Main branch conflicts require careful review'
        };
    }
  }
}
```

### Progressive Enhancement by Branch Type

#### Claude Code - Branch Review Markdown
```markdown
# 🌳 Branch Analysis

## Current Branch: `feature/PSILO-59-aria-labels`

### Classification
- **Type**: Feature Branch ✅
- **Issue**: PSILO-59 (Linear)
- **Status**: Safe to push

### Parallel Work Detected
You have 2 other active branches:
1. `feature/PSILO-60-performance`
2. `fix/PSILO-58-validation`

### Recommended Actions
| Action | Command | Impact |
|--------|---------|--------|
| Push this branch only | `hodge push` | Isolated feature |
| Push all branches | `hodge push --all-features` | Update all WIP |
| Create stacked PRs | `hodge push --stack` | Dependent changes |

Edit your choice in `push-config.yaml`:
```yaml
strategy: push-single
branch: feature/PSILO-59-aria-labels
createPR: true
```
```

#### Terminal - Smart Branch Prompts
```
┌─ Branch Intelligence ──────────────────┐
│ 📍 feature/PSILO-59-aria-labels       │
│ ✅ Feature branch (safe to push)       │
│ 🔗 Links to: PSILO-59                 │
├────────────────────────────────────────┤
│ Parallel branches detected:            │
│ • feature/PSILO-60-performance (2↑)   │
│ • fix/PSILO-58-validation (1↑)        │
└────────────────────────────────────────┘

How would you like to proceed?
→ Push current branch only
  Push all feature branches (3 total)
  Create stacked pull requests
  Switch branch context
  Cancel
```

### Work Log Integration

```typescript
export class WorkLogUpdater {
  async updateAfterPush(result: PushResult): Promise<void> {
    const workLogPath = `.hodge/features/${result.feature}/work-log.md`;

    if (!existsSync(workLogPath)) {
      await this.createWorkLog(result.feature);
    }

    const entry = `
### Push Record - ${new Date().toISOString()}
- Branch: ${result.branch}
- Commits: ${result.commits.length}
- PR: ${result.prUrl || 'Not created'}
- Status: ${result.success ? '✅ Success' : '❌ Failed'}
${result.notes ? `- Notes: ${result.notes}` : ''}
`;

    await fs.appendFile(workLogPath, entry);

    // Update task completion if applicable
    if (result.issueId) {
      await this.markTaskComplete(workLogPath, result.issueId);
    }
  }

  private async markTaskComplete(workLogPath: string, issueId: string): Promise<void> {
    const content = await fs.readFile(workLogPath, 'utf-8');
    const updated = content.replace(
      new RegExp(`- \\[ \\] (.+${issueId}.+)`, 'g'),
      '- [x] $1 ✅ Pushed'
    );
    await fs.writeFile(workLogPath, updated);
  }
}
```

## Implementation Priority

### Phase 1: Basic Branch Awareness
```typescript
// TODO: Make protected branch patterns configurable
const protectedBranches = ['main', 'master', 'develop'];
// TODO: Make feature branch patterns configurable
const featureBranchPattern = /^(feature|fix|chore|docs)\//;
```

### Phase 2: Issue Integration
- Extract issue IDs from branch names
- Link to PM tools
- Auto-update issue status

### Phase 3: Parallel Workflow Support
- Detect multiple active branches
- Stacked PR creation
- Integration branch management

### Phase 4: Advanced Safety
- Conflict pre-detection
- Force push protection
- Backup creation before risky operations

## Configuration Schema

```json
{
  "push": {
    "protectedBranches": ["main", "master", "develop"],
    "branchPatterns": {
      "feature": "^feature/",
      "fix": "^(fix|bugfix|hotfix)/",
      "release": "^(release|rc)/"
    },
    "issuePatterns": {
      "linear": "(?:LIN|HOD)-\\d+",
      "custom": "PSILO-\\d+"
    },
    "behavior": {
      "main": {
        "requireConfirmation": true,
        "suggestAlternatives": true
      },
      "feature": {
        "autoCreatePR": true,
        "allowForcePush": false
      }
    }
  }
}
```

## Summary

The branch-aware workflow provides:

1. **Safety**: Protects against dangerous operations
2. **Intelligence**: Understands branch purposes
3. **Efficiency**: Streamlines common workflows
4. **Flexibility**: Adapts to team conventions
5. **Integration**: Connects with PM tools automatically

This approach ensures that the push functionality respects the context of the current work while providing appropriate safeguards and enhancements based on the branch type and environment.