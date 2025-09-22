# Test Intentions: HODGE-242 - Fix Ship Commit Message Workflow

## Purpose
Document behaviors to verify when implementing the improved commit message workflow.
These test intentions will guide the creation of actual tests during build/harden phases.

## Core Requirements: Message Generation
- [ ] Ship generates detailed commit messages based on actual git diff
- [ ] Messages include specific files changed with statistics
- [ ] Changes are categorized by type (features, tests, docs, dependencies)
- [ ] Conventional commit format is used (fix:, feat:, test:, docs:, etc.)
- [ ] Issue IDs are included when available (Closes HODGE-XXX)

## Interactive Workflow Requirements
- [ ] Users see generated message before committing
- [ ] Options provided: approve, regenerate, edit, cancel
- [ ] Edit option allows modification of the message
- [ ] Regenerate creates a new message with different wording
- [ ] Cancel exits without making any changes

## State Management Requirements
- [ ] Edited messages are preserved between ship command runs
- [ ] State files don't regenerate if user has made edits
- [ ] --yes flag respects edited messages if they exist
- [ ] State is cleaned up after successful commit
- [ ] Failed ships don't corrupt state for next attempt

## Environment-Specific Behavior
- [ ] Claude Code: File-based interaction via ui.md works correctly
- [ ] Terminal: Interactive prompts work with inquirer
- [ ] CI/CD: --yes flag generates smart message without interaction
- [ ] --no-interactive flag works without prompts

## Message Quality Checks
- [ ] Never generates generic "Implementation complete" messages
- [ ] Package.json changes show specific dependency updates
- [ ] Test file additions show test count and coverage impact
- [ ] Breaking changes are highlighted with warnings
- [ ] Multi-line descriptions preserve formatting

## Edge Case Handling
- [ ] Empty/minimal changes still generate meaningful message
- [ ] Large changesets are summarized without overwhelming detail
- [ ] Binary file changes are noted appropriately
- [ ] Merge commits are handled correctly
- [ ] Renamed files show as moves, not add/delete

## Example Scenarios to Test

### Scenario 1: Feature Implementation
**Given**: Multiple source files changed, new tests added
**When**: Running `hodge ship HODGE-XXX`
**Then**: Message describes feature, lists key changes, mentions tests

### Scenario 2: Bug Fix with Tests
**Given**: Fix in source file, regression test added
**When**: Running ship command
**Then**: Message starts with "fix:", explains issue and solution

### Scenario 3: Dependency Updates
**Given**: package.json and package-lock.json changed
**When**: Running ship
**Then**: Message lists each dependency change with versions

### Scenario 4: Documentation Only
**Given**: Only .md files changed
**When**: Running ship
**Then**: Message starts with "docs:", summarizes doc changes

### Scenario 5: Edit Persistence
**Given**: User edits message and ship fails (e.g., test failure)
**When**: Re-running ship after fixing issue
**Then**: Previous edit is preserved and used

## Integration Points to Verify
- [ ] Git operations execute correctly
- [ ] PM tracking updates with shipped status
- [ ] Pattern learning receives rich commit data
- [ ] Auto-save triggers before operations
- [ ] Husky hooks don't interfere with commit

## Performance Expectations
- [ ] Message generation completes in < 2 seconds
- [ ] Git analysis doesn't hang on large diffs
- [ ] State operations are near-instant (< 100ms)
- [ ] Interactive prompts respond immediately
- [ ] No UI freezing during generation

## Regression Tests
- [ ] Existing ship functionality still works
- [ ] --skip-tests flag still functions
- [ ] --dry-run shows preview without committing
- [ ] --push flag still pushes after commit
- [ ] PM integration remains functional

## Notes
- Focus on behavior, not implementation details
- Test the user experience, not internal functions
- Ensure backward compatibility with existing workflows
- Consider both happy path and error scenarios

---
*Test intentions created during exploration. Will be converted to actual tests in build/harden phases.*