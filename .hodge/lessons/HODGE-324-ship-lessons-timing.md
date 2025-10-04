# Lessons Learned: HODGE-324

## Feature: Fix Lessons Learned Generation Timing in /ship Command

### The Problem

The `/ship` command was generating lessons learned **after** the git commit executed, which meant lessons were never committed with the feature work that generated them. This violated the principle of keeping project knowledge in version control and created orphaned lesson files that existed only in the working directory.

**Root Cause**: Split responsibility between CLI and slash command template:
- CLI generated `lessons-draft.md` POST-commit (src/commands/ship.ts:301)
- Slash command template enhanced lessons in Step 5 (AFTER Step 4 ship execution)
- Result: Lessons created locally but never staged/committed

### Approach Taken

**Template Reordering Strategy** - Restructure workflow to capture lessons BEFORE commit:

1. **Move lessons enhancement**: Step 5 → Step 3.5 (between commit approval and ship execution)
2. **Remove CLI draft generation**: Delete `generateLessonsDraft()` method (~98 lines)
3. **Direct finalized lesson creation**: Skip draft, create `.hodge/lessons/{feature}-{slug}.md` directly
4. **Leverage existing staging**: `git add -A` in ship command stages lessons automatically

### Key Learnings

#### 1. Timing is Critical for Documentation Artifacts

**Discovery**: Documentation generated after commit operations becomes orphaned

**Solution**: Restructure workflow to capture documentation BEFORE commits, ensuring it's included in version control automatically. The existing `git add -A` in the ship command handles staging without additional logic.

**Pattern**: When documentation is tied to feature work, generate it before the commit operation, not after.

#### 2. Clean Separation of Concerns (AI vs CLI)

**Discovery**: Split responsibilities between CLI and slash command created redundancy and bugs

**Solution**:
- **Slash command (AI-driven)**: Owns entire interactive lessons workflow
- **CLI command (non-interactive)**: Focuses only on git commit mechanics
- **Result**: Clear boundaries, no duplicate logic

**Architecture Principle**: AI-orchestrated commands (called from slash commands) should be non-interactive. All interactive workflows belong in slash command templates.

#### 3. Optional Workflows Need Explicit Skip Handling

**Discovery**: Draft files were created even when users didn't want lessons documented

**Solution**:
- Ask upfront: "Want to document lessons? (y/n)"
- If no: Skip entirely, create NO files
- If yes: Create finalized lesson directly
- **Result**: Clean workspace, no orphaned drafts

**Pattern**: For optional workflows, provide early exit points and ensure skip path creates zero artifacts.

#### 4. Template Changes Can Replace Code

**Discovery**: Major workflow fix achieved primarily through template restructuring (minimal CLI changes)

**Solution**:
- Template changes: Reordered steps, updated instructions (~87 lines modified)
- CLI changes: Removed obsolete code (~109 lines deleted)
- Net result: -190 lines, better architecture

**Insight**: Slash command templates are powerful—workflow improvements often require template changes, not code changes.

### Implementation Details

#### New Flow Architecture

**Before** (Broken):
```
Step 3: Approve commit message
Step 4: Run `hodge ship`
  → CLI commits code
  → CLI generates lessons-draft.md (AFTER commit)
Step 5: AI enhances draft → finalized lesson (AFTER commit)

Result: Lessons orphaned 🚫
```

**After** (Fixed):
```
Step 3: Approve commit message
Step 3.5: Optional lessons (NEW)
  → Ask "Want to document lessons? (y/n)"
  → If yes: Create finalized lesson at .hodge/lessons/
  → If no: Skip (no files created)
Step 4: Run `hodge ship`
  → `git add -A` stages everything (including lessons)
  → CLI commits all staged files

Result: Lessons committed with feature ✅
```

#### Files Changed

**Core Changes** (2 files, -109 lines):
- `.claude/commands/ship.md`: Restructured workflow (Step 5 → Step 3.5)
- `src/commands/ship.ts`: Removed `generateLessonsDraft()` method

**Test Updates** (2 files, -58 lines):
- Deleted: `src/test/ship-lessons.smoke.test.ts` (obsolete draft tests)
- Updated: `src/test/documentation-hierarchy.smoke.test.ts`

**New Tests** (1 file):
- `src/commands/hodge-324.smoke.test.ts`: 14 smoke tests validating the fix

### Impact

✅ **Bug Fixed**: Lessons now committed with feature work automatically
✅ **Cleaner Workspace**: No orphaned draft files
✅ **Better Architecture**: Clean separation—slash command (AI) handles interaction, CLI handles mechanics
✅ **Version Control**: Project knowledge stays in git history
✅ **Code Reduction**: -190 lines of unnecessary code removed
✅ **Test Coverage**: 14 new smoke tests validate the fix
✅ **User Experience**: Simple linear flow with optional lessons

### Related Decisions

1. **Timing**: Lessons captured between Step 3 and Step 4 (before commit)
2. **What to commit**: Only finalized lesson (`.hodge/lessons/{feature}-{slug}.md`)
3. **User choice**: Keep lessons optional (respect workflow preferences)
4. **CLI responsibility**: Remove `generateLessonsDraft` entirely
5. **Skip handling**: No draft created if user skips
6. **Staging**: Existing `git add -A` handles it automatically
7. **Template flow**: Ask upfront y/n, then proceed

### Reusable Patterns

**Pattern 1: Pre-Commit Documentation**
- Generate documentation artifacts BEFORE commit operations
- Leverage existing staging commands (`git add -A`)
- Ensures documentation is versioned with code

**Pattern 2: Template-First Workflow Fixes**
- Consider template restructuring before code changes
- Slash command templates control workflow sequence
- CLI should execute discrete operations, not orchestrate complex flows

**Pattern 3: Optional Workflow Design**
- Ask upfront with clear y/n decision
- Skip path creates zero artifacts
- Proceed path creates only finalized output (no intermediate drafts)

---
_Documented: 2025-10-04_
