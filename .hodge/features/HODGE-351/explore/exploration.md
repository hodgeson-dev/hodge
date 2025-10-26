# Exploration: HODGE-351

## Feature Overview
**PM Issue**: HODGE-351
**Type**: general
**Created**: 2025-10-25T21:53:58.813Z
**Title**: Optimize test suite performance and eliminate orphaned Vitest processes

## Problem Statement

The test suite spawns 10-20 orphaned node(vitest) processes that hang during test execution, requiring manual cleanup in Activity Monitor. With 116 test files running on a 16GB machine, the current Vitest configuration uses `pool: 'forks'` with `isolate: true` but **no worker limits**, leading to resource exhaustion and system hangs.

The issue manifests as:
- 10-20 orphaned Vitest processes during test runs (not after completion)
- Complete machine hang when using verbose reporter (memory/output buffering overload)
- Unpredictable test execution times
- Manual cleanup required in Activity Monitor after each test run

## Context Discovery

### Investigation Findings

**Configuration Analysis** (vitest.config.ts:9-11):
- Using `pool: 'forks'` for test isolation ✅ (correct for file system isolation)
- `isolate: true` enabled ✅ (correct for preventing test interference)
- **No worker/thread limits configured** ❌ (root cause of resource exhaustion)

**Test Suite Characteristics**:
- 116 total test files across the codebase
- 234 file I/O operations across 28 test files
- Cleanup hooks present in 42 files (afterEach/afterAll)
- TempDirectoryFixture pattern used in 20 files ✅
- Test categories: smoke, integration, unit, acceptance

**No Evidence Of**:
- Subprocess spawning (properly mocked in detection.test.ts)
- Long-running timers (only 50-100ms delays for log flushing)
- Missing cleanup hooks in critical areas

**Resource Exhaustion Pattern**:
With unlimited workers, Vitest spawns one fork per test file by default:
- 116 test files → potentially 116 fork processes
- Each fork: ~50-200MB base memory + file handles + test overhead
- 16GB RAM ÷ ~100MB per fork = ~160 theoretical max (but system overhead reduces this)
- 10-20 orphaned processes suggests workers hang before cleanup

### Relevant Context

**Standards** (.hodge/standards.md):
- Performance Standards: CLI commands <500ms, Tests <30s total, Build <30s
- Test Isolation Requirement: Use temp directories, no project state modification
- Subprocess Spawning Ban (HODGE-317.1): Tests must never spawn subprocesses

**Lessons Learned**:
- HODGE-317.1 (2025-09-30): Eliminated subprocess spawning to fix hung processes
- HODGE-319.1 (2025-10-03): Fixed regression, codified subprocess ban
- HODGE-341.5 (2025-10-13): TempDirectoryFixture pattern prevents race conditions

**Related Patterns**:
- `.hodge/patterns/temp-directory-fixture-pattern.md`: Proper file I/O isolation
- `.hodge/patterns/test-pattern.md`: Test behavior, not implementation

## Implementation Approaches

### Approach 1: Conservative Worker Limits (Quick Fix)
**Description**: Add explicit worker/thread limits to Vitest configuration without changing test isolation strategy.

**Implementation**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'forks',
    isolate: true,
    poolOptions: {
      forks: {
        maxForks: 4,        // Limit concurrent workers
        minForks: 1,
      }
    },
    fileParallelism: false, // Run test files sequentially
  }
});
```

**Pros**:
- Minimal configuration change (2-3 lines)
- Immediate fix for resource exhaustion
- Maintains current isolation guarantees
- No test code changes required
- Safe and predictable behavior

**Cons**:
- Test execution will be slower (sequential file processing)
- Doesn't address potentially slow individual tests
- May not fully utilize available CPU cores
- Conservative approach trades speed for safety

**When to use**: When stability is prioritized over speed, or as a temporary measure while investigating deeper optimizations.

### Approach 2: Hybrid Resource Management (Balanced)
**Description**: Combine moderate worker limits with selective test isolation and categorization-based parallelism.

**Implementation**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 6,        // Conservative based on typical 8-core machines
        minForks: 2,
      }
    },
    // Selective isolation
    isolate: true,          // Default isolation for safety
    fileParallelism: true,  // Allow parallel execution within limits
  }
});
```

Plus categorize tests for targeted execution:
- Smoke tests: Fast, isolated, parallel (max 6 workers)
- Integration tests: Moderate isolation, limited parallelism (max 4 workers)
- Tests with heavy file I/O: Sequential execution

**Pros**:
- Balances performance and resource usage
- Allows targeted optimization per test category
- Utilizes available cores without exhaustion
- Enables fast feedback loop for smoke tests
- Maintains isolation where critical

**Cons**:
- Requires tuning worker counts to specific machine
- More complex configuration
- May need per-category vitest configs
- Requires test categorization discipline

**When to use**: For production use where both speed and reliability matter, and test suite will continue to grow.

### Approach 3: Aggressive Optimization (Maximum Performance)
**Description**: Optimize for speed by using threads instead of forks, selective isolation, and identifying/fixing slow tests.

**Implementation**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads',        // Faster than forks
    poolOptions: {
      threads: {
        maxThreads: 8,
        minThreads: 4,
      }
    },
    isolate: false,         // Disable isolation for speed
    sequence: {
      concurrent: true,
    }
  }
});
```

Plus active slow test identification:
- Run tests with `--reporter=verbose` in controlled environment
- Identify tests >500ms
- Refactor or remove tests that don't justify execution time
- Move heavy I/O tests to separate suite

**Pros**:
- Maximum speed and throughput
- Better resource utilization
- Proactive slow test management
- Scales well with hardware

**Cons**:
- Higher risk of test interference (isolate: false)
- Threads don't isolate file system state (breaks current assumptions)
- Requires significant test refactoring
- May introduce flaky tests
- **INCOMPATIBLE** with current file I/O patterns (TempDirectoryFixture expects isolation)

**When to use**: Only if willing to refactor tests to not rely on file system isolation, or for unit tests that don't touch filesystem.

## Recommendation

**Use Approach 2: Hybrid Resource Management**

**Rationale**:
1. **Addresses root cause**: Limits worker forks to prevent resource exhaustion
2. **Maintains safety**: Keeps isolation guarantees that existing tests depend on
3. **Pragmatic performance**: 6 workers on typical 8-core machines provides good parallelism without overload
4. **Incremental optimization**: Can tune worker counts based on actual performance metrics
5. **Aligns with standards**: Supports <30s test execution target while maintaining test isolation requirement
6. **Future-proof**: Scales as test suite grows, with ability to tune per test category

**Implementation Plan**:
1. Add `poolOptions.forks.maxForks: 6` to vitest.config.ts
2. Run full test suite and measure execution time
3. If smoke tests still timeout, create separate config with `maxForks: 4`
4. Monitor for orphaned processes (should be eliminated)
5. Tune worker count based on empirical data

**Success Criteria**:
- Zero orphaned processes after test runs
- Full suite completes in <2 minutes
- Smoke tests complete in <30 seconds
- Peak memory usage stays under 4GB

## Test Intentions

### Behavioral Expectations

1. **Performance: Full test suite completion time**
   - **Given** the full test suite with 116 test files
   - **When** running `npm test`
   - **Then** all tests should complete in under 2 minutes
   - **Verification**: Time the full test run with worker limits

2. **Resource cleanup: No orphaned processes**
   - **Given** any test execution (full, smoke, integration)
   - **When** tests complete or are interrupted
   - **Then** no node(vitest) processes should remain in Activity Monitor
   - **Verification**: Check Activity Monitor before/after test runs

3. **Performance: Smoke test execution time**
   - **Given** the smoke test suite
   - **When** running `npm run test:smoke`
   - **Then** all smoke tests should complete in under 30 seconds
   - **Verification**: Time smoke test execution

4. **Resource usage: Memory consumption**
   - **Given** the full test suite running
   - **When** monitoring system memory during execution
   - **Then** peak memory usage should stay under 4GB
   - **Verification**: Monitor Activity Monitor during test runs

5. **Resource cleanup: File handle management**
   - **Given** tests that perform file I/O operations
   - **When** tests complete
   - **Then** all file handles should be closed properly
   - **Verification**: No "too many open files" errors during execution

## Decisions Decided During Exploration

1. ✓ **Keep `pool: 'forks'` for test isolation** - Required for file system isolation that TempDirectoryFixture and 20+ test files depend on. Switching to threads would break existing test assumptions.

2. ✓ **Maintain test categorization strategy** - Current smoke/integration/unit/acceptance categories enable targeted test runs and will support per-category tuning.

3. ✓ **TempDirectoryFixture pattern is correct** - Proper approach for file I/O isolation. Don't change this; it prevents race conditions (HODGE-341.5).

4. ✓ **Add explicit worker limits** - Root cause is unlimited workers. Must cap `maxForks` to prevent resource exhaustion.

## Decisions Needed

1. **Maximum worker count for full test suite** - Recommend starting with 6 (conservative for 8-core machines), but may need tuning based on:
   - Actual CPU core count on development/CI machines
   - Available RAM (current: 16GB)
   - Observed performance metrics
   - Should we configure different limits for CI vs local development?

2. **Per-category worker limits** - Should smoke/integration/unit tests use different `maxForks` values?
   - Smoke tests might benefit from more parallelism (faster, less resource-intensive)
   - Integration tests might need more conservative limits (heavier I/O)
   - Or keep it simple with one global limit?

3. **Test suite execution time target** - What's acceptable?
   - Current: Unknown (can't run without hanging)
   - Proposed: <2 minutes for full suite, <30s for smoke tests
   - CI environment may have different constraints than local development

## Next Steps
- [ ] Use `/decide` to make worker limit decisions
- [ ] Proceed to `/build HODGE-351` to implement the configuration changes
- [ ] Add performance monitoring to track improvements

---
*Exploration completed: 2025-10-25*
*Ready for decision phase*
