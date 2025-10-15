# Build Plan: HODGE-344.3

## Feature Overview
**PM Issue**: HODGE-344.3 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create main component/module (ReviewEngineService)
- [x] Implement core logic (analyzeFiles workflow)
- [x] Add error handling (try-catch in git utilities)
- [x] Include inline documentation (JSDoc comments throughout)

### Integration
- [x] Connect with existing modules (ManifestGenerator, ToolchainService, CriticalFileSelector)
- [x] Update ToolchainService to accept file lists
- [x] Configure dependencies (dependency injection via constructor)

### Quality Checks
- [x] Follow coding standards (TypeScript strict mode, logger usage)
- [x] Use established patterns (service class pattern, dependency injection)
- [x] Add basic validation (empty file list handling)
- [x] Consider edge cases (binary files, zero-change files, missing tool registry entries)

## Files Modified

### Core Service
- `src/lib/review-engine-service.ts` - Main service orchestrating review workflow
- `src/types/review-engine.ts` - Type definitions for ReviewOptions, ReviewFindings, EnrichedToolResult

### Supporting Utilities
- `src/lib/git-utils.ts` - Added getFileChangeStats() function for change statistics
- `src/lib/toolchain-service.ts` - Extended runQualityChecks() to accept file lists (FileScope | string[])

### Tests
- `src/lib/review-engine-service.smoke.test.ts` - 12 smoke tests with mocked dependencies

## Decisions Made

1. **Dependency Injection Pattern**: Used constructor injection for all dependencies (ManifestGenerator, ToolchainService, CriticalFileSelector, ToolRegistryLoader) to enable testability with mocks

2. **No Output Parsing**: Service returns raw stdout/stderr combined into single output string. AI interprets tool outputs during user conversation.

3. **Conservative Auto-fix Detection**: Only mark autoFixable=true when tool has fix_command in registry. No attempt to parse tool-specific output formats.

4. **Manifest-First Workflow**: Generate manifest before running quality checks, following existing /harden pattern for consistency.

5. **Change Stats from Git**: Use real git diff --numstat for change statistics rather than fake/zero stats. Needed for accurate critical file risk scoring.

## Testing Notes

### Smoke Tests (12 tests)
- Service instantiation and method presence
- Parameter acceptance and return type structure
- Auto-fixable flag enrichment (true for eslint, false for tsc)
- Critical selection policy (calls selector when enabled, skips when disabled)
- Scope metadata propagation
- Empty file list handling

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-344.3` for production readiness
