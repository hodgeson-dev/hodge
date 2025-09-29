# Exploration: HODGE-295

## Feature Overview
**PM Issue**: HODGE-295
**Type**: Pre-push quality checks to prevent CI failures
**Created**: 2025-09-29T00:53:56.156Z
**Problem**: GitHub Action quality checks are failing on `npm audit --audit-level=moderate` and `npx prettier --check .`. Need to catch these issues before pushing to remote.

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9
- **Existing Setup**: Husky + lint-staged configured for pre-commit (prettier/eslint on staged files only)
- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Implementation Approaches

### Approach 1: Comprehensive Pre-push Hook
**Description**: Add a pre-push hook that runs all critical quality checks before allowing push to remote. This mirrors the GitHub Actions workflow locally.

**Pros**:
- Catches all issues before they reach CI, preventing broken builds
- Single point of enforcement for quality standards
- No changes needed to developer workflow - hooks run automatically
- Reduces CI compute usage by failing fast locally

**Cons**:
- Slower push operations (especially npm audit which can take 5-10 seconds)
- May be frustrating when pushing to feature branches for backup
- Requires all developers to have hooks installed

**When to use**: This approach is ideal when you want strict enforcement and don't mind the performance impact on push operations.

### Approach 2: Smart Selective Checks
**Description**: Implement intelligent pre-push checks that only run expensive operations when necessary (e.g., only on main/develop branches, skip audit if package-lock unchanged).

**Pros**:
- Faster push operations for typical development workflow
- Still catches critical issues before they reach protected branches
- Can cache audit results to speed up subsequent pushes
- More developer-friendly with override options for emergencies

**Cons**:
- More complex implementation with conditional logic
- May miss issues when developers bypass checks
- Requires maintaining cache invalidation logic

**When to use**: Best for teams that value development velocity and have good discipline about running full checks before merging to main.

### Approach 3: Optional Pre-push with Manual Override
**Description**: Add quality check commands to npm scripts and document them, but make pre-push hooks opt-in or easily bypassable with `--no-verify` flag.

**Pros**:
- Developers maintain full control over their workflow
- No forced delays when pushing work-in-progress code
- Can run checks manually when ready: `npm run quality:pre-push`
- Easy to bypass in emergencies or for experimental branches

**Cons**:
- Relies on developer discipline to run checks
- CI will still fail if developers forget to run checks
- Team may develop bad habits of skipping checks

**When to use**: Suitable for experienced teams with strong quality culture who prefer flexibility over enforcement.

## Recommendation
**Recommended: Approach 2 - Smart Selective Checks**

This approach strikes the best balance between catching issues early and maintaining developer productivity. By implementing intelligent checks that understand context (branch names, file changes), we can:
1. Prevent CI failures on important branches (main, develop)
2. Allow fast pushes for WIP/feature branches
3. Cache expensive operations like npm audit
4. Provide clear feedback when checks are skipped

The implementation would check:
- **Always**: Prettier formatting on all files (fast, ~1-2s)
- **On main/develop**: Full npm audit check
- **When package-lock changes**: Force npm audit regardless of branch
- **Optional flag**: `--hodge-strict` to force all checks

## Decisions Needed
1. **Implementation Approach**: Which of the three approaches should we implement? (Smart Selective Checks recommended)
2. **Protected Branch Patterns**: Which branches require strict checking? (main, develop, release/*, hotfix/*)
3. **Audit Level**: Should we match GitHub Actions with `--audit-level=moderate` or be stricter?
4. **Cache Duration**: How long should npm audit results be cached? (24 hours suggested)
5. **Override Mechanism**: Should we allow `--no-verify` or require a specific flag like `--hodge-skip-checks`?
6. **Prettier Scope**: Check all files or just changed files in the push?
7. **Performance Threshold**: Maximum acceptable time for pre-push checks (5 seconds suggested)

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-295`

---
*Template created: 2025-09-29T00:53:56.156Z*
*AI exploration to follow*
