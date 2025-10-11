# Build Plan: HODGE-341.1

## Feature Overview
**PM Issue**: HODGE-341.1 (linear)
**Status**: Completed

## Implementation Checklist

### Core Implementation
- [x] Create main component/module - ToolchainService and DiagnosticsService
- [x] Implement core logic - Tool detection, execution, and result aggregation
- [x] Add error handling - Tool unavailability handled with warnings
- [x] Include inline documentation - JSDoc comments throughout

### Integration
- [x] Connect with existing modules - Uses logger, yaml parser
- [ ] Update CLI/API endpoints - Deferred to Phase 2 (harden command integration)
- [x] Configure dependencies - Added js-yaml for toolchain.yaml parsing

### Quality Checks
- [x] Follow coding standards - TypeScript strict mode, documented
- [x] Use established patterns - Service class pattern, logger usage
- [x] Add basic validation - Config loading validation
- [x] Consider edge cases - Missing tools, malformed output, non-git repos

## Files Modified

### New Files Created
- `src/types/toolchain.ts` - Type definitions for toolchain config, diagnostics
- `src/lib/toolchain-service.ts` - Tool detection and execution service (331 lines)
- `src/lib/diagnostics-service.ts` - Result aggregation and normalization (270 lines)
- `src/lib/toolchain-service.smoke.test.ts` - 8 smoke tests for ToolchainService
- `src/lib/diagnostics-service.smoke.test.ts` - 9 smoke tests for DiagnosticsService

## Decisions Made

1. **Used instance logger pattern** - Consistent with existing command patterns (HODGE-330)
2. **Three-tier tool detection** - Config files > package.json > PATH (exploration decision)
3. **Template substitution for ${files}** - Enables flexible file scoping (exploration decision)
4. **Filter TypeScript diagnostics to uncommitted files** - Run tsc on full project, filter results (exploration decision)
5. **Simple pass rate calculation** - pass_rate = (checks with 0 issues / total checks) * 100 (exploration decision)

## Testing Notes

### Smoke Tests (17 total - all passing)
- ToolchainService: Tool detection, config loading, git integration, command substitution
- DiagnosticsService: Result aggregation, pass rate calculation, parser validation

### Test Coverage
- Tool detection from config files and package.json
- Command template substitution with ${files} placeholder
- Error handling for missing tools and malformed output
- File filtering for uncommitted files only
- Multiple tool output parsers (TypeScript, ESLint, Prettier, Vitest)

### Known Limitations (for Harden phase)
- ESLint `any` types in JSON parsing (37 warnings) - expected for external tool output
- No integration with /harden command yet (Phase 2)
- No sample toolchain.yaml created (needs documentation)

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-341.1` for production readiness
