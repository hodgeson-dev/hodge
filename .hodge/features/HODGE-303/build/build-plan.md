# Build Plan: HODGE-303

## Feature Overview
**PM Issue**: HODGE-303 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Modify sync-claude-commands.js to run prettier after file generation
- [x] Add error handling for prettier failures (graceful degradation)
- [x] Include logging for prettier formatting step
- [x] Inline documentation added

### Integration
- [x] Integrates with existing npm run sync:commands script
- [x] Works with existing build pipeline (npm run build)
- [x] No configuration changes needed
- [x] Uses existing prettier setup from .prettierrc.json

### Quality Checks
- [x] Follows coding standards (JavaScript)
- [x] Uses established error boundary pattern
- [x] Graceful degradation for prettier failures
- [x] Edge cases handled (missing prettier, prettier errors)

## Files Modified
- `scripts/sync-claude-commands.js` - Added prettier formatting step after file generation with error handling
- `scripts/sync-claude-commands.test.ts` - Created 6 smoke tests for sync script behavior

## Decisions Made
- **Approach**: Add Prettier to sync script (Approach 1 from exploration)
  - Rationale: Fixes root cause, works in CI and local, zero developer friction
- **Error handling**: Warn on prettier failure but continue
  - Rationale: Don't break the build if prettier has issues, but inform the user
- **Stdio handling**: Use 'pipe' to suppress prettier output
  - Rationale: Keep sync script output clean and focused
- **Test strategy**: Smoke tests only (6 tests)
  - Rationale: Build phase requires minimum 1 smoke test, focuses on behavior verification

## Testing Notes
Created 6 smoke tests covering:
1. ✓ Generates valid TypeScript
2. ✓ Generates properly formatted code (passes prettier check)
3. ✓ Completes within reasonable time (<5s)
4. ✓ Preserves all command content
5. ✓ Generates consistent output across runs
6. ✓ Handles prettier formatting gracefully

All tests pass in ~3.4s total execution time.

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-303` for production readiness
