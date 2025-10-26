# Test Intentions for HODGE-351

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

**Feature**: Optimize test suite performance and eliminate orphaned Vitest processes

## Performance Requirements

- [ ] **Full test suite completes in under 2 minutes**
  - Given: The full test suite with 116 test files
  - When: Running `npm test` with worker limits configured
  - Then: All tests should complete in under 2 minutes
  - Verification: Time the full test run and compare against baseline

- [ ] **Smoke tests complete in under 30 seconds**
  - Given: The smoke test suite
  - When: Running `npm run test:smoke`
  - Then: All smoke tests should complete in under 30 seconds
  - Verification: Time smoke test execution

## Resource Cleanup Requirements

- [ ] **No orphaned processes remain after test completion**
  - Given: Any test execution (full, smoke, integration, or interrupted)
  - When: Tests complete or are forcefully stopped
  - Then: No node(vitest) processes should remain in Activity Monitor
  - Verification: Check Activity Monitor before and after test runs, including interrupted runs

- [ ] **File handles are cleaned up properly**
  - Given: Tests that perform file I/O operations (28 test files with 234 operations)
  - When: Tests complete
  - Then: All file handles should be closed properly
  - Verification: No "too many open files" errors during execution

## Resource Usage Requirements

- [ ] **Peak memory usage stays under 4GB during test runs**
  - Given: The full test suite running with worker limits
  - When: Monitoring system memory during execution
  - Then: Peak memory usage should stay under 4GB (25% of available 16GB)
  - Verification: Monitor Activity Monitor during test runs

## Configuration Validation

- [ ] **Worker limits are enforced correctly**
  - Given: Vitest configuration with `maxForks: 6`
  - When: Running test suite
  - Then: No more than 6 fork processes should exist simultaneously
  - Verification: Monitor process count in Activity Monitor during test execution

## Edge Cases and Regression Prevention

- [ ] **Test isolation is maintained**
  - Given: Tests using TempDirectoryFixture (20 test files)
  - When: Running tests in parallel with worker limits
  - Then: No test interference or race conditions occur
  - Verification: All existing tests continue to pass reliably

- [ ] **Interrupted test runs clean up properly**
  - Given: Test suite running with worker limits
  - When: Pressing Ctrl+C or force-stopping the test process
  - Then: All worker processes terminate gracefully
  - Verification: Check Activity Monitor after interruption

## Notes

### Specific Test Scenarios Identified During Exploration

- **Baseline measurement needed**: Current test execution time unknown due to hanging. Must establish baseline after implementing worker limits.

- **Log flushing delays accumulate**: 100ms delays for pino log flushing across multiple workers. With 6 workers, this is manageable, but monitor for cumulative impact.

- **File I/O heavy tests**: 28 test files with 234 file operations. These may benefit from sequential execution or lower worker limits if parallel execution causes contention.

- **Machine hang with verbose reporter**: Do not use `--reporter=verbose` with full suite until worker limits are proven stable. Output buffering from unlimited workers caused complete system freeze.

### Success Metrics

After implementing Approach 2 (Hybrid Resource Management):
1. Zero manual Activity Monitor cleanups required
2. Full test suite completes reliably every time
3. Memory usage predictable and well under available RAM
4. Developer confidence in running full test suite locally

### Future Optimization Opportunities

- Per-category worker limits (smoke: 6, integration: 4, etc.)
- Identify and optimize tests >500ms individually
- Separate test config for CI vs local development

---
*Generated during exploration phase. Convert to actual tests during build phase.*