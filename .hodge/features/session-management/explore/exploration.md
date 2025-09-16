# Exploration: Session Management

## Feature Overview
Implement context persistence across AI sessions to maintain continuity when returning to work.

## Context
- **Date**: 2025-01-16
- **Depends On**: cross-tool-compatibility (HODGE.md generation)
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Implement basic session checkpointing now")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-2-session-management`

## Problem Statement
Currently, when a developer closes their terminal or AI session:
- Context is lost between sessions
- No way to restore conversation state
- Must manually explain previous work to AI
- Difficult to resume where left off

### Example Scenario
```bash
# Monday morning
hodge explore auth
# Work with Claude for 2 hours
# Close terminal

# Monday afternoon
hodge status  # Shows feature status
# But Claude doesn't know what we discussed this morning
```

## Approaches Explored

### Approach 1: Full Conversation History
Save entire AI conversation transcripts
- **Pros**: Complete context
- **Cons**: Large files, privacy concerns, difficult to parse

### Approach 2: Checkpoint System (RECOMMENDED)
Save key context points after commands
- **Pros**:
  - Lightweight
  - Privacy-friendly
  - Easy to restore
  - Command-driven (fits Hodge model)
- **Cons**:
  - May miss some conversational context
  - Requires discipline in checkpointing

### Approach 3: Continuous Background Saves
Daemon process that saves periodically
- **Pros**: Never lose work
- **Cons**: Complex, resource intensive, doesn't fit CLI model

## Recommended Approach: Command-Based Checkpointing

### Session Schema
```typescript
interface Session {
  // WHERE we are
  currentFeature: string;
  currentMode: Mode;
  workingDirectory: string;
  gitBranch: string;

  // WHAT we've done
  recentCommands: Command[];
  recentDecisions: Decision[];
  uncommittedChanges: FileChange[];

  // WHERE we're going
  nextSuggestedCommand: string;
  pendingDecisions: string[];
  blockingIssues: string[];

  // CONTEXT for AI
  lastAISummary: string;
  keyDiscussionPoints: string[];
}
```

### Implementation Details
1. **SessionManager Class**
   - Location: `src/lib/session-manager.ts`
   - Auto-save after key commands
   - Restore on `hodge status`
   - Cleanup old sessions automatically

2. **Save Triggers**
   - After mode changes (explore, build, harden)
   - After decisions
   - Before dangerous operations (reset)
   - Time-based checks (>5 minutes)

3. **Restoration Flow**
   ```bash
   hodge status
   # "Continue working on auth? (y/n)"
   # If yes:
   # - Restores session context
   # - Regenerates HODGE.md
   # - Shows next suggested command
   ```

## Test Intentions
- [ ] Session saves after commands
- [ ] Session restores correctly
- [ ] Old sessions cleanup works
- [ ] HODGE.md regenerates with session context
- [ ] Time-based saves trigger appropriately
- [ ] Multiple sessions don't conflict

## Dependencies
- **Requires**: cross-tool-compatibility (for HODGE.md regeneration)
- **File Storage**: `.hodge/sessions/` directory
- **Config**: Session retention settings in hodge.json

## Key Decisions Made
1. ✅ Implement basic session checkpointing immediately
2. ✅ Command-based triggers (not daemon)
3. ✅ Auto-cleanup of old sessions

## Next Steps
1. Build after cross-tool-compatibility is complete
2. Implement SessionManager class
3. Add checkpoint calls to commands
4. Add restore prompt to status command
5. Test session persistence across restarts

## Related Features
- **Depends on**: cross-tool-compatibility
- **Enables**: Better workflow continuity
- **Related**: batch-decision-extraction (can restore pending decisions)

## References
- Implementation Plan: `IMPLEMENTATION_PLAN.md#phase-2`
- Decisions: `.hodge/decisions.md` (2025-01-16)
- Parent Feature: `.hodge/features/cross-tool-compatibility/`