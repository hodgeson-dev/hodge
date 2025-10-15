# Build Plan: HODGE-344.4

## Feature Overview
**PM Issue**: HODGE-344.4 (linear)
**Status**: Complete
**Feature**: AI-Orchestrated Review Command Integration

## Implementation Checklist

### Core Implementation
- [x] Create main component/module (ReviewCommand)
- [x] Implement core logic (file scoping, manifest generation, quality checks)
- [x] Add error handling (FileScopingError, validation errors)
- [x] Include inline documentation (JSDoc comments throughout)

### Integration
- [x] Connect with existing modules (ReviewEngineService, AutoFixService, git-utils)
- [x] Update CLI/API endpoints (bin/hodge.ts with flag-based API)
- [x] Configure dependencies (dependency injection in constructor)

### Quality Checks
- [x] Follow coding standards (Logging Standards, CLI Architecture Standards)
- [x] Use established patterns (thin orchestration, service extraction)
- [x] Add basic validation (scope flag validation, file existence checks)
- [x] Consider edge cases (FileScopingError handling, path sanitization)

## Files Modified

### Implementation
- `src/commands/review.ts` (343 lines) - Complete rewrite for HODGE-344.4
  - Flag-based API (--file, --directory, --last, --fix)
  - Thin orchestration layer following CLI Architecture Standards
  - Dependency injection pattern for testability
  - File discovery using git utilities from HODGE-344.1
  - Review directory creation with naming: review-{scope}-{target}-{timestamp}
  - Manifest and quality checks writing
  - Auto-fix workflow support via AutoFixService

- `src/bin/hodge.ts` (lines 87-98) - Updated command registration
  - Changed from `command('review <scope> [path]')` to `command('review')` with flags
  - Added --file, --directory, --last, --fix options
  - Updated action handler to use ReviewCommandOptions interface

### Slash Command Template
- `.claude/commands/review.md` (331 lines) - Complete rewrite for HODGE-344.4
  - 9-step AI workflow guide (execute → read → load context → interpret → fix selection → apply fixes → verify → write report → conclude)
  - Simplified fix selection menu (3 options instead of 5)
  - Comprehensive edge case handling documentation
  - Review vs Harden comparison
  - Tool failure guidance

### Testing
- `src/commands/review.smoke.test.ts` (190 lines) - 24 smoke tests
  - Command instantiation and method signature tests
  - Flag acceptance tests (file, directory, last, fix)
  - Validation tests (multiple flags, no flags)
  - Private method contract tests (parseScope, discoverFiles, formatTimestamp, sanitizePath, etc.)
  - All tests passing (12ms execution)

## Decisions Made

### Architectural Decisions
- **Thin CLI Orchestration**: Followed CLI Architecture Standards - command class is thin orchestration wrapper, business logic lives in services (ReviewEngineService, AutoFixService)
- **Dependency Injection**: Constructor injection for all service dependencies (ManifestGenerator, ToolchainService, CriticalFileSelector, ToolRegistryLoader, AutoFixService) - enables testability
- **Flag-Based API**: Used --file, --directory, --last flags instead of positional arguments - more flexible and user-friendly
- **FULL Tier Always**: Hard-coded `enableCriticalSelection: false` for /review - all reviews use FULL tier (comprehensive analysis)
- **Review-First Workflow**: Command generates manifest and runs checks, AI interprets and facilitates fixes - clean separation of concerns

### Implementation Decisions
- **Review Directory Naming**: Format `review-{scope-type}-{sanitized-target}-{timestamp}` prevents conflicts and provides clear organization
- **Path Sanitization**: Convert slashes to hyphens, remove special chars, truncate to 100 chars to avoid filesystem limits
- **FileScopingError Handling**: Custom error class for expected empty results with helpful guidance messages
- **Auto-Fix Workflow**: Separate execution path (`if (options.fix)`) that runs formatters first, then linters, then exits
- **Console Logging**: Used `createCommandLogger('review', { enableConsole: true })` following Logging Standards (HODGE-330)

## Testing Notes

### Smoke Tests (24 tests, all passing)
- Command structure validation (instantiation, method signatures)
- Flag acceptance (file, directory, last, fix)
- Validation logic (multiple flags error, no flags error)
- Private method contracts (parseScope, formatTimestamp, sanitizePath)
- Execution: 12ms total, using TempDirectoryFixture pattern

### Test Coverage
- ✅ Command instantiation
- ✅ Method signatures and types
- ✅ Flag validation
- ✅ Private method contracts
- ⏳ Integration tests (harden phase)
- ⏳ End-to-end workflow (harden phase)

## Next Steps
1. ✅ Smoke tests pass (24/24, 12ms)
2. Stage changes with `git add .`
3. Proceed to `/harden HODGE-344.4` for integration tests and production readiness
4. Integration tests should verify:
   - Full workflow: file discovery → manifest generation → quality checks → AI interpretation
   - Auto-fix workflow with real files
   - Review directory creation and artifact writing
   - FileScopingError handling with various edge cases
