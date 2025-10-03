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

This is a separate issue from HODGE-317. While HODGE-317 addresses hung subprocess tests, HODGE-318 fixes CI configuration so tests can actually run. **Blocks release readiness** - CI must be green before initial release.

## Conversation Summary

**The Discovery Process**:

Through conversational exploration, we identified this as an opportunity for architectural improvement rather than just a bug fix:

1. **Scope**: Error only occurs in CI on Node 18.x, not locally or on Node 20.x
2. **Timing Context**: Node 18.x reaches EOL in April 2025 (5 months away)
3. **Release Strategy**: Project preparing for initial release - clean foundations preferred over legacy support
4. **Ecosystem Trends**: Modern tooling (vitest, vite, eslint) increasingly dropping 18.x support
5. **ESM Migration**: Desired for future-proofing, straightforward with Node 20.x+

**Root Cause**: Vitest is trying to use `require()` to load Vite's ESM module. Project uses CommonJS (`tsconfig: "module": "commonjs"`, no `"type": "module"` in package.json) while vitest.config.ts uses ESM syntax. Node 18.x has stricter ESM/CommonJS boundaries than 20.x.

**Strategic Decision**: Rather than fix compatibility for a soon-to-be-EOL Node version, migrate to native ESM and require Node 20.x+ for a modern, maintainable foundation.

**Impact**: CI cannot run tests at all - it fails before the test suite starts. Blocks release readiness.

## Implementation Approaches

### Approach 1B: ESM Migration + Drop Node 18.x Support (Recommended)

**Description**: Migrate to native ESM and update minimum Node version to 20.0.0. This provides clean, modern foundations for the initial release.

**Implementation Steps**:
1. Update `package.json`:
   - Add `"type": "module"`
   - Change `"engines": { "node": ">=20.0.0" }`
2. Update `tsconfig.json`:
   - Change `"module": "NodeNext"`
   - Change `"moduleResolution": "NodeNext"`
3. Update `.github/workflows/quality.yml`:
   - Remove `18.x` from matrix
   - Keep `[20.x, 22.x]`
4. Test on both Node versions
5. Update README.md with Node 20.x+ requirement

**Pros**:
- ✅ Fixes CI issue immediately
- ✅ No ongoing Node 18.x compatibility burden (EOL April 2025)
- ✅ Clean ESM architecture for modern Node.js
- ✅ Future-proof for 5+ years (Node 20 EOL: April 2026, Node 22 EOL: April 2027)
- ✅ Aligns with ecosystem direction (vitest, vite, eslint all moving this way)
- ✅ Simpler than maintaining CommonJS/ESM hybrid
- ✅ Better for initial release - start with clean foundations

**Cons**:
- ⚠️ Users on Node 18.x must upgrade (but they need to anyway by April 2025)
- ⚠️ Requires testing to ensure no import breaking changes
- ⚠️ May need to update some import statements to include `.js` extensions

**When to use**: For an initial release where you want modern, maintainable foundations and can set version requirements cleanly.

---

### Approach 2: Fix Vitest/Vite Versions for Node 18.x Compatibility

**Description**: Pin vitest/vite to specific older versions known to work with Node 18.x + CommonJS.

**Pros**:
- Maintains 18.x support for next 5 months
- No architectural changes
- Minimal code changes

**Cons**:
- ❌ Temporary fix (18.x EOL April 2025)
- ❌ May miss important vitest/vite updates and security patches
- ❌ Technical debt that needs addressing soon
- ❌ Doesn't align with ecosystem direction
- ❌ Fighting the trend rather than embracing it

**When to use**: Only if there's a business requirement to support Node 18.x specifically (e.g., enterprise customers locked to 18.x).

---

### Approach 3: Hybrid CommonJS/ESM Setup

**Description**: Keep CommonJS but configure vitest/vite to work in hybrid mode with proper config transformations.

**Pros**:
- Maintains current architecture
- No version upgrade required

**Cons**:
- ❌ Complex configuration maintenance
- ❌ Still fighting ecosystem trends
- ❌ May break with future vitest/vite updates
- ❌ Not recommended by tooling maintainers

**When to use**: Not recommended for this project. Only consider if locked to CommonJS for external reasons.

## Recommendation

**Approach 1B: ESM Migration + Drop Node 18.x Support** is strongly recommended.

**Rationale**:

1. **Timing**: Node 18.x EOL is April 2025 (5 months away). Supporting it for an initial release provides minimal value since users would need to upgrade soon anyway.

2. **Clean Foundations**: Starting with modern ESM architecture avoids technical debt from day 1. Better to set clean requirements for initial release than to inherit legacy support.

3. **Ecosystem Alignment**: Modern tooling (vitest 2.x+, vite 5.x, eslint 9.x) is dropping 18.x support. Going with ESM + Node 20.x+ aligns with where the ecosystem is heading.

4. **Adoption Reality**: Node 20.x has been LTS since October 2023 (2 years ago). Professional projects have already migrated or are on the migration path.

5. **Migration Simplicity**: With Node 20.x+, ESM migration is straightforward - just config changes, no complex rewrites.

6. **5-Year Support Window**: Node 20.x EOL: April 2026, Node 22.x EOL: April 2027. This gives Hodge a solid support timeline.

7. **Release Context**: For an initial release, it's better to establish modern requirements than to ship with legacy compatibility and deal with migration issues later.

**Implementation Path**:
1. `/build HODGE-318` with Approach 1B
2. Update package.json and tsconfig.json (5 lines changed)
3. Update CI workflow (remove 18.x from matrix)
4. Run full test suite on Node 20.x and 22.x
5. Update README with Node 20.x+ requirement
6. Ship with confidence on modern foundations

**Alternative**: If there's a business requirement to support Node 18.x specifically (e.g., enterprise customers locked to 18.x), consider Approach 2 (pin versions) as a temporary 5-month bridge until 18.x EOL. However, this creates technical debt that must be addressed before April 2025.

## Test Intentions

### Behavioral Expectations

1. **Should load vitest config without ERR_REQUIRE_ESM in ESM mode**
   - Given: Project migrated to ESM (`"type": "module"`, `"module": "NodeNext"`)
   - When: `npm test` runs locally and in CI
   - Then: Config loads successfully without CommonJS/ESM errors

2. **Should run full test suite on Node 20.x and 22.x**
   - Given: Node 18.x removed from CI matrix
   - When: CI workflow executes on Node 20.x and 22.x
   - Then: All 652 tests run and pass on both versions

3. **Should reject Node 18.x with clear error message**
   - Given: `package.json` engines requirement `"node": ">=20.0.0"`
   - When: User attempts to run Hodge on Node 18.x
   - Then: npm shows clear error: "The engine 'node' is incompatible with this module. Expected version '>=20.0.0'. Got '18.x.x'"

4. **Should maintain all existing functionality after ESM migration**
   - Given: Code migrated from CommonJS to ESM
   - When: All commands executed (`explore`, `build`, `harden`, `ship`, etc.)
   - Then: All features work identically to pre-migration behavior

5. **Should handle import statements correctly in ESM mode**
   - Given: TypeScript compiles to ESM with NodeNext module resolution
   - When: Imports use `.js` extensions where required
   - Then: All module resolution works correctly at runtime

## Decisions Needed

No decisions needed - user approved Approach 1B (ESM Migration + Drop Node 18.x Support) during conversational exploration.

---

## Related Issues

- **HODGE-317**: Fix hung Node processes in test-isolation tests (separate local issue, shipped)
- **HODGE-317.1**: Redesigned test-isolation tests without subprocess spawning (shipped)

## Related Patterns & Lessons

- **Node.js Ecosystem Trends**: Moving to ESM, dropping older Node versions for long-term maintainability
- **Initial Release Strategy**: Set modern requirements from day 1 rather than inherit legacy support
- **Technical Debt Avoidance**: Don't ship with known upcoming EOL versions

---

**Exploration completed**: 2025-10-02
**Conversational exploration**: 2025-10-02
**User approval**: Approach 1B (ESM Migration + Drop Node 18.x Support)
