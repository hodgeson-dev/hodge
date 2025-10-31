# Build Plan: HODGE-372

## Feature Overview
Audit and simplify .hodge root directory file redundancy
No PM issue linked
**Status**: Complete

## Implementation Checklist

### Core Implementation
- [x] Remove HODGE.md generation from ContextCommand
- [x] Delete HodgeMDGenerator infrastructure (~500 lines)
- [x] Update ContextCommand constructor (remove hodgeMDGenerator property)
- [x] Remove HODGE.md from global_files manifest
- [x] Add HODGE-372 comments explaining removal

### Integration
- [x] Update /checkpoint command to read from context.json
- [x] Changed grep patterns from HODGE.md to context.json
- [x] Update .gitignore to ignore HODGE.md files
- [x] All commands continue to work without HODGE.md

### Quality Checks
- [x] Follow coding standards (added HODGE-372 comments)
- [x] Use established patterns (passive cleanup approach)
- [x] All smoke tests passing (931 tests)
- [x] No breaking changes to slash commands

## Files Modified

### Removed Files (~500 lines deleted)
- `src/lib/hodge-md-generator.ts` - Main generator class (deleted)
- `src/lib/hodge-md-generator.test.ts` - Generator tests (deleted)
- `src/lib/hodge-md/hodge-md-context-gatherer.ts` - Context gathering (deleted)
- `src/lib/hodge-md/hodge-md-file-writer.ts` - File writing (deleted)
- `src/lib/hodge-md/hodge-md-formatter.ts` - Markdown formatting (deleted)
- `src/lib/hodge-md/types.ts` - Type definitions (deleted)

### Modified Files
- `src/commands/context.ts` - Removed HodgeMDGenerator import and usage, removed HODGE.md from global_files
- `.claude/commands/checkpoint.md` - Updated to read from context.json instead of HODGE.md
- `.gitignore` - Added HODGE.md ignore patterns
- `src/commands/context.smoke.test.ts` - Updated tests to remove HODGE.md expectations

### New Files
- `src/commands/hodge-372.smoke.test.ts` - 5 smoke tests verifying HODGE.md removal

## Decisions Made

- **Passive cleanup approach**: Stop generating HODGE.md, add .gitignore, let existing files remain. No active migration needed since there are no external users yet.
- **Complete deletion**: Removed entire HodgeMDGenerator infrastructure (~500 lines) rather than keeping it commented out. Git history preserves it if needed.
- **context.json as source of truth**: Made context.json the single authoritative source for session state (feature, mode, timestamp).
- **HODGE-372 comments**: Added inline comments explaining the removal for future maintainers.

## Testing Notes

- Created 5 new smoke tests in `src/commands/hodge-372.smoke.test.ts`
- All 931 smoke tests passing after changes
- Tests verify:
  - HODGE.md is not generated
  - HODGE.md is not in global_files manifest
  - context.json remains available
  - Commands work without HodgeMDGenerator
  - Feature context loading still works

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-372` for production readiness
