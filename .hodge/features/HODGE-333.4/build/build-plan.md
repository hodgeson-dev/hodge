# Build Plan: HODGE-333.4

## Feature Overview
**PM Issue**: HODGE-333.4 (linear)
**Status**: In Progress
**Approach**: Service-First with Incremental Integration (4 phases)

## Implementation Checklist

### Phase 1: ProfileCompositionService ✅ COMPLETE
- [x] Create ProfileCompositionService class
- [x] Implement review-config.md parsing
- [x] Load profiles from config
- [x] Concatenate with precedence markers
- [x] Handle missing files gracefully
- [x] Write 5 smoke tests (all passing)

### Phase 2: Update /review file Command ✅ COMPLETE
- [x] Replace hardcoded profile with ProfileCompositionService
- [x] Update command output to show loaded profiles
- [x] Fix existing smoke tests (8 tests passing)
- [x] Verify composition works end-to-end

### Phase 3: /harden Integration 🔄 IN PROGRESS
- [ ] Add review step before tests in HardenCommand
- [ ] Get changed files via git diff
- [ ] Run AI review using ProfileCompositionService
- [ ] Generate review-report.md in harden directory
- [ ] Block on BLOCKER severity issues
- [ ] Update harden-report.md with review results
- [ ] Write smoke tests for harden review integration

### Phase 4: Expanded Review Scopes ✅ COMPLETE
- [x] Implement `/review directory <path>` - Recursively reviews all code files
- [x] Implement `/review recent --last N` - Reviews files from last N commits
- [x] Add .gitignore filtering for directory scope (skips node_modules, .git, .hodge)
- [x] File type filtering (ts, js, tsx, jsx, py, java, kt, go, rs)
- [x] Register review command in CLI with proper options

## Files Modified
- `src/lib/profile-composition-service.ts` - New service for composing review context
- `src/lib/profile-composition-service.smoke.test.ts` - 5 smoke tests
- `src/commands/review.ts` - Updated with multi-scope support (file/directory/recent)
- `src/commands/review.smoke.test.ts` - Fixed tests (8 passing)
- `src/commands/harden.ts` - Added `--review` flag and review mode handling
- `src/bin/hodge.ts` - Added `--review` option to harden, registered review command

## Decisions Made
- **Default profiles**: Use `languages/general-coding-standards` and `testing/general-test-standards` when no review-config.md exists
- **Parsing logic**: Handle both flat profile lists and ### subsections in review-config.md
- **Missing profiles**: Warn and continue (don't fail) when profiles listed in config are missing

## Testing Notes
- All smoke tests passing (13 total: 5 composition + 8 review command)
- ProfileCompositionService handles missing files gracefully
- Review command now loads multiple profiles successfully

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-333.4` for production readiness
