# Build Plan: HODGE-298

## Feature Overview
**PM Issue**: HODGE-298 (linear)
**Status**: In Progress
**Description**: Fix plan command to require approval before creating PM issues, format epic/story titles correctly, and include all decisions

## Implementation Checklist

### Core Implementation
- [x] Update plan.ts to require --create-pm flag for PM issue creation
- [x] Add getFeatureDescription() method to extract epic description from exploration.md
- [x] Fix epic title format to include description (HODGE-XXX: Description)
- [x] Fix story title format to include ID prefix (HODGE-XXX.Y: Description)
- [x] Pass all decision titles (not just plan summary) to PM hook
- [x] Update /plan slash command template for interactive approval workflow

### Testing
- [x] Write 5 smoke tests for plan command changes
- [x] Verify all smoke tests pass (5/5 passing)

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (getFeatureDescription follows existing pattern)
- [x] Add inline documentation (method JSDoc added)
- [x] Consider edge cases (fallback descriptions, missing files)

## Files Modified

### CLI Implementation
- `src/commands/plan.ts` - Core changes:
  - Added `createPm` option to PlanOptions interface
  - Changed default behavior to NOT create PM issues (safe by default)
  - Added `getFeatureDescription()` method to extract description from exploration.md
  - Updated `createPMStructure()` to format epic title as "HODGE-XXX: Description"
  - Updated story titles to format as "HODGE-XXX.Y: Description"
  - Changed to pass all decision titles to PM hook (not just plan summary)
  - Added user-friendly message when --create-pm not specified

### Slash Command Template
- `.claude/commands/plan.md` - Updated workflow:
  - Added 4-phase execution flow documentation
  - Phase 1: AI generates plan (no CLI call)
  - Phase 2: AI displays and refines with user (interactive)
  - Phase 3: Save plan locally with `hodge plan {{feature}}` (after approval)
  - Phase 4: Create PM issues with `hodge plan {{feature}} --create-pm` (only if user chooses)
  - Added critical note: NEVER call `hodge plan` with `--create-pm` without explicit user approval
  - Updated examples to show approval workflow

### Tests
- `src/commands/plan.test.ts` - New smoke tests:
  - Test creating plan without decisions (handles gracefully)
  - Test creating plan locally without --create-pm flag
  - Test extracting feature description from exploration.md
  - Test handling feature with multiple decisions
  - Test respecting lane allocation parameter
  - All tests use isolated temp directories (no project corruption)

## Decisions Implemented

Based on HODGE-298 decisions:

1. **PM Creation Approval**: Interactive approval in /plan slash command template - AI generates and refines plan with user, then calls CLI with --create-pm only after approval
2. **Epic Title Source**: Extract description from exploration.md Problem Statement or Feature Overview
3. **Decision List Format**: List decision titles only in PM issues (full details in decisions.md)
4. **Backward Compatibility**: Breaking change - require --create-pm flag (safe by default, hodge plan only called from slash command)
5. **Story Title Format**: Use "HODGE-XXX.Y: Description" format

## Testing Results

```
✓ src/commands/plan.test.ts  (5 tests | 5 passed)
  ✓ [smoke] should not crash when creating plan without decisions
  ✓ [smoke] should create plan locally without --create-pm flag
  ✓ [smoke] should extract feature description from exploration.md
  ✓ [smoke] should handle feature with multiple decisions
  ✓ [smoke] should respect lane allocation parameter
```

All smoke tests passing. Ready for hardening phase.

## Next Steps
1. ✓ Run smoke tests - PASSED
2. Run full test suite with `npm test`
3. Check linting with `npm run lint`
4. Review changes
5. Proceed to `/harden HODGE-298` for production readiness
