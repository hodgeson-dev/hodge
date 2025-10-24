# Exploration: Smart Context Awareness and Progressive Disclosure

**Title**: Smart context awareness and progressive disclosure for slash commands

**Feature**: HODGE-346.4
**Date**: 2025-10-17
**Status**: Exploration Complete

---

## Problem Statement

Slash command templates lack intelligent adaptation based on project state, workflow patterns, and past learnings. Commands show all options regardless of relevance (e.g., suggesting `/decide` when no decisions needed), provide no progress indicators during multi-step workflows (e.g., `/harden`'s 7 steps feel disorienting), miss opportunities to celebrate achievements (e.g., shipping 3 features in a week), and don't surface relevant lessons from past features (e.g., subprocess spawning patterns when modifying command execution code).

From the parent exploration (HODGE-346), this was identified as a critical gap in creating a truly intelligent, delightful AI assistant. While HODGE-346.2 established visual framing (box headers, response indicators) and HODGE-346.3 standardized choice formatting, the commands still behave the same regardless of context. A user shipping their 50th feature sees identical output to someone shipping their first. Commands don't learn from project history or adapt to user patterns.

This creates cognitive overhead (scanning irrelevant suggestions), missed learning opportunities (not surfacing relevant lessons), and a transactional feel (no celebration of wins) that undermines the "knowledgeable peer" tone established in the parent exploration.

---

## Conversation Summary

Through conversational exploration, we identified four focus areas (context awareness, progress celebration, information density, contextual tips) and validated the architectural foundation for implementing intelligent behavior while maintaining separation of concerns.

### Architecture Validation

**Key Principle**: CLI provides data, AI applies intelligence and presentation.

**Current State Analysis**:
- Slash commands already call `hodge status` and `hodge context` for state
- CLI owns `.hodge/` structure knowledge and file discovery
- Templates display CLI output, AI interprets and synthesizes
- ✅ Separation of concerns already established

**Enhancement Pattern**:
- CLI adds new capabilities: `hodge status --stats`, `hodge lessons --match`
- CLI returns structured data with metadata (confidence scores, severity levels)
- Templates use conditionals and data fields for intelligent presentation
- AI layer handles natural language synthesis and contextual interpretation

### Stats Data Source Design

**Challenge**: Progress celebration requires historical data (ships per week/month, streaks). If user deletes feature directories for cleanup, `ship-record.json` files are lost.

**Decision**: Hybrid approach
1. **Primary source**: `ship-record.json` files (fast, structured)
2. **Fallback source**: Git commit history (robust, survives cleanup)
3. **Merge strategy**: Union of both datasets by feature ID

**CLI Implementation**:
```bash
hodge status --stats

# Returns:
Ships This Week: 3
Ships This Month: 12
Total Shipped: 85
Streak: 3 consecutive weeks
Test Coverage: 89% (trend: +4%)
```

**Future Enhancement**: At some point may want `.hodge/stats.json` for performance, but hybrid approach provides good MVP balance.

### Progress Indicators Design

**Current Gap**: `/harden` has 7 labeled steps but no runtime "you are here" indicator. Users lose orientation in long workflows.

**Decision**: Visual box style (Option 2), template-driven

**Example Implementation**:
```markdown
────────────────────────────────────────────────────────────
📍 Step 3 of 7: Choose Review Tier
────────────────────────────────────────────────────────────

Previously completed:
  ✓ Generate Review Manifest (12s)
  ✓ Read Review Manifest

Remaining:
  ○ Load Context Files
  ○ Conduct AI Review
  ○ Assess Findings
  ○ Update PM System
```

**Why Template-Driven**:
- Steps are conversational guideposts, not CLI phases
- AI knows conversation state (what's been completed)
- Keeps CLI stateless and simple
- Allows flexibility (can collapse/expand based on context)

**Commands Getting Progress Indicators**:
- `/harden` (7 steps)
- `/build` (multiple stages)
- `/ship` (commit creation, validation, PM update)

### Lesson Matching Strategy

**Current Implementation**: Keyword grep in `/explore` template:
```bash
ls -la .hodge/lessons/ | grep -i "{{feature-keyword}}"
```

**Enhancement**: CLI-driven matching with AI synthesis

**CLI Capability**:
```bash
hodge lessons --match "subprocess,command execution" --files "src/commands/build.ts"

# Returns structured data:
{
  "lessons": [
    {
      "feature": "HODGE-319.1",
      "title": "Test Isolation - Subprocess Spawning Ban",
      "excerpt": "Tests must NEVER spawn subprocesses...",
      "confidence": "high",
      "severity": "critical",
      "relevance": "Your changes modify src/commands/build.ts which executes commands"
    }
  ]
}
```

**CLI Matching Algorithm**:
1. Grep lesson files for keywords (primary signal)
2. Parse lesson metadata (tags, related features, severity)
3. Check file path overlap (lesson files vs. changed files)
4. Calculate confidence score (high/medium/low)
5. Return ranked list with excerpts

**AI Synthesis**:
- Decides which lessons are actually relevant
- Crafts natural contextual tip referencing specific HODGE-XXX
- Determines presentation style based on confidence+severity

### Contextual Tips UX Design

**Decision**: Context-sensitive hybrid (proactive/reactive/inline)

**Proactive (Choice Prompt)** - Use when high confidence + critical severity:
```markdown
🔔 YOUR RESPONSE NEEDED

💡 Pattern from HODGE-319.1: I notice your changes modify command
execution code. That feature had zombie process issues from subprocess
spawning.

Should I check for potential subprocess issues before continuing?

a) ⭐ Yes, check now (30s) (Recommended)
b) Skip, I know it's safe
c) Tell me more about the pattern

👉 Your choice [a/b/c]:
```

**Reactive (Callout Box)** - Use when medium confidence or warning severity:
```markdown
┌─────────────────────────────────────────────────────────┐
│ 💡 Relevant Pattern: Test Isolation                    │
├─────────────────────────────────────────────────────────┤
│ Your changes modify command execution code. HODGE-319.1 │
│ fixed zombie processes from subprocess spawning.        │
│                                                          │
│ Consider: Check for execSync() usage in your changes    │
│ Pattern: .hodge/patterns/test-pattern.md               │
└─────────────────────────────────────────────────────────┘
```

**Inline Mention** - Use when low confidence or loosely related:
```markdown
💡 Related: See .hodge/lessons/HODGE-319.1.md for subprocess patterns
```

**Why Hybrid Approach Works**:
- CLI calculates confidence (keyword matching + file analysis)
- Lessons have severity metadata (critical/warning/info)
- Template uses simple conditionals (if high+critical → proactive)
- No complex AI reasoning required
- Scales naturally as lesson corpus grows

### Celebration Design

**Decision**: Only at `/ship` completion, hardcoded thresholds for MVP

**Celebration Moment**:
```markdown
┌─────────────────────────────────────────────────────────┐
│ 🎉 HODGE-346.4 Shipped!                                 │
└─────────────────────────────────────────────────────────┘

Nice work! That's your 3rd ship this week.

📊 Your Momentum:
• 3 features shipped this week
• 12 features shipped this month
• 85% test coverage maintained

🏆 Achievement Unlocked: "Shipping Streak" (3+ in a week)
```

**Hardcoded Thresholds** (for MVP):
- **Ships per week**: 3+ = "Shipping Machine", 5+ = "Unstoppable"
- **Consecutive weeks**: 2+ = "Streak", 4+ = "Velocity Master"
- **Test coverage trends**: +5% month-over-month = "Quality Champion"

**Why Only at /ship**:
- Clear milestone moment (feature complete)
- Avoids alert fatigue (not after every phase)
- Feels earned (significant accomplishment)
- Future: Could add mid-workflow encouragement ("3rd feature hardened this week!")

### Context Awareness Levels

**Basic (Smart Filtering)**: Hide irrelevant commands
- Example: No `/decide` when exploration has "No Decisions Needed"
- Example: No `/harden` if build hasn't started
- Example: No `/build` at end of `/harden` (already built)
- **CLI Support**: `hodge status` already returns next step suggestion
- **Template Logic**: Check feature state, filter "What's Next?" list

**Predictive (Pattern Detection)**: Highlight next logical step
- Example: "You've shipped 3 features this week - harden next?"
- **CLI Support**: `hodge status --stats` includes velocity metrics
- **Template Logic**: If ships_this_week >= 3, suggest continuing momentum

**Adaptive (Proactive Coaching)**: Offer choices before proceeding
- Example: "I see 5 TODOs in exploration - address them first?"
- **CLI Support**: `hodge context --todos` counts TODO comments
- **Template Logic**: If todo_count > 3, prompt user for action

**Key Principle**: CLI provides data (counts, states, patterns), AI decides whether to interrupt flow.

### Scope and Phasing

**Decision**: Progressive implementation within HODGE-346.4 (Option C)

**Phase 1: Infrastructure** (Foundation)
- Add `hodge status --stats` command
- Add `hodge lessons --match` command
- Add `hodge context --todos` command
- Implement hybrid stats calculation (ship-record.json + git log)
- Add lesson metadata (severity, tags) to existing lessons

**Phase 2: Intelligence** (Context Awareness)
- Update all 10 command templates with smart "What's Next?" filtering
- Add basic context awareness (hide irrelevant commands)
- Add predictive suggestions (velocity-based recommendations)
- Add adaptive prompts (TODO detection, pattern warnings)
- Implement progress indicators in /harden, /build, /ship

**Phase 3: Delight** (Celebration & Tips)
- Add celebration display to /ship completion
- Implement achievement thresholds and messaging
- Add contextual tips (proactive/reactive/inline)
- Integrate lesson matching into workflow commands

**Why Progressive**:
- Validate each capability before adding next
- Can stop if scope grows too large
- Learn from implementation and adjust
- Still one cohesive feature (not split across multiple stories)

---

## Implementation Approaches

### Approach 1: Progressive Enhancement with Phased Intelligence ⭐ (Recommended)

**Description**: Layer intelligent behavior on top of existing command templates using new CLI capabilities, building from basic data provision to sophisticated context awareness. Each phase adds capability while remaining deployable independently.

**Phase 1: Infrastructure (CLI Foundation)**

**New CLI Commands**:
```bash
# Stats calculation with hybrid data source
hodge status --stats

# Lesson matching with confidence scoring
hodge lessons --match "keywords" --files "path/to/file.ts"

# TODO detection for adaptive prompts
hodge context --todos
```

**CLI Implementation Details**:

*Stats Command* (status.ts enhancement):
```typescript
// Primary: Scan ship-record.json files
const shipRecords = await scanShipRecords('.hodge/features/*/ship-record.json');

// Fallback: Parse git history for deleted features
const gitShips = await parseGitHistory('--grep="🤖 Generated with"');

// Merge datasets by feature ID
const allShips = mergeByFeatureId(shipRecords, gitShips);

// Calculate time-windowed metrics
return {
  shipsThisWeek: countSince(allShips, 7, 'days'),
  shipsThisMonth: countSince(allShips, 30, 'days'),
  totalShipped: allShips.length,
  streak: calculateConsecutiveWeeks(allShips),
  coverageTrend: calculateCoverageTrend(shipRecords)
};
```

*Lesson Matching* (new lessons.ts command):
```typescript
// 1. Keyword matching
const keywordMatches = await grepLessons(keywords);

// 2. File path overlap
const fileMatches = await matchLessonFiles(changedFiles);

// 3. Calculate confidence score
const confidence = calculateConfidence(keywordMatches, fileMatches);

// 4. Return structured data
return {
  lessons: [...],
  confidence: 'high' | 'medium' | 'low',
  severity: 'critical' | 'warning' | 'info'
};
```

**Lesson Metadata Enhancement**:
Add frontmatter to `.hodge/lessons/*.md`:
```yaml
---
feature: HODGE-319.1
title: Test Isolation - Subprocess Spawning Ban
severity: critical
tags: [testing, subprocess, zombie-processes, test-isolation]
related_files: [src/test/*, src/commands/*.ts]
---
```

**Phase 2: Intelligence (Context Awareness)**

**Smart Command Filtering**:
Update all 10 command templates with conditional "What's Next?" sections:

```markdown
### What's Next?

{{#if no_decisions_needed}}
  Your exploration is complete and all decisions are made! 🎉

  • `/build {{feature}}` - Start building with {{recommended_approach}}
{{else}}
  Based on where you are, here are your logical next steps:

  • `/decide` - You have {{decision_count}} decisions to make
  • `/build {{feature}}` - Start building (decisions can be made later)
{{/if}}
```

**Predictive Suggestions**:
```markdown
{{#if ships_this_week >= 3}}
  I notice you've shipped {{ships_this_week}} features this week - you're on a roll! 🚀

  • `/harden {{feature}}` - Keep the momentum (Suggested next based on your workflow)
{{else}}
  • `/harden {{feature}}` - Run quality checks
{{/if}}
```

**Adaptive Prompts**:
```markdown
{{#if todo_count >= 5}}
  🔔 YOUR RESPONSE NEEDED

  ⚡ Quick note: I see {{todo_count}} TODOs in your exploration notes. Want to address them before deciding?

  a) ⭐ Yes, let's review TODOs first (Recommended)
  b) No, proceed to `/decide` anyway
  c) Show me the TODOs so I can pick

  👉 Your choice [a/b/c]:
{{/if}}
```

**Progress Indicators**:
Add to `/harden`, `/build`, `/ship` templates:

```markdown
────────────────────────────────────────────────────────────
📍 Step {{current_step}} of {{total_steps}}: {{step_name}}
────────────────────────────────────────────────────────────

{{#if completed_steps.length > 0}}
Previously completed:
{{#each completed_steps}}
  ✓ {{name}} {{#if duration}}({{duration}}){{/if}}
{{/each}}
{{/if}}

{{#if remaining_steps.length > 0}}
Remaining:
{{#each remaining_steps}}
  ○ {{name}}
{{/each}}
{{/if}}
```

**Phase 3: Delight (Celebration & Tips)**

**Celebration at Ship**:
Add to `/ship` template after successful ship:

```markdown
┌─────────────────────────────────────────────────────────┐
│ 🎉 {{feature}} Shipped!                                 │
└─────────────────────────────────────────────────────────┘

{{celebration_message}}

📊 Your Momentum:
• {{ships_this_week}} features shipped this week
• {{ships_this_month}} features shipped this month
• {{test_coverage}}% test coverage maintained

{{#if achievement_unlocked}}
🏆 Achievement Unlocked: "{{achievement_name}}" ({{achievement_description}})
{{/if}}
```

**Achievement Logic** (template conditionals):
```markdown
{{#if ships_this_week >= 5}}
  {{set achievement_unlocked = true}}
  {{set achievement_name = "Unstoppable"}}
  {{set achievement_description = "5+ features in one week"}}
{{else if ships_this_week >= 3}}
  {{set achievement_unlocked = true}}
  {{set achievement_name = "Shipping Machine"}}
  {{set achievement_description = "3+ features in one week"}}
{{else if streak >= 4}}
  {{set achievement_unlocked = true}}
  {{set achievement_name = "Velocity Master"}}
  {{set achievement_description = "4+ consecutive weeks shipping"}}
{{/if}}
```

**Contextual Tips** (context-sensitive hybrid):
Add to workflow commands (`/build`, `/harden`, `/ship`):

```markdown
{{#if lesson.confidence === "high" AND lesson.severity === "critical"}}
  🔔 YOUR RESPONSE NEEDED

  💡 Pattern from {{lesson.feature}}: {{lesson.relevance}}

  Should I check for {{lesson.title}}?

  a) ⭐ Yes, check now ({{estimated_time}}) (Recommended)
  b) Skip, I know it's safe
  c) Tell me more about the pattern

  👉 Your choice [a/b/c]:
{{else if lesson.confidence === "medium" OR lesson.severity === "warning"}}
  ┌─────────────────────────────────────────────────────────┐
  │ 💡 Relevant Pattern: {{lesson.title}}                  │
  ├─────────────────────────────────────────────────────────┤
  │ {{lesson.excerpt}}                                      │
  │                                                          │
  │ Consider: {{lesson.suggestion}}                         │
  │ Pattern: .hodge/lessons/{{lesson.feature}}.md          │
  └─────────────────────────────────────────────────────────┘
{{else if lesson.confidence === "low"}}
  💡 Related: See .hodge/lessons/{{lesson.feature}}.md for {{lesson.topic}}
{{/if}}
```

**Pros**:
- **Phased implementation reduces risk** - each phase independently testable
- **CLI-driven data** maintains separation of concerns
- **Template-driven presentation** keeps AI layer simple
- **Backward compatible** - templates degrade gracefully if CLI commands unavailable
- **Scales naturally** - adding new context sources just means new CLI flags
- **Testable** - CLI logic unit testable, template logic smoke testable
- **Follows parent vision** - implements all intelligence features from HODGE-346
- **Builds on sibling work** - uses visual patterns from 346.2 and choice formatting from 346.3
- **Progressive deployment** - can ship Phase 1 before Phase 2 complete
- **User control** - celebration and tips enhance but don't block workflow

**Cons**:
- **Requires CLI enhancements** - new commands and flags add surface area
- **Template complexity grows** - conditionals make templates harder to read
- **Stats calculation overhead** - git log parsing could be slow on large repos
- **Lesson metadata maintenance** - requires discipline to tag lessons consistently
- **Achievement calibration** - hardcoded thresholds may not fit all teams
- **Three-phase rollout** - takes time to see full UX vision
- **Lesson matching accuracy** - keyword-based approach may have false positives
- **Progress indicator maintenance** - must update if workflow steps change

**When to use**: This approach is ideal when you want to systematically add intelligence to slash commands while maintaining clean architecture. Best for implementing the full parent exploration vision (context awareness, celebration, tips) in a safe, incremental way. Perfect for validating each capability before building the next layer.

---

### Approach 2: Minimal Context Awareness Only

**Description**: Focus solely on basic context awareness (smart filtering of "What's Next?" commands) without progress indicators, celebration, or contextual tips. Ships fastest with smallest change surface.

**Implementation Strategy**:

**Single Phase**:
1. Add basic `hodge status` enhancement to return feature state flags
2. Update all 10 command templates with conditional "What's Next?" filtering
3. Hide irrelevant commands based on workflow position
4. Skip progress indicators, celebration, stats, lessons entirely

**Example CLI Output**:
```bash
hodge status HODGE-346.4

# Returns:
Progress: Build
Has Decisions: false
Next Valid Commands: [harden, review]
```

**Example Template Update** (all 10 commands):
```markdown
### What's Next?

{{#if next_valid_commands.includes('decide')}}
  • `/decide` - Make architectural decisions
{{/if}}

{{#if next_valid_commands.includes('build')}}
  • `/build {{feature}}` - Begin implementation
{{/if}}

{{#if next_valid_commands.includes('harden')}}
  • `/harden {{feature}}` - Run quality checks
{{/if}}

{{#if next_valid_commands.includes('ship')}}
  • `/ship {{feature}}` - Create production release
{{/if}}
```

**Pros**:
- **Fastest to implement** - minimal CLI changes, simple template conditionals
- **Low complexity** - no stats calculation, lesson matching, or celebration logic
- **Still provides value** - eliminates irrelevant command suggestions
- **Easy to test** - straightforward state-based filtering
- **No maintenance burden** - no lesson metadata or achievement calibration needed

**Cons**:
- **Misses parent vision** - HODGE-346 explicitly called for intelligence, celebration, tips
- **No delight features** - transactional feel remains
- **No progress indicators** - multi-step workflows still disorienting
- **No learning from past** - doesn't surface lessons from previous features
- **Incomplete UX system** - only addresses one pain point from parent exploration
- **Will need follow-up work** - other features inevitably requested later

**When to use**: This approach should NOT be used for HODGE-346.4. It only addresses smart filtering, leaving celebration, progress, and tips for future stories. Given our conversation established all four focus areas (context awareness, celebration, info density, tips), this minimal approach doesn't fulfill the feature scope.

---

### Approach 3: AI-Driven Dynamic Behavior

**Description**: Push intelligence entirely into the AI layer rather than CLI commands. Templates provide high-level guidance, AI dynamically generates context-aware content, celebration messages, and tips based on natural language understanding of project state.

**Implementation Strategy**:

**Template Layer (minimal guidance)**:
```markdown
### What's Next?

Analyze the project state and suggest the most relevant next commands. Consider:
- Feature workflow position (explore → decide → build → harden → ship)
- Whether decisions are needed (check exploration.md)
- User's recent velocity (check ship-record.json timestamps)
- Relevant patterns from past features (scan .hodge/lessons/)

Present as bulleted list with context-aware descriptions.
```

**AI Layer (maximal intelligence)**:
- AI reads `.hodge/features/{{feature}}/explore/exploration.md` to check for decisions
- AI scans `.hodge/features/*/ship-record.json` to calculate velocity
- AI greps `.hodge/lessons/` for relevant patterns based on feature description
- AI generates celebration messages dynamically based on achievements
- AI formats progress indicators based on conversation flow
- AI decides when to interrupt with tips vs. mention inline

**Example AI Behavior**:
```markdown
### What's Next?

I see you've completed exploration with no decisions needed - nice and clean!
You've been on a roll lately (3 ships this week 🔥), so let's keep the momentum
going.

• `/build HODGE-346.4` - Start implementing with the recommended approach
• `/status` - Check overall project health

By the way, I noticed your changes will touch command execution code. We had
some zombie process issues in HODGE-319.1 - want me to check for subprocess
patterns before we start building?
```

**Pros**:
- **Most flexible** - AI can adapt to any situation
- **Natural language flow** - feels like talking to a colleague
- **No rigid structure** - AI discovers relevant context organically
- **Easy to "upgrade"** - improve AI prompts without template changes
- **Handles edge cases** - AI figures out what to do in unusual situations

**Cons**:
- **Inconsistent output** - same command could behave differently each time
- **Not enforceable** - review profiles can't validate emergent behavior
- **Hard to test** - no deterministic structure to verify
- **Violates parent vision** - HODGE-346 specifically wanted consistent patterns
- **Unpredictable UX** - users can't rely on consistent command behavior
- **CLI/AI separation violated** - AI directly reading `.hodge/` structure
- **Regression prone** - AI behavior changes could break workflows silently
- **Performance issues** - AI reading multiple files every command is slow
- **No caching** - must recalculate everything each invocation

**When to use**: This approach should NOT be used. It directly contradicts the parent exploration's goal of establishing consistent, predictable patterns and violates the CLI/AI separation of concerns principle we validated in Q1. While AI flexibility is valuable for conversational flow, structural elements (filtering, stats, lesson matching) need deterministic CLI support.

---

## Recommendation

**Approach 1: Progressive Enhancement with Phased Intelligence** is strongly recommended.

**Rationale**:

1. **Completes Parent Vision**: HODGE-346 explicitly identified context awareness, celebration, progress indicators, and contextual tips as core UX gaps. This approach systematically addresses all four areas.

2. **Maintains Architectural Integrity**: CLI provides data (separation of concerns validated in Q1), templates apply presentation logic, AI synthesizes natural language. Clean boundaries.

3. **Phased Risk Mitigation**: Three-phase rollout allows validation at each stage. Can deploy Phase 1 (infrastructure) before Phase 2 (intelligence) is complete. Reduces deployment risk.

4. **Builds on Sibling Success**: HODGE-346.2 established visual framing, 346.3 standardized choice formatting. This story completes the intelligent behavior layer using those visual patterns.

5. **Hybrid Stats Approach**: Balances performance (ship-record.json primary) with robustness (git log fallback). Addresses cleanup concern from Q2.

6. **Context-Sensitive Tips**: High-confidence+critical patterns interrupt (proactive), medium-confidence patterns display in callout boxes (reactive), low-confidence mentions inline. Balances awareness with flow.

7. **Testable Implementation**: CLI commands unit testable, lesson matching verifiable, template conditionals smoke testable. Review profiles can enforce pattern compliance.

8. **Hardcoded Thresholds for MVP**: Celebration milestones (3+ ships/week, 5+ for "Unstoppable") provide immediate value. Can make configurable later based on feedback.

9. **Template-Driven Progress**: Progress indicators ("📍 Step 3 of 7") are conversational guideposts, not CLI state tracking. Keeps CLI stateless, allows AI flexibility.

10. **All 10 Commands Enhanced**: Smart filtering applies across all commands (e.g., don't suggest `/harden` if not built, don't suggest `/decide` if no decisions), creating consistent intelligent behavior throughout workflow.

---

## Test Intentions

These behavioral expectations define success for the intelligent context system:

1. **Stats Calculation Accuracy**: When `hodge status --stats` is called, it returns accurate ship counts for this week, this month, total shipped, and consecutive week streaks

2. **Hybrid Data Source**: When ship-record.json files exist, stats use them as primary source; when user has deleted feature directories, stats fall back to git log parsing

3. **Smart Command Filtering**: When feature has no decisions needed (exploration.md contains "No Decisions Needed"), "What's Next?" section does not suggest `/decide`

4. **Workflow Position Awareness**: When feature is in build phase (build directory exists, harden does not), "What's Next?" suggests `/harden` and not `/explore` or `/decide`

5. **Progress Indicator Display**: When `/harden` reaches step 3, template displays visual box showing "📍 Step 3 of 7" with completed steps marked ✓ and remaining steps marked ○

6. **Progress Indicator Accuracy**: When AI completes step 2 of `/harden`, next progress indicator shows step 2 with ✓ (completed) and step 3 as current position

7. **Celebration Display**: When user ships a feature and `hodge status --stats` returns ships_this_week >= 3, `/ship` completion displays celebration box with stats and "Shipping Machine" achievement

8. **Achievement Thresholds**: When ships_this_week >= 5, achievement is "Unstoppable"; when ships_this_week >= 3, achievement is "Shipping Machine"; when streak >= 4, achievement is "Velocity Master"

9. **No Premature Celebration**: When user completes `/harden` (not `/ship`), no celebration display appears (celebration only at ship completion)

10. **Lesson Matching Confidence**: When `hodge lessons --match` finds keyword match + file path overlap, confidence is "high"; when only keyword match, confidence is "medium"; when loosely related, confidence is "low"

11. **Contextual Tip Display - Proactive**: When lesson has confidence="high" AND severity="critical", template displays choice prompt (🔔 YOUR RESPONSE NEEDED) with options to check pattern

12. **Contextual Tip Display - Reactive**: When lesson has confidence="medium" OR severity="warning", template displays callout box (┌─────┐) with pattern summary and suggestion

13. **Contextual Tip Display - Inline**: When lesson has confidence="low", template displays inline mention (💡 Related: See .hodge/lessons/...)

14. **Predictive Suggestions**: When `hodge status --stats` returns ships_this_week >= 3, "What's Next?" includes momentum context ("you're on a roll! 🚀") and suggests continuing

15. **Adaptive Prompts**: When `hodge context --todos` returns count >= 5, template displays choice prompt asking whether to address TODOs before proceeding

16. **CLI Data Provision**: When AI needs project state, template calls appropriate hodge CLI command (status, context, lessons) rather than directly reading .hodge/ files

---

## Decisions Decided During Exploration

All design decisions were resolved during the conversational exploration phase:

1. ✓ **State Access Pattern**: CLI provides data, AI applies intelligence and presentation (separation of concerns)

2. ✓ **Stats Data Source**: Hybrid approach with ship-record.json as primary source and git log as fallback for robustness

3. ✓ **Progress Indicator Style**: Visual box format (Option 2) with completed/remaining steps list

4. ✓ **Progress Indicator Mechanism**: Template-driven based on conversation state, not CLI state tracking

5. ✓ **Lesson Matching Strategy**: Enhanced CLI command with keyword/file matching, confidence scoring, AI synthesis

6. ✓ **Contextual Tip Style**: Context-sensitive hybrid (proactive for high+critical, reactive for medium, inline for low)

7. ✓ **Implementation Scope**: Progressive phases within single story (not split across multiple features)

8. ✓ **Celebration Timing**: Only at `/ship` completion (not at intermediate milestones)

9. ✓ **Celebration Thresholds**: Hardcoded for MVP (3+ ships = "Shipping Machine", 5+ = "Unstoppable", 4+ weeks = "Velocity Master")

10. ✓ **Context Filtering Scope**: Applies to all 10 slash commands (smart "What's Next?" filtering everywhere)

11. ✓ **Progress Indicator Commands**: `/harden` (7 steps), `/build` (multiple stages), `/ship` (commit/validation/PM)

12. ✓ **Stats Display**: Ships this week/month, total shipped, consecutive week streaks, test coverage trend

13. ✓ **Adaptive Prompt Triggers**: TODO count >= 5 prompts user before deciding, subprocess pattern detected prompts before building

14. ✓ **Lesson Metadata**: Add severity (critical/warning/info) and tags to lesson frontmatter for matching

15. ✓ **Achievement Persistence**: Purely presentational (no tracking of "already shown" achievements)

---

## No Decisions Needed

All questions were successfully resolved during the exploration conversation. The feature is ready to proceed to `/build` phase.

---

## Next Steps

This exploration is complete with a clear recommendation and all decisions made. Ready to proceed to implementation.

**Build Phase Requirements**:
1. Add CLI commands: `hodge status --stats`, `hodge lessons --match`, `hodge context --todos`
2. Implement hybrid stats calculation (ship-record.json + git log)
3. Create lesson matching algorithm with confidence scoring
4. Add lesson metadata (severity, tags) to existing lessons
5. Update all 10 command templates with smart "What's Next?" filtering
6. Add progress indicators to `/harden`, `/build`, `/ship` templates
7. Add celebration display to `/ship` completion
8. Implement contextual tips (proactive/reactive/inline) in workflow commands
9. Create smoke tests for each CLI command and template enhancement
10. Verify all patterns work correctly during harden phase
