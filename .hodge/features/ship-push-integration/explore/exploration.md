# Git Push Integration for Ship Command - Exploration

## Feature: ship-push-integration

### Context
The `/ship` command currently creates commits but doesn't push to remote. We need to explore how to best integrate push functionality using Progressive Enhancement to adapt to different environments and workflows.

## Approach 1: Integrated Push in Ship Command

### Implementation Sketch
Extend the existing ship command with push capabilities:

```typescript
// Add to ShipOptions
export interface ShipOptions {
  // existing...
  noPush?: boolean;        // Skip automatic push
  pushBranch?: string;     // Override target branch
  createPR?: boolean;      // Auto-create PR after push
  forcePush?: boolean;     // Allow force push (with warnings)
}
```

### Progressive Enhancement Strategy

#### Claude Code (File-Based)
```markdown
# Push Configuration UI
After commit created, generate `.hodge/temp/ship-interaction/{feature}/push-config.md`:

## 📤 Ready to Push

### Current State
- Branch: main
- Remote: origin
- Commits ahead: 2

### Push Options
Edit this file to configure:
```yaml
push: true
branch: main
createPR: false
forcePush: false
```

Save and re-run `hodge ship {feature} --continue-push`
```

#### Terminal (Interactive)
```typescript
// Use prompts for push decisions
const { pushNow } = await prompts.promptPushDecision({
  branch: currentBranch,
  ahead: commitsAhead,
  behind: commitsBehind
});
```

#### CI/Automation (Non-Interactive)
```bash
# Auto-push with sensible defaults
hodge ship feature --yes --push
# Or disable with
hodge ship feature --no-push
```

### Pros
- Single command for complete ship workflow
- Maintains context from commit generation
- Reuses existing interaction state
- Natural progression: commit → push → done

### Cons
- Ship command becomes more complex
- May violate single responsibility principle
- Harder to push without shipping
- Mixing local (commit) and remote (push) operations

## Approach 2: Separate Push Command

### Implementation Sketch
Create a new `hodge push` command:

```typescript
export class PushCommand {
  async execute(options: PushOptions): Promise<void> {
    // Branch detection
    const branch = await this.getCurrentBranch();

    // Progressive Enhancement
    const env = getCurrentEnvironment();

    if (env.type === 'claude-code') {
      // File-based review
      await this.createPushReviewFile(branch);
    } else if (env.capabilities.prompts) {
      // Interactive flow
      await this.interactivePush(branch);
    } else {
      // Auto-push with defaults
      await this.autoPush(branch);
    }
  }
}
```

### Usage Flow
```bash
# Ship workflow becomes:
hodge ship feature        # Creates commit
hodge push                # Pushes to remote

# Or standalone:
hodge push --branch feature/xyz --create-pr
```

### Pros
- Clear separation of concerns
- Can push any commits, not just shipped ones
- Simpler to test and maintain
- More flexible for different workflows

### Cons
- Two commands for common workflow
- Potential context loss between commands
- Users might forget to push

## Approach 3: Hybrid with Ship Hooks

### Implementation Sketch
Ship command with optional push hook:

```typescript
// In ship command
if (!options.noPush && config.autoPushOnShip) {
  console.log('Triggering push workflow...');
  const pushCommand = new PushCommand();
  await pushCommand.execute({
    fromShip: true,
    branch: currentBranch,
    ...this.getShipContext()
  });
}
```

### Configuration
```json
// .hodge/config.json
{
  "ship": {
    "autoPush": true,
    "pushStrategy": "safe",  // safe, force, interactive
    "createPR": "prompt"     // always, never, prompt
  }
}
```

### Progressive Enhancement

#### Smart Branch Detection
```typescript
class BranchStrategy {
  async determinePushBehavior(branch: string): Promise<PushBehavior> {
    if (branch === 'main' || branch === 'master') {
      return {
        warn: true,
        requireConfirmation: true,
        suggestFeatureBranch: true
      };
    }

    if (branch.startsWith('feature/')) {
      return {
        warn: false,
        requireConfirmation: false,
        suggestPR: true
      };
    }

    return { requireConfirmation: true };
  }
}
```

#### Environment-Specific UI

**Claude Code**: Markdown review file
```markdown
## 🚀 Ship Complete - Push Review

Your changes have been committed. Review push settings:

| Setting | Value | Action |
|---------|-------|--------|
| Branch | main | ⚠️ [Change to feature branch] |
| Remote | origin | ✅ |
| Create PR | No | [Enable] |

[Continue with Push] | [Skip Push] | [Edit Settings]
```

**Terminal**: Rich CLI prompts
```
┌─────────────────────────────────────┐
│ 📤 Push Configuration               │
├─────────────────────────────────────┤
│ Branch: main (⚠️ protected)         │
│ Remote: origin                      │
│ Commits: 2 ahead, 0 behind         │
└─────────────────────────────────────┘

→ Push to main? (not recommended)
  Create feature branch
  Cancel
```

### Pros
- Best of both worlds
- Configurable per project
- Maintains ship context
- Can be disabled easily

### Cons
- More configuration complexity
- Hook behavior might surprise users

## Recommendation

**Approach 3: Hybrid with Ship Hooks** seems best because:

1. **Flexibility**: Users can choose integrated or separate workflows
2. **Progressive Enhancement**: Each environment gets optimal UX
3. **Safety**: Smart branch detection prevents mistakes
4. **Context Preservation**: Ship metadata flows to push
5. **Backwards Compatible**: Existing ship behavior unchanged with `--no-push`

### Implementation Priority

1. **Phase 1**: Extend ship command with basic push
   - Add `--no-push` flag (default off initially)
   - Simple push after commit
   - Branch warnings for main/master

2. **Phase 2**: Progressive Enhancement
   - Claude Code markdown UI for push review
   - Terminal interactive prompts
   - CI auto-push with `--yes`

3. **Phase 3**: Advanced Features
   - PR creation integration
   - Push conflict resolution
   - Work log updates
   - Multi-remote support

### Key Considerations

1. **Branch-Aware Behavior**
   ```typescript
   // TODO: Make branch patterns configurable
   const protectedBranches = ['main', 'master', 'develop'];
   const featureBranchPattern = /^(feature|fix|chore)\//;
   ```

2. **Safety Features**
   - Never force push without explicit confirmation
   - Show what will be pushed before executing
   - Handle push failures gracefully
   - Preserve local work always

3. **Work Log Integration**
   - Update work log after successful push
   - Track push history in ship records
   - Link to PR URLs when created

## Next Steps
Choose your next action:
a) Review and decide on approach → `/decide`
b) Explore PR creation integration
c) Start building push integration → `/build ship-push-integration`
d) Investigate GitHub/GitLab API integration
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):