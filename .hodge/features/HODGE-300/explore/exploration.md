# Exploration: HODGE-300

## Feature Overview
**PM Issue**: HODGE-300
**Type**: general
**Created**: 2025-09-30T03:36:14.237Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Problem Analysis

The issue is straightforward: In `src/bin/hodge.ts` (line 153-161), the `plan` command is defined but **the `--create-pm` flag is not registered in the CLI parser**. The code in `src/commands/plan.ts` line 11 defines `createPm?: boolean` in the options interface, and lines 83-89 use it to conditionally create PM issues. However, the CLI parser only accepts `--lanes` and `--local-only` options.

**Current CLI Definition (src/bin/hodge.ts:153-161):**
```typescript
program
  .command('plan [feature]')
  .description('[Internal] Plan work structure and create PM issues')
  .option('--lanes <number>', 'Number of development lanes', parseInt)
  .option('--local-only', 'Skip PM tool integration')  // ❌ Wrong option name!
  .action(...)
```

**Expected in Code (src/commands/plan.ts:8-13):**
```typescript
export interface PlanOptions {
  lanes?: number;
  localOnly?: boolean;  // ✓ This exists in parser
  createPm?: boolean;   // ❌ This is missing from parser!
  feature?: string;
}
```

## Implementation Approaches

### Approach 1: Add Missing `--create-pm` Flag
**Description**: Add the missing `--create-pm` flag to the CLI parser to match the code expectations.

**Pros**:
- Minimal change (one line)
- Fixes the immediate issue
- Matches the existing code interface
- Follows the design in `/plan` command documentation

**Cons**:
- Still have `--local-only` flag that seems redundant
- Two flags for opposite purposes (`--create-pm` vs `--local-only`) is confusing

**When to use**: When you want the quickest fix with minimal risk and don't want to change the existing option names.

**Implementation**:
```typescript
program
  .command('plan [feature]')
  .description('[Internal] Plan work structure and create PM issues')
  .option('--lanes <number>', 'Number of development lanes', parseInt)
  .option('--local-only', 'Skip PM tool integration')
  .option('--create-pm', 'Create PM issues after saving plan')  // ADD THIS
  .action(...)
```

---

### Approach 2: Remove `--local-only`, Keep Only `--create-pm`
**Description**: Remove the redundant `--local-only` flag and use only `--create-pm` for explicit PM issue creation.

**Pros**:
- Cleaner interface with single flag
- Explicit intent ("create PM issues" vs "don't create PM issues")
- Matches the "safe by default" principle (no PM issues unless explicitly requested)
- Aligns with existing code behavior (line 83-89 checks `createPm` flag)
- Consistent with CLI Architecture Standard: "If a decision is needed, make sensible default choice"

**Cons**:
- Breaking change if anyone is using `--local-only` (unlikely given it wasn't working)
- Need to update documentation/tests

**When to use**: When you want a clean, explicit interface that follows best practices.

**Implementation**:
```typescript
program
  .command('plan [feature]')
  .description('[Internal] Plan work structure and create PM issues')
  .option('--lanes <number>', 'Number of development lanes', parseInt)
  .option('--create-pm', 'Create PM issues in Linear after saving plan')
  .action(async (feature: string | undefined, options: { lanes?: number; createPm?: boolean }) => {
    // Remove localOnly from type signature
    const { PlanCommand } = await import('../commands/plan');
    const planCommand = new PlanCommand();
    await planCommand.execute({ feature, ...options });
  });
```

Then update `PlanOptions` interface to remove `localOnly`.

---

### Approach 3: Map `--local-only` to Inverse of `--create-pm`
**Description**: Support both flags for backward compatibility, mapping `--local-only` to the inverse of `createPm`.

**Pros**:
- Backward compatible (if anyone was trying to use `--local-only`)
- Supports both explicit styles ("create PM" vs "don't create PM")
- Flexibility for different user preferences

**Cons**:
- More complex logic
- Confusing to have two opposite flags
- What happens if both flags are provided?
- Violates principle of simplicity

**When to use**: When backward compatibility is critical and you must support both flag styles.

**Implementation**:
```typescript
.option('--lanes <number>', 'Number of development lanes', parseInt)
.option('--local-only', 'Skip PM tool integration')
.option('--create-pm', 'Create PM issues after saving plan')
.action(async (feature: string | undefined, options: {
  lanes?: number;
  localOnly?: boolean;
  createPm?: boolean;
}) => {
  // Map localOnly to inverse of createPm
  const finalOptions = {
    ...options,
    createPm: options.createPm || !options.localOnly,
    feature
  };
  const { PlanCommand } = await import('../commands/plan');
  const planCommand = new PlanCommand();
  await planCommand.execute(finalOptions);
});
```

## Recommendation

**Approach 2: Remove `--local-only`, Keep Only `--create-pm`**

**Rationale**:
1. **Matches Documentation**: The `/plan` command documentation (line 316) explicitly states: "NEVER call `hodge plan` with `--create-pm` without explicit user approval"
2. **Safe by Default**: Default behavior (no flag) = save locally only. This is the safest option.
3. **Explicit Intent**: Using `--create-pm` makes it crystal clear that PM issues will be created
4. **Simplest Interface**: One flag is better than two opposite flags
5. **Low Risk**: The `--local-only` flag wasn't working anyway, so no one could be relying on it
6. **Follows Standards**: Aligns with CLI Architecture Standards about making sensible defaults

The fix is straightforward:
- Add `--create-pm` option to CLI parser
- Remove `--local-only` from parser and interface
- Update tests and documentation

## Decisions Needed

1. **Flag Naming Decision**: Should we use `--create-pm` (explicit), `--pm` (shorter), or keep both `--create-pm` and `--local-only`?
   - Recommended: `--create-pm` for clarity

2. **Backward Compatibility Decision**: Should we maintain `--local-only` for backward compatibility?
   - Recommended: No, remove it (low risk since it wasn't working)

3. **Default Behavior Decision**: What should happen when no flags are provided?
   - Recommended: Save locally only (safe by default)

4. **Validation Decision**: Should we validate that `--create-pm` is only used after decisions are made?
   - Recommended: Yes, the command already checks for decisions (line 68-71)

5. **Testing Strategy Decision**: What tests are needed?
   - Smoke test: Verify flag is parsed correctly
   - Integration test: Verify PM issues are created only with `--create-pm`
   - Test that default behavior (no flag) saves locally only

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-300`

---
*Template created: 2025-09-30T03:36:14.237Z*
*AI exploration to follow*
