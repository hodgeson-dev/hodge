# Exploration: HODGE-361

**Title**: Add --skip-tests parameter support to /ship AI slash command

**Created**: 2025-10-29
**Status**: Exploring

## Problem Statement

The `hodge ship` CLI command supports a `--skip-tests` flag to bypass quality gates, but the `/ship` AI slash command template has no way to pass this parameter through. Developers occasionally need to commit work that doesn't pass quality gates (emergency fixes, WIP state preservation, broken test infrastructure), and currently have no way to do this through the AI workflow.

## Context

**Project Type**: CLI enhancement

The `/ship` AI slash command template (`.claude/commands/ship.md`) orchestrates a comprehensive 4-step workflow:
1. Analyze git changes
2. Generate rich commit message
3. Interactive approval with optional lessons
4. Run quality checks and commit

The CLI command `hodge ship` already supports `--skip-tests` flag, but the AI template doesn't expose this capability to users. Currently line 672 mentions "Need to skip tests?" with a hint about the flag, but there's no integration into the actual workflow.

## Related Features

- HODGE-001
- HODGE-002
- HODGE-004

## Conversation Summary

The exploration focused on understanding when and why developers need to bypass quality gates, and what level of friction and safety is appropriate. Key insights from the discussion:

**Use Cases**: Quick escape hatch for situations like emergency hotfixes with unrelated test failures, WIP state preservation, or broken test infrastructure. The need is occasional but important.

**User Experience**: Developers should explicitly opt-in via `/ship {{feature}} --skip-tests` syntax rather than being prompted. This keeps the happy path clean while making the escape hatch discoverable through frontmatter documentation.

**Philosophy**: Trust developers to use the feature responsibly without requiring justification, warnings, or other guardrails. The CLI implementation already exists and handles the flag correctly; this is purely about routing the parameter through the AI template.

## Implementation Approaches

### Approach 1: Minimal Template Update with Parameter Pass-Through (Recommended)

**Description**: Update the `/ship` command frontmatter to document `--skip-tests` parameter and modify Step 4 to conditionally pass the flag to the CLI command.

**Implementation Details**:
- Add `--skip-tests` to frontmatter `argument-hint`: `<feature-id> [--skip-tests]`
- Update Step 4 bash commands to detect and pass through the flag
- Add brief documentation in the Troubleshooting section
- No changes to the 4-step workflow or interactive prompts

**Pros**:
- Minimal code changes (only template updates)
- Maintains existing workflow integrity
- Clear documentation through frontmatter
- Leverages existing CLI implementation
- No new complexity or validation logic needed

**Cons**:
- Requires AI to parse and preserve the flag through all steps
- No explicit warning to user about bypassing quality gates

**When to use**: This approach is ideal for simple parameter additions where the CLI already handles all logic and the AI template just needs to route the parameter correctly.

### Approach 2: Enhanced Template with Skip Confirmation

**Description**: Add an explicit confirmation prompt when `--skip-tests` is detected, warning about bypassing quality gates before proceeding.

**Implementation Details**:
- Detect `--skip-tests` flag at start of Step 1
- Show warning prompt: "⚠️ You're about to skip quality gates. Continue? (y/n)"
- Require explicit confirmation before proceeding
- Add justification field to commit message when tests skipped

**Pros**:
- Additional safety through confirmation prompt
- Creates audit trail via commit message documentation
- Makes consequences explicit to user
- Follows "make dangerous actions visible" principle

**Cons**:
- Adds friction counter to "quick escape hatch" philosophy
- Requires additional state tracking through workflow
- More complex template logic
- Goes against "trust developers" decision

**When to use**: This approach would be better if skip-tests should be rare and we want to discourage casual use through additional friction.

### Approach 3: Conditional Workflow Branch

**Description**: Create separate workflow path for `--skip-tests` that skips Step 4 quality validation entirely and goes straight to commit.

**Implementation Details**:
- Detect flag early and branch workflow
- Skip Steps: Quality check reading, validation-results.json verification
- Jump directly from commit message approval to `git commit`
- Different success message acknowledging skipped gates

**Pros**:
- Cleaner separation of concerns (skip path vs normal path)
- Faster execution when skipping (no unnecessary quality checks)
- More explicit about what's being skipped
- Easier to test both paths independently

**Cons**:
- Duplicates commit logic in two places
- More template complexity overall
- Harder to maintain consistency between paths
- Still needs to run quality checks for report generation

**When to use**: This approach makes sense if the skip-tests workflow should be fundamentally different rather than just passing a flag through.

## Recommendation

**Use Approach 1: Minimal Template Update with Parameter Pass-Through**

This approach best aligns with the exploration decisions:
- Quick escape hatch with minimal friction
- Trusts developers to use responsibly
- Leverages existing CLI implementation
- Simple to implement and maintain

The CLI already handles all the `--skip-tests` logic correctly (runs checks but doesn't block on failures). The AI template just needs to preserve and pass through the flag, which is straightforward with minimal template changes.

**Implementation Steps**:
1. Update frontmatter `argument-hint` to document the parameter
2. Modify Step 4 to parse feature argument and extract `--skip-tests` flag
3. Pass flag to CLI: `hodge ship "{{feature}}" --skip-tests`
4. Update troubleshooting section with clear guidance on when to use

## Test Intentions

### Behavioral Expectations

1. **Default behavior preserved**: `/ship {{feature}}` continues to work exactly as before with full quality gate enforcement
2. **Skip-tests parameter works**: `/ship {{feature}} --skip-tests` successfully passes flag to CLI and bypasses quality gates without blocking on failures
3. **Discoverability**: Template frontmatter and troubleshooting section clearly document `--skip-tests` availability and appropriate usage scenarios

## Decisions Decided During Exploration

1. ✓ Use simple parameter pass-through without additional validation or prompts
2. ✓ Add `--skip-tests` to command frontmatter for discoverability
3. ✓ No safety rails, warnings, or justification requirements
4. ✓ Trust developers to use responsibly

## No Decisions Needed

## Next Steps

1. Review exploration
2. Use `/build HODGE-361` to implement
