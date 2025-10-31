# Build Plan: HODGE-371

## Feature Overview
**Title**: CLI options cleanup - remove unused commands and options
**Status**: Complete

## Implementation Checklist

### Core Implementation
- [x] Remove `todos` and `link` commands from src/bin/hodge.ts
- [x] Delete src/commands/todos.ts and src/commands/link.ts files
- [x] Remove unused options from explore, harden, and context commands
- [x] Update command implementations to remove option handling
- [x] Add comprehensive smoke tests

### Integration
- [x] Remove orphaned code (todo-checker.ts, FeaturePopulator methods)
- [x] Update ExploreService to remove fromSpec and prePopulate methods
- [x] Clean up imports in affected files
- [x] Verify no references remain via grep

### Quality Checks
- [x] All code follows coding standards
- [x] Comprehensive smoke tests added
- [x] Full test suite passing (1355/1357 tests - 2 pre-existing failures)
- [x] Zero regressions from changes

## Files Modified
- `src/bin/hodge.ts` - Removed todos/link command definitions and unused options
- `src/commands/todos.ts` - DELETED (entire command)
- `src/commands/link.ts` - DELETED (entire command)
- `src/commands/explore.ts` - Removed force, fromSpec, prePopulate, decisions option handling
- `src/commands/harden.ts` - Removed autoFix option
- `src/commands/context.ts` - Removed list, recent, todos option handling
- `src/lib/explore-service.ts` - Removed handleFromSpec() and handlePrePopulate() methods
- `src/lib/todo-checker.ts` - DELETED (orphaned code)
- `src/bin/hodge-371-cleanup.smoke.test.ts` - NEW (comprehensive smoke tests)

## Decisions Made
- **Pattern**: Follow HODGE-369 precedent - complete cleanup in single feature
- **Scope**: Remove entire commands (todos, link) and unused options comprehensively
- **Testing**: Add smoke tests to verify commands and options are properly removed
- **Orphaned Code**: Remove todo-checker.ts and ExploreService methods that are no longer called

## Testing Notes
- Created comprehensive smoke tests verifying:
  - Command files are deleted
  - Options are removed from interfaces
  - No references remain in code
- All 7 HODGE-371 smoke tests passing
- 1355/1357 total tests passing (2 pre-existing failures in hodge-319.1.smoke.test.ts)

## Code Reduction
- **Commands removed**: 2 (todos, link)
- **Files deleted**: 3 (todos.ts, link.ts, todo-checker.ts)
- **Options removed**: 9 total
  - explore: --force, --from-spec, --pre-populate, --decisions
  - harden: --auto-fix
  - context: --list, --recent, --todos
- **Methods removed**: handleFromSpec(), handlePrePopulate(), listSaves(), loadRecentSave(), countTodos()

## Next Steps
Ready for `/harden HODGE-371`:
1. All implementation complete
2. Smoke tests passing
3. No regressions detected
4. Code properly cleaned up
