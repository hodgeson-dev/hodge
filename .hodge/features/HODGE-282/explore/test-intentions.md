# Test Intentions: HODGE-282 - Streamline Ship Workflow

## Purpose
Document what we intend to test for the streamlined ship workflow feature.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Ship command should complete in single execution with pre-approved message
- [ ] Should eliminate manual state file editing
- [ ] Should maintain backwards compatibility with interactive mode
- [ ] Should provide clear user feedback throughout

## State Detection Behavior
- [ ] Ship command should check for existing state.json on startup
- [ ] Should detect when status is "edited" or "confirmed"
- [ ] Should use pre-approved message from state when available
- [ ] Should skip interactive prompts when pre-approved message exists
- [ ] Should log clearly that pre-approved message is being used

## State Management
- [ ] Should clean up state files after successful commit
- [ ] Should handle missing state files gracefully (fallback to interactive)
- [ ] Should handle corrupted state files without crashing
- [ ] Should preserve multi-line messages correctly
- [ ] Should not interfere with normal interactive flow when no state exists

## Slash Command Integration
- [ ] Slash command should create proper state.json structure
- [ ] Should set correct status ("edited") when user approves
- [ ] Should include full message in data.edited field
- [ ] Should handle escape characters in commit messages
- [ ] Should create directory structure if not exists

## User Experience
- [ ] Single run of ship command should work with pre-approved message
- [ ] No manual file editing required
- [ ] Clear feedback about what's happening
- [ ] Seamless transition from slash command to CLI command
- [ ] Preserve rich commit message formatting

## Edge Cases
- [ ] Handle when state exists but no edited message
- [ ] Handle when multiple ship processes might conflict
- [ ] Handle when git commit fails (should preserve state for retry)
- [ ] Handle when user cancels after approval
- [ ] Handle race conditions between slash and CLI commands

## Performance Criteria
- [ ] State detection should add < 10ms overhead
- [ ] File operations should be atomic where possible
- [ ] Should not block on file I/O unnecessarily
- [ ] State cleanup should be immediate after success

## Test Scenarios

### Happy Path
1. User runs `/ship HODGE-282`
2. Slash command generates commit message
3. User approves with 'a'
4. State saved with edited message
5. `hodge ship HODGE-282` uses pre-approved message
6. Commit succeeds, state cleaned up

### Edit Flow
1. User runs `/ship HODGE-282`
2. User chooses 'e' to edit
3. Provides edited message
4. State saved with custom message
5. Ship command uses edited message

### Direct CLI Usage
1. User runs `hodge ship HODGE-282` directly
2. No state file exists
3. Falls back to normal interactive flow
4. Works as before

### Error Recovery
1. State file exists but is corrupted
2. Ship command logs warning
3. Falls back to interactive mode
4. User can still complete shipping

## Notes
Implementation approach decided: Smart State Detection
- Minimal code changes required
- Uses existing InteractionStateManager
- Maintains architectural principles

---
*Test intentions for streamlined ship workflow - to be converted to actual tests during build phase.*