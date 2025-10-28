# Exploration: HODGE-358

**Title**: Formalize conversation checkpoint process with /checkpoint command

**Created**: 2025-10-28
**Status**: Exploring

## Problem Statement

During complex refactoring work and long-running feature development, conversation context often exceeds Claude Code's limits, requiring compaction via `/clear`. Currently, developers save context in an ad-hoc fashion (creating temporary files, copying conversation snippets), leading to inconsistent state preservation and difficulty resuming work. We need a formalized `/checkpoint` command that systematically updates phase documents and creates resumable conversation snapshots.

## Context

**Project Type**: CLI tool enhancement

This feature emerged from practical need during HODGE-357 (systematic ESLint cleanup) and other complex multi-day features where conversation context repeatedly hit limits. The ad-hoc solutions worked but were inconsistent and required manual effort.

## Related Features

- HODGE-001, HODGE-002, HODGE-004 (similar features identified by CLI)
- All slash commands (explore, decide, build, harden, ship) - checkpoint must work across all phases
- `/hodge HODGE-XXX` command - must integrate with context loading

## Conversation Summary

The exploration focused on understanding the "what" (requirements and behavior) rather than implementation details. Key insights emerged:

**Dual Purpose**: The `/checkpoint` command serves two functions:
1. Updates existing phase documents (exploration.md, build-plan.md, etc.) with current progress
2. Creates a timestamped checkpoint file with conversation-specific context

**Primary Use Case**: Enabling work to continue across conversation compactions. When context limits are reached, user calls `/clear`, then `/hodge HODGE-XXX` to reload global and feature context, including checkpoint files that provide conversation continuity.

**Format Decision**: YAML was chosen for checkpoint files to conserve tokens, aligning with project's existing preference for YAML over JSON/Markdown for structured data.

**Checkpoint Content**: Should contain whatever AI needs to resume work after complete context clearing - decisions made, current blockers, next steps, work-in-progress state, etc. AI determines appropriate granularity based on phase and complexity.

**File Management**: Checkpoints stored at feature root (`.hodge/features/HODGE-XXX/checkpoint-YYYY-MM-DD-HHMM.yaml`) with timestamped naming. No automatic pruning needed (typically <5 checkpoints per feature).

**Integration**: The `/hodge HODGE-XXX` command will use glob patterns to load ALL files in feature directory (not just known files), presenting them in a manifest. AI reads what's relevant, including checkpoint files.

**Trigger Mechanism**: Primarily user-initiated, but AI can proactively suggest or create checkpoints when sensing context limits approaching (leveraging SlashCommand tool autonomy).

## Implementation Approaches

### Approach 1: Slash Command Template with AI-Driven Content

**Description**: Create `/checkpoint` as a slash command template (`.claude/commands/checkpoint.md`) that guides AI through the checkpointing process. The template provides structure but AI determines what content is meaningful to save based on conversation context.

**Pros**:
- Follows existing slash command pattern (consistent with project architecture)
- Maximum flexibility - AI adapts checkpoint content to situation
- Natural language guidance for what to include
- No rigid schema constraints
- Works well with AI's understanding of conversation state

**Cons**:
- Checkpoint content may vary widely (could be harder to parse later)
- Relies on AI judgment for what's "important"
- No CLI validation of checkpoint structure
- Could lead to inconsistent checkpoint quality

**When to use**: This approach is ideal when checkpoint content needs to be highly contextual and adaptive to different types of work (refactoring vs new features vs bug fixes).

---

### Approach 2: CLI Command with Structured Schema

**Description**: Implement `/checkpoint` as a CLI command (`hodge checkpoint`) with a defined YAML schema. The command prompts for or infers key fields (phase, summary, decisions, blockers, nextSteps) and generates a consistent checkpoint structure.

**Pros**:
- Consistent checkpoint structure across all features
- CLI can validate required fields
- Easier to parse and process checkpoints programmatically
- Clear contract between checkpoint creation and loading
- Better for potential future tooling (checkpoint diffs, analytics)

**Cons**:
- May feel rigid for varied checkpoint needs
- AI must conform to predefined schema
- Less flexible for capturing unexpected important context
- Requires maintaining schema as needs evolve

**When to use**: This approach is ideal when we want predictable checkpoint format and can define core fields that apply universally across all checkpointing scenarios.

---

### Approach 3: Hybrid - Template Guidance with Schema Hints

**Description**: Create `/checkpoint` slash command template that provides structured guidance (suggested YAML schema) but allows AI flexibility to add additional context. Template includes "standard fields" section and "additional context" section.

**Pros**:
- Balances structure with flexibility
- Consistent core fields for parsing while allowing extensions
- AI can adapt to special situations
- Schema evolves naturally through practice
- Follows slash command pattern (project standard)

**Cons**:
- More complex template to maintain
- "Guidelines" might be ignored by AI
- Checkpoint files could still drift toward inconsistency
- Middle-ground solutions can inherit both approaches' weaknesses

**When to use**: This approach is ideal when we want structured consistency but recognize we can't predict all checkpoint scenarios upfront.

## Recommendation

**Approach 3: Hybrid - Template Guidance with Schema Hints**

This approach aligns best with Hodge's philosophy of "freedom to explore, discipline to ship." The slash command template provides structure and guidance (discipline) while allowing AI flexibility to adapt checkpoint content to the specific situation (freedom).

**Rationale**:
1. **Consistency with project architecture**: Follows the slash command pattern used by all other commands
2. **Token efficiency**: YAML format conserves tokens as requested
3. **Flexibility where needed**: AI can adapt checkpoint depth to phase complexity (explore phase checkpoints might be lighter than build phase)
4. **Natural evolution**: Schema can be refined through usage without CLI code changes
5. **AI autonomy**: Leverages AI's ability to judge what's important in conversation context
6. **Integration ready**: Works seamlessly with existing `/hodge` context loading

**Suggested YAML Schema** (standard fields):
```yaml
timestamp: 2025-10-27T19:30:00Z
phase: build
featureId: HODGE-358
summary: "One-line summary of current state"
progress:
  - "What's been completed"
  - "What's in progress"
decisions:
  - "Key decisions made in conversation"
blockers:
  - "Current blockers or issues"
nextSteps:
  - "What to do next when resuming"
context:
  # Flexible section for additional context
  filesModified: ["src/commands/ship.ts"]
  testsAffected: 6
  # Any other relevant state
```

## Test Intentions

### Core Behavior
1. `/checkpoint` creates a YAML file at `.hodge/features/HODGE-XXX/checkpoint-[timestamp].yaml`
2. Command updates existing phase documents with current progress before creating checkpoint
3. Works in any phase (explore, decide, build, harden, ship)
4. `/hodge HODGE-XXX` loads checkpoint files via glob pattern along with other feature files

### Edge Cases
5. Shows helpful error if called without active feature context
6. Handles multiple checkpoint files in same feature directory gracefully
7. Handles case where there's minimal conversation context to checkpoint (creates minimal valid checkpoint)
8. Checkpoint filenames don't collide even if created in same minute (use seconds in timestamp if needed)

### User Experience
9. Provides confirmation feedback showing what was updated and where checkpoint was saved
10. Reminds user they can use `/clear` and `/hodge HODGE-XXX` to resume later with checkpoint context

## Decisions Decided During Exploration

1. ✓ Use YAML format for checkpoint files (token efficiency)
2. ✓ Timestamped filenames: `checkpoint-YYYY-MM-DD-HHMM.yaml`
3. ✓ Store checkpoints at feature root: `.hodge/features/HODGE-XXX/`
4. ✓ Keep all checkpoint history with no automatic pruning (typically <5 per feature)
5. ✓ `/hodge HODGE-XXX` globs all files in feature directory and subdirectories
6. ✓ AI determines checkpoint granularity based on what's needed to resume work
7. ✓ User-initiated primarily, AI can proactively suggest/create when sensing context limits
8. ✓ Command updates existing phase documents before creating checkpoint
9. ✓ Use Approach 3: Hybrid template with schema hints

## Decisions Needed

1. **YAML schema flexibility**: Should we enforce required fields (phase, featureId, timestamp) or make everything optional with guidelines? Enforcement would ensure consistency but reduce flexibility.

2. **Checkpoint presentation in `/hodge` manifest**: Should checkpoint files be:
   - Grouped together in manifest (all checkpoints in one section)?
   - Sorted by timestamp (newest first)?
   - Given priority/precedence hints for AI reading order?

3. **Error handling for empty checkpoints**: If AI determines there's nothing meaningful to checkpoint (early in exploration, no decisions made yet), should we:
   - Create minimal checkpoint anyway (timestamp + phase only)?
   - Show error and skip checkpoint creation?
   - Create checkpoint with explicit "no significant progress yet" marker?

4. **Document update scope**: When updating existing phase documents, should the command:
   - Always update the primary phase document (exploration.md, build-plan.md)?
   - Prompt AI to choose which documents need updating?
   - Update all documents in the phase directory?

## Next Steps

1. Review exploration and make decisions with `/decide HODGE-358`
2. Start building with `/build HODGE-358` using Approach 3 (Hybrid template)
3. Create `/checkpoint` slash command template following UX patterns from `.hodge/review-profiles/ux-patterns/claude-code-slash-commands.md`
4. Implement smoke tests for checkpoint creation and loading behavior
