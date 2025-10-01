# Build Plan: HODGE-299 - Lessons Workflow

## Feature Overview
**PM Issue**: HODGE-299 (linear)
**Status**: In Progress
**Description**: Bridge gap between lessons-draft.md and finalized lessons through interactive AI enhancement

## Implementation Checklist

### Core Implementation
- [x] Update /ship slash command template with interactive lessons flow
- [x] Add 3-4 enhancement questions for user insights
- [x] Implement skip mechanism (interactive y/n prompt)
- [x] Add lessons finalization logic (create .hodge/lessons/ directory)
- [x] Implement {FEATURE}-{slug}.md naming convention
- [x] Add draft preservation (keep lessons-draft.md)
- [x] Include AI analysis integration (git diff, exploration, decisions)

### Integration
- [x] Integrated into /ship slash command (ship.md)
- [x] Uses existing lessons-draft.md from ship.ts
- [x] Creates finalized lessons in .hodge/lessons/ directory
- [x] Preserves draft in feature/ship/ directory

### Quality Checks
- [x] Follows interactive-next-steps pattern
- [x] Uses progressive enhancement approach
- [x] Respects user choice (skip option)
- [x] Clear documentation with examples
- [x] References existing lesson (HODGE-003) as template

## Files Modified
- `.claude/commands/ship.md` - Added Step 5 with interactive lessons enhancement flow, 4 enhancement questions, finalization logic, and skip mechanism
- `src/commands/ship-lessons.test.ts` - Created 5 smoke tests for lessons workflow

## Decisions Made
- **Implementation**: All via /ship slash command template (AI-driven, not CLI code changes)
- **Question Count**: 4 questions (What Worked Well, What to Improve, Gotchas, Pattern Potential)
- **Skip Flow**: Interactive prompt "Would you like to document lessons?" with y/n response
- **File Naming**: {FEATURE}-{slug}.md format for discoverability (e.g., HODGE-299-lessons-workflow.md)
- **Draft Handling**: Preserve lessons-draft.md in feature directory as audit trail

## Testing Notes
All 5 smoke tests passing:
1. ✅ Lessons-draft structure supports ship workflow
2. ✅ Missing draft handled gracefully (expected for no-change features)
3. ✅ Lessons directory creation works correctly
4. ✅ Draft preservation after finalization (both files exist)
5. ✅ Descriptive slug naming convention validated

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-299` for production readiness
