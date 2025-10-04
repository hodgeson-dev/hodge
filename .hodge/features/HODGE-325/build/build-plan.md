# Build Plan: HODGE-325

## Feature Overview
**PM Issue**: HODGE-325 (linear)
**Status**: In Progress
**Feature**: Filter resolved decisions from Decisions Needed section after exploration conversation

## Implementation Checklist

### Core Implementation
- [x] Update Phase 3 template in `.claude/commands/explore.md`
- [x] Add decision tracking step (step 2) before synthesis
- [x] Define firm decision criteria (explicit choices, clear guidance, definitive answers)
- [x] Define edge case criteria (tentative, contradictory, partial)
- [x] Update preview format with two decision sections
- [x] Update synthesis coverage to include decided decisions
- [x] Update final output specification for exploration.md

### Integration
- [x] Template changes integrate with existing Phase 3 workflow
- [x] No CLI/backend changes needed (pure template/AI workflow change)
- [x] Maintains compatibility with existing exploration.md structure

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (template-based AI workflow)
- [x] Add basic validation (smoke tests)
- [x] Consider edge cases (tentative, contradictory, partial decisions)

## Files Modified
- `.claude/commands/explore.md` - Added decision tracking to Phase 3 (step 2), updated preview format, updated synthesis instructions
- `src/commands/hodge-325.smoke.test.ts` - Created 13 smoke tests validating template changes
- `src/lib/claude-commands.smoke.test.ts` - Updated 2 existing tests to match new preview format (HODGE-325 template changes)

## Decisions Made
- **Template-only implementation**: This is purely an AI workflow change via template updates. No backend code changes needed since the AI (Claude Code) executes the template instructions during `/explore` command.
- **Decision tracking as step 2**: Placed decision tracking before synthesis (step 3) so the AI can filter decisions before generating the preview.
- **Two-list approach**: "Decided during exploration" shows resolved items, "Decisions Needed" shows only unresolved items or "No Decisions Needed" if empty.
- **Edge case preservation**: Tentative, contradictory, and partial decisions remain in "Decisions Needed" to ensure user review for uncertain items.
- **Example-driven criteria**: Included concrete examples ("use approach A", "probably X, but not sure") to guide AI decision classification.

## Testing Notes
- **Smoke test coverage**: 13 tests verify template structure, decision tracking instructions, preview format, edge case handling, and step ordering
- **Test focus**: Validate template content (not execution) since this is an AI workflow change
- **All tests passing**: ✓ 13/13 smoke tests pass
- **No integration tests needed**: Template changes don't affect system behavior, only AI execution flow

## Implementation Summary

This feature was implemented entirely through template changes to `.claude/commands/explore.md`. The changes guide Claude Code to:

1. **Track decisions during Phase 2 conversation** by reviewing user responses
2. **Classify decisions** as firm (resolved) or edge cases (needs review)
3. **Filter the "Decisions Needed" section** to show only unresolved items
4. **Display transparency** via "Decided during exploration" summary
5. **Show bold "No Decisions Needed"** when everything is resolved

The implementation follows the "Conversation Tracking with Smart Filtering" approach from the exploration, using language cues to identify firm decisions and preserving edge cases for user review.

## Next Steps
After implementation:
1. ✓ Run smoke tests with `npm run test:smoke -- hodge-325` (PASSED)
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-325` for integration testing
