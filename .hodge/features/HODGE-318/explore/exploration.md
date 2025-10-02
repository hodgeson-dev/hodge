# Feature Exploration: HODGE-318

**Title**: Fix CI ERR_REQUIRE_ESM error in Node 18.x quality checks workflow

## Problem Statement

The GitHub Actions "Quality Checks" workflow running on Node 18.x fails with `ERR_REQUIRE_ESM` before any tests can run:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module /home/runner/work/hodge/hodge/node_modules/vite/dist/node/index.js
from /home/runner/work/hodge/hodge/node_modules/vitest/dist/config.cjs not supported.
Instead change the require of index.js in /home/runner/work/hodge/hodge/node_modules/vitest/dist/config.cjs
to a dynamic import() which is available in all CommonJS modules.
```

This is a separate issue from HODGE-317. While HODGE-317 addresses hung subprocess tests, HODGE-318 fixes CI configuration so tests can actually run.

## Conversation Summary

This is a vitest/vite configuration compatibility issue with Node 18.x. The error indicates a CommonJS/ESM module incompatibility in the vitest config loading.

**Root cause**: Vitest is trying to use `require()` to load Vite's ESM module, which is not allowed in modern Node versions.

**Impact**: CI cannot run tests at all - it fails before the test suite starts.

## Implementation Approaches

### Approach 1: Update Vitest Configuration Format

**Description**: Convert `vitest.config.ts` to use ESM-compatible syntax and ensure proper module resolution.

**Pros**:
- Proper long-term solution
- Aligns with modern Node.js best practices
- No workarounds needed

**Cons**:
- May require package.json updates
- Could affect local development setup
- Need to test on multiple Node versions

**When to use**: For a proper, maintainable fix.

---

### Approach 2: Update CI Workflow to Use Newer Node Version

**Description**: Change CI workflow from Node 18.x to Node 20.x or 22.x where this issue might not occur.

**Pros**:
- Quick fix
- May avoid the issue entirely
- Minimal code changes

**Cons**:
- Doesn't fix root cause
- May surface on other environments
- Delays proper configuration fix

**When to use**: As a temporary workaround to unblock CI.

---

### Approach 3: Downgrade Vitest/Vite Versions

**Description**: Roll back to older vitest/vite versions that don't have this ESM issue.

**Pros**:
- Quick rollback
- Known working state

**Cons**:
- Loses newer features
- Not a forward-looking solution
- May have security implications

**When to use**: Only if Approach 1 is too complex and Approach 2 doesn't work.

## Recommendation

**Approach 1: Update Vitest Configuration Format** is recommended.

**Rationale**:
- This is the proper fix for the ESM/CommonJS incompatibility
- Node.js ecosystem is moving to ESM - we should align with that
- Fixes the issue at the root rather than working around it
- Once fixed, should work on all Node versions

**Next step**: Investigate vitest.config.ts and package.json to ensure proper ESM configuration.

## Test Intentions

### Behavioral Expectations

1. **Should load vitest config without ERR_REQUIRE_ESM**
   - Given: Vitest config updated to ESM-compatible format
   - When: `npm test` runs in CI
   - Then: Config loads successfully without errors

2. **Should run full test suite in CI**
   - Given: Config loading issue fixed
   - When: CI workflow executes
   - Then: All tests run and results reported

3. **Should work on multiple Node versions**
   - Given: Fixed configuration
   - When: Tests run on Node 18.x, 20.x, 22.x
   - Then: All versions load config successfully

## Decisions Needed

No decisions needed - clear path forward with Approach 1.

---

## Related Issues

- **HODGE-317**: Fix hung Node processes in test-isolation tests (separate local issue)

---

**Exploration completed**: 2025-10-02
