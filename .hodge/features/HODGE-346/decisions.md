# Decisions: HODGE-346 - Unified UX System

## Decision: Layered Verification Strategy for Slash Command Changes

**Date**: 2025-10-16
**Context**: HODGE-346 epic modifies AI prompt templates (`.claude/commands/*.md`) that control Claude Code's conversational behavior. Traditional automated testing is insufficient for verifying AI interactions.

**Decision**: Use the layered verification workflow documented in `.hodge/patterns/slash-command-verification-pattern.md`

**Rationale**:
- AI prompt templates control emergent behavior, not deterministic logic
- Four complementary verification layers catch different issue types:
  1. **Automated tests**: Structural regressions and consistency rules
  2. **AI diff analysis**: Semantic changes using git-based baseline retrieval
  3. **Manual smoke tests**: End-to-end behavior and subjective qualities
  4. **Diff review**: Human safety check before commit

**Git-Based Baseline Approach**:
- Use `buildStartCommit` from ship-record.json to retrieve old template versions
- No backup directory needed - git history is source of truth
- Example: `git show $baseline:.claude/commands/explore.md`

**Implementation**:
- All 5 sub-features (HODGE-346.1 through 346.5) will follow this pattern
- Characterization tests written in 346.1 (first story)
- UX compliance tests enforce consistency across all commands
- Each story includes AI diff analysis and manual verification

**Consequences**:
- More thorough verification than code-only changes
- Catches subjective quality issues (tone, clarity, delight)
- Increases confidence in AI template modifications
- Reusable pattern for future slash command work

**Alternatives Considered**:
1. Automated tests only - insufficient for AI behavior
2. Manual testing only - not scalable, no regression detection
3. Backup directory approach - redundant with git history

**References**:
- Pattern: `.hodge/patterns/slash-command-verification-pattern.md`
- UX Profile: `.hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml`
- Epic Plan: `.hodge/features/HODGE-346/plan.json`
