# Build Plan: HODGE-315

## Feature Overview
Fix /plan command to check feature-specific decisions files
**PM Issue**: fb71c530-60ff-471d-b3e1-58afa09c0ef9
**Status**: ✅ Complete

## Implementation Checklist

### Core Implementation
- [x] Refactor analyzeDecisions() to use cascading file check
- [x] Add checkFeatureDecisions() helper method
- [x] Add extractFromExploration() helper method
- [x] Add checkUncoveredDecisions() helper method
- [x] Add parseDecisionsFromMarkdown() shared parser
- [x] Include comprehensive documentation

### Integration
- [x] Maintains backward compatibility with global decisions.md
- [x] Works with existing PM tools integration
- [x] No breaking changes to public API

### Quality Checks
- [x] Follows coding standards (TypeScript strict mode)
- [x] Uses established patterns (cascading fallback)
- [x] Handles edge cases (empty files, malformed content)
- [x] Comprehensive error handling

## Files Modified
- `src/commands/plan.ts` - Added cascading decision loading with 5 new helper methods (src/commands/plan.ts:118-315)
- `src/commands/plan.smoke.test.ts` - Added 6 new smoke tests for cascading logic (src/commands/plan.smoke.test.ts:124-304)

## Decisions Made
1. **Cascading Strategy**: Check feature-specific → exploration → global in that order
2. **Recommendation Extraction**: Extract from `## Recommendation` section when decisions.md missing
3. **Uncovered Decision Handling**: Show warning but continue (non-blocking, respects user agency)
4. **Source Tracking**: Implemented internally via method structure (no explicit type needed for build phase)

## Testing Results
- ✅ All 11 smoke tests passing
- ✅ All 652 tests in full suite passing
- ✅ Backward compatibility verified with HODGE-313
- ✅ No TypeScript errors
- ✅ Successfully tested with HODGE-315 (dogfooding!)

## Next Steps
1. ✅ Tests passing - Ready for harden phase
2. Run `/harden HODGE-315` to add integration tests
3. Test with more complex scenarios
4. Add performance benchmarks if needed
