# Exploration: HODGE-344.4

## Feature Overview
**PM Issue**: HODGE-344.4
**Parent Feature**: HODGE-344 (Unified review workflow with auto-fix and flexible file scoping)
**Type**: sub-feature
**Created**: 2025-10-15T01:27:01.006Z

## Title
Review command integration with CLI orchestration and slash command template

## Problem Statement

The ReviewEngineService and supporting utilities (git file scoping, manifest generation) exist but lack user-facing integration. Developers need a `/review` slash command that orchestrates advisory code reviews for arbitrary file scopes (`--file`, `--directory`, `--last N`) with a review-first workflow (analyze → present findings → optionally fix) distinct from `/harden`'s fix-first production validation.

Without this integration layer, the infrastructure built in HODGE-344.1 (git utilities), HODGE-344.2 (manifest generation), and HODGE-344.3 (ReviewEngineService) remains inaccessible to users. This story bridges the gap between backend services and user experience by creating both the AI-orchestrated CLI command and the slash command template that guides AI-user interaction.

## Parent Context

**Parent Epic**: HODGE-344 established unified review workflow with review-first sequence for `/review`:
1. Generate manifest (language detection, profile selection)
2. Run quality checks (raw tool outputs)
3. AI interprets and presents findings to user
4. Optionally apply fixes based on user choices

**Key Parent Decisions**:
- Review-first workflow (understand issues before fixing)
- Interactive fix selection (user chooses what to fix)
- Report format matches `/harden` (Blockers, Warnings, Suggestions)
- Reports saved to `.hodge/reviews/` (independent of feature context)
- No critical file selection for `/review` (user explicitly chose scope)
- Tool scoping inherited via `${files}` placeholder pattern

**Story Position**: HODGE-344.4 is the fourth story in the epic, depends on all three previous stories (HODGE-344.1 git utilities, HODGE-344.2 manifest generation, HODGE-344.3 ReviewEngineService). This story integrates those components into a working user-facing workflow.

**Sibling Context**:
- **HODGE-344.1** (shipped): Git file scoping utilities (`validateFile()`, `getFilesInDirectory()`, `getFilesFromLastNCommits()`) with `FileScopingError` for type-safe empty handling
- **HODGE-344.2** (shipped): Enhanced manifest generator accepts file lists, `ReviewReportSaver` for timestamp-based report persistence
- **HODGE-344.3** (shipped): `ReviewEngineService` orchestrates review workflow with dependency injection pattern, returns structured `ReviewFindings` for AI interpretation

## Conversation Summary

We explored integrating ReviewEngineService into a user-facing slash command workflow, clarifying the critical distinction between CLI commands and slash commands:

**Architecture Clarity**: Users execute `/review --file src/lib/config.ts` in Claude Code (slash command), which expands to instructions for AI to execute `hodge review --file src/lib/config.ts` (CLI command) via Bash tool. The CLI is AI-orchestrated, not user-facing (except `init` and `logs`).

**Workflow Sequence**:
1. User types `/review` with flags in Claude Code
2. Slash command template expands with AI instructions
3. AI executes `hodge review` CLI command via Bash tool
4. CLI returns structured data (manifest, quality checks) in review directory
5. AI interprets findings and presents conversationally to user
6. AI facilitates fix decisions and applies fixes
7. AI writes review-report.md using Write tool

**Review Directory Structure**: Each review gets persistent directory at `.hodge/reviews/review-{scope-type}-{sanitized-target}-{timestamp}/` containing:
- `review-manifest.yaml` (what was reviewed, scope metadata)
- `quality-checks.md` (raw tool outputs)
- `review-report.md` (AI's interpretation after fixes, written by AI via Write tool)
- No `critical-files.md` (critical selection disabled for `/review`)

**File Scoping Integration**: CLI uses git utilities from HODGE-344.1 to discover and validate files:
- `--file`: Calls `validateFile()`, ensures file exists and is tracked
- `--directory`: Calls `getFilesInDirectory()`, gets all tracked files recursively
- `--last N`: Calls `getFilesFromLastNCommits()`, gets files from commit history
- `FileScopingError`: Caught and displayed with helpful guidance (e.g., suggest `git add` for untracked files), exit code 0

**Review Tier Decision**: All `/review` executions use FULL tier (thorough analysis) regardless of scope size. Unlike `/harden` where tier classification optimizes for changesets, `/review` users have explicitly chosen their scope and expect comprehensive analysis.

**Critical File Selection Policy**: Hard-coded to disabled (`enableCriticalSelection: false`) for `/review`. Rationale: user explicitly chose files to review, critical selection would second-guess their decision. Risk-based prioritization belongs in feature-based `/harden` workflows.

**Quality Check Scoping**: Follows existing toolchain pattern from `/harden`:
- Tools with `${files}` placeholder receive scoped file list (eslint, prettier)
- Tools without placeholder run project-wide (tsc)
- Behavior documented in `quality-checks.md` so AI knows which issues are relevant
- Already implemented in `ToolchainService.substituteFiles()`, no changes needed

**Fix Workflow**: Two-phase approach guided by slash command template:
1. AI runs `hodge review --fix` with same flags (auto-fixes via AutoFixService)
2. AI uses Edit tool for complex fixes requiring manual intervention
3. AI re-runs `hodge review` with same flags to verify fixes worked
4. AI writes `review-report.md` documenting what was found/fixed

**Fix State Management**: AI remembers conversation context (which issues user chose to fix). No structured state file needed between initial review and fix command. The `--fix` flag runs all auto-fixable tools (formatters, linters), not just tools that had issues.

**Edge Case Handling**:
- **Directory with single file**: Treated as directory scope (not converted to file scope)
- **Large scope warnings**: `--last 100` returning 500 files → warn but allow (user explicitly chose scope)
- **Untracked files**: `--file src/new.ts` not in git → helpful error suggests `git add`, exit code 0
- **Empty directories**: `FileScopingError` with message "No git-tracked files in directory"
- **Path sanitization**: Slashes become hyphens in directory names (src/lib/config.ts → review-file-src-lib-config-ts-{timestamp})

**Report Persistence**: Review directories persist indefinitely. User manages cleanup (can delete unwanted reviews). Timestamp-based naming prevents conflicts. Running same review twice creates separate directories.

## Implementation Approaches

### Approach 1: Thin CLI Orchestration with Service Composition (Recommended)

**Description**: Create a thin `ReviewCommand` class that orchestrates existing services (git utilities, ReviewEngineService) and writes structured output files. Create `.claude/commands/review.md` slash command template following the same pattern as `harden.md` to guide AI through the review workflow. Minimal business logic in command layer - delegate to services.

**Pros**:
- Follows established CLI Architecture Standards (thin orchestration, logic in services)
- Leverages all existing infrastructure (HODGE-344.1, 344.2, 344.3) without duplication
- Clear separation: CLI creates structure/data, AI interprets/presents
- Easy to test (services are already tested, command is thin orchestration)
- Slash command template provides clear AI workflow guidance
- Consistent with existing `/harden` and `/explore` patterns

**Cons**:
- Requires careful coordination between CLI output format and slash command template expectations
- Slash command template must be comprehensive (guides fix selection, report writing)
- Changes to service APIs may require template updates
- Need to ensure CLI output files are in expected locations for AI to read

**When to use**: When building on mature, tested infrastructure and want clean separation between data gathering (CLI) and interpretation (AI). Best when following established patterns.

### Approach 2: Integrated Command with Built-in Intelligence

**Description**: Create a `ReviewCommand` that includes more business logic - interprets tool outputs, makes severity decisions, formats reports directly. Generates both machine-readable files (manifest, quality-checks.md) and human-readable reports (review-report.md). Slash command template is simpler since CLI does more work.

**Pros**:
- Simpler slash command template (less AI orchestration needed)
- CLI can provide pre-processed, AI-ready summaries
- Consistent formatting across all reviews (CLI controls output)
- Fewer round-trips between AI and CLI
- Self-contained command with clear responsibilities

**Cons**:
- Violates CLI Architecture Standards (AI should interpret, not CLI)
- Duplicates interpretation logic that AI already handles naturally
- Harder to customize presentation for different contexts
- ReviewEngineService designed to return raw data for AI interpretation
- Breaks clean separation established by parent epic
- Inflexible - can't adapt AI responses to conversation flow

**When to use**: When CLI is user-facing (not AI-orchestrated) or when interpretation logic is codified and shouldn't vary. Not appropriate for this use case.

### Approach 3: Hybrid Approach with CLI Preprocessing

**Description**: CLI does lightweight preprocessing (parse tool outputs, count issues by severity, identify auto-fixable items) but leaves interpretation to AI. Generates summary statistics file (e.g., `review-summary.json`) alongside raw files. Slash command template instructs AI to read summary for quick overview, then dive into details as needed.

**Pros**:
- Balances CLI efficiency with AI flexibility
- Summary statistics help AI prioritize which files to read deeply
- Can optimize AI context usage (don't load full quality-checks.md if summary shows zero issues)
- Still maintains separation (CLI preprocesses, AI interprets)
- Slash command template has clear decision points (check summary first)

**Cons**:
- Adds complexity with additional output file (summary.json)
- Preprocessing logic in CLI may duplicate what AI would do naturally
- Summary format must be carefully designed to be useful
- Risk of summary being insufficient, forcing AI to read full files anyway
- More surface area for bugs (parsing logic in CLI)

**When to use**: When dealing with large outputs that need optimization, or when summary statistics are genuinely useful for workflow decisions. May be premature optimization for this use case.

## Recommendation

**Approach 1: Thin CLI Orchestration with Service Composition** is recommended.

**Rationale**:

1. **Follows Established Architecture**: The CLI Architecture Standards explicitly state "AI-orchestrated commands should extract testable business logic into Service classes. CLI command classes remain thin orchestration wrappers." ReviewEngineService already encapsulates the business logic.

2. **Leverages Existing Infrastructure**: All three sibling stories built components designed for this integration pattern:
   - HODGE-344.1: Git utilities return file lists
   - HODGE-344.2: Manifest generator accepts file lists, returns structured manifests
   - HODGE-344.3: ReviewEngineService orchestrates workflow, returns ReviewFindings

   Thin CLI command simply wires these together and writes output files.

3. **Proven Pattern**: The `/harden` slash command (`.claude/commands/harden.md`) demonstrates this pattern works well. AI successfully:
   - Reads manifest and quality-checks.md
   - Loads context files based on manifest
   - Interprets findings and presents to user
   - Facilitates conversation and applies fixes
   - Writes review-report.md using Write tool

4. **AI Interpretation Flexibility**: Leaving interpretation to AI enables natural conversation adaptation. AI can:
   - Explain issues in user's context
   - Prioritize based on conversation flow
   - Adjust detail level based on user questions
   - Reference standards/patterns naturally during discussion

5. **Testability**: Thin orchestration command is easy to test (verify correct service calls and file writes). Services are already comprehensively tested. Slash command template can be validated through integration tests.

6. **Maintainability**: Clear boundaries between CLI (structure/data), services (business logic), and AI (interpretation/interaction) make the system easy to understand and modify.

7. **No Premature Optimization**: Approach 3's summary file is unnecessary complexity. AI can read manifest and quality-checks.md efficiently. If performance becomes an issue later, we can add optimization then with clear requirements.

**Implementation Details**:

```typescript
// CLI Command Structure (src/commands/review.ts)
export class ReviewCommand {
  async execute(options: { file?: string; directory?: string; last?: number; fix?: boolean }) {
    // 1. Parse flags and determine scope
    const scope = this.parseScope(options);

    // 2. Discover files using git utilities (HODGE-344.1)
    const fileList = await this.discoverFiles(scope);

    // 3. Create review directory with descriptive name
    const reviewDir = this.createReviewDirectory(scope);

    if (options.fix) {
      // Auto-fix workflow
      await this.autoFixService.applyFixes(fileList);
      return; // Exit after fixes
    }

    // 4. Generate manifest and run quality checks (via ReviewEngineService)
    const findings = await this.reviewEngineService.analyzeFiles(fileList, {
      scope: scope,
      enableCriticalSelection: false // Hard-coded for /review
    });

    // 5. Write structured output files
    await this.writeManifest(reviewDir, findings.manifest);
    await this.writeQualityChecks(reviewDir, findings.toolResults);

    // 6. Output review directory path for AI
    console.log(reviewDir);
  }
}
```

```markdown
# Slash Command Template Structure (.claude/commands/review.md)

## Step 1: Execute Review Command
hodge review --file src/lib/config.ts

## Step 2: Read Review Files
cat .hodge/reviews/review-file-src-lib-config-ts-{timestamp}/review-manifest.yaml
cat .hodge/reviews/review-file-src-lib-config-ts-{timestamp}/quality-checks.md

## Step 3: Load Context Files
[Based on manifest, load standards, patterns, profiles - same as harden.md]

## Step 4: Interpret Findings and Present to User
[Guidance for AI to assess tool outputs, explain issues conversationally]

## Step 5: Facilitate Fix Selection
[Conversation structure for asking user which issues to fix]

## Step 6: Apply Fixes (If User Chooses)
hodge review --file src/lib/config.ts --fix  # Auto-fixes
[Use Edit tool for complex manual fixes]

## Step 7: Re-run Quality Checks
hodge review --file src/lib/config.ts  # Verify fixes worked

## Step 8: Write Review Report
[Use Write tool to create review-report.md documenting findings and fixes]
```

**Migration Path**: This approach enables incremental development:
1. Implement thin ReviewCommand with file writing
2. Create slash command template based on harden.md pattern
3. Test integration with simple scenarios (single file review)
4. Expand to complex scenarios (directory, commits, fix workflow)
5. Refine template based on real usage

## Test Intentions

### 1. File Scoping Integration with Git Utilities
**Intent**: Verify CLI correctly uses git utilities to discover and validate files based on scope flags.

**Verification**:
- `hodge review --file src/lib/config.ts` calls `validateFile()` and proceeds with single file
- `hodge review --directory src/commands/` calls `getFilesInDirectory()` and proceeds with all tracked files
- `hodge review --last 3` calls `getFilesFromLastNCommits()` and proceeds with commit files
- `FileScopingError` caught and displayed with helpful guidance (e.g., "suggest running git add" for untracked files)
- Exit code 0 for empty results (not an error state)

### 2. Review Directory Creation and Naming
**Intent**: Verify review directories are created with descriptive, conflict-resistant names.

**Verification**:
- `--file src/lib/config.ts` creates `.hodge/reviews/review-file-src-lib-config-ts-{timestamp}/`
- `--directory src/commands/` creates `.hodge/reviews/review-directory-src-commands-{timestamp}/`
- `--last 3` creates `.hodge/reviews/review-last-3-{timestamp}/`
- Timestamp format is consistent and sortable (YYYY-MM-DD-HHMMSS)
- Special characters in paths sanitized (slashes become hyphens)
- Directory contains expected output files (manifest, quality-checks)

### 3. Manifest Generation with FULL Tier
**Intent**: Verify manifests are always generated with FULL tier and include scope metadata.

**Verification**:
- Manifest includes `recommended_tier: FULL` regardless of file count
- Scope metadata correctly populated: `type`, `target`, `fileCount`
- Changed files list includes all files from scope
- Context files identified (standards, patterns, profiles) for FULL tier
- Language detection and profile matching work for scoped files

### 4. Quality Checks Execution (Scoped and Project-Wide)
**Intent**: Verify quality checks run appropriately based on tool capabilities.

**Verification**:
- Tools with `${files}` placeholder receive scoped file list (eslint, prettier)
- Tools without placeholder run project-wide (tsc)
- `quality-checks.md` documents which tools were scoped vs project-wide
- Tool failures included as data (not thrown as errors)
- Skipped tools documented with reasons

### 5. Fix Workflow Integration
**Intent**: Verify `--fix` flag applies auto-fixes and quality checks can re-run after fixes.

**Verification**:
- `hodge review --file src/test.ts --fix` runs AutoFixService on scoped files
- Auto-fixable tools (prettier, eslint --fix) execute in correct order (formatters first, then linters)
- Modified files are not staged automatically (non-intrusive)
- After fixes, running `hodge review --file src/test.ts` again shows updated results
- Fix results saved appropriately for verification

### 6. Slash Command File Structure
**Intent**: Verify CLI creates expected file structure for AI to read and interpret.

**Verification**:
- Review directory contains `review-manifest.yaml`
- Review directory contains `quality-checks.md`
- No `critical-files.md` generated (critical selection disabled)
- CLI outputs review directory path to stdout for AI
- Files are readable and properly formatted (YAML valid, markdown rendered)

### 7. Edge Case Handling
**Intent**: Verify graceful handling of edge cases and boundary conditions.

**Verification**:
- Directory with single file: treated as directory scope, not converted to file scope
- Large scope (`--last 100` with 500 files): warning logged, but review proceeds
- Untracked file (`--file src/new.ts`): helpful error message suggests `git add`
- Empty directory: `FileScopingError` with message "No git-tracked files in directory"
- Tool execution failures: documented in quality-checks.md, doesn't block workflow

### 8. Scope Type Sanitization
**Intent**: Verify target paths are safely sanitized for directory names.

**Verification**:
- Forward slashes converted to hyphens: `src/lib/utils.ts` → `src-lib-utils-ts`
- Dots preserved for clarity: `config.ts` → `config-ts`
- Absolute paths converted to relative from project root
- Special characters removed or converted safely
- Long paths truncated if needed to avoid filesystem limits (255 char max)

### 9. Slash Command Template Integration
**Intent**: Verify `.claude/commands/review.md` provides clear instructions for AI workflow.

**Verification**:
- Template instructs AI to parse flags correctly
- Template guides AI to read review-manifest.yaml and quality-checks.md
- Template provides fix selection conversation structure
- Template instructs AI when to run `--fix` vs Edit tool
- Template guides AI to write review-report.md using Write tool
- Template follows same pattern as harden.md for consistency

### 10. No Critical File Selection Policy
**Intent**: Verify critical file selection is never enabled for review command.

**Verification**:
- ReviewEngineService called with `enableCriticalSelection: false`
- No `critical-files.md` generated in review directory
- All files in scope reviewed equally (no prioritization)
- Manifest does not include critical file scores or risk factors

## Decisions Decided During Exploration

1. **Review Directory Naming**: Use pattern `review-{scope-type}-{sanitized-target}-{timestamp}/` for descriptive, conflict-resistant names. Timestamp format YYYY-MM-DD-HHMMSS. Directories persist indefinitely, user manages cleanup.

2. **FULL Tier for All Reviews**: All `/review` executions use FULL tier regardless of scope size. Users explicitly chose scope and expect comprehensive analysis. No tier classification logic needed.

3. **Critical File Selection Policy**: Hard-coded to disabled (`enableCriticalSelection: false`) for `/review`. User explicitly chose files to review; risk-based prioritization would second-guess their decision.

4. **Empty File List Handling**: Catch `FileScopingError` and display helpful guidance (e.g., suggest `git add` for untracked files). Exit code 0 (not an error state).

5. **Review Persistence**: Directories persist indefinitely at `.hodge/reviews/`. User can delete unwanted reviews. No automatic cleanup or staleness checks.

6. **Quality Check Scoping**: Follow existing toolchain pattern - tools with `${files}` placeholder get scoped lists, others run project-wide. Already implemented in `ToolchainService.substituteFiles()`.

7. **Fix Workflow State**: AI remembers conversation context (which issues user chose to fix). No structured state file between initial review and fix command. The `--fix` flag runs all auto-fixable tools.

8. **Report Writing**: AI writes `review-report.md` using Write tool after fixes applied (if user opts to fix). If user declines fixes, AI writes report documenting findings and concludes review.

9. **Large Scope Handling**: Warn but allow execution when scope is large (e.g., `--last 100` returning 500 files). User explicitly chose scope, respect their decision.

10. **Mixed Scope Handling**: Directory with single file stays directory scope (not converted to file scope). Scope type reflects user's intent, not the result count.

## No Decisions Needed

All implementation questions resolved during exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to confirm implementation approach
- [ ] Proceed to `/build HODGE-344.4`

---
*Exploration completed: 2025-10-15T01:27:01.006Z*
*AI exploration completed via conversational discovery with parent and sibling context*
