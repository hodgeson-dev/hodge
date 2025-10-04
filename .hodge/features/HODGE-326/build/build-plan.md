# Build Plan: HODGE-326

## Feature Overview
**PM Issue**: HODGE-326 (linear)
**Status**: In Progress
**Title**: Conditional decision approval in /build command

## Problem Statement
The `/build` command currently prompts users to approve recommendations even when there are no decisions to make, creating unnecessary friction. This fix adds conditional logic to only show prompts when there are actual unresolved decisions.

## Implementation Checklist

### Core Implementation
- [x] Update build.md template with conditional logic
- [x] Add empty check for "Decisions Needed" section
- [x] Define whitespace-only as empty (Decision 1)
- [x] Add Case A: Empty decisions → proceed silently
- [x] Add Case B: Non-empty decisions → show prompt
- [x] Add Case E: Malformed exploration → warning + proceed (Decision 2)

### Integration
- [x] Maintain backward compatibility with existing cases (C, D)
- [x] Preserve PM issue check workflow
- [x] Keep Step 1-3 decision extraction logic intact

### Quality Checks
- [x] Follow coding standards
- [x] Document regex pattern for empty check
- [x] Add clear case descriptions for AI guidance
- [x] Consider edge cases (whitespace, malformed files)

## Files Modified
- `.claude/commands/build.md` - Added conditional logic for decision approval
  - Lines 60-103: Updated Step 4 with empty check logic
  - Lines 62-67: Added empty check logic documentation
  - Lines 69-75: Added Case A (empty decisions, silent proceed)
  - Lines 77-103: Updated Case B (non-empty decisions, show prompt)
  - Lines 156-173: Added Case E (malformed exploration handling)

- `src/commands/hodge-326.smoke.test.ts` - Created 10 smoke tests validating:
  - Conditional logic presence
  - Whitespace-only handling
  - Silent proceed case (Case A)
  - Prompt case (Case B)
  - Malformed exploration warning (Case E)
  - Backward compatibility
  - PM check preservation

## Decisions Made
- **Decision 1**: Treat whitespace-only as empty - when checking if "Decisions Needed" section is empty, whitespace-only content (spaces, newlines) should count as empty to match user intent and prevent false positives from formatting quirks

- **Decision 2**: Show warning but proceed anyway for malformed exploration - balance transparency with workflow continuity by informing the user of parsing issues without blocking progress

## Testing Notes
- 10 smoke tests created and passing ✓
- Tests validate template structure, not runtime behavior (template-based slash command)
- Tests check for:
  - Conditional logic keywords
  - Case A/B/E presence
  - Decision documentation
  - Backward compatibility

## Implementation Summary
Successfully implemented conditional decision approval logic using inline template approach (Approach 1 from exploration). The logic leverages HODGE-325's work which filters "Decisions Needed" to only contain unresolved items, allowing us to trust that section as the source of truth.

**Key changes:**
1. Added empty check logic with whitespace handling
2. Split Case A into two sub-cases (empty vs. non-empty decisions)
3. Added Case E for malformed exploration with warning
4. Maintained all existing cases and workflows

## Next Steps
After implementation:
1. ✓ Run smoke tests with `npm run test:smoke` - PASSED (10/10)
2. Run full test suite with `npm test`
3. Check linting with `npm run lint`
4. Review changes
5. Proceed to `/harden HODGE-326` for integration tests
