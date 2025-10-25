# Build Plan: HODGE-348

## Feature Overview
**PM Issue**: HODGE-348 (linear)
**Title**: Refine `/explore` workflow to focus on "what" rather than "how"
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Add "what" vs "how" decision framework to explore.md template
- [x] Add concrete examples (REST vs GraphQL, library choices, etc.)
- [x] Add soft turn count hints (5-7 exchanges) for conversation pacing
- [x] Add complexity signals section for /plan recommendations
- [x] Update test intention guidance (parent vs sub-feature depth)
- [x] Write smoke test to verify template structure

### Integration
- [x] No integration changes needed - template-only changes

### Quality Checks
- [x] Follow coding standards (markdown only)
- [x] Use established patterns (based on exploration recommendations)
- [x] Verify template renders correctly (all 14 smoke tests pass)
- [x] Verify examples are clear and actionable

## Files Modified
- `.claude/commands/explore.md` - Added "what" vs "how" framework, turn count hints, complexity signals, test intention depth guidance
- `src/test/explore-template-what-vs-how.smoke.test.ts` - Comprehensive smoke tests (14 tests) to verify all template changes

## Decisions Made
- **"What" vs "How" framework placement**: Added as a prominent section with concrete examples to help AI pattern-match correctly during conversations
- **Turn count as soft guidance**: 5-7 exchanges mentioned in conversation guidelines, with flexibility to conclude earlier
- **Complexity signals**: Listed 5 specific signals to help AI recognize when to recommend `/plan`
- **Test intention depth**: Differentiated between parent features (high-level) and sub-features (specific edge cases)

## Testing Notes
- **Smoke test approach**: Verify template file contains the new sections (decision framework, complexity signals, turn count hint)
- **No runtime testing needed**: These are template/documentation changes only
- **Validation**: Manual review of template structure and readability
- **Test Results**: ✅ All 14 smoke tests passed
  - "What" vs "how" framework section present
  - Concrete examples (REST/GraphQL, library choices) included
  - Turn count hint (5-7 exchanges) in conversation guidelines
  - Complexity signals section with 5 specific signals
  - Test intention depth guidance (parent vs sub-feature)

## Implementation Complete! ✅

All implementation tasks completed successfully:
- ✅ Template enhancements implemented
- ✅ Smoke tests written and passing (14/14)
- ✅ All changes staged with git

## Next Steps
1. Run full test suite to ensure no regressions: `npm test`
2. Proceed to `/harden HODGE-348` for integration tests and production validation
