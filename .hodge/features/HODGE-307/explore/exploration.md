# Exploration: HODGE-307

## Feature Overview
**PM Issue**: HODGE-307
**Type**: general
**Created**: 2025-09-30T15:03:55.011Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-002, HODGE-003
- **Relevant Patterns**: None identified

## Implementation Approaches

### Approach 1: Move to Colocated Test Pattern (Recommended)
**Description**: Move the test file from `.claude/commands/` to `src/lib/` alongside other smoke tests that validate templates and configurations.

**Pros**:
- Consistent with existing codebase patterns (all 23 other `.smoke.test.ts` files are in `src/`)
- Better test discoverability (all tests in standard locations)
- Proper test runner integration (vitest config expects tests in `src/` or `test/`)
- Follows separation of concerns: `.claude/commands/` for documentation, `src/` for code/tests
- Easier to maintain test infrastructure (mocks, helpers, etc.)

**Cons**:
- Test is slightly further from the template it validates (though still clear via naming)
- One-time migration effort

**When to use**: This is the standard pattern used throughout the codebase. Use this approach to maintain consistency.

---

### Approach 2: Create `.claude/commands/__tests__` Directory
**Description**: Keep tests in `.claude/commands/` but organize them in a standard `__tests__/` subdirectory.

**Pros**:
- Test lives directly next to the template it validates
- Clear intent: "these are tests for command templates"
- Common pattern in other ecosystems (Jest convention)

**Cons**:
- Creates new organizational pattern not used elsewhere in codebase
- Requires vitest config update to discover tests in `.claude/`
- Breaks from existing test organization conventions
- `.claude/` directory is meant for AI assistant configuration, not test infrastructure

**When to use**: Only if you want to establish a new pattern where command templates have colocated tests.

---

### Approach 3: Keep Current Location (Not Recommended)
**Description**: Leave the test file in `.claude/commands/` at root level.

**Pros**:
- No changes needed (already works)
- Maximum proximity to template

**Cons**:
- Violates existing project organization patterns
- Only test file in `.claude/commands/` (all 23 others are in `src/` or `test/`)
- Mixes AI configuration with test infrastructure
- Harder to discover for new contributors
- Inconsistent with test location conventions

**When to use**: Never. This was likely an oversight during HODGE-306 implementation.

## Recommendation

**Use Approach 1: Move to Colocated Test Pattern**

Move `.claude/commands/build.smoke.test.ts` → `src/lib/claude-commands.smoke.test.ts`

**Why**:
1. **Consistency**: All 23 other `.smoke.test.ts` files follow this pattern
2. **Existing precedent**: You already have `src/lib/claude-commands.ts` that syncs command definitions
3. **Separation of concerns**: `.claude/commands/` is for AI documentation, `src/lib/` is for code and tests
4. **Zero config changes**: Vitest already discovers tests in `src/`
5. **Better naming**: `claude-commands.smoke.test.ts` clearly indicates it tests command templates

The test validates the build.md template (a Claude Code slash command definition), so it belongs with other infrastructure tests in `src/lib/`.

## How It Got There

Looking at the git history (commit 2cd1335), the test was created during HODGE-306 implementation. The commit message says:

> "Created .claude/commands/build.smoke.test.ts (NEW)"

This appears to have been a placement decision made during rapid implementation. The pattern chosen (test next to template) is logical but doesn't match the existing codebase conventions where all 23 other smoke tests live in `src/` or `test/` directories.

## Decisions Needed

1. **Test Location Strategy**: Should template validation tests live in `.claude/commands/` or `src/lib/`?
   - **Recommendation**: Use `src/lib/` for consistency with existing 23 smoke tests

2. **Test Naming**: Should it be `build.smoke.test.ts` or `claude-commands.smoke.test.ts`?
   - **Recommendation**: Use `claude-commands.smoke.test.ts` to match the related `src/lib/claude-commands.ts` sync script

3. **Scope**: Should we also create tests for other command templates (explore.md, harden.md, etc.)?
   - **Recommendation**: Consider in future work, but not required immediately

4. **Migration**: Should we move the test now or wait?
   - **Recommendation**: Move now to establish correct pattern before it proliferates

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-307`

---
*Template created: 2025-09-30T15:03:55.011Z*
*AI exploration to follow*
