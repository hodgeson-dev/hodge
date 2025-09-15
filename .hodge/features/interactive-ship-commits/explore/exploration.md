# Exploration: Interactive Ship Commits

## Feature Overview
**PM Issue**: interactive-ship-commits (linear)

## Context
- **Date**: 9/14/2025
- **Mode**: Explore
- **Standards**: Suggested (not enforced)
- **Goal**: Make `/ship` command's commit process interactive across different AI coding environments

## Discovered Requirements
1. **Intelligent commit message generation** based on changed files
2. **Interactive prompts** for user review/approval
3. **Cross-environment compatibility** (Claude Code, Warp, Aider, Continue.dev, Cursor)
4. **Graceful fallbacks** for non-interactive environments
5. **Work log integration** to update task completion status
6. **Configurable commit types** (feat, fix, refactor, test, docs, chore)

## Environment Compatibility Analysis

### Claude Code
- ✅ Can read/write files
- ✅ Can execute git commands
- ❌ **No direct interactive prompts** - Commands run via markdown
- 🔄 Workaround: Use file-based interaction pattern

### Warp Code (with workflows)
- ✅ Full terminal access
- ✅ Can use readline/prompts
- ✅ Interactive workflows supported
- ✅ Best case scenario

### Aider
- ✅ Git integration built-in
- ✅ Interactive prompts available
- ✅ Can hook into commit flow
- ⚠️ May conflict with Aider's own commit handling

### Continue.dev
- ✅ Can execute commands
- ❌ Limited interactive capabilities
- 🔄 Workaround: Use VS Code's input boxes via extension API

### Cursor
- ✅ Full terminal access
- ✅ Can use prompts
- ⚠️ May need to detect Cursor environment

## Approaches to Explore

### Approach 1: Environment-Adaptive Strategy
- **Description**: Detect environment and use appropriate interaction method
- **Implementation**:
  ```typescript
  class InteractiveCommit {
    private detectEnvironment(): 'interactive' | 'file-based' | 'api' {
      // Check for TTY
      if (process.stdin.isTTY) return 'interactive';

      // Check for Claude Code markers
      if (process.env.CLAUDE_CODE || existsSync('.claude/')) return 'file-based';

      // Check for IDE extensions
      if (process.env.VSCODE_IPC_HOOK) return 'api';

      return 'file-based'; // Safe fallback
    }
  }
  ```
- **Pros**:
  - Works everywhere
  - Optimal UX per environment
  - Graceful degradation
- **Cons**:
  - Complex to maintain
  - Different UX across environments
  - More testing needed
- **Compatibility**: All environments ✅

### Approach 2: File-Based Interaction (Universal)
- **Description**: Always use a file-based approach that works everywhere
- **Implementation**:
  ```typescript
  // Write commit message to file
  // Open in $EDITOR
  // Read back user's changes
  // Parse confirmation markers
  ```
- **Pros**:
  - Works identically everywhere
  - Users familiar with git's commit editor flow
  - No environment detection needed
- **Cons**:
  - Less convenient than prompts
  - Requires editor configuration
  - Extra file management
- **Compatibility**: All environments ✅

### Approach 3: Progressive Enhancement
- **Description**: Start with basic auto-commit, progressively add interactivity based on capabilities
- **Implementation**:
  ```typescript
  class ProgressiveCommit {
    async commit(feature: string, options: ShipOptions): Promise<void> {
      const suggested = await this.generateMessage(feature);

      // Level 1: Always show message
      console.log('📝 Suggested commit message:');
      console.log(suggested);

      // Level 2: Interactive prompt (if available)
      if (this.capabilities.interactive) {
        const choice = await this.prompt('Use this message? [Y/n/e]: ');
        // Handle user choice
      }

      // Level 3: File-based edit (fallback)
      else if (this.capabilities.fileEdit && !options.noEdit) {
        suggested = await this.editViaFile(suggested);
      }

      // Level 4: Auto-commit with flags
      else if (options.message) {
        suggested = options.message;
      }

      await this.executeCommit(suggested);
      await this.updateWorkLog(feature);
    }
  }
  ```
- **Pros**:
  - Best possible UX per environment
  - Backwards compatible
  - Clear upgrade path
  - User control via flags
- **Cons**:
  - Users may get different experiences
  - Documentation complexity
- **Compatibility**: All environments with optimal experience ✅

## Key Implementation Details

### Commit Type Detection
```typescript
function detectCommitType(changedFiles: string[]): string {
  // TODO: Make this list configurable via .hodge/config.json
  const typePatterns = {
    'feat': /\.(ts|js|tsx|jsx)$/,     // New features
    'fix': /fix|bug|patch/i,          // Bug fixes
    'test': /\.(test|spec)\./,         // Test files
    'docs': /\.(md|txt)$/,             // Documentation
    'refactor': /refactor/i,           // Refactoring
    'chore': /package|config|build/    // Build/config
  };

  // Analyze changed files and determine type
}
```

### Commit Message Generation
```typescript
async function generateCommitMessage(feature: string): Promise<string> {
  // 1. Get changed files
  const { stdout } = await execAsync('git diff --cached --name-only');
  const files = stdout.trim().split('\n');

  // 2. Detect type and scope
  const type = detectCommitType(files);
  const scope = detectScope(files);

  // 3. Generate message
  const issueId = await getIssueId(feature);
  const summary = await analyzeDiff();

  return `${type}(${issueId}): ${summary}

- ${bulletPoints.join('\n- ')}`;
}
```

### Work Log Integration
```typescript
async function updateWorkLog(feature: string): Promise<void> {
  const workLogPath = 'WORK_LOG.md';
  if (!existsSync(workLogPath)) return;

  const content = await fs.readFile(workLogPath, 'utf-8');
  const updated = content.replace(
    new RegExp(`- \\[ \\] (.*${feature}.*)`, 'g'),
    '- [x] $1 ✅ Shipped'
  );

  if (updated !== content) {
    await fs.writeFile(workLogPath, updated);
    console.log('✅ Updated WORK_LOG.md');
  }
}
```

## Recommendation
**Approach 3: Progressive Enhancement** is the best choice because:

1. **Universal compatibility**: Works in all environments without breaking
2. **Optimal UX**: Provides the best possible experience per environment
3. **Backwards compatible**: Existing workflows continue to work
4. **Future-proof**: Can add new interaction methods as they become available
5. **User choice**: Flags allow users to control interaction level (`--interactive`, `--no-edit`, `--message`)

The key insight is that we don't need the same UX everywhere - we need the *best possible* UX for each environment while maintaining core functionality.

## Interactive Flow Example

### In TTY Environment (Warp, Terminal):
```
🚀 Preparing to ship: HOD-20

📝 Analyzing changes...
  Files changed: 5
  Type detected: feat
  Scope: ship command

📝 Suggested commit message:
────────────────────────────
feat(HOD-20): add interactive commit flow to ship command

- Detect environment capabilities automatically
- Provide interactive prompts where available
- Fall back to file-based editing
- Update work log on successful commit
────────────────────────────

Options:
1. ✅ Use as-is
2. ✏️ Edit the message
3. 🔍 See more context
4. 🔄 Generate alternative

Your choice (1-4)? _
```

### In Claude Code (File-based):
```
🚀 Preparing to ship: HOD-20

📝 Commit message saved to: .hodge/temp/commit-message.txt

To proceed:
1. Review/edit: .hodge/temp/commit-message.txt
2. Run: hodge ship HOD-20 --confirm

Or cancel with: hodge ship HOD-20 --cancel
```

## Detailed Environment UX

See complete analysis in:
- [environment-ux-details.md](./environment-ux-details.md) - Detailed UX per environment
- [claude-code-integration.md](./claude-code-integration.md) - Claude Code markdown magic
- [environment-comparison-table.md](./environment-comparison-table.md) - Feature comparison matrix

### Key Insights from Detailed Analysis

1. **Claude Code**: Gets the BEST experience through rich markdown UI (not a limitation!)
2. **Warp**: Leverages workflows for reusable, shareable patterns
3. **Aider**: Cooperative mode respects Aider's git integration
4. **Continue.dev**: Workable file-based solution despite limitations
5. **Cursor**: AI enhancement for superior commit messages

### Feature Comparison Summary

| Feature | Terminal | Claude Code | Warp | Aider | Continue | Cursor |
|---------|----------|-------------|------|-------|----------|---------|
| Rich Formatting | ❌ | ✅ Best | ✅ | ✅ | ⚠️ | ✅ |
| All Options Visible | ❌ | ✅ Unique | ❌ | ❌ | ❌ | ❌ |
| Inline Docs | ❌ | ✅ Best | ❌ | ❌ | ❌ | ⚠️ |
| Persistent Context | ❌ | ✅ Best | ⚠️ | ⚠️ | ❌ | ✅ |
| Interactive Prompts | ✅ | ❌ File-based | ✅ | ✅ | ❌ | ✅ |
| AI Assistance | ❌ | ✅ Native | ✅ | ✅ | ⚠️ | ✅ Best |

### Universal Flags (work everywhere)
- `--no-interactive` - Skip all prompts
- `--edit` - Force file-based editing
- `--message "..."` - Provide message directly
- `--yes` - Auto-confirm suggested message
- `--dry-run` - Preview without committing

## Next Steps
- [x] Review approaches
- [x] Detail environment-specific UX
- [ ] Make decision with `/decide`
- [ ] Implement progressive enhancement approach
- [ ] Add environment detection logic
- [ ] Create interactive prompt utilities
- [ ] Add file-based fallback system
- [ ] Test across all target environments
- [ ] Document environment-specific behaviors
- [ ] Add configuration for commit types