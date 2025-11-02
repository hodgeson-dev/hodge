# Build Plan: HODGE-377.2

## Feature Overview
PM-Required Feature Creation with Dynamic Issue Detection and Two-Step Workflow
**Status**: In Progress

## Implementation Progress

### Phase 1: PM Adapter Enhancement ✅ COMPLETE
- [x] Add `isValidIssueID()` method to BasePMAdapter interface
- [x] Implement ID detection in LinearAdapter (PROJ-123 format)
- [x] Implement ID detection in GitHubAdapter (#123 or 123 format)
- [x] Implement ID detection in LocalAdapter (HOD-001, HODGE-123 format)
- [x] Write smoke tests for adapter ID detection (5 tests, all passing)

### Phase 2: Explore Command Enhancement ✅ COMPLETE
- [x] Add `--create-issue` flag and handler (stub implementation for build phase)
- [x] Add `--rerun` flag and handler (stub implementation for build phase)
- [x] Add title/description options for --create-issue
- [x] Remove test-intentions.md file creation (redundant)
- [x] Write smoke tests for explore command flags (6 tests, all passing)

### Phase 3: Integration & Testing ✅ COMPLETE
- [x] Run full smoke test suite (935 tests passing)
- [x] Verify all tests pass ✅
- [x] Update build plan with final status
- [ ] Stage changes with `git add`

## Files Modified
- `src/lib/pm/base-adapter.ts` - Added abstract isValidIssueID() method
- `src/lib/pm/linear-adapter.ts` - Implemented Linear ID detection (PROJ-123)
- `src/lib/pm/github-adapter.ts` - Implemented GitHub ID detection (#123, 123)
- `src/lib/pm/local-pm-adapter.ts` - Implemented Local ID detection (HOD-001, HODGE-123)
- `src/lib/pm/pm-adapter-id-detection.smoke.test.ts` - NEW: Smoke tests for ID detection (5 tests)
- `src/bin/hodge.ts` - Added --create-issue, --title, --description, --rerun flags to explore command
- `src/commands/explore.ts` - Added ExploreOptions fields and stub handlers for new flags
- `src/commands/explore-flags.smoke.test.ts` - NEW: Smoke tests for explore flags (6 tests)
- `src/lib/explore-service.ts` - Removed test-intentions.md file creation
- `.hodge/features/HODGE-377.2/build/build-plan.md` - Updated with implementation progress

## Decisions Made
1. **Adapter-specific ID patterns**: Each adapter implements its own regex for ID format validation
2. **Entire input matching**: Patterns must match the ENTIRE input string, not partial matches
3. **Whitespace handling**: All adapters trim input before validation
4. **Test isolation**: Using TempDirectoryFixture for all adapter instantiation in tests
5. **Stub implementations for build**: --create-issue and --rerun have acknowledgment handlers only; full implementation deferred to harden phase
6. **Removed test-intentions.md**: AI writes test intentions directly into exploration.md, eliminating redundancy

## Testing Notes
- 11 total smoke tests created (5 for adapter ID detection + 6 for explore flags)
- All 935 smoke tests passing ✅
- Tests cover:
  - Adapter ID validation (valid/invalid formats, whitespace, partial matches)
  - Flag acceptance and validation (--create-issue requires --title, --rerun accepts reason)
  - Flow control (flags bypass normal exploration)
  - Normal exploration still works when flags absent

## Summary

### What Was Implemented (Build Phase)
✅ **Foundation for PM-required feature creation**:
- All three adapters can now detect their specific issue ID formats
- Explore command accepts --create-issue and --rerun flags
- Removed redundant test-intentions.md file creation
- 11 new smoke tests verify basic functionality

### What's Deferred to Harden Phase
⏭️ **Full two-step workflow implementation**:
- Actual PM issue fetching when ID detected
- PM issue creation via --create-issue
- Re-exploration file loading and overwriting
- Integration tests for end-to-end workflows
- Error handling for PM API failures

## Next Steps
1. ✅ All build-phase tasks complete
2. Stage changes: `git add .`
3. Proceed to `/harden HODGE-377.2` for:
   - Integration tests
   - Full PM adapter workflow implementation
   - End-to-end testing of two-step creation flow
   - Re-exploration logic with context loading
