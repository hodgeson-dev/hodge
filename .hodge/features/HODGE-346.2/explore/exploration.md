# Exploration: Core Visual Language Patterns

**Title**: Implement core visual language patterns (interaction start boxes and response indicators)

**Feature**: HODGE-346.2
**Date**: 2025-10-16
**Status**: Exploration Complete

---

## Problem Statement

Claude Code's 10 slash command templates (`.claude/commands/*.md`) lack visual consistency in how they structure interactions and signal when user response is needed. Analysis reveals:

- **Inconsistent interaction starts**: Some commands use boxes, others use plain headers, some have no visual distinction
- **Varying response indicators**: No standard way to signal "your turn to respond" across commands
- **Fragmented experience**: Users encounter different visual patterns with each command, creating cognitive friction
- **No distinction between conversation vs. choice**: Open-ended questions look the same as formal decision points

This is the first implementation story in the HODGE-346 epic to establish visual consistency. HODGE-346.1 created the UX review profile and verification strategy; now we implement the foundational visual patterns.

---

## Conversation Summary

Through conversational exploration, we established clear design patterns and implementation rules for visual consistency across all 10 slash commands.

### Design Decisions Made

**Box Header Pattern (Option B Selected)**:
We chose to use the same box format throughout with command name repeated in each section header, rather than separate command vs. section header styles. This provides:
- Strong visual consistency
- Clear context (user always knows what command they're in)
- Works well when sections are far apart in output
- Unified design language

Format:
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 CommandName: Section Name                            │
└─────────────────────────────────────────────────────────┘
```

**Two-Tier Response Indicator System**:
We established two distinct levels of response indicators based on interaction type:

1. **Conversational Turn** (lightweight, for open-ended questions):
   ```
   💬 Your response:
   ```
   - Use for: Conversational questions during discovery
   - Purpose: Subtle visual cue that it's user's turn
   - Friendly, low-pressure indicator

2. **Choice Required** (heavyweight, for explicit decisions):
   ```
   🔔 YOUR RESPONSE NEEDED

   Would you like to:
   (a) ✅ Option one
   (b) 🔄 Option two
   (c) ➕ Option three

   👉 Your choice [a/b/c]:
   ```
   - Use for: Lettered choice lists (a/b/c/d)
   - Use for: Final approval/confirmation moments
   - Purpose: Prominent indicator for important decisions

### Scope and Application Rules

**Comprehensive Consistency Approach**:
- ✅ All 10 commands get box headers (including simple ones like `/status`)
- ✅ Box header at start of every command
- ✅ Box headers before each major section within commands
- ✅ Even read-only commands get visual treatment

**CLI Output Handling**:
- AI interpretation/summary sections: Boxed
- Raw tool output (test results, build logs): Unboxed
- Error summaries: Standard box format (no special styling for now)

**Conversation Flow**:
- One box per conversation phase (e.g., "Conversational Discovery")
- Not one box per individual question within that phase
- Conversational questions end with `💬 Your response:`
- Final approval/choice points use full `🔔 YOUR RESPONSE NEEDED` block

### Commands to Update

All 10 slash commands in `.claude/commands/`:
1. `build.md`
2. `codify.md`
3. `decide.md`
4. `explore.md`
5. `harden.md`
6. `hodge.md`
7. `plan.md`
8. `review.md`
9. `ship.md`
10. `status.md`

---

## Implementation Approaches

### Approach 1: Systematic Template Updates with Git-Based Verification ⭐ (Recommended)

**Description**: Update all 10 command templates systematically following the established visual patterns, using the git-based verification workflow from HODGE-346 decisions.

**Implementation Steps**:

1. **Baseline Capture** (before any changes):
   - Run characterization tests (should pass with current templates)
   - Capture baseline outputs: Run each command manually, save text output
   - Commit current state to establish `buildStartCommit` baseline

2. **Template Updates** (systematic approach):
   - For each command file:
     - Identify major sections (command start, phases, decision points)
     - Add box headers with consistent format
     - Replace existing response prompts with two-tier system
     - Preserve all workflow steps and instructions
     - Keep variable placeholders ({{feature}}, {{timestamp}})

3. **Verification** (four-layer approach from `.hodge/patterns/slash-command-verification-pattern.md`):
   - Layer 1: Run characterization tests (detect regressions)
   - Layer 2: AI diff analysis using `git show $baseline:.claude/commands/{file}.md`
   - Layer 3: Manual smoke tests (run commands, compare outputs)
   - Layer 4: Git diff review before commit

**Visual Pattern Examples**:

*Command Start*:
```markdown
┌─────────────────────────────────────────────────────────┐
│ 🔍 Exploring Feature Discovery                          │
└─────────────────────────────────────────────────────────┘

[command introduction text]
```

*Major Section*:
```markdown
┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Conversational Discovery                    │
└─────────────────────────────────────────────────────────┘

[section content]
```

*Conversational Question*:
```markdown
What is the feature trying to accomplish?

💬 Your response:
```

*Choice List*:
```markdown
🔔 YOUR RESPONSE NEEDED

Would you like to:
(a) ✅ Approve and write to exploration.md
(b) 🔄 Revise specific sections
(c) ➕ Add more detail

👉 Your choice [a/b/c]:
```

**Pros**:
- Leverages established verification pattern (proven workflow)
- Git-based baseline eliminates manual backup directory
- Four-layer verification catches regressions at multiple levels
- Systematic approach ensures consistency across all 10 files
- Automated tests enforce patterns going forward

**Cons**:
- Requires careful attention to preserve existing workflow logic
- Must update 10 files consistently (risk of inconsistency if rushed)
- Manual smoke testing time-intensive (run all commands)

**When to use**: This is the recommended approach because it balances thoroughness with efficiency, and follows the verification strategy already established in HODGE-346.1.

---

### Approach 2: Incremental Rollout with Command Prioritization

**Description**: Update commands incrementally based on complexity/usage, starting with simpler commands to validate patterns before tackling complex ones.

**Implementation Order**:
1. **Simple commands first** (status, hodge): Validate box patterns work
2. **Medium complexity** (decide, codify): Add response indicators
3. **Complex workflows** (explore, harden, ship): Full two-tier system

**Pros**:
- Lower risk - validate patterns on simple commands first
- Easier to catch design issues early
- Can ship partial improvements incrementally

**Cons**:
- Inconsistent user experience during rollout
- More verification overhead (test after each batch)
- Violates "comprehensive consistency" principle
- Multiple rounds of baseline capture and testing

**When to use**: Only if we're uncertain about the visual patterns and want to validate incrementally. Not recommended given we have clear design decisions.

---

### Approach 3: Template Generation with Script

**Description**: Write a script to programmatically insert box headers and response indicators into existing templates based on pattern matching.

**Implementation**:
- Parse markdown templates to identify sections
- Detect existing response prompts
- Insert box headers programmatically
- Replace prompts with standardized indicators

**Pros**:
- Faster initial implementation
- Guaranteed consistency across files
- Repeatable if we need to adjust patterns

**Cons**:
- Risk of incorrect pattern matching (complex templates)
- May miss context-specific nuances
- Harder to preserve existing formatting quirks
- Script becomes throwaway code (one-time use)
- Still requires full manual verification anyway

**When to use**: Only if we had 50+ command files. With 10 files, manual updates are safer and faster.

---

## Recommendation

**Use Approach 1: Systematic Template Updates with Git-Based Verification**

**Rationale**:
- We have clear, well-defined patterns from our conversation
- Git-based verification workflow is already established (HODGE-346 decision)
- 10 files is manageable for manual systematic updates
- Manual approach preserves context and nuances better than scripts
- Four-layer verification gives high confidence in changes
- Follows existing patterns (`.hodge/patterns/slash-command-verification-pattern.md`)

**Implementation Note**: This is foundational work - future stories (HODGE-346.3, 346.4, 346.5) will build on these visual patterns, so getting them right is critical.

---

## Test Intentions

Behavioral expectations for this feature:

### Visual Pattern Consistency
1. ✅ **All 10 commands start with box header** - Every command template begins with the standard box format including emoji and command name
2. ✅ **Box headers use consistent format** - All box headers follow the exact format: `│ 🔍 CommandName: Section Name │` with consistent width
3. ✅ **Major sections use box headers** - Each major section within a command has its own box header with command name + section name
4. ✅ **Conversational questions end with response indicator** - Open-ended questions in conversational flows end with `💬 Your response:`
5. ✅ **Choice lists use full response block** - Lettered choice lists (a/b/c) use complete `🔔 YOUR RESPONSE NEEDED` block with `👉 Your choice:` prompt
6. ✅ **Box width is consistent** - All box headers use same character width across all commands

### Content Preservation
7. ✅ **All workflow steps preserved** - No existing workflow steps, instructions, or logic removed from original templates
8. ✅ **Variable placeholders intact** - All template variables ({{feature}}, {{timestamp}}, etc.) still present and functional
9. ✅ **Instructions remain complete** - All AI instructions and guidance preserved in updated templates
10. ✅ **Commands execute correctly** - Each command runs end-to-end and produces expected behavior after template changes

### Verification Process
- Characterization tests pass with current templates (baseline)
- UX compliance tests enforce new patterns
- AI diff analysis confirms workflow preservation
- Manual smoke tests verify end-to-end behavior
- Git diff review catches accidental changes

---

## Decisions Decided During Exploration

### 1. Box Header Pattern: Option B (Same Format Throughout)
**Decision**: Use the same box format for both command headers and section headers, with command name repeated each time.

**Rationale**: Provides strong visual consistency, keeps users oriented (always know what command they're in), and creates unified design language.

**Alternative Rejected**: Different styles for command vs. section headers (would create visual hierarchy but reduce consistency).

### 2. Two-Tier Response Indicator System
**Decision**: Implement two distinct response indicators:
- Lightweight `💬 Your response:` for conversational questions
- Heavyweight `🔔 YOUR RESPONSE NEEDED` block for choices/approvals

**Rationale**: Distinguishes open-ended conversation from formal decision points. Conversational indicator is subtle and friendly; choice indicator is prominent for important moments.

**Alternative Rejected**: Single indicator for all response points (would lack nuance and context).

### 3. Comprehensive Consistency (All Commands)
**Decision**: Apply visual patterns to all 10 commands, including simple read-only ones like `/status`.

**Rationale**: Creates truly unified experience. Even simple commands benefit from consistent visual structure. Eliminates special cases.

**Alternative Rejected**: Only update complex commands (would create inconsistent experience).

### 4. CLI Output Handling
**Decision**:
- AI interpretation/summary sections: Boxed
- Raw tool output: Unboxed
- Error summaries: Standard box format

**Rationale**: Box headers frame AI interactions; raw CLI output stays authentic. Error summaries are AI interpretations, so they get boxed.

**Alternative Rejected**: Box everything including CLI output (would create visual noise and reduce authenticity of tool output).

### 5. Standard Error Styling (For Now)
**Decision**: Use standard box format for error summaries without special error styling.

**Rationale**: Keep scope focused on core visual patterns. Special error styling could be added later if needed.

**Alternative Rejected**: Create separate error box style (scope creep for this story).

### 6. Conversation Phase Granularity
**Decision**: One box header per conversation phase (e.g., "Conversational Discovery"), not per individual question.

**Rationale**: Reduces visual clutter during natural conversation flow. Box signals "we're in conversation mode", individual questions use lightweight indicator.

**Alternative Rejected**: Box header per question (too much visual weight, interrupts conversational flow).

### 7. Slash Command Presentation Format
**Decision**: Present slash commands as bulleted lists, not as executable choice menus.

**Rationale**: Claude Code cannot execute slash commands directly - users must type them. Bulleted lists make this clear while maintaining readability. Choice menus (a/b/c) are reserved for actual interactive decisions that the AI can act on.

**Alternative Rejected**: Present slash commands in choice menu format (would falsely imply AI can execute them).

### 8. Never Suggest Direct CLI Commands
**Decision**: Never suggest users run `hodge` CLI commands directly (e.g., `hodge decide`, `hodge build`). Only suggest slash commands (e.g., `/decide`, `/build`).

**Rationale**: The `hodge` CLI commands are meant to be called by slash commands, not by users directly. This maintains the clean separation: slash commands orchestrate the workflow, `hodge` CLI handles the mechanics.

**Alternative Rejected**: Allow suggesting both formats (would confuse users about which interface to use).

---

## No Decisions Needed

All design decisions were resolved during conversational exploration.

---

## Related Context

**Parent Epic**: HODGE-346 - Unified UX System for Claude Code Slash Commands

**Sibling Features**:
- HODGE-346.1 (shipped): Created UX review profile and verification strategy

**Verification Pattern**: `.hodge/patterns/slash-command-verification-pattern.md`

**UX Review Profile**: `.hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml`

---

**Next Steps**: Use `/build HODGE-346.2` to implement systematic template updates with git-based verification.
