# Build Plan: HODGE-377.3

## Feature Overview
Auto-Generated File Management and Regeneration for Team Workflows
**Status**: Implementation Complete

## Implementation Checklist

### Core Implementation
- [x] Create RegenCommand class for regenerating architecture graph
- [x] Implement graph regeneration using ArchitectureGraphService
- [x] Add error handling for missing toolchain config
- [x] Include helpful error messages and logging

### Integration
- [x] Register `hodge regen` as public user-facing command in CLI
- [x] Update StructureGenerator to create .hodge/.gitignore with all patterns
- [x] Add initial graph generation to InitCommand
- [x] Reuse existing ArchitectureGraphService for consistency

### Quality Checks
- [x] Follow coding standards (logging, error handling)
- [x] Use established patterns (command pattern, TempDirectoryFixture in tests)
- [x] Add comprehensive smoke tests (11 tests total)
- [x] Handle edge cases (missing config, existing gitignore, duplicate patterns)

## Files Modified
- `src/commands/regen.ts` - New command for regenerating architecture graph
- `src/commands/regen.smoke.test.ts` - Smoke tests for regen command (5 tests)
- `src/bin/hodge.ts` - Register `hodge regen` as public command
- `src/lib/structure-generator.ts` - Updated createHodgeGitignore() to include all three patterns
- `src/lib/gitignore-patterns.smoke.test.ts` - Smoke tests for gitignore patterns (6 tests)
- `src/commands/init.ts` - Added generateInitialArchitectureGraph() method

## Decisions Made
- **RegenCommand as user-facing command**: Developers run this manually after git pull/merge/rebase
- **Non-blocking failures**: Graph generation failures don't block init or regen (graceful degradation)
- **Reuse existing services**: Use ArchitectureGraphService instead of duplicating logic
- **Append mode for gitignore**: Preserve existing .hodge/.gitignore content when upgrading
- **No duplicate patterns**: Check for existing patterns before appending

## Testing Notes
- All 946 smoke tests pass, including 11 new tests for this feature
- Tests verify:
  - RegenCommand instance creation and execution
  - Graceful failure when toolchain config missing
  - Gitignore creation with all three patterns
  - Pattern deduplication on re-run
  - Preservation of existing gitignore content
  - Helpful comments in gitignore file

## Bug Fixes
- **Fixed pipe validation regex** (src/lib/architecture-graph-service.ts:227): The security validation was incorrectly rejecting `||` (boolean OR) as a single pipe. Changed pattern from `/\|(?!\|)/` to `/(?<!\|)\|(?!\|)/` to properly detect single pipes while allowing `||` and `&&`.
  - **Root cause**: The original negative lookahead `/\|(?!\|)/` matched the second pipe in `||` because it wasn't followed by another pipe. The fix adds negative lookbehind to ensure we're not in the middle of `||`.
  - **Impact**: Architecture graph was not being regenerated during ship commands since Oct 28. Now working correctly.
  - **Verified**: `hodge regen` successfully regenerates graph file (updated from Oct 28 to Nov 2)

## Next Steps
After implementation:
1. ✅ Run tests with `npm test` - All passing
2. ✅ Run linting with `npm run lint` - 0 new errors
3. ✅ Run typecheck with `npm run typecheck` - 0 errors
4. ✅ Bug fix: Architecture graph regeneration working
5. Proceed to `/harden HODGE-377.3` for production readiness
