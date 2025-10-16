# UX Review Profile: Claude Code Slash Commands

**Profile**: claude-code-slash-commands
**Category**: ux-patterns
**Version**: 1.0.0
**Applies To**: `.claude/commands/*.md`

## Overview

This profile enforces the **Conversational Companion** UX design system for Claude Code slash command templates. It ensures consistent, delightful user interactions across all 10 slash commands (`/explore`, `/decide`, `/build`, `/harden`, `/ship`, `/plan`, `/status`, `/review`, `/codify`, `/hodge`).

**Design Philosophy**: Natural dialogue that adapts to users, learns patterns, and celebrates wins. Minimalist visual aesthetics with smart emoji accents. Balances efficiency with personality through a knowledgeable peer tone.

---

## Core Visual Language (MANDATORY Rules)

### 1. Interaction Start Pattern
**Rule ID**: `interaction-start-box`
**Enforcement**: MANDATORY | BLOCKER

Every command must begin with a box pattern containing an emoji and command purpose:

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Exploring Feature Discovery                          │
└─────────────────────────────────────────────────────────┘
```

**Requirements**:
- Box width: exactly 60 characters (including borders)
- Title centered with appropriate padding
- Emoji chosen contextually (🔍 explore, 🔨 build, 🔒 harden, 🚀 ship, etc.)
- One blank line after box before content

**Rationale**: Creates consistent entry point, signals new interaction clearly, provides visual hierarchy.

---

### 2. Response Indicator
**Rule ID**: `response-indicator-emoji`
**Enforcement**: MANDATORY | BLOCKER

When user input is required, use emoji-based indicator:

```
🔔 YOUR RESPONSE NEEDED

[content with options]

👉 Your choice [a/b/c/d]:
```

**Requirements**:
- Bell emoji (🔔) + text "YOUR RESPONSE NEEDED" in ALL CAPS
- One blank line after indicator before content
- Pointing finger emoji (👉) before choice prompt
- Choice format: `[a/b/c/d]` or similar range

**Rationale**: Unmistakable signal that interaction paused, user turn to respond. Consistent across all commands.

---

### 3. Alphabetized Choice Lists
**Rule ID**: `alphabetized-choice-lists`
**Enforcement**: MANDATORY | BLOCKER

Present user choices as alphabetized lists for single-keystroke responses:

```
a) First option description
b) Second option description
c) Third option description
d) Fourth option description
```

**Requirements**:
- Lowercase letters (a, b, c, d, e, f, ...)
- One blank line between each option for scanability
- Options can be answered with just letter: `"a"`
- Support modifications: `"a, but add authentication"`

**Rationale**: Reduces typing, speeds interaction, familiar pattern. Enables quick selection while allowing elaboration.

---

### 4. Recommendation Marking
**Rule ID**: `recommendation-marking`
**Enforcement**: MANDATORY | BLOCKER

Mark recommended options clearly with emoji and text:

```
a) ⭐ First option (Recommended)
b) Second option
c) Third option
```

**Requirements**:
- Star emoji (⭐) immediately after the letter
- Text annotation "(Recommended)" for clarity
- Only ONE recommendation per choice list
- Place recommendation on most appropriate option

**Rationale**: Guides users toward best practices while respecting their agency. Clear visual + text for accessibility.

---

### 5. Bulleted Slash Command Suggestions
**Rule ID**: `bulleted-slash-commands`
**Enforcement**: MANDATORY | BLOCKER

Slash command suggestions must use bullets, **never** alphabetized choice lists:

```
### What's Next?

Based on where you are, here are your logical next steps:

• `/decide` - You have 3 decisions ready to make
• `/build HODGE-003` - Start building with Conversational discovery

Or describe what you'd like to do next.
```

**Requirements**:
- Use bullet character (•), not asterisk (*)
- Command first, then dash, then description
- Commands are typed, not single-keystroke (that's why NOT alphabetized)
- Context-aware descriptions ("You have 3 decisions...")

**Rationale**: Slash commands must be typed in full. Alphabetizing them misleads users into thinking single-keystroke works.

---

## Smart Intelligence (SUGGESTED Rules)

### 6. Context-Aware Command Filtering (Basic)
**Rule ID**: `context-aware-filtering`
**Enforcement**: SUGGESTED | WARNING

Hide irrelevant commands from "What's Next?" based on project state:

```
### What's Next?

Your exploration is complete and all decisions are made! 🎉

• `/build HODGE-003` - Start building with Conversational discovery
• `/save` - Bookmark this session

Or describe what you'd like to do next.
```

**Logic Examples**:
- No `/decide` if decisions.md exists and is complete
- No `/explore` after exploration already done
- No `/ship` if tests haven't passed

**Rationale**: Reduces cognitive load. Users only see relevant options. Cleaner, more focused interface.

---

### 7. Predictive Suggestions
**Rule ID**: `predictive-suggestions`
**Enforcement**: SUGGESTED | SUGGESTION

Highlight next logical command based on detected patterns:

```
### What's Next?

I notice you've shipped 3 features this week - you're on a roll! 🚀

• `/harden HODGE-003` - Run quality checks (Suggested next based on your workflow)
• `/ship HODGE-003` - Create production release

Or describe what you'd like to do next.
```

**Detection Patterns**:
- User velocity (ships per week)
- Typical workflow sequence
- Time of day patterns
- Feature complexity patterns

**Rationale**: Anticipates needs. Feels smart without being intrusive. Builds on basic filtering.

---

### 8. Adaptive Guidance
**Rule ID**: `adaptive-guidance`
**Enforcement**: SUGGESTED | SUGGESTION

Proactively reshape interaction when project state suggests help:

```
### What's Next?

⚡ Quick note: I see 5 TODOs in your exploration notes. Want to address them before deciding?

a) ⭐ Yes, let's review TODOs first (Recommended)
b) No, proceed to `/decide` anyway
c) Show me the TODOs so I can pick

Or describe what you'd like to do next.

👉 Your choice [a/b/c]:
```

**Trigger Examples**:
- TODOs in exploration notes before `/decide`
- Failing tests before `/ship`
- Missing documentation before `/harden`
- Stale branches before starting new work

**Rationale**: Highest intelligence level. Prevents issues before they occur. Feels like pair programming with thoughtful colleague.

---

## Error Recovery & Tone

### 9. Collaborative Error Recovery
**Rule ID**: `collaborative-error-recovery`
**Enforcement**: MANDATORY | WARNING

When user input suggests uncertainty or is invalid, offer helpful clarification:

```
🔔 YOUR RESPONSE NEEDED

Hmm, I got "maybe b?" which sounds a bit uncertain.

Let me help clarify:

a) ⭐ Continue with option b (Recommended)
b) Actually, let me explain the options better
c) Start over with fresh context
d) Skip this decision for now

👉 Your choice [a/b/c/d]:
```

**Uncertainty Patterns to Detect**:
- "maybe"
- "?"
- "not sure"
- "I think"

**Invalid Input Patterns**:
- Numbers when letters expected ("7" when options are a-d)
- Letters outside range ("g" when options are a-d)
- Gibberish or empty responses

**Rationale**: Never just reject. Always help repair. Collaborative, not adversarial.

---

### 10. Knowledgeable Peer Tone
**Rule ID**: `knowledgeable-peer-tone`
**Enforcement**: MANDATORY | WARNING

Use conversational language like pair programming with a colleague:

**Good Examples**:
- "Let me help clarify..."
- "Here's what we'll do..."
- "I notice you always choose X..."
- "Nice work! That's your 3rd ship this week."

**Bad Examples**:
- "System will now process..."
- "User must select..."
- "Error: Invalid input"
- "Operation completed successfully"

**Characteristics**:
- First person ("I", "Let's", "We")
- Conversational, smart, occasionally witty
- Never condescending or overly chatty
- Helpful without being intrusive

**Rationale**: Feels like working with skilled colleague. Professional yet approachable. Builds trust and engagement.

---

## Information Density & Delight

### 11. Hybrid Information Display
**Rule ID**: `hybrid-information-display`
**Enforcement**: SUGGESTED | WARNING

Complex multi-step commands show overview first, then progressive disclosure with breadcrumbs:

**Overview at Start**:
```
┌─────────────────────────────────────────────────────────┐
│ 🔒 Hardening HODGE-003                                  │
└─────────────────────────────────────────────────────────┘

Here's what we'll do:

1. Run quality checks (tests, lint, types)
2. Review critical files
3. Generate manifest
4. Run automated fixes (if needed)
5. Manual review & fixes
6. Final validation
7. Update PM system

Let's start!
```

**Progressive with Breadcrumbs**:
```
────────────────────────────────────────────────────────────
📍 Step 3 of 7: Critical Files Analysis
────────────────────────────────────────────────────────────

✓ Quality checks passed (12s)
✓ Critical files identified (3 high-risk)

🔔 YOUR RESPONSE NEEDED

I found 3 high-risk files that need careful review:

a) ⭐ Review all 3 now (Recommended - takes ~10min)
b) Review just the highest risk file
c) Skip review, trust the tests
d) Tell me more about the risks first

👉 Your choice [a/b/c/d]:
```

**Rationale**: Overview provides context. Breadcrumbs show progress. Balance between context and focus. Reduces overwhelm.

---

### 12. Progress Celebration
**Rule ID**: `progress-celebration`
**Enforcement**: SUGGESTED | SUGGESTION

Display achievement box with stats after significant milestones:

```
┌─────────────────────────────────────────────────────────┐
│ 🎉 HODGE-003 Shipped!                                   │
└─────────────────────────────────────────────────────────┘

Nice work! That's your 3rd ship this week.

📊 Your Momentum:
• 3 features shipped this week
• 12 features shipped this month
• 85% test coverage maintained

🏆 Achievement Unlocked: "Shipping Streak" (3+ in a week)

### What's Next?

• `/explore {{next-feature}}` - Keep the momentum going
• `/status` - See full project health

Or describe what you'd like to do next.
```

**When to Celebrate**:
- After `/ship` (always)
- Streak milestones (3, 5, 10 ships)
- Test coverage improvements
- Performance improvements
- Complexity reductions

**Rationale**: Acknowledges accomplishments. Provides motivation. Calibrated to feel earned, not gimmicky. Gamification lite.

---

### 13. Contextual Tips
**Rule ID**: `contextual-tips`
**Enforcement**: SUGGESTED | SUGGESTION

Offer optional tips when workflow matches lessons from previous features:

```
💡 Pattern from HODGE-289: When hardening commands with subprocess
spawning, check for zombie processes. You might want to grep for
`execSync` in your changes.

a) ⭐ Yes, check now (Recommended)
b) Skip, I know it's safe
c) Tell me more about the pattern

👉 Your choice [a/b/c]:
```

**Requirements**:
- Reference specific feature IDs (HODGE-XXX)
- Make optional with choices (not forced)
- Link to lessons in `.hodge/lessons/`
- Only show when genuinely relevant

**Rationale**: Learn from past. Prevent repeated mistakes. Pattern library becomes living knowledge base.

---

### 14. Smart Shortcuts
**Rule ID**: `smart-shortcuts`
**Enforcement**: SUGGESTED | SUGGESTION

Offer to set defaults when user consistently chooses same option:

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Exploring HODGE-120                                  │
└─────────────────────────────────────────────────────────┘

I notice you always choose conversational exploration. Want to:

a) ⭐ Set as default (one-key `/explore` starts convo)
b) Keep choosing each time
c) Different default

👉 Your choice [a/b/c]:
```

**Detection**:
- Track choices across sessions
- Trigger after 3+ consistent selections
- Store in user preferences

**Rationale**: Learns preferences. Reduces friction. Power user feature. Feels intelligent without being intrusive.

---

## Pattern Consistency

### 15. Cross-Command Consistency
**Rule ID**: `pattern-consistency`
**Enforcement**: MANDATORY | BLOCKER

All 10 slash command files (`.claude/commands/*.md`) must follow the same visual patterns, tone, and interaction structures.

**Checklist for Each Command**:
- ✅ Interaction start box with appropriate emoji
- ✅ Response indicators use 🔔 + YOUR RESPONSE NEEDED
- ✅ Choice lists are alphabetized (a/b/c/d)
- ✅ Recommendations marked with ⭐ + (Recommended)
- ✅ Slash commands use bullets (•), not alphabetized
- ✅ Knowledgeable peer tone throughout
- ✅ Collaborative error recovery where applicable
- ✅ Context-aware "What's Next?" sections

**Rationale**: Consistency builds familiarity. Users learn once, apply everywhere. Reduces cognitive load across workflow.

---

## Validation Checklist

When reviewing slash command changes, verify:

1. **Visual Hierarchy**
   - [ ] Interaction start box present and properly formatted
   - [ ] Response indicators use correct emoji and format
   - [ ] Choice lists are alphabetized with proper spacing

2. **Interaction Patterns**
   - [ ] Recommendations clearly marked
   - [ ] Slash commands use bullets, not letters
   - [ ] Error recovery is collaborative, not rejecting

3. **Tone & Language**
   - [ ] Conversational "knowledgeable peer" tone
   - [ ] First person language ("Let's", "I notice")
   - [ ] No formal system language

4. **Intelligence Features** (where applicable)
   - [ ] Commands filtered based on state
   - [ ] Predictive suggestions when patterns detected
   - [ ] Adaptive guidance for common issues

5. **Consistency**
   - [ ] Patterns match other slash commands
   - [ ] Deviations are intentional and justified
   - [ ] No conflicts with existing standards

---

## Validation Against Existing Standards

**Conflicts Checked**: ✅ None found

This UX profile was validated against:
- `.hodge/standards.md` - No UX-specific conflicts
- `.hodge/principles.md` - File not found (no conflicts)
- `.hodge/decisions.md` - No UX-related decisions found
- `.hodge/patterns/interactive-next-steps.md` - **Compatible**: Enhances existing pattern with ⭐ marking and bullets

**Enhancement**: This profile formalizes and extends the existing `interactive-next-steps.md` pattern with additional UX consistency requirements.

---

## Related Patterns

- `.hodge/patterns/interactive-next-steps.md` - Next steps format (enhanced by this profile)
- `.hodge/standards.md#cli-architecture` - AI orchestration standards (compatible)
- `.hodge/standards.md#slash-command-file-creation` - File creation pattern (compatible)

---

## Version History

- **1.0.0** (2025-10-16): Initial release - The Conversational Companion design system
