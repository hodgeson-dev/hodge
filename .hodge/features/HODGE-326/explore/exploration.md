# Exploration: HODGE-326

## Title
Conditional decision approval in /build command

## Feature Overview
**PM Issue**: HODGE-326
**Type**: general
**Created**: 2025-10-04T02:22:04.394Z

## Problem Statement
The `/build` command currently prompts users to approve recommendations even when there are no decisions to make, creating unnecessary friction. Users running `/build` without `/decide` are implicitly accepting the recommendation and shouldn't be interrupted unless there are actual unresolved decisions requiring attention.

## Conversation Summary
The current behavior shows an approval prompt whenever no `decisions.md` file exists, regardless of whether there are actual decisions to resolve. This is annoying because users who run `/build` without first running `/decide` are implicitly accepting the recommendation - they don't need to be asked again.

The desired behavior leverages HODGE-325's work, which already filters "Decisions Needed" to contain only items not resolved during exploration. This means we can trust the "Decisions Needed" section as the source of truth: if it's empty, there's nothing to decide; if it has items, those genuinely need user input.

The fix is simple conditional logic: only show the interactive prompt when both (a) no `decisions.md` exists AND (b) "Decisions Needed" section has items.

## Implementation Approaches

### Approach 1: Inline Conditional Check
**Description**: Add a simple conditional check in the build.md template that inspects the "Decisions Needed" section before showing the prompt.

**Pros**:
- Minimal code changes (just add one conditional)
- Easy to understand and maintain
- No new functions or abstractions needed
- Keeps logic close to where it's used

**Cons**:
- Logic is embedded in template markdown
- Harder to test the decision logic in isolation
- Could get complex if we add more conditions later

**When to use**: When the logic remains simple and unlikely to be reused elsewhere.

### Approach 2: Extract Decision Analysis to Service Function
**Description**: Create a reusable function (e.g., `analyzeDecisionStatus()`) that parses exploration.md and returns whether decisions need user input.

**Pros**:
- Testable business logic separated from template
- Can be reused if other commands need similar logic
- Easier to add complexity later (e.g., checking decision quality)
- Follows the Service class extraction pattern from HODGE-321

**Cons**:
- More upfront work (create function, write tests)
- Overkill if logic stays simple
- Adds another abstraction to maintain

**When to use**: If we anticipate this logic becoming more complex or being reused in other commands.

### Approach 3: Template-Only Solution with Smart Parsing
**Description**: Enhance the template to parse both the Recommendation and Decisions Needed sections, using markdown regex patterns to determine if intervention is needed.

**Pros**:
- No backend code changes needed
- AI handles all the logic during template execution
- Flexible and can adapt to different exploration formats

**Cons**:
- Relies on AI correctly parsing markdown each time
- Harder to guarantee consistent behavior
- No automated tests for the parsing logic
- Could fail silently if exploration format changes

**When to use**: For quick prototypes or when backend changes are costly.

## Recommendation
**Use Approach 1: Inline Conditional Check**

This is the right level of abstraction for now. The logic is simple (check if "Decisions Needed" section is empty), and HODGE-325 has already done the hard work of filtering resolved decisions. We don't need the overhead of a Service class (Approach 2) for a single conditional, and we want more reliability than template-only parsing (Approach 3).

If the logic grows more complex later (e.g., checking decision quality, validating against PM issues), we can refactor to Approach 2. For now, keep it simple.

## Test Intentions
Behavioral expectations for this feature:

1. **No decisions.md + Empty "Decisions Needed"** → Build proceeds silently without prompt
2. **No decisions.md + "Decisions Needed" has items** → Show interactive prompt with options (approve/decide/skip)
3. **decisions.md exists (any state)** → Skip all prompts and proceed with build
4. **No decisions.md + No exploration.md** → Fall back to current behavior (CLI shows warning)
5. **No decisions.md + exploration.md exists but malformed** → Graceful fallback (treat as no decisions)
6. **Interactive prompt selection** → Options (a/b/c) correctly route to build/decide/skip

## Decisions Needed

### Decision 1: Whitespace handling in empty check
Should the empty check for "Decisions Needed" be strict (no section or empty array) or also handle whitespace-only sections (e.g., section exists but contains only spaces/newlines)?

### Decision 2: Error messaging for malformed exploration
If exploration.md exists but can't be parsed correctly, should we show an error message to the user or silently fall back to proceeding without decisions?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-326`

---
*Exploration completed: 2025-10-04T02:22:04.394Z*
