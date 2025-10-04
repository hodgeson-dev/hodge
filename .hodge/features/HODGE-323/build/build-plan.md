# Build Plan: HODGE-323

## Feature Overview
**PM Issue**: HODGE-323 (linear)
**Status**: Complete
**Title**: Display Decision Questions in Exploration Preview

## Implementation Checklist

### Core Implementation
- [x] Update Phase 3 preview format in `.claude/commands/explore.md`
- [x] Show numbered list of decision questions
- [x] Show bold "No Decisions Needed" when no decisions exist
- [x] Preserve other preview sections unchanged

### Testing
- [x] Add smoke tests to `claude-commands.smoke.test.ts`
- [x] Test numbered decision list format validation
- [x] Test "No Decisions Needed" format validation
- [x] Test preview structure preservation
- [x] Test approval options presence
- [x] Run smoke tests - all passing

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (claude-commands.smoke.test.ts)
- [x] Template-only change (zero CLI code modifications)

## Files Modified
- `.claude/commands/explore.md` - Updated Phase 3 preview format to show decision questions list
- `src/lib/claude-commands.smoke.test.ts` - Added 4 smoke tests for new preview format

## Decisions Made
- **Update inline format**: Single source of truth where example shows exact expected format including both scenarios (with decisions list and bold 'No Decisions Needed')
- **Template structure only**: Validate template structure only in smoke tests - follows existing pattern, fast execution, tests the controllable template content

## Implementation Details

### Template Changes
Updated the Phase 3 preview example in `.claude/commands/explore.md` (lines 143-150):

**Before**:
```
**Decisions Needed**: [count] decisions for /decide phase
```

**After**:
```
**Decisions Needed**:
1. [Decision question 1]
2. [Decision question 2]
3. [Decision question 3]

OR if no decisions:

**No Decisions Needed**
```

### Test Coverage
Added 4 smoke tests in `claude-commands.smoke.test.ts`:
1. Validates numbered decision list format present in template
2. Validates bold "No Decisions Needed" format present in template
3. Validates other preview sections remain unchanged
4. Validates approval options present after preview

All tests passing - verified with `npm run test:smoke`

## Next Steps
✅ Build phase complete
- Proceed to `/harden HODGE-323` for integration tests
