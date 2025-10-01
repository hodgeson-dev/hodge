# Build Plan: HODGE-282 - Streamline Ship Workflow

## Feature Overview
**PM Issue**: HODGE-282 (linear)
**Status**: In Progress
**Goal**: Eliminate manual state file editing in ship workflow by implementing Smart State Detection

## Implementation Checklist

### Core Implementation
- [x] Remove interactive prompts from ship command (lines 438-471)
- [x] Remove protected branch confirmation prompts (lines 714-747)
- [x] Verify existing state detection works (lines 349-357)
- [x] Update slash command to save state.json properly

### Integration
- [x] Update ship.md slash command for approve flow
- [x] Update ship.md slash command for edit flow
- [x] Ensure state files are created with correct structure
- [x] Maintain backwards compatibility

### Quality Checks
- [x] Follow non-interactive command standard
- [x] Use existing InteractionStateManager
- [x] Add clear logging for state detection
- [x] Handle edge cases (corrupted state, missing files)

## Files Modified
- `src/commands/ship.ts` - Removed all interactive prompts (35 lines removed)
- `.claude/commands/ship.md` - Added state.json creation for approve/edit flows
- `src/commands/ship.smoke.test.ts` - Created smoke tests for non-interactive behavior

## Decisions Made
- **Smart State Detection**: Ship command checks for pre-approved messages in state.json
- **Complete Non-Interactivity**: Removed ALL prompts since hodge commands are only called by slash commands
- **Protected Branch Handling**: Skip push to protected branches without prompting

## Testing Notes
- Test that ship works without state (fallback to suggested message)
- Test that ship detects and uses pre-approved messages
- Test non-interactive behavior (no prompts ever)
- Test corrupted state file handling
- Test protected branch skipping

## Build Verification
- ✅ Smoke tests pass (5/5 tests)
- ✅ Build compiles successfully
- ✅ Linting passes (no errors)
- ✅ Implementation complete

## Next Steps
Build phase complete! Ready for:
1. Proceed to `/harden HODGE-282` for production readiness