# Build Plan: HODGE-366

## Feature Overview
**Fix test isolation violations from process.chdir() contaminating project .hodge directory**
No PM issue linked
**Status**: Complete - All smoke tests passing (928/928)

## Implementation Checklist

### Core Implementation
- [x] Add basePath parameter to PatternLearner
- [x] Fix ExploreService to store and use basePath
- [x] Fix ExploreCommand to store workingDir and use for all path construction
- [x] Remove process.chdir() from explore.sub-feature.test.ts
- [x] Verify all services use constructor injection for basePath

### Integration
- [x] Updated PatternLearner constructor to accept basePath
- [x] Updated ExploreService to store basePath and use it for all file operations
- [x] Updated ExploreCommand to store workingDir as class field
- [x] All services now cascade basePath through dependencies

### Quality Checks
- [x] All smoke tests passing (928/928)
- [x] Test isolation verification passing (3/3)
- [x] No project .hodge/ contamination during tests
- [x] Follow coding standards (constructor injection pattern)

## Files Modified
- `src/lib/pattern-learner.ts` - Added basePath constructor parameter, store as class field
- `src/lib/explore-service.ts` - Added basePath storage, fixed 2 hardcoded paths
- `src/commands/explore.ts` - Added workingDir storage, fixed hardcoded exploreDir path
- `src/commands/explore.sub-feature.test.ts` - Removed process.chdir(), pass basePath to ExploreCommand

## Decisions Made
- **Minimal fix approach**: Only fixed services that actually write to `.hodge/`
- **CacheManager skipped**: Only reads files, no writes, so isolation not required
- **Constructor injection**: Used optional basePath parameter with `process.cwd()` default for backward compatibility
- **Test pattern**: Pass basePath as 3rd parameter to ExploreCommand constructor

## Testing Notes
- test-isolation.smoke.test.ts: 3/3 passing - verifies project .hodge/ unchanged
- explore.new-style.test.ts: 3/3 smoke tests passing - verifies workspace isolation
- explore.sub-feature.test.ts: Fixed and passing - removed process.chdir()
- Full smoke test suite: 928/928 passing (100% pass rate)

## Remaining Work
- [ ] Add ESLint rule to prevent future process.chdir() usage in tests
- [ ] Consider fixing remaining test files mentioned in exploration (4 files using process.chdir())

## Next Steps
After implementation:
1. ✅ Run tests with `npm test` - DONE (928/928 passing)
2. Check linting with `npm run lint`
3. Stage changes with `git add .`
4. Proceed to `/harden HODGE-366` for production readiness
