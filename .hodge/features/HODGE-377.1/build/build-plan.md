# Build Plan: HODGE-377.1 - Team Mode Detection & Configuration

## Feature Overview
**Feature**: HODGE-377.1 - Team Mode Detection & Configuration - Dynamic PM Integration
**Status**: Implementation Complete
**No PM issue linked** (user chose to build without PM tracking)

## Implementation Checklist

### Core Implementation
- [x] Create TeamModeService for mode detection logic
- [x] Implement detectTeamMode() with full detection logic
- [x] Add checkCredentials() for Linear and GitHub
- [x] Implement validateProviderConfig() for provider-specific validation
- [x] Add graceful degradation (queue mode) for missing credentials

### Integration
- [x] Add PMConfiguration interface to PM types
- [x] Update PM config types with enabled, queueOfflineRequests, etc.
- [x] Update hodge.json with new PM configuration fields
- [x] Update StructureGenerator to create .hodge/.gitignore

### Quality Checks
- [x] Follow coding standards (TypeScript strict mode)
- [x] Use established patterns (logger, error handling)
- [x] Add comprehensive inline documentation
- [x] Handle edge cases (malformed config, missing credentials)

### Testing
- [x] Write 15 comprehensive smoke tests
- [x] All smoke tests passing (15/15)
- [x] Test coverage includes all core behaviors and edge cases

## Files Modified

### New Files
- `src/lib/team-mode-service.ts` - Core team mode detection service with full logic
- `src/lib/team-mode-service.smoke.test.ts` - Comprehensive smoke test suite (15 tests)

### Modified Files
- `src/lib/pm/types.ts` - Added enabled, queueOfflineRequests, statusMap, verbosity to PMConfig
- `src/lib/structure-generator.ts` - Added createHodgeGitignore() method to create .hodge/.gitignore
- `hodge.json` - Updated PM configuration with new fields

## Decisions Made

1. **pm.enabled defaults to undefined = solo mode**: When `pm.enabled` is not set, we default to solo mode for safety. Users must explicitly opt-in to team mode.

2. **Unified config structure**: Used single `pm` section in hodge.json rather than provider-namespaced sections, as provider differences are minimal (only Linear needs `teamId`).

3. **Environment cleanup in tests**: Clear PM environment variables in `beforeEach` (not just `afterEach`) to prevent test pollution from persisting credentials.

4. **Graceful degradation**: When `pm.enabled: true` but credentials missing, we enable queue mode (if configured) rather than hard failing.

5. **Gitignore location**: Created `.hodge/.gitignore` (not modifying project root `.gitignore`) to keep our changes scoped to our directory.

## Testing Notes

### Test Coverage
- ✅ Solo mode detection (no config, pm.enabled: false, pm.enabled undefined)
- ✅ Team mode detection (Linear and GitHub with valid credentials)
- ✅ Queue mode (missing credentials with queueOfflineRequests)
- ✅ Provider selection (pm.tool disambiguates multiple credentials)
- ✅ Credential checking (Linear, GitHub, Local)
- ✅ Provider config validation (Linear requires teamId, GitHub doesn't)
- ✅ Error handling (malformed hodge.json, missing pm section)

### Test Results
```
Test Files  1 passed (1)
Tests  15 passed (15)
Duration  346ms
```

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-377.1` for production readiness
