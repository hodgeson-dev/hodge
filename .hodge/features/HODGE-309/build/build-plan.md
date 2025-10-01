# Build Plan: HODGE-309

## Feature Overview
**PM Issue**: HODGE-309 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Fix build.md template to check for externalID
- [x] Add enhanced grep pattern (grep -A 2 + grep externalID)
- [x] Update comment to explain the check
- [x] Include inline documentation in pattern file

### Integration
- [x] No integration changes needed (template-only fix)
- [x] Pattern documented for other slash commands to use
- [x] Backwards compatible (existing behavior for entries with externalID unchanged)

### Quality Checks
- [x] Follow coding standards
- [x] Use established pattern (enhanced grep)
- [x] Add validation via smoke tests
- [x] Consider edge cases (dotted IDs, missing fields)

## Files Modified
- `.claude/commands/build.md` - Updated PM check grep pattern (line 10)
- `src/lib/claude-commands.smoke.test.ts` - Added 3 new smoke tests for grep pattern behavior
- `.hodge/patterns/pm-mapping-check.md` - Created new pattern documentation

## Decisions Made
- Enhanced grep pattern approach: Maintains template-only fix consistent with HODGE-306
- Smoke test strategy: Test bash command in isolation, not full Claude Code workflow
- Pattern documentation: Created reusable pattern for other slash commands
- No backward compatibility audit: Confirmed only build.md uses this pattern

## Testing Notes
- ✅ Test WITH externalID: Should detect as mapped (exit 0)
- ✅ Test WITHOUT externalID: Should detect as unmapped (exit 1)
- ✅ Test dotted IDs (HODGE-XXX.Y): Should work correctly
- All 8 smoke tests passing in claude-commands.smoke.test.ts

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-309` for production readiness
