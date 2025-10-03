# Build Plan: HODGE-319.3

## Feature Overview
**PM Issue**: cc51a745-825c-4d2f-9ff6-1094cfa4b2bf (linear)
**Status**: In Progress
**Title**: Smart Decision Extraction for /build - Graceful Skip-Decide Workflow

## Implementation Checklist

### Core Implementation
- [x] Update .claude/commands/build.md with decision extraction logic
- [x] Add Step 1: Check for decisions.md
- [x] Add Step 2: Check for wrong-location decisions.md
- [x] Add Step 3: Extract from exploration.md
- [x] Add Step 4: Handle extraction results
- [x] Include inline documentation

### Extraction Features
- [x] Extract Recommendation section verbatim
- [x] Extract Decisions Needed section (titles only)
- [x] Handle single recommendation (3 options: use/decide/skip)
- [x] Handle multiple recommendations (pick-one flow)
- [x] Handle missing recommendation (suggest /decide)
- [x] Handle missing exploration.md (fallback to CLI warning)

### Wrong-Location File Handling
- [x] Detect decisions.md in wrong location (explore/)
- [x] Prompt user to move with approval
- [x] Provide manual handling option

### Integration
- [x] Place extraction before PM check (line 3 of build.md)
- [x] Preserve existing PM check functionality
- [x] Preserve existing build command execution
- [x] Maintain backward compatibility

### Quality Checks
- [x] Follow coding standards (template-only, no CLI changes)
- [x] Use established patterns (cascading extraction from /plan)
- [x] Add visual separators for clarity
- [x] Consider all edge cases from exploration

## Files Modified
- `.claude/commands/build.md` - Added decision extraction logic (139 lines added at top)
- `src/lib/hodge-319.3.smoke.test.ts` - Created 14 smoke tests for template validation

## Decisions Made
1. **Verbatim extraction display** - Show exact Recommendation text for complete context
2. **Prompt to pick one** - For multiple recommendations, let user select from list
3. **Auto-move with approval** - Detect wrong-location files and offer to move them
4. **Skip uncovered decisions detection** - Keep it simple, defer to /decide for verification
5. **Before PM check integration** - Place extraction logic at line 3 of build.md

## Testing Notes
- **Smoke tests**: 14 tests validating template structure and content
- **Test coverage**: Decision extraction, wrong-location handling, multiple recommendations, missing files
- **All tests passing**: ✓ 14/14 passed in 7ms
- **No CLI code changes**: Pure template enhancement, zero risk

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-319.3` for production readiness
