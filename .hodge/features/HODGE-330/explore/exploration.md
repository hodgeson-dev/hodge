# Exploration: HODGE-330

## Title
Fix CI console.log validation failure and establish logging standards

## Feature Overview
**PM Issue**: HODGE-330
**Type**: Bug fix + Standards establishment
**Created**: 2025-10-05T01:31:48.363Z

## Problem Statement

The CI quality check (Node 20.x) is failing in the "Validate standards" step because 38 files contain direct `console.log()` calls. The validator currently treats this as a blocking error, but the project legitimately needs both persistent logging (pino) for debugging and user-visible console output for command feedback.

Currently, there's inconsistent logging usage across the codebase: some files use the pino logger, others use direct console calls, and the logger's dual-output wrapper only works for the `init` command. Additionally, there are no documented logging standards to guide developers on when to use console vs. pino logging.

## Conversation Summary

We explored the requirements for logging across different parts of the codebase and identified three distinct contexts:

**Library code** (`src/lib/**`) should only write to pino logs since these are internal implementation details that users don't need to see directly. Console output from libraries would create noise without value.

**Command files** (`src/commands/**`) need dual logging - both console output for immediate user feedback and pino logging for persistent debugging. This applies to both user-executed commands (`init`, `logs`) and AI-orchestrated commands (`explore`, `build`, etc.) that run from Claude Code slash commands.

**Test files** benefit from console.log for debugging test failures, so we should allow it there rather than enforcing strict logger usage.

The current logger implementation has a dual-output pattern but only detects the `init` command via brittle argv parsing. We need a more reliable way to control console output per-logger instance. The conversation identified using an explicit `enableConsole` flag passed to logger creation as the clearest approach.

For the migration, we discussed replacing all direct `console.log()` calls with proper logger methods like `logger.info()`. This is a significant refactor (~38 files) but provides consistency and ensures all logging goes through the managed wrapper. The validator should be temporarily downgraded to a warning (non-blocking) during the transition period.

We also identified that the validator needs to exempt test files, the scripts directory, and the logger implementation itself from the console.log check, since these have legitimate reasons for direct console usage.

Finally, we confirmed the need to add these logging patterns as enforced standards in `.hodge/standards.md` to prevent future regressions.

## Implementation Approaches

### Approach 1: Comprehensive Dual Logging Refactor

**Description**: Enhance the logger with explicit console control, migrate all files to use the logger wrapper, update validation rules, and establish formal standards.

**Implementation Steps**:
1. **Update logger.ts**:
   - Change to named exports: `export const logger`, `export function createCommandLogger(...)`
   - Add `enableConsole` option to `createCommandLogger(name, { enableConsole: boolean })`
   - Remove brittle `isInitCommand` argv detection
   - Update convenience methods (info, warn, error, debug) to respect the flag
   - Default to `enableConsole: false` (library mode)

2. **Migrate command files** (~20 files in `src/commands/`):
   - Import: `import { createCommandLogger } from '../lib/logger.js'`
   - Create logger: `const logger = createCommandLogger('commandName', { enableConsole: true })`
   - Replace all `console.log()` → `logger.info()`
   - Replace all `console.error()` → `logger.error()`
   - Replace all `console.warn()` → `logger.warn()`

3. **Migrate library files** (~18 files in `src/lib/`):
   - Import: `import { createCommandLogger } from './logger.js'`
   - Create logger: `const logger = createCommandLogger('libName', { enableConsole: false })`
   - Replace all `console.log()` → `logger.info()`
   - Remove any direct console usage

4. **Update validate-standards.js**:
   - Downgrade console.log check from `error` to `warning` (line 195)
   - Add exemptions for:
     - Test files: `*.test.ts`, `*.spec.ts`
     - Scripts directory: `scripts/**`
     - Logger itself: `src/lib/logger.ts`
   - Update check logic to filter exempted files before validation

5. **Add logging standards to .hodge/standards.md**:
   - Create new "Logging Standards" section
   - Document command vs. library logging patterns
   - Specify when to use `enableConsole: true` vs `false`
   - Mark as mandatory enforcement (all phases)

**Pros**:
- Establishes clear, consistent logging pattern across entire codebase
- Maintains user-visible output where needed while ensuring persistent logs
- Type-safe with named exports and TypeScript
- Prevents future console.log regressions via standards + validation
- Addresses root cause comprehensively

**Cons**:
- Large refactor touching ~38 files
- Requires careful testing to ensure no output is lost
- Temporary CI warning period could allow issues to slip through
- Migration takes significant time

**When to use**: This is the recommended approach for establishing long-term logging consistency and fixing the immediate CI failure.

---

### Approach 2: Quick Fix with Gradual Migration

**Description**: Immediately downgrade the validator to warning mode and migrate files incrementally over time.

**Implementation Steps**:
1. **Immediate fix**:
   - Change validate-standards.js line 195: `'error'` → `'warning'`
   - Add exemptions for test files and scripts
   - CI now passes with warnings

2. **Gradual migration**:
   - Update logger.ts with named exports and `enableConsole` flag
   - Migrate one command at a time when touching files for other work
   - Track migration progress in a checklist

3. **Eventually upgrade to error**:
   - Once all files migrated, change validator back to `'error'`
   - Add standards documentation at that point

**Pros**:
- Unblocks CI immediately
- Lower risk - changes spread over time
- Can validate pattern works before full commitment

**Cons**:
- Incomplete solution leaves inconsistent patterns in place
- Easy to forget about migration and leave it incomplete
- No standards enforcement means new code might use old patterns
- Warnings get ignored, issues accumulate

**When to use**: If you need CI green immediately and want to defer the full refactor, but this risks never completing the migration.

---

### Approach 3: Disable Console Check Entirely

**Description**: Remove or permanently disable the console.log validation check.

**Implementation Steps**:
1. Remove `checkNoConsoleLog()` from validate-standards.js
2. Or add `--no-console-check` flag to CI command
3. Accept mixed console.log and logger usage

**Pros**:
- Fastest solution (5 minutes)
- No migration needed
- Maximum flexibility for developers

**Cons**:
- Loses enforcement of logging standards
- Mixed patterns cause confusion
- No persistent logs from direct console.log calls
- Debugging production issues becomes harder
- Defeats the purpose of having a logger

**When to use**: Not recommended. Only if logging consistency is not important to the project.

---

## Recommendation

**Use Approach 1: Comprehensive Dual Logging Refactor**

This is the right long-term solution that addresses both the immediate CI failure and the underlying architectural issue. While it's a significant refactor, the conversation confirmed you're comfortable with this scope, and we can fix any issues that arise during migration.

The benefits of consistent logging standards, persistent debug logs, and clear separation between command/library logging patterns are worth the migration effort. The validator's temporary warning mode provides a safety net during transition, and documenting the standards prevents future regressions.

The alternative approaches either defer the problem (Approach 2) or ignore it entirely (Approach 3), which will cause more pain in the long run.

## Test Intentions

### 1. Logger creates command loggers with console control
**Behavior**: When creating a command logger with `createCommandLogger('cmd', { enableConsole: true })`, the logger should write to both console and pino. When `enableConsole: false` or omitted, logger should write only to pino.

**Verification**:
- Create logger with `enableConsole: true`, call `logger.info('test')`, verify both console output and pino log entry
- Create logger with `enableConsole: false`, call `logger.info('test')`, verify only pino log entry (no console)

---

### 2. All command files use dual logging
**Behavior**: Command files in `src/commands/**` should use logger methods (`logger.info()`, `logger.error()`) with console enabled, and should not contain direct `console.log()` calls.

**Verification**:
- Run validator against command files, verify no console.log warnings (after migration)
- Execute a command (e.g., `hodge init`), verify console output appears
- Check pino log files, verify command execution was logged

---

### 3. Library files use pino-only logging
**Behavior**: Library files in `src/lib/**` should use logger methods with console disabled, and should not contain direct `console.log()` calls.

**Verification**:
- Run validator against library files, verify no console.log warnings (after migration)
- Trigger library code execution, verify no console output appears
- Check pino log files, verify library operations were logged

---

### 4. Validation check exempts appropriate files
**Behavior**: The validate-standards.js check should allow console.log in test files (`*.test.ts`, `*.spec.ts`), scripts directory (`scripts/**`), and the logger implementation itself (`src/lib/logger.ts`). It should downgrade to warning (non-blocking) during transition period.

**Verification**:
- Add console.log to a test file, run validator, verify no error (exempted)
- Add console.log to a script, run validator, verify no error (exempted)
- Add console.log to a command file, run validator, verify warning (not error)
- CI should pass with warnings, not fail

---

### 5. Logger uses named exports
**Behavior**: The logger should export its functionality using named exports (`export const logger`, `export function createCommandLogger`) for TypeScript compatibility and better IDE support.

**Verification**:
- Import using `import { logger, createCommandLogger } from './logger'`, verify no TypeScript errors
- Use logger methods, verify autocomplete and type checking works
- Build project, verify no import errors

---

## Decisions Decided During Exploration

1. ✓ **Library code logging**: Library code (`src/lib/**`) uses pino-only logging (no console output)
2. ✓ **Command logging**: All commands (`src/commands/**`) use dual logging (console + pino)
3. ✓ **Test file console usage**: Test files allow console.log for debugging purposes
4. ✓ **Logger creation API**: Use explicit flag for logger creation: `createCommandLogger('name', { enableConsole: true/false })`
5. ✓ **Migration strategy**: Replace all console.log with logger.info() calls (comprehensive refactor approach)
6. ✓ **Logger API style**: Use named exports: `import { logger, createCommandLogger } from './logger'`
7. ✓ **Validation exemptions**: Exempt scripts directory, test files, and logger implementation from console.log check
8. ✓ **Validation severity**: Downgrade validation to warning (non-blocking) during transition period
9. ✓ **Standards documentation**: Add logging standards to `.hodge/standards.md` as mandatory requirements

## Decisions Needed

**No Decisions Needed**

All decisions were resolved during the exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to confirm the recommended approach
- [ ] Proceed to `/build HODGE-330`

---
*Exploration completed: 2025-10-05*
*Conversational exploration with user*
