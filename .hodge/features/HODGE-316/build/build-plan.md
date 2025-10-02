# Build Plan: HODGE-316

## Feature Overview
**PM Issue**: HODGE-316 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Add blank line between Topic and Context in decide.md template
- [x] Update build.md with explicit PM check interpretation guidance
- [x] Write smoke test to verify formatting fix

### Integration
- N/A (template-only changes)

### Quality Checks
- [x] Follow coding standards (markdown formatting)
- [x] Use established patterns (blank line separation)
- N/A - No validation needed (template fix)
- [x] Consider edge cases (verified only in decide.md, not other templates)

## Files Modified
- `.claude/commands/decide.md` - Added blank line between Topic and Context fields (line 58)
- `.claude/commands/build.md` - Added explicit PM check interpretation guidance (lines 13-15, 44)

## Decisions Made
- Use blank line approach (simplest, follows markdown conventions)
- Add explicit PM check guidance in build.md to prevent grep result misinterpretation

## Testing Notes
- Verify decision prompts now display Topic and Context on separate lines
- Verify no changes to how decisions are saved to decisions.md
- Test PM check interpretation in build command

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-316` for production readiness
