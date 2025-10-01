# Build Plan: HODGE-307

## Feature Overview
**PM Issue**: HODGE-307 (linear)
**Status**: Completed
**Description**: Move build.smoke.test.ts from `.claude/commands/` to `src/lib/` for consistency with existing test organization patterns.

## Implementation Checklist

### Core Implementation
- [x] Move test file from `.claude/commands/build.smoke.test.ts` to `src/lib/claude-commands.smoke.test.ts`
- [x] Update all import paths to reference correct template location
- [x] Verify test passes after migration

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (colocated with other smoke tests)
- [x] All tests passing

## Files Modified
- `.claude/commands/build.smoke.test.ts` - Removed (moved to src/lib/)
- `src/lib/claude-commands.smoke.test.ts` - Created via move, updated import paths from `join(__dirname, 'build.md')` to `join(__dirname, '../../.claude/commands/build.md')`

## Decisions Made
1. Move to `src/lib/claude-commands.smoke.test.ts` - Consistent with all 23 existing smoke tests
2. Name it `claude-commands.smoke.test.ts` - Matches existing `claude-commands.ts` sync script
3. Defer testing other templates to future work - Focused scope for this feature
4. Move now during build phase - Establishes correct pattern immediately

## Testing Notes
- All 5 smoke tests passing (3ms runtime)
- Tests validate build.md template contains:
  - PM issue check section
  - User prompt for unmapped features
  - /plan command reference
  - Non-blocking behavior documentation
  - Skip logic for mapped features

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-307` for production readiness
