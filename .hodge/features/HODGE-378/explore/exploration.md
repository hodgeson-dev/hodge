# Exploration: HODGE-378

**Title**: Fix ESLint errors and prevent future violations through enhanced Git hooks

**Created**: 2025-11-02
**Status**: Exploring

## Problem Statement

CI is failing with 148 ESLint errors and 342 warnings that slipped past local Git hooks. The current pre-commit hook only lints staged files with auto-fix, and the pre-push hook checks Prettier but not ESLint, allowing errors in unchanged files to reach CI. This creates a broken main branch and undermines code quality standards.

## Context

**Current State Analysis**:
- **Pre-commit hook**: Runs `lint-staged` which only checks **staged files** with `eslint --fix`
- **Pre-push hook**: Runs Prettier check but **no ESLint validation**
- **CI workflow**: Runs full `npm run lint` on **entire codebase** (catches everything we miss locally)
- **Gap**: Errors in unchanged files bypass local hooks and fail in CI

**Error Breakdown** (148 errors total):
- **Quick auto-fixes** (~60 errors): unused imports, dead stores, useless escapes
- **Moderate fixes** (~50 errors): unbound methods, promise handling, regex optimizations
- **Security/careful analysis** (~38 errors): publicly-writable-directories, pseudo-random, hardcoded-passwords, nested complexity

## Conversation Summary

Through discussion, we identified that the hook configuration has a critical gap: lint-staged only validates changed files, while the pre-push hook skips ESLint entirely. This allows developers to commit code that passes local checks but fails CI when other files have accumulated errors.

The strategy emerged as a two-phase approach:
1. **Prevent future violations**: Strengthen Git hooks to catch all errors before push
2. **Fix existing violations**: Systematically resolve all 148 errors in reviewable phases

Key decisions included accepting slower pre-push performance for safety, strict blocking with AI-assisted fixing, and using the existing TempDirectoryFixture pattern for test security compliance.

## Implementation Approaches

### Approach 1: Comprehensive Hook Enhancement with Phased Error Resolution

**Description**: Enhance pre-push hook to run full ESLint validation, then fix all existing errors in three structured phases for easier review.

**Pros**:
- Completely prevents future errors from reaching CI
- Structured fixing makes large changeset reviewable
- Aligns with project's "stop the bleeding" philosophy
- Uses existing TempDirectoryFixture pattern (already mandated by standards)
- Emergency escape hatch (`--skip-lint`) for critical situations

**Cons**:
- Pre-push becomes slower (~10-30 seconds for full lint)
- Large number of file changes (50+ files) across three commits
- Developers must fix unfixable errors before committing (strict blocking)

**When to use**: This is the right approach for projects that value code quality over developer convenience and can accept slower git operations.

**Implementation Steps**:

**Phase 1: Hook Enhancement**
1. Update `.husky/pre-push` to run `npm run lint`
2. Add `--skip-lint` environment variable escape hatch
3. Keep existing `lint-staged` in pre-commit (auto-fix on commit)
4. Test hooks locally before committing

**Phase 2: Auto-fixable Errors** (~60 errors)
1. Remove unused imports (sonarjs/unused-import)
2. Remove dead store assignments (sonarjs/no-dead-store)
3. Fix useless escape characters (no-useless-escape)
4. Run `eslint --fix` to catch any auto-fixable items

**Phase 3: Moderate Fixes** (~50 errors)
1. Fix unbound methods (use arrow functions or explicit binding)
2. Add proper promise handling (await, .catch, or void operator)
3. Optimize slow regex patterns (simplify or use RegExp.exec())
4. Fix prefer-regexp-exec violations

**Phase 4: Security & Careful Analysis** (~38 errors)
1. Replace `tmpdir()` with `TempDirectoryFixture` in test files
2. Review hardcoded-password false positives (likely test fixtures)
3. Fix pseudo-random usage (use crypto.randomUUID where needed)
4. Refactor nested functions (extract to reduce complexity)
5. Handle constructor side-effect patterns

### Approach 2: Progressive Hook Hardening with Incremental Fixes

**Description**: Start with warning-only pre-push ESLint check, gradually increase strictness as errors are fixed.

**Pros**:
- Less disruptive to developer workflow initially
- Allows team to fix errors incrementally
- Provides visibility without blocking
- Can track progress over time

**Cons**:
- Warnings can be ignored, allowing new errors to slip in
- Takes longer to achieve clean codebase
- Requires discipline to actually fix warnings
- Doesn't prevent CI failures in the short term

**When to use**: Better for teams with less tolerance for workflow disruption or very large error counts.

### Approach 3: Selective Lint on Changed Files + Dependencies

**Description**: Smart pre-push hook that only lints files that changed AND their dependencies, with full lint on protected branches.

**Pros**:
- Faster than full lint (only checks relevant files)
- Still catches errors in related code
- Good balance of speed and safety
- Can be strict on main, lenient on feature branches

**Cons**:
- Complex to implement correctly (need dependency analysis)
- May miss errors in unrelated files
- Requires maintenance as dependency graph changes
- Still need to fix all 148 existing errors eventually

**When to use**: Large codebases where full lint is prohibitively slow (>60s).

## Recommendation

**Approach 1: Comprehensive Hook Enhancement with Phased Error Resolution**

This approach directly addresses the root cause (missing pre-push ESLint validation) and fixes all existing violations in a structured, reviewable way. While it makes pre-push slower and requires more immediate fixes, it completely prevents the problem from recurring.

The three-phase fixing strategy makes the large changeset manageable:
- **Phase 2** (auto-fixes) can be reviewed quickly since changes are mechanical
- **Phase 3** (moderate) requires code review for correctness but patterns are clear
- **Phase 4** (security) gets careful scrutiny for each instance

The `--skip-lint` escape hatch provides safety valve for emergencies while keeping the default strict. This aligns with the project's progressive enforcement philosophy: "Freedom to explore, discipline to ship."

## Test Intentions

Behavioral expectations for this feature:

1. **Pre-push hook runs full ESLint** - Running `git push` triggers `npm run lint` on entire codebase
2. **Pre-push blocks on errors** - Push is rejected if any ESLint errors exist (not just warnings)
3. **Emergency bypass works** - `SKIP_LINT=true git push` skips ESLint validation
4. **Pre-commit unchanged** - `git commit` still runs lint-staged with auto-fix on staged files
5. **All errors fixed** - `npm run lint` reports 0 errors after all phases complete
6. **Auto-fixes applied first** - Unused imports, dead stores, and useless escapes are removed
7. **Moderate fixes correct** - Unbound methods use arrow functions, promises are properly handled
8. **Security fixes secure** - Test files use TempDirectoryFixture, no actual hardcoded secrets
9. **Temp directory pattern enforced** - All test temp directories use TempDirectoryFixture
10. **CI passes cleanly** - GitHub Actions quality workflow completes with no ESLint errors
11. **Future commits blocked** - New commits introducing ESLint errors are caught before push

## Decisions Decided During Exploration

1. ✓ **Fix hooks first, then errors** - Enhance Git hooks to prevent new violations, then systematically fix all 148 existing errors
2. ✓ **Full lint on pre-push** - Add `npm run lint` to pre-push hook, accepting 10-30s performance cost for safety
3. ✓ **Strict blocking mode** - Pre-push blocks on any ESLint errors; AI must fix unfixable errors and retry commit
4. ✓ **Always run full lint** - Pre-push always runs complete validation with `SKIP_LINT=true` escape hatch for emergencies
5. ✓ **Three-phase error fixing** - Fix in separate commits: (1) auto-fixes, (2) moderate fixes, (3) security fixes for easier review
6. ✓ **Use TempDirectoryFixture** - Replace `tmpdir()` with TempDirectoryFixture pattern in test files for security compliance

## No Decisions Needed

All decisions were resolved during the conversational exploration phase.

## Next Steps

1. Start building with `/build HODGE-378`
2. Implement hook enhancement first (stops the bleeding)
3. Execute three-phase error fixing (heals all wounds)
4. Verify CI passes with zero ESLint errors