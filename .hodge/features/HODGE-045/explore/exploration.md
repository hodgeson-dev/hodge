# HODGE-045: PM Auto-Update After Ship - Enhanced Integration

## Updated Problem Statement
The basic PM auto-update functionality has been implemented in HODGE-288 with local updates working perfectly. However, external PM tool integration (Linear, GitHub) is incomplete - the adapters exist but aren't wired up properly. We need to complete the integration and enhance it with richer updates that include commit details, metrics, and better status mapping.

## Current State Analysis (Post-HODGE-288)

### What's Already Implemented ✅
1. **LocalPMAdapter** - Fully functional, updates project_management.md with serialization
2. **PMHooks** - Orchestrates local and external PM updates with silent failure
3. **LinearAdapter** - Has all methods (getIssue, updateIssueState, createIssue, searchIssues)
4. **Ship Integration** - Ship command calls `pmHooks.onShip(feature)` on success
5. **Configuration** - Loads PM settings from hodge.json with status mappings

### What Still Needs Work 🚧
1. **Linear Connection** - PMHooks throws error instead of using LinearAdapter
2. **GitHub Adapter** - Not implemented at all
3. **Rich Updates** - No commit details, metrics, or links added to PM issues
4. **Status Mapping** - Basic mapping exists but doesn't use Linear's actual states
5. **Slash Command Integration** - /ship command could provide richer context to PM

## Approach 1: Complete Linear Integration & Smart State Mapping

### Implementation
```typescript
// Fix PMHooks.callPMAdapter to use LinearAdapter properly
private async callPMAdapter(tool: string, feature: string, status: string): Promise<void> {
  switch (tool.toLowerCase()) {
    case 'linear':
      const adapter = new LinearAdapter({
        config: {
          apiKey: this.config.apiKey!,
          teamId: this.config.teamId!,
          tool: 'linear'
        }
      });

      // Get Linear's actual states and map intelligently
      const states = await adapter.fetchStates();
      const targetState = this.mapToLinearState(status, states);

      // Update the issue
      const issue = await adapter.findIssueByFeature(feature);
      if (issue) {
        await adapter.updateIssueState(issue.id, targetState.id);
      }
      break;
  }
}

// Smart state mapping
private mapToLinearState(hodgeStatus: string, linearStates: PMState[]): PMState {
  // First try exact match
  const exactMatch = linearStates.find(s =>
    s.name.toLowerCase() === hodgeStatus.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // Then try type-based matching
  const typeMap = {
    'To Do': 'unstarted',
    'In Progress': 'started',
    'Done': 'completed'
  };

  return linearStates.find(s => s.type === typeMap[hodgeStatus]) || linearStates[0];
}
```

### Pros
- Uses existing LinearAdapter without modification
- Intelligently maps states based on actual Linear workflow
- Gracefully handles missing issues
- Minimal code changes needed

### Cons
- Still needs async/await handling in PMHooks
- Requires fetching states on each update

## Approach 2: Rich PM Updates with Commit Context

### Implementation
```typescript
// Enhance PMHooks to pass rich context from ship
interface ShipContext {
  feature: string;
  commitHash: string;
  commitMessage: string;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  testsResults: { passed: number; total: number };
  patterns: string[];
}

// In ship.ts, pass context to PM hooks
const context: ShipContext = {
  feature,
  commitHash: await this.getCommitHash(),
  commitMessage: this.commitMessage,
  filesChanged: gitStats.filesChanged,
  linesAdded: gitStats.linesAdded,
  linesRemoved: gitStats.linesRemoved,
  testsResults: this.testResults,
  patterns: learningResult.patterns
};
await this.pmHooks.onShip(context);

// PMHooks adds comment to Linear issue
private async addRichComment(adapter: LinearAdapter, issueId: string, context: ShipContext) {
  const comment = `
## 🚀 Shipped in ${context.commitHash.substring(0, 7)}

### Changes
- **Files Changed**: ${context.filesChanged}
- **Lines Added**: +${context.linesAdded}
- **Lines Removed**: -${context.linesRemoved}
- **Tests**: ${context.testsResults.passed}/${context.testsResults.total} passing

### Patterns Applied
${context.patterns.map(p => `- ${p}`).join('\n')}

### Commit Message
\`\`\`
${context.commitMessage}
\`\`\`

View commit: [\`${context.commitHash.substring(0, 7)}\`](../commits/${context.commitHash})
`;
  await adapter.addComment(issueId, comment);
}
```

### Pros
- Provides full context in PM tool
- Links back to git commit
- Shows test results and patterns learned
- Creates audit trail of what shipped

### Cons
- Requires adding comment method to adapters
- More data to pass between components

## Approach 3: GitHub Issues Integration (Recommended)

### Implementation
```typescript
// Implement GitHubAdapter using Octokit
import { Octokit } from '@octokit/rest';

export class GitHubAdapter extends BasePMAdapter {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(options: PMAdapterOptions) {
    super(options);
    this.octokit = new Octokit({ auth: options.config.apiKey });
    // Parse owner/repo from git remote or config
    [this.owner, this.repo] = this.parseGitHubRepo();
  }

  async updateIssueState(issueNumber: number, state: 'open' | 'closed'): Promise<void> {
    await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      state
    });

    // Add label for hodge workflow state
    const label = `hodge:${state === 'closed' ? 'shipped' : 'in-progress'}`;
    await this.octokit.issues.addLabels({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      labels: [label]
    });
  }

  async addComment(issueNumber: number, body: string): Promise<void> {
    await this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body
    });
  }

  async findIssueByFeature(feature: string): Promise<PMIssue | undefined> {
    // Search by title or number
    const searchQuery = `${feature} in:title repo:${this.owner}/${this.repo}`;
    const { data } = await this.octokit.search.issuesAndPullRequests({
      q: searchQuery
    });

    if (data.items.length > 0) {
      const issue = data.items[0];
      return {
        id: String(issue.number),
        title: issue.title,
        description: issue.body || undefined,
        state: {
          id: issue.state,
          name: issue.state === 'closed' ? 'Closed' : 'Open',
          type: issue.state === 'closed' ? 'completed' : 'started'
        },
        url: issue.html_url
      };
    }
  }

  private parseGitHubRepo(): [string, string] {
    // Get from git remote or config
    const remote = execSync('git remote get-url origin').toString().trim();
    const match = remote.match(/github\.com[:/](.+)\/(.+?)(?:\.git)?$/);
    if (match) {
      return [match[1], match[2]];
    }
    throw new Error('Not a GitHub repository');
  }
}
```

### Pros
- Works with existing GitHub workflow
- No external PM tool needed
- Labels provide visual workflow state
- Integrates with PRs and CI/CD
- Comments create rich audit trail

### Cons
- Only works for GitHub-hosted projects
- Need to handle issue number vs HODGE-xxx mapping

## Recommendation

**Approach 3: GitHub Issues Integration** is the best immediate solution because:

1. **Maximum Value** - Most projects use GitHub, no extra PM tool needed
2. **Rich Integration** - Comments, labels, and links create full audit trail
3. **Builds on Existing** - LinearAdapter already works, just needs connection
4. **Progressive Enhancement** - Start with GitHub, add Linear support after
5. **Aligns with Hodge philosophy** - Git-centric workflow with PM as enhancement

### Implementation Plan
1. Wire up LinearAdapter in PMHooks (fix the TODO)
2. Implement GitHubAdapter using Octokit
3. Add rich context passing from ship command
4. Add comment methods to adapters for detailed updates
5. Implement smart state mapping for each PM tool

### Why Not Just Fix Linear?
While fixing Linear integration is simpler (Approach 1), GitHub integration provides more value:
- Most developers already use GitHub Issues
- No additional API keys or configuration
- Works out-of-the-box for any GitHub project
- Labels and comments create visible workflow state

## Implementation Details: GitHub Adapter

### Key Implementation Points
```typescript
// 1. Auto-detect GitHub repository
const isGitHubRepo = (): boolean => {
  try {
    const remote = execSync('git remote get-url origin').toString();
    return remote.includes('github.com');
  } catch {
    return false;
  }
};

// 2. Map HODGE IDs to GitHub issue numbers
interface IssueMapping {
  hodgeId: string;
  githubNumber: number;
  linearId?: string;
}

// Store in .hodge/pm-mappings.json
class PMIdMapper {
  async mapHodgeToGitHub(hodgeId: string): Promise<number | undefined> {
    // Try to extract number if format is HODGE-123
    const match = hodgeId.match(/HODGE-(\d+)/);
    if (match) return parseInt(match[1]);

    // Otherwise look up in mappings
    const mappings = await this.loadMappings();
    return mappings[hodgeId]?.githubNumber;
  }
}

// 3. Smart label management
const HODGE_LABELS = {
  exploring: { name: 'hodge:exploring', color: '0E8A16' },
  building: { name: 'hodge:building', color: 'FBCA04' },
  hardening: { name: 'hodge:hardening', color: '0052CC' },
  shipped: { name: 'hodge:shipped', color: '5319E7' }
};

// 4. Rich comment template
const generateShipComment = (context: ShipContext): string => {
  return `
## 🚀 Shipped via Hodge

**Commit**: [\`${context.commitHash.substring(0, 7)}\`](../commit/${context.commitHash})
**Branch**: \`${context.branch}\`

### 📊 Metrics
| Metric | Value |
|--------|-------|
| Files Changed | ${context.filesChanged} |
| Lines Added | +${context.linesAdded} |
| Lines Removed | -${context.linesRemoved} |
| Test Results | ${context.testsResults.passed}/${context.testsResults.total} ✅ |
| Coverage | ${context.coverage}% |

### 🎯 Patterns Applied
${context.patterns.length > 0
  ? context.patterns.map(p => `- \`${p}\``).join('\n')
  : '_No patterns detected_'
}

### 📝 Commit Message
<details>
<summary>View full commit message</summary>

\`\`\`
${context.commitMessage}
\`\`\`
</details>

---
_Automated by [Hodge](https://github.com/your-org/hodge) ${context.hodgeVersion}_
`;
};
```

### Integration Flow
```typescript
// In PMHooks, add GitHub support
private async callPMAdapter(tool: string, feature: string, status: string): Promise<void> {
  switch (tool.toLowerCase()) {
    case 'github':
      const adapter = new GitHubAdapter({
        config: {
          apiKey: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
          tool: 'github'
        }
      });

      const issueNumber = await this.mapToGitHubIssue(feature);
      if (issueNumber) {
        // Update labels
        await adapter.updateLabels(issueNumber, [HODGE_LABELS[status].name]);

        // Close if shipped
        if (status === 'shipped') {
          await adapter.closeIssue(issueNumber);
        }

        // Add rich comment with context
        if (this.shipContext) {
          const comment = generateShipComment(this.shipContext);
          await adapter.addComment(issueNumber, comment);
        }
      }
      break;
  }
}
```

## Test Intentions
- [ ] GitHub adapter auto-detects repository from git remote
- [ ] Linear adapter connects and updates issues properly
- [ ] Smart state mapping works for different PM tools
- [ ] Rich comments include all ship context (metrics, patterns, etc.)
- [ ] Silent failure pattern prevents PM errors from blocking ship
- [ ] Issue mapping handles HODGE-xxx to GitHub/Linear IDs
- [ ] Labels are created and updated correctly in GitHub
- [ ] Configuration loading from hodge.json works

## Decisions Needed

### 1. PM Tool Priority
- **Option A**: Fix Linear integration first (simpler, already has adapter)
- **Option B**: Implement GitHub integration first (more universal)
- **Option C (Recommended)**: Do both - GitHub for OSS, Linear for enterprise

### 2. Comment Richness
- **Option A**: Minimal updates (just status change)
- **Option B (Recommended)**: Rich updates with metrics and context
- **Option C**: Configurable verbosity levels

### 3. Issue ID Mapping
- **Option A**: Require exact ID match (HODGE-123 → Issue #123)
- **Option B**: Fuzzy matching by title
- **Option C (Recommended)**: Smart mapping with fallbacks

### Next Steps
Type one of these commands:
• `/decide` - Review and decide on approach
• `/build HODGE-045` - Start building with GitHub Issues Integration
• `/save` - Save your progress
• `/status HODGE-045` - Check current status
• Continue exploring - Just describe what else to explore

Or type your next request.

Note: `/build` will use the recommended approach. Use `/decide` to choose a different approach.