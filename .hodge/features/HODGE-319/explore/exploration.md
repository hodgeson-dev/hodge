# Exploration: HODGE-319

**Title**: Workflow System Optimization: Data Flow, UX, and Solution Quality Improvements

## Problem Statement

The Hodge workflow system has grown organically, resulting in several inefficiencies that affect system performance, user experience, and the quality of solutions generated. Key issues include:

1. **Duplicate and unused files**: HODGE.md aggregates content from other files; context.json files appear unused
2. **User-visible implementation details**: Temp files require user approval via bash commands
3. **Inconsistent graceful degradation**: Commands handle missing prior steps inconsistently
4. **Bug in /build command**: Checks wrong decision file path
5. **Missing smart extraction**: Commands don't extract available data from previous workflow artifacts

These issues emerged from the conversational exploration where we analyzed the complete data flow through /explore → /decide → /plan → /build → /harden → /ship workflows.

## Conversation Summary

### Architecture Understanding
The critical insight from our discussion: **AI (slash commands) handles ALL user interaction; CLI is pure backend**. Users never execute CLI commands directly except `init` and `logs`. This means:
- All prompting must happen in slash command templates
- CLI cannot prompt users (no interactive capability)
- Temp files exist to pass structured data from AI generation to CLI execution

### File Usage Mapping
We mapped what each command reads and writes:
- **/explore**: Reads patterns/lessons/decisions; writes exploration.md, test-intentions.md, context.json, HODGE.md
- **/decide**: Reads exploration.md decisions needed, principles; writes feature or global decisions.md
- **/plan**: Reads decisions cascade (feature → exploration → global), uses temp plan.json; writes development-plan.json
- **/build**: Reads exploration dir, wrong decision path (bug!), standards, patterns; writes build-plan.md, context.json
- **/harden**: Reads git diff, standards; writes harden-report.md, validation-results.json
- **/ship**: Reads git status, harden results; uses temp state.json/ui.md; writes ship-record.json, release-notes.md, lessons

### Key Findings

**Finding 1: HODGE.md is duplicative and unused**
- Aggregates content from exploration.md, test-intentions.md, build-plan.md, decisions.md, harden-report.md
- User confirmed they go directly to source files, not HODGE.md
- AI reads source files, not HODGE.md
- No clear value, just maintenance burden

**Finding 2: Temp files create awkward UX**
- `/plan` and `/ship` create temp files via bash heredoc commands
- User must approve these technical implementation details
- Breaks workflow with "why am I approving a temp file creation?"
- Could use Write tool instead for cleaner, invisible file creation

**Finding 3: /build has a bug**
- Checks `exploreDir/decision.md` (wrong path!)
- Should check `featureDir/decisions.md`
- Always shows "no decision" warning even when decisions exist

**Finding 4: /build doesn't extract from exploration.md**
- When /decide is skipped, just warns "no decision found"
- Should extract Recommendation from exploration.md and prompt user
- /plan already implements good cascading pattern - should replicate

**Finding 5: context.json files appear unused**
- Every phase creates context.json with metadata (mode, timestamp, standards, etc.)
- No evidence CLI commands read these files
- Could derive on-demand instead of storing

**Finding 6: Graceful degradation is inconsistent**
- /plan: ✅ Smart cascading (feature decisions → exploration → global)
- /build: ❌ Just warns about missing decisions
- /explore → /build: ❌ Suggests skip-checks flag
- No standardized pattern

**Finding 7: Smart extraction pattern exists in /plan**
- /plan implements excellent cascading: feature decisions.md → exploration.md (Recommendation + Decisions Needed) → global decisions.md
- This pattern should be replicated across other commands

### Scope and Testing Complexity
This is a **complex refactoring** touching:
- 6 slash command templates
- 6 CLI command implementations
- Core architecture patterns
- User-facing workflows

Testing must verify:
- Backward compatibility with existing workflows
- Each shortcut path (skipping /decide, /plan, etc.)
- File cleanup and migration
- No regressions in PM integration

## Implementation Approaches

### Approach 1: Big Bang Refactor
**Description**: Redesign entire workflow system architecture in one comprehensive change

**Pros**:
- Clean slate, optimal final design
- No incremental compromises
- Can establish consistent patterns everywhere

**Cons**:
- High risk of breaking existing workflows
- Large testing surface area
- Long time before user sees benefits
- Difficult to review and validate

**When to use**: When current system is fundamentally broken and incremental fixes won't work

**Assessment**: Not recommended - current system mostly works, issues are specific

---

### Approach 2: Incremental Optimization with Quick Wins First (RECOMMENDED)
**Description**: Fix issues in priority order, starting with high-impact, low-effort changes

**Implementation sequence**:

**Phase 1: Quick Wins (1-2 days)**
1. Fix /build decision file path bug (build.ts:81)
2. Eliminate HODGE.md aggregation file generation
3. Document existing smart extraction pattern from /plan

**Phase 2: UX Improvements (2-3 days)**
4. Replace bash heredoc temp file creation with Write tool calls in /plan and /ship slash commands
5. Implement smart decision extraction in /build (cascade: feature decisions → exploration Recommendation → prompt user)

**Phase 3: Standardization (3-4 days)**
6. Create reusable `WorkflowDataExtractor` pattern based on /plan's cascading logic
7. Apply pattern to all commands for consistent graceful degradation
8. Eliminate or consolidate context.json files

**Pros**:
- User sees improvements quickly
- Lower risk per change
- Can validate each fix independently
- Easy to roll back if issues arise
- Builds momentum with quick wins

**Cons**:
- Takes longer overall than big bang
- May need to touch same code multiple times
- Requires discipline to not skip phases

**When to use**: When fixing specific issues in working system (this case!)

---

### Approach 3: Architecture Documentation Only
**Description**: Document current issues and patterns but don't fix anything; wait for major refactor opportunity

**Pros**:
- Zero risk of breaking existing workflows
- Minimal time investment
- Creates roadmap for future work

**Cons**:
- Issues persist indefinitely
- User experience doesn't improve
- Technical debt accumulates
- Lost opportunity to fix known bugs

**When to use**: When team bandwidth is extremely limited or system is frozen

**Assessment**: Not recommended - issues are fixable and impacting UX now

## Recommendation

**Use Approach 2: Incremental Optimization with Quick Wins First**

**Rationale**:
1. **Quick value delivery**: Users see bug fixes and UX improvements within days, not weeks
2. **Risk mitigation**: Small, focused changes are easier to test and validate
3. **Learning opportunity**: Each phase informs next phase (e.g., /plan's extraction pattern guides /build implementation)
4. **Production system**: Hodge is actively used; can't afford big bang breakage
5. **Clear priorities**: Analysis identified specific high-impact issues with clear solutions

**Validation approach**:
- Each phase ships independently with full test coverage
- Smoke tests verify basic functionality
- Integration tests verify workflow shortcuts (skip /decide, skip /plan, etc.)
- Manual testing of complete /explore → /ship flow after each phase

**Success metrics**:
- Phase 1: /build decision check works correctly, no HODGE.md files created
- Phase 2: No user approval needed for temp files, /build prompts for Recommendation usage
- Phase 3: All commands implement consistent cascading extraction pattern

## Test Intentions

### Phase 1: Quick Wins

**Bug Fix: /build decision file path**
- [ ] When feature has decisions.md, /build should detect it correctly
- [ ] When feature has no decisions.md, /build should show correct warning
- [ ] No false positives about missing decisions

**Eliminate HODGE.md**
- [ ] /explore should not create HODGE.md
- [ ] /build should not update HODGE.md
- [ ] /harden should not update HODGE.md
- [ ] /ship should not update HODGE.md
- [ ] Existing HODGE.md files should remain (no destructive cleanup)

### Phase 2: UX Improvements

**Temp file creation via Write tool**
- [ ] /plan slash command should use Write tool to create plan.json (not bash heredoc)
- [ ] /ship slash command should use Write tool to create state.json and ui.md (not bash heredoc)
- [ ] User should not see bash cat/echo commands for temp files
- [ ] CLI should still read and delete temp files correctly

**Smart decision extraction in /build**
- [ ] When no decisions.md exists, /build should extract Recommendation from exploration.md
- [ ] When Recommendation exists, /build should prompt user: use it, go to /decide, or skip
- [ ] When user approves Recommendation, /build should proceed with that guidance
- [ ] When user chooses /decide, /build should exit gracefully
- [ ] When no Recommendation exists, /build should fall back to current warning behavior

### Phase 3: Standardization

**WorkflowDataExtractor pattern**
- [ ] Should implement cascading extraction: primary → secondary → tertiary → prompt → error
- [ ] Should be reusable across all commands
- [ ] Should handle missing files gracefully
- [ ] Should log extraction path for debugging

**Consistent graceful degradation**
- [ ] All commands should use WorkflowDataExtractor
- [ ] Skipping /decide should work seamlessly
- [ ] Skipping /plan should work seamlessly
- [ ] Each command should have clear fallback chain documented

**context.json elimination**
- [ ] Remove context.json creation from all commands
- [ ] Derive metadata on-demand when needed
- [ ] No broken references to context.json in existing code

### Cross-Cutting

**Backward compatibility**
- [ ] Existing features with old file structure should still work
- [ ] Migration is graceful, not destructive
- [ ] No data loss from file elimination

**PM integration**
- [ ] PM hooks still fire correctly after changes
- [ ] Linear integration unaffected
- [ ] Issue tracking continues working

## Decisions Needed

### Decision 1: Eliminate HODGE.md aggregation file?
**Context**: HODGE.md duplicates content from source files; user and AI both read source files directly

**Options**:
- **a) Eliminate entirely** - Stop creating/updating HODGE.md in all commands
- **b) Generate on-demand** - Only create via explicit `/status {feature}` command when requested
- **c) Keep but simplify** - Only include high-level summary, not full content duplication

**Recommendation**: Option (a) - eliminate entirely, no evidence of value

---

### Decision 2: How to handle temp files in /plan and /ship?
**Context**: Currently use bash heredoc commands visible to user

**Options**:
- **a) Use Write tool** - Cleaner UX, single tool call, invisible to user
- **b) Use stdin** - Pass JSON via echo pipe, still bash but cleaner
- **c) Keep current approach** - No change, temp files remain visible

**Recommendation**: Option (a) - Write tool for invisible, clean UX

---

### Decision 3: Smart extraction pattern for /build when /decide skipped?
**Context**: /build currently just warns; should extract from exploration.md Recommendation

**Options**:
- **a) Extract and prompt user** - Show Recommendation, ask: use it / go to /decide / skip
- **b) Auto-use Recommendation** - Silently use it without prompting
- **c) Keep current behavior** - Just warn, don't extract

**Recommendation**: Option (a) - extract and prompt for user agency

---

### Decision 4: Eliminate context.json files?
**Context**: Appear unused by CLI; could derive metadata on-demand

**Options**:
- **a) Eliminate all context.json** - Stop creating, derive on-demand
- **b) Consolidate to single file** - One per feature, not per phase
- **c) Keep current approach** - No change

**Recommendation**: Option (a) - eliminate, no evidence of usage

---

### Decision 5: Implementation phase order?
**Context**: Three phases identified: Quick Wins → UX Improvements → Standardization

**Options**:
- **a) Sequential (1→2→3)** - Complete each phase before next
- **b) Parallel** - Work on all phases simultaneously
- **c) User-driven** - Let user prioritize specific fixes

**Recommendation**: Option (a) - sequential for risk management and learning

---

### Decision 6: Handle existing HODGE.md files?
**Context**: If we stop creating HODGE.md, what about existing ones?

**Options**:
- **a) Leave them** - No cleanup, they become stale but harmless
- **b) Delete on next command** - Auto-cleanup when feature touched
- **c) Provide cleanup command** - User explicitly runs cleanup

**Recommendation**: Option (a) - leave them, non-destructive

---

### Decision 7: Standardize on WorkflowDataExtractor pattern?
**Context**: /plan has good cascading extraction; should others use it?

**Options**:
- **a) Create reusable extractor** - All commands use shared pattern
- **b) Copy pattern per-command** - Each implements own cascade
- **c) Only use in /build** - Don't standardize yet

**Recommendation**: Option (a) - reusable pattern for consistency

---

### Decision 8: Migration strategy for breaking changes?
**Context**: Some changes may break existing workflows if not careful

**Options**:
- **a) Feature flags** - Toggle new behavior during transition
- **b) Version detection** - Check file structure and adapt
- **c) Just ship it** - Assume backward compatibility

**Recommendation**: Option (b) - detect and adapt (graceful, no config needed)

---

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-319` with chosen approach

---
*Exploration completed: 2025-10-03*
*AI-generated through conversational discovery*
