---
description: Save conversation state and update phase documents
argument-hint: none
---

┌─────────────────────────────────────────────────────────┐
│ 💾 Checkpoint: Save Progress & Context                 │
└─────────────────────────────────────────────────────────┘

## Purpose

Create a conversation checkpoint for resuming work after context compaction. This command:

1. **Updates existing phase documents** with current progress (if needed)
2. **Creates timestamped YAML checkpoint** for conversation continuity
3. **Works across all phases** (explore, decide, build, harden, ship)
4. **Enables seamless resumption** via `/hodge HODGE-XXX` after `/clear`

## When to Use

**Primary Use Case**: Before calling `/clear` when context limits are reached

**Secondary Use Cases**:
- End of long work session (save progress before break)
- Before switching to different feature
- After significant progress/decisions made
- When conversation state feels "too valuable to lose"

**AI Proactive Trigger**: When you sense context approaching limits, suggest or create checkpoint autonomously (you have authority to use SlashCommand tool without asking).

## Pre-Checkpoint Checks

### 1. Verify Feature Context
```bash
# Check current feature from session
cat .hodge/HODGE.md | grep "Feature:" | head -1
```

**If no active feature found**, show error:
```
⚠️  No active feature context found.

To create a checkpoint, you need to be working on a feature.

What would you like to do?
• `/hodge HODGE-XXX` - Load feature context
• `/explore HODGE-XXX` - Start exploring a feature
• Continue current work without checkpoint

💡 Tip: Checkpoints save conversation state for a specific feature.
```

Then stop - do not proceed with checkpoint creation.

**If feature found**, extract feature ID and continue.

### 2. Determine Current Phase
```bash
# Check current mode/phase
cat .hodge/HODGE.md | grep "Mode:" | head -1
```

Extract phase from output (explore/decide/build/harden/ship). This will be used in checkpoint metadata.

### 3. Identify Feature Directory
```bash
# Verify feature directory exists
ls -la .hodge/features/HODGE-XXX/ 2>/dev/null
```

**If directory doesn't exist**, show error:
```
⚠️  Feature directory not found: .hodge/features/HODGE-XXX/

This shouldn't happen if you have an active feature. Try:
• `/hodge HODGE-XXX` - Reload feature context
• `/explore HODGE-XXX` - Start exploring the feature

💡 Tip: Contact support if this issue persists.
```

Then stop - do not proceed.

## Checkpoint Process

### Step 1: Update Phase Documents (Conditionally)

**AI Determines What Needs Updating**: Review conversation history to identify documents that have evolved during this conversation.

**Phase Document Guidance**:
- **Explore phase**: `exploration.md` (problem statement, approaches, decisions)
- **Decide phase**: `decisions.md` (decisions made, rationale)
- **Build phase**: `build-plan.md` (implementation checklist, files modified, decisions made)
- **Harden phase**: Integration test plans, validation results
- **Ship phase**: Lessons learned, final notes

**Important Rules**:
- **Only update documents that changed** in the conversation (avoid unnecessary file churn)
- **Use Edit tool for incremental updates** (don't overwrite entire files)
- **Preserve existing structure** and formatting
- **Use Write tool only for new content sections** that don't exist yet

**Typical Update Scenarios**:

**Explore Phase**:
```bash
# If exploration.md has evolved (new approaches discussed, decisions made)
# Edit specific sections that changed
```

**Build Phase**:
```bash
# If implementation progress was made
# Update checklist items, files modified list, decisions made
```

**Harden Phase**:
```bash
# If tests were added or validation completed
# Update test results, quality gate status
```

**Ship Phase**:
```bash
# If lessons were identified during conversation
# Add to lessons section or create lesson file
```

**Show Update Summary**:
After updating documents, show:
```
📝 Updated phase documents:
  ✓ .hodge/features/HODGE-XXX/build/build-plan.md
    - Updated implementation checklist (3 items completed)
    - Added 2 files to "Files Modified" section
```

OR if no updates needed:
```
📝 Phase documents are up to date (no changes needed)
```

### Step 2: Create Checkpoint YAML

**Filename Format**:
```
.hodge/features/HODGE-XXX/checkpoint-YYYY-MM-DD-HHMMSS.yaml
```

**Example**: `checkpoint-2025-10-28-143027.yaml` (includes seconds to avoid collisions)

**Required Fields** (MUST be present):
```yaml
timestamp: 2025-10-28T14:30:27Z  # ISO 8601 format
phase: build                      # Current phase
featureId: HODGE-358             # Feature ID
```

**Recommended Fields** (SHOULD include when relevant):
```yaml
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
  filesModified: ["src/commands/ship.ts", "src/lib/context-service.ts"]
  testsAffected: 6
  conversationHighlights: "Discussed error handling strategy for edge cases"
  # Any other relevant state
```

**Content Guidance**:
- **summary**: Brief one-liner of where you are in the work
- **progress**: Concrete accomplishments (not todo items)
- **decisions**: Significant choices made during conversation (not in decisions.md yet)
- **blockers**: Current issues preventing progress
- **nextSteps**: Specific actionable items for resuming
- **context**: Flexible YAML object for anything else important

**Minimal Checkpoint** (when there's little to save):
```yaml
timestamp: 2025-10-28T14:30:27Z
phase: explore
featureId: HODGE-358
summary: "Just started exploration phase"
```

**AI Judgment**: You determine checkpoint granularity based on:
- How much progress was made
- Complexity of conversation
- Risk of losing context
- Phase of development

**Create the checkpoint file**:
```bash
# Use Write tool to create checkpoint YAML
# AI determines appropriate content based on conversation context
```

### Step 3: Confirmation & Next Steps

After creating checkpoint, show confirmation:

```
✅ Checkpoint saved successfully!

📦 Checkpoint Details:
  File: .hodge/features/HODGE-358/checkpoint-2025-10-28-143027.yaml
  Phase: build
  Summary: Implemented checkpoint command, ready for testing

📝 Documents Updated:
  ✓ build-plan.md - Updated implementation progress

💡 To Resume Later:
  1. Call `/clear` to compact context
  2. Call `/hodge HODGE-358` to reload context
  3. AI will automatically load this checkpoint during context restoration

### What's Next?

• `/clear` - Clear conversation context (now that you've saved state)
• Continue working - Keep building without clearing
• `/status HODGE-358` - Check feature progress

💡 Tip: Checkpoints are automatically loaded when you use `/hodge HODGE-XXX` after clearing.
```

## Error Handling

### Checkpoint File Already Exists (Same Second)
This should be extremely rare due to seconds in timestamp, but if it happens:

```bash
# Add milliseconds or increment counter
checkpoint-2025-10-28-143027-2.yaml
```

### Cannot Determine Current Phase
Fall back to "unknown" phase:
```yaml
phase: unknown
featureId: HODGE-358
timestamp: 2025-10-28T14:30:27Z
summary: "Checkpoint created without clear phase context"
```

### Minimal Conversation Context
Create minimal checkpoint (required fields only):
```yaml
timestamp: 2025-10-28T14:30:27Z
phase: explore
featureId: HODGE-358
summary: "Early checkpoint with minimal progress"
```

## Integration with /hodge Command

**Context Loading**: The `/hodge HODGE-XXX` command uses glob patterns to discover ALL files in the feature directory, including checkpoints:

```bash
# In /hodge command execution
ls -la .hodge/features/HODGE-XXX/*.yaml 2>/dev/null
```

The CLI will:
1. Find all checkpoint files via glob pattern
2. Sort by timestamp (newest first)
3. Assign precedence hints (most recent = high precedence)
4. Include in file manifest presented to AI

**AI Reading Behavior**: When loading context via `/hodge`:
- Read most recent checkpoint first (if multiple exist)
- Synthesize checkpoint content with other feature files
- Use checkpoint to understand conversation state before compaction
- Older checkpoints available but lower priority

## YAML Schema Reference

**Complete Schema** (for reference):
```yaml
# REQUIRED FIELDS
timestamp: string         # ISO 8601 datetime
phase: string            # explore|decide|build|harden|ship|unknown
featureId: string        # HODGE-XXX format

# RECOMMENDED FIELDS (optional but suggested)
summary: string          # One-line state summary

progress: array          # List of completed items
  - string

decisions: array         # Key decisions from conversation
  - string

blockers: array          # Current issues/blockers
  - string

nextSteps: array         # Actionable items for resuming
  - string

context: object          # Flexible additional context
  filesModified: array
  testsAffected: number
  conversationHighlights: string
  # ... any other relevant state
```

## Example Checkpoints by Phase

### Explore Phase Example
```yaml
timestamp: 2025-10-28T14:30:27Z
phase: explore
featureId: HODGE-358
summary: "Completed exploration conversation, identified 3 approaches"

progress:
  - "Discussed problem space and requirements"
  - "Identified 3 implementation approaches"
  - "Defined 10 test intentions"

decisions:
  - "Use YAML format for checkpoint files (token efficiency)"
  - "Store checkpoints at feature root level"

nextSteps:
  - "Review exploration.md for accuracy"
  - "Run /decide to formalize approach selection"

context:
  approachesDiscussed: ["Slash command template", "CLI command", "Hybrid"]
  recommendedApproach: "Hybrid - Template with schema hints"
```

### Build Phase Example
```yaml
timestamp: 2025-10-28T16:45:12Z
phase: build
featureId: HODGE-358
summary: "Implemented checkpoint command, smoke tests passing"

progress:
  - "Created /checkpoint slash command template"
  - "Added YAML schema documentation"
  - "Implemented basic smoke tests"

decisions:
  - "Use seconds in timestamp to prevent filename collisions"
  - "AI determines document update scope (not automatic)"

blockers:
  - "Need to test integration with /hodge command"
  - "Unclear if glob pattern in /hodge will need updates"

nextSteps:
  - "Test checkpoint creation across all phases"
  - "Verify /hodge loads checkpoint files correctly"
  - "Add edge case tests"

context:
  filesModified:
    - ".claude/commands/checkpoint.md"
    - "test/checkpoint.test.ts"
  testsStatus: "4 smoke tests passing"
  conversationHighlights: "Discussed filename collision prevention, settled on seconds in timestamp"
```

### Harden Phase Example
```yaml
timestamp: 2025-10-29T10:22:33Z
phase: harden
featureId: HODGE-358
summary: "Integration tests complete, 2 quality gates failing"

progress:
  - "Added 12 integration tests"
  - "Verified checkpoint loading in /hodge command"
  - "Tested across all phases (explore, build, harden, ship)"

blockers:
  - "ESLint errors in checkpoint validation logic"
  - "TypeScript strict mode issues with YAML parsing"

nextSteps:
  - "Fix ESLint violations in checkpoint-service.ts"
  - "Add proper TypeScript types for checkpoint schema"
  - "Rerun quality checks"

context:
  qualityGates:
    linting: false
    typeChecking: false
    tests: true
    coverage: true
  testCoverage: 87
```

## Design Principles

1. **Token Efficiency**: YAML chosen over Markdown/JSON to conserve tokens during context restoration
2. **Flexibility**: Schema provides structure but allows AI adaptation to specific situations
3. **Progressive Enhancement**: Minimal checkpoints work, comprehensive checkpoints work better
4. **No Manual Pruning**: Keep all checkpoints (typically <5 per feature), newest has precedence
5. **AI Autonomy**: AI determines what's worth saving and document update scope
6. **Seamless Integration**: Works naturally with existing `/hodge` context loading

---

**Remember**: Checkpoints are for conversation continuity, not project state management. They capture "what AI needs to know" after context clearing, not exhaustive change logs.
