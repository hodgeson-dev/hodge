# Exploration: HODGE-359.1

**Title**: Core Regex Extraction Infrastructure for Toolchain Validation

**Created**: 2025-10-28
**Status**: Exploring

## Problem Statement

Build the foundational infrastructure for extracting structured error/warning data from tool stdout using regex patterns. This infrastructure will enable the parent feature (HODGE-359) to replace quality-checks.md with token-efficient, structured validation-results.json.

The core challenge is designing regex patterns that reliably extract errors and warnings from diverse tool outputs while maintaining simplicity and testability. Since we control tool output formats via toolchain.yaml, we can configure tools for consistent, parseable output rather than handling arbitrary format variations.

## Context

**Project Type**: TypeScript CLI tool (Hodge framework)

**Parent Feature**: HODGE-359 - Replace quality-checks.md with Enhanced validation-results.json

**Current State**:
- ToolchainService executes tools and captures stdout/stderr
- Results saved to validation-results.json with basic metadata (tool, exitCode, stdout, stderr)
- quality-checks.md generated as human-readable report (to be removed)
- No structured error/warning extraction currently exists

**Key Infrastructure**:
- tool-registry.yaml (src/bundled-config/) defines tool detection and default commands
- toolchain.yaml (.hodge/) contains project-specific configuration with output format flags
- Tools already configured with controlled output formats (e.g., `eslint --format compact`)

## Related Features

- HODGE-359: Parent epic for enhanced validation-results.json
- HODGE-341.1: Build System Detection and Toolchain Infrastructure
- HODGE-341.2: Tool Registry Architecture
- HODGE-344.3: Remove ANSI color codes from quality-checks.md
- HODGE-357.1: Toolchain execution ban in tests (no real tool spawning)
- HODGE-341.5: Test infrastructure fix with TempDirectoryFixture pattern

## Learned Patterns

From HODGE-341.5 (Test Infrastructure):
- Always use mocked data in tests, never spawn real processes
- Use TempDirectoryFixture for any temporary file operations
- Deep investigation over workarounds - fix root causes
- Pattern documentation prevents regression

From HODGE-357.1 (Toolchain Execution Ban):
- Tests must NOT execute real toolchain commands (eslint, jscpd, tsc, etc.)
- Mock tool execution and test business logic with fixtures
- Running real tools creates unpredictable behavior and resource exhaustion

## Conversation Summary

Through exploration, we clarified the implementation approach and resolved key design questions:

**Output Format Strategy**: We confirmed that toolchain.yaml already configures controlled output formats for all tools (e.g., `eslint --format compact`, `tsc` without `--pretty`). This means regex patterns can be simple and predictable rather than handling arbitrary format variations.

**Testing Strategy**: Given the strict bans on subprocess spawning (HODGE-317.1) and toolchain execution (HODGE-357.1), we'll test regex extraction using mocked stdout strings captured from actual tool outputs. This avoids spawning real tools while ensuring patterns work with real-world output.

**JSON Schema Design**: We confirmed removal of the deprecated `success` field (exit codes are unreliable - dependency-cruiser uses non-zero for warnings). The enhanced schema adds `errorCount`, `warningCount`, `errors[]`, and `warnings[]` as simple string arrays. We're deferring structured parsing (separate file/line/message fields) to future optimization, following the parent exploration's "simple line extraction initially" decision.

**Tool Coverage**: Rather than starting with just the "big 3" (eslint, tsc, vitest), we'll provide comprehensive coverage for all 7 tools currently in toolchain.yaml: typescript, eslint, vitest, prettier, jscpd, dependency-cruiser, and semgrep. This ensures dynamic quality gates work from day one.

**Edge Case Handling**:
- ANSI color codes: Configure tools to output without colors (already mostly done)
- Multiline errors: Capture only first line, leveraging compact output formats
- Empty output: Accept `errorCount=0, errors=[]` as normal success case

## Implementation Approaches

### Approach 1: Regex-Based Extraction with Controlled Output Formats

**Description**: Add `error_pattern` and `warning_pattern` fields to tool-registry.yaml for all 7 configured tools. Update ToolchainService to apply these regex patterns to stdout and extract matches into structured arrays. Enhance validation-results.json with errorCount, warningCount, errors[], and warnings[] fields.

**Implementation Steps**:
1. Add regex patterns to tool-registry.yaml for each tool:
   - typescript: Match TypeScript error format (`file(line,col): error TS####:`)
   - eslint: Match compact format (`file:line:col: error/warning message`)
   - vitest: Match test failure format
   - prettier: Match unformatted file listings
   - jscpd: Parse JSON output for duplication reports
   - dependency-cruiser: Match violation format
   - semgrep: Match security finding format
2. Update ToolchainService.executeToolCommand() to apply patterns after capturing stdout
3. Extract matches into errors[] and warnings[] arrays, count them
4. Remove deprecated `success` field from ValidationResult interface
5. Add new fields: errorCount, warningCount, errors[], warnings[]
6. Test with mocked stdout strings (no real tool execution)
7. Copy patterns from .hodge/toolchain.yaml to src/bundled-config/tool-registry.yaml

**Pros**:
- Leverages existing controlled output formats (already configured)
- Simple regex patterns due to consistent tool output
- Fast execution (regex matching is cheap)
- Testable with mocked strings (avoids subprocess/toolchain bans)
- Comprehensive coverage (all 7 tools from day one)
- Token-efficient (counts and lists vs. full markdown reports)
- Maintainable (patterns centralized in registry)

**Cons**:
- Regex patterns need testing for each tool's output format
- Pattern maintenance if tools change output formats (mitigated by our control of flags)
- Initial effort to research and design 7 tool patterns

**When to use**: This is the recommended approach for achieving all stated goals with minimal complexity while respecting testing constraints.

### Approach 2: JSON-Based Output Parsing

**Description**: Configure all tools to output structured JSON where possible (eslint has `--format json`, jscpd already uses `--reporters json`). Parse JSON to extract errors/warnings directly without regex.

**Implementation Steps**:
1. Update toolchain.yaml to use JSON output formats where available
2. Add JSON parsing logic to ToolchainService
3. Transform tool-specific JSON structures into common format
4. Handle tools without JSON output (typescript, prettier) with fallback regex
5. Enhance validation-results.json as in Approach 1

**Pros**:
- Structured parsing (more reliable than regex for complex output)
- No regex maintenance for JSON-supporting tools
- Tool output changes less likely to break parsing

**Cons**:
- Not all tools support JSON output (typescript, prettier, dependency-cruiser)
- Requires maintaining two parsing strategies (JSON + regex fallback)
- JSON output typically more verbose (larger stdout, more tokens)
- Tool-specific JSON schemas require individual parsing logic
- More complex implementation (multiple parsers vs. unified regex approach)

**When to use**: Only if regex proves unreliable or tools frequently change output formats.

### Approach 3: AI-Driven Output Parsing (Deferred)

**Description**: Skip regex extraction entirely. Save raw stdout to validation-results.json and have AI parse errors/warnings on-demand using LLM capabilities.

**Implementation Steps**:
1. Enhance validation-results.json with full stdout (already done)
2. Pass stdout to AI with parsing instructions when needed
3. AI extracts errors/warnings using natural language understanding

**Pros**:
- Extremely flexible (handles any output format)
- No regex maintenance
- Can adapt to new tools without code changes

**Cons**:
- Higher token usage (send full stdout every time)
- Slower (AI must parse on every quality gate check)
- Less predictable (AI parsing may vary)
- Can't make quality gate decisions without AI call (breaks local tooling)
- Violates parent exploration decision to use regex for token efficiency

**When to use**: Only if regex proves unmaintainable across diverse tool ecosystems. Not recommended for this feature.

## Recommendation

**Implement Approach 1: Regex-Based Extraction with Controlled Output Formats**

This approach directly addresses all requirements while respecting project constraints:

**Alignment with Parent Decisions**:
- Uses regex patterns as decided in HODGE-359 exploration
- Implements simple line extraction (not structured parsing)
- Provides token efficiency (counts and lists vs. full markdown)
- Enables dynamic quality gates (all tools, not predetermined subset)

**Respects Testing Constraints**:
- Tests with mocked stdout strings (HODGE-357.1 compliance)
- No subprocess spawning (HODGE-317.1 compliance)
- Uses TempDirectoryFixture for any file operations (HODGE-341.5 pattern)

**Leverages Existing Infrastructure**:
- Tools already configured with controlled output formats in toolchain.yaml
- Patterns can be simple because we control the output format
- Centralized pattern management in tool-registry.yaml

**Comprehensive Coverage**:
- All 7 tools covered from day one
- Quality gates work for any configured tool
- Projects can add new tools with their own patterns

The regex patterns are maintainable because:
1. We control output formats via command flags (compact, single-line formats)
2. Patterns tested with mocked real-world output samples
3. Centralized in tool-registry.yaml with Hodge-maintained defaults
4. Projects can override in toolchain.yaml if needed
5. Simple line extraction minimizes regex complexity

## Test Intentions

1. **Regex extraction for eslint errors**: Given eslint compact output with errors, when error_pattern is applied, then errors[] contains all error lines and errorCount matches array length
2. **Regex extraction for typescript errors**: Given typescript output with errors, when error_pattern is applied, then errors[] contains all error lines and errorCount matches array length
3. **Regex extraction for vitest failures**: Given vitest output with failures, when error_pattern is applied, then errors[] contains all failure lines and errorCount matches array length
4. **Regex extraction for warnings**: Given tool output with warnings, when warning_pattern is applied, then warnings[] contains all warning lines and warningCount matches array length
5. **Empty output handling**: Given tool output with no errors/warnings, when patterns are applied, then errorCount=0, warningCount=0, and arrays are empty
6. **Enhanced JSON structure**: When ToolchainService processes tool results, then validation-results.json includes errorCount, warningCount, errors[], warnings[], exitCode, stdout, stderr for each tool
7. **Deprecated field removal**: When ToolchainService processes tool results, then validation-results.json does NOT include the deprecated `success` field
8. **Comprehensive pattern coverage**: Given all 7 configured tools (typescript, eslint, vitest, prettier, jscpd, dependency-cruiser, semgrep), when patterns are defined, then each tool has both error_pattern and warning_pattern in tool-registry.yaml
9. **ANSI code handling**: Given tool output with ANSI codes stripped, when patterns are applied, then errors/warnings are correctly extracted
10. **Multiline error handling**: Given multiline error output, when pattern matches only first line, then extracted error is the complete first line

## Decisions Decided During Exploration

1. ✓ **Output Format Strategy**: Use controlled output formats configured in toolchain.yaml (Option B) - simplifies regex patterns by ensuring consistent, parseable output
2. ✓ **Testing Strategy**: Test with mocked stdout strings, not actual tool execution - avoids subprocess/toolchain execution bans (HODGE-357.1, HODGE-317.1)
3. ✓ **Success Field Removal**: Remove `success` field from validation-results.json - use errorCount as source of truth (exit codes unreliable)
4. ✓ **Array Structure**: Use simple string[] for errors/warnings - defer structured parsing (file/line/message fields) to future optimization
5. ✓ **Pattern Metadata**: Skip pattern metadata fields (patternUsed, patternMatched) - YAGNI principle, no clear use case
6. ✓ **Tool Coverage**: Comprehensive coverage for all 7 tools currently in toolchain.yaml - enables dynamic quality gates from day one
7. ✓ **ANSI Code Handling**: Configure tools to strip ANSI codes via flags - cleanest solution, no regex complexity for color codes
8. ✓ **Multiline Error Handling**: Capture only first line of multiline errors - keep regex simple, leverage compact output formats
9. ✓ **Empty Output Handling**: Accept empty arrays as normal success case - errorCount=0 means no issues found

## No Decisions Needed

All implementation decisions were resolved during the exploration conversation.

## Next Steps

1. Review this exploration
2. Use `/build HODGE-359.1` to implement the recommended approach
3. Start with regex pattern definitions for all 7 tools in tool-registry.yaml
4. Update ToolchainService to apply regex extraction
5. Enhance ValidationResult interface and validation-results.json structure
6. Add smoke tests with mocked stdout samples
7. Copy patterns from .hodge/toolchain.yaml to src/bundled-config/tool-registry.yaml