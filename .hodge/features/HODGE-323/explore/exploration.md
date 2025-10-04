# Exploration: HODGE-323

## Title
Display Decision Questions in Exploration Preview

## Feature Overview
**PM Issue**: HODGE-323
**Type**: general
**Created**: 2025-10-04T00:47:45.322Z

## Problem Statement
The `/explore` command's Phase 3 approval preview currently shows only a count of decisions needed (e.g., "3 decisions for /decide phase"), which doesn't give users visibility into what those decisions actually are before approving the exploration. Users need to see the actual decision questions to make informed decisions about whether to approve, revise, or request changes to the exploration.

## Conversation Summary
This feature emerged from a need to improve transparency in the exploration approval workflow. Currently, when the AI presents the exploration summary for user approval in Phase 3, it shows counts for various sections (test intentions, decisions needed) but doesn't reveal the actual content of the decisions.

The discussion clarified several key points:
- The change applies specifically to the Phase 3 preview shown before writing to exploration.md
- Decision questions should be displayed in a numbered list format for clarity
- When no decisions exist, a bold "**No Decisions Needed**" should be displayed
- Other preview fields (like Test Intentions count) should remain unchanged
- Edge cases where decisions are undetermined should be treated as "No Decisions Needed"
- This is a template-only enhancement to `.claude/commands/explore.md`
- Testing should follow the existing `claude-commands.smoke.test.ts` pattern

## Implementation Approaches

### Approach 1: Template Enhancement with Structured Format
**Description**: Update the Phase 3 preview format in `.claude/commands/explore.md` to replace the decisions count with either a numbered list of decision questions or bold "No Decisions Needed" text.

**Pros**:
- Zero CLI code changes - pure template modification
- Consistent with existing template-based enhancements (similar to HODGE-306, HODGE-319.3)
- AI automatically adapts to new format during exploration
- Easy to test via smoke tests validating template structure
- No backward compatibility concerns

**Cons**:
- Long decision lists could make preview verbose
- Relies on AI following template format correctly
- No programmatic validation of format compliance

**When to use**: Ideal for improving user visibility and informed decision-making without touching core CLI logic.

### Approach 2: Hybrid Template + CLI Validation
**Description**: Enhance the template as in Approach 1, but add CLI-side validation to ensure the exploration.md file contains properly formatted decisions before showing preview.

**Pros**:
- Guarantees format compliance through programmatic checks
- Could provide better error messages if decisions malformed
- Enables future enhancements like decision categorization

**Cons**:
- Requires CLI code changes (violates simplicity principle)
- Adds complexity for minimal benefit
- Testing becomes more complex (need integration tests)
- Slower to implement and ship

**When to use**: Only if template-only approach proves unreliable in practice.

### Approach 3: Smart Preview Truncation
**Description**: Like Approach 1, but with logic to truncate decision lists beyond a threshold (e.g., show first 5, then "... and 3 more").

**Pros**:
- Prevents extremely long previews
- Maintains readability for features with many decisions
- Still provides visibility into most important decisions

**Cons**:
- User requested "show all decisions" - truncation contradicts this
- Adds complexity without clear user need
- Requires decision on what threshold to use

**When to use**: Not recommended based on user preference to show all decisions.

## Recommendation
**Approach 1: Template Enhancement with Structured Format**

This approach aligns perfectly with the Hodge philosophy of template-based AI orchestration and has proven successful in similar enhancements (HODGE-306, HODGE-319.3). The benefits are:

1. **Simplicity**: Single file change, no CLI code modifications
2. **Speed**: Can be implemented and tested quickly
3. **User Request**: Directly addresses the stated need to "show all decisions"
4. **Proven Pattern**: Follows established template-enhancement pattern
5. **Low Risk**: Template changes are easy to verify and revert if needed

The user explicitly requested showing all decisions (not truncated), and this approach delivers exactly that. If preview length becomes an issue in practice, we can revisit with Approach 3, but there's no evidence this is needed yet.

## Test Intentions

### Behavioral Expectations:
1. ✅ **Decision list display**: When exploration has decisions, preview shows numbered list of all decision questions under "Decisions Needed:"
2. ✅ **No decisions display**: When exploration has no decisions, preview shows "**No Decisions Needed**" in bold
3. ✅ **Preview structure preservation**: All other preview elements (Title, Problem Statement, Key Discussion Points, Recommended Approach, Test Intentions count) remain unchanged
4. ✅ **Template compliance**: The updated preview format is documented in the Phase 3 section of `.claude/commands/explore.md`
5. ✅ **Smoke test coverage**: Test validates the new preview format structure in `claude-commands.smoke.test.ts` following existing patterns

## Decisions Needed
1. Should we update the example preview format in the template immediately (inline) or add a separate note about the new format in a different section?
2. Should the smoke test verify both "with decisions" and "no decisions" scenarios, or just validate the template structure?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-323`

---
*Exploration completed: 2025-10-04T00:50:00.000Z*
