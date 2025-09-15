# Progressive Enhancement for Git Push

## Environment-Specific Push Experiences

### 1. Claude Code
**Characteristics**: No TTY, file-based interaction, markdown UI

#### Push Review Workflow
```markdown
# 📤 Push Review - feature/PSILO-59

## Pre-Push Analysis
- **Branch**: feature/PSILO-59-aria-labels
- **Remote**: origin (github.com/org/repo)
- **Status**: 3 commits ahead, 0 behind
- **Conflicts**: None detected

## Recent Commits
```
e965220 feat(ship): implement interactive ship commits
ad4727e ship: HOD-20 (closes HOD-20)
ba7b39f feat: implement explore/build/harden/ship commands
```

## Push Configuration
Edit these settings and save:

```yaml
# Push settings
push: true
remote: origin
branch: feature/PSILO-59-aria-labels
createPR: true
prTitle: "feat(PSILO-59): add comprehensive ARIA labels"
prBody: |
  ## Summary
  - Added ARIA labels to all interactive elements
  - Improved screen reader navigation
  - Fixed accessibility warnings

  Closes PSILO-59
```

## Actions
- Save this file and run: `hodge ship --continue-push`
- Or skip push: `hodge ship --skip-push`
```

**State Management**
```json
// .hodge/temp/ship-interaction/{feature}/push-state.json
{
  "stage": "push-review",
  "branch": "feature/PSILO-59",
  "commits": ["e965220", "ad4727e", "ba7b39f"],
  "userEdited": false,
  "pushConfig": {
    "push": true,
    "remote": "origin",
    "createPR": false
  }
}
```

### 2. Warp Terminal
**Characteristics**: Rich terminal UI, workflows, AI assistance

#### Warp Workflow Integration
```yaml
# .warp/workflows/hodge-push.yml
name: Hodge Smart Push
command: hodge push
description: Intelligently push commits with safety checks
parameters:
  - name: branch
    description: Target branch
    default: current
  - name: create-pr
    description: Create pull request
    type: boolean
    default: true
```

#### Warp-Specific UI
```
╭────────────────────────────────────────╮
│ 🚀 Warp Push Workflow                  │
├────────────────────────────────────────┤
│ Branch: feature/PSILO-59               │
│ [AI: This looks like a feature branch] │
│                                        │
│ ✓ Pre-push checks passed              │
│ ✓ No conflicts detected               │
│ ✓ CI status: passing                  │
╰────────────────────────────────────────╯

[Push & Create PR] [Push Only] [Cancel]
```

### 3. Aider
**Characteristics**: Git-aware, integrated with AI coding

#### Aider Integration
```python
# Aider sees this context
# /push feature/PSILO-59

# Aider can help with:
# 1. Resolving conflicts before push
# 2. Generating PR descriptions
# 3. Suggesting squash/rebase strategies

# The hodge push command detects Aider and provides:
hodge push --aider-context
```

### 4. Continue.dev
**Characteristics**: VS Code integrated, file-based like Claude

#### Continue Task Integration
```typescript
// .continue/commands/push.ts
export async function pushWithHodge() {
  // Continue.dev can trigger hodge push
  const result = await runCommand('hodge push --continue-mode');

  // Parse result and show in VS Code
  vscode.window.showInformationMessage(
    `Pushed to ${result.branch}: ${result.commits.length} commits`
  );
}
```

### 5. Cursor
**Characteristics**: AI-native IDE, enhanced commands

#### Cursor Command Palette
```
Cursor Command: hodge push

[AI Enhanced]
Based on your recent changes, I suggest:
- Branch: feature/PSILO-59 ✓
- Squash commits: No (they're logical units)
- PR Title: "feat(PSILO-59): comprehensive ARIA labels"

[Generate PR] [Push Only] [Customize]
```

### 6. Standard Terminal
**Characteristics**: Basic TTY, needs clear prompts

#### Terminal Flow
```bash
$ hodge push

📤 Git Push

Current branch: main
⚠️  Pushing to main is not recommended

What would you like to do?
1) Push to main anyway
2) Create and push to feature branch
3) Cancel

Choice: 2

Enter feature branch name: feature/ship-push

✓ Created branch: feature/ship-push
✓ Pushed 3 commits to origin/feature/ship-push

Create a pull request? (y/n): y
✓ PR created: https://github.com/org/repo/pull/42
```

### 7. CI/Automation
**Characteristics**: Non-interactive, needs safe defaults

#### CI Configuration
```yaml
# .github/workflows/hodge-ship.yml
- name: Ship and Push
  run: |
    hodge ship ${{ github.event.inputs.feature }} \
      --yes \
      --push \
      --branch ${{ github.ref_name }} \
      --no-pr  # PRs created separately in CI
```

## Progressive Enhancement Matrix

| Environment | Interaction | Push Review | PR Creation | Conflict Resolution |
|------------|-------------|-------------|-------------|-------------------|
| Claude Code | File-based | Markdown UI | Config file | Show in markdown |
| Warp | Interactive | Rich terminal | Native UI | Interactive resolution |
| Aider | Hybrid | AI-assisted | AI-generated | AI-suggested fixes |
| Continue | File-based | VS Code UI | Via extension | VS Code merge UI |
| Cursor | Interactive | AI-enhanced | AI-generated | Native merge tool |
| Terminal | Prompts | Text display | Prompt for URL | Manual instructions |
| CI | Automatic | Logs only | Separate step | Fail with message |

## Implementation Strategy

### Core Push Module
```typescript
export class PushManager {
  private env: Environment;
  private interactionManager: InteractionStateManager;

  async executePush(options: PushOptions): Promise<PushResult> {
    // 1. Detect environment
    this.env = getCurrentEnvironment();

    // 2. Pre-push checks
    const checks = await this.runPrePushChecks();

    // 3. Environment-specific review
    const config = await this.getPushConfiguration(checks);

    // 4. Execute push
    const result = await this.performPush(config);

    // 5. Post-push actions
    await this.handlePostPush(result);

    return result;
  }

  private async getPushConfiguration(checks: PrePushChecks): Promise<PushConfig> {
    switch (this.env.type) {
      case 'claude-code':
        return this.getClaudeCodeConfig(checks);
      case 'warp':
        return this.getWarpConfig(checks);
      case 'terminal':
        return this.getTerminalConfig(checks);
      default:
        return this.getDefaultConfig(checks);
    }
  }
}
```

### Safety Features

```typescript
export class PushSafetyGuard {
  async validatePush(branch: string, remote: string): Promise<SafetyResult> {
    const issues: SafetyIssue[] = [];

    // Check protected branches
    if (this.isProtectedBranch(branch)) {
      issues.push({
        level: 'warning',
        message: `Pushing to protected branch: ${branch}`,
        suggestion: 'Consider using a feature branch'
      });
    }

    // Check for uncommitted changes
    const uncommitted = await this.getUncommittedChanges();
    if (uncommitted.length > 0) {
      issues.push({
        level: 'error',
        message: 'Uncommitted changes detected',
        suggestion: 'Commit or stash changes first'
      });
    }

    // Check if behind remote
    const behind = await this.getCommitsBehind(branch, remote);
    if (behind > 0) {
      issues.push({
        level: 'warning',
        message: `Branch is ${behind} commits behind ${remote}/${branch}`,
        suggestion: 'Pull and rebase first'
      });
    }

    return { issues, canPush: !issues.some(i => i.level === 'error') };
  }
}
```

## Benefits of Progressive Enhancement

1. **Optimal UX per Environment**: Each tool gets native experience
2. **Safety**: Environment-appropriate warnings and confirmations
3. **Flexibility**: Users can override with flags
4. **Maintainability**: Single codebase, multiple experiences
5. **Future-Proof**: Easy to add new environments

## Next Steps

1. Implement core PushManager
2. Add environment-specific adapters
3. Create safety validation system
4. Build PR creation integration
5. Add conflict resolution helpers