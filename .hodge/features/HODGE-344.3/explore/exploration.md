# Exploration: HODGE-344.3

## Feature Overview
**PM Issue**: HODGE-344.3
**Parent Feature**: HODGE-344 (Unified review workflow with auto-fix and flexible file scoping)
**Type**: sub-feature
**Created**: 2025-10-14T14:53:53.744Z

## Title
ReviewEngineService - shared review workflow core

## Problem Statement

The `/harden` and upcoming `/review` commands need shared infrastructure for discovering and reporting code quality issues found by CLI tools. Currently, `/harden` has this logic embedded directly in the command, making it impossible to reuse for `/review` or future review-related features. Without a shared ReviewEngineService, we face code duplication, inconsistent review workflows, and difficult maintenance as review capabilities expand.

The service must coordinate manifest generation, quality check execution, and critical file selection while allowing each command to apply different policies (mandatory vs optional fixes, different report locations, critical selection on/off). It should return structured data that AI can interpret and discuss with users, not make decisions about severity or formatting.

## Parent Context

**Parent Epic**: HODGE-344 established unified review workflow with two distinct sequences:
- `/harden`: Fix-first (auto-fix → review → validate) for production readiness
- `/review`: Review-first (generate manifest → AI review → optional fix) for advisory analysis

**Key Parent Decisions**:
- CLI reports facts to AI in standard files; AI interprets and acts
- Tool scoping via `${files}` placeholder (ToolchainService.substituteFiles())
- Report format consistency between commands (Blockers, Warnings, Suggestions)
- Critical file selection is configurable (enabled for /harden, disabled for /review)

**Story Position**: HODGE-344.3 is the third story in Lane 0 (Core Infrastructure), depends on HODGE-344.1 (git file scoping) and HODGE-344.2 (manifest generation with file scoping). This story creates the reusable engine that HODGE-344.4 (/review) and HODGE-344.5 (/harden migration) will use.

**Sibling Context**:
- HODGE-344.1 shipped git file scoping utilities (validateFile, getFilesInDirectory, getFilesFromLastNCommits) with FileScopingError for type-safe empty handling
- HODGE-344.2 shipped enhanced manifest generator (accepts fileList parameter) and ReviewReportSaver (timestamp-based naming in .hodge/reviews/)

## Conversation Summary

We explored building a ReviewEngineService that serves as CLI infrastructure for AI-driven code review workflows:

**Single Responsibility Clarity**: The service's sole responsibility is "Collect raw quality check results from CLI tools and package them with context for AI interpretation." It does NOT parse tool outputs, make severity decisions, format markdown reports, execute auto-fixes, or prompt users. Those responsibilities belong to AI (interpretation), ReviewReportSaver (formatting), AutoFixService (fixing), and slash command templates (prompting).

**Architecture Principle**: CLI provides services to AI command templates. ReviewEngineService gathers information about known issues found by CLI tools and reports back to AI, which engages in conversation with the user about what to do. The service returns structured data, not markdown.

**ToolchainService Integration**: Extended existing `runQualityChecks()` to accept file lists directly (in addition to existing FileScope enum) for backward compatibility. This avoids method duplication while supporting both feature-based and file-based workflows.

**GitDiffResult Requirement**: CriticalFileSelector needs real change statistics (lines added/deleted) for accurate risk scoring. Rather than fake stats or transforming manifest generator, we run `git diff --numstat` on scoped files to get actual change metrics. For working tree files (--file, --directory), use `git diff HEAD`. For commits (--last N), use the commit range.

**Manifest-First Workflow**: Following existing `/harden` pattern - generate manifest first (determines what to review), then run quality checks. This maintains consistency and logical separation: manifest = "what to review", tool results = "what we found".

**No Output Parsing**: ReviewEngineService does NOT parse tool outputs. It packages raw stdout/stderr for AI interpretation. The AI reads tool output, assesses severity, identifies specific issues, and facilitates conversation with users about fixes.

**Auto-fixable Enrichment**: Service enriches each tool result with `autoFixable: boolean` flag by checking tool registry for `fix_command`. Conservative approach - only true if tool has fix command configured. This gives AI clear signal about what's automatable without parsing tool-specific output formats.

**Critical File Context**: When critical selection enabled, include full `CriticalFilesReport` (with scores, risk factors, fan-in metrics) in results. AI uses this rich context to explain why certain files were prioritized and guide user conversation about review focus.

**Configuration via Options Object**: ReviewOptions passed to service methods controls behavior (critical selection on/off, scope metadata). Commands configure the service at call site rather than service holding state. TypeScript ensures valid configuration.

**Testing Strategy**: Hybrid approach - smoke tests with mocked dependencies for contract verification (fast), integration tests with real dependencies for workflow verification (thorough). Follows project standards: "prefer integration tests over unit tests, use real dependencies when possible."

**Change Stats Utility**: New utility function `getFileChangeStats(filePaths: string[]): Promise<GitDiffResult[]>` in git-utils.ts runs git diff --numstat and parses output into GitDiffResult objects with real linesAdded/linesDeleted. Reuses existing git command patterns.

## Implementation Approaches

### Approach 1: Extract from HardenCommand with Minimal Changes

**Description**: Extract the existing workflow logic directly from HardenCommand into ReviewEngineService with minimal refactoring. Keep the same method signatures, variable names, and flow. Update HardenCommand to call the service instead of running logic inline. This approach prioritizes speed and safety over cleanliness.

**Pros**:
- Fastest implementation (mostly copy-paste)
- Lowest risk of breaking existing /harden behavior
- Easy to verify equivalence (before/after comparison)
- Can ship quickly and refine later

**Cons**:
- May carry over technical debt from command layer
- Less clean separation of concerns
- Harder to test in isolation (tied to command patterns)
- May need refactoring before /review integration

**When to use**: When speed and safety are paramount, and we're willing to accept technical debt for faster delivery.

### Approach 2: Clean Service Layer with Dependency Injection (Recommended)

**Description**: Build ReviewEngineService from scratch with clean architecture principles - explicit dependencies via constructor injection, clear method boundaries, structured return types, and comprehensive error handling. The service orchestrates existing utilities (ManifestGenerator, ToolchainService, CriticalFileSelector) without inheriting command-layer concerns.

**Pros**:
- Clean separation of concerns (orchestration vs execution)
- Highly testable (inject mocks for unit tests, real instances for integration)
- Clear API surface (ReviewOptions in, ReviewFindings out)
- No technical debt from command layer
- Easy to extend for future review features
- Follows SOLID principles (Single Responsibility, Dependency Inversion)

**Cons**:
- More upfront design effort
- Requires careful thought about abstractions
- May need to adjust existing utilities for clean integration
- Slightly longer implementation time than extract-and-refactor

**When to use**: When building foundation for multiple consumers (/harden, /review, future features) and long-term maintainability matters more than immediate delivery speed.

### Approach 3: Unified Service with Strategy Pattern

**Description**: Create a single ReviewEngineService that uses strategy pattern to handle feature-based vs file-based review modes. Pass a ReviewStrategy object that encapsulates mode-specific behavior (how to get files, how to generate manifest, where to save reports). Commands instantiate with appropriate strategy.

**Pros**:
- Single service handles all review modes
- Easy to add new review strategies in future
- Encapsulates mode-specific logic cleanly
- Clear extension point for customization

**Cons**:
- Over-engineered for current requirements (only 2 modes)
- More complex to understand and test
- Strategy abstraction may be premature
- Harder to debug (indirection through strategy layer)
- Commands need to understand strategy instantiation

**When to use**: When you anticipate many review modes with different behaviors, or when mode-specific logic is complex and benefits from encapsulation.

## Recommendation

**Approach 2: Clean Service Layer with Dependency Injection** is recommended.

**Rationale**:

1. **Foundation for Multiple Consumers**: This service will be used by /harden (HODGE-344.5), /review (HODGE-344.4), and future review features (pre-commit hooks, CI/CD integration mentioned in parent). Clean architecture pays off with multiple consumers.

2. **Testability is Critical**: Review workflows are complex (manifest generation → tool execution → critical selection → packaging). Clean dependency injection enables thorough testing with both mocked and real dependencies (hybrid strategy).

3. **Existing Utilities are Mature**: ManifestGenerator (HODGE-344.2), ToolchainService (HODGE-341.1), and CriticalFileSelector (HODGE-341.3) are already well-designed. We're orchestrating proven components, not rebuilding them.

4. **Avoid Command-Layer Debt**: Extracting directly from HardenCommand (Approach 1) risks carrying over command-specific concerns (console output, user prompts, git operations mixed with logic). Starting clean separates orchestration from presentation.

5. **Strategy Pattern is Premature**: We have exactly 2 review modes with similar workflows differing only in policies (critical selection on/off). Configuration object (ReviewOptions) handles this elegantly without pattern overhead.

6. **Standards Alignment**: Project standards emphasize "proper encapsulation and testability" (Logging Standards) and "extract testable business logic into Service classes" (CLI Architecture Standards). This approach follows those principles.

**Implementation Details**:

```typescript
// Clean service with explicit dependencies
export class ReviewEngineService {
  constructor(
    private manifestGenerator: ReviewManifestGenerator,
    private toolchainService: ToolchainService,
    private criticalFileSelector: CriticalFileSelector,
    private toolRegistry: ToolRegistry
  ) {}

  async analyzeFiles(
    fileList: string[],
    options: ReviewOptions
  ): Promise<ReviewFindings> {
    // 1. Get change stats via new git utility
    const changeStats = await getFileChangeStats(fileList);

    // 2. Generate manifest (language detection, profiles, context)
    const manifest = await this.manifestGenerator.generateManifest(
      options.scope.target,
      changeStats,
      tierRecommendation,
      { fileList, scope: options.scope }
    );

    // 3. Run quality checks (returns raw tool results)
    const toolResults = await this.toolchainService.runQualityChecks(fileList);

    // 4. Select critical files if policy enables it
    const criticalReport = options.enableCriticalSelection
      ? this.criticalFileSelector.selectCriticalFiles(
          changeStats,
          toolResults,
          { maxFiles: 10 }
        )
      : undefined;

    // 5. Package for AI (enrich with auto-fix info)
    return this.packageFindings(toolResults, criticalReport, manifest);
  }

  private packageFindings(
    toolResults: RawToolResult[],
    criticalReport: CriticalFilesReport | undefined,
    manifest: ReviewManifest
  ): ReviewFindings {
    // Enrich tool results with autoFixable flags
    const enrichedResults = toolResults.map(result => ({
      tool: result.tool,
      checkType: result.type,
      success: result.success ?? false,
      output: this.combineOutput(result.stdout, result.stderr),
      autoFixable: this.isAutoFixable(result.tool),
      skipped: result.skipped,
      reason: result.reason
    }));

    return {
      toolResults: enrichedResults,
      criticalFiles: criticalReport,
      manifest,
      metadata: {
        scope: manifest.scope!,
        timestamp: new Date().toISOString(),
        tier: manifest.recommended_tier
      }
    };
  }

  private isAutoFixable(toolName: string): boolean {
    const toolInfo = this.toolRegistry.tools[toolName];
    return !!toolInfo?.fix_command;
  }
}

// Configuration object for policies
interface ReviewOptions {
  scope: {
    type: 'file' | 'directory' | 'commits' | 'feature';
    target: string;
  };
  enableCriticalSelection: boolean;
}

// Structured output for AI
interface ReviewFindings {
  toolResults: EnrichedToolResult[];
  criticalFiles?: CriticalFilesReport;
  manifest: ReviewManifest;
  metadata: {
    scope: ScopeMetadata;
    timestamp: string;
    tier: string;
  };
}
```

**Migration Path**:
1. Build ReviewEngineService with comprehensive tests (this story)
2. Migrate /harden to use service while preserving behavior (HODGE-344.5)
3. Implement /review using service with different options (HODGE-344.4)
4. All three commands benefit from shared, tested infrastructure

## Test Intentions

### 1. File Scoping Integration
**Intent**: Verify ReviewEngineService accepts file lists and generates proper change statistics for manifest and critical selection.

**Verification**:
- Call `analyzeFiles(['src/a.ts', 'src/b.ts'], options)`
- Expect service calls `getFileChangeStats()` internally
- Expect manifest includes correct file count and change metrics
- Verify change stats used for critical file scoring

### 2. Manifest Generation with Scope
**Intent**: Verify manifest is generated with correct scope metadata for traceability.

**Verification**:
- Call `analyzeFiles(files, { scope: { type: 'directory', target: 'src/lib/' } })`
- Expect manifest includes `scope.type === 'directory'`
- Expect manifest includes `scope.target === 'src/lib/'`
- Expect manifest includes `scope.fileCount` matching file list length
- Verify language detection and profile selection happen

### 3. Tool Execution Orchestration
**Intent**: Verify quality checks run on scoped files and return raw, unprocessed results.

**Verification**:
- Service calls `toolchainService.runQualityChecks(fileList)`
- Tool results include raw stdout/stderr (not parsed)
- Multiple tool results returned (type checking, linting, formatting, etc.)
- Results maintain original success/failure status from tools

### 4. Auto-fixable Flag Enrichment
**Intent**: Verify tool results include correct autoFixable flags based on tool registry configuration.

**Verification**:
- Tools with `fix_command` in registry → `autoFixable: true`
- Tools without `fix_command` in registry → `autoFixable: false`
- Flag added to every tool result consistently
- AI receives clear signal about automation potential

### 5. Critical File Selection Policy - Enabled
**Intent**: Verify critical file selection runs when policy enables it and results include full context.

**Verification**:
- Call `analyzeFiles(files, { enableCriticalSelection: true })`
- Expect `criticalFileSelector.selectCriticalFiles()` called
- Expect `ReviewFindings.criticalFiles` populated with scores and risk factors
- Verify top files identified based on risk scoring algorithm

### 6. Critical File Selection Policy - Disabled
**Intent**: Verify critical file selection is skipped when policy disables it.

**Verification**:
- Call `analyzeFiles(files, { enableCriticalSelection: false })`
- Expect `criticalFileSelector.selectCriticalFiles()` NOT called
- Expect `ReviewFindings.criticalFiles === undefined`
- All files treated equally (no prioritization)

### 7. Tool Failure Handling
**Intent**: Verify tool failures are included in results as data (not thrown as errors or hidden).

**Verification**:
- Tool execution fails (exit code 1 or command not found)
- Expect tool result included with `success: false` or `skipped: true`
- Expect `output` contains error information
- Expect `reason` explains why skipped (if applicable)
- Service completes successfully (doesn't throw)

### 8. Empty Results Packaging
**Intent**: Verify empty or zero-issue results are properly structured for AI interpretation.

**Verification**:
- All tools return success with no issues (clean code)
- Expect `ReviewFindings.toolResults` contains all tool results
- Each result has `success: true` and empty/clean output
- AI can distinguish "ran successfully, found nothing" from "didn't run"

### 9. Configuration Options Impact
**Intent**: Verify different ReviewOptions produce expected behavioral changes.

**Verification**:
- Different scope types (file vs directory vs commits) produce different manifests
- `enableCriticalSelection: true` vs `false` changes presence of critical files
- Options passed correctly through to dependent services
- Service respects configuration consistently

### 10. Dependency Injection for Testability
**Intent**: Verify service accepts mocked dependencies for isolated unit testing.

**Verification**:
- Instantiate service with mock dependencies
- Mocks receive expected method calls with correct parameters
- Service logic executes without requiring real file system or git
- Integration tests use real dependencies for workflow verification

## Decisions Decided During Exploration

1. **Single Responsibility**: ReviewEngineService sole purpose is "Collect raw quality check results from CLI tools and package them with context for AI interpretation." No parsing, severity assessment, markdown formatting, auto-fixing, or user prompting.

2. **ToolchainService Extension**: Extended existing `runQualityChecks()` method to accept `FileScope | string[]` for backward compatibility with feature-based workflows while supporting explicit file lists.

3. **Real Change Statistics**: Run `git diff --numstat` on scoped files to get actual change metrics (lines added/deleted) for accurate risk scoring in CriticalFileSelector. New utility: `getFileChangeStats(filePaths: string[]): Promise<GitDiffResult[]>` in git-utils.ts.

4. **Manifest-First Workflow**: Generate manifest first (determines what to review with language detection and profile selection), then run quality checks. Follows existing `/harden` pattern for consistency.

5. **No Output Parsing**: Service packages raw stdout/stderr from tools without parsing. AI interprets tool outputs, assesses severity, and identifies specific issues during conversation with user.

6. **Auto-fixable Enrichment Strategy**: Add `autoFixable: boolean` flag to each tool result by checking tool registry for `fix_command`. Conservative approach - only true when fix command explicitly configured.

7. **Critical File Context Depth**: Include full `CriticalFilesReport` (scores, risk factors, import fan-in) when critical selection enabled. Rich context helps AI explain prioritization to user.

8. **Configuration via Options Object**: `ReviewOptions` passed to methods controls behavior (scope metadata, critical selection on/off). Commands configure at call site; service remains stateless.

9. **Structured Data Return**: Service returns `ReviewFindings` structure (tool results + critical files + manifest + metadata). ReviewReportSaver (HODGE-344.2) handles markdown formatting for persistence.

10. **Testing Strategy**: Hybrid approach with smoke tests using mocked dependencies for contract verification (fast) and integration tests using real dependencies for workflow verification (thorough). Follows project standard: "prefer integration tests over unit tests."

## No Decisions Needed

All architectural and implementation questions resolved during exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to confirm implementation approach
- [ ] Proceed to `/build HODGE-344.3`

---
*Exploration completed: 2025-10-14T14:53:53.744Z*
*AI exploration completed via conversational discovery with parent and sibling context*
