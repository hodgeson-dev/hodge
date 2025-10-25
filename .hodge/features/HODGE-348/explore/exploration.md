# Exploration: HODGE-348

## Feature Overview
**PM Issue**: HODGE-348
**Title**: Refine `/explore` workflow to focus on "what" rather than "how"
**Type**: Enhancement
**Created**: 2025-10-25T07:06:30.053Z

## Problem Statement

The current `/explore` command tries to answer every question and resolve all decisions before proceeding, leading to marathon conversations that risk context limit compaction. For larger features, this creates friction and doesn't support role separation between Product Owners (who define "what") and Developers (who decide "how").

The `/explore` command should focus on high-level requirements and enough technical exploration to set direction, while deferring implementation details to `/decide`.

## Conversation Summary

We discussed the need for a clearer separation of concerns in the Hodge workflow:

**Current State**: `/explore` attempts to be comprehensive, asking detailed questions until all decisions are resolved. This works for small features but creates problems for larger ones:
- Conversations become very long and risk context compaction
- Doesn't support role separation (PO vs Dev)
- Mixes "what" (requirements) with "how" (implementation)

**Desired Multi-Stage Workflow**:
1. **`/explore`** - Sketch high-level requirements, set technical direction, identify key approaches (focus on "what")
2. **`/plan`** - Break into smaller deliverables with context carried forward (when complexity warrants)
3. **`/explore` (sub-issue)** - Ensure requirements understood, touch on key implementation details
4. **`/decide` (sub-issue)** - Fill in implementation details before building (focus on "how")

**Key Insights**:
- `/explore` should focus on the **"what"** with just enough technical detail to understand constraints and opportunities
- Technical exploration is warranted when it affects what's possible (e.g., REST vs GraphQL affects API capabilities)
- Implementation details like library choices, validation structure, auth mechanisms belong in `/decide`
- AI should recommend `/plan` explicitly when complexity signals warrant it (multiple components, long conversations, user cues)
- Test intentions should be high-level for parent features, more specific for sub-issues after `/plan`
- Sub-issue exploration must reference parent/sibling context to avoid re-discussing decisions

## Implementation Approaches

### Approach 1: Template-Driven Scoping with AI Intelligence (Recommended)

**Description**: Update the `/explore` template to explicitly guide AI on when to stop asking questions and what level of detail is appropriate. The template provides clear boundaries between "what" exploration and "how" decision-making.

**Pros**:
- Clear guidance prevents AI from over-exploring
- Built-in heuristics help AI recognize when to recommend `/plan`
- Template changes are easy to iterate on based on feedback
- Maintains conversational flexibility while providing guardrails
- Supports both small features (quick exploration) and large features (recommend `/plan`)

**Cons**:
- Requires careful template design to avoid being too rigid
- AI must interpret guidelines correctly (not always guaranteed)
- May need examples to clarify "what" vs "how" boundary

**When to use**: This is the primary approach - it's template-based so it's maintainable and can evolve.

### Approach 2: Conversation Turn Limits

**Description**: Implement explicit turn count limits in the `/explore` template (e.g., "aim for 5-7 exchanges"). AI tracks conversation length and wraps up exploration before hitting limits.

**Pros**:
- Simple, measurable constraint
- Prevents runaway conversations
- Forces focus on essentials

**Cons**:
- Artificial constraint may feel rushed for complex features
- Doesn't account for varying feature complexity
- May cut off important exploration prematurely

**When to use**: As a secondary guideline within Approach 1, not as a hard constraint.

### Approach 3: Structured Exploration Phases

**Description**: Break `/explore` into explicit phases with checkpoints: 1) Problem Understanding, 2) Scope Definition, 3) Technical Constraints, 4) Approach Options. AI must complete each phase before moving to next.

**Pros**:
- Very structured and predictable
- Easy to track progress
- Clear separation of concerns

**Cons**:
- Feels rigid and less conversational
- Doesn't adapt well to feature complexity
- May create more overhead than value

**When to use**: Consider for future enhancement if Approach 1 proves insufficient.

## Recommendation

**Use Approach 1: Template-Driven Scoping with AI Intelligence**

This approach provides the right balance of structure and flexibility. By updating the `/explore` template with:
- Clear "what" vs "how" guidelines with examples
- Explicit cues for when to recommend `/plan`
- High-level test intention guidance
- Context reference requirements for sub-issues

We can guide AI behavior without rigid constraints. The template is easy to iterate on, and we can add elements from Approach 2 (turn count hints) if needed.

**Implementation Focus**:
1. Update `.claude/commands/explore.md` template with clearer scoping guidance
2. Add examples of "what" vs "how" decisions
3. Include AI prompts for recognizing complexity signals
4. Add sub-issue context loading requirements
5. Update test intention guidance (high-level vs specific)

## Test Intentions

1. ✅ `/explore` conversation concludes within reasonable context limits for typical features
2. ✅ `/explore` captures "what" decisions while deferring "how" to `/decide`
3. ✅ AI recommends `/plan` when feature complexity warrants breakdown
4. ✅ Sub-issue exploration references parent context appropriately
5. ✅ Exploration template guides AI to focus on requirements over implementation
6. ✅ Role separation works: PO can explore, Dev can decide/build

## Decisions Decided During Exploration

1. ✓ **`/explore` scope**: Focus on "what" (requirements, behavior, scope) with minimal technical detail - only enough to validate feasibility and understand constraints/opportunities
2. ✓ **`/decide` scope**: Owns the "how" (implementation details, library choices, design patterns, validation structure)
3. ✓ **`/plan` recommendation**: AI should explicitly recommend `/plan` when appropriate, based on complexity signals (multiple components, lengthy conversation, user cues)
4. ✓ **Test intention depth**: High-level behavioral expectations for parent features, more specific edge cases for sub-issues after `/plan`
5. ✓ **`/plan` responsibility**: The `/plan` command handles breakdown generation - don't attempt it in `/explore`

## Decisions Needed

1. Should the exploration template include explicit prompts to help AI recognize when to stop asking questions? (e.g., "After 5-7 exchanges, synthesize and present preview")
2. How should the AI distinguish between "technical details that affect the what" vs "implementation details for /decide"? (Needs clearer guidelines and examples in template)
3. Should there be a token budget or conversation turn limit hint for `/explore` phase to guide AI pacing?

## Next Steps
- Use `/decide` to resolve remaining questions about template structure
- Proceed to `/build HODGE-348` to implement template changes

---
*Exploration completed: 2025-10-25T07:15:00.000Z*
