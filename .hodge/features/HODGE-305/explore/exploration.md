# Exploration: HODGE-305

## Feature Overview
**PM Issue**: HODGE-305
**Type**: general
**Created**: 2025-09-30T05:35:13.097Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Problem Analysis

The GitHub Actions "Quality Checks" workflow is failing with npm audit reporting 5 moderate severity vulnerabilities in esbuild (<=0.24.2) through the dependency chain: vitest@1.6.1 → vite → esbuild@0.21.5.

**Key Facts:**
- Vulnerability: GHSA-67mh-4wv8-2f99 (CVSS 5.3 - Moderate)
- Impact: Development server CORS vulnerability (allows malicious websites to steal source code)
- **Development-only risk**: Only exploitable when using esbuild's serve feature during development
- **Production impact**: None - doesn't affect built/deployed code
- Current: vitest@1.6.1 with esbuild@0.21.5 (vulnerable)
- Fixed in: esbuild@0.25.0+, available through vitest@3.2.4
- Project status: All 611 tests passing on current version

## Implementation Approaches

### Approach 1: Accept Risk and Document (No Change)
**Description**: Document that this is a development-only vulnerability with no production impact, and accept the moderate risk for local development environments.

**Pros**:
- Zero breaking changes - all tests continue passing
- No migration effort required
- No risk of introducing regressions
- Development workflow unaffected
- Vulnerability only affects local dev servers (not production builds)

**Cons**:
- CI/CD pipeline continues to fail on security audit
- Developers might see scary audit warnings
- Doesn't follow security best practices
- May block future releases if npm publish enforces audit

**When to use**: When CI failures can be ignored, and development security posture is acceptable for the risk level.

### Approach 2: Upgrade to Vitest 3.x (Major Version Bump)
**Description**: Update vitest and @vitest/coverage-v8 from 1.6.1 to 3.2.4, which includes the patched esbuild@0.25.0+.

**Pros**:
- Resolves all 5 security vulnerabilities immediately
- CI/CD audit checks pass
- Gets latest Vitest features and improvements
- Future-proofs test infrastructure
- Simple one-line change: `npm install -D vitest@3.2.4 @vitest/coverage-v8@3.2.4`

**Cons**:
- Breaking changes across two major versions (1.x → 3.x)
- Potential test behavior changes (hooks execution, coverage reporting)
- Requires testing all 611 tests to verify no regressions
- Coverage thresholds may need adjustment (V8 remapping changes)
- Higher risk of unexpected issues

**When to use**: When security compliance is required and you can afford thorough regression testing.

### Approach 3: Incremental Upgrade via Vitest 2.x (Staged Migration)
**Description**: First upgrade to vitest@2.x (last 2.x version), test thoroughly, then upgrade to 3.x in a separate change.

**Pros**:
- Splits breaking changes into two smaller migrations
- Easier to identify which version caused any issues
- Can pause at 2.x if problems arise
- Still resolves security vulnerabilities
- Lower risk per step

**Cons**:
- Two separate upgrade cycles required
- More time-consuming overall
- Double the testing effort
- Still requires full test suite validation twice
- Delayed resolution of vulnerability

**When to use**: When risk tolerance is very low and you want maximum control over breaking changes.

## Recommendation

**Approach 2: Upgrade to Vitest 3.x directly**

**Rationale:**
1. **Strong test coverage**: 611 tests across 70 test files provide excellent regression detection
2. **Security compliance**: Resolves CI/CD audit failures and follows best practices
3. **Efficiency**: Single migration is faster than staged approach
4. **Low actual risk**: Vitest 3.x breaking changes are minimal and well-documented
5. **Current status**: Tests already passing means baseline is solid

**Migration Safety Net:**
- Run full test suite immediately after upgrade
- Check for warnings about deprecated APIs
- Review coverage report changes (V8 remapping improvements)
- Git branch allows easy rollback if issues arise

**Execution Plan:**
1. Update package.json devDependencies
2. Run `npm install`
3. Run `npm test` to verify all 611 tests still pass
4. Run `npm audit` to confirm vulnerabilities resolved
5. Review coverage reports for any threshold adjustments needed

## Decisions Needed

1. **Accept Breaking Changes**: Confirm willingness to upgrade across two major versions (vitest 1.x → 3.x)

2. **Coverage Threshold Adjustments**: Decide whether to adjust coverage thresholds if V8 remapping changes affect reports

3. **CI/CD Policy**: Clarify whether security audit failures should block releases (affects urgency)

4. **Test Behavior Changes**: Accept that hooks now run serially and in reverse order for after* hooks

5. **Timeline**: Decide if this should be done immediately or scheduled for next sprint

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-305`

---
*Template created: 2025-09-30T05:35:13.097Z*
*AI exploration to follow*
