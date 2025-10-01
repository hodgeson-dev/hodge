# Build Plan: Fix Non-Interactive CLI Commands

## Feature Overview
**PM Issue**: HODGE-281 (linear)
**Status**: In Progress
**Purpose**: Remove all interactive prompts and fix read-only violations in CLI commands

## Implementation Checklist

### Core Implementation
- [x] Remove interactive prompt from `hodge status`
- [x] Remove HODGE.md update from `hodge status`
- [x] Remove PR confirmation prompt from `hodge ship`
- [x] Ensure session handling works without prompts

### Status Command Fixes
- [x] Remove inquirer prompt (lines 18-30)
- [x] Remove updateHodgeMD() call (line 129)
- [x] Remove HODGE.md notification (line 219)
- [x] Delete entire updateHodgeMD method (lines 222-259)
- [x] Use session feature as default when available
- [x] Remove unused imports (inquirer, HodgeMDGenerator)

### Ship Command Fixes
- [x] Remove PR confirmation prompt
- [x] Auto-create PR for feature/fix branches
- [x] Remove unused imports (inquirer)
- [x] Remove unused env variable

### Quality Checks
- [x] Write smoke tests for status command
- [x] Fix test directory creation issues
- [x] All smoke tests passing (4/4)
- [x] Verify commands work without prompts
- [x] Ensure status is read-only (no HODGE.md updates)

### Additional Work (Build Continuation)
- [x] Remove ALL PR creation code from ship command
- [x] Remove PR imports and dependencies
- [x] Update ship command to note PR creation is manual

## Files Modified
<!-- Track files as you modified them -->
- `src/commands/status.ts` - Removed prompt and HODGE.md updates
- `src/commands/ship.ts` - Removed PR confirmation prompt, auto-create for feature branches
- `.hodge/standards.md` - Added non-interactive requirement
- `src/commands/status.smoke.test.ts` - Created smoke tests for non-interactive status

## Decisions Made
<!-- Document any implementation decisions -->
- Immediate Complete Fix: Remove all prompts since commands are never interactive
- Status should be read-only: No file updates in status commands
- PR Creation Removed: Users will create PRs manually through their preferred platform (GitHub/GitLab/etc)

## Testing Notes
<!-- Notes for testing approach -->
- Test scenario 1
- Test scenario 2

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-281` for production readiness
