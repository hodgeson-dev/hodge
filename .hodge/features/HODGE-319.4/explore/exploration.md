# Exploration: HODGE-319.4

**Title**: Phase 3 Context Cleanup - Eliminate Unused Phase-Specific Files

## Problem Statement

Phase-specific `context.json` files (`.hodge/features/{feature}/explore/context.json`, `.../build/context.json`, `.../harden/context.json`) are written by CLI commands but never read by any code. Investigation confirmed:

- **build.ts:197** - Writes `build/context.json`
- **harden.ts:124** - Writes `harden/context.json`
- **No reads found** - Grep search shows these files are only written, never read
- **Global context is different** - `.hodge/context.json` is actively used by save-manager.ts, plan command, and tests

These phase-specific files create clutter without providing value and should be eliminated.

## Conversation Summary

### Initial Phase 3 Scope
The parent HODGE-319 exploration proposed Phase 3 as:
1. Creating reusable `WorkflowDataExtractor` pattern (based on /plan's cascading logic)
2. Applying pattern to all commands for consistent graceful degradation
3. Eliminating phase-specific context.json files

However, deeper analysis during HODGE-319.4 exploration revealed this approach was flawed.

### Critical Discovery: Template vs CLI Extraction

**HODGE-319.3 (Phase 2) was template-only:**
- Added smart decision extraction to `/build` slash command template
- Did NOT create WorkflowDataExtractor in CLI
- Used AI-based parsing with user interaction (100+ lines in template)

**Current extraction implementations:**
- **/plan CLI** - Has `analyzeDecisions()` method with regex-based extraction (plan.ts:124-211)
- **/build template** - Has AI-based extraction with user prompts (build.md:1-140)

**Key question asked:** Should we create WorkflowDataExtractor to move /build extraction to CLI (like /plan)?

### Extraction Comparison Analysis

**CLI Regex Extraction (plan.ts) Limitations:**
```typescript
// Extracts ONLY the first bolded phrase after ## Recommendation
const recommendationMatch = content.match(/## Recommendation\s*\n\n\*\*(.+?)\*\*/);
// Returns: ["Use Approach 2: Incremental Optimization"]
```

Problems:
- ❌ Captures only title - loses full recommendation explanation/rationale
- ❌ Brittle format dependency - requires `**text**` immediately after heading
- ❌ No context - doesn't extract the "why" or implementation details
- ❌ Single match - can't handle multiple recommendations
- ❌ No user interaction - just returns strings, can't prompt for choices

**AI Template Extraction (build.md) Advantages:**
- ✅ Full context extraction - shows complete Recommendation section verbatim
- ✅ Handles multiple recommendations - Case B with user selection
- ✅ Flexible parsing - AI understands variations in format
- ✅ Interactive prompting - user chooses what to do with extracted info
- ✅ Handles edge cases - wrong location files, malformed content, missing sections
- ✅ Better UX - shows full context before asking user to proceed

**Example - What each approach gets:**

Exploration.md has:
```markdown
## Recommendation

**Use Approach 2: Incremental Optimization with Quick Wins First**

This approach is recommended because:
1. Quick value delivery - users see fixes within days
2. Risk mitigation - small changes easier to validate
3. Production system - can't afford big bang breakage
```

CLI Regex gets: `["Use Approach 2: Incremental Optimization with Quick Wins First"]`

AI Template gets: Full verbatim text including approach name, all rationale bullets, the "why" explanation, and implementation guidance

### Architecture Understanding: Why Templates Win

The critical insight: **AI (slash commands) handles ALL user interaction; CLI is pure backend**

For user-facing workflows:
- AI templates can parse semantically, preserve context, prompt users
- CLI regex strips context that users need to make informed decisions
- /plan's CLI extraction works for /plan because it just needs decision titles for internal analysis
- /build needs full context presentation - AI templates are the right place

Moving extraction to CLI via WorkflowDataExtractor would:
- Downgrade UX by replacing flexible AI parsing with rigid regex
- Lose interactive prompting capability (CLI can't prompt users from slash commands)
- Require duplicating user interaction logic in both template and CLI
- Trade maintainability for no real benefit

### Revised Phase 3 Scope

**Original goal was wrong.** WorkflowDataExtractor would make things worse, not better.

**Actual Phase 3 scope:**
1. ✅ Eliminate phase-specific context.json files (still valid - these are unused)
2. ✅ Document AI extraction pattern in `.hodge/patterns/` (better than centralizing in CLI)
3. ❌ Skip WorkflowDataExtractor utility (would downgrade UX)

### Context.json Verification

**Files verified as write-only (safe to eliminate):**
- `.hodge/features/{feature}/explore/context.json` - Already eliminated in HODGE-319.1
- `.hodge/features/{feature}/build/context.json` - Written by build.ts:197, never read
- `.hodge/features/{feature}/harden/context.json` - Written by harden.ts:124, never read

**File that MUST be preserved:**
- `.hodge/context.json` (global) - Actively read by:
  - save-manager.ts:222, 254
  - plan.ts:109
  - Multiple test files (save.test.ts:24, load.test.ts:25, etc.)

**Slash command check:**
- No references to `context.json` in `.claude/commands/*.md` files (verified via grep)

### Testing Focus

Per user guidance: **Primarily concerned with cascade behavior**, not backward compatibility.

However, for this simplified scope:
- No cascade behavior to test (we're just removing file writes)
- Tests should verify context.json files are NOT created
- Tests should verify global context.json still works
- Smoke tests are sufficient

## Implementation Approaches

### Approach 1: Just Remove the Lines (RECOMMENDED)
**Description**: Delete the `context.json` write operations from build.ts and harden.ts

**Implementation:**
1. Remove lines from build.ts:
   - Line 197: `fs.writeFile(path.join(buildDir, 'context.json'), ...)`
   - Line 222: Console log showing context.json in created files
2. Remove lines from harden.ts:
   - Line 124: `await fs.writeFile(path.join(hardenDir, 'context.json'), ...)`
   - Console log showing context.json (if exists)
3. Update existing smoke tests that expect these files
4. Add new smoke test verifying files are NOT created
5. Document AI extraction pattern in `.hodge/patterns/ai-template-extraction.md`

**Pros:**
- Simplest possible implementation (delete unused code)
- Zero risk - files were never read
- Clean file structure
- 5-minute change

**Cons:**
- Tests currently expect these files (need updates)
- Very small scope for a "Phase 3" (but that's okay - scope was wrong)

**When to use:** When removing dead code with no dependencies (this case!)

---

### Approach 2: Add Flag to Suppress Creation
**Description**: Add `--no-context` flag to build/harden commands to optionally skip context.json creation

**Pros:**
- Backward compatible if anyone somehow relies on these files
- Gradual migration path

**Cons:**
- More complex than needed
- No evidence anyone uses these files
- Adds configuration burden
- These files were NEVER read - no compatibility concern

**When to use:** When unsure if feature is used (not this case)

**Assessment:** Over-engineering for non-existent requirement

---

### Approach 3: Create Context on Demand
**Description**: Remove file writes, create `getPhaseContext()` utility that derives context on-demand if needed

**Pros:**
- Future-proof if context is needed later
- No file clutter
- Same data available via code

**Cons:**
- Adds code for non-existent requirement
- No current caller needs this
- YAGNI violation

**When to use:** When you know you'll need data later (not this case)

**Assessment:** Premature abstraction

## Recommendation

**Use Approach 1: Just Remove the Lines**

**Rationale:**
1. **YAGNI principle** - Files are unused, delete them
2. **Risk-free** - Confirmed via grep that no code reads these files
3. **Simplest solution** - 5-minute change, low test burden
4. **Corrects original scope** - Phase 3 was over-designed; this is the actual need
5. **Better documentation** - Pattern doc in `.hodge/patterns/` has more value than CLI utility

**Why not WorkflowDataExtractor:**
- AI template extraction is objectively superior for user-facing workflows
- CLI regex extraction strips context users need for decisions
- Moving to CLI would downgrade UX, not improve it
- /plan and /build have different extraction needs - forced unification is wrong

**Implementation plan:**
1. Remove context.json writes from build.ts and harden.ts (2 files, ~4 lines)
2. Update tests expecting these files (3-4 test files)
3. Add smoke test verifying NO context.json creation
4. Document AI extraction pattern in `.hodge/patterns/ai-template-extraction.md`
5. Update HODGE-319 parent decisions to reflect scope change

## Test Intentions

### Context.json Elimination

**Build command:**
- [ ] Should NOT create `.hodge/features/{feature}/build/context.json`
- [ ] Should still create build-plan.md successfully
- [ ] Should still detect decisions correctly

**Harden command:**
- [ ] Should NOT create `.hodge/features/{feature}/harden/context.json`
- [ ] Should still create harden-report.md successfully
- [ ] Should still create validation-results.json

### Global Context Preservation

**Global context:**
- [ ] `.hodge/context.json` should still be created/updated correctly
- [ ] save-manager should still read global context.json
- [ ] plan command should still read global context.json

### Test Updates

**Existing tests:**
- [ ] Update ship.smoke.test.ts - remove context.json expectations (lines 10, 34, 82, 105, 134)
- [ ] Update ship.integration.test.ts - remove context.json expectations (lines 12, 86, 126, 168, 220)
- [ ] Update context.smoke.test.ts - remove build context.json write expectation (line 103)
- [ ] Update build.test.ts - remove "should create context.json" test (line 71)
- [ ] Update harden.test.ts - remove "should create context.json" test (line 64)

### Pattern Documentation

**AI extraction pattern:**
- [ ] Document template-based extraction in `.hodge/patterns/ai-template-extraction.md`
- [ ] Include examples from /build and /plan templates
- [ ] Explain why AI parsing > CLI regex for user workflows
- [ ] Provide guidelines for when to use each approach

## Decisions Needed

### Decision 1: Confirm simplified Phase 3 scope
**Context**: Original HODGE-319 proposed WorkflowDataExtractor utility, but analysis shows AI template extraction is superior to CLI regex for user-facing workflows.

**Options:**
- **a) Accept simplified scope** - Just eliminate context.json files and document pattern (recommended)
- **b) Proceed with WorkflowDataExtractor anyway** - Despite downgrading UX
- **c) Expand scope** - Find other Phase 3 work beyond context cleanup

**Recommendation**: Option (a) - original scope was based on flawed assumption that CLI extraction would improve templates

---

### Decision 2: Update parent HODGE-319 decisions?
**Context**: HODGE-319 decision #7 says "Create reusable WorkflowDataExtractor pattern", but we've determined this would harm UX.

**Options:**
- **a) Add new decision** - Document why WorkflowDataExtractor was rejected, keep original for history
- **b) Update decision #7** - Change to "Document AI extraction pattern instead of CLI utility"
- **c) Leave as-is** - Decision was made, exploration revealed it was wrong, that's normal

**Recommendation**: Option (a) - preserve decision history, add new decision explaining pivot

---

## Next Steps

### Next Steps
Type one of these commands:
• `/decide` - Review and decide on approach
• `/build HODGE-319.4` - Start building with Approach 1: Just Remove the Lines
• `/save` - Save your progress
• `/status HODGE-319.4` - Check current status
• Continue exploring - Just describe what else to explore

Or type your next request.

Note: `/build` will use the recommended approach. Use `/decide` to choose a different approach.

---
*Exploration completed: 2025-10-03*
*AI-generated through conversational discovery*
