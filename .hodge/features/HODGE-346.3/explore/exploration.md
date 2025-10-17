# Exploration: Choice Formatting and Recommendations

**Title**: Choice formatting and recommendations with multi-select support

**Feature**: HODGE-346.3
**Date**: 2025-10-17
**Status**: Exploration Complete

---

## Problem Statement

Slash command templates use inconsistent choice formatting (varies between `(a)`, `**a)**`, and `a)`), lack clear recommendation marking beyond text annotations, and don't support modern UX patterns like multi-select or modification hints. Additionally, `/harden` is missing a critical choice block for handling quality check results, forcing users into auto-fix without explicit consent.

From the parent exploration (HODGE-346), the inconsistent option formatting was identified as one of the primary UX friction points across all 10 slash commands. While HODGE-346.2 established visual framing (box headers) and response indicators (💬 vs 🔔), the actual choice content within those blocks remains inconsistent and lacks modern interaction patterns.

---

## Conversation Summary

Through conversational exploration, we identified the scope of work and practical constraints for implementing consistent choice formatting. Key findings:

### Command Audit Results

**Commands WITH choice blocks (7 commands):**
1. `/build` - Multiple choice points throughout workflow (move files, handle PM mapping, handle decisions, git hooks)
2. `/decide` - Decision selection between explored options
3. `/plan` - Plan approval and modification workflow
4. `/codify` - Rule approval and type selection
5. `/review` - Auto-fix selection (fix all, select specific, skip)
6. `/ship` - Commit message approval and lesson codification
7. `/harden` - **MISSING** choice block for quality check results (needs to be added)

**Commands WITHOUT choice blocks (3 commands):**
8. `/explore` - Conversational only (uses 💬 indicator)
9. `/hodge` - Informational/context loading only
10. `/status` - Informational only

### Technical Constraints Discovered

**Enter Key Limitation**: Testing revealed that pressing Enter without preceding text is not captured by the Claude Code interface. This eliminated "press Enter for default" as a UX pattern and confirmed single-character responses (like "r" for recommended) are the optimal shortcut mechanism.

### Harden Command Gap

The `/harden` command currently lacks an explicit choice block for handling quality check results. It assumes auto-fix via `--fix` flag or defers warnings to `/ship`, but users need explicit control over:
- **Mandatory issues**: Type errors, test failures (block shipping)
- **Warning-level issues**: ESLint warnings, style issues (don't block shipping)

The command should strongly encourage fixing mandatory issues while allowing users to skip them (with clear consequences) and offer granular control over warnings.

### Design Requirements Gathered

**Core Formatting Patterns:**
- Alphabetized choice lists (a/b/c/d) - never `(a)`, `**a)**`, or numbered
- ⭐ emoji for recommended options (immediately after letter)
- "(Recommended)" text annotation after option description
- Consistent prompt: `👉 Your choice [a/b/c/d]:`

**Advanced Interaction Patterns:**
- **"r" shortcut**: Selects all recommended options when 2+ exist
- **Multi-select syntax**: "a,b" or "a, b" for selecting multiple options
- **Modification support**: "a, and [your change]" for flexible overrides
- **AI parsing guidance**: Explicit rules in templates for interpreting responses

**Shortcut Logic:**
- 0 recommendations: No "r" mentioned (nothing to shortcut)
- 1 recommendation: No "r" mentioned (pointless, just type the letter)
- 2+ recommendations: Show "or r for all recommended" in prompt

**Modification Tip:**
- Appears on **every** choice prompt (not conditional)
- Format: `💡 Tip: You can modify any choice, e.g., "a, and [your change]"`
- Uses "and" (adding to option) rather than "but" (replacing parts)

### Harden Choice Block Design

**Scenario A: Mandatory + Warnings**
```
a) ⭐ Fix mandatory issues (Recommended)
b) ⭐ Fix mandatory + warnings (Recommended)
c) Review issues first, then decide
d) Skip for now (ship will be blocked)

👉 Your choice [a/b/c/d or r for all recommended]:
```

**Scenario B: Only Mandatory**
```
a) ⭐ Fix mandatory issues (Recommended - required for ship)
b) Review issues first, then decide
c) Skip for now (ship will be blocked)

👉 Your choice [a/b/c]:
```

**Scenario C: Only Warnings**
```
a) ⭐ Fix all warnings (Recommended)
b) Select specific warnings to fix
c) Review issues first, then decide
d) Skip warnings (you can ship without fixing these)

👉 Your choice [a/b/c/d]:
```

**Scenario D: No Issues**
```
✅ All quality checks passed! No issues to fix.
```

### Review Profile Synchronization

The review profile (`.hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml`) must be updated **during** implementation to enforce:
- Alphabetized choice format validation
- ⭐ recommendation marking rules
- "r" shortcut presence logic
- Modification tip requirement
- Multi-select syntax documentation

---

## Implementation Approaches

### Approach 1: Progressive Enhancement Pattern ⭐ (Recommended)

**Description**: Layer new interaction patterns on top of existing choice blocks, adding capability while maintaining backward compatibility with simpler use cases. Update all 7 commands simultaneously to ensure consistency, and enhance the review profile incrementally as patterns are validated.

**Implementation Strategy:**

**Phase 1: Core Formatting (Foundational)**
1. Standardize all choice blocks to `a)` format (not `(a)` or `**a)**`)
2. Add ⭐ emoji to recommended options
3. Ensure "(Recommended)" text follows option description
4. Standardize prompt to `👉 Your choice [a/b/c/d]:`

**Phase 2: Advanced Patterns (Enhancement)**
1. Add "r" shortcut when 2+ recommendations exist
2. Document multi-select syntax (a,b) in prompts
3. Add modification tip to all choice blocks
4. Include AI parsing guidance in each template

**Phase 3: Harden Integration (Gap Fix)**
1. Add missing choice block to `/harden` command
2. Implement 4 scenarios (mandatory+warnings, only mandatory, only warnings, no issues)
3. Apply all formatting standards from Phase 1 & 2

**Phase 4: Review Profile Updates (Enforcement)**
1. Add validation rules for alphabetized format
2. Add rules for ⭐ marking consistency
3. Add rules for "r" shortcut logic
4. Add rules for modification tip presence
5. Create smoke tests to verify enforcement

**Example Before/After:**

**Before (inconsistent, basic):**
```
🔔 YOUR RESPONSE NEEDED

Would you like me to move it for you?
(a) ✅ Yes - Move it to the correct location
(b) 🔧 No - I'll handle it manually

👉 Your choice [a/b]:
```

**After (consistent, enhanced):**
```
🔔 YOUR RESPONSE NEEDED

Would you like me to move it for you?

a) ⭐ Yes - Move it to the correct location (Recommended)
b) No - I'll handle it manually

💡 Tip: You can modify any choice, e.g., "a, and also check for other misplaced files"

👉 Your choice [a/b]:
```

**AI Parsing Guidance (added to template internals):**
```markdown
## Response Parsing (AI Instructions)

When user responds to choice prompts:
- "a" or "b" etc. → select single option
- "a,b" or "a, b" → select multiple options (comma-separated)
- "r" → select all options marked with ⭐ (when 2+ recommendations exist)
- "a, and [modification]" → select option with user's changes applied
- Invalid (e.g., "7" when options are a-d) → use collaborative error recovery
```

**Pros:**
- **Backward compatible**: Existing responses ("a", "b") still work
- **Progressive disclosure**: Advanced features available but not required
- **Consistent rollout**: All 7 commands updated together prevents fragmentation
- **Testable increments**: Each phase has clear success criteria
- **Fills critical gap**: Adds missing `/harden` choice block while standardizing
- **Enforceable**: Review profile updates catch regressions during harden phase
- **Low risk**: Additive changes don't break existing workflows
- **User-friendly**: Modification tip teaches flexible interaction pattern
- **AI-friendly**: Explicit parsing rules prevent inconsistent interpretation

**Cons:**
- Larger initial change surface (7 commands × 4 phases)
- Review profile updates add complexity to implementation
- Need to test parsing logic across multiple response formats
- "r" shortcut requires conditional logic (only when 2+ recommendations)
- Modification tip appears on every choice (some might find it repetitive)
- Multi-command update requires careful testing to avoid breaking any workflow

**When to use**: This approach is ideal when you want to establish a consistent foundation across all commands while adding modern interaction patterns. Best for maintaining visual consistency (matches HODGE-346.2's work) while enabling power users to leverage shortcuts and modifications. Perfect for fixing the `/harden` gap as part of a comprehensive update rather than a one-off patch.

---

### Approach 2: Minimal Consistency Pass

**Description**: Focus solely on visual consistency without adding new interaction patterns. Standardize format to `a)` style and add ⭐ marking, but skip "r" shortcut, multi-select, and modification tips. Add minimal `/harden` choice block.

**Implementation Strategy:**

**Single Phase:**
1. Convert all `(a)` and `**a)**` to `a)` format
2. Add ⭐ emoji to existing recommended options
3. Standardize prompt text to `👉 Your choice [a/b/c/d]:`
4. Add basic choice block to `/harden` (single scenario, no conditional logic)
5. Update review profile with format-only rules

**Example Harden Choice Block (simplified):**
```
a) Fix all issues (recommended)
b) Skip for now (ship may be blocked)

👉 Your choice [a/b]:
```

**Pros:**
- Smallest possible change surface
- Fastest to implement and test
- Lower risk of introducing bugs
- Still achieves core consistency goal
- Simpler review profile updates

**Cons:**
- Misses opportunity for UX improvements (no shortcuts, no multi-select)
- `/harden` choice block too simple (doesn't distinguish mandatory vs warnings)
- No explicit guidance for AI parsing (relies on natural language understanding)
- Users won't discover modification pattern (no tip)
- Will likely need follow-up story to add advanced patterns later
- Doesn't leverage parent exploration's vision for "smart" interactions

**When to use**: This approach is ideal when you want to ship consistency improvements quickly with minimal risk, accepting that advanced features will come later. Best for teams with tight timelines or low tolerance for change. Not recommended given the parent exploration's emphasis on "smart" UX patterns.

---

### Approach 3: AI-Driven Dynamic Choices

**Description**: Push intelligence into the AI layer rather than the templates. Use minimal template structure but rely on AI to dynamically adjust choice formatting, recommendations, and shortcuts based on context.

**Implementation Strategy:**

**Template Layer (minimal):**
```markdown
Present the user with these options: [list options]
Recommended: [option]

Use smart choice formatting with shortcuts when applicable.
```

**AI Layer (maximal):**
- AI determines when to show "r" shortcut based on recommendation count
- AI decides whether to show modification tip based on complexity
- AI formats choices dynamically (may vary slightly between invocations)
- AI interprets responses flexibly without rigid parsing rules

**Pros:**
- Most flexible - AI can adapt to context in ways templates can't
- Smallest template changes (just guidance, not rigid structure)
- AI already good at natural language parsing
- Easy to "upgrade" behavior by improving AI without template changes

**Cons:**
- **Inconsistent output**: Same command might format choices differently each time
- **Not enforceable**: Review profile can't validate emergent AI behavior
- **Hard to test**: No deterministic structure to verify
- **Violates parent exploration**: HODGE-346 specifically called out inconsistency as the problem
- **Unpredictable UX**: Users can't rely on consistent patterns across sessions
- **Regression prone**: AI behavior changes could break workflows silently

**When to use**: This approach should NOT be used. It directly contradicts the parent exploration's goal of establishing consistent, predictable UX patterns. While AI flexibility is valuable for conversational flow, choice formatting needs deterministic structure.

---

## Recommendation

**Approach 1: Progressive Enhancement Pattern** is strongly recommended.

**Rationale:**

1. **Aligns with Parent Exploration**: HODGE-346 explicitly identified inconsistent choice formatting as a UX friction point. This approach systematically eliminates that inconsistency while adding intelligent features.

2. **Completes the Visual Language**: HODGE-346.2 established framing (box headers, response indicators). This story completes the visual system by standardizing what goes *inside* those frames.

3. **Fixes Critical Gap**: The missing `/harden` choice block is a real workflow issue. Including it as part of a comprehensive update is cleaner than shipping a one-off fix.

4. **Backward Compatible**: Users who just type "a" or "b" see no disruption. Power users discover shortcuts organically through the modification tip.

5. **Testable and Enforceable**: Review profile updates catch regressions. Smoke tests verify patterns hold across all 7 commands.

6. **Scales to Future Commands**: When new slash commands are added, they have clear patterns to follow.

7. **Phased Implementation Reduces Risk**: Core formatting first, then enhancements, then harden integration, then enforcement. Each phase can be validated independently.

8. **Maintains Sibling Momentum**: HODGE-346.1 created enforcement infrastructure, 346.2 established visual framing. This story builds on that foundation rather than diverging.

---

## Test Intentions

These behavioral expectations define success for the choice formatting system:

1. **Alphabetized Format**: All choice lists use consistent `a)` format (not `(a)`, not `**a)**`, not numbered lists)

2. **Recommendation Marking**: Recommended options have ⭐ emoji immediately after the letter and "(Recommended)" appended to the option description

3. **Multiple Recommendations Shortcut**: When 2+ options are marked ⭐, prompt includes "or r for all recommended" in the choice instruction

4. **Single/No Recommendation Shortcut**: When 0-1 options are marked ⭐, no "r" shortcut is mentioned in the prompt

5. **Multiple Selection Support**: Choice instructions show "a,b" syntax example when multiple selections make sense (implementation determines which choices support this)

6. **Modification Tip**: Every choice prompt includes: `💡 Tip: You can modify any choice, e.g., "a, and [your change]"`

7. **Parsing Guidance**: Each command template includes AI parsing instructions for: single select, multi-select (a,b), recommended shortcut (r), and modifications (a, and...)

8. **Error Recovery Integration**: Parsing instructions reference collaborative error recovery patterns from parent exploration for handling invalid/ambiguous responses

9. **Slash Command Distinction**: Slash commands remain as bulleted lists (•), never formatted as alphabetized choice lists

10. **Pattern Consistency**: All 7 slash command files with choice blocks (build, decide, plan, codify, review, ship, harden) use identical formatting, recommendation marking, and prompt instructions

11. **Harden Choice Block**: `/harden` command includes choice block with 4 scenarios (mandatory+warnings, only mandatory, only warnings, no issues) following all formatting standards

12. **Review Profile Enforcement**: Review profile validates alphabetized format, ⭐ marking, "r" shortcut logic, modification tip presence, and multi-select syntax across all commands

---

## Decisions Decided During Exploration

All design decisions were resolved during the conversational exploration phase:

1. ✓ **"r" Shortcut for Recommended**: Use single-character "r" shortcut to select all recommended options

2. ✓ **Modification Tip Frequency**: Show modification tip on every choice prompt (not conditionally based on session state)

3. ✓ **Feature Scope**: Include multi-select (a,b), "r" shortcut, and modification tips in this story

4. ✓ **Parsing Guidance Location**: Include AI parsing guidance in templates (not just visual formatting)

5. ✓ **Shortcut Display Logic**: Show "r" shortcut only when 2+ recommendations exist (not for 0-1 recommendations)

6. ✓ **Harden Warnings Display**: Show "Fix mandatory + warnings" option only when warnings exist (not always)

7. ✓ **Harden Review Option**: Always offer "Review issues first, then decide" option in harden choice block

8. ✓ **Review Profile Timing**: Update review profile during implementation (not after), treating it as part of the deliverable

9. ✓ **Harden Choice Block Inclusion**: Fix missing `/harden` choice block as part of this story (not separate work)

10. ✓ **Modification Tip Wording**: Use "a, and [your change]" format (additive) not "a, but [your change]" (replacement)

11. ✓ **Enter Key Pattern**: Cannot use "press Enter for default" pattern (Enter key not captured without preceding text)

12. ✓ **Command Audit Scope**: Update 7 commands with choice blocks (build, decide, plan, codify, review, ship, harden); leave 3 choice-free commands unchanged (explore, hodge, status)

---

## No Decisions Needed

All questions were successfully resolved during the exploration conversation. The feature is ready to proceed to `/build` phase.

---

## Next Steps

This exploration is complete with a clear recommendation and all decisions made. Ready to proceed to implementation.

**Build Phase Requirements**:
1. Update all 7 command files with standardized choice formatting
2. Add "r" shortcut, multi-select syntax, and modification tip to all choice blocks
3. Add AI parsing guidance to each command template
4. Create missing `/harden` choice block with 4 scenarios
5. Update review profile with validation rules for new patterns
6. Create smoke tests to enforce choice formatting consistency
7. Verify all patterns work correctly during harden phase
