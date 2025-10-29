# Build Plan: HODGE-361

## Feature Overview
**Title**: Add --skip-tests parameter support to /ship AI slash command
**Status**: Complete
No PM issue linked (user chose to proceed without PM tracking)

## Implementation Checklist

### Core Implementation
- [x] Update /ship command frontmatter to document --skip-tests parameter
- [x] Add bash parsing logic to detect and extract --skip-tests flag
- [x] Pass flag variable to both hodge ship command invocations
- [x] Enhance troubleshooting section with usage guidance

### Integration
- [x] Maintain backward compatibility (default behavior unchanged)
- [x] Leverage existing CLI --skip-tests implementation
- [x] No changes needed to CLI code (pure template update)

### Quality Checks
- [x] Follow coding standards (template syntax)
- [x] Use established patterns (parameter pass-through)
- [x] Add comprehensive smoke tests (5 test cases)
- [x] All 22 smoke tests passing

## Files Modified
- `.claude/commands/ship.md` - Added --skip-tests parameter support
  - Updated frontmatter argument-hint: `<feature-id> [--skip-tests]`
  - Added bash parsing logic in Step 1 to detect and extract flag
  - Updated two hodge ship command calls to pass $skip_tests_flag variable
  - Enhanced troubleshooting section with clear usage guidance
- `src/lib/claude-commands.smoke.test.ts` - Added 5 smoke tests for HODGE-361
  - Test frontmatter documentation
  - Test bash parsing logic presence
  - Test flag pass-through to CLI commands
  - Test troubleshooting documentation
  - Test "fix first" recommendation

## Decisions Made
- **Approach 1 (Minimal Template Update)**: Chosen as recommended by exploration
  - Simple parameter pass-through with no additional validation or prompts
  - Trusts developers to use responsibly without friction
  - Leverages existing CLI implementation (no CLI changes needed)
  - Quick escape hatch philosophy: explicit opt-in via syntax
- **Testing Strategy**: Comprehensive smoke tests verify template content
  - Tests check for presence of expected content (documentation, logic, variables)
  - No subprocess spawning (follows HODGE-319.1 standard)
  - Pattern matches existing claude-commands.smoke.test.ts structure

## Testing Notes
- Added 5 new smoke tests to existing test suite
- All tests verify template content (string matching)
- Test locations: lines 264-305 in claude-commands.smoke.test.ts
- All 22 smoke tests passing (including 5 new ones)
- No integration tests needed (template-only changes)

## Behavioral Expectations (from exploration)
✅ Default behavior preserved: `/ship {{feature}}` works exactly as before
✅ Skip-tests parameter works: `/ship {{feature}} --skip-tests` passes flag through
✅ Discoverability: Frontmatter and troubleshooting document --skip-tests usage

## Next Steps
After implementation:
1. ✅ Run smoke tests with `npm run test:smoke` - PASSING (22/22)
2. Stage all changes with `git add .` - COMPLETE
3. Proceed to `/harden HODGE-361` for production readiness

## Implementation Notes
- Implementation completed following exploration recommendation (Approach 1)
- No CLI code changes required (pure AI template update)
- Backward compatible: existing `/ship {{feature}}` calls unchanged
- Flag detection uses bash string matching (simple and reliable)
- Variable substitution prevents quoting issues in command execution
