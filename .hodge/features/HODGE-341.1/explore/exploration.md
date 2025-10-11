# Exploration: HODGE-341.1

## Feature Overview
**PM Issue**: HODGE-341.1
**Type**: infrastructure
**Created**: 2025-10-10T17:25:16.799Z

**Title**: Build System Detection and Toolchain Infrastructure

## Problem Statement

Hodge needs foundational infrastructure to detect and execute quality tools (TypeScript compiler, ESLint, Prettier, Vitest) for automated code review. This is Phase 1 of the hybrid tool+AI review system (HODGE-341), providing the core toolchain services that later phases will build upon.

**Current State**: Hodge has no automated tool execution infrastructure. Code quality checks rely entirely on AI manual file reading, which doesn't scale beyond 30-50 files due to token limits.

**Desired State**: ToolchainService detects available tools, executes them on uncommitted files, and DiagnosticsService aggregates results into a universal format that later phases can consume.

## Context
- **Standards**: Loaded (suggested only - explore phase)
- **Available Patterns**: 12
- **Parent Feature**: HODGE-341 (Hybrid Code Quality Review System)
- **Similar Features**: HODGE-327.2, HODGE-334
- **Relevant Lessons**: HODGE-334 (CLI/AI separation of concerns)

## Conversation Summary

### Tool Detection Strategy
**Decision**: Use three-tier detection priority: Config files > package.json > PATH
- Config files (.eslintrc.json, tsconfig.json, .prettierrc, vitest.config.ts) indicate active tool usage
- package.json devDependencies show explicit installation - trust if listed, assume installed
- Most common config file variants only (users can manually edit toolchain.yaml for edge cases)
- Separate from review profile detection (different purposes: execution vs AI context selection)

### Execution Pattern
**Decision**: Direct tool execution only (Pattern A from parent exploration)
- Execute tools directly: `npx tsc --noEmit`, `npx eslint ${files}`
- No package.json script checking/fallback (avoids "script pollution" anti-pattern)
- Definitive, predictable behavior

### File Scoping
**Decision**: Implement git diff-based file scoping in Phase 1
- /harden command runs tools on uncommitted files only (working tree + staged)
- Get file list via git diff, filter by extension (.ts, .tsx, .js, .jsx)
- Pass file arguments to tools that support it (eslint, prettier support files; tsc needs full project)
- Tools without file scoping run on entire project with warning

### Error Handling Philosophy
**Decision**: Distinguish tool availability from tool findings
- Tool not available (command not found) → **Warning** (skip with installation suggestion)
- Tool ran but found issues (exit code 1, JSON diagnostics) → **Error** (include in DiagnosticReport)
- Clear signal-to-noise: don't fail if tool is missing, do report if tool finds problems

### Service Architecture
**Decision**: ToolchainService + DiagnosticsService separation (from parent HODGE-341 decision)
- ToolchainService: tool detection, config loading, execution → returns RawToolResults[]
- DiagnosticsService: result aggregation, normalization → returns DiagnosticReport
- Clean separation of concerns, testable in isolation

### Configuration File Location
**Decision**: Keep detection criteria in review profiles (separate concerns)
- Review profiles (`detection:` frontmatter) serve AI review context selection
- ToolchainService uses simpler existence checks for executable discovery
- Different purposes, different timing, different granularity
- Accept potential duplication to maintain separation

## Implementation Approaches

### Approach 1: Service-Based Architecture with Git Integration (Recommended)

**Description**: Implement ToolchainService and DiagnosticsService as separate service classes following HODGE-341 parent decisions. ToolchainService handles detection and execution, DiagnosticsService aggregates results.

**Core Components**:

```typescript
// src/lib/toolchain-service.ts
interface ToolchainConfig {
  version: string;
  language: string;
  commands: {
    [toolName: string]: {
      command: string;        // e.g., "npx tsc --noEmit"
      provides: string[];     // e.g., ["type_checking"]
    };
  };
  quality_checks: {
    type_checking: string[];  // e.g., ["typescript"]
    linting: string[];        // e.g., ["eslint"]
    testing: string[];        // e.g., ["vitest"]
    formatting: string[];     // e.g., ["prettier"]
  };
}

class ToolchainService {
  async loadConfig(): Promise<ToolchainConfig> {
    // Load .hodge/toolchain.yaml
  }

  async detectTools(): Promise<DetectedTool[]> {
    // Priority: Config files > package.json > PATH
    // Return: [{name: 'typescript', detected: true, version: '5.3.3'}, ...]
  }

  async runQualityChecks(scope: 'uncommitted' | 'all'): Promise<RawToolResult[]> {
    const config = await this.loadConfig();
    const files = scope === 'uncommitted' ? await this.getUncommittedFiles() : undefined;

    return await Promise.all([
      this.runTypeChecking(config, files),
      this.runLinting(config, files),
      this.runTesting(config, files),
      this.runFormatting(config, files),
    ]);
  }

  private async getUncommittedFiles(): Promise<string[]> {
    // git diff HEAD --name-only + git diff --cached --name-only
    // Filter .ts, .tsx, .js, .jsx
  }

  private async runTypeChecking(config: ToolchainConfig, files?: string[]): Promise<RawToolResult> {
    const tools = config.quality_checks.type_checking;
    if (tools.length === 0) return { type: 'type_checking', skipped: true };

    const toolConfig = config.commands[tools[0]];
    // tsc doesn't support file scoping - always runs full project
    return await this.executeTool(toolConfig.command);
  }

  private async runLinting(config: ToolchainConfig, files?: string[]): Promise<RawToolResult> {
    const tools = config.quality_checks.linting;
    if (tools.length === 0) return { type: 'linting', skipped: true };

    const toolConfig = config.commands[tools[0]];
    const command = files
      ? `${toolConfig.command} ${files.join(' ')}`
      : toolConfig.command;
    return await this.executeTool(command);
  }

  private async executeTool(command: string): Promise<RawToolResult> {
    try {
      const result = await exec(command);
      return {
        success: result.exitCode === 0,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      if (error.message.includes('command not found')) {
        return { skipped: true, reason: 'Tool not available' };
      }
      throw error;
    }
  }
}

// src/lib/diagnostics-service.ts
interface DiagnosticReport {
  summary: {
    total_issues: number;
    by_severity: Record<Severity, number>;
  };
  issues: Diagnostic[];
}

class DiagnosticsService {
  aggregate(results: RawToolResult[]): DiagnosticReport {
    // Parse tool-specific output (tsc JSON, eslint JSON)
    // Normalize to universal format
    // Return aggregated report
  }

  private parseTypeScriptDiagnostics(stdout: string): Diagnostic[] {
    // Parse tsc output to Diagnostic[]
  }

  private parseESLintDiagnostics(stdout: string): Diagnostic[] {
    // Parse eslint JSON to Diagnostic[]
  }

  private normalizeSeverity(toolSeverity: string, toolName: string): Severity {
    // Map tool-specific severities to blocker/critical/major/minor/info
  }
}
```

**Git Integration**:
```typescript
// Part of ToolchainService
async getUncommittedFiles(): Promise<string[]> {
  // Working tree changes
  const working = await exec('git diff HEAD --name-only');

  // Staged changes
  const staged = await exec('git diff --cached --name-only');

  // Combine and dedupe
  const allFiles = [...new Set([...working.split('\n'), ...staged.split('\n')])];

  // Filter by extension
  return allFiles.filter(f =>
    f.endsWith('.ts') || f.endsWith('.tsx') ||
    f.endsWith('.js') || f.endsWith('.jsx')
  );
}
```

**toolchain.yaml Structure** (manually created for Phase 1):
```yaml
version: "1.0"
language: typescript

commands:
  typescript:
    command: npx tsc --noEmit
    provides: [type_checking]

  eslint:
    command: npx eslint --format=json
    provides: [linting]

  prettier:
    command: npx prettier --check
    provides: [formatting]

  vitest:
    command: npx vitest run --reporter=json
    provides: [testing]

quality_checks:
  type_checking: [typescript]
  linting: [eslint]
  testing: [vitest]
  formatting: [prettier]
```

**Pros**:
- Clean separation of concerns (SRP)
- Follows parent HODGE-341 architecture decisions
- Testable in isolation (mock git, mock exec)
- Git integration enables scoped analysis for /harden
- Extensible for Phase 2 (add more tools to config)

**Cons**:
- More classes/files than simpler approaches
- Requires git to be present (fails in non-git directories)
- Manual toolchain.yaml creation requires documentation

**When to use**: This is the recommended approach for Phase 1, balancing simplicity with extensibility for future phases.

---

### Approach 2: Single ToolExecutor Class (Simpler)

**Description**: Consolidate detection, execution, and aggregation into a single `ToolExecutor` class. Defer service separation until Phase 2 when we have more tools.

**Core Structure**:
```typescript
class ToolExecutor {
  async runAllChecks(scope: 'uncommitted' | 'all'): Promise<DiagnosticReport> {
    const files = scope === 'uncommitted' ? await this.getUncommittedFiles() : undefined;

    const results = await Promise.all([
      this.runTypeScript(files),
      this.runESLint(files),
      this.runPrettier(files),
      this.runVitest(files),
    ]);

    return this.aggregateResults(results);
  }

  private async runTypeScript(files?: string[]): Promise<ToolResult> {
    // Hardcoded: npx tsc --noEmit (no file scoping)
  }

  private async runESLint(files?: string[]): Promise<ToolResult> {
    // Hardcoded: npx eslint ${files} --format=json
  }

  // ... etc
}
```

**Pros**:
- Simpler implementation (single file, single class)
- Fewer abstractions to understand
- Faster to implement for Phase 1

**Cons**:
- Violates parent HODGE-341 service separation decision
- Harder to test (mocking tool execution mixed with aggregation)
- Refactor needed for Phase 2 (doesn't extend cleanly)
- Hardcoded tool commands (no configuration file)

**When to use**: Only if we want to defer architectural decisions, but this conflicts with parent decisions.

---

### Approach 3: Config-First with Dynamic Execution

**Description**: Load toolchain.yaml first, then dynamically execute whatever tools it specifies. Very flexible but more complex.

**Core Difference from Approach 1**:
```typescript
class ToolchainService {
  async runQualityChecks(scope: 'uncommitted' | 'all'): Promise<RawToolResult[]> {
    const config = await this.loadConfig();
    const files = scope === 'uncommitted' ? await this.getUncommittedFiles() : undefined;

    // Dynamic execution based on config
    const results = [];
    for (const [checkType, toolNames] of Object.entries(config.quality_checks)) {
      for (const toolName of toolNames) {
        const toolConfig = config.commands[toolName];
        const result = await this.executeTool(toolConfig.command, files, checkType);
        results.push(result);
      }
    }
    return results;
  }

  private async executeTool(command: string, files?: string[], checkType?: string): Promise<RawToolResult> {
    // Generic execution - no per-tool methods
    // Use command template: replace ${files} with actual files
    const substituted = command.replace('${files}', files?.join(' ') || '.');
    return await exec(substituted);
  }
}
```

**toolchain.yaml with templates**:
```yaml
commands:
  typescript:
    command: npx tsc --noEmit  # No ${files} - always full project
    provides: [type_checking]

  eslint:
    command: npx eslint ${files} --format=json  # Template substitution
    provides: [linting]
```

**Pros**:
- Maximum flexibility (any tool can be added via config)
- No code changes to add new tools
- Template substitution handles file scoping generically

**Cons**:
- More complex than needed for Phase 1 (only 4 tools)
- Template parsing adds edge cases (what if ${files} appears in error message?)
- Harder to debug (execution is very generic)
- Overkill for TypeScript-only Phase 1

**When to use**: If we expect frequent tool additions or multi-language support in Phase 1 (but we don't - that's Phase 5).

---

## Recommendation

**Approach 1: Service-Based Architecture with Git Integration**

**Why this approach:**

1. **Aligns with parent decisions**: HODGE-341 explicitly decided on ToolchainService + DiagnosticsService separation (SRP)

2. **Testability**: Each service can be tested in isolation:
   - ToolchainService tests: mock git, mock exec, verify command construction
   - DiagnosticsService tests: provide raw results, verify normalization

3. **Extensibility**: Clean foundation for Phase 2-6:
   - Phase 2: Add more tools to quality_checks mapping
   - Phase 3: DiagnosticsService adds critical file selection
   - Phase 5: Extend ToolchainService for multi-language detection

4. **Git integration now**: Implementing file scoping in Phase 1 enables immediate /harden value (run tools on uncommitted files only)

5. **Follows HODGE-334 pattern**: CLI discovers structure (what tools exist), returns results. Later phases will have AI interpret diagnostics.

**What makes this the right choice for Phase 1:**
- Not over-engineered (Approach 3 is overkill)
- Not under-engineered (Approach 2 conflicts with parent decisions)
- Balances simplicity with extensibility

**Trade-offs accepted:**
- Manual toolchain.yaml creation (defer `hodge init` to later phase)
- Git dependency (acceptable - Hodge is a git-based workflow tool)
- More files than single-class approach (worthwhile for SRP benefits)

## Test Intentions

### ToolchainService Smoke Tests

**Tool Detection:**
1. ✅ **Detects TypeScript when tsconfig.json exists** - verifies config file detection priority
2. ✅ **Detects ESLint when .eslintrc.json exists** - verifies config file variants
3. ✅ **Detects tools from package.json devDependencies** - verifies dependency detection
4. ✅ **Prefers config file over package.json when both present** - verifies priority order

**Tool Execution:**
5. ✅ **Executes tsc --noEmit and captures stdout/stderr** - verifies TypeScript execution
6. ✅ **Executes eslint with file arguments for uncommitted files** - verifies file scoping
7. ✅ **Executes prettier with file arguments** - verifies formatter execution
8. ✅ **Returns skipped=true when tool not available** - verifies warning behavior
9. ✅ **Returns success=false when tool finds issues** - verifies error behavior

**Git Integration:**
10. ✅ **Gets list of uncommitted files from working tree** - verifies git diff parsing
11. ✅ **Gets list of staged files** - verifies git diff --cached parsing
12. ✅ **Combines and dedupes working + staged files** - verifies file list merging
13. ✅ **Filters files by extension (.ts, .tsx, .js, .jsx)** - verifies extension filtering

### DiagnosticsService Smoke Tests

**Result Aggregation:**
14. ✅ **Aggregates results from multiple tools** - verifies multi-tool aggregation
15. ✅ **Normalizes TypeScript compiler errors to blocker severity** - verifies tsc parsing
16. ✅ **Normalizes ESLint errors to critical/major severity** - verifies eslint parsing
17. ✅ **Extracts file, line, column from tool output** - verifies diagnostic location parsing
18. ✅ **Counts total issues across all tools** - verifies summary calculation

**Configuration Loading:**
19. ✅ **Loads toolchain.yaml from .hodge directory** - verifies config loading
20. ✅ **Maps quality check types to tool names** - verifies quality_checks mapping
21. ✅ **Handles missing toolchain.yaml gracefully** - verifies error handling

## Decisions Decided During Exploration

1. ✓ **Tool detection priority**: Config files > package.json (trust if listed, assume installed)
2. ✓ **Execution pattern**: Direct tool execution only (Pattern A - `npx tsc --noEmit`)
3. ✓ **File scoping timing**: Implement git diff-based scoping in Phase 1
4. ✓ **Error handling distinction**: Tool unavailable = warning (skip), tool found issues = error (include in diagnostics)
5. ✓ **Detection criteria location**: Keep in review profiles (separate concern from tool execution)
6. ✓ **Service architecture**: ToolchainService + DiagnosticsService separation (from parent HODGE-341 decision)
7. ✓ **Config file scope**: Detect most common config file variants only (users manually edit toolchain.yaml for edge cases)

## Decisions Needed

1. **Tool version detection**: Should ToolchainService detect and report tool versions in Phase 1 (e.g., `typescript: 5.3.3`), or defer until Phase 5 when version-specific profiles matter? Detecting now enables better diagnostics, but adds complexity.

2. **Command templates**: Should toolchain.yaml support command templates with `${files}` placeholder (like Approach 3), or hard-code file argument patterns in ToolchainService methods? Templates are more flexible, but harder to debug.

3. **Pass rate calculation**: Should DiagnosticsService calculate `pass_rate` (percentage of checks passed) in Phase 1, or defer until Phase 3 when we have critical file selection? Calculating now provides user value, but requires defining what "pass" means for each tool.

4. **TypeScript file scoping workaround**: TypeScript compiler doesn't support file-level scoping (needs full project for type checking). Should we run `tsc --noEmit` on full project then filter diagnostics to uncommitted files, or warn user that type checking is always full-project? Filtering gives better UX, but adds complexity.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-341.1`

---
*Exploration completed: 2025-10-10*
*AI exploration based on conversational discovery*
