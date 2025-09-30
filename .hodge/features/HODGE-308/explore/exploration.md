# Exploration: HODGE-308

## Feature Overview
**PM Issue**: HODGE-308
**Type**: general
**Created**: 2025-09-30T15:30:30.292Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: None identified

## Root Cause Analysis

**Problem**: Test isolation integration tests fail when run with full test suite, but pass when run alone.

**Failure Symptoms**:
1. `should maintain complete isolation between test runs` - Detects unexpected save files in `.hodge/saves` (count changes from 676 → 678)
2. `should prevent test data from leaking into project` - Times out because tests create files in project `.hodge/`

**Root Cause**: `context.smoke.test.ts` line 133 calls `command.execute({})` which:
1. Triggers `loadDefaultContext()` → `hodgeMDGenerator.saveToFile('general')`
2. `HodgeMDGenerator.saveToFile()` always writes to `.hodge/HODGE.md` (ignores basePath)
3. Writing to `.hodge/HODGE.md` triggers auto-save hooks
4. Auto-save creates files in project's `.hodge/saves/` directory
5. Test isolation validator detects these unexpected files → FAIL

**Evidence**:
- `ContextCommand` constructor accepts `basePath` parameter (line 37-38 of context.ts)
- Test creates tmpDir and passes it to `ContextCommand(tmpDir)` (line 130 of context.smoke.test.ts)
- But `HodgeMDGenerator` has no basePath support - always uses `.hodge/HODGE.md`
- Auto-save files found: `auto-test-feature-2025-09-30T15-10-00`, `auto-old-feature-2025-09-30T15-10-00`

## Implementation Approaches

### Approach 1: Add basePath Support to HodgeMDGenerator (Recommended)
**Description**: Make `HodgeMDGenerator` respect a basePath parameter for testability, similar to `ContextCommand`.

**Pros**:
- Fixes root cause: tests will use tmpdir instead of project `.hodge/`
- Consistent pattern: matches existing `ContextCommand` basePath approach
- Clean architecture: generators should be testable with configurable paths
- No test workarounds needed
- Prevents future similar issues

**Cons**:
- Requires modifying `HodgeMDGenerator` constructor and `saveToFile()` method
- Need to pass basePath through from `ContextCommand` to `HodgeMDGenerator`
- Must update all `HodgeMDGenerator` instantiations

**When to use**: This is the proper architectural fix that prevents the issue at its source.

---

### Approach 2: Mock AutoSave in Tests
**Description**: Mock or disable auto-save functionality during smoke tests.

**Pros**:
- Smaller code changes (only test files)
- Doesn't require modifying production code
- Quick fix

**Cons**:
- Band-aid solution: doesn't fix root cause
- Tests won't catch real auto-save issues
- Violates "use real dependencies when possible" principle
- Every test that uses ContextCommand needs mocking
- Reduces test confidence

**When to use**: Only if time-constrained and need quick workaround.

---

### Approach 3: Don't Call execute() in Smoke Test
**Description**: Rewrite `context.smoke.test.ts` line 133 to test specific methods instead of `execute()`.

**Pros**:
- No production code changes
- Avoids triggering auto-save

**Cons**:
- Reduces test coverage (not testing actual command flow)
- Other tests might have same issue
- Doesn't fix the underlying architectural problem
- Tests become less realistic

**When to use**: Not recommended - reduces test quality.

## Recommendation

**Use Approach 1: Add basePath Support to HodgeMDGenerator**

**Implementation Plan**:
1. Add `basePath` parameter to `HodgeMDGenerator` constructor
2. Update `saveToFile()` to use `path.join(this.basePath, '.hodge', 'HODGE.md')`
3. Update `ContextCommand` to pass its `basePath` to `HodgeMDGenerator`
4. Update other instantiations of `HodgeMDGenerator` (search codebase)
5. Verify test isolation tests pass with full suite

**Why This is Best**:
- Fixes root cause, not symptoms
- Follows existing `basePath` pattern in `ContextCommand`
- Makes `HodgeMDGenerator` properly testable
- Prevents similar issues in future
- Aligns with project standard: "Tests must NEVER modify project's .hodge directory"

## Decisions Needed

1. **basePath Parameter Approach**: Should we add basePath to HodgeMDGenerator constructor or make it optional with default to process.cwd()?
   - **Recommendation**: Optional with default to `process.cwd()` for backward compatibility

2. **Scope**: Should we also check other generators/managers for similar issues?
   - **Recommendation**: Yes - audit `SessionManager`, `SaveManager`, etc. for basePath support

3. **Test Enhancement**: Should we add a test that explicitly verifies HodgeMDGenerator respects basePath?
   - **Recommendation**: Yes - add smoke test to verify isolation

4. **Auto-Save Behavior**: Should auto-save be disabled during tests entirely?
   - **Recommendation**: No - tests should use isolated directories, not disable features

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-308`

---
*Template created: 2025-09-30T15:30:30.292Z*
*AI exploration to follow*
