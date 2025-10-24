# Build Plan: HODGE-346.4 Phase 2 - Template Intelligence

## Phase Overview
**Feature**: HODGE-346.4 (Smart Context Awareness)
**Phase**: 2 of 3 - Template Intelligence
**Status**: In Progress
**Parent**: HODGE-346 (Unified UX System)
**Prerequisite**: Phase 1 (CLI Infrastructure) - ✅ Complete

## Phase 2 Scope

Phase 2 implements intelligent behavior in slash command templates using the CLI infrastructure built in Phase 1. This phase adds:

1. **Smart Command Filtering** - Context-aware "What's Next?" sections
2. **Progress Indicators** - Visual "you are here" markers in multi-step workflows
3. **Predictive Suggestions** - Velocity-based momentum messages
4. **Adaptive Prompts** - Proactive coaching based on TODO detection

## Implementation Strategy

### 2.1 Smart Command Filtering (All 10 Commands)

**Objective**: Add conditional "What's Next?" sections based on feature state

**Files to Modify**:
- `.claude/commands/explore.md`
- `.claude/commands/decide.md`
- `.claude/commands/build.md`
- `.claude/commands/harden.md`
- `.claude/commands/ship.md`
- `.claude/commands/review.md`
- `.claude/commands/plan.md`
- `.claude/commands/codify.md`
- `.claude/commands/hodge.md`
- `.claude/commands/status.md`

**Implementation Pattern**:

Each command's "What's Next?" section should:
1. Call `hodge status {{feature}}` to get current state
2. Check feature workflow position (explore/decide/build/harden/ship)
3. Filter suggestions based on state (hide irrelevant commands)
4. Present only applicable next steps

**Example** (from /explore):
```markdown
### What's Next?

After exploration, run `hodge status {{feature}}` to check your feature state.

Based on the status output:
- If "No Decisions Needed": Recommend `/build {{feature}}` directly
- If decisions exist: Recommend `/decide` first, then `/build {{feature}}`

Always available:
- `/status {{feature}}` - Check progress and next steps
- `/hodge {{feature}}` - Load context for continued work
```

**Implementation Checklist**:
- [ ] Update /explore template with smart filtering
- [ ] Update /decide template with smart filtering
- [ ] Update /build template with smart filtering
- [ ] Update /harden template with smart filtering
- [ ] Update /ship template with smart filtering
- [ ] Update /review template with smart filtering
- [ ] Update /plan template with smart filtering
- [ ] Update /codify template with smart filtering
- [ ] Update /hodge template with smart filtering
- [ ] Update /status template with smart filtering
- [ ] Run `npm run sync:commands` to regenerate claude-commands.ts
- [ ] Test filtering logic in workflow (explore → build → harden flow)

---

### 2.2 Progress Indicators (/harden, /build, /ship)

**Objective**: Add template-driven progress indicators showing "you are here"

**Files to Modify**:
- `.claude/commands/harden.md`
- `.claude/commands/build.md`
- `.claude/commands/ship.md`

**Progress Indicator Pattern**:
```markdown
────────────────────────────────────────────────────────────
📍 Step {{current_step}} of {{total_steps}}: {{step_name}}
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

**Technical Note**: Progress indicators are AI-generated based on conversation state, not CLI state. AI tracks what steps have been completed and generates the visual box accordingly.

**Commands to Update**:

1. **/harden** (7 steps):
   - Step 1: Stage changes and run auto-fix
   - Step 2: Generate review manifest
   - Step 3: Choose review tier
   - Step 4: Load context files
   - Step 5: Conduct AI review
   - Step 6: Assess findings
   - Step 7: Update PM system

2. **/build** (multiple stages):
   - Stage 1: Review build plan
   - Stage 2: Implement core logic
   - Stage 3: Add error handling
   - Stage 4: Write smoke tests
   - Stage 5: Update build plan
   - Stage 6: Stage all work

3. **/ship** (4 steps):
   - Step 1: Create commit
   - Step 2: Run validation checks
   - Step 3: Update PM issue
   - Step 4: Mark as shipped

**Implementation Checklist**:
- [ ] Update /harden template with progress indicators (7 steps)
- [ ] Update /build template with progress indicators (6 stages)
- [ ] Update /ship template with progress indicators (4 steps)
- [ ] Document progress indicator pattern in each template
- [ ] Add AI instructions for tracking conversation state
- [ ] Run `npm run sync:commands` to regenerate
- [ ] Test progress indicators in full workflow

---

### 2.3 Predictive Suggestions

**Objective**: Add velocity-based momentum suggestions

**Files to Modify**:
- All command templates (add stats check where appropriate)

**Implementation Pattern**:

Add to workflow commands (build, harden, ship):
```markdown
## Velocity Context (Optional)

Call stats to check momentum:
```bash
hodge status --stats
```

If `ships_this_week >= 3`, add momentum message:
```
💡 I notice you've shipped {{ships_this_week}} features this week - you're on a roll! 🚀
```

If `streak >= 3`, add streak context:
```
🔥 Shipping streak: {{streak}} consecutive weeks! Keep it going!
```
```

**Implementation Checklist**:
- [ ] Add stats check to /build template
- [ ] Add stats check to /harden template
- [ ] Add stats check to /ship template
- [ ] Document conditional logic for AI
- [ ] Add momentum thresholds (3+ ships, 3+ streak)
- [ ] Run `npm run sync:commands`
- [ ] Test predictive suggestions with mock stats

---

### 2.4 Adaptive Prompts

**Objective**: Add proactive coaching based on TODO detection

**Files to Modify**:
- `.claude/commands/decide.md`
- `.claude/commands/build.md`

**Implementation Pattern**:

Add to /decide and /build templates:
```markdown
## TODO Check (Before Proceeding)

Check for unresolved TODOs:
```bash
hodge context --todos
```

If TODO count >= 5, present choice:
```
🔔 YOUR RESPONSE NEEDED

⚡ Quick note: I see {{todo_count}} TODOs in your exploration notes. Want to address them before {{current_action}}?

a) ⭐ Yes, let's review TODOs first (Recommended)
b) No, proceed anyway
c) Show me the TODOs so I can pick

💡 Tip: You can modify any choice, e.g., "a, and also check for similar patterns"

👉 Your choice [a/b/c]:
```
```

**Implementation Checklist**:
- [ ] Update /decide template with TODO check
- [ ] Update /build template with TODO check
- [ ] Add conditional logic (only show if count >= 5)
- [ ] Document choice handling for AI
- [ ] Run `npm run sync:commands`
- [ ] Test adaptive prompts with high TODO count

---

## Testing Strategy

### Smoke Tests (Required)

**File**: `src/lib/claude-commands.smoke.test.ts` (extend existing)

**Tests to Add**:
- [ ] Smart filtering pattern presence in all 10 commands
- [ ] Progress indicator pattern presence in /harden, /build, /ship
- [ ] Stats check pattern presence in workflow commands
- [ ] TODO check pattern presence in /decide, /build
- [ ] Visual pattern compliance (box headers, indicators)

**New Test File**: `.claude/commands/smart-filtering.smoke.test.ts`

**Tests to Add**:
- [ ] Each command has "What's Next?" section
- [ ] Status command is called for state checking
- [ ] Conditional logic documented for AI
- [ ] Fallback to full list when state unknown

---

## Files Modified

### Templates (10 files)
- `.claude/commands/explore.md` - Smart filtering
- `.claude/commands/decide.md` - Smart filtering, adaptive prompts
- `.claude/commands/build.md` - Smart filtering, progress indicators, adaptive prompts
- `.claude/commands/harden.md` - Smart filtering, progress indicators
- `.claude/commands/ship.md` - Smart filtering, progress indicators
- `.claude/commands/review.md` - Smart filtering
- `.claude/commands/plan.md` - Smart filtering
- `.claude/commands/codify.md` - Smart filtering
- `.claude/commands/hodge.md` - Smart filtering
- `.claude/commands/status.md` - Smart filtering

### Generated (1 file)
- `src/lib/claude-commands.ts` - Auto-generated from templates (run `npm run sync:commands`)

### Tests (2 files)
- `src/lib/claude-commands.smoke.test.ts` - Extend with Phase 2 tests
- `.claude/commands/smart-filtering.smoke.test.ts` - NEW: Smart filtering compliance

---

## Implementation Decisions

### Decision 1: Template-Driven Intelligence
**Reasoning**: Templates contain guidance for AI to check state and conditionally present options. This keeps CLI stateless and simple, while AI applies natural language intelligence.

### Decision 2: No CLI State Tracking for Progress
**Reasoning**: Progress indicators are conversational guideposts based on AI's tracking of conversation flow, not CLI state. This allows flexibility and doesn't require CLI to maintain workflow state.

### Decision 3: Graceful Degradation
**Reasoning**: All smart features degrade gracefully if CLI commands are unavailable. Templates can fall back to showing all options if state can't be determined.

### Decision 4: AI Instructions in Comments
**Reasoning**: Templates include HTML comments with conditional logic instructions for AI. This documents the intelligence layer without cluttering user-visible output.

---

## Edge Cases to Consider

1. **Status command fails**: Fall back to showing all "What's Next?" options
2. **Stats unavailable**: Skip momentum messages gracefully
3. **TODO detection fails**: Skip adaptive prompts (don't block workflow)
4. **Progress indicator state mismatch**: AI self-corrects based on conversation history
5. **Multiple recommendations in exploration**: Template handles selection gracefully

---

## Success Criteria

**Phase 2 Complete** when:
- [ ] All 10 command templates updated with smart filtering
- [ ] Progress indicators present in /harden, /build, /ship
- [ ] Predictive suggestions added to workflow commands
- [ ] Adaptive prompts added to /decide, /build
- [ ] All smoke tests passing
- [ ] `npm run sync:commands` generates updated claude-commands.ts
- [ ] Zero TypeScript errors
- [ ] Zero ESLint BLOCKER errors
- [ ] Manual testing confirms intelligent behavior works
- [ ] All changes staged with `git add .`

**Ready for Phase 3** when Phase 2 success criteria met.

---

## Next Steps After Phase 2

1. **Run Tests**: `npm test` (all tests should pass)
2. **Run Sync**: `npm run sync:commands` (regenerate claude-commands.ts)
3. **Manual Testing**:
   - Test smart filtering in /explore → /build → /harden flow
   - Test progress indicators in /harden workflow
   - Test predictive suggestions with mock stats
   - Test adaptive prompts with high TODO count
4. **Stage Changes**: `git add .` (required for /harden review)
5. **Proceed to Harden**: `/harden HODGE-346.4` for Phase 2 validation
6. **Then Phase 3**: Celebration and contextual tips

---

*Phase 2 started: 2025-10-24*
*Focus: Template intelligence and smart behavior*
