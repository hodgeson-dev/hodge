# Feature Exploration: HODGE-317

**Title**: Fix hung Node processes in test-isolation integration tests

## Problem Statement

Two integration tests in `src/test/test-isolation.integration.test.ts` spawn vitest subprocesses via `execSync('npx vitest run ...')` to verify test isolation. When vitest hangs in these subprocesses, they become orphaned processes that must be manually killed in Activity Monitor, causing CI/local test timeouts and blocking development.

**Root cause**: Tests are spawning **full vitest runs** as subprocesses to verify test isolation. When vitest hangs:
- The subprocess never completes
- `execSync` blocks waiting forever
- Parent test times out after 5-10 seconds
- Hung subprocess keeps running as zombie process
- Accumulates orphaned Node processes that consume resources

This is fundamentally an architectural issue: **spawning vitest to test vitest's test isolation** is inherently fragile.

## Conversation Summary

### The Discovery Process

Initial symptoms suggested flaky timeout issues, but deeper investigation revealed the true problem:

1. **Not a timeout issue** - Tests aren't slow, they're **hung**
2. **Zombie processes** - Hung vitest subprocesses become orphaned and must be manually killed
3. **No visibility** - Can't debug what's hanging inside the subprocess
4. **Architectural flaw** - Using `execSync('npx vitest run ...')` to verify test isolation creates dependency on vitest subprocess stability

### What's Happening

**Lines 103-135**: Spawns `npx vitest run src/lib/session-manager.test.ts` three times sequentially, checking .hodge/saves hasn't changed. When one vitest subprocess hangs, entire test blocks.

**Lines 137-186**: Spawns four separate `npx vitest run` commands sequentially. If any subprocess hangs, test blocks and subsequent subprocesses never run.

Each subprocess:
- Starts new Node process
- Loads vitest infrastructure
- Runs tests
- **May hang** during config load, test execution, or teardown
- Leaves orphaned process if hung

### Key Insights from HODGE-308

The HODGE-308 lesson documented successful test isolation fixes using the basePath pattern. Those tests verify isolation **without spawning subprocesses** - they use direct filesystem assertions.

**We should follow the same pattern here**: Verify test isolation through filesystem state, not subprocess execution.

### Separate Issue Identified

CI "Quality Checks" workflow fails with `ERR_REQUIRE_ESM` in Node 18.x before even running tests. This is a separate vitest/vite configuration issue tracked as **HODGE-318**.

## Implementation Approaches

### Approach 1: Redesign Without Subprocess Spawning (Recommended)

**Description**: Remove all `execSync('npx vitest run ...')` calls. Instead, verify test isolation directly by checking filesystem state before/after importing and running test functions.

**How it works**:
- Import test files directly (not spawn subprocess)
- Capture filesystem state before test
- Run test function
- Verify filesystem state unchanged
- Check for leftover temp directories
- No subprocess spawning = no hung processes

**Pros**:
- Eliminates hung subprocess problem entirely
- Faster tests (no vitest startup overhead)
- Better debugging (can see what's happening)
- No zombie processes
- Follows HODGE-308 pattern
- Can use vitest's built-in parallel test isolation

**Cons**:
- Less realistic (not testing via CLI)
- Requires restructuring test execution
- May miss CLI-specific isolation issues

**When to use**: When you need reliable, fast, debuggable test isolation verification.

---

### Approach 2: Add Subprocess Timeout & Cleanup

**Description**: Keep subprocess spawning but add aggressive timeouts and process cleanup to prevent zombies.

**How it works**:
- Use `execFileSync` with `timeout` option (e.g., 5000ms)
- Catch timeout errors and kill subprocess tree
- Track spawned PIDs and ensure cleanup
- Add retry logic for transient hangs

**Pros**:
- Tests actual CLI execution
- Catches CLI-specific issues
- Minimal test restructuring

**Cons**:
- Doesn't fix underlying hang issue
- Still creates zombie processes on failure
- Harder to debug what's hanging
- Slower tests (vitest startup overhead)
- May still flake if cleanup fails

**When to use**: Only if CLI-specific test isolation is critical and subprocess hang is rare.

---

### Approach 3: Hybrid - Direct Testing + Smoke Test

**Description**: Most tests use direct filesystem assertions (Approach 1). Add one lightweight smoke test that spawns subprocess with aggressive timeout.

**How it works**:
- 3 tests use direct filesystem verification (fast, reliable)
- 1 test spawns subprocess with 3s timeout as CLI smoke test
- Best of both worlds

**Pros**:
- Reliable core tests
- Still catches CLI issues
- Minimal zombie risk (only 1 subprocess)
- Fast test suite

**Cons**:
- Some code duplication
- Still has one potential hang point
- More complex test architecture

**When to use**: If you want both speed/reliability AND CLI validation.

## Recommendation

**Approach 1: Redesign Without Subprocess Spawning** is strongly recommended.

**Rationale**:
1. **Eliminates root cause** - No subprocesses = no hung processes
2. **Proven pattern** - HODGE-308 successfully used direct filesystem assertions
3. **Better developer experience** - No manual process killing needed
4. **Faster tests** - No vitest startup overhead (4x spawns → 0 spawns)
5. **More reliable CI** - No flaky subprocess hangs
6. **Easier debugging** - Can step through test execution

The goal is **test isolation verification**, not **CLI subprocess management**. We can achieve the goal more reliably without subprocesses.

### Implementation Strategy

1. **Test 1 (parallel execution)**: Use vitest's built-in parallel test execution instead of spawning
2. **Test 2 (cleanup on failure)**: Create failing test directly, verify cleanup
3. **Test 3 (isolation between runs)**: Import session-manager tests directly, run 3x, check filesystem
4. **Test 4 (no project leakage)**: Import tests directly, verify no .hodge modifications

All verification via filesystem assertions - no subprocess spawning.

## Test Intentions

### Behavioral Expectations

1. **Should verify test isolation without spawning subprocesses**
   - Given: Test isolation verification needed
   - When: Tests run with direct filesystem assertions
   - Then: Isolation verified without hung processes

2. **Should complete without leaving zombie Node processes**
   - Given: All 4 test-isolation tests executed
   - When: Tests complete (pass or fail)
   - Then: No orphaned Node processes remain (verify via `ps aux | grep node`)

3. **Should pass consistently in both local and CI environments**
   - Given: Redesigned tests without subprocess spawning
   - When: Tests run 10+ times locally and in CI
   - Then: 100% pass rate with no timeouts

4. **Should verify same isolation guarantees as before**
   - Given: Tests redesigned without subprocesses
   - When: Tests verify parallel execution, cleanup, repeated runs, project protection
   - Then: All isolation requirements still enforced

## Decisions Needed

No decisions needed - clear path forward with Approach 1.

**Next step**: `/build HODGE-317` to implement the redesign.

---

## Related Issues

- **HODGE-318** (to be created): Fix CI ERR_REQUIRE_ESM in Node 18.x - separate vitest/vite config issue
- **HODGE-308**: Established basePath pattern for test isolation - reference implementation

---

**Exploration completed**: 2025-10-02
**Updated after conversational discovery**: 2025-10-02
