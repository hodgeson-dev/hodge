# Build Plan: HODGE-304

## Feature Overview
**PM Issue**: HODGE-304 (linear)
**Status**: Complete
**Description**: Fix test isolation leak in local-pm-adapter-unified.smoke.test.ts

## Implementation Checklist

### Core Implementation
- [x] Identify tests creating LocalPMAdapter without basePath
- [x] Wrap test 1 (should extend BasePMAdapter) with withTestWorkspace
- [x] Wrap test 2 (should implement all abstract methods) with withTestWorkspace
- [x] Wrap test 3 (should fetch Hodge workflow states) with withTestWorkspace
- [x] Verify all tests use isolated temp directories

### Integration
- [x] Verify compatibility with existing withTestWorkspace pattern
- [x] Ensure no breaking changes to test behavior
- [x] Maintain consistency with other tests in same file

### Quality Checks
- [x] Follow established test patterns
- [x] Use existing test infrastructure
- [x] All smoke tests pass (12/12)
- [x] Test isolation integration test passes (4/4)

## Files Modified
- `src/lib/pm/local-pm-adapter-unified.smoke.test.ts` - Fixed three tests that were creating LocalPMAdapter() without basePath parameter:
  - Line 14-19: Wrapped "should extend BasePMAdapter" with withTestWorkspace('local-adapter-extends')
  - Line 21-32: Wrapped "should implement all abstract methods" with withTestWorkspace('local-adapter-methods')
  - Line 71-81: Wrapped "should fetch Hodge workflow states" with withTestWorkspace('local-adapter-states')

## Decisions Made
- **Use withTestWorkspace for all three tests**: Chose consistency over minimal changes. Even type-checking tests benefit from isolation in case future changes add side effects.
- **Workspace naming convention**: Used descriptive names (local-adapter-extends, local-adapter-methods, local-adapter-states) matching existing pattern in the file.
- **No implementation changes**: Only test code modified - no changes to LocalPMAdapter or other production code needed.

## Testing Notes
- All 12 smoke tests in local-pm-adapter-unified.smoke.test.ts pass
- Critical test isolation integration test now passes (was failing before)
- Tests now use isolated temp directories via withTestWorkspace
- No project state modifications during test runs
- Verified with: npx vitest run src/lib/pm/local-pm-adapter-unified.smoke.test.ts
- Verified with: npx vitest run src/test/test-isolation.integration.test.ts

## Root Cause Analysis
The three tests were instantiating `new LocalPMAdapter()` without a basePath parameter. LocalPMAdapter's constructor defaults basePath to `.` (current directory), causing it to create `.hodge/project_management.md` in the real project directory instead of isolated temp directories. The test isolation integration test detected this leak using a marker file approach.

## Next Steps
After implementation:
1. ✅ Run smoke tests - PASSED (12/12)
2. ✅ Run test isolation test - PASSED (4/4)
3. ✅ Run full test suite - PASSED (611/611 tests, 70/70 files)
4. ✅ Run linting - PASSED (0 errors, pre-existing warnings only)
5. ✅ Run typecheck - PASSED (no type errors)

## Build Complete
Ready for CI verification. Fix is minimal, well-tested, and follows project standards.
