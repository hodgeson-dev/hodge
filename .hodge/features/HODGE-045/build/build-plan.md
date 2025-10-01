# Build Plan: HODGE-045

## Feature Overview
**PM Issue**: HODGE-045 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Fixed Linear adapter connection in PMHooks
- [x] Implemented GitHub Issues adapter
- [x] Added rich context passing from ship command
- [x] Added configurable verbosity levels for PM comments

### Integration
- [x] Connected Linear adapter in PMHooks.callPMAdapter
- [x] Added GitHub adapter support in PMHooks
- [x] Enhanced onShip to accept ShipContext object

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns
- [x] Add basic validation
- [x] Consider edge cases

## Files Modified
<!-- Track files as you modify them -->
- `src/lib/pm/pm-hooks.ts` - Fixed Linear connection, added GitHub support, rich comments, enabled Linear comments, added 'local' case
- `src/lib/pm/github-adapter.ts` - Created new GitHub Issues adapter with full comment support
- `src/lib/pm/linear-adapter.ts` - Added addComment method for functional parity with GitHub
- `src/lib/pm/local-pm-adapter.ts` - Extended BasePMAdapter, implemented abstract methods for unified interface
- `src/lib/pm/types.ts` - Added ShipContext interface, added 'local' to PMTool type
- `src/lib/pm/pm-hooks.smoke.test.ts` - Created smoke tests for PM hooks
- `src/lib/pm/github-adapter.smoke.test.ts` - Created smoke tests for GitHub adapter
- `src/lib/pm/linear-adapter.smoke.test.ts` - Created smoke tests for Linear adapter with comment validation
- `src/lib/pm/local-pm-adapter-unified.smoke.test.ts` - Created smoke tests for unified LocalPMAdapter
- `.hodge/features/HODGE-045/build/linear-api-recommendation.md` - Documentation of API investigation
- `.hodge/features/HODGE-045/explore/local-adapter-architecture.md` - Architecture analysis and approaches

## Decisions Made
<!-- Document any implementation decisions -->
- Used async IIFE for non-blocking PM updates to prevent blocking ship workflow
- GitHub adapter auto-detects repository from git remote URL
- Smart issue mapping: tries exact ID, then HODGE-xxx format, then title search
- Three verbosity levels: minimal (status only), essential (basic metrics), rich (full details)
- Labels for GitHub workflow states (hodge:exploring, hodge:building, etc.)
- **Linear SDK Decision**: Stayed with Linear SDK instead of switching to GraphQL - SDK provides full comment support via `createComment` method
- Achieved full functional parity between GitHub and Linear adapters
- **LocalPMAdapter Architecture**: Extended BasePMAdapter for unified interface
- **Constructor-based preservation**: Maintained always-on behavior through constructor initialization
- **Core unification scope**: Focused on essential mapping, deferred advanced features

## Testing Notes
<!-- Notes for testing approach -->
- Test scenario 1
- Test scenario 2

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-045` for production readiness
