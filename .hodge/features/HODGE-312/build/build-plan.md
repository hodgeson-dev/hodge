# Build Plan: HODGE-312

## Feature Overview
**PM Issue**: HODGE-312 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Fix Bug 1: Decision detection path
- [x] Fix Bug 2: Shipped status detection
- [x] Add "Shipped" to progress display
- [x] Update next steps logic for shipped features

### Integration
- [x] Applied HODGE-311 logic to status command
- [x] Maintained consistency with hodge-md-generator.ts
- [x] No breaking changes to existing behavior

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (copied from HODGE-311)
- [x] Add inline documentation (comments explaining fixes)
- [x] Consider edge cases (shipped vs ready to ship)

## Files Modified
- `src/commands/status.ts` - Fixed two bugs in status detection
  - Line 39: Fixed decision.md path (check feature root, not explore/)
  - Lines 65-67: Added shipped detection using ship-record.json
  - Line 85: Added "Shipped" to progress display
  - Lines 110-115: Updated next steps for shipped features

- `src/commands/status.smoke.test.ts` - Added 2 smoke tests
  - Lines 61-72: Test decision.md detection at feature root
  - Lines 74-91: Test shipped status detection

## Decisions Made
All 6 decisions documented in exploration:
1. Apply HODGE-311 logic to status command
2. Use "shipped" as mode name
3. Check feature root for decision.md
4. Use ship-record.json as completion marker
5. Add "Shipped" as 6th checkbox (separate line)
6. Write feature decisions to feature-specific decision.md only

## Testing Notes
- Manual test: `hodge status HODGE-311` shows correct shipped status
- Smoke tests: 6/6 passing
- Verified Bug 1 fixed: Decision shows ✓ for HODGE-311
- Verified Bug 2 fixed: Shipped shows ✓ for HODGE-311

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-312` for production readiness
