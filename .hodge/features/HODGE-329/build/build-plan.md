# Build Plan: HODGE-329

## Feature Overview
**PM Issue**: HODGE-329 (linear)
**Status**: ✅ Complete
**Title**: Fix TruffleHog CI security scan failure on direct main branch pushes

## Implementation Checklist

### Core Implementation
- [x] Remove hardcoded BASE/HEAD parameters from TruffleHog action
- [x] Allow TruffleHog's built-in event detection to work
- [x] Ensure configuration works for both push and PR events

### Integration
- [x] Update .github/workflows/quality.yml
- [x] Remove base and head parameters from TruffleHog step
- [x] Preserve path parameter and action version

### Quality Checks
- [x] Follow minimal change principle (Approach 1 from exploration)
- [x] Future-proof for PR workflow
- [x] Create smoke test for workflow validation

## Files Modified

- `.github/workflows/quality.yml` - Removed BASE/HEAD parameters from TruffleHog action (lines 73-74)
  - Before: `base: ${{ github.event.repository.default_branch }}` and `head: HEAD`
  - After: Only `path: ./` parameter remains
  - This allows TruffleHog to use GitHub event context automatically

## Decisions Made

- **Use Approach 1**: Remove BASE/HEAD parameters - Simplest solution with minimal risk
- **Preserve --fail flag**: Keep security gate enforcement (implicitly kept by action defaults)
- **No version pinning**: Continue using `@main` for latest security updates
- **No separate jobs**: Single security job works for both push and PR events

## Testing Notes

**Smoke Test Coverage**:
- Validate workflow YAML syntax is correct
- Verify TruffleHog step has no BASE/HEAD parameters
- Confirm path parameter is present
- Check action version is specified

**Manual Verification** (after push):
- First push will trigger full repository scan
- Subsequent pushes will scan only new commits
- No "BASE and HEAD are the same" error should occur

## Next Steps
After implementation:
1. ✅ Create smoke test for workflow validation
2. Push changes to trigger CI
3. Verify TruffleHog runs successfully
4. Proceed to `/harden HODGE-329` for production readiness
