# Test Intentions: HODGE-320

## Feature: Fix Flaky Timing Tests and Eliminate Remaining Hung Process Sources

### Test Strategy
Following HODGE-317.1 pattern: Replace subprocess spawning with direct function calls and filesystem assertions to eliminate hung process risk and test flakiness.

---

## Timing Test Behavior

### Should verify command success (not execution speed)
**Given** a test that runs the explore command
**When** the command executes
**Then** the test should verify success/failure only
**And** should NOT assert on elapsed time
**Because** timing assertions are inherently flaky (system load varies)

### Should rely on vitest timeout for hang detection
**Given** a command that might hang
**When** the test runs
**Then** vitest's default timeout (5s) catches hung commands
**And** no explicit timeout assertion is needed
**Because** vitest already provides timeout mechanism

---

## E2E Workflow Test Behavior

### Should use direct function calls (no subprocess)
**Given** a workflow test (ship, save-load, explore)
**When** testing the workflow
**Then** import and call command function directly
**And** do NOT spawn subprocess
**Because** subprocess spawning causes hung processes

### Should verify filesystem outcomes
**Given** a workflow that creates files
**When** workflow completes
**Then** verify expected files exist with correct content
**And** verify filesystem state matches expectations
**Because** testing outcomes, not mechanisms

### Should complete quickly (<100ms)
**Given** a workflow test using direct calls
**When** the test runs
**Then** it should complete in <100ms
**And** be 10-100x faster than subprocess version
**Because** no subprocess spawn overhead

---

## Smoke Test Behavior

### Should use direct function calls for speed
**Given** a smoke test (status, harden, ship commands)
**When** running quick sanity check
**Then** import and call command directly
**And** do NOT spawn subprocess
**Because** smoke tests should be fast (<50ms)

### Should verify command doesn't crash
**Given** any smoke test
**When** calling command
**Then** command should complete without throwing
**And** return expected result structure
**Because** smoke tests verify basic stability

---

## Subprocess Exception Behavior (if any remain)

### Should document why subprocess is necessary
**Given** a test that legitimately needs subprocess
**When** subprocess is used
**Then** test must have SUBPROCESS-REQUIRED comment
**And** comment explains why subprocess is necessary
**Because** subprocess should be exceptional, not default

### Should have aggressive timeout (1-2s max)
**Given** a subprocess-based test
**When** subprocess runs
**Then** timeout must be ≤2 seconds
**And** test fails fast if command hangs
**Because** prevents long-running hung processes

---

## General Test Behavior

### Should never create hung Node processes
**Given** any test in the suite
**When** test runs (success or failure)
**Then** no Node processes should remain after test completes
**And** no manual process termination should be required
**Because** hung processes block development and CI

### Should use temporary directories (test isolation)
**Given** any test that creates files
**When** test runs
**Then** all files created in os.tmpdir()
**And** project .hodge directory never modified
**Because** test isolation prevents data corruption

### Should provide clear error messages
**Given** a test that fails
**When** examining failure output
**Then** error message clearly indicates what failed
**And** stack trace points to actual code (not subprocess wrapper)
**Because** direct calls provide better debugging info

### Should be consistent across environments
**Given** a test suite
**When** run in CI vs local vs different machines
**Then** results should be identical (no flakiness)
**And** no timing-based or load-based failures
**Because** reliable tests build confidence

---

## Verification Behaviors

### Migration should maintain test coverage
**Given** a test migrated from subprocess to direct call
**When** migration is complete
**Then** test still verifies same behavior
**And** coverage remains ≥80%
**Because** refactoring shouldn't reduce coverage

### Should show performance improvement
**Given** tests migrated from subprocess to direct calls
**When** measuring execution time
**Then** migrated tests should be 10-100x faster
**And** total test suite time should decrease significantly
**Because** eliminating subprocess overhead improves speed

### Should eliminate flaky test failures
**Given** the explore-timing-fix test (previously flaky)
**When** running test 10 times consecutively
**Then** all 10 runs should pass
**And** zero failures due to timing variability
**Because** root cause (subprocess + timing assertions) eliminated

---

## Edge Cases & Error Handling

### Should handle command errors gracefully
**Given** a command that throws an error
**When** called directly (not via subprocess)
**Then** test should catch error clearly
**And** provide actionable error message
**Because** direct calls expose actual errors

### Should cleanup resources on test failure
**Given** a test that creates temp directories
**When** test fails before cleanup
**Then** vitest's try/finally ensures cleanup runs
**And** no temp directories leaked
**Because** test isolation includes cleanup

---

## Success Criteria

✅ **Zero hung processes**: No Node processes requiring manual termination
✅ **Zero flaky tests**: explore-timing-fix passes 100% of the time
✅ **50-100x faster**: Migrated tests show significant speed improvement
✅ **Consistent CI**: Tests pass reliably in GitHub Actions
✅ **Better errors**: Stack traces point to actual code, not subprocess wrappers

---

*Test intentions following HODGE-317.1 pattern: Direct calls + Filesystem assertions*
