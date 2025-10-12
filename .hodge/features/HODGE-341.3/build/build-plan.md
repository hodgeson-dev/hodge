# Build Plan: HODGE-341.3

## Feature Overview
**PM Issue**: HODGE-341.3 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create main component/module
- [x] Implement core logic
- [x] Add error handling
- [x] Include inline documentation

### Integration
- [x] Connect with existing modules
- [x] Update CLI/API endpoints
- [x] Configure dependencies

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns
- [x] Add basic validation
- [x] Consider edge cases

## Files Modified

### New Services
- `src/lib/import-analyzer.ts` - Analyzes import fan-in across project to identify architectural impact
- `src/lib/severity-extractor.ts` - Extracts severity levels from tool output using keyword matching
- `src/lib/critical-file-selector.ts` - Selects critical files for AI review based on risk scoring
- `src/lib/critical-files-report-generator.ts` - Generates markdown reports for critical file analysis

### Modified Files
- `src/commands/harden.ts` - Enhanced handleReviewMode to run quality checks and critical file selection
- `.hodge/toolchain.yaml` - Added documentation for max_critical_files and critical_paths settings
- `.claude/commands/harden.md` - Updated slash command template with new review steps

### Test Files
- `src/lib/critical-file-selector.smoke.test.ts` - 11 smoke tests for all critical file selection components

## Decisions Made

1. **Import Analysis Scope**: Analyze entire project (all src/ files) for accurate impact radius, not just changed files
2. **Severity Extraction**: Basic keyword matching (error/blocker/critical/warning) sufficient for initial version
3. **Quality Checks in Review Mode**: Moved quality checks execution from base harden command into --review path so AI has complete context
4. **Default Settings**: 10 files max for deep review (configurable), >20 imports threshold for inferred critical paths
5. **Toolchain Config Loading**: Load settings from .hodge/toolchain.yaml using yaml.load(), graceful fallback to defaults

## Testing Notes

### Smoke Tests (11 tests, all passing)
- Service instantiation tests (no crashes)
- SeverityExtractor functionality (extracts severity, returns score multipliers)
- CriticalFileSelector basic operation (selects files, handles empty input, respects maxFiles limit)
- CriticalFilesReportGenerator output validation (markdown format, required sections)
- Edge case handling (empty project, non-existent directories)

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-341.3` for production readiness
