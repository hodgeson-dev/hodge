# Exploration: HODGE-373

**Title**: Enforce AI Template Compliance with Strategic Emphasis Markers

**Created**: 2025-10-31
**Status**: Exploring

## Problem Statement

AI frequently skips UX formatting elements in slash command templates (formatted boxes, exact wording, menu structures), resulting in inconsistent user experience and lost context awareness. While MUST/MANDATORY markers work in some contexts, visual formatting elements like Unicode boxes consistently get substituted with markdown headers, losing the "Command:" prefix and professional polish.

## Context

**Project Type**: Framework Enhancement

This issue was discovered during a live `/explore` session where the AI:
- Replaced Unicode box formatting with markdown headers
- Dropped the "Explore:" command prefix from section headers
- Changed section names ("Feature Discovery" → "Conversational Discovery")

The pattern appears consistent across all slash commands, affecting:
- Formatted box headers
- User input prompts and menu structures
- Emoji-enhanced callouts and tips

## Related Features

- HODGE-001
- HODGE-002
- HODGE-004

## Related Patterns

- `.hodge/patterns/slash-command-verification-pattern.md` - Layered verification strategy for AI template changes
- Existing MUST/MANDATORY usage in templates has proven effective for functional requirements

## Conversation Summary

Through conversational discovery, we identified:

1. **The Problem is Real and Consistent**: Concrete evidence from the current session shows boxes being replaced with markdown headers, command prefixes dropped, and section names changed. This pattern occurs across all slash commands, not just `/explore`.

2. **Existing Emphasis Works for Some Things**: MUST/MANDATORY/IMPORTANT keywords have proven effective in other contexts (like requiring file reads or following workflow steps). The problem appears specific to visual/formatting elements.

3. **Multiple UX Elements Affected**: Beyond boxes, user input prompts also deviate from specifications (menu formatting, emoji usage, exact wording).

4. **Need Explicit, Specific Instructions**: The issue isn't that AI ignores all instructions - it's that visual formatting elements are treated as "decorative" rather than "required." We need to make it unmistakably clear that these are functional requirements.

## Implementation Approaches

### Approach 1: Combined Visual + Textual Emphasis Pattern (Recommended)

**Description**: Create a highly visible, explicit compliance pattern that combines multiple reinforcement techniques to ensure AI treats visual formatting as mandatory requirements.

**Pattern Structure**:
```markdown
⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Feature Discovery                          │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Explore:" prefix for context awareness
- ✅ Section name matches exactly as shown
```

**Pros**:
- Combines multiple proven emphasis techniques (visual warnings, strong keywords, explicit prohibitions)
- Addresses the specific failure mode (markdown substitution)
- Provides self-check verification mechanism
- Builds on existing MUST/MANDATORY patterns that already work
- Actionable and specific ("CHARACTER-FOR-CHARACTER")

**Cons**:
- Increases template verbosity
- May need to be applied in multiple places within each template
- Requires updates across all slash command templates

**When to use**: When visual formatting, exact wording, or specific output structure is functionally required (not just decorative).

### Approach 2: Simple Explicit MUST Statements

**Description**: Add straightforward MUST statements before each formatting requirement without additional visual emphasis.

**Example**:
```markdown
**MUST output the following box exactly as shown, character-for-character:**

┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Feature Discovery                          │
└─────────────────────────────────────────────────────────┘
```

**Pros**:
- Minimal template changes
- Less verbose than Approach 1
- Consistent with existing MUST patterns

**Cons**:
- May not be strong enough to override AI's tendency to optimize formatting
- Doesn't explicitly prohibit the specific failure mode (markdown substitution)
- No verification mechanism

**When to use**: For simpler formatting requirements where strong emphasis might be overkill.

### Approach 3: Executable Code Block Treatment

**Description**: Treat formatting requirements as executable code that must be reproduced exactly, similar to code examples.

**Example**:
```markdown
**MANDATORY: Begin your response by executing this template (copy exactly):**

```output
┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Feature Discovery                          │
└─────────────────────────────────────────────────────────┘
```
```

**Pros**:
- Leverages AI's existing behavior of copying code blocks accurately
- Clear distinction from explanatory text
- Familiar pattern from coding contexts

**Cons**:
- Semantically incorrect (this isn't code)
- May confuse future template authors
- Doesn't explain why exact reproduction matters

**When to use**: When formatting is absolutely critical and must be reproduced byte-for-byte.

## Recommendation

**Approach 1: Combined Visual + Textual Emphasis Pattern**

This approach is recommended because:

1. **Builds on Proven Success**: The user confirmed that MUST/MANDATORY markers work well in other contexts. This approach amplifies that pattern with additional reinforcement.

2. **Addresses Root Cause**: By explicitly prohibiting the specific failure mode ("Do NOT use markdown headers"), we address the exact substitution that's happening.

3. **Multiple Reinforcement Layers**:
   - Visual warning (⚠️) catches attention
   - "CRITICAL" + "EXACT OUTPUT REQUIRED" establishes priority
   - "CHARACTER-FOR-CHARACTER" makes it actionable
   - Explicit prohibition addresses common failure
   - Checklist enables self-verification

4. **Testable**: We can immediately validate whether the pattern works by applying it to `/explore` and running a test exploration.

5. **Scalable**: Once proven, the pattern can be applied consistently across all slash commands.

**Implementation Plan**:
1. Add the pattern to `/explore` command before the first box
2. Run `/explore` on a test feature to verify box appears correctly
3. If successful, apply to all other slash commands
4. Document the pattern in `.hodge/patterns/` for future command authoring

## Test Intentions

### Behavioral Expectations

1. **Box Formatting Preserved**
   - AI outputs Unicode box-drawing characters (┌─┐ │ └─┘)
   - AI does NOT substitute with markdown headers (#, ##)
   - Box formatting appears in actual output, not just acknowledged

2. **Command Prefix Included**
   - Box headers include command context ("Explore:", "Build:", "Harden:", etc.)
   - Prefix is not dropped or modified
   - Maintains user awareness of current workflow phase

3. **Exact Section Names**
   - Section names match template specification exactly
   - AI does not editorialize or paraphrase
   - "Feature Discovery" remains "Feature Discovery", not changed to "Conversational Discovery"

4. **Menu Format Compliance**
   - Lettered options (a, b, c, d) preserved
   - Emojis included (✅, 🔄, ➕, ➖)
   - Exact wording from template maintained

5. **Pattern Consistency**
   - Compliance pattern works across all slash commands
   - Not just `/explore` - also `/build`, `/harden`, `/ship`, `/decide`, etc.
   - Consistent application produces consistent results

## Decisions Decided During Exploration

1. ✓ **Use Combined Visual + Textual Emphasis (Approach 1)** - Most comprehensive solution that builds on proven MUST/MANDATORY success while addressing specific failure modes

2. ✓ **Apply Pattern Before First Box** - Place the compliance pattern immediately before each formatting requirement to maximize visibility and association

3. ✓ **Include Explicit Prohibition** - "Do NOT use markdown headers as substitutes" addresses the specific observed failure mode

4. ✓ **Add Verification Checklist** - Self-check mechanism helps AI validate compliance before responding

5. ✓ **Test-First Rollout** - Validate in `/explore` first, then apply to all commands if successful

## Decisions Needed

**No Decisions Needed** - All decisions were resolved during exploration. Ready to build and test the pattern.

## Next Steps

1. Apply the compliance pattern to `.claude/commands/explore.md`
2. Test with a new exploration session (user will clear context and try a fresh feature)
3. Capture the output to verify box formatting compliance
4. If successful, roll out to all slash commands
5. Document the pattern for future command authoring
