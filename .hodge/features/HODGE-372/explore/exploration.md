# Exploration: HODGE-372

**Title**: Audit and simplify .hodge root directory file redundancy

**Created**: 2025-10-31
**Status**: Exploring

## Problem Statement

The `.hodge` root directory contains multiple files tracking similar state (HODGE.md, context.json, .session), leading to data sync issues, maintenance burden, and confused responsibilities. HODGE.md was originally designed as a token optimization for cross-tool AI compatibility, but that goal was abandoned when the project focused exclusively on Claude Code. Currently, the `/hodge` slash command loads both HODGE.md (a summary file) and all source files (decisions.md, standards.md, principles.md), defeating the optimization purpose and wasting approximately 60KB of context per invocation.

## Conversation Summary

During exploration, we examined all `.hodge` root files and traced their usage through the codebase:

**Files Analyzed**:
- `.pm-queue.json` - Empty (0 bytes), likely abandoned PM queue tracking
- `.session` - Legacy session tracking (597 bytes), no active usage found
- `HODGE.md` - Generated summary file (15KB), contains session state + content summaries
- `context.json` - Current session state (114 bytes), actively used by ContextManager
- `decisions.md` - Architectural decisions log (21KB), source of truth
- `standards.md` - Project standards (29KB), source of truth
- `principles.md` - Development principles (11KB), source of truth
- `id-counter.json`, `id-mappings.json` - ID management (working as intended)
- `project_management.md` - PM tracking (19KB, working as intended)
- `toolchain.yaml` - Quality tooling config (5.9KB, working as intended)
- Other review/architecture files (working as intended)

**Key Findings**:

1. **HODGE.md Generation Flow**: Every `/hodge` invocation calls `hodge context`, which generates HODGE.md fresh by pulling data from decisions.md, standards.md, principles.md, and context.json. The HodgeMDGenerator synthesizes this into a summary document.

2. **Redundant Loading**: The `/hodge` slash command template (hodge.md:62-68) explicitly instructs AI to load BOTH:
   - HODGE.md (15KB summary)
   - standards.md (29KB source)
   - decisions.md (21KB source)
   - principles.md (11KB source)

   This loads ~76KB total when HODGE.md (15KB) was supposed to replace ~60KB of source files.

3. **Data Sync Issue Discovered**: During exploration, we found context.json and HODGE.md disagreed on the current feature:
   - context.json: `"feature": "HODGE-372"`
   - HODGE.md: `"Feature": general`

   This is the kind of maintenance problem redundancy causes.

4. **Limited Usage**: Only 2 of 11 slash commands use HODGE.md:
   - `/hodge` - Loads it redundantly with source files
   - `/checkpoint` - Greps it for "Feature:" and "Mode:" (could use context.json instead)

5. **Historical Context Abandoned**: HODGE.md was created for cross-tool AI compatibility (decisions.md shows explicit decision to abandon this goal and focus on Claude Code only).

6. **Removal History**: HODGE-319.1 already removed HODGE.md generation from `/explore`, `/build`, `/harden`, `/ship` commands because it wasn't being used.

**Architecture Discovery**:
- ContextManager (context-manager.ts) manages context.json as session state
- HodgeMDGenerator (hodge-md-generator.ts) orchestrates HODGE.md creation
- HodgeMDContextGatherer pulls data from all source files
- HodgeMDFormatter renders it as markdown
- HodgeMDFileWriter saves to disk
- ~500 lines of code dedicated to HODGE.md generation

**User Perspective**: The user confirmed HODGE.md loads on every `/hodge` invocation, questioned whether it's premature optimization without proof it helps AI, and suspected the redundancy is causing more problems than it solves.

## Implementation Approaches

### Approach 1: Pragmatic Simplification

**Description**: Remove the redundancy by eliminating HODGE.md generation entirely and simplifying to single sources of truth.

**Implementation Details**:
- Remove HODGE.md generation from `ContextCommand.generateManifest()` (context.ts:76-78)
- Remove HODGE.md from global_files list in manifest (context.ts:110)
- Update `/checkpoint` slash command to read context.json directly instead of grepping HODGE.md
- Delete HodgeMDGenerator class and entire hodge-md/ directory (~500 lines)
- Remove .session and .pm-queue.json files (unused/abandoned)
- Update all tests to remove HODGE.md references (found in 17 test files)
- Add note to CLAUDE.md about simplified context loading

**Pros**:
- Eliminates 60KB redundant context loading per `/hodge` invocation
- Single source of truth: context.json for session state, source files for content
- Removes data sync issues between HODGE.md and context.json permanently
- Simplifies codebase by removing ~500 lines of generation infrastructure
- Reduces maintenance burden (one less file to keep synchronized)
- Clearer mental model: context.json = session, .md files = content
- Aligns with existing decision to focus on Claude Code only (no cross-tool needs)

**Cons**:
- Removes optimization infrastructure if cross-tool compatibility becomes priority again (unlikely per decisions.md)
- Breaking change for any external tools reading HODGE.md (low risk - internal tool only)
- Requires updating two slash commands (/hodge, /checkpoint)
- Requires updating 17 test files that reference HODGE.md

**When to use**: When the goal is maximum simplification with minimal risk and clear immediate benefits.

---

### Approach 2: Conservative Token Optimization

**Description**: Keep HODGE.md infrastructure but make it actually optimize by stopping redundant source file loading.

**Implementation Details**:
- Keep HodgeMDGenerator and all hodge-md/ infrastructure
- Remove standards.md, decisions.md, principles.md from `/hodge` global_files manifest
- Update `/hodge` slash command to load ONLY HODGE.md (not source files)
- Enhance HODGE.md content to include more complete summaries
- Add "Full source available at .hodge/decisions.md" notes in HODGE.md so AI knows where to find details
- Fix context.json sync issue in HodgeMDContextGatherer
- Remove .session and .pm-queue.json (still cleanup legacy files)

**Pros**:
- Achieves original optimization goal (saves ~60KB context per `/hodge` invocation)
- Preserves infrastructure for potential future cross-tool compatibility needs
- Faster context loading for `/hodge` command
- AI can still request full source files when it needs deeper detail
- Less code removal (lower risk)

**Cons**:
- Maintains complexity of ~500 lines of HODGE.md generation infrastructure
- Risk of information loss if summaries are insufficient for AI needs
- Still have two files tracking session state (HODGE.md vs context.json)
- Requires careful testing to ensure AI has enough context from summaries alone
- Data sync between HODGE.md summaries and source files remains an ongoing concern
- Need to measure if 60KB savings actually impacts performance (premature optimization risk)

**When to use**: When token optimization is measured as an actual performance problem and there's a realistic chance cross-tool compatibility will return.

---

### Approach 3: Unified State File

**Description**: Consolidate all session and state tracking into a single enhanced context.json file.

**Implementation Details**:
- Extend context.json schema to include summary fields (recentDecisions, keyStandards, nextSteps)
- Update ContextManager to populate enhanced fields when saving context
- Remove HODGE.md generation entirely (same as Approach 1)
- Remove .session file
- Keep source files (decisions.md, standards.md, principles.md) unchanged
- Update /checkpoint to read from enhanced context.json structure
- Modify `hodge context` command to enrich context.json with summaries

**Example Enhanced Schema**:
```json
{
  "lastCommand": "explore",
  "feature": "HODGE-372",
  "mode": "explore",
  "timestamp": "2025-10-31T17:05:47.000Z",
  "recentDecisions": [
    "2025-09-22: Implement Hybrid Progressive Enhancement...",
    "2025-09-21: ..."
  ],
  "keyStandards": ["TypeScript strict mode", "ESLint enforced", ...],
  "nextSteps": ["Review exploration", "Make decisions", ...]
}
```

**Pros**:
- Single JSON file for all session state (machine-readable, no markdown parsing needed)
- Eliminates markdown parsing/grepping in /checkpoint command
- Clear separation: context.json = state + summaries, .md files = authoritative content
- Easier to maintain sync (one JSON structure managed by ContextManager)
- Better for programmatic access and tooling
- Reduces file proliferation in .hodge root

**Cons**:
- Duplicates some data from source files into JSON (recent decisions, standards summary)
- Larger context.json file (~2-3KB instead of 114 bytes)
- Changes the mental model (context.json becomes more than minimal session tracking)
- Requires significant refactoring of ContextManager class
- Need to decide when/how to regenerate summaries (every command? on-demand?)

**When to use**: When you want a clean programmatic API for session state with convenient summaries included.

## Recommendation

**Approach 1: Pragmatic Simplification**

**Why This Approach**:

1. **The Optimization Doesn't Optimize**: HODGE.md was meant to save tokens, but we load both it AND the source files, so it saves nothing currently.

2. **Goal Was Abandoned**: Cross-tool AI compatibility (the reason for HODGE.md) was explicitly abandoned per decisions.md (2025-09-18 decision: "abandoning all effort to enable Hodge to integrate with any AI-assisted software development tool other than Claude Code").

3. **Real Problems Now**: The data sync issue between HODGE.md and context.json discovered during exploration is a real maintenance problem being caused right now.

4. **Simplest Path**: Approach 1 has the clearest immediate benefits (eliminates 60KB redundant loading, fixes sync issues) with lowest complexity.

5. **Can Re-Add Later**: If token optimization becomes a measured problem in the future, we can reintroduce it. Removing it now doesn't burn bridges.

6. **Aligns With Precedent**: HODGE-319.1 already removed HODGE.md generation from 4 commands (explore, build, harden, ship) because it wasn't providing value.

**Implementation Impact**:
- Removes ~500 lines of HODGE.md generation code
- Fixes context.json/HODGE.md mismatch permanently
- Cleans up 3 legacy files (.session, .pm-queue.json, HODGE.md)
- Simplifies mental model for developers
- Makes `/hodge` command token usage transparent (you see exactly what files are loaded)

**Risk Mitigation**:
- Low risk: HODGE.md is only used internally, no external consumers
- Breaking changes isolated to 2 slash commands (easy to update)
- All functionality preserved (just reading from source files directly)

## Test Intentions

1. **Session State Authority**: After cleanup, context.json should be the single source of truth for session state (feature, mode, lastCommand, timestamp). No other files should claim to track this data.

2. **Context Loading Behavior**: The `/hodge` slash command should load only source files (standards.md, decisions.md, principles.md, architecture-graph.dot, context.json) without generating or loading HODGE.md. Token usage should be transparent.

3. **Checkpoint Reads Context.json**: The `/checkpoint` slash command should read current feature and mode directly from context.json instead of grepping HODGE.md. The checkpoint should work correctly with context.json as the source.

4. **Legacy Files Removed**: After cleanup, HODGE.md, .session, and .pm-queue.json should not exist in .hodge root directory and should not be referenced anywhere in the codebase (code, tests, or documentation).

5. **Infrastructure Cleanup**: HodgeMDGenerator, HodgeMDContextGatherer, HodgeMDFormatter, and HodgeMDFileWriter classes should be removed from src/lib/hodge-md/ directory. No imports of these classes should remain.

6. **Test Suite Passes**: All existing tests should pass after cleanup, with HODGE.md references removed from test files. No tests should expect HODGE.md to exist or be generated.

## Decisions Decided During Exploration

1. ✓ **HODGE.md provides no unique value** - It's either redundant with source files (current state) or could be replaced by context.json (for session state). The original optimization goal was abandoned.

2. ✓ **.session file is unused** - Grep search found no active usage in the codebase. This is legacy from an old session management approach and should be removed.

3. ✓ **.pm-queue.json is abandoned** - The file is empty (0 bytes) and represents an abandoned approach to offline PM queue tracking. Should be removed.

4. ✓ **/checkpoint should read context.json** - Instead of grepping HODGE.md for "Feature:" and "Mode:", the /checkpoint command should read context.json directly (it's already the authoritative source).

## Decisions Needed

1. **Migration Strategy**: Should we add migration logic to clean up HODGE.md from existing user projects when they run `hodge init` or a command, or should we just stop generating it and let users manually clean up if they notice it?

2. **HodgeMDGenerator Preservation**: Should we keep the HodgeMDGenerator infrastructure but unused (commented out or behind a feature flag) for potential future use, or fully delete it? The code is ~500 lines but well-structured and could be useful if cross-tool compatibility returns.

## Next Steps

1. Review this exploration with stakeholders
2. Make decisions on the two open questions with `hodge decide`
3. Start building with `hodge build HODGE-372` (implement Approach 1)
