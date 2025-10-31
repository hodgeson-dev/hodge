# Exploration: HODGE-369

**Title**: Remove unused ship command options and require commit message

**Created**: 2025-10-31
**Status**: Exploring

## Problem Statement

The `hodge ship` command has accumulated many unused CLI options (push flags, dry-run, interactive prompts) that aren't used by the AI slash command workflow. The command should be simplified to match its actual usage: a non-interactive, AI-orchestrated command that always creates a commit with a required message.

## Context

**Project Type**: Refactoring / Technical Debt
**Current Behavior**: Ship command has 11 CLI options, but only `--skip-tests` is used by the `/ship` slash command
**Complexity Source**: Historical accumulation of options for features that were never implemented or are incompatible with AI-orchestrated design

## Conversation Summary

Through analysis of the codebase, we identified that:

1. **Actual Usage**: The `/ship` slash command only uses the `--skip-tests` flag, extracted from the feature argument
2. **Message Passing**: Current approach uses `InteractionStateManager` to write temporary state files, but this is unnecessarily complex given CLI argument length limits (32KB+) far exceed typical commit messages (500-2000 chars)
3. **Semantic Correctness**: Ship without commit doesn't make sense - the command's purpose is to finalize and commit the feature
4. **AI-Orchestrated Design**: Command should be deterministic and non-interactive, matching the pattern where AI generates content and CLI executes structure

Key findings from code analysis:
- `InteractionStateManager` is ONLY used by `ShipService.resolveCommitMessage()`
- No other commands depend on ship's removed options
- Tests exist for removed options in `ship.integration.test.ts` and `ship.smoke.test.ts`
- Push-related code in `git-utils.ts` is used by other features, should not be removed

## Related Features

- HODGE-001, HODGE-002, HODGE-004 (similar features found)
- HODGE-336 (InteractionStateManager pattern introduction)
- HODGE-327.1 (Slash command file creation pattern)

## Implementation Approaches

### Approach 1: Minimal Removal
**Description**: Remove only the unused CLI options and their tests, keep InteractionStateManager for future use

**Pros**:
- Least code change
- Preserves InteractionStateManager for potential future commands
- Lower risk of breaking changes

**Cons**:
- Leaves complexity in codebase (InteractionStateManager still maintained)
- Doesn't address root issue of message passing approach
- Half-measure that doesn't fully align with design principles

**When to use**: When unsure about future requirements or wanting minimal risk

### Approach 2: Complete Simplification (Recommended)
**Description**: Remove unused options AND InteractionStateManager, require message via `-m` flag

**Pros**:
- Aligns perfectly with AI-orchestrated design (AI generates, CLI executes)
- Eliminates entire temporary file system (`.hodge/temp/ship-interaction/`)
- Simpler code = easier to maintain and understand
- Makes contract explicit: message required, always commits
- Removes ~300 lines of unused code (interaction-state.ts)

**Cons**:
- Larger change scope (more files touched)
- Need to update slash command template to pass message via CLI
- Cannot easily revert to file-based approach later

**When to use**: When committed to current design and want clean architecture

### Approach 3: Progressive Deprecation
**Description**: Mark options as deprecated, remove in future release

**Pros**:
- Gives time for any unknown usages to surface
- Can communicate deprecation to users (if any exist)
- Staged removal reduces risk

**Cons**:
- Unnecessary for internal command not exposed to users
- Prolongs maintenance burden
- Commands are marked `[Internal]` - no backward compatibility needed

**When to use**: For public APIs with external users (not applicable here)

## Recommendation

**Approach 2: Complete Simplification**

This approach best aligns with Hodge's principles and the reality of how the command is used:

**Rationale**:
1. **Single Source of Truth**: Slash command is the ONLY user of ship command - optimize for that
2. **Semantic Correctness**: Ship always commits (it's in the name), message is essential context
3. **Complexity Reduction**: Removes entire file-based state management system
4. **CLI Architecture Standard**: Matches "AI writes content, CLI creates structure" principle
5. **Technical Feasibility**: Message length is not a limiting factor

**Implementation Strategy**:
1. Remove unused CLI options from `src/bin/hodge.ts`
2. Update `ShipOptions` interface to remove unused properties
3. Simplify `ShipService.resolveCommitMessage()` - remove InteractionStateManager logic
4. Make `--message` required in CLI definition
5. Delete `src/lib/interaction-state.ts` entirely
6. Remove tests for removed options
7. Update `.claude/commands/ship.md` to pass message via `-m` flag
8. Add validation that message is provided (fail fast with clear error)

## Test Intentions

Behavioral expectations for the simplified ship command:

1. **Message Required**: Ship command should fail with clear error when no message is provided
2. **Message Acceptance**: Ship command should accept commit message via `-m, --message` flag
3. **Always Commits**: Ship command should always create a git commit (no skip option exists)
4. **Test Control**: Ship command should support optional `--skip-tests` flag for test execution bypass
5. **Prerequisites Check**: Ship command should fail with clear error if feature has not been hardened
6. **Quality Gates**: Ship command should run all quality gates (tests, lint, typecheck) before committing
7. **Cleanup**: Ship command should not leave any temporary interaction state files
8. **Zero Traces**: Removed options should have zero references in codebase, tests, or documentation

## Decisions Decided During Exploration

1. ✓ **Remove InteractionStateManager** - use direct message passing via CLI flag instead of temporary file system
2. ✓ **Make `--message` flag required** - command fails with clear error if not provided
3. ✓ **Remove push-related options** - `--push`, `--no-push`, `--push-branch`, `--force-push`, `--continue-push` (not used by AI workflow)
4. ✓ **Remove interactive options** - `--no-interactive`, `--yes`, `-y` (command is non-interactive by design)
5. ✓ **Remove `--dry-run` option** - not used by AI workflow, adds complexity without value
6. ✓ **Remove `--no-commit` option** - ship semantically means commit, no-commit doesn't make sense
7. ✓ **Delete `src/lib/interaction-state.ts`** - becomes completely orphaned after ship simplification
8. ✓ **Update `.claude/commands/ship.md`** - pass message directly via `-m` flag instead of state files

## No Decisions Needed

All architectural decisions were resolved during the exploration conversation. Ready to proceed to build phase.