# Build Plan: HODGE-318

## Feature Overview
**PM Issue**: HODGE-318 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create main component/module - N/A (config changes only)
- [x] Implement core logic - All ESM configuration already in place
- [x] Add error handling - Node version enforced via package.json engines
- [x] Include inline documentation - README updated with requirements

### Integration
- [x] Connect with existing modules - ESM working with all imports
- [x] Update CLI/API endpoints - No changes needed
- [x] Configure dependencies - package.json, tsconfig.json already configured

### Quality Checks
- [x] Follow coding standards - No code changes required
- [x] Use established patterns - ESM is the established pattern
- [x] Add basic validation - npm enforces Node version requirement
- [x] Consider edge cases - All tests passing, CI validates on 20.x and 22.x

## Files Modified
- `src/lib/esm-config.smoke.test.ts` - Created smoke tests (5 tests, all passing)
- `src/lib/esm-config.integration.test.ts` - Created integration tests (6 tests, all passing)
- `src/bin/hodge.ts` - Fixed __dirname usage for ESM compatibility
- `src/lib/install-hodge-way.ts` - Fixed __dirname usage for ESM compatibility
- `.hodge/features/HODGE-318/build/build-plan.md` - Updated with findings

## Decisions Made
<!-- Document any implementation decisions -->
- **Found actual ESM bug**: Configuration was set for ESM, but code still used CommonJS `__dirname` pattern
- **Fixed __dirname in 2 files**: src/bin/hodge.ts and src/lib/install-hodge-way.ts now use ESM pattern with fileURLToPath
- **Template scripts remain CommonJS**: pm-scripts-templates.ts generates CommonJS scripts intentionally - no changes needed
- **Integration tests required**: Build phase had smoke tests, but harden phase needs integration tests
- **Created comprehensive integration tests**: 6 tests verifying ESM module loading, CLI execution, and compilation

## Testing Notes
<!-- Notes for testing approach -->
- **Smoke tests** (5 tests): Verify configuration files (package.json, tsconfig.json, CI workflow, README)
- **Integration tests** (6 tests): Verify actual ESM functionality (imports, CLI execution, compilation)
- All 667 tests pass on Node 20.x
- CI workflow configured to test on Node 20.x and 22.x
- ESM module resolution working correctly with vitest/vite
- No ERR_REQUIRE_ESM errors after __dirname fixes

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-318` for production readiness
