# Build Plan: HODGE-378.1

## Feature Overview
**Title**: Git Hook Enhancement with Full ESLint Validation
**Parent**: HODGE-378 (Fix ESLint errors and prevent future violations)
**Status**: Completed

## Implementation Checklist

### Core Implementation
- [x] Add `run_eslint_check()` function to pre-push hook
- [x] Implement `SKIP_LINT` environment variable escape hatch
- [x] Add ESLint validation to main execution flow
- [x] Include helpful error messages and bypass instructions

### Integration
- [x] Integrate with existing pre-push hook structure
- [x] Position after Prettier check, before npm audit
- [x] Maintain consistency with existing check patterns

### Quality Checks
- [x] Follow coding standards (shell script conventions)
- [x] Use established patterns (consistent with other hooks)
- [x] Add smoke tests (4 new tests)
- [x] Consider edge cases (SKIP_LINT bypass, error messages)

## Files Modified

### Hook Implementation
- `.husky/pre-push` - Added `run_eslint_check()` function and integrated into main execution
  - Lines 128-154: New `run_eslint_check()` function
  - Lines 168-172: Integrated ESLint check into main() execution flow
  - Runs `npm run lint` on entire codebase before push
  - Supports `SKIP_LINT=true` environment variable for emergency bypass
  - Provides helpful error messages with fix instructions

### Tests
- `test/pre-push-hook.test.ts` - Added 4 new smoke tests for ESLint functionality
  - Test for `run_eslint_check` function presence
  - Test for `SKIP_LINT` environment variable support
  - Test for ESLint check execution in main()
  - Test for helpful error messages

## Decisions Made

1. **Always run ESLint check** - No conditional logic based on branch; runs for all pushes
   - Rationale: Prevents errors from slipping through on feature branches
   - Aligns with parent feature goal: "stop the bleeding"

2. **Place ESLint check after Prettier** - Runs in sequence: Prettier → ESLint → npm audit
   - Rationale: Logical flow from formatting to linting to security
   - Prettier is fastest (~1-2s), ESLint is moderate (~10-30s), audit is slowest (or cached)

3. **Use `SKIP_LINT` (not `--no-verify`)** - Separate escape hatch from Git's built-in bypass
   - Rationale: Allows skipping just ESLint while keeping other checks
   - Emergency use: `SKIP_LINT=true git push` (more explicit than `--no-verify`)

4. **Suppress lint output in hook** - Redirect stdout/stderr to /dev/null, show custom message
   - Rationale: Keep hook output clean and actionable
   - Users run `npm run lint` separately to see detailed errors

## Testing Notes

### Smoke Tests (4 new, all passing)
1. ✓ Pre-push hook includes ESLint check function
2. ✓ Pre-push hook supports SKIP_LINT environment variable
3. ✓ Pre-push hook runs ESLint check in main execution
4. ✓ Pre-push hook provides helpful error messages for ESLint failures

### Test Coverage
- Function presence and structure (behavioral contract)
- Environment variable support (SKIP_LINT)
- Integration with main execution flow
- User-facing error messages and instructions

### Manual Testing Needed (in harden phase)
- Verify hook blocks push when ESLint errors exist
- Verify `SKIP_LINT=true` bypass works correctly
- Verify error messages display properly
- Verify performance impact (~10-30s expected)

## Implementation Summary

This sub-feature implements Phase 1 of the HODGE-378 epic: **"Stop the bleeding"**

**What Changed**:
- Pre-push hook now runs full `npm run lint` before every push
- New `run_eslint_check()` function follows existing hook patterns
- `SKIP_LINT=true` environment variable provides emergency bypass
- 4 new smoke tests verify behavioral contracts

**Why This Matters**:
- Prevents ESLint errors from reaching CI (closes the gap)
- Maintains developer experience with helpful error messages
- Provides safety valve for emergencies (`SKIP_LINT=true`)
- Foundation for sub-features 378.2, 378.3, 378.4 (actual error fixing)

**What's Next**:
- HODGE-378.2: Fix auto-fixable ESLint errors (~60 errors)
- HODGE-378.3: Fix moderate ESLint errors (~50 errors)
- HODGE-378.4: Fix security & complexity errors (~38 errors)

## Next Steps
After implementation:
1. ✓ Run smoke tests - All 14 tests passing
2. Run full test suite - `npm test` (verify no regressions)
3. Stage all changes - `git add .`
4. Proceed to `/harden HODGE-378.1` for integration tests and validation
