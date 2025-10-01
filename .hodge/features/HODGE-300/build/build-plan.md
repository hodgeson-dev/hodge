# Build Plan: HODGE-300

## Feature Overview
**PM Issue**: HODGE-300 (linear)
**Status**: Complete
**Implementation Approach**: Approach 2 - Remove `--local-only`, Keep Only `--create-pm`

## Implementation Checklist

### Core Implementation
- [x] Add `--create-pm` flag to CLI parser
- [x] Remove `--local-only` flag from CLI parser
- [x] Remove `localOnly` from PlanOptions interface
- [x] Update type signatures in action handler

### Integration
- [x] Updated `src/bin/hodge.ts` CLI parser (line 156)
- [x] Updated `src/commands/plan.ts` interface (line 10)
- [x] Verified compatibility with existing code (line 83-89)

### Quality Checks
- [x] Added smoke test for `--create-pm` flag
- [x] Updated existing test that used old flag
- [x] All 6 smoke tests passing
- [x] Build passes successfully

## Files Modified
- `src/bin/hodge.ts` - Added `--create-pm` option, removed `--local-only`, updated action handler type signature
- `src/commands/plan.ts` - Removed `localOnly` from PlanOptions interface, cleaned up comment
- `src/commands/plan.test.ts` - Updated test on line 49 to not use `localOnly`, added new smoke test for `--create-pm` flag (lines 199-229)

## Decisions Made
- **Chose Approach 2**: Removed `--local-only` entirely rather than keeping both flags. This provides the cleanest interface and follows "safe by default" principle.
- **Default Behavior**: When no flag is provided, plan is saved locally only. This prevents accidental PM issue creation.
- **Explicit Intent**: Using `--create-pm` makes it crystal clear that PM issues will be created, matching the documentation requirement.

## Testing Notes
- 6 smoke tests all passing (1.15s execution time)
- New test verifies `--create-pm` flag is accepted and PM creation is attempted
- Test output confirms proper behavior:
  - Without flag: "💾 Plan saved locally. Use --create-pm to create PM issues in Linear."
  - With flag: "✓ Created PM issue: [uuid]"
- Build completes successfully with no TypeScript errors in modified files

## Next Steps
After implementation:
1. ✅ Run tests with `npm test` - All smoke tests passing
2. ✅ Build project - Successful
3. Ready to proceed to `/harden HODGE-300` for integration testing
