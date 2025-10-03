# Build Plan: HODGE-319.2 - Invisible Temp File Creation

## Feature Overview
**PM Issue**: e74e33f5-6fbd-414b-9283-492d41e20839 (linear)
**Status**: Complete
**Scope**: Replace bash heredoc with Write tool in /plan and /ship slash commands

## Implementation Checklist

### Core Implementation
- [x] Update .claude/commands/plan.md to use Write tool
- [x] Update .claude/commands/ship.md to use Write tool
- [x] Remove all mkdir -p commands (Write tool auto-creates directories)
- [x] Maintain exact same file paths and behavior

### Integration
- [x] No CLI code changes required (template-only refactoring)
- [x] Verified no breaking changes to file creation logic

### Quality Checks
- [x] All 10 smoke tests passing
- [x] No bash heredoc patterns remaining
- [x] No mkdir commands remaining
- [x] Documentation updated with Write tool instructions

## Files Modified

### Template Updates
- `.claude/commands/plan.md` - Replaced bash heredoc with Write tool for plan.json creation
  - Removed `cat > plan.json << 'EOF'` pattern
  - Added Write tool instructions with clear placeholders
  - Removed `mkdir -p` command (Write tool handles directory creation)

- `.claude/commands/ship.md` - Replaced bash heredoc with Write tool for 3 file types:
  - Interaction state files (ui.md, state.json) - 2 locations
  - Lessons documentation (lessons/*.md) - 1 location
  - Removed all `mkdir -p` commands
  - Added Write tool instructions with clear placeholder replacement guidance

### Test Coverage
- `src/commands/hodge-319.2.smoke.test.ts` - 10 comprehensive smoke tests
  - 3 tests for plan.md (no heredoc, uses Write tool, no mkdir)
  - 4 tests for ship.md (no heredoc, uses Write tool for all files, no mkdir)
  - 3 tests for documentation and file path consistency

## Decisions Made

1. **Write tool over bash heredoc** - Eliminates visible bash commands in AI workflow, creates cleaner UX
2. **Remove mkdir commands** - Write tool automatically creates parent directories, no manual setup needed
3. **Template-only changes** - Zero CLI code modifications, maintains backward compatibility
4. **Same file locations** - Only changed HOW files are created, not WHAT or WHERE

## Testing Results
✅ All 10 smoke tests passing
- Verified no bash heredoc patterns
- Verified Write tool usage for all temp files
- Verified no mkdir commands
- Verified file paths unchanged

## Impact
- **UX Improvement**: Temp file creation now invisible to users (no bash commands shown)
- **Zero Breaking Changes**: File creation behavior identical, just cleaner implementation
- **Better Maintainability**: Write tool pattern easier to understand than bash heredoc

## Next Steps
1. ✅ Run smoke tests - PASSED (10/10)
2. Manual smoke test: Run /plan and /ship to verify temp files created correctly
3. Proceed to `/harden HODGE-319.2` for integration testing
4. Ship when ready
