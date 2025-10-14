# Exploration: HODGE-344

## Feature Overview
**PM Issue**: HODGE-344
**Type**: general
**Created**: 2025-10-14T04:06:16.044Z

## Title
Unified review workflow with auto-fix and flexible file scoping

## Problem Statement

The `/review` and `/harden` commands have divergent workflows for code review. `/harden` uses a comprehensive auto-fix → CLI tool review → AI review → AI fix process with manifest-based analysis, while `/review` has a completely different architecture focused on profile-based AI analysis. This creates inconsistency and prevents users from leveraging the powerful auto-fix and manifest-based review workflow for arbitrary file scopes outside of feature contexts.

Users need the ability to review and fix arbitrary files (single files, directories, or recent commits) using the same robust workflow that `/harden` provides, but with the flexibility appropriate for ad-hoc code review rather than feature validation.

## Conversation Summary

We explored unifying `/review` with `/harden`'s workflow while maintaining important distinctions:

**Workflow Architecture**: The key insight was reversing the sequence for `/review`. While `/harden` runs auto-fix first (fix-first mindset for production readiness), `/review` should review first then optionally fix (understand-first mindset for advisory analysis). This matches user expectations and simplifies handling of unstaged files.

**File Scoping Methods**: Three explicit ways to specify review scope:
- `--file path.ts` - Review single file
- `--directory src/lib/` - Review all git-tracked files recursively using `git ls-files`
- `--last N` - Review files from last N commits using `git log --diff-filter=d`

**Interactive Fix Selection**: Unlike `/harden` where error fixing is mandatory, `/review` makes all fixes optional. After presenting findings, AI asks which issues the user wants fixed, supporting specific item selection, category-based selection (e.g., "all type errors"), or skipping fixes entirely.

**Git Integration Strategy**: Leveraging git commands for intelligent file selection:
- `git ls-files <directory>` automatically respects `.gitignore` and excludes build artifacts
- `--diff-filter=d` excludes deleted files from `--last N` results
- Include merge commits (they represent real changes)
- Git handles renames automatically (shows new path)

**Tool Scoping Behavior**: Following existing `/harden` pattern where tools that support file lists (eslint, prettier) receive filtered files, while tools that only run project-wide (tsc) continue doing so. This is documented in quality-checks.md.

**Report Persistence**: All review reports saved to `.hodge/reviews/` using the same format as `/harden` reports (Blockers, Warnings, Suggestions sections) for consistency. Reviews are independent of feature context.

**Edge Case Handling**:
- Empty file lists (no commits, no tracked files, non-existent file) → helpful message, no report created, exit 0
- Auto-fix doesn't stage/unstage files (keeps `/review` non-intrusive)
- No critical file selection for `/review` (user explicitly chose targets, review all equally)
- Binary files handled by tools naturally (tools skip them, AI can note them)

## Implementation Approaches

### Approach 1: Extend Existing Review Command (Minimal Disruption)

**Description**: Enhance the current `ReviewCommand` class to support the new workflow while preserving the existing profile-based architecture as a foundation. Add `--fix` and `--review` flags, and implement file scoping logic.

**Pros**:
- Minimal disruption to existing `/review` implementation
- Preserves current profile loading and context aggregation code
- Gradual migration path (can keep old behavior under feature flag)
- Existing tests continue to work with minimal changes

**Cons**:
- Creates complexity by supporting two different code paths (old vs new workflow)
- Profile-based architecture may not align perfectly with manifest-based workflow
- Risk of technical debt accumulating from bridging two paradigms
- Harder to maintain as two workflows diverge over time

**When to use**: If stability and backward compatibility are critical, and we want to minimize risk of breaking existing `/review` functionality.

### Approach 2: Refactor for Workflow Unification (Recommended)

**Description**: Refactor both `/review` and `/harden` to share a common review engine while maintaining their distinct purposes. Extract shared logic (manifest generation, quality checks, critical file selection) into a `ReviewEngineService`, then configure each command with its specific workflow sequence and policies.

**Pros**:
- Single source of truth for review workflow logic (DRY principle)
- Easier to maintain and enhance both commands consistently
- Natural fit for shared utilities (manifest generation, quality checks)
- Clean separation of concerns (engine vs command-specific policy)
- Future commands can reuse the engine (e.g., `/pre-commit-review`)

**Cons**:
- Larger refactoring effort upfront
- Requires careful design of `ReviewEngineService` API
- May need to update tests for both commands
- Could introduce regression risk if not tested thoroughly

**When to use**: When we want long-term maintainability and consistency across review workflows, and we're willing to invest in proper abstraction.

### Approach 3: New Command with Shared Components (Hybrid)

**Description**: Create a new `hodge review` CLI command that implements the unified workflow from scratch, while sharing specific components (AutoFixService, git-utils, quality check runners) with `/harden`. Keep existing `/review` slash command as-is for backward compatibility, deprecate it later.

**Pros**:
- Clean slate for implementing the unified workflow correctly
- No risk of breaking existing `/review` functionality
- Can share proven components (AutoFixService already exists)
- Clear deprecation path for old command

**Cons**:
- Potential duplication during transition period
- Users may be confused by two review commands
- Documentation needs to explain both old and new
- More code to maintain during migration period

**When to use**: When existing `/review` has users we can't break, but we want the freedom to implement the new workflow optimally.

## Recommendation

**Approach 2: Refactor for Workflow Unification** is recommended.

**Rationale**:
1. **Long-term Maintainability**: Having two similar but different review workflows in the codebase creates maintenance burden. Unifying them now prevents future technical debt.

2. **Proven Components**: We already have `AutoFixService` (HODGE-341.6), manifest generation, and quality check running in `/harden`. These are mature and tested. Reusing them reduces risk.

3. **Consistent User Experience**: Users shouldn't have to understand different review paradigms. One unified workflow with different configurations (feature-based vs file-based, mandatory vs optional fixes) is clearer.

4. **Foundation for Future Features**: The `ReviewEngineService` abstraction enables future capabilities like `/pre-commit-review`, IDE integration, or CI/CD hooks without reinventing review logic.

5. **Existing Investment**: HODGE-341.6 already invested in the auto-fix workflow. HODGE-341.3 invested in critical file selection. HODGE-333.4 invested in profile composition. Unifying leverages all these investments.

**Risk Mitigation**:
- Implement `ReviewEngineService` first with comprehensive tests
- Migrate `/harden` to use it (validate no regression)
- Then implement `/review` with the new engine
- Progressive rollout ensures stability at each step

## Test Intentions

### 1. File Scoping Behavior
**Intent**: Verify that each scoping method (`--file`, `--directory`, `--last`) correctly identifies target files.

**Verification**:
- `--file path.ts` returns exactly one file (the specified file)
- `--directory src/lib/` returns all git-tracked files in that directory tree
- `--last 3` returns files modified in the last 3 commits, excluding deleted files
- Empty results handled gracefully (helpful message, no report, exit 0)

### 2. Review-First Workflow Sequence
**Intent**: Confirm that review happens before fixing, matching the advisory nature of the command.

**Verification**:
- `hodge review --file path.ts` runs `--review` flag first to generate manifest
- AI presents findings before asking about fixes
- User can decline fixes and exit with report saved
- Auto-fix only runs if user chooses to fix issues

### 3. Interactive Fix Selection
**Intent**: Ensure users have granular control over which issues get fixed.

**Verification**:
- AI presents findings grouped by severity (blockers, warnings, suggestions)
- User can select specific items (e.g., "Fix items 1, 3, 5")
- User can select by category (e.g., "Fix all type errors")
- User can skip all fixes (e.g., "None")
- Selected fixes are applied via auto-fix + Edit tool

### 4. Tool Scoping Inheritance
**Intent**: Verify tools that support file lists receive them, tools that don't run project-wide.

**Verification**:
- Tools like `eslint` and `prettier` receive filtered file list
- Tools like `tsc` run project-wide (documented in quality-checks.md)
- Quality checks report shows which tools were scoped vs project-wide
- No false positives from unscoped files

### 5. Report Format Consistency
**Intent**: Confirm review reports match `/harden` format for consistency.

**Verification**:
- Reports saved to `.hodge/reviews/` directory
- Report structure matches `/harden`: Blockers, Warnings, Suggestions sections
- Each finding includes: severity, criteria, description, location, rationale, suggested action
- Metadata includes: reviewed timestamp, scope, target, profile, finding counts

### 6. Git Integration Correctness
**Intent**: Ensure git commands correctly filter and identify files.

**Verification**:
- `git ls-files src/lib/` respects `.gitignore` patterns
- `git log --diff-filter=d` excludes deleted files from `--last N`
- Renamed files show up as new path (git handles automatically)
- Merge commits included (represent real changes)
- Binary files handled naturally by tools

### 7. Non-Intrusive File Handling
**Intent**: Verify `/review` doesn't unexpectedly modify git staging area.

**Verification**:
- Auto-fix modifies files but doesn't stage them
- User controls staging separately via `git add`
- Unstaged files remain unstaged after review
- Staged files remain staged after review (but may have modifications)

### 8. Empty File List Handling
**Intent**: Confirm graceful handling when no files match the scope.

**Verification**:
- `--last 5` with 0 commits → "No files to review. No commits found."
- `--directory empty/` with no tracked files → "No files to review. No git-tracked files in directory."
- `--file missing.ts` with non-existent file → "No files to review. File not found or not git-tracked."
- Exit code 0 (not an error)
- No report files created

## Decisions Decided During Exploration

1. **Reversed Workflow Sequence**: Review first (generate manifest, AI analysis), then optionally fix (auto-fix + AI manual fixes). This matches the advisory nature of `/review` vs. the production-ready mandate of `/harden`.

2. **Report Location and Format**: Save reports to `.hodge/reviews/` using the same format as `/harden` reports (Blockers, Warnings, Suggestions sections) for consistency across commands.

3. **Directory Scoping Implementation**: Use `git ls-files <directory>` for directory scoping, which automatically respects `.gitignore` and excludes build artifacts.

4. **Git Log Filtering**: Exclude deleted files from `--last N` using `git log --diff-filter=d`, but include merge commits (they represent real changes).

5. **Non-Intrusive Auto-Fix**: Auto-fix modifies files but doesn't stage/unstage them, keeping `/review` non-intrusive to git workflow.

6. **Critical File Selection**: No critical file selection for `/review` - user explicitly chose targets, so review all equally (unlike `/harden` which scores risk).

7. **Empty File List Behavior**: Handle empty file lists gracefully with helpful message explaining why (no commits, no tracked files, file not found), no report created, exit code 0 (not an error).

8. **Interactive Fix Selection**: After presenting findings, AI asks which issues user wants fixed, supporting specific item selection, category-based selection, or skipping all fixes.

9. **Tool Scoping Inheritance**: Tools inherit existing file scoping behavior from `/harden` - some support file lists (eslint, prettier), some run project-wide (tsc). Document this in quality-checks.md.

10. **Git Utilities Enhancement**: Extend `src/lib/git-utils.ts` with `getFilesFromLastNCommits(count: number)` function using `git log --diff-filter=d` to handle the `--last N` parameter.

## No Decisions Needed

All architectural and implementation questions were resolved during exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to confirm implementation approach
- [ ] Proceed to `/build HODGE-344`

---
*Exploration completed: 2025-10-14T04:06:16.044Z*
*AI exploration completed via conversational discovery*
