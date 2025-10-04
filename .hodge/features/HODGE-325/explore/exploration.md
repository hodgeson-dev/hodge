# Exploration: HODGE-325

## Title
Filter resolved decisions from Decisions Needed section after exploration conversation

## Feature Overview
**PM Issue**: HODGE-325
**Type**: general
**Created**: 2025-10-04T01:56:55.046Z

## Problem Statement
During conversational exploration, users provide feedback and make decisions in response to AI questions. However, these already-resolved decisions still appear in the "Decisions Needed" section, creating redundant work and confusion during the `/decide` phase.

## Conversation Summary

The exploration revealed that the current `/explore` workflow creates friction by listing decisions that were already made during the conversational exploration phase. When the AI asks questions like "Should we use approach A or B?" and the user provides a clear answer, that decision should be considered resolved rather than appearing again in the "Decisions Needed" section.

Key insights from the discussion:
- Decisions can be made in multiple ways: explicit choices between presented options, clear directional guidance on approach, or definitive answers to specific questions
- Not all user input during exploration represents a firm decision - tentative answers ("probably X"), contradictory feedback, and partial decisions on complex questions should still be flagged as needing formal decision
- The output should transparently show what was decided during exploration versus what still needs attention
- When all decisions are resolved during exploration, the section should boldly state **"No Decisions Needed"** rather than leaving an empty or confusing section

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 11
- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Implementation Approaches

### Approach 1: Conversation Tracking with Smart Filtering
**Description**: Track the exploration conversation in memory to identify firm decisions made by the user. During synthesis (Phase 3), filter out any decision questions that were definitively answered during the conversation. Display a summary section showing what was decided versus what remains.

**Pros**:
- Eliminates redundant decision tracking
- Provides clear transparency about what was resolved
- Respects the conversational nature of exploration
- Simple to implement - just track decisions during conversation flow

**Cons**:
- Requires careful parsing to distinguish firm decisions from tentative feedback
- AI must maintain conversation state throughout exploration
- Edge case handling (contradictions, partial answers) requires judgment calls

**When to use**: This is ideal for the current conversational exploration workflow where the AI and user engage in natural dialogue.

### Approach 2: Explicit Decision Marking During Conversation
**Description**: When the AI asks a decision question, explicitly mark the user's response as either "decided" or "needs formal decision" based on confidence signals (definitive language vs tentative language). Use this markup during synthesis.

**Pros**:
- Very explicit and traceable
- Reduces ambiguity in what counts as "decided"
- Could even ask user "Should I mark this as decided?" for clarity

**Cons**:
- More mechanical, less conversational feel
- Adds extra interaction steps
- May feel bureaucratic for simple explorations

**When to use**: Better for complex features with many interdependent decisions where precision matters more than conversation flow.

### Approach 3: Post-Conversation Review and Filtering
**Description**: Generate the full "Decisions Needed" list as currently done, then show it to the user with checkboxes asking "Were any of these already decided during our conversation?" Let the user filter the list before finalizing.

**Pros**:
- User has final say on what's decided
- No AI judgment calls required
- Simple fallback if conversation tracking fails

**Cons**:
- Adds an extra review step
- Doesn't truly eliminate redundancy, just moves it
- User still has to read through and filter the list manually

**When to use**: As a safety mechanism or for users who prefer explicit control over implicit filtering.

## Recommendation

**Use Approach 1: Conversation Tracking with Smart Filtering**

This approach best aligns with the conversational exploration philosophy already established in the `/explore` workflow. It respects the natural dialogue between AI and user while eliminating redundant work.

The implementation should:
1. Track decision-related questions and user responses during Phase 2 (Conversational Discovery)
2. Identify firm decisions using language cues: explicit choices, definitive statements, clear directional guidance
3. Flag edge cases (tentative language like "probably/maybe", contradictions, partial answers) to remain in Decisions Needed
4. During Phase 3 synthesis, generate two lists:
   - "Decided during exploration: X, Y, Z" (summary of resolved items)
   - "Still needs decision: A, B" (unresolved items only)
5. If all decisions resolved, display **"No Decisions Needed"** in bold

This preserves transparency (user sees what was decided) while eliminating redundancy (no duplicate decision tracking in `/decide`).

## Test Intentions

Behavioral expectations for this feature:

- [ ] Should track explicit user choices during exploration conversation (e.g., "use approach A")
- [ ] Should track clear directional guidance as decisions (e.g., "we should definitely prioritize performance")
- [ ] Should track definitive answers to specific questions as decisions (e.g., "yes, include that feature")
- [ ] Should preserve tentative answers in Decisions Needed (e.g., "probably approach B, but not sure")
- [ ] Should preserve contradictory feedback in Decisions Needed (e.g., says A early, implies B later)
- [ ] Should preserve partial decisions on complex questions in Decisions Needed
- [ ] Should display "Decided during exploration:" summary section when items were resolved
- [ ] Should display **"No Decisions Needed"** in bold when all decisions resolved during exploration
- [ ] Should list only unresolved items under "Still needs decision:" section

## Decisions Decided During Exploration

1. ✓ **Scope of detection**: Track both explicit decision questions and user-volunteered choices/direction
2. ✓ **What counts as decided**: Explicit choices between options, clear directional guidance, or definitive answers to specific questions
3. ✓ **Edge case handling**: Tentative answers ("probably/not sure"), contradictory feedback, and partial decisions on complex questions should remain in Decisions Needed
4. ✓ **Display format**: Show summary of decided items followed by remaining items, or **"No Decisions Needed"** if everything resolved

**No Decisions Needed**

## Next Steps
- [ ] Review exploration findings
- [ ] Proceed to `/build HODGE-325` (no decisions needed)

---
*Exploration completed: 2025-10-04T01:56:55.046Z*
