# Build Plan: HODGE-288

## Feature Overview
**PM Issue**: HODGE-288 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create PMHooksEnhanced class with configuration support
- [x] Implement silent error handling for PM API failures
- [x] Add configuration loading from hodge.json
- [x] Include inline documentation

### Integration
- [x] Remove pm-scripts directory
- [x] Update init.ts to remove script references
- [ ] Update commands to use PMHooksEnhanced
- [ ] Add Linear adapter implementation

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns
- [x] Add basic validation
- [x] Consider edge cases

## Files Modified
<!-- Track files as you modify them -->
- `.hodge/pm-scripts/` - Removed directory (replaced by adapter pattern)
- `src/commands/init.ts` - Removed pm-scripts references, updated PM messaging
- `src/lib/pm/pm-hooks-enhanced.ts` - Created enhanced PM hooks with config support
- `src/test/pm-hooks.smoke.test.ts` - Created smoke tests for PM functionality
- `.hodge/decisions.md` - Recorded 5 architectural decisions

## Decisions Made
<!-- Document any implementation decisions -->
- Use pure adapter approach - Remove scripts for TypeScript adapters
- Hooks for critical workflow commands only (explore, build, harden, ship)
- Silent failure with logging - PM updates never block commands
- Simple status mapping in hodge.json configuration
- GitHub Issues as next PM tool priority after Linear

## Testing Notes
<!-- Notes for testing approach -->
- Test scenario 1
- Test scenario 2

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-288` for production readiness
