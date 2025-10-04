# Exploration: HODGE-324

## Title
Fix lessons learned generation timing in /ship command

## Feature Overview
**PM Issue**: HODGE-324
**Type**: bug fix
**Created**: 2025-10-04T01:16:53.483Z

## Problem Statement
The `/ship` command generates lessons learned after the git commit executes, which means the lessons are never committed with the feature work that generated them. This breaks the principle of keeping project knowledge in version control and creates orphaned lessons files that exist only in the working directory.

## Conversation Summary

### Current Broken Flow
Looking at the codebase, the issue manifests in two places:
1. **CLI Code** (src/commands/ship.ts:301): `generateLessonsDraft()` is called AFTER the git commit happens (line 320-325)
2. **Slash Command Template** (.claude/commands/ship.md): Step 5 (lessons enhancement, lines 212-353) happens AFTER Step 4 (`hodge ship` execution and commit)

This means:
- Code changes get committed first
- Then lessons-draft.md gets created (never committed)
- Then AI enhancement creates the finalized lesson (also never committed)
- Result: Lessons exist only locally, not in version control

### Design Decisions Made
Through conversation, we established:
1. **Timing**: Lessons should be captured BEFORE the commit (between Step 3 and Step 4)
2. **What to commit**: Only the finalized AI-enhanced `.hodge/lessons/{feature}-{slug}.md` (not the draft)
3. **User choice**: Keep lessons optional - users can skip if desired
4. **CLI responsibility**: Remove `generateLessonsDraft` from CLI entirely
5. **Draft handling**: No draft created if user skips lessons
6. **Staging**: The existing `git add -A` in ship command handles staging lessons files
7. **Template flow**: Ask "Want to document lessons?" upfront, before running `hodge ship`

### Key Insights
- The draft file was intended as a starting point for AI enhancement, but creates unnecessary file clutter
- Slash command should own the entire lessons workflow, not split between CLI and template
- Lessons are documentation artifacts that belong in version control with the feature
- Making lessons optional respects user workflow preferences while encouraging best practice

## Implementation Approaches

### Approach 1: Template Reordering (Recommended)
**Description**: Restructure the `/ship` slash command template to capture lessons before calling `hodge ship`, and remove draft generation from the CLI.

**Changes Required**:
1. Move Step 5 (lessons enhancement) to new Step 3.5 (between commit approval and ship execution)
2. Delete `generateLessonsDraft()` method and its call from ship.ts
3. Update template to create finalized lesson directly (skip draft entirely)
4. Ensure `git add -A` in ship command stages any created lessons files

**Pros**:
- Clean separation: Slash command owns lessons, CLI owns commit
- Lessons get committed with the feature automatically
- No orphaned draft files
- Minimal code changes (mostly template reordering)
- User experience flows naturally: approve message → document lessons → ship

**Cons**:
- Changes the user flow (lessons come earlier)
- Users must decide about lessons before seeing ship output

**When to use**: This is the correct approach for fixing the root cause while maintaining clean architecture.

### Approach 2: Post-Commit Lessons Commit
**Description**: Keep current flow but add a second commit step after lessons are documented.

**Changes Required**:
1. Keep `generateLessonsDraft()` in ship.ts after main commit
2. Add template instructions to stage and commit lessons after Step 5
3. Create a second commit with message like "docs: add lessons learned for {feature}"

**Pros**:
- Minimal changes to existing flow
- Lessons are still committed (just separately)
- Clear separation between feature commit and documentation commit

**Cons**:
- Creates two commits for one feature (pollutes git history)
- User might skip the second commit step
- Draft still exists and may not be committed
- More complex workflow with multiple commit steps

**When to use**: If we want to preserve the current flow order, but this is suboptimal.

### Approach 3: CLI-Driven Lessons
**Description**: Move all lessons logic into the CLI before the commit, remove from slash command.

**Changes Required**:
1. Move `generateLessonsDraft()` call to before the commit in ship.ts
2. Make CLI interactive to ask lessons questions (violates AI-orchestrated standard)
3. Remove lessons steps from slash command template

**Pros**:
- Single source of truth (all in CLI)
- Guaranteed to be committed together

**Cons**:
- Violates CLI Architecture Standard (AI-orchestrated commands must be non-interactive)
- Removes AI's ability to do sophisticated lessons analysis
- Makes CLI more complex and harder to test
- Loses conversational lessons enhancement

**When to use**: Never - violates established architecture standards.

## Recommendation

**Use Approach 1: Template Reordering**

This approach correctly fixes the bug while maintaining clean architecture boundaries:
- The slash command (AI-driven) handles interactive lessons enhancement
- The CLI command (non-interactive) handles git commit mechanics
- Lessons are captured before commit, ensuring they're included in version control
- No draft files clutter the workspace
- User flow remains simple and linear

The fix is primarily in the template (ship.md) with minimal CLI changes (removing ~50 lines of draft generation code). This aligns with Hodge's philosophy that slash commands coordinate AI workflows while CLI commands execute discrete operations.

## Test Intentions

### Behavior 1: Lessons Enhancement Timing
**What it does**: Lessons enhancement prompts appear before `hodge ship` executes
**How to verify**: Run `/ship` command, observe that lessons questions come before "Creating git commit..." message

### Behavior 2: Lessons Committed With Feature
**What it does**: When user chooses to document lessons, finalized lesson file is created and staged before commit
**How to verify**: Document lessons when prompted, then check `git log --stat` to confirm `.hodge/lessons/{feature}-{slug}.md` is in the commit

### Behavior 3: Skip Lessons Workflow
**What it does**: When user skips lessons, no draft or lesson files are created
**How to verify**: Skip lessons when prompted, confirm no files exist at `.hodge/features/{feature}/ship/lessons-draft.md` or `.hodge/lessons/{feature}*.md`

### Behavior 4: Git Staging Behavior
**What it does**: The `git add -A` in ship command stages lessons files if they exist
**How to verify**: Create a lesson, check `git status` before `hodge ship` runs, confirm lesson is staged in the final commit

### Behavior 5: No Draft Generation
**What it does**: CLI no longer generates lessons-draft.md file
**How to verify**: Search ship.ts for `generateLessonsDraft`, confirm method is deleted; run ship command, confirm no draft file created

## Decisions Needed

### Decision 1: Lessons Enhancement Timing
**Question**: Should lessons enhancement happen between Step 3 (commit message approval) and Step 4 (`hodge ship` execution)?
**Context**: Moving lessons before the commit ensures they're included in version control
**Options**: (a) Between Step 3 and 4, (b) After Step 4 with second commit, (c) Keep current broken flow
**Recommendation**: Option (a) - captured in conversation

### Decision 2: What to Commit
**Question**: Should we commit the draft, the finalized lesson, or both?
**Context**: Draft is a working artifact, finalized lesson is the polished documentation
**Options**: (a) Draft only, (b) Finalized only, (c) Both
**Recommendation**: Option (b) - captured in conversation

### Decision 3: Optional vs Required
**Question**: Should lessons documentation be required before shipping?
**Context**: Current template makes lessons optional with user prompt
**Options**: (a) Keep optional, (b) Make required, (c) Hybrid (draft required, enhancement optional)
**Recommendation**: Option (a) - captured in conversation

### Decision 4: CLI Draft Generation
**Question**: Should the CLI continue to generate lessons-draft.md?
**Context**: Moving lessons to slash command makes CLI draft generation redundant
**Options**: (a) Keep it, (b) Remove it, (c) Move it earlier
**Recommendation**: Option (b) - captured in conversation

### Decision 5: Skip Lessons Handling
**Question**: What happens if user skips lessons documentation?
**Context**: Need to handle the no-lessons path cleanly
**Options**: (a) No draft created, (b) Draft created but not committed, (c) Explicit cleanup
**Recommendation**: Option (a) - captured in conversation

### Decision 6: Git Staging Strategy
**Question**: How should lessons files be staged for commit?
**Context**: Lessons file needs to be staged before `hodge ship` commits
**Options**: (a) Stage in slash command, (b) CLI stages everything with git add -A, (c) Separate explicit git add
**Recommendation**: Option (b) - captured in conversation

### Decision 7: Template Flow Structure
**Question**: How should the lessons prompt be integrated into the ship workflow?
**Context**: Need clear, simple user experience
**Options**: (a) Ask upfront y/n then enhance, (b) Progressive with skip options, (c) Preview first
**Recommendation**: Option (a) - captured in conversation

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to formalize the 7 decisions
- [ ] Proceed to `/build HODGE-324` to implement template reordering approach

---
*Exploration completed: 2025-10-04T01:20:00.000Z*
