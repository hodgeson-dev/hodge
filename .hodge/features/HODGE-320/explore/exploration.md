# Exploration: HODGE-320

**Title**: Fix Flaky Timing Tests and Eliminate Remaining Hung Process Sources

## Problem Statement

Despite fixing subprocess spawning in HODGE-317.1, we still experience flaky timing tests and hung Node processes. Investigation revealed that **15 test files** still use subprocess spawning via `runCommand()`/`runHodge()`/`withTestWorkspace()`, which can create orphaned processes when commands hang. The `explore-timing-fix.integration.test.ts` test is particularly flaky due to timing assertions on subprocess execution under varying system load.

## Conversation Summary

### Investigation Process
We systematically investigated the sources of hung processes and flaky tests:

1. **Checked for subprocess spawning**: Found 15 test files still using `exec()` under the hood through test helpers
2. **Analyzed timing test behavior**: Discovered it spawns subprocesses and asserts on elapsed time (inherently flaky)
3. **Categorized affected tests**: Grouped 15 files into 6 categories by testing purpose and subprocess necessity

### Root Causes Identified

**Root Cause 1: Incomplete Subprocess Elimination**
HODGE-317.1 eliminated subprocess spawning from `test-isolation.integration.test.ts` but missed 15 other test files that use the same pattern through `withTestWorkspace()` and `runHodge()` helpers. These all call `exec()` under the hood:

```typescript
// src/test/runners.ts
export async function runCommand(cmd: string, options = {}) {
  const { timeout = 10000 } = options;
  const result = await execAsync(cmd, { timeout, ... }); // exec() can hang!
  return result;
}
```

**Root Cause 2: Timing Assertions on Variable Operations**
The timing test checks `elapsed < 6000ms` on subprocess execution. This is flaky because:
- Subprocess spawn overhead varies (100-500ms based on system load)
- CI/local performance differs significantly
- Test might pass at 5.5s, fail at 6.1s (not a real failure)

**Root Cause 3: No Aggressive Timeouts**
Tests use 10-second default timeout from `runCommand()`. If a subprocess hangs:
- Takes 10 seconds to fail (slow feedback)
- May leave orphaned processes even after timeout
- Accumulates zombie processes across test runs

### Test File Categorization

**Category 1: Timing/Performance Tests** (1 file)
- `explore-timing-fix.integration.test.ts` - Flaky timing assertions on subprocess

**Category 2: E2E Workflow Tests** (5 files)
- `ship.integration.test.ts` - Full ship workflow with subprocess
- `save-load.integration.test.ts` - Session save/load via subprocess
- `ship-commit-messages.integration.test.ts` - Commit message generation via subprocess
- `explore.new-style.test.ts` - Exploration workflow via subprocess
- `documentation-hierarchy.integration.test.ts` - Doc hierarchy via subprocess

**Category 3: PM Adapter Tests** (4 files)
- `local-pm-adapter-unified.integration.test.ts` - May use subprocess for CLI → PM flow
- `pm-hooks.smoke.test.ts` - PM hooks via subprocess
- `pm-hooks-integration.test.ts` - PM integration via subprocess
- `local-pm-adapter-unified.smoke.test.ts` - Adapter smoke tests

**Category 4: Command Smoke Tests** (3 files)
- `status.smoke.test.ts` - Status command via subprocess
- `harden.test.ts` - Harden command via subprocess
- `ship.smoke.test.ts` - Ship command via subprocess

**Category 5: ESM Configuration Test** (1 file)
- `esm-config.integration.test.ts` - Tests Node.js ESM behavior (may need subprocess)

**Category 6: Standards Enforcement Test** (1 file)
- `standards-enforcement.integration.test.ts` - Standards checking via subprocess

### Key Insights from HODGE-317.1

The successful pattern from HODGE-317.1:
1. **Test outcomes, not mechanisms**: Verify filesystem state, not subprocess execution
2. **Direct function calls**: Import and call command functions directly
3. **Filesystem assertions**: Check files created/modified instead of watching process output
4. **Eliminate overhead**: 100x faster (13ms vs 10-15s) by removing subprocess spawn

## Implementation Approaches

### Approach 1: Systematic Direct Function Call Migration (RECOMMENDED)

**Description**: Apply HODGE-317.1 pattern across all test categories - replace subprocess spawning with direct function calls wherever possible.

**Implementation Strategy**:

**Phase 1 - High Priority** (4 files, biggest impact):
1. `explore-timing-fix.integration.test.ts`:
   ```typescript
   // Before: Subprocess with timing assertion
   const start = Date.now();
   await workspace.hodge('explore feature-1'); // subprocess!
   expect(Date.now() - start).toBeLessThan(6000); // flaky!

   // After: Direct call, no timing assertion
   import { exploreCommand } from '../commands/explore.js';
   const result = await exploreCommand({
     feature: 'feature-1',
     cwd: workspace.dir
   });
   expect(result.success).toBe(true); // vitest timeout handles hangs
   ```

2. `ship.integration.test.ts`, `save-load.integration.test.ts`, `explore.new-style.test.ts`:
   ```typescript
   // Before: Subprocess
   await workspace.hodge('ship test-feature'); // subprocess!

   // After: Direct call
   import { shipCommand } from '../commands/ship.js';
   await shipCommand({
     feature: 'test-feature',
     cwd: workspace.dir
   });
   ```

**Phase 2 - Medium Priority** (7 files, smoke tests):
Convert smoke tests to direct function calls for speed:
```typescript
// Smoke tests should be FAST - no subprocess
smokeTest('status command does not crash', async () => {
  const result = await statusCommand({ feature: 'TEST-001' });
  expect(result).toBeDefined();
});
```

**Phase 3 - Low Priority** (4 files, special cases):
For tests that legitimately need subprocess (ESM behavior testing), add aggressive timeouts:
```typescript
// Only use subprocess when absolutely necessary
const result = await runCommand('node dist/src/bin/hodge.js --help', {
  timeout: 1000 // fail fast if hanging
});
```

**Pros**:
- Eliminates root cause (subprocess spawning) completely for most tests
- 100x performance improvement (based on HODGE-317.1 results)
- Zero hung process risk for migrated tests
- Faster test feedback (no subprocess spawn overhead)
- Better error messages (stack traces from actual code)
- Proven pattern (HODGE-317.1 success)

**Cons**:
- Requires updating 15 test files
- Need to ensure command functions are importable (may need refactoring)
- Some tests may legitimately need subprocess (ESM testing)

**When to use**: This is the default approach - use it unless subprocess is absolutely necessary for the test (e.g., testing Node.js ESM behavior)

---

### Approach 2: Add Aggressive Timeouts to Existing Subprocess Tests

**Description**: Keep subprocess spawning but add much shorter timeouts (1-2s instead of 10s) to fail fast when commands hang.

**Implementation**:
```typescript
// Update runCommand default timeout
export async function runCommand(cmd: string, options = {}) {
  const { timeout = 2000 } = options; // was 10000
  // ... rest of implementation
}

// Or override per test
const result = await workspace.hodge('explore test', {
  timeout: 1000 // 1 second max
});
```

**Pros**:
- Minimal code changes (just update timeout values)
- Faster failure detection (1-2s vs 10s)
- Still tests CLI subprocess behavior

**Cons**:
- Doesn't eliminate hung process risk (just reduces duration)
- Still has subprocess spawn overhead (slower tests)
- Timing tests still flaky (1s vs 2s is still variable)
- May create false failures on slow CI systems

**When to use**: Quick fix while planning full migration to Approach 1, or for tests that genuinely need subprocess testing

---

### Approach 3: Hybrid - Direct Calls + Subprocess Exceptions

**Description**: Migrate most tests to direct function calls (Approach 1), but explicitly identify and keep subprocess for legitimate cases with aggressive timeouts (Approach 2).

**Implementation**:
```typescript
// Most tests: Direct calls (no subprocess)
import { exploreCommand } from '../commands/explore.js';
const result = await exploreCommand({ feature: 'test' });

// Exception: ESM behavior testing (needs subprocess)
// Tag with comment explaining why subprocess is necessary
// SUBPROCESS-REQUIRED: Testing Node.js ESM module loading behavior
const result = await runCommand('node dist/src/bin/hodge.js --help', {
  timeout: 1000 // aggressive timeout
});
```

**Pros**:
- Best of both worlds: fast tests + subprocess where needed
- Clear documentation of subprocess exceptions (tagged comments)
- Prevents future regression (explicit about when subprocess is OK)
- Balances pragmatism with thoroughness

**Cons**:
- Requires careful decision-making about subprocess necessity
- Two different testing patterns to maintain
- Need to document subprocess exception criteria

**When to use**: After team discussion about which tests legitimately need subprocess (ESM config, system integration, etc.)

---

## Recommendation

**Use Approach 1: Systematic Direct Function Call Migration**

**Rationale**:
1. **Proven Success**: HODGE-317.1 demonstrated this pattern works (100x faster, zero hangs)
2. **Eliminates Root Cause**: Subprocess spawning is the source of both flakiness and hung processes
3. **Better Tests**: Direct calls test actual logic, not CLI wrapper overhead
4. **Phased Rollout**: Can prioritize high-impact files first, learn, then continue

**Implementation Sequence**:
1. **Phase 1** (Day 1-2): Fix 4 high-priority files (timing + workflow tests)
   - `explore-timing-fix.integration.test.ts` - Remove timing assertions
   - `ship.integration.test.ts` - Direct function calls
   - `save-load.integration.test.ts` - Direct function calls
   - `explore.new-style.test.ts` - Direct function calls

2. **Phase 2** (Day 3): Fix 7 medium-priority files (smoke tests)
   - Convert all smoke tests to direct function calls
   - Verify performance improvement

3. **Phase 3** (Day 4): Handle 4 special cases
   - Determine if subprocess truly needed (ESM config, etc.)
   - Add aggressive timeouts if subprocess required
   - Document exceptions with SUBPROCESS-REQUIRED comments

**Success Metrics**:
- Zero flaky timing test failures
- Zero hung Node processes requiring manual kill
- 50-100x faster test execution for migrated tests
- All tests passing consistently in CI and local

**Fallback Plan**:
If direct function calls prove difficult (command refactoring needed), use Approach 3 (Hybrid) to get quick wins while planning deeper refactoring.

## Test Intentions

### Behavioral Expectations

**Timing Test Behavior**:
- [ ] Timing tests verify command success (not execution speed)
- [ ] Vitest default timeout (5s) catches hung commands
- [ ] No explicit elapsed time assertions (removes flakiness)

**E2E Workflow Test Behavior**:
- [ ] Workflow tests use direct function calls (no subprocess)
- [ ] Tests verify filesystem outcomes (files created, content correct)
- [ ] Tests complete in <100ms (vs previous 1-5s with subprocess)

**Smoke Test Behavior**:
- [ ] Smoke tests use direct function calls (fast sanity checks)
- [ ] Tests verify command doesn't crash (basic error handling)
- [ ] Tests complete in <50ms (vs previous 500ms+ with subprocess)

**Subprocess Exception Behavior** (if any remain):
- [ ] Subprocess-using tests have SUBPROCESS-REQUIRED comment explaining why
- [ ] All subprocess tests have aggressive timeout (1-2s max)
- [ ] Tests fail fast if command hangs (no 10s wait)

**General Test Behavior**:
- [ ] No test creates hung Node processes
- [ ] All tests use temporary directories (test isolation)
- [ ] Tests provide clear error messages on failure
- [ ] CI and local test results are consistent (no flakiness)

### Verification Strategy

**During Build**:
- Migrate tests one category at a time
- Run full test suite after each category to verify no regressions
- Measure test execution time improvement

**During Harden**:
- Run tests 10 times in parallel to verify no flakiness
- Monitor for hung processes during test runs
- Verify CI passes consistently

**Manual Smoke Test**:
- Run full test suite 5 times consecutively
- Check Activity Monitor/Task Manager for hung Node processes
- Verify no processes require manual termination

## Decisions Needed

### Decision 1: Timing Test Strategy
**Question**: How should we handle timing tests (explore-timing-fix)?

**Options**:
- **A**: Remove timing assertions entirely (just verify success, let vitest timeout handle hangs)
- **B**: Use direct function calls with no timing assertions
- **C**: Keep subprocess with aggressive timeout and timing assertions

**Recommendation**: Option A or B (remove timing assertions - timing is not the behavior we care about)

### Decision 2: Implementation Scope
**Question**: Should we fix all 15 files at once or in phases?

**Options**:
- **A**: Fix all 15 files in one epic (comprehensive but large)
- **B**: Fix in 3 phases (high/medium/low priority - allows learning between phases)
- **C**: Fix only flaky timing test now, defer others

**Recommendation**: Option B (phased approach - learn from high-priority fixes before continuing)

### Decision 3: Subprocess Exceptions
**Question**: Which tests (if any) legitimately need subprocess spawning?

**Options**:
- **A**: No exceptions - all tests use direct calls (pure approach)
- **B**: ESM config tests can use subprocess (Node.js behavior testing)
- **C**: Case-by-case decision during implementation

**Recommendation**: Option B or C (some tests may need subprocess for system-level behavior)

## Next Steps

- [ ] Review this exploration
- [ ] Make decisions in `/decide HODGE-320`
- [ ] Proceed to `/build HODGE-320` to implement chosen approach
- [ ] Start with Phase 1 (high-priority files) for quick wins

---
*Exploration completed: 2025-10-03*
*Pattern reference: HODGE-317.1 (subprocess elimination)*
*Investigation method: Systematic codebase analysis + HODGE-317.1 lessons*
