# Exploration: HODGE-344.5

## Feature Overview
**PM Issue**: HODGE-344.5
**Parent Feature**: HODGE-344 (Unified review workflow with auto-fix and flexible file scoping)
**Type**: sub-feature
**Created**: 2025-10-15T16:15:50.696Z

## Title
Migrate HardenCommand to ReviewEngineService for zero-duplication review workflows

## Problem Statement

HardenCommand's `--review` mode duplicates quality check logic that ReviewEngineService (HODGE-344.3) already provides. Both services call `toolchainService.runQualityChecks()` independently, creating maintenance burden and risking inconsistent review output between `/harden` and `/review` commands. The migration must preserve ALL existing HardenCommand behavior (validation gates, PM hooks, git metadata tracking, report formatting, and three operational modes) while eliminating this duplication and ensuring both commands produce consistent review diagnostics.

## Parent Context

**Parent Epic**: HODGE-344 established a unified review workflow with two distinct command sequences:
- `/harden`: Fix-first workflow (auto-fix → review → validate) for production readiness with mandatory error fixing
- `/review`: Review-first workflow (manifest → AI review → optional fix) for advisory analysis

**Key Parent Decisions**:
- CLI reports facts to AI in standard files; AI interprets and acts
- Tool scoping via `${files}` placeholder pattern
- Review output consistency between commands (same tool result format)
- Critical file selection is configurable per command (enabled for /harden, disabled for /review)

**Story Position**: HODGE-344.5 is the final story (lane 2) that completes the epic by migrating the existing battle-tested `/harden` command to use the shared ReviewEngineService infrastructure created in lane 0.

**Sibling Context**:
- **HODGE-344.1** shipped git file scoping utilities (validateFile, getFilesInDirectory, getFilesFromLastNCommits) with FileScopingError for graceful empty result handling
- **HODGE-344.2** shipped enhanced manifest generator accepting explicit file lists (not just git diffs) and ReviewReportSaver for timestamp-based persistence
- **HODGE-344.3** shipped ReviewEngineService as the shared review orchestration core with clean dependency injection, configurable critical file selection, auto-fixable flag enrichment, and structured ReviewFindings output
- **HODGE-344.4** shipped ReviewCommand CLI implementing review-first workflow with --file, --directory, --last flags and `.claude/commands/review.md` slash command template

## Conversation Summary

We explored migrating HardenCommand to use ReviewEngineService while preserving all existing behavior through a detailed analysis of current implementation and testing requirements.

**Complete Behavior Inventory**: Through code inspection of `src/commands/harden.ts`, `src/lib/harden-service.ts`, and `.claude/commands/harden.md`, we identified that HardenCommand currently:
1. Uses fix-first workflow (auto-fix → review → validate)
2. Works with feature-based git diff scoping via GitDiffAnalyzer
3. Has mandatory error fixing (blocking workflow until errors resolved)
4. Enables critical file selection for focused AI review
5. Saves reports to `.hodge/features/{feature}/harden/` directory
6. Runs validation gates (tests/lint/typecheck/build) before allowing ship
7. Calls PM hooks at specific workflow points (`pmHooks.onHarden()`)
8. Tracks git metadata (hardenStartCommit SHA) in ship-record.json
9. Displays AI context messages for harden mode requirements
10. Supports three operational modes: normal validation, `--review` (manifest generation), `--fix` (auto-fix)

**Duplication Analysis**: We discovered that HardenService and ReviewEngineService both call `toolchainService.runQualityChecks()` independently:
- HardenService.runQualityChecks() (line 154) returns `RawToolResult[]` for review mode
- ReviewEngineService.analyzeFiles() internally calls the same toolchain service
- This creates maintenance burden and risks inconsistent output between `/harden` and `/review`

**Service Responsibility Clarification**: We distinguished between two distinct concerns:
- **ReviewEngineService** = "What's wrong with the code?" - Runs quality checks (linting, formatting, security, complexity), returns raw tool diagnostics enriched with auto-fix flags
- **HardenService** = "Can we ship this feature?" - Runs validation gates (tests must pass, build must succeed), returns pass/fail for production readiness

This distinction means HardenService should keep `runValidations()` for mandatory gates while delegating quality check execution to ReviewEngineService.

**File Discovery Strategy**: We confirmed that HardenCommand can get the file list from GitDiffAnalyzer and pass to ReviewEngineService:
1. `GitDiffAnalyzer.getChangedFiles()` returns `GitDiffResult[]` with file paths and line counts
2. Extract file list: `const fileList = changedFiles.map(f => f.path)`
3. Pass to ReviewEngineService: `reviewEngineService.analyzeFiles(fileList, { enableCriticalSelection: true })`
4. This maintains feature-based scoping while using shared review infrastructure

**Testing Strategy Development**: We established a three-tier approach for zero-regression confidence:
- **Tier 1**: Preserve all existing `/harden` integration tests unchanged as regression suite
- **Tier 2**: Add characterization tests before migration to capture exact current behavior (files written, report formats, PM hooks called, git operations)
- **Tier 3**: Add smoke tests for ReviewEngineService integration points with correct configuration

Important testing insight: Report content (validation-results.json, quality-checks.md, harden-report.md) is largely determined by toolchain.yaml, so characterization tests should focus on file structure and format rather than tool-specific output.

**Migration Boundaries**: We defined what migrates to ReviewEngineService versus what stays in HardenCommand/HardenService:

Migrate to ReviewEngineService:
- Quality check execution (all tools from toolchain.yaml)
- Manifest generation with scope metadata
- Critical file selection with risk scoring
- Auto-fixable flag enrichment

Keep in HardenCommand:
- PM hook integration (`pmHooks.onHarden()`)
- Git commit SHA tracking (hardenStartCommit)
- Report formatting and file writing (presentation layer)
- AI context display messages
- Directory setup and validation

Keep in HardenService:
- Validation gates (`runValidations()` - tests/lint/typecheck/build as pass/fail)
- Quality gate checking (`checkQualityGates()`)
- Report data generation (`generateReportData()`)

## Implementation Approaches

### Approach 1: Minimal Surgery - Replace Only runQualityChecks()

**Description**: Minimal migration that only replaces the `HardenService.runQualityChecks()` call in review mode (`--review` flag) with `ReviewEngineService.analyzeFiles()`. All other HardenCommand logic remains unchanged. This is the smallest possible change that eliminates duplication.

**Implementation Details**:
```typescript
// In HardenCommand.handleReviewMode() (line 597)
// BEFORE:
const qualityCheckResults = await this.hardenService.runQualityChecks(feature);

// AFTER:
const findings = await this.reviewEngineService.analyzeFiles(fileList, {
  scope: { type: 'feature', target: feature, fileCount: fileList.length },
  enableCriticalSelection: true
});
const qualityCheckResults = findings.toolResults;
```

Changes required:
- Add ReviewEngineService dependency to HardenCommand constructor
- Extract file list from GitDiffAnalyzer results before calling ReviewEngineService
- Map `EnrichedToolResult[]` to existing report generation (already uses RawToolResult interface)
- Keep all existing report formatting logic unchanged

**Pros**:
- Minimal code changes reduces risk
- Fastest implementation (1-2 days)
- Easy to review and verify equivalence
- All existing tests continue to pass with no modifications
- Clear rollback path if issues arise

**Cons**:
- Doesn't leverage full ReviewEngineService capabilities (manifest already generated separately)
- Still has some duplication (manifest generation happens twice - once in handleReviewMode, once in ReviewEngineService)
- May need second refactoring pass to clean up remaining duplication
- Doesn't fully align with parent epic's vision of shared infrastructure

**When to use**: When speed and safety are paramount, and you're willing to accept some remaining duplication for faster delivery with lower risk.

### Approach 2: Comprehensive Migration - Use ReviewEngineService Fully (Recommended)

**Description**: Complete migration that replaces the entire review mode workflow with a single ReviewEngineService call. Instead of manually orchestrating manifest generation, quality checks, and critical file selection, delegate all of this to ReviewEngineService and extract results for report writing.

**Implementation Details**:
```typescript
// In HardenCommand.handleReviewMode() - replace entire workflow
async handleReviewMode(feature: string, hardenDir: string): Promise<void> {
  // 1. Get file list from GitDiffAnalyzer (existing)
  const gitAnalyzer = new GitDiffAnalyzer();
  const changedFiles = await gitAnalyzer.getChangedFiles();
  const fileList = changedFiles.map(f => f.path);

  // 2. Single call to ReviewEngineService (replaces 200+ lines)
  const findings = await this.reviewEngineService.analyzeFiles(fileList, {
    scope: { type: 'feature', target: feature, fileCount: fileList.length },
    enableCriticalSelection: true
  });

  // 3. Write output files (presentation layer - HardenCommand responsibility)
  await this.writeManifest(hardenDir, findings.manifest);
  await this.writeQualityChecks(hardenDir, findings.toolResults);
  await this.writeCriticalFiles(hardenDir, findings.criticalFiles);

  // 4. Display summary (existing)
  this.displayReviewSummary(findings);
}
```

Changes required:
- Add ReviewEngineService dependency with all its dependencies (ManifestGenerator, ToolchainService, CriticalFileSelector, ToolRegistryLoader)
- Remove direct calls to ReviewTierClassifier, ReviewManifestGenerator, CriticalFileSelector from handleReviewMode
- Extract report writing methods (writeManifest, writeQualityChecks, writeCriticalFiles) to reduce cognitive complexity
- Update report formatting to use `ReviewFindings` structure
- Preserve exact same file formats for backward compatibility

**Pros**:
- Zero duplication - single source of truth for review workflow
- Fully aligns with parent epic's vision of shared infrastructure
- Leverages all ReviewEngineService capabilities (auto-fix flags included)
- Simplifies HardenCommand by removing 200+ lines of orchestration code
- Ensures perfect consistency between /harden and /review outputs
- Clean architecture - command becomes thin presentation layer

**Cons**:
- Larger changeset requires more careful review
- More comprehensive testing needed to verify equivalence
- Slightly longer implementation time (2-3 days)
- Requires understanding ReviewEngineService's full interface

**When to use**: When building for long-term maintainability and full alignment with the parent epic's architectural vision. This is the recommended approach because it fully eliminates duplication and positions both commands on shared infrastructure.

### Approach 3: Phased Migration with Feature Flag

**Description**: Two-phase migration that introduces ReviewEngineService behind a feature flag, allowing gradual rollout and easy comparison between old and new implementations. Phase 1 adds ReviewEngineService alongside existing code. Phase 2 removes the old code after validation.

**Implementation Details**:
```typescript
// Phase 1: Add ReviewEngineService with feature flag
async handleReviewMode(feature: string, hardenDir: string): Promise<void> {
  const useReviewEngine = process.env.HODGE_USE_REVIEW_ENGINE === 'true';

  if (useReviewEngine) {
    // New implementation using ReviewEngineService
    return this.handleReviewModeWithEngine(feature, hardenDir);
  } else {
    // Existing implementation (unchanged)
    return this.handleReviewModeOriginal(feature, hardenDir);
  }
}

// Phase 2 (after validation): Remove feature flag and old implementation
```

Changes required:
- Extract existing handleReviewMode to handleReviewModeOriginal
- Implement new handleReviewModeWithEngine using ReviewEngineService
- Add environment variable check for feature flag
- Add comparison tests that run both implementations and verify identical output
- Document migration plan for Phase 2 cleanup

**Pros**:
- Safe rollback mechanism (set env var to false)
- Can compare outputs side-by-side for validation
- Allows production testing before full commitment
- Easy to identify regressions (run both, compare results)
- Provides confidence through gradual rollout

**Cons**:
- Temporary code duplication during Phase 1 (both implementations exist)
- More complex testing (need to test both code paths)
- Requires two-phase implementation and cleanup
- Feature flag maintenance overhead until Phase 2
- Delayed benefits until Phase 2 completes

**When to use**: When risk tolerance is very low and you need maximum confidence before fully committing to the migration. Good for mission-critical code where gradual rollout is preferred over big-bang changes.

## Recommendation

**Approach 2: Comprehensive Migration - Use ReviewEngineService Fully**

**Rationale**:

1. **Completes the Epic's Vision**: HODGE-344's goal was to create unified review infrastructure. Partial migration (Approach 1) leaves duplication in manifest generation. Complete migration (Approach 2) achieves the vision.

2. **Zero Duplication**: Current state has manifest generation happening in both HardenCommand.handleReviewMode() (lines 660-666) and ReviewEngineService.analyzeFiles(). Approach 2 eliminates ALL duplication by using ReviewEngineService as single source of truth.

3. **Proven Infrastructure**: ReviewEngineService (HODGE-344.3) has been shipped and battle-tested through HODGE-344.4 (review command). We're not migrating to untested code - we're migrating to proven infrastructure.

4. **Testing Strategy Provides Confidence**: Three-tier testing (existing tests + characterization tests + integration smoke tests) provides zero-regression confidence even with larger changeset. Characterization tests lock in baseline behavior before migration starts.

5. **Long-Term Maintainability**: When both /harden and /review need changes to review workflow, there's only one place to change (ReviewEngineService) instead of two parallel implementations. This reduces maintenance burden significantly.

6. **Consistency Guarantee**: ReviewEngineService returns structured `ReviewFindings` with standardized format. Both commands write reports from same data structure, ensuring perfect consistency in review output.

7. **Simplification**: HardenCommand becomes thinner (200+ lines removed from handleReviewMode), focusing on its true responsibility: orchestrating the harden workflow and formatting output for AI consumption.

8. **Feature Flag Not Needed**: The comprehensive testing strategy provides sufficient confidence without the complexity of maintaining parallel implementations. Feature flags are valuable when infrastructure is unproven - but ReviewEngineService is already proven.

**Implementation Plan**:

1. **Pre-Migration** (1 day):
   - Write characterization tests that capture current exact behavior
   - Lock in baseline: files written, report formats, PM hooks, git operations
   - Verify all existing tests pass

2. **Migration** (2 days):
   - Add ReviewEngineService dependency to HardenCommand
   - Replace handleReviewMode workflow with single ReviewEngineService call
   - Extract report writing methods (writeManifest, writeQualityChecks, writeCriticalFiles)
   - Update report formatting to use ReviewFindings structure
   - Preserve exact same file formats

3. **Validation** (1 day):
   - Run characterization tests - must pass identically
   - Run existing integration tests - must pass unchanged
   - Add smoke tests for ReviewEngineService integration
   - Manual verification of report output

**Success Criteria**:
- All existing /harden tests pass without modification
- All characterization tests pass (exact same behavior)
- Zero duplication between /harden and /review
- Both commands produce identical tool result formats
- HardenCommand code reduced by ~200 lines

## Test Intentions

### 1. Review Mode Produces Identical Files
**Intent**: Verify that migrated review mode writes the same files to the same locations as before migration.

**Verification**:
- Run `hodge harden {feature} --review`
- Expect files created:
  - `.hodge/features/{feature}/harden/review-manifest.yaml`
  - `.hodge/features/{feature}/harden/quality-checks.md`
  - `.hodge/features/{feature}/harden/critical-files.md`
- All three files must exist at exact same paths as before migration

### 2. Review Manifest Format Preservation
**Intent**: Verify that review-manifest.yaml maintains the same YAML structure that AI slash command expects.

**Verification**:
- Generate manifest via review mode
- Expect YAML contains required top-level keys:
  - `recommended_tier` (SKIP | QUICK | STANDARD | FULL)
  - `change_analysis` (file counts, line counts)
  - `changed_files` (array with path and line count objects)
  - `context` (files to load for review)
  - `matched_patterns` (relevant pattern files)
  - `matched_profiles` (relevant review profile files)
- Structure must match what `.claude/commands/harden.md` template expects

### 3. Quality Checks Report Contains All Tool Results
**Intent**: Verify that quality-checks.md includes output from all toolchain tools, not just subset.

**Verification**:
- Run review mode on feature with multiple file types
- Expect quality-checks.md contains sections for:
  - Type checking tools (tsc)
  - Linting tools (eslint)
  - Formatting tools (prettier)
  - Security tools (if configured in toolchain.yaml)
- Number of tool sections matches toolchain.yaml configuration
- Each section has tool name, status, and output

### 4. Critical Files Selection Enabled for Harden
**Intent**: Verify that review mode uses critical file selection (harden policy), not disabled like /review command.

**Verification**:
- Run review mode with 20+ changed files
- Expect critical-files.md generated
- Expect file contains top N files (default 10) ranked by risk score
- Expect risk scoring considers: tool diagnostics, import fan-in, change size, critical paths
- Verify CriticalFileSelector was called with `enableCriticalSelection: true`

### 5. Auto-Fixable Flags Enrichment
**Intent**: Verify that quality check results include auto-fixable flags based on tool registry.

**Verification**:
- Run review mode on files with eslint and tsc issues
- Parse quality-checks.md or inspect findings structure
- Expect eslint results marked as auto-fixable (has `eslint --fix`)
- Expect tsc results marked as NOT auto-fixable (no fix command)
- Flags must match tool registry `fix_command` configuration

### 6. Validation Gates Remain Unchanged
**Intent**: Verify that normal harden mode (without --review) still runs validation gates correctly.

**Verification**:
- Run `hodge harden {feature}` (no flags)
- Expect HardenService.runValidations() called
- Expect validation-results.json written with 4 gates:
  - tests: {passed, output}
  - lint: {passed, output}
  - typecheck: {passed, output}
  - build: {passed, output}
- Gate pass/fail logic unchanged from before migration

### 7. PM Hooks Called at Correct Times
**Intent**: Verify that PM integration hooks are called at the same workflow points as before.

**Verification**:
- Run harden command with PM integration enabled
- Expect `pmHooks.onHarden(feature)` called early in workflow (before validation)
- Timing must match original implementation (line 114 in current code)
- PM issue status updated to "In Review" or configured harden status

### 8. Git Metadata Tracking Preserved
**Intent**: Verify that hardenStartCommit SHA is recorded to ship-record.json as before.

**Verification**:
- Run harden command on feature
- Expect ship-record.json updated with `hardenStartCommit` field
- Commit SHA must match current `git rev-parse HEAD` output
- Recording happens early in workflow (during setup, before validation)

### 9. AI Context Display Unchanged
**Intent**: Verify that AI context messages for harden mode are displayed identically.

**Verification**:
- Run harden command
- Expect console output includes:
  - "HARDEN MODE" banner with strict requirements
  - List of standards enforcement rules
  - "ALL tests MUST pass" messaging
- Exact same wording and formatting as before migration

### 10. Three Operational Modes Still Work
**Intent**: Verify that all three harden modes (normal, --review, --fix) work correctly after migration.

**Verification**:
- Normal mode: `hodge harden {feature}` runs validation gates
- Review mode: `hodge harden {feature} --review` generates manifest files
- Auto-fix mode: `hodge harden {feature} --fix` runs auto-fix workflow
- Each mode must produce expected files and behavior
- No mode interferes with others

### 11. File List Extraction from GitDiffAnalyzer
**Intent**: Verify that feature-based file list is correctly extracted and passed to ReviewEngineService.

**Verification**:
- Mock GitDiffAnalyzer to return known GitDiffResult[] with paths
- Call review mode
- Expect ReviewEngineService.analyzeFiles() called with extracted file paths
- File list must match: `gitDiffResults.map(f => f.path)`
- Order preservation not required (set equality)

### 12. Report Format Consistency Between Commands
**Intent**: Verify that /harden and /review produce identical tool result formats.

**Verification**:
- Run `hodge harden {feature} --review` on file set A
- Run `hodge review --directory {dir}` on same file set A
- Compare quality-checks.md format from both commands
- Expect identical section structure (tool name, status, output)
- Expect identical auto-fixable flag presence
- Content may differ (different scopes) but format must match

## Decisions Decided During Exploration

1. **Replace HardenService.runQualityChecks() with ReviewEngineService.analyzeFiles()** to eliminate duplication between /harden and /review commands. Both commands now use single source of truth for quality check execution.

2. **Keep HardenService.runValidations() for validation gates** - These are harden-specific mandatory pass/fail checks (tests/lint/typecheck/build) distinct from quality checks (advisory diagnostics).

3. **Use three-tier testing strategy** for zero-regression confidence:
   - Tier 1: Preserve all existing /harden integration tests unchanged as regression suite
   - Tier 2: Add characterization tests before migration to capture exact current behavior
   - Tier 3: Add smoke tests for ReviewEngineService integration points

4. **HardenCommand extracts file list from GitDiffAnalyzer** and passes to ReviewEngineService via `changedFiles.map(f => f.path)` - maintains feature-based scoping while using file-based service interface.

5. **Don't test toolchain.yaml-controlled content in characterization tests** - Focus on file structure and format that HardenCommand controls, not tool-specific output determined by toolchain configuration.

6. **Migrate entire review mode workflow to ReviewEngineService** (Approach 2) - Eliminates ALL duplication including manifest generation, not just quality checks.

7. **Preserve exact file formats for backward compatibility** - validation-results.json, quality-checks.md, harden-report.md, review-manifest.yaml must maintain same structure that AI slash commands expect.

8. **Extract report writing methods from handleReviewMode** to reduce cognitive complexity - writeManifest(), writeQualityChecks(), writeCriticalFiles() as separate methods.

## No Decisions Needed

All architectural and implementation questions resolved during exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to confirm implementation approach (Approach 2 recommended)
- [ ] Proceed to `/build HODGE-344.5`

---
*Exploration completed: 2025-10-15T16:15:50.696Z*
*AI exploration completed via conversational discovery with parent and sibling context*
