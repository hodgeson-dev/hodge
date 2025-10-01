# Build Plan: HODGE-280 - Always Load Core Context in /hodge Command

## Feature Overview
**PM Issue**: HODGE-280 (linear)
**Status**: In Progress
**Description**: Ensure /hodge command always loads core context files (HODGE.md, standards.md, decisions.md, patterns) regardless of parameters

## Implementation Checklist

### Core Implementation
- [x] Move core context loading to top of command execution
- [x] Ensure core loading happens before any conditional branches
- [x] Update section numbering for consistency
- [x] Clean up duplicate loading logic

### Integration
- [x] Maintain backward compatibility with all modes
- [x] Preserve existing feature-specific loading
- [x] Keep all conditional branches working
- [x] Update documentation structure

### Quality Checks
- [x] Follow existing command template patterns
- [x] Use consistent section numbering
- [x] Maintain readability and clarity
- [x] Test all command variations

## Files Modified
- `.claude/commands/hodge.md` - Restructured to always load core context first
- `test/commands/hodge-context-loading.test.ts` - Added smoke tests for verification

## Decisions Made
- **Approach 1 chosen**: Always Load Core First - Simplest and most reliable solution
- Core loading moved to section 1, all modes become section 2
- No state management needed - just reorder the template
- Minimal performance impact (just cat'ing 4 files)

## Testing Notes
- Verified core loading happens before conditionals
- Tested all 4 modes have core context available
- Section numbering is consistent
- All smoke tests pass (69 passed)

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-280` for production readiness
