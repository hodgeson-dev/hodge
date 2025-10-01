# Build Plan: HODGE-296

## Feature Overview
**PM Issue**: HODGE-296 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Fixed TypeScript issues in IDManager
- [x] Created PM issue creation in decide command
- [x] Added queue mechanism for failed operations
- [x] Included comprehensive error handling

### Integration
- [x] Connected PMHooks with DecideCommand
- [x] Enhanced epic/story breakdown communication
- [x] Added processAIProposedStructure method
- [x] Integrated with Linear and GitHub adapters

### Quality Checks
- [x] TypeScript strict mode passing
- [x] Build completes successfully
- [x] 13/13 smoke tests passing
- [x] Epic breakdown workflow documented

## Files Modified
- `src/lib/id-manager.ts` - Fixed TypeScript issues, added parent/child support
- `src/lib/pm/pm-hooks.ts` - Added createPMIssue, processQueue methods
- `src/commands/decide.ts` - Added processAIProposedStructure for epic breakdown
- `test/pm-integration.smoke.test.ts` - Created comprehensive smoke tests
- `test/pm-integration.integration.test.ts` - Added integration tests
- `.hodge/features/HODGE-296/explore/exploration.md` - Updated with embedded documentation decision
- `.claude/commands/decide.md` - Embedded epic/story breakdown instructions directly

## Decisions Made
- Simplified IDMappings to only store FeatureID objects
- Added QueuedOperation interface for type safety
- Created processAIProposedStructure for AI communication
- PM issues created AFTER decide phase completes
- Epic breakdown proposed by AI, approved by user, created by decide
- Epic/story breakdown instructions embedded directly in `.claude/commands/decide.md` for consistent availability

## Testing Notes
- All 13 smoke tests passing
- Integration tests verify epic/story breakdown
- Tests use temp directories for isolation
- No real PM API calls in tests

## Documentation Solution
- Epic/story breakdown instructions embedded directly in `.claude/commands/decide.md`
- Always available when `/decide` is called
- No need for separate `/load` command
- Ships automatically with NPM package
- Ensures consistent epic/story breakdown behavior

## Architectural Insight
After deep analysis, the Epic/Story Breakdown and Feature Extraction sections in `/decide`
reveal a fundamental design issue: `/decide` is overloaded with responsibilities.

**Proposed Solution**: Create a new `/plan` command that handles:
- Epic/story breakdown
- Dependency analysis between stories
- Parallel development lane allocation
- PM tool integration
- Feature extraction from decisions

This would provide clean separation:
- `/explore` → investigate and understand
- `/decide` → make and record technical decisions
- `/plan` → organize work and create PM structure
- `/build` → implement

See: `.hodge/features/HODGE-296/explore/plan-command-proposal.md` for details

## Next Steps
After implementation:
1. ✅ Tests passing - 585/587 tests pass (2 unrelated failures)
2. ✅ TypeScript compilation successful
3. ✅ PM integration tests all passing
4. Ready to proceed to `/harden HODGE-296` for production readiness
