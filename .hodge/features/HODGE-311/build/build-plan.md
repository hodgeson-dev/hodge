# Build Plan: HODGE-311

## Feature Overview
**PM Issue**: HODGE-311 (linear)
**Status**: ✅ Complete

## Implementation Checklist

### Core Implementation
- [x] Modify `getCurrentMode()` to detect "shipped" status
- [x] Add ship-record.json check before ship directory check
- [x] Update `getNextSteps()` for shipped features
- [x] Add "shipped" case to switch statement

### Integration
- [x] No integration changes needed (single method update)

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns
- [x] Add tests for shipped mode detection
- [x] Verify with real shipped features (HODGE-307, HODGE-308)

## Files Modified
- `src/lib/hodge-md-generator.ts` - Added shipped mode detection to getCurrentMode() and getNextSteps()
- `src/lib/hodge-md-generator.test.ts` - Added 2 smoke tests for shipped mode detection

## Decisions Made
- Use "shipped" as mode name (matches phase terminology)
- Use ship/ship-record.json as completion marker (reliable, no external dependencies)
- Keep shipped features visible in HODGE.md (defer filtering to future issue)
- Next steps message: "Feature completed. Start new work with `hodge explore <feature>`"

## Testing Notes
- Added test: "should return 'shipped' when ship-record.json exists"
- Added test: "should return 'ship' when ship directory exists but no ship-record.json"
- All 625 tests passing
- Verified fix with HODGE-307 and HODGE-308 (both now show "shipped" status)

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-311` for production readiness
