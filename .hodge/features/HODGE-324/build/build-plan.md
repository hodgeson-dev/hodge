# Build Plan: HODGE-324

## Feature
Fix lessons learned generation timing in /ship command

## Approach
Template Reordering - Restructure the `/ship` slash command template to capture lessons before calling `hodge ship`, and remove draft generation from the CLI.

## Implementation Summary

### Changes Made

#### 1. Slash Command Template (.claude/commands/ship.md)
**File**: `.claude/commands/ship.md`

**Changes**:
- Created new **Step 3.5: Capture Lessons Learned (Optional - Before Commit)**
- Moved lessons enhancement from Step 5 (after commit) to Step 3.5 (before commit)
- Updated Step 4 title to "Ship Quality Checks & Commit"
- Added emphasis that lessons happen BEFORE ship execution
- Removed references to `lessons-draft.md` (CLI no longer generates it)
- Changed workflow to create finalized lesson directly at `.hodge/lessons/{feature}-{slug}.md`
- Added note that `git add -A` will stage lessons files
- Clarified that no files are created if user skips lessons

**New Flow**:
1. Step 1-3: Analyze changes, generate commit message, get approval
2. **Step 3.5**: Ask user "Want to document lessons? (y/n)"
   - If yes: Ask enhancement questions, create finalized lesson
   - If no: Skip to Step 4
3. Step 4: Run `hodge ship` which stages all files (including lessons) and commits
4. Post-Ship Actions

**Lines Changed**: ~160 lines restructured (Step 5 moved to Step 3.5)

#### 2. CLI Command (src/commands/ship.ts)
**File**: `src/commands/ship.ts`

**Changes**:
- Removed call to `generateLessonsDraft()` at line 301
- Deleted entire `generateLessonsDraft()` method (~98 lines)
- Added comment explaining lessons are now handled in slash command

**Lines Removed**: ~100 lines of draft generation code

**Rationale**:
- Slash command owns entire lessons workflow
- CLI focuses on git commit mechanics
- Cleaner separation of concerns

#### 3. Smoke Tests (src/commands/hodge-324.smoke.test.ts)
**File**: `src/commands/hodge-324.smoke.test.ts` (new)

**Tests Created**: 14 smoke tests validating:
- CLI no longer has `generateLessonsDraft` method
- Ship.ts has comment about slash command handling lessons
- Pattern learning still works (separate from lessons draft)
- Template has Step 3.5 before Step 4
- Template emphasizes BEFORE commit timing
- User is asked upfront about lessons
- No lessons-draft.md references in new flow
- Finalized lesson created directly at `.hodge/lessons/`
- Git add -A stages lessons files
- No files created if user skips
- Correct step order: 3 → 3.5 → 4 → Post-Ship
- Same enhancement questions preserved
- References to HODGE-003 example maintained

**Test Results**: ✅ All 14 tests passing

### Architecture Impact

**Before**:
```
/ship slash command
  → Step 3: Approve commit message
  → Step 4: Run `hodge ship`
      → CLI creates git commit
      → CLI generates lessons-draft.md (AFTER commit)
  → Step 5: AI enhances draft to finalized lesson (AFTER commit)

Result: Lessons orphaned, never committed
```

**After**:
```
/ship slash command
  → Step 3: Approve commit message
  → Step 3.5: Optional lessons enhancement
      → Ask user y/n
      → If yes: Create finalized lesson at .hodge/lessons/
  → Step 4: Run `hodge ship`
      → CLI runs `git add -A` (stages lessons if created)
      → CLI creates git commit

Result: Lessons committed with feature automatically
```

### Key Design Decisions

All 7 decisions were formalized via `/decide`:

1. **Timing**: Lessons captured between Step 3 and Step 4 (before commit)
2. **What to commit**: Only finalized lesson (`.hodge/lessons/{feature}-{slug}.md`)
3. **User choice**: Keep lessons optional
4. **CLI responsibility**: Remove `generateLessonsDraft` entirely
5. **Skip handling**: No draft created if user skips
6. **Staging**: Existing `git add -A` handles it
7. **Template flow**: Ask upfront y/n, then proceed

### Testing Strategy

**Smoke Tests**: Verify structural changes
- Template has correct step order
- CLI code removed properly
- Workflow emphasizes timing

**No Integration Tests Needed**: This is template-only change with CLI code removal. The actual lessons workflow is tested through manual usage.

### Risk Assessment

**Low Risk**:
- Template changes are non-breaking (only reorder steps)
- CLI code removal is clean (no dependencies)
- Existing ship functionality unchanged
- Pattern learning still works independently

**Validation**:
- All smoke tests pass ✅
- Manual review of template structure ✅
- Git staging behavior verified ✅

## Files Modified

1. `.claude/commands/ship.md` - Template restructured (~160 lines modified)
2. `src/commands/ship.ts` - Removed draft generation (~100 lines deleted)
3. `src/commands/hodge-324.smoke.test.ts` - Added smoke tests (new file, 14 tests)

**Net Impact**: -100 lines (code deletion), better workflow

## Next Steps

- [x] Update slash command template
- [x] Remove CLI draft generation
- [x] Create smoke tests
- [x] Update build plan
- [ ] Manual testing: Run `/ship` on a feature to verify workflow
- [ ] Move to `/harden HODGE-324` for integration testing
- [ ] Ship with lessons committed!

## Notes

This fix aligns with Hodge's philosophy:
- **Freedom to explore**: Lessons remain optional
- **Discipline to ship**: When documented, lessons are in version control
- **Clean architecture**: Slash command (AI) handles interaction, CLI handles mechanics

The bug was subtle but impactful - lessons were being generated after commit, creating orphaned files. Now they're captured before commit and automatically staged, ensuring project knowledge stays in version control.

---
*Build completed: 2025-10-04*
*All smoke tests passing*
