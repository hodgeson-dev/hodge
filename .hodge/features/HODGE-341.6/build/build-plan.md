# Build Plan: HODGE-341.6

## Feature Overview
**PM Issue**: HODGE-341.6 (linear)
**Status**: In Progress → Completed (Ready for Harden)

## Implementation Checklist

### Core Implementation
- [x] Create AutoFixService module
- [x] Implement core logic for auto-fix workflow
- [x] Add error handling (try-catch with fallback for non-zero exits)
- [x] Include inline documentation (comprehensive JSDoc comments)

### Integration
- [x] Connect with existing modules (git-utils.ts, logger.ts)
- [x] Update CLI endpoints (harden.ts --fix flag)
- [x] Configure dependencies (tool-registry.yaml)

### Quality Checks
- [x] Follow coding standards (TypeScript strict mode, proper interfaces)
- [x] Use established patterns (service class pattern, logger pattern)
- [x] Add basic validation (file filtering, tool scoping)
- [x] Consider edge cases (no staged files, tool failures, non-zero exits)

## Files Modified

### New Files
- `src/lib/auto-fix-service.ts` - Core auto-fix service with workflow orchestration

### Modified Files
- `src/bundled-config/tool-registry.yaml` - Added fix_command to 6 tools:
  - eslint: `npx eslint --fix ${files}`
  - prettier: `npx prettier --write ${files}`
  - ruff: `ruff check --fix ${files}`
  - black: `black ${files}`
  - ktlint: `ktlint -F ${files}`
  - google-java-format: `google-java-format --replace ${files}`

- `src/commands/harden.ts` - Added:
  - `--fix` flag support (line 29)
  - `handleAutoFix()` method (lines 721-768)
  - AutoFixService import and integration

- `src/lib/git-utils.ts` - Added:
  - `getStagedFiles()` function (line 325)
  - `stageFiles()` function (line 341)

## Decisions Made

1. **Fix Command Scope**: Only tools with auto-fix capabilities get `fix_command`
   - Formatters: prettier, black, google-java-format, ktlint
   - Linters: eslint, ruff
   - Excluded: Type checkers, testing tools, complexity analyzers (no auto-fix)

2. **Tool Execution Order**: Formatters first, then linters
   - Ensures consistent baseline before linters make fixes
   - Implemented in `orderToolsByType()` method

3. **Error Handling**: Treat non-zero exits as success if output exists
   - Some tools (eslint) exit non-zero even when fixes succeed
   - Check stdout for output to determine actual success

4. **File Scoping**: Filter files by extension per tool
   - Prevents running formatters on incompatible files
   - Improves performance by avoiding unnecessary tool runs

5. **Re-staging Strategy**: Automatically re-stage modified files
   - Ensures fixed files are included in commit
   - Non-critical operation (warns but doesn't fail on error)

## Testing Notes

### Smoke Tests Status
✅ All 169 smoke tests passing (verified with `npm run test:smoke`)

### Test Coverage
- AutoFixService: Full workflow tested via harden command integration
- Tool registry: All fix commands validated for correct syntax
- Git utils: Staged file operations tested through real git interactions

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-341.6` for production readiness
