# Exploration: Fix Non-Interactive CLI Commands

## Problem Statement
**CRITICAL ARCHITECTURE ISSUE**: Hodge CLI commands are being called by Claude Code slash commands but contain interactive prompts, which violates the fundamental architecture where:
- Commands are ONLY called by slash commands, never by developers
- There is NO possibility of user interaction
- All prompts block execution and cause errors

## Affected Commands
1. **`hodge status`** - TWO violations:
   - Has "Continue working on X?" prompt (blocks execution)
   - Updates `.hodge/HODGE.md` file (violates read-only principle for status commands)
2. **`hodge ship`** - Has PR confirmation prompt

## Context
- **Date**: 9/21/2025
- **Mode**: Explore
- **Standards**: Suggested
- **Related Features**: HODGE-280 (shipped), session management

## Investigation Findings

### Issue 1: Interactive Prompt in hodge status
When `/hodge` calls `hodge status`, it encounters an interactive prompt:
```
📂 Previous Session Found
? Continue working on HODGE-280? (Y/n)
```

This blocks the command execution and shows as an error in the slash command output.

### Issue 2: Context State Mismatch
- HODGE-280 was shipped (commit: 50ff726)
- `.hodge/HODGE.md` shows mode: "harden"
- `.hodge/context.json` likely has stale data
- The post-ship auto-save didn't update the main context files

## Architecture Clarification
After investigation, I discovered a fundamental misunderstanding:
- **Hodge CLI commands are NEVER called by developers directly**
- **They are ONLY called by Claude Code slash commands**
- **Therefore, ALL commands must be non-interactive**

This has been added to `.hodge/standards.md` as a critical architectural standard.

## Recommended Approach

### Remove ALL Interactive Prompts
**Description**: Simply remove all interactive prompts from affected commands since they serve no purpose in the actual architecture

**For `hodge status`**:
- Remove the "Continue working?" prompt entirely
- Always show overall status and update HODGE.md
- If a feature parameter is passed, show that feature's status

**For `hodge ship`**:
- Remove the PR confirmation prompt
- Either always create PR or use a `--pr` flag to opt-in

**Pros**:
- Aligns with actual architecture
- Simplifies code
- No need for flags or workarounds
- Commands work correctly when called from slash commands

**Cons**:
- None - this is fixing a fundamental architectural violation



## Implementation Plan

### 1. Fix `hodge status` (status.ts)
```typescript
// REMOVE the entire prompt section (lines 18-30)
const session = await sessionManager.load();
if (session && !feature) {
  // Just use the session feature if no feature specified
  feature = session.feature;
  console.log(chalk.green(`✓ Showing status for ${feature} from session\n`));
}

// REMOVE the HODGE.md update (line 129)
// DELETE: await this.updateHodgeMD();

// REMOVE the notification (line 219)
// DELETE: console.log(chalk.gray('💡 HODGE.md updated for AI tool compatibility'));

// DELETE the entire updateHodgeMD method (lines 222-259)
```

### 2. Fix `hodge ship` (ship.ts)
```typescript
// REMOVE the PR confirmation prompt
// Add flag-based control instead:
.option('--pr', 'Create a pull request after shipping')

// Then in code:
if (options.pr) {
  await this.createPullRequest();
}
```

### 3. Fix Session Cleanup After Ship
```typescript
// In ship.ts, after successful commit
await sessionManager.clearSession();
```

### 4. Where HODGE.md Updates Should Happen
HODGE.md should ONLY be updated by commands that actually change state:
- `explore` - When starting exploration (feature HODGE.md)
- `build` - When entering build phase (feature HODGE.md)
- `harden` - When entering harden phase (feature HODGE.md)
- `ship` - When shipping (feature HODGE.md)
- `context` - When explicitly requested (main HODGE.md)

Never by read-only commands like `status`, `load`, or `list`.

## Implementation Hints
- Start with Phase 1 for immediate relief
- Test with both CLI and slash commands
- Ensure backward compatibility
- Add tests for non-interactive mode

## Next Steps
- [ ] Review the combined approach
- [ ] Use `/decide` to confirm approach
- [ ] Proceed to `/build HODGE-281` with Phase 1
- [ ] Test fixes with `/hodge` command
- [ ] Ship incremental improvements

---
*Exploration completed (2025-09-22T01:54:00.000Z)*
