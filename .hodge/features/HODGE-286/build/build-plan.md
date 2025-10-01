# Build Plan: HODGE-286

## Feature Overview
**PM Issue**: HODGE-286 (linear)
**Status**: In Progress
**Purpose**: Implement automatic lessons learned generation during ship command

## Implementation Checklist

### Core Implementation
- [x] Add `generateLessonsDraft()` method to ship.ts
- [x] Create lessons template with objective data sections
- [x] Extract metrics from test results and pattern learner
- [x] Generate draft file in `.hodge/features/{feature}/ship/lessons-draft.md`

### Integration
- [x] Integrate lessons generation after quality gates pass
- [x] Add lessons creation to ship output logging
- [x] Ensure non-blocking - ship continues even if lessons fail
- [x] Add cleanup for empty/minimal drafts

### Quality Checks
- [x] Follow existing ship.ts patterns
- [x] Use async-parallel-operations pattern
- [x] Add proper error handling with try-catch
- [x] Ensure no interactive prompts

## Files Modified
<!-- Track files as you modified them -->
- `src/commands/ship.ts` - Added generateLessonsDraft method and integrated into workflow
- `src/test/ship-lessons.smoke.test.ts` - Created 5 smoke tests for lessons generation

## Decisions Made
<!-- Document any implementation decisions -->
- **Hybrid approach**: CLI creates objective draft, AI enhances with insights
- **Non-blocking**: Lessons generation failure won't prevent ship
- **Cleanup empty drafts**: Remove drafts with no meaningful content
- **Location**: Store in `.hodge/features/{feature}/ship/` for draft, final in `.hodge/lessons/`

## Testing Notes
<!-- Notes for testing approach -->
- 5 smoke tests created and passing for lessons generation
- Tests verify method exists, is called, handles cleanup, and is non-blocking
- Tests check that draft includes objective metrics and proper structure

## Implementation Summary
✅ Successfully implemented automatic lessons learned generation:
- CLI creates objective draft with metrics, changes, and patterns
- Draft saved to `.hodge/features/{feature}/ship/lessons-draft.md`
- Empty drafts are automatically cleaned up
- Non-blocking - ship continues even if lessons fail
- AI can enhance draft with insights via slash command

## Next Steps
After implementation:
1. ✅ Run tests with `npm test` - All smoke tests passing
2. ✅ Check linting with `npm run lint` - No errors
3. ✅ TypeScript check - No errors
4. ✅ Build successful
5. Ready to proceed to `/harden HODGE-286` for production readiness
