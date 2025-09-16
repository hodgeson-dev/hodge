# Decision: Delete All Skipped Tests

## Decision Date
2025-01-19

## Context
After implementing our progressive testing strategy, we have 47 tests marked as skipped because they test implementation details rather than behavior. We explored three approaches for handling these tests.

## Options Considered
1. **Complete Deletion** - Remove all skipped tests
2. **Convert to Documentation** - Transform into examples
3. **Keep as Artifacts** - Leave them skipped with comments

## Decision
**We will proceed with Approach 1: Complete Deletion**

## Rationale
1. **Philosophical Alignment**: Keeping implementation tests (even skipped) contradicts our "test behavior, not implementation" principle
2. **Clarity**: Removes ambiguity about what kinds of tests are valuable
3. **Maintainability**: Reduces codebase clutter and cognitive overhead
4. **Version Control**: Git history preserves these tests if ever needed
5. **Confidence**: Our 265 behavioral tests provide comprehensive coverage

## Implementation Plan
1. Document what we're removing in a detailed commit message
2. Extract any reusable test utilities before deletion
3. Delete tests in logical groups:
   - Console output tests
   - Mock verification tests
   - Internal state tests
   - Performance tests
4. Update TEST-STRATEGY.md with anti-patterns section
5. Verify all remaining tests still pass

## Success Criteria
- All 47 skipped tests removed
- 265 behavioral tests still passing
- Documentation updated with examples of what NOT to test
- No broken imports or references
- Clean test output with no skipped tests

## Risks & Mitigations
- **Risk**: Losing useful test patterns
  - **Mitigation**: Document anti-patterns in TEST-STRATEGY.md
- **Risk**: Need to reference old tests
  - **Mitigation**: Git history preserves everything
- **Risk**: Missing test utilities
  - **Mitigation**: Extract utilities before deletion

## Review Notes
This decision aligns with our commitment to:
- Rapid iteration
- Clear, focused testing
- Behavior-driven development
- Maintainable codebase

The skipped tests have served their purpose - they helped us identify and articulate what we DON'T want to test. Now they can be removed to prevent confusion and maintain clarity.

## Next Action
Proceed to `/build skipped-test-cleanup` to implement this decision.