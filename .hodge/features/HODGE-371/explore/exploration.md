# Exploration: HODGE-371

**Title**: CLI options cleanup - remove unused commands and options across all internal commands

**Created**: 2025-10-31
**Status**: Exploring

## Problem Statement

Following the pattern established in HODGE-369 (ship command cleanup), we need to audit all internal hodge commands and remove unused commands, unused options, orphaned code, and associated tests that aren't called by any slash commands in `.claude/commands/`. This will reduce code complexity, improve maintainability, and ensure the CLI surface area matches actual usage patterns.

## Context

**Project Type**: Refactoring / Technical Debt
**Current Behavior**: Internal hodge commands have accumulated options and even entire commands that are never used by slash commands
**Complexity Source**: Historical accumulation of experimental features, legacy options, and commands that were planned but never integrated into the AI workflow
**Related Work**: HODGE-369 successfully removed 11 unused options from ship command and eliminated 1,734 lines of code

## Conversation Summary

Through systematic analysis of all internal commands against their actual usage in `.claude/commands/`, we identified significant cleanup opportunities:

### Complete Commands to Remove
- **`todos` command**: Not called anywhere in slash commands, entire command and implementation can be removed
- **`link` command**: Not called anywhere in slash commands, entire command and implementation can be removed

### Options to Remove by Command

**explore command**:
- `--force`: Never mentioned in slash commands
- `--from-spec`: Not used in current slash command workflows
- `--pre-populate`: Explicitly marked "(legacy)" in code
- `--decisions`: Explicitly marked "(legacy)" in code

**harden command**:
- `--auto-fix`: Redundant with `--fix` which is actually used in slash commands

**context command**:
- `--list`: Not used in slash commands (only `--feature` is used)
- `--recent`: Not used in slash commands
- `--todos`: Not used in slash commands

### Patterns to Keep
- Optional `[feature]` parameter on commands (build, harden, ship, plan, status) - this is a consistent pattern for context-aware commands
- All options that ARE used in slash commands (verified through grep analysis)

### Scope Boundary
The `init` command is user-facing (not marked `[Internal]`), so it's explicitly out of scope for this cleanup.

### Cleanup Strategy
Following the HODGE-369 pattern:
1. Remove command/option definitions from `src/bin/hodge.ts`
2. Remove implementation code from command files
3. Identify and remove orphaned code (services/utilities only used by removed features)
4. Remove complete test files for removed commands
5. Remove specific test cases for removed options within remaining test files

## Related Features

- HODGE-369: Ship command cleanup (established the pattern for this work)
- HODGE-327.1: Slash Command File Creation Pattern (defines AI-orchestrated command principles)
- HODGE-321: CLI Architecture Standards (non-interactive AI-orchestrated design)

## Implementation Approaches

### Approach 1: Incremental Removal
**Description**: Remove commands and options one at a time across multiple features, validating each removal independently

**Pros**:
- Lower risk per change
- Easier to review each removal
- Can stop if unexpected issues arise
- Smaller commits

**Cons**:
- Longer timeline to complete full cleanup
- More overhead in testing and review cycles
- Code remains partially cleaned during transition
- Multiple features to track

**When to use**: When unsure about ripple effects or needing staged rollout

### Approach 2: Complete Cleanup in Single Feature (Recommended)
**Description**: Remove all unused commands and options in a single comprehensive cleanup, following the HODGE-369 pattern

**Pros**:
- Consistent with HODGE-369 precedent (removed 11 options + orphaned code at once)
- Single comprehensive test cycle
- Clean before/after state (no partial cleanup)
- Faster overall completion
- Clear scope boundary
- All related test cleanup happens together

**Cons**:
- Larger changeset to review
- Higher initial risk if analysis is wrong
- Harder to revert specific parts

**When to use**: When confident in usage analysis and wanting efficient cleanup

### Approach 3: Remove Commands Only, Keep Options
**Description**: Remove `todos` and `link` commands but preserve unused options for potential future use

**Pros**:
- Removes most significant dead code (entire commands)
- Preserves optionality for future features
- Smaller scope reduces risk

**Cons**:
- Leaves technical debt (unused options)
- Inconsistent with HODGE-369 pattern
- Still need to maintain unused code paths
- Half-measure that doesn't fully address the problem

**When to use**: When there are concrete plans to use the options in future

## Recommendation

**Approach 2: Complete Cleanup in Single Feature**

This approach best aligns with Hodge's principles and the proven HODGE-369 pattern:

**Rationale**:
1. **Proven Pattern**: HODGE-369 successfully removed 11 options + InteractionStateManager in single feature, setting the precedent
2. **Clear Analysis**: Grep analysis of slash commands provides definitive proof of non-usage
3. **Efficiency**: Single comprehensive cleanup is faster than multiple incremental features
4. **Clean Architecture**: Eliminates all dead code at once, no partial cleanup state
5. **Maintainability**: Reduces CLI surface area to only what's actually used
6. **Testing**: Comprehensive test cleanup happens together, ensuring consistency

**Implementation Strategy**:
1. Remove `todos` and `link` command definitions from `src/bin/hodge.ts`
2. Remove `src/commands/todos.ts` and `src/commands/link.ts` (plus any supporting files)
3. Remove unused options from `explore`, `harden`, and `context` commands in `src/bin/hodge.ts`
4. Update command implementations to remove handling for removed options
5. Identify orphaned code:
   - Services/utilities only used by removed commands
   - Implementation code for removed options in ContextCommand, ExploreCommand, HardenCommand
6. Remove complete test files for `todos` and `link` commands
7. Remove specific test cases for removed options within other test files
8. Verify no references remain via grep/search

**Files Expected to Change**:
- `src/bin/hodge.ts` - Remove command/option definitions
- `src/commands/todos.ts` - DELETE entire file
- `src/commands/link.ts` - DELETE entire file
- `src/commands/explore.ts` - Remove option handling
- `src/commands/harden.ts` - Remove option handling
- `src/commands/context.ts` - Remove option handling
- Test files - Remove complete files and specific test cases
- Any orphaned utilities/services discovered during implementation

## Test Intentions

Behavioral expectations for the cleaned-up command set:

1. **Removed Commands Unavailable**: `hodge todos` and `hodge link` should fail with "unknown command" error
2. **Removed Options Rejected**: Using removed options (e.g., `hodge explore --force`) should fail with "unknown option" error
3. **Used Options Still Work**: All options that ARE used in slash commands continue to function correctly
4. **Feature Parameter Pattern**: Optional `[feature]` parameter continues to work on build, harden, ship, plan, status commands
5. **No Orphaned Code**: Grep/search for removed command names returns zero results in src/ (excluding this exploration)
6. **No Orphaned Tests**: Test files for removed commands are deleted, test cases for removed options are removed
7. **Clean Help Output**: `hodge --show-internal --help` doesn't show removed commands or options
8. **Zero Regressions**: All existing slash command workflows continue to work without modification

## Decisions Decided During Exploration

1. ✓ **Remove `todos` command entirely** - not called in any slash commands
2. ✓ **Remove `link` command entirely** - not called in any slash commands
3. ✓ **Remove `explore` options**: `--force`, `--from-spec`, `--pre-populate`, `--decisions` - none used in slash commands, some marked legacy
4. ✓ **Remove `harden` option**: `--auto-fix` - only `--fix` is used in slash commands
5. ✓ **Remove `context` options**: `--list`, `--recent`, `--todos` - only `--feature` is used in slash commands
6. ✓ **Keep `[feature]` parameter** wherever it appears - consistent pattern across commands
7. ✓ **Remove all orphaned code** - services, utilities, implementation code only used by removed features
8. ✓ **Remove complete test files** for `todos` and `link` commands
9. ✓ **Remove specific test cases** within other test files that verify removed options
10. ✓ **Init command out of scope** - it's user-facing (not internal), excluded from this cleanup

## No Decisions Needed

All architectural and implementation decisions were resolved during the exploration conversation. Ready to proceed to build phase.
