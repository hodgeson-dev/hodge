# Exploration: HODGE-319.3

**Title**: Smart Decision Extraction for /build - Graceful Skip-Decide Workflow

## Problem Statement

When users skip `/decide` and go straight to `/build`, the command only warns about missing decisions instead of extracting available guidance from `exploration.md`. This creates friction and forces manual steps that could be automated. Currently, users see:

```
⚠️  No decision recorded for this feature.
   Review exploration and make a decision first.
   Or use --skip-checks to proceed anyway.
```

This is unhelpful because the `exploration.md` file often contains a **Recommendation** section with the chosen approach and a **Decisions Needed** section with context. The `/plan` command already implements smart cascading extraction (feature decisions → exploration → global), but `/build` doesn't leverage this pattern.

## Conversation Summary

### Architecture Understanding
The critical insight: `/build` is split between slash command template (`.claude/commands/build.md`) and CLI (`build.ts`). The CLI currently just outputs warnings and proceeds - it doesn't block or prompt. This means **all smart extraction logic belongs in the template**, not the CLI.

### Current Build Flow Analysis
Looking at `build.ts:120-124`, when `decisions.md` is missing:
- CLI warns about no decision
- CLI suggests using `--skip-checks`
- CLI continues anyway (non-blocking)

The `/build` template (`.claude/commands/build.md`) doesn't attempt to extract guidance from `exploration.md` - it just calls the CLI command directly.

### Proven Pattern from /plan
The `/plan` command implements cascading extraction (`plan.ts:124-138`):
1. Check `features/{feature}/decisions.md`
2. Extract from `exploration.md` (Recommendation + Decisions Needed)
3. Fallback to global `decisions.md`

Extraction logic uses regex:
- Recommendation: `## Recommendation\s*\n\n\*\*(.+?)\*\*`
- Decisions Needed: `### Decision \d+: (.+)` headers

HODGE-315 already applies this pattern to improve `/plan` - we should replicate it for `/build`.

### Edge Cases Identified

**1. Multiple Recommendations**
If `exploration.md` contains multiple recommendations (one per approach), prompt user to:
- Approve all of them (if they're complementary)
- Pick one (if they're alternatives)

**2. Malformed Content**
- If Recommendation section is parseable but messy → use it anyway
- If completely empty → suggest `/decide` process
- If partially malformed → extract what's useable

**3. Wrong Location decisions.md**
If user manually created `decisions.md` in wrong location (e.g., `explore/decisions.md`):
- Detect it
- Offer to move to correct location (`features/{feature}/decisions.md`)
- Reformat properly if needed

**4. Uncovered Decisions**
Check if Decisions Needed items are addressed by Recommendation:
- If some decisions are uncovered → prompt user to go through `/decide`
- If all covered → proceed with confidence

**5. Extraction Scope**
Extract BOTH:
- **Recommendation** (the chosen approach)
- **Decisions Needed** (all individual decisions for context)

This gives AI complete context to understand both the approach AND constraints.

### Implementation Scope

**Template-Only Change** ✅
- Update `.claude/commands/build.md` only
- Add extraction logic before PM check
- No changes to `build.ts` CLI code

**Why No CLI Changes?**
- CLI already non-blocking (warns and continues)
- All user prompting happens in slash command template
- AI handles extraction, formatting, and interaction
- CLI just reads files and outputs - no decision logic needed

**Integration Point**
Decision extraction happens **before PM check** because:
- Decisions may exist in PM issue description
- We want to leverage that context
- PM creation might reference these decisions

### Test Complexity
Integration tests need to cover:
1. Standard flow: decisions.md exists → proceed normally
2. Skip flow: no decisions.md → extract from exploration.md
3. Empty Recommendation → suggest /decide
4. Multiple recommendations → prompt for selection
5. Malformed content → graceful degradation
6. Wrong location → offer to move
7. Uncovered decisions → detect and prompt
8. Complete skip → fallback to current warning

## Implementation Approaches

### Approach 1: Full AI Extraction in Template (RECOMMENDED)

**Description**: Add smart extraction logic to `.claude/commands/build.md` that reads `exploration.md`, extracts Recommendation + Decisions Needed, and presents options to user - all before calling `hodge build` CLI command.

**Implementation**:
```markdown
## Decision Extraction (Before Build)

### Step 1: Check for decisions.md
```bash
cat .hodge/features/{{feature}}/decisions.md 2>/dev/null
```

If found → proceed to PM check
If not found → continue to Step 2

### Step 2: Extract from exploration.md
```bash
cat .hodge/features/{{feature}}/explore/exploration.md
```

Parse the content for:
- **Recommendation section**: Extract the chosen approach
- **Decisions Needed section**: Extract all decision titles

### Step 3: Present Options to User
If Recommendation found:
```
I found this recommendation from exploration:

   [Recommendation text]

Decisions to consider:
   1. [Decision 1 title]
   2. [Decision 2 title]
   ...

What would you like to do?
  a) ✅ Use this recommendation and proceed with /build
  b) 🔄 Go to /decide to formalize decisions first
  c) ⏭️  Skip and build without guidance

Your choice:
```

If no Recommendation:
```
No decisions.md found and exploration.md has no recommendation.

Please either:
  a) Run /decide to make decisions
  b) Use --skip-checks to build anyway
```

### Step 4: Handle User Response
- Choice (a) → Call `hodge build {{feature}}` with guidance context
- Choice (b) → Exit and suggest `hodge decide`
- Choice (c) → Call `hodge build {{feature}} --skip-checks`
```

**Pros**:
- Zero CLI changes - template-only enhancement
- Reuses proven extraction pattern from `/plan`
- AI handles all complexity (parsing, prompting, flow control)
- Non-breaking - existing workflows unaffected
- Fast to implement - just template updates

**Cons**:
- Template gets longer (but still manageable)
- Extraction logic duplicated from `/plan` (could extract to shared pattern doc)
- Relies on consistent exploration.md format

**When to use**: When you want quick delivery with zero risk to CLI code

---

### Approach 2: CLI Extraction with Template Prompting

**Description**: Add extraction logic to `build.ts` that reads `exploration.md` and outputs structured data, then template interprets and prompts user.

**Implementation**:
- Modify `build.ts` to add `extractExplorationGuidance()` method
- Output JSON with Recommendation + Decisions Needed
- Template reads JSON and prompts user

**Pros**:
- Single source of truth for extraction logic
- Reusable across commands
- Cleaner template (just prompt, no parsing)
- Better testability (unit tests for CLI extraction)

**Cons**:
- Requires CLI code changes (build.ts modification)
- More implementation effort
- Risk of breaking existing build behavior
- Need to maintain backward compatibility

**When to use**: When planning to extract this to shared library (Phase 3 - WorkflowDataExtractor)

---

### Approach 3: Defer to Phase 3 (WorkflowDataExtractor)

**Description**: Skip this enhancement now, wait for Phase 3 when WorkflowDataExtractor library is built, then apply to `/build`.

**Implementation**:
- Mark HODGE-319.3 as blocked by HODGE-319.4
- Implement WorkflowDataExtractor first (Phase 3)
- Then apply to `/build` using shared library

**Pros**:
- No duplication - use shared library from start
- Consistent pattern across all commands
- Better long-term maintainability

**Cons**:
- Users wait longer for improvement
- Dependencies create blocking (can't parallelize)
- Phase 3 might be delayed or descoped
- Lost opportunity for learning (Phase 2 should inform Phase 3)

**When to use**: When strict adherence to sequential phases is required

## Recommendation

**Use Approach 1: Full AI Extraction in Template**

**Rationale**:
1. **Fast delivery**: Template-only change ships in days, not weeks
2. **Zero risk**: No CLI code modifications = no breaking changes
3. **Learning opportunity**: Implementing this informs Phase 3 WorkflowDataExtractor design
4. **Proven pattern**: `/plan` already does this successfully (plan.ts:164-198)
5. **User value**: Immediate UX improvement for skip-decide workflow
6. **Natural progression**: Phase 2 (UX) before Phase 3 (Standardization) makes sense

**Phase 3 Refactor Path**:
When WorkflowDataExtractor is built (HODGE-319.4), we can:
- Extract shared pattern to library
- Replace template logic with library call
- Keep same user experience, cleaner implementation

**Validation approach**:
- Integration tests verify extraction from exploration.md works
- Edge case tests (malformed, empty, wrong location)
- Manual testing of complete workflow
- No smoke tests needed (template-only, no executable code)

**Success metrics**:
- Users can skip `/decide` and still get intelligent guidance
- No false positives (correct detection of missing decisions)
- Graceful degradation (fallback to warning if extraction fails)
- Complete context preserved (Recommendation + Decisions Needed both extracted)

## Test Intentions

### Core Extraction Behavior
- [ ] When no decisions.md exists, /build should read exploration.md
- [ ] When Recommendation section exists, extract it completely
- [ ] When Decisions Needed section exists, extract all decision titles
- [ ] When both exist, present them together with options
- [ ] When neither exists, fall back to current warning behavior

### User Interaction Flow
- [ ] When Recommendation found, prompt user: use it / go to /decide / skip
- [ ] When user chooses "use it", proceed with hodge build using guidance
- [ ] When user chooses "go to /decide", exit gracefully and suggest command
- [ ] When user chooses "skip", call hodge build --skip-checks
- [ ] All prompts should be clear and actionable

### Edge Cases
- [ ] Handle multiple recommendations: prompt user to pick one or approve all
- [ ] Handle malformed Recommendation: extract what's useable, warn about formatting
- [ ] Handle empty Recommendation but present Decisions Needed: suggest /decide
- [ ] Detect decisions.md in wrong location (explore/decisions.md): offer to move
- [ ] Check if Decisions Needed are covered by Recommendation: warn if gaps exist

### Integration Points
- [ ] Decision extraction happens before PM check (correct order)
- [ ] PM issue description may contain decisions (don't duplicate)
- [ ] All existing /build flows still work (backward compatible)
- [ ] Template stays under 200 lines (maintainability)

### Error Handling
- [ ] Missing exploration.md → fall back to current warning
- [ ] Malformed markdown → graceful degradation, use what's parseable
- [ ] File read errors → clear error message, suggest manual steps
- [ ] User interrupts prompt → exit cleanly without corruption

## Decisions Needed

### Decision 1: Extraction Display Format
**Context**: When showing extracted Recommendation to user, how much detail?

**Options**:
- **a) Verbatim** - Show exact text from exploration.md (1-2 paragraphs)
- **b) Summarized** - AI summarizes to 1-2 sentences
- **c) Title only** - Just show approach name (e.g., "Approach 2: Incremental Optimization")

**Recommendation**: Option (a) - verbatim for complete context, user already wrote it

---

### Decision 2: Multiple Recommendations Handling
**Context**: If exploration.md has multiple Recommendation sections (uncommon but possible)

**Options**:
- **a) Prompt for each** - Show all, ask user to approve each individually
- **b) Prompt to pick one** - Present list, user selects which to use
- **c) Use first only** - Assume first is primary, ignore others

**Recommendation**: Option (b) - pick one, matches "choose an approach" mental model

---

### Decision 3: Wrong-Location File Detection
**Context**: How to detect and handle manually created decisions.md in wrong location

**Options**:
- **a) Auto-move with approval** - Detect, prompt "I found decisions.md in explore/, move it? (y/n)"
- **b) Read from wrong location** - Just use it, don't enforce structure
- **c) Warn and exit** - Tell user to move it manually, then re-run

**Recommendation**: Option (a) - auto-move with approval, helps user do the right thing

---

### Decision 4: Uncovered Decisions Detection
**Context**: Check if Recommendation addresses all Decisions Needed items

**Options**:
- **a) Strict matching** - Parse Recommendation for references to each decision number/title
- **b) Keyword matching** - Check if decision topics appear in Recommendation text
- **c) Skip detection** - Assume Recommendation covers everything, don't verify

**Recommendation**: Option (c) - skip detection, too complex for Phase 2, defer to /decide

---

### Decision 5: Template Integration Point
**Context**: Where exactly in build.md should extraction logic go?

**Options**:
- **a) Before PM check** (line 3) - Extract decisions first, then check PM
- **b) After PM check** (line 45) - Check PM first, then extract decisions
- **c) Replace PM check** - Combine into single "pre-build validation" section

**Recommendation**: Option (a) - before PM check per user guidance (decisions may be in PM)

---

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions (5 decisions above)
- [ ] Proceed to `/build HODGE-319.3` with Approach 1 (Template Enhancement)

---
*Exploration completed: 2025-10-03*
*AI-generated through conversational discovery with user guidance*
