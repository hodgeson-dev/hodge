# Exploration: HODGE-344.2

## Feature Overview
**PM Issue**: HODGE-344.2
**Parent Feature**: HODGE-344 (Unified review workflow with auto-fix and flexible file scoping)
**Type**: sub-feature
**Created**: 2025-10-14T05:25:10.814Z

## Title
Review manifest generation with file scoping support

## Problem Statement

The unified review workflow requires manifest generation that works with arbitrary file lists from the three scoping methods (`--file`, `--directory`, `--last N`), not just feature-based git diffs. The existing manifest generator in `/harden` is tightly coupled to feature contexts and staged files. Without a flexible manifest generation layer that can accept any file list while maintaining the same robust analysis capabilities, the review-first workflow cannot be implemented.

This foundational layer must bridge between the git utilities (HODGE-344.1) and the future ReviewEngineService (HODGE-344.3), providing standalone, testable components for manifest generation and report saving that work independently of command context.

## Parent Context

**Parent Epic**: HODGE-344 established the unified review workflow with two distinct sequences:
- `/harden`: Fix-first (auto-fix → review → validate) for production readiness
- `/review`: Review-first (generate manifest → AI review → optional fix) for advisory analysis

**Key Parent Decisions**:
- Review reports saved to `.hodge/reviews/` (independent of feature context)
- Tool scoping inherited from `/harden` (tools with `${files}` placeholder get file list, others run project-wide)
- Empty file lists handled gracefully with helpful messages (no report created, exit 0)
- No critical file selection for `/review` (user explicitly chose targets, review all equally)
- Report format matches `/harden` (Blockers, Warnings, Suggestions sections)

**Story Position**: HODGE-344.2 is the second story in Lane 0 (Core Infrastructure), depends on HODGE-344.1 (git file scoping utilities). This story provides the foundation for HODGE-344.3 (ReviewEngineService) which will compose these utilities.

**Sibling Context**: HODGE-344.1 shipped the git file scoping utilities (`validateFile()`, `getFilesInDirectory()`, `getFilesFromLastNCommits()`) with custom `FileScopingError` class for type-safe empty result handling.

## Conversation Summary

We explored building standalone utilities for manifest generation and report saving that work with arbitrary file lists while maintaining compatibility with existing feature-based workflows:

**Manifest Generator Enhancement**: Decided to extend the existing manifest generator with an optional `fileList` parameter rather than creating separate generators. When `fileList` is provided, use it; when omitted, fall back to existing git diff behavior. This maintains a single source of truth for manifest logic while supporting both feature-based and file-based modes.

**Tool Scoping Pattern**: Follow the existing `/harden` pattern used by `ToolchainService`:
- Commands use `${files}` placeholder in their templates (e.g., `eslint ${files}`)
- If command has `${files}`, substitute with file list
- If no `${files}` placeholder, command runs project-wide (e.g., `tsc`)
- This behavior is already implemented in `ToolchainService.substituteFiles()` - no changes needed, just leverage it

**Scope Metadata Tracking**: Add metadata fields to manifest to track what was reviewed:
```yaml
scope:
  type: "file" | "directory" | "commits" | "feature"
  target: "src/lib/git-utils.ts" | "src/lib/" | "5" | "HODGE-344"
  fileCount: 42
```
This provides traceability and helps users understand what the review covered.

**Report Naming and Location**: Reports saved to `.hodge/reviews/review-{timestamp}.md` using simple timestamp-based naming (e.g., `review-2025-10-14-053045.md`). Reports include scope metadata in the header to document what was reviewed.

**Empty File List Handling**: Manifest generator assumes it always receives a non-empty file list. Empty list handling occurs at the caller level using `FileScopingError` from HODGE-344.1. If git utilities throw `FileScopingError`, the command catches it, displays helpful message, exits with code 0, and never calls manifest generator.

**Standalone Utilities Design**: Build manifest generation and report saving as standalone, testable utilities without command integration. This allows HODGE-344.3 (ReviewEngineService) to compose them cleanly and avoids premature refactoring before the architecture is fully designed. Command integration happens in HODGE-344.4.

**Critical File Selection**: Not a concern for manifest generation. Critical file selection is a ReviewEngineService policy decision (enabled for `/harden`, disabled for `/review`). The manifest generator just identifies files and their metadata without risk scoring.

**Test Strategy**: Smoke tests for contract verification - manifest accepts file lists, scope metadata tracks correctly, report saving works, file substitution logic works. Integration testing deferred to HODGE-344.3 (ReviewEngineService) and HODGE-344.4 (ReviewCommand) where components compose into full workflows.

## Implementation Approaches

### Approach 1: Enhanced Manifest Generator with Scope Metadata (Recommended)

**Description**: Extend the existing manifest generator to accept an optional `fileList?: string[]` parameter. When provided, use the explicit file list; when omitted, fall back to existing git diff behavior. Add scope metadata fields to the manifest schema to track what was reviewed. Create a separate report saving utility that writes to `.hodge/reviews/` with timestamp-based naming.

**Pros**:
- Single source of truth for manifest logic (DRY principle)
- Backward compatible with existing `/harden` usage (no file list = git diff)
- Clean separation: manifest generation vs. report persistence
- Scope metadata provides clear traceability for all review types
- Leverages existing `ToolchainService` file scoping (no changes needed)
- Simple, testable components ready for ReviewEngineService composition

**Cons**:
- Adds conditional logic to manifest generator (file list vs. git diff)
- Scope metadata increases manifest size slightly
- Need to coordinate manifest schema changes across multiple commands

**When to use**: When you want a single, flexible manifest generator that works for both feature-based and file-based reviews while maintaining clear traceability and compatibility with existing workflows.

### Approach 2: Separate File-Based Manifest Generator

**Description**: Create a new `generateFileBasedManifest()` function specifically for arbitrary file lists, keeping the existing `generateManifest()` for feature-based git diffs. Both generate the same manifest schema but have different input handling. Report saving utility is shared between both.

**Pros**:
- Clear separation between feature-based and file-based concerns
- No conditional logic in either generator
- Easier to optimize each path independently
- Lower risk of breaking existing `/harden` behavior

**Cons**:
- Code duplication between two generators
- Need to keep manifest logic synchronized across both
- More functions to test and maintain
- Unclear which generator to use in edge cases

**When to use**: When you want absolute separation between feature-based and file-based workflows, and you're willing to accept code duplication for clarity.

### Approach 3: Manifest Generator Service Class

**Description**: Create a `ManifestGeneratorService` class that encapsulates all manifest generation logic. The class provides methods like `generateFromFileList()`, `generateFromGitDiff()`, and `generateFromFeature()`, all sharing internal logic for language detection, profile selection, and metadata creation. Includes built-in report saving capabilities.

**Pros**:
- Clear API with explicit methods for each use case
- Can share internal logic while keeping public interfaces distinct
- Easier to add new manifest sources in future (PR diffs, CI/CD)
- Can add features like caching or batch operations later
- Report saving colocated with manifest generation

**Cons**:
- Adds unnecessary abstraction for relatively simple operations
- Breaks from existing function-based utilities pattern
- Callers need to instantiate service (or use singleton)
- More complex testing (mocking class methods vs functions)
- Over-engineered for current requirements
- Mixes manifest generation with report persistence concerns

**When to use**: When you anticipate significant expansion of manifest generation capabilities or need shared state across multiple manifest operations.

## Recommendation

**Approach 1: Enhanced Manifest Generator with Scope Metadata** is recommended.

**Rationale**:
1. **Single Source of Truth**: Having two separate manifest generators (Approach 2) or a complex service class (Approach 3) creates maintenance burden. One generator with optional file list parameter keeps the logic unified and maintainable.

2. **Backward Compatibility**: Existing `/harden` usage continues working exactly as before (no file list = git diff). This minimizes risk and allows incremental migration.

3. **Leverages Existing Infrastructure**: `ToolchainService` already handles file scoping with `${files}` placeholder substitution. We don't need to reimplement that - just pass the file list through.

4. **Clean Separation of Concerns**: Manifest generation (what to review) is separate from report persistence (where to save results). This makes each utility focused and testable.

5. **Traceability**: Scope metadata in the manifest makes it clear what was reviewed, which is valuable for debugging and audit trails.

6. **Progressive Architecture**: Building standalone utilities now allows HODGE-344.3 (ReviewEngineService) to compose them cleanly with different policies for `/harden` vs `/review`.

7. **Simple Testing Strategy**: Smoke tests can verify the contract (accepts file list, generates correct metadata) without complex integration setups. Full workflow testing happens in later stories.

**Implementation Details**:
```typescript
// Enhanced manifest generator signature
async function generateManifest(options: {
  fileList?: string[];
  scope?: {
    type: 'file' | 'directory' | 'commits' | 'feature';
    target: string;
  };
}): Promise<Manifest>

// Report saving utility signature
async function saveReviewReport(
  report: ReviewReport,
  outputDir: string = '.hodge/reviews'
): Promise<string> // Returns path to saved report
```

The manifest generator detects languages, selects profiles, and builds the manifest using either the provided file list or git diff. Scope metadata is added to the manifest for traceability. The report saving utility handles timestamp generation and file writing independently.

## Test Intentions

### 1. Manifest Generation with Explicit File List
**Intent**: Verify that the manifest generator accepts a file list parameter and generates a correct manifest.

**Verification**:
- Call `generateManifest({ fileList: ['src/a.ts', 'src/b.ts'] })`
- Expect manifest includes both files
- Expect manifest detects languages correctly (TypeScript)
- Expect manifest selects appropriate profiles (TypeScript, testing, etc.)
- No git diff operations performed

### 2. Manifest Generation Falls Back to Git Diff
**Intent**: Verify that when no file list is provided, the generator uses existing staged files behavior.

**Verification**:
- Call `generateManifest({})` with no file list
- Expect manifest uses git diff to find staged files
- Behavior identical to current `/harden` manifest generation
- Backward compatibility maintained

### 3. Scope Metadata Tracking
**Intent**: Verify that scope metadata is correctly tracked in the manifest.

**Verification**:
- Call `generateManifest({ fileList: ['src/lib/git-utils.ts'], scope: { type: 'file', target: 'src/lib/git-utils.ts' } })`
- Expect manifest includes scope metadata:
  - `scope.type === 'file'`
  - `scope.target === 'src/lib/git-utils.ts'`
  - `scope.fileCount === 1`
- Metadata accurately reflects what was reviewed

### 4. Report Saving to .hodge/reviews/
**Intent**: Verify that reports are saved to the correct location with timestamp naming.

**Verification**:
- Call `saveReviewReport(report, '.hodge/reviews')`
- Expect file created at `.hodge/reviews/review-{timestamp}.md`
- Timestamp format is `YYYY-MM-DD-HHMMSS`
- Report contents include scope metadata in header
- Returns path to saved report

### 5. Tool Scoping Inheritance
**Intent**: Verify that tools with `${files}` placeholder get the file list, others run project-wide.

**Verification**:
- Manifest includes file list metadata
- Tools configured in toolchain.yaml with `${files}` placeholder
- When `ToolchainService.runQualityChecks()` executes:
  - Tools like `eslint ${files}` receive the scoped file list
  - Tools like `tsc` run project-wide (no `${files}` placeholder)
- This behavior already exists in `ToolchainService.substituteFiles()` - just verify it works with explicit file lists

### 6. Empty File List Assumption
**Intent**: Verify that the manifest generator is never called with empty file lists.

**Verification**:
- This is a contract test, not a runtime check
- Document expectation: callers must handle `FileScopingError` before calling manifest generator
- Smoke test can verify manifest generator behavior with minimum 1 file
- Empty list handling tested at command level (HODGE-344.4), not manifest level

## Decisions Decided During Exploration

1. **Unified Manifest Generator**: Extend existing manifest generator with optional `fileList` parameter for single source of truth. When provided, use explicit file list; when omitted, fall back to git diff behavior for backward compatibility.

2. **Tool Scoping Pattern**: Follow existing `/harden` pattern using `ToolchainService.substituteFiles()` with `${files}` placeholder. Tools with placeholder get file list, tools without run project-wide. No changes needed to existing infrastructure.

3. **Report Naming Convention**: Use `review-{timestamp}.md` naming in `.hodge/reviews/` directory with format `YYYY-MM-DD-HHMMSS` (e.g., `review-2025-10-14-053045.md`).

4. **Scope Metadata Schema**: Add scope metadata fields to manifest - `type` (file/directory/commits/feature), `target` (what was scoped), `fileCount` (number of files). Keep core manifest schema identical to feature-based manifests.

5. **Empty File List Handling**: Manifest generator assumes non-empty file lists. Empty list handling occurs at caller level using `FileScopingError` from HODGE-344.1. Command catches error, displays message, exits gracefully without calling manifest generator.

6. **Standalone Utilities Design**: Build manifest generation and report saving as standalone, testable components without command integration. Enables clean composition in HODGE-344.3 (ReviewEngineService) and avoids premature refactoring.

7. **No Critical File Selection**: Critical file selection is ReviewEngineService concern with different policies for `/harden` (enabled) vs `/review` (disabled). Manifest generator focuses on file identification and metadata only.

8. **Smoke Test Strategy**: Contract verification through smoke tests - manifest accepts file lists, scope metadata tracks correctly, report saving works, file substitution inherited from ToolchainService. Integration testing deferred to HODGE-344.3 and HODGE-344.4.

## No Decisions Needed

All implementation questions resolved during exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to confirm implementation approach
- [ ] Proceed to `/build HODGE-344.2`

---
*Exploration completed: 2025-10-14T05:25:10.814Z*
*AI exploration completed via conversational discovery with parent and sibling context*
