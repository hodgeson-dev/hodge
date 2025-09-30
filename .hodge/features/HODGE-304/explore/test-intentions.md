# Test Intentions for HODGE-304

## Purpose
Fix test isolation violation in `local-pm-adapter-unified.smoke.test.ts` to prevent tests from creating files in the project's `.hodge` directory.

## Core Requirements
- [x] Fix should not break any existing tests
- [x] Fixed tests should complete within reasonable time
- [x] Tests should use isolated temp directories
- [x] Tests should not modify project state

## Test Isolation Requirements
- [x] `should extend BasePMAdapter` test must use withTestWorkspace
- [x] `should implement all abstract methods` test must use withTestWorkspace
- [x] `should fetch Hodge workflow states` test must use withTestWorkspace
- [x] All three tests should pass after modification
- [x] Integration test `should prevent test data from leaking into project` should pass

## Verification Tests
- [x] Run modified smoke tests - should pass
- [x] Run test-isolation integration test - should pass
- [x] Run full test suite - all 654 tests should pass
- [x] Verify no `.hodge/project_management.md` created during test runs

## Regression Prevention
- [ ] Consider adding constructor parameter validation (future enhancement)
- [ ] Consider adding project-level test that verifies no project state modification
- [ ] Document pattern in test-pattern.md if not already covered

## Notes
Edge cases and scenarios:
- LocalPMAdapter constructor defaults to `.` when basePath is undefined
- withTestWorkspace already provides automatic cleanup
- This pattern is already used in 5+ other tests in the same file
- The fix is straightforward: wrap the three tests with withTestWorkspace
- No implementation changes needed, only test code changes

---
*Generated during exploration phase. Convert to actual tests during build phase.*