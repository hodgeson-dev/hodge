# Exploration: HODGE-304

## Feature Overview
**PM Issue**: HODGE-304
**Type**: general
**Created**: 2025-09-30T05:20:49.159Z

## Problem Statement
The test isolation integration test is failing in CI because `src/lib/pm/local-pm-adapter-unified.smoke.test.ts` creates `LocalPMAdapter()` instances without specifying a basePath parameter. When basePath is undefined, the adapter defaults to `.` (current directory), causing it to create `.hodge/project_management.md` in the real project directory instead of an isolated temp directory.

**Failing Test**: `src/test/test-isolation.integration.test.ts:161`
**Root Cause**: Lines 15, 20, and 68 in `local-pm-adapter-unified.smoke.test.ts`
**Expected**: No files created in project's `.hodge` directory during tests
**Actual**: `project_management.md` created in `.hodge/` (detected by marker file check)

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9
- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: test-pattern.md
- **Related Standard**: "All tests must use temporary directories (`os.tmpdir()`) for file operations"

## Implementation Approaches

### Approach 1: Use withTestWorkspace for Affected Tests
**Description**: Replace the three smoke tests that create `LocalPMAdapter()` without basePath to use the `withTestWorkspace` pattern that's already being used elsewhere in the file.

**Pros**:
- Consistent with other tests in the same file (tests at lines 31, 48, 58, 78, 92, etc.)
- Uses existing test infrastructure (`withTestWorkspace` helper)
- Provides automatic cleanup through the helper
- Isolated temp directory per test
- Follows project standards for test isolation

**Cons**:
- Slightly more verbose than current simple instantiation
- Requires wrapping test logic in async callback

**When to use**: When tests need to actually use the adapter's file operations (init, addFeature, etc.). This is the most appropriate for most smoke tests.

**Example**:
```typescript
smokeTest('should extend BasePMAdapter', async () => {
  await withTestWorkspace('local-adapter-extends', async (workspace) => {
    const adapter = new LocalPMAdapter(workspace.getPath());
    expect(adapter).toBeInstanceOf(BasePMAdapter);
  });
});
```

### Approach 2: Use Inline Temp Directory Creation
**Description**: For truly minimal tests that only check type/inheritance and don't touch the filesystem, create an inline temp directory path without full workspace setup.

**Pros**:
- Minimal code change
- Faster than full workspace setup for type-only checks
- Still provides isolation
- More explicit about temp directory usage

**Cons**:
- Doesn't provide automatic cleanup (need manual try/finally)
- Less consistent with rest of the file
- More error-prone (can forget cleanup)
- Less infrastructure support

**When to use**: Only for tests that truly don't perform any filesystem operations - just type/method existence checks.

**Example**:
```typescript
smokeTest('should extend BasePMAdapter', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));
  try {
    const adapter = new LocalPMAdapter(tmpDir);
    expect(adapter).toBeInstanceOf(BasePMAdapter);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
```

### Approach 3: Mock Filesystem Operations
**Description**: Mock the filesystem operations in LocalPMAdapter so it never touches the real filesystem, then create instances without basePath.

**Pros**:
- Minimal test code changes
- Very fast test execution
- No filesystem I/O at all

**Cons**:
- Violates project testing philosophy: "Use real dependencies when possible"
- Requires significant mocking infrastructure
- Tests become more fragile (coupled to implementation)
- Doesn't test actual filesystem behavior
- Contradicts "Focus on behavior and contracts" principle

**When to use**: Generally NOT recommended for this project. Only consider if filesystem operations become a major performance bottleneck.

## Recommendation

**Use Approach 1: withTestWorkspace for all three tests**

**Rationale**:
1. **Consistency**: Lines 31-44, 48-54, 58-64, 78-88, and 92-107 already use `withTestWorkspace`. These three tests should match.
2. **Safety**: Even tests that only check types could accidentally trigger filesystem operations in the future. Better to be safe.
3. **Standards Compliance**: Follows the project standard "All tests must use temporary directories"
4. **Low Cost**: The `withTestWorkspace` helper is already imported and used extensively in this file
5. **Best Practice**: The project philosophy emphasizes "Use real dependencies when possible" and "Test behavior, not implementation"

The three affected tests are:
- Line 15: `should extend BasePMAdapter`
- Line 20: `should implement all abstract methods`
- Line 68: `should fetch Hodge workflow states`

All three should be wrapped with `withTestWorkspace` even though they currently only check types/methods, because:
- The adapter's constructor runs `super()` which might have side effects
- Future changes to the adapter might add initialization logic
- Consistency makes the test file easier to understand and maintain

## Decisions Needed

1. **Approach Decision**: Use withTestWorkspace pattern for all three failing tests
2. **Test Naming**: Decide on workspace names for the three tests:
   - `local-adapter-extends` (for BasePMAdapter test)
   - `local-adapter-methods` (for abstract methods test)
   - `local-adapter-states` (for fetchStates test)
3. **Future Prevention**: Should we add a linting rule or test to prevent `new LocalPMAdapter()` without basePath?
4. **Documentation**: Should we add a comment to LocalPMAdapter constructor warning about test isolation?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-304`

---
*Template created: 2025-09-30T05:20:49.159Z*
*Exploration completed: 2025-09-30T05:22:00.000Z*
