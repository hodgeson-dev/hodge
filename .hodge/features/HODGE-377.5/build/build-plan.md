# Build Plan: HODGE-377.5

## Feature Overview
No PM issue linked
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Extended BasePMAdapter interface with sub-feature methods
- [x] Implemented LocalAdapter sub-feature methods (directory parsing)
- [x] Implemented LinearAdapter sub-feature methods (Linear API)
- [x] Implemented GitHubAdapter sub-feature methods (labels/task lists)
- [x] Added comprehensive inline documentation with HODGE-377.5 markers

### Integration
- [ ] Refactor id-manager.ts to use adapter methods
- [ ] Refactor sub-feature-context-service.ts to use adapter methods
- [ ] Refactor local-pm-adapter.ts to remove hardcoded patterns
- [ ] Refactor lessons.ts to use adapter-agnostic patterns

### Quality Checks
- [x] Follow coding standards (zero TypeScript errors)
- [x] Added smoke tests (8 tests, all passing)
- [x] Error handling with graceful degradation
- [x] Proper async/await patterns throughout

## Files Modified
- `src/lib/pm/base-adapter.ts` - Added isEpic(), getSubIssues(), getParentIssue() abstract methods
- `src/lib/pm/local-pm-adapter.ts` - Implemented sub-feature methods via directory scanning
- `src/lib/pm/linear-adapter.ts` - Implemented sub-feature methods via Linear API
- `src/lib/pm/github-adapter.ts` - Implemented sub-feature methods via labels and task lists
- `src/lib/pm/sub-feature-methods.smoke.test.ts` - New test file with 8 smoke tests

## Decisions Made
- **Adapter-Centric Design**: Each adapter owns its sub-feature detection logic (directory names for Local, API for Linear, labels/task lists for GitHub)
- **Async Throughout**: All sub-feature methods are async to accommodate API calls (acceptable for non-hot-path operations)
- **Graceful Degradation**: API failures return empty arrays/null rather than throwing, with warning logs
- **Numeric Sorting**: LocalAdapter sorts sub-features numerically (HODGE-377.1, HODGE-377.2, HODGE-377.10) not lexicographically
- **GitHub Limitations**: getParentIssue() returns null for GitHub (no native parent/child relationships)

## Testing Notes
- 8 smoke tests covering all three new methods across LocalAdapter
- Tests verify method existence, epic detection, sub-issue listing, and parent extraction
- All tests use TempDirectoryFixture for proper isolation
- Zero TypeScript compilation errors
- Tests run in 13ms

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-377.5` for production readiness
