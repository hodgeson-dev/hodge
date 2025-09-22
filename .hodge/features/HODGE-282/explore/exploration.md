# Exploration: HODGE-282 - Streamline Ship Workflow

## Problem Analysis
The current ship workflow requires multiple manual steps when approving commit messages:
1. Slash command generates message and saves to ui.md
2. User approves with 'a'
3. Ship CLI command doesn't read the approved message
4. Have to manually update state.json with "edited" status
5. Have to manually add the full message to state.json
6. Re-run ship command to finally use the approved message

**Pain Points Identified:**
- Disconnect between slash command and CLI command state
- Ship command doesn't check for pre-approved messages
- Multiple file edits required (ui.md and state.json)
- Multiple executions of ship command needed
- User experience is fragmented and confusing

## Context
- **Date**: 9/22/2025
- **Mode**: Explore (Enhanced)
- **Standards**: Suggested (loaded)
- **Architecture**: InteractionStateManager exists but isn't properly utilized


## Similar Features
- HODGE-281 (non-interactive commands)
- HODGE-242 (rich commit messages)
- HODGE-229 (PM integration)



## Recommended Approaches


### Approach 1: Direct Message Passing (85% relevant)
**Description**: Pass approved commit message directly to ship command via flag or environment

**Pros**:
- Simple implementation - add --message flag
- No state file complexity
- Works immediately without waiting
- Clear and explicit flow

**Cons**:
- Requires escaping complex messages
- Command line length limitations
- Less elegant than state-based approach

**Implementation**:
```bash
# Slash command would run:
hodge ship HODGE-282 --message="fix: streamline ship workflow..."
```

### Approach 2: Smart State Detection (90% relevant) ⭐ RECOMMENDED
**Description**: Ship command automatically detects and uses pre-approved messages from state files

**Pros**:
- Uses existing InteractionStateManager infrastructure
- No command line complexity
- Maintains separation of concerns
- Works with rich, multi-line messages
- Follows Progressive Enhancement pattern

**Cons**:
- Requires ship command modifications
- State file management complexity

**Implementation Steps**:
1. Ship command checks for existing state.json on startup
2. If status is "edited" or "confirmed", use the edited message
3. Skip interactive prompts when pre-approved message exists
4. Clear state after successful use

### Approach 3: Unified Workflow Command (75% relevant)
**Description**: Create single command that handles entire ship workflow end-to-end

**Pros**:
- One command for entire workflow
- Complete control over UX
- No state synchronization issues

**Cons**:
- Duplicates existing functionality
- More code to maintain
- Breaks separation between slash and CLI commands


## Recommendation
Based on the analysis, **Smart State Detection** appears most suitable because:
- Highest relevance score (90%)
- Uses existing infrastructure (InteractionStateManager)
- Maintains architectural principles
- Provides best user experience
- Minimal code changes required


## Technical Design

### Current Flow (Broken)
```
1. /ship → generates message → saves to ui.md
2. User approves → slash command should update state.json
3. hodge ship → ignores state, regenerates message
4. Manual fix needed → update state.json manually
5. Re-run hodge ship → finally uses edited message
```

### Proposed Flow (Fixed)
```
1. /ship → generates message → saves to ui.md + state.json
2. User approves → slash command updates state to "edited"
3. hodge ship → detects edited state → uses pre-approved message
4. Success → clears state files
```

### Code Changes Required

#### 1. Ship Command (ship.ts:353-365)
```typescript
// Check for pre-approved message from slash command
const stateManager = new InteractionStateManager<ShipInteractionData>('ship', feature);
const existingState = await stateManager.load();

if (existingState?.status === 'edited' && existingState.data.edited) {
  commitMessage = existingState.data.edited;
  console.log(chalk.green('✅ Using pre-approved commit message'));
} else {
  // Existing interactive flow...
}
```

#### 2. Slash Command (ship.md)
When user approves with 'a', properly save state:
```bash
# Update both ui.md AND state.json with approved message
cat > .hodge/temp/ship-interaction/{{feature}}/state.json << EOF
{
  "status": "edited",
  "data": {
    "edited": "[approved message]"
  }
}
EOF
```


## Implementation Hints
- Check for state.json in ship command constructor
- Load pre-approved message if status is "edited"
- Skip prompts when message exists
- Add clear logging about using pre-approved message
- Clean up state files after successful commit
- Handle edge cases (corrupted state, missing files)

## Test Intentions
- [ ] Ship command detects pre-approved messages
- [ ] State files are properly cleaned after use
- [ ] Fallback to interactive mode if no state exists
- [ ] Rich multi-line messages are preserved correctly
- [ ] Error handling for corrupted state files

## Next Steps
- [ ] Review the recommended approaches
- [ ] Consider Smart State Detection approach
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-282`

---
*Enhanced exploration for ship workflow streamlining (2025-09-22T05:35:00.000Z)*