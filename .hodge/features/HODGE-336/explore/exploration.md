# Exploration: Remove /load and /save Commands

## Feature Overview
**PM Issue**: HODGE-336
**Title**: Remove /load and /save commands - /hodge does it better
**Type**: Code cleanup / Simplification
**Created**: 2025-10-09T02:01:32.844Z

## Problem Statement

The `/load` and `/save` slash commands add unnecessary complexity without providing value. The user's current workflow is `/clear` → `/hodge HODGE-XXX` → `/explore`, which loads base project context effectively. The save/load concept hasn't proven useful in practice despite 896 auto-saves accumulated in `.hodge/saves/`. This feature removes unused functionality to simplify the codebase.

## Conversation Summary

We identified that:
1. **Redundancy**: `/hodge HODGE-XXX` already loads feature context, making `/load` redundant
2. **Unused features**: Manual saves (`/save`) haven't been useful; all 896 saves are auto-saves
3. **Complexity creep**: `--list` and `--recent` flags in `/hodge` delegate to `hodge load` but aren't used
4. **Future cleanup**: This is the first step in a broader effort to remove unused CLI parameters

The user confirmed all auto-saves should be deleted, and both the slash commands and CLI commands should be removed entirely.

## Implementation Approaches

### Approach 1: Complete Removal (Recommended)
**Description**: Remove all save/load infrastructure in a single atomic change

**What gets removed:**
- **Slash commands**: `.claude/commands/save.md`, `.claude/commands/load.md`
- **CLI commands**: `src/commands/save.ts`, `src/commands/load.ts`
- **Infrastructure**: `src/lib/save-manager.ts`, `src/lib/auto-save.ts`
- **Tests**: 7 test files (save.test.ts, load.test.ts, save-load.*.test.ts, save-performance.test.ts, auto-save.test.ts, save-service.test.ts)
- **CLI registration**: Remove command registration in `src/bin/hodge.ts` (lines 123-165)
- **Auto-save calls**: Remove `autoSave` imports from explore.ts, build.ts, harden.ts, ship.ts
- **Context manager**: Remove `loadSession()` method from `src/lib/context-manager.ts`
- **Flags in /hodge**: Remove `--list` and `--recent` flag handling
- **Directory cleanup**: Delete `.hodge/saves/` directory (896 directories)
- **Types**: Remove `SaveManifest` and related types if unused elsewhere

**Pros:**
- Single atomic change is easier to review
- Eliminates all complexity at once
- Clear before/after state
- No half-removed infrastructure

**Cons:**
- Large changeset (but straightforward deletions)
- Must verify no hidden dependencies

**When to use**: When you want clean, atomic removals with clear impact

### Approach 2: Phased Removal
**Description**: Remove in stages (commands → infrastructure → types)

**Phase 1**: Remove slash commands and CLI command registration
**Phase 2**: Remove auto-save calls from workflow commands
**Phase 3**: Remove save-manager and auto-save infrastructure
**Phase 4**: Clean up types and tests

**Pros:**
- Smaller, more digestible commits
- Can verify each phase independently
- Easier to bisect if problems arise

**Cons:**
- Multiple commits for simple cleanup
- Temporary broken state between phases
- More overhead for straightforward deletion
- Each phase requires full test suite run

**When to use**: When dealing with complex dependencies or uncertain impact

### Approach 3: Deprecate First, Remove Later
**Description**: Mark commands as deprecated, remove in future release

**What changes:**
- Add deprecation warnings to save/load commands
- Update documentation to discourage use
- Remove in next major version

**Pros:**
- Gentler transition for potential users
- Time to discover edge cases
- Follows semantic versioning

**Cons:**
- Unnecessary for unused features (all saves are auto-saves)
- Adds temporary complexity (deprecation warnings)
- Delays cleanup benefits
- Overkill for internal-only commands (AI-orchestrated, not user-facing)

**When to use**: When removing public APIs with external users

## Recommendation

**Use Approach 1: Complete Removal**

**Rationale:**
1. **Clean slate**: All 896 saves are auto-saves - no user data at risk
2. **Atomic change**: Easier to review as single PR than multiple phases
3. **Clear impact**: Test suite verifies nothing breaks
4. **No users affected**: Commands are AI-orchestrated (internal only)
5. **Simplification goal**: Aligns with broader effort to remove unused parameters

**Implementation strategy:**
1. Delete files first (slash commands, CLI commands, infrastructure, tests)
2. Remove imports and method calls (auto-save from workflow commands)
3. Remove CLI registration (hodge.ts)
4. Update /hodge slash command (remove --list/--recent)
5. Delete .hodge/saves/ directory
6. Clean up unused types (SaveManifest, LoadOptions, etc.)
7. Run full test suite to verify nothing breaks

**Risk mitigation:**
- Full test coverage exists for workflow commands (explore, build, harden, ship)
- Context loading is separate from save/load (uses ContextManager.load())
- Session tracking uses context.json, not saves directory

## Test Intentions

### Behavioral Expectations

1. **Workflow commands complete without auto-save**
   - `/explore HODGE-XXX` runs successfully without auto-save calls
   - `/build HODGE-XXX` runs successfully without auto-save calls
   - `/harden HODGE-XXX` runs successfully without auto-save calls
   - `/ship HODGE-XXX` runs successfully without auto-save calls

2. **Context loading works correctly**
   - `/hodge HODGE-XXX` loads feature-specific context
   - `hodge context --feature HODGE-XXX` returns correct context
   - Session context persists via context.json

3. **No broken imports**
   - No source files import saveManager or SaveManager
   - No source files import autoSave or AutoSave
   - No references to save-manager.ts or auto-save.ts

4. **CLI help shows correct commands**
   - `hodge --help` does not list save or load commands
   - `/hodge` slash command works without --list or --recent flags

5. **Test suite passes**
   - All remaining tests pass after removal
   - No orphaned test files reference removed functionality

6. **Types are clean**
   - SaveManifest type removed (or verified as used elsewhere)
   - LoadOptions type removed (or verified as used elsewhere)
   - No compilation errors from missing types

## Decisions Decided During Exploration

1. ✓ **Remove both slash commands and CLI commands** - confirmed during conversation
2. ✓ **Delete all auto-saves** - 896 saves in .hodge/saves/ to be removed
3. ✓ **Remove SaveManager infrastructure entirely** - no future use planned
4. ✓ **Remove --list and --recent flags from /hodge** - not used in practice
5. ✓ **Use atomic removal approach** - Approach 1 over phased removal

## No Decisions Needed

All decisions were resolved during exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Proceed to `/build HODGE-336` to implement removal

---
*Exploration completed: 2025-10-09T02:15:00.000Z*
