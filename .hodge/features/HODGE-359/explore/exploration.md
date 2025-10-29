# Exploration: HODGE-359

**Title**: Replace quality-checks.md with Enhanced validation-results.json

**Created**: 2025-10-28
**Status**: Exploring

## Problem Statement

The current toolchain validation system generates a human-readable quality-checks.md file that slash commands read to make quality gate decisions. This approach has several limitations:

1. **Redundant Generation**: AI can interpret structured data directly and present it conversationally, making the markdown file unnecessary
2. **Incomplete Metadata**: validation-results.json only tracks whether tools executed successfully (`success: true/false`), not whether they found errors or warnings
3. **Hardcoded Tool Lists**: Slash commands use predetermined tool lists for quality gates instead of dynamically evaluating ALL tools configured in toolchain.yaml
4. **Token Inefficiency**: Reading full markdown reports when structured counts would suffice

The goal is to enhance validation-results.json with error/warning counts and extracted issue lists, eliminating the need for quality-checks.md while enabling dynamic, comprehensive quality gate enforcement.

## Context

**Project Type**: TypeScript CLI tool (Hodge framework)

**Current Architecture**:
- ToolchainService executes tools and captures stdout/stderr
- Results saved to validation-results.json with basic metadata
- quality-checks.md generated as human-readable report
- Slash commands read quality-checks.md to make blocking decisions
- Quality gates check specific predetermined tools (eslint, typescript, vitest)

**Existing Patterns**:
- tool-registry.yaml (src/bundled-config/) defines tool detection and commands
- toolchain.yaml (.hodge/) copied during `hodge init` for project-specific configuration
- Progressive enforcement: explore (no checks) → build (smoke tests) → harden (integration) → ship (all gates)

## Related Features

- HODGE-341.1: Build System Detection and Toolchain Infrastructure
- HODGE-341.2: Tool Registry Architecture
- HODGE-344.3: Remove ANSI color codes from quality-checks.md
- HODGE-357.1: Toolchain execution ban in tests

## Conversation Summary

Through exploration, we identified key requirements and made several implementation decisions:

**Token Efficiency Strategy**: Use regex patterns to extract structured error/warning lists from tool stdout. This saves tokens by avoiding AI parsing overhead while providing the data needed for quality gate decisions and contextual presentation.

**Regex Pattern Architecture**: Patterns defined in tool-registry.yaml (maintained by Hodge with optimal configurations for each tool) and copied to project toolchain.yaml during init. Two separate patterns per tool: `error_pattern` and `warning_pattern` for clarity and flexibility.

**Quality Gate Logic**: Strict enforcement where errors block both /harden and /ship workflows, warnings are informational only. Quality gates evaluate ALL tools in toolchain.yaml dynamically, not a predetermined subset. This ensures comprehensive validation as projects add new tools.

**Exit Code Handling**: Exit codes are informational metadata, not the source of truth for quality decisions. Some tools (like dependency-cruiser) use non-zero exit codes for warnings. Quality gate decisions based solely on regex-extracted errorCount and warningCount.

**Tool Execution Failures**: When tools fail to execute (not installed, crashes, etc.), failures are surfaced to AI for helpful suggestions but don't block workflows. AI can offer to fix installation issues. Distinguishes between "tool couldn't run" vs "tool ran and found problems."

**Implementation Phasing**: Start with simple line extraction (Option A) - one regex captures entire error/warning line. Defer structured component parsing (Option B) - separate file/line/message fields - to future optimization once we have usage data showing token pressure.

## Implementation Approaches

### Approach 1: Regex-Based Structured Validation Results

**Description**: Enhance validation-results.json with regex-extracted error/warning counts and lists. Remove quality-checks.md generation entirely. Slash commands read JSON and make decisions based on errorCount across all configured tools.

**Implementation Steps**:
1. Add `error_pattern` and `warning_pattern` fields to tool-registry.yaml for each tool
2. Update ToolchainService to apply regex patterns to stdout and extract matches
3. Enhance validation-results.json structure with errorCount, warningCount, errors[], warnings[]
4. Update /harden and /ship slash command templates to read JSON instead of markdown
5. Remove quality-checks.md generation code
6. Add quality gate logic: block if ANY tool has errorCount > 0

**Pros**:
- Eliminates redundant markdown generation
- Enables dynamic quality gates (evaluates all tools, not predetermined list)
- Token-efficient: AI gets counts first, analyzes details only when needed
- Flexible: Regex patterns can be customized per-project in toolchain.yaml
- Maintainable: Tool-specific patterns centralized in registry

**Cons**:
- Regex patterns need careful testing for each tool's output format
- Projects with custom tool configurations may need pattern adjustments
- Migration effort for existing features that reference quality-checks.md

**When to use**: This is the recommended approach for achieving all stated goals with minimal complexity.

### Approach 2: Hybrid Markdown + JSON

**Description**: Keep quality-checks.md for human debugging but add enhanced JSON for slash commands. Tools generate both outputs, slash commands prefer JSON.

**Implementation Steps**:
1. Add regex extraction as in Approach 1
2. Enhance validation-results.json with counts and lists
3. Keep quality-checks.md generation for manual inspection
4. Update slash commands to read JSON for quality gates
5. Document quality-checks.md as debugging artifact

**Pros**:
- Backward compatible with existing workflows
- Provides human-readable debugging artifact
- Lower migration risk

**Cons**:
- Still generates redundant markdown file
- Doesn't fully address token efficiency goals
- Maintenance burden for two output formats
- May confuse users about which file to check

**When to use**: Conservative migration path if concerned about removing existing artifacts.

### Approach 3: AI-Parsed Raw Output (No Regex)

**Description**: Save raw stdout in validation-results.json without regex extraction. Slash commands pass full stdout to AI for parsing and interpretation.

**Implementation Steps**:
1. Enhance validation-results.json with full stdout (already done)
2. Remove quality-checks.md generation
3. Update slash commands to pass stdout to AI with parsing instructions
4. AI uses LLM capabilities to identify errors/warnings

**Pros**:
- No regex maintenance burden
- Handles varied/evolving tool output formats naturally
- Extremely flexible

**Cons**:
- Higher token usage (full stdout vs. extracted lines)
- Less predictable (AI parsing may miss edge cases)
- Slower (AI must parse every time vs. pre-extracted lists)
- Can't make quality gate decisions without AI call
- No local tooling (scripts can't parse results without AI)

**When to use**: Only if regex proves unmaintainable across diverse tool ecosystems.

## Recommendation

**Implement Approach 1: Regex-Based Structured Validation Results**

This approach directly addresses all identified problems:
- Eliminates redundant quality-checks.md generation
- Provides token-efficient structured data for AI interpretation
- Enables dynamic quality gates across all configured tools
- Balances automation (regex extraction) with flexibility (AI interpretation)

The regex patterns are maintainable because:
1. Each tool's output format is controlled by command flags in toolchain.yaml (we configure compact, consistent formats)
2. Patterns defined centrally in tool-registry.yaml with Hodge-maintained defaults
3. Projects can override patterns in their toolchain.yaml if needed
4. Simple line extraction (Option A) minimizes regex complexity

Starting with strict quality gates (errors block, warnings don't) provides clear initial behavior that can be made configurable later if needed.

The implementation builds on existing toolchain infrastructure (HODGE-341.1, HODGE-341.2) and aligns with Hodge's progressive enforcement philosophy.

## Test Intentions

1. **Regex extraction for errors**: Given tool stdout with error messages, when regex patterns are applied, then errors[] array contains all error lines and errorCount matches array length
2. **Regex extraction for warnings**: Given tool stdout with warning messages, when regex patterns are applied, then warnings[] array contains all warning lines and warningCount matches array length
3. **Enhanced JSON structure**: When tools execute, then validation-results.json includes errorCount, warningCount, errors[], warnings[], exitCode, stdout, stderr for each tool result
4. **Quality gate blocking on errors**: When /harden runs and any tool has errorCount > 0, then the workflow blocks and reports blocking errors to AI
5. **Quality gate blocking on ship**: When /ship runs and any tool has errorCount > 0, then the workflow blocks and prevents shipping
6. **Warnings are non-blocking**: When tools report warnings (warningCount > 0) but no errors (errorCount = 0), then /harden and /ship workflows proceed without blocking
7. **Tool execution failures are non-blocking**: When a tool fails to execute (command not found, crash), then the failure is reported to AI with suggestion to fix but workflow is not blocked
8. **Dynamic tool evaluation**: When toolchain.yaml configures multiple tools, then quality gates evaluate ALL configured tools not just a predetermined subset

## Decisions Decided During Exploration

1. ✓ **Simple vs. Structured Extraction**: Use simple line extraction (Option A) initially - one regex captures entire error/warning line. Defer structured component parsing (Option B with separate file/line/message fields) to future optimization.

2. ✓ **Exit Code Handling**: Remove redundant "success" field from validation-results.json. Keep exitCode as informational metadata. Quality gate decisions based on regex-extracted errorCount/warningCount, not exit codes.

3. ✓ **Tool Execution Failures**: Tool execution failures (can't run command) are non-blocking. Surfaced to AI for helpful suggestions (e.g., offer to install missing tools). Only actual errors found by tools (errorCount > 0) block workflows.

4. ✓ **Error vs. Warning Regex**: Use two separate patterns (error_pattern and warning_pattern) in tool-registry.yaml for clarity, flexibility, and easier debugging.

5. ✓ **Quality Gate Strictness**: Start with strict enforcement - errors block both /harden and /ship, warnings are informational. Defer configurable thresholds to future enhancement.

6. ✓ **Pattern Location**: Regex patterns defined in tool-registry.yaml (maintained by Hodge), copied to project toolchain.yaml during `hodge init`. Projects can override if needed.

7. ✓ **Token Efficiency**: AI receives errorCount/warningCount first for quick assessment, then analyzes extracted errors[]/warnings[] lists for details. Avoids sending full stdout unless needed for debugging.

## No Decisions Needed

All architectural decisions were resolved during exploration conversation.

## Next Steps

1. Review this exploration with stakeholders
2. Use `/build HODGE-359` to implement the recommended approach
3. Start with tool-registry.yaml pattern definitions for common tools (eslint, typescript, vitest)
4. Update ToolchainService to apply regex extraction
5. Modify validation-results.json structure
6. Update /harden and /ship slash command templates
7. Remove quality-checks.md generation code