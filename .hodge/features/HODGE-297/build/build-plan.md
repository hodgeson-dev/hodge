# Build Plan: HODGE-297

## Feature Overview
**PM Issue**: HODGE-297 (linear)
**Status**: Build Complete
**Description**: Enhanced Context Loading for /hodge and /load commands

## Implementation Checklist

### Core Implementation
- [x] Modify HodgeMDGenerator to load recent 20 decisions (not full 1100+ lines)
- [x] Add basePath constructor parameter to ContextCommand for testability
- [x] Implement loadRecentDecisions() method with limit support
- [x] Implement hasLinkedPMIssue() for conditional PM tracking
- [x] Implement detectPhase() for phase-aware loading
- [x] Implement loadPhaseFiles() to load all .md and .json files from current phase

### Integration
- [x] Connect enhanced loading to existing ContextCommand
- [x] Ensure backward compatibility (basePath defaults to process.cwd())
- [x] Update all new methods to use this.basePath

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (matches DecideCommand, PlanCommand)
- [x] Add inline documentation with HODGE-297 decision references
- [x] Consider edge cases (missing directories, empty files)

## Files Modified
- `src/lib/hodge-md-generator.ts` - Changed decisions limit from 5 to 20 in getRecentDecisions()
- `src/commands/context.ts` - Added basePath support and 4 new methods for enhanced context loading
- `src/commands/context.smoke.test.ts` - Added 5 smoke tests for new functionality

## Decisions Implemented
1. ✅ Load recent 20 decisions (not full 1100+ line history) - Implemented in loadRecentDecisions()
2. ✅ Load id-mappings.json only when feature has PM issue - Implemented in hasLinkedPMIssue()
3. ✅ Keep pattern loading on-demand - No changes needed (already works this way)
4. ✅ Load all .md and .json files in current phase directory - Implemented in loadPhaseFiles()
5. ⏳ Update both /hodge and /load commands - Backend ready, template updates pending

## Testing Notes
All 5 smoke tests passing:
- ✅ loadRecentDecisions() without crashing
- ✅ detectPhase() without crashing
- ✅ hasLinkedPMIssue() without crashing
- ✅ loadPhaseFiles() without crashing
- ✅ execute() without crashing

Tests use isolated temporary directories and do not modify project .hodge structure.

## Next Steps
1. ✅ Run smoke tests - `npm run test:smoke` (PASSING)
2. Update /hodge and /load command templates to use new context loading methods
3. Run full test suite with `npm test`
4. Check linting with `npm run lint`
5. Proceed to `/harden HODGE-297` for integration tests
