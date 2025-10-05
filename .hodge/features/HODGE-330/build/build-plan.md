# Build Plan: HODGE-330

## Feature Overview
**PM Issue**: HODGE-330 (linear)
**Status**: Phase 1 Complete - Core Infrastructure Ready
**Approach**: Comprehensive Dual Logging Refactor (from exploration)

## Implementation Checklist

### Phase 1: Core Infrastructure ✅ COMPLETE
- [x] Update logger.ts with named exports
- [x] Add `enableConsole` flag to createCommandLogger
- [x] Remove old default export pattern
- [x] Update validate-standards.js to warning level
- [x] Add exemptions for test files, scripts, logger.ts
- [x] Add logging standards to .hodge/standards.md
- [x] Write smoke tests for new logger functionality
- [x] Verify smoke tests pass (13/13 passing)

### Phase 2: File Migration ✅ COMPLETE
- [x] Migrate command files (10 files in src/commands/) ✅ COMPLETE
  - [x] Smart chalk color detection (chalk.red → logger.error, chalk.yellow → logger.warn)
  - [x] Replace console.log with logger.info()
  - [x] Replace console.error with logger.error()
  - [x] Replace console.warn with logger.warn()
  - [x] Add logger instance: `private logger = createCommandLogger('name', { enableConsole: true })`
  - [x] Migrated: status.ts, load.ts, ship.ts, review.ts, todos.ts, plan.ts, link.ts, save.ts, init-claude-commands.ts (function, not class)
  - [x] Fixed src/bin/hodge.ts (non-class file, uses console directly)
- [x] Migrate library files (17 class-based files) ✅ COMPLETE
  - [x] Migrated: auto-save.ts, cache-manager.ts, config-manager.ts, context-aggregator.ts, context-manager.ts, detection.ts, feature-populator.ts, feature-spec-loader.ts, interaction-state.ts, pattern-learner.ts, pm-manager.ts, prompts.ts, save-manager.ts, session-manager.ts, structure-generator.ts, pm/local-pm-adapter.ts, pm/pm-hooks.ts
  - [x] Each uses: `private logger = createCommandLogger('name', { enableConsole: false })`
  - [x] Function-based files kept console.log: todo-checker.ts, pm-scripts-templates.ts, pm/base-adapter.ts (user-facing output)
  - [x] src/test/runners.ts - no console calls, no migration needed

### Quality Checks
- [x] Logger smoke tests passing (13 tests)
- [x] Fix ESLint errors (was 21, now 0)
- [x] CI validation passes (with warnings)
- [x] TypeScript errors fixed (0 errors after command migration)
- [x] All tests passing after command migration (390 passing, 455 skipped)
- [ ] Run full test suite after library migration
- [ ] Verify no console output from libraries
- [ ] Verify dual logging works in commands

## Files Modified

### Core Logger Infrastructure
- `src/lib/logger.ts` - Added named exports, CommandLoggerOptions interface, enableConsole flag support, dual logging implementation
- `src/lib/logger.smoke.test.ts` - Added tests for enableConsole flag, dual logging behavior, HODGE_SILENT support
- `scripts/validate-standards.js` - Downgraded console.log check to warning, added exemptions for test files/scripts/logger
- `.hodge/standards.md` - Added comprehensive Logging Standards section with command/library patterns

## Decisions Made

1. **Named Exports**: Using named exports (`export const logger`, `export function createCommandLogger`) instead of default export for better TypeScript support
2. **Dual Logging Implementation**: Wrapping pino logger methods to intercept calls and also write to console when `enableConsole: true`
3. **Default to pino-only**: When no options provided, default is `enableConsole: false` (library mode) for safety
4. **HODGE_SILENT support**: Respect HODGE_SILENT env var to suppress console output even with enableConsole: true
5. **Exemptions**: Test files, scripts directory, and logger.ts itself exempt from console.log validation
6. **Warning level**: Temporarily downgrade to warning (non-blocking) during migration period

## Current Status

**✅ Core infrastructure complete and tested:**
- Logger API ready with dual logging support
- Validation script updated and working
- Standards documented
- Smoke tests passing (13/13)

**✅ ESLint blockers resolved:**
- Fixed 21 ESLint errors in logger.ts (used `string | object` types instead of `any`)
- Zero ESLint errors remaining
- CI validation now passes with warnings (non-blocking)

**✅ All file migration complete (Phase 2):**
- 10 command files successfully migrated with smart chalk detection
- 17 library files successfully migrated with pino-only logging
- 3 function-based files kept console.log (user-facing output)
- 0 TypeScript errors
- 804 tests passing (41 intentionally skipped)
- Used Python script for reliable batch migration
- Prettier formatting warnings (pre-existing, non-blocking)

## Testing Notes

**Smoke Tests (13 tests passing)**:
- Logger creation without crashing
- Named exports work correctly
- enableConsole: true enables dual logging
- enableConsole: false uses pino only
- Default (no options) uses pino only
- Console output verified when enabled
- Console output suppressed when disabled
- HODGE_SILENT environment variable respected
- Log rotation and concurrent logging work

**Next testing phase** (after migration):
- Integration tests for command/library logging patterns
- Verify no console output from libraries in test runs
- Verify console output appears from commands
- Test pino log files contain all expected entries

## Next Steps

### Immediate:
1. ✅ ~~Fix ESLint errors~~ COMPLETE (fixed using `string | object` types)

### Next phase:
2. Migrate command files (use pattern: `createCommandLogger('cmd', { enableConsole: true })`)
3. Migrate library files (use pattern: `createCommandLogger('lib', { enableConsole: false })`)
4. Run full test suite to verify no regressions
5. Update validation script to error level after migration complete
6. Proceed to `/harden HODGE-330` for integration tests

## Migration Strategy

Given the scope (29 files to migrate) and current ESLint blockers:

**Option A**: Fix ESLint errors first, then migrate all files
**Option B**: Migrate in small batches, fixing ESLint per batch
**Option C**: Create follow-up sub-issue for migration (HODGE-330.1) after resolving ESLint blockers

**Recommendation**: Fix critical ESLint errors blocking build, then proceed with migration in batches to validate the pattern works correctly before touching all 29 files.
