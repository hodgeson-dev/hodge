# Feature Exploration: HODGE-316

**Title**: Fix missing newline in /decide command decision prompt formatting

## Problem Statement

The `/decide` command's interactive decision prompt runs `**Topic**:` and `**Context**:` fields together without a newline, displaying as `PromptContext:` instead of separate lines. This makes the decision prompts harder to read during the interactive decision-making process.

## Conversation Summary

The investigation identified that the formatting issue occurs in `.claude/commands/decide.md` at line 58. The template currently has:

```markdown
**Topic**: {{decision_topic}}
**Context**: {{brief_context}}
```

When rendered, the lack of a newline between these two bold markdown fields causes them to concatenate, displaying as `PromptContext:` instead of appearing on separate lines.

Key findings from the discussion:
- This is purely a cosmetic/display issue affecting only the interactive prompt
- Saved decisions in `decisions.md` are not affected by this formatting bug
- The pattern only exists in `decide.md`, not in other command templates
- No code changes are needed - this is a pure template fix
- Zero risk to existing functionality since it's template-only

## Implementation Approaches

### Approach 1: Add Blank Line Between Fields (Recommended)

**Description**: Insert a blank line between line 57 (`**Topic**: {{decision_topic}}`) and line 58 (`**Context**: {{brief_context}}`) in `.claude/commands/decide.md`.

**Pros**:
- Simple one-line fix
- Zero risk to existing functionality
- Follows standard markdown formatting conventions
- Improves readability immediately
- No code changes needed

**Cons**:
- Adds vertical whitespace (minor aesthetic consideration)

**When to use**: This is the recommended approach for immediate fix with minimal change.

---

### Approach 2: Use HTML Line Break

**Description**: Add an HTML `<br>` tag or double-space line break between the fields to force separation while keeping lines adjacent.

**Pros**:
- More compact vertical spacing
- Ensures separation without blank line
- Works in all markdown renderers

**Cons**:
- Less conventional than blank line approach
- HTML in markdown is less readable in source
- Overkill for this simple formatting need

**When to use**: If vertical space is at a premium and you need tighter formatting.

---

### Approach 3: Restructure Decision Prompt Format

**Description**: Redesign the entire decision prompt format to use a different layout (e.g., Topic and Context on same line with separator, or use definition list format).

**Pros**:
- Opportunity to improve overall prompt UX
- Could make prompts more scannable
- Might discover other formatting improvements

**Cons**:
- Scope creep for a simple fix
- Requires more testing and validation
- May affect muscle memory of existing users
- Not necessary to solve the immediate issue

**When to use**: Only if you're doing a broader UX review of decision prompts.

## Recommendation

**Approach 1: Add Blank Line Between Fields** is recommended.

**Rationale**:
- Simplest fix that directly addresses the issue
- Follows standard markdown formatting conventions
- Zero risk of introducing new bugs
- No learning curve or adjustment needed
- Can be implemented and verified in under 5 minutes
- Maintains consistency with how other fields are formatted in the template

Approach 2 is unnecessary complexity for this issue. Approach 3 is out of scope for a simple formatting fix.

## Test Intentions

### Behavioral Expectations

1. **Should display Topic and Context on separate lines**
   - Given: User invokes `/decide` and AI presents decision options
   - When: Decision prompt is displayed
   - Then: `**Topic**:` and `**Context**:` appear on separate lines with proper spacing

2. **Should maintain backward compatibility with decision recording**
   - Given: Decision prompt is rendered with new formatting
   - When: User selects an option and decision is recorded
   - Then: Decision is saved to `decisions.md` exactly as before (no format changes)

## Decisions Needed

No decisions needed - this is a straightforward formatting fix with clear implementation path.

---

**Exploration completed**: 2025-10-02
