# Exploration: Lessons Workflow (HODGE-299)

## Feature Overview
**PM Issue**: HODGE-299
**Type**: general
**Created**: 2025-09-29T20:29:19.595Z

## Problem Statement

Users completing the `/ship` command receive a message: "Review lessons learned in `.hodge/features/HODGE-298/ship/lessons-draft.md`"

This creates confusion:
1. **How** should users review the lessons-draft.md file?
2. **What** are they reviewing for?
3. **How** do these drafts become finalized lessons in `.hodge/lessons/`?
4. **What** is the complete workflow from draft → finalized lesson?

Currently, there's a gap between the CLI creating `lessons-draft.md` and the lesson ending up in the project-wide `.hodge/lessons/` directory.

## Current State Analysis

### What Exists Today

**CLI Behavior (ship.ts:1020-1046)**:
- Creates `lessons-draft.md` in `.hodge/features/{FEATURE}/ship/`
- Includes objective metrics (files changed, patterns found, test status)
- Marks as draft with note: "use /ship slash command to enhance with AI analysis"
- Deletes draft if no significant changes

**Slash Command Reference (ship.md:218-219)**:
```bash
lessons_file=".hodge/lessons/$feature-$(date +%Y%m%d).md"
mkdir -p .hodge/lessons
```

**Existing Lesson Example**: `.hodge/lessons/HODGE-003-feature-extraction.md`
- Rich narrative about problem, approaches, learnings
- Code examples and patterns
- Clear impact assessment
- Related decisions

### The Gap

❌ **Missing**: Bridge between draft and finalized lesson
❌ **Missing**: User guidance on what "review" means
❌ **Missing**: Workflow to enhance draft with AI insights
❌ **Missing**: Command or process to move draft → `.hodge/lessons/`

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9
- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: interactive-next-steps.md, progressive-enhancement-commands.md

## Implementation Approaches

### Approach 1: Interactive AI Enhancement Flow

**Description**: The `/ship` slash command guides users through enhancing the draft with AI analysis, then moves the finalized lesson to `.hodge/lessons/`.

**How it works**:
1. After ship completes, `/ship` command detects `lessons-draft.md`
2. AI reads the draft and asks enhancement questions:
   - "What worked well in this implementation?"
   - "What would you do differently next time?"
   - "What patterns emerged that others should know about?"
   - "Any gotchas or surprises?"
3. AI enriches draft with user responses + its own analysis
4. AI writes enhanced lesson to `.hodge/lessons/{FEATURE}-{DATE}.md`
5. Keeps draft for reference

**Pros**:
- Natural conversation flow - users are already in the context
- AI can analyze git diff, test results, decisions made
- Captures insights while memory is fresh
- No separate command to remember
- Enriched lessons become valuable project knowledge base

**Cons**:
- Makes `/ship` command longer
- Requires user engagement when they might want to move on
- Could feel forced if user has nothing to add

**When to use**: Best for features where lessons are valuable and user is actively engaged.

### Approach 2: Separate `/review-lessons` Command

**Description**: Create a dedicated slash command for reviewing and finalizing lessons after shipping.

**How it works**:
1. After ship, user sees: "Lessons draft created. Run `/review-lessons {FEATURE}` to finalize."
2. `/review-lessons` command:
   - Reads `lessons-draft.md`
   - Shows user the draft
   - Asks enhancement questions
   - AI analyzes context and enriches
   - Writes to `.hodge/lessons/{FEATURE}.md`
3. Removes draft after finalization

**Pros**:
- Clean separation of concerns (ship vs reflect)
- User can finalize lessons later when ready
- Doesn't extend ship workflow
- Explicit opt-in to lessons process
- Clear command name shows intent

**Cons**:
- Another command to document and remember
- User might forget to run it
- Context loss if done much later
- Requires building new command infrastructure

**When to use**: When ship workflow should be minimal and lessons review is optional.

### Approach 3: Automatic AI Enhancement (No User Input)

**Description**: AI automatically enriches lessons-draft.md immediately after ship, without user interaction.

**How it works**:
1. Ship command creates draft with metrics
2. AI automatically:
   - Analyzes git diff and changes made
   - Reviews decisions from explore/decide phases
   - Identifies patterns applied
   - Generates insights about approach taken
   - Writes enhanced lesson to `.hodge/lessons/{FEATURE}.md`
3. User informed: "Lessons documented at `.hodge/lessons/HODGE-XXX.md`"

**Pros**:
- Zero user friction - fully automatic
- Consistent lesson quality (AI-generated)
- Fast - no waiting for user input
- Always captures lessons (never forgotten)
- Scales well across many features

**Cons**:
- Loses valuable human insights and context
- AI might miss nuances only user knows
- Less engaging - user doesn't reflect
- May generate generic lessons
- Can't capture "what I'd do differently" insights

**When to use**: When automation and consistency matter more than depth of insight.

## Recommendation

**Approach 1: Interactive AI Enhancement Flow**

### Why This is Best

1. **Captures Rich Context**: Combines objective metrics (CLI) + human insight (user) + AI analysis
2. **Timely**: Happens while feature is fresh in user's mind
3. **Natural Flow**: Part of ship workflow - no separate command to remember
4. **Valuable Output**: Creates lessons like `HODGE-003-feature-extraction.md` that actually help future work
5. **Progressive**: Can be skipped if user prefers (--skip-lessons flag or interactive opt-out)

### Implementation Notes

**User Experience**:
```
✓ Shipped HODGE-299
✓ Lessons draft created

Let's capture what we learned. I'll ask a few quick questions:

1. What approach worked particularly well?
   > [user responds or skips]

2. Anything you'd do differently next time?
   > [user responds or skips]

3. Any gotchas or surprises during implementation?
   > [user responds or skips]

✓ Lessons documented at .hodge/lessons/HODGE-299-lessons-workflow.md
```

**Optional Skip**:
- Interactive: "Would you like to document lessons? (y/n)"
- Flag: `/ship {{feature}} --skip-lessons` (if user knows in advance)

## Decisions Needed

### 1. **Workflow Integration Decision**
- **Question**: Should lessons review be part of `/ship` or separate command?
- **Options**: Integrated (Approach 1), Separate (Approach 2), Automatic (Approach 3)
- **Recommendation**: Integrated with skip option

### 2. **User Interaction Scope**
- **Question**: How many questions should AI ask?
- **Options**: None (automatic), Few (3-4 quick questions), Many (thorough interview)
- **Recommendation**: Few (3-4) - balance insight vs friction

### 3. **Draft Persistence**
- **Question**: Keep or delete lessons-draft.md after finalization?
- **Options**: Keep (audit trail), Delete (cleanup), Archive (move to archive/)
- **Recommendation**: Keep - useful for debugging and comparison

### 4. **Lesson File Naming**
- **Question**: How to name finalized lessons?
- **Options**: `{FEATURE}.md`, `{FEATURE}-{DATE}.md`, `{FEATURE}-{TITLE}.md`
- **Recommendation**: `{FEATURE}-{slug}.md` (e.g., `HODGE-299-lessons-workflow.md`)

### 5. **Skip Mechanism**
- **Question**: How should users skip lessons if they want to?
- **Options**: Flag (--skip-lessons), Interactive prompt (y/n), Config setting
- **Recommendation**: Interactive prompt with memory of preference

## Test Intentions

What should this feature do?

**Draft Creation** (Already works):
- [x] CLI creates lessons-draft.md with metrics after ship
- [x] Draft includes files changed, patterns, test status
- [x] Draft is deleted if no significant changes

**Enhancement Flow** (To implement):
- [ ] AI detects lessons-draft.md after ship
- [ ] AI asks 3-4 enhancement questions
- [ ] User can respond or skip each question
- [ ] AI analyzes git diff and feature context
- [ ] AI generates enriched lesson with narrative structure

**Finalization** (To implement):
- [ ] Enhanced lesson written to `.hodge/lessons/{FEATURE}-{slug}.md`
- [ ] Lesson includes problem, approaches, learnings, impact
- [ ] Draft is preserved in feature directory
- [ ] User informed of lesson location

**Skip Path** (To implement):
- [ ] User can skip lessons review entirely
- [ ] Preference remembered for session
- [ ] Draft remains for later review if skipped

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-299`

---
*Template created: 2025-09-29T20:29:19.595Z*
*AI exploration completed: 2025-09-29*
