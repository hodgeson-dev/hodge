# Exploration: HODGE-362

**Title**: Add DOT format architecture graph generation and loading for AI codebase structure awareness

**Created**: 2025-10-29
**Status**: Exploring

## Problem Statement

Claude Code needs continuous awareness of codebase structure to judge code quality, identify architectural drift, assess impact of changes, and determine when architectural shifts are warranted. Currently, AI lacks visibility into the dependency relationships and module structure of the codebase it's working on.

A DOT format dependency graph generated after successful feature ships and loaded during every `/hodge` session provides this architectural context across all workflow commands (`/review`, `/explore`, `/decide`, `/build`).

## Context

**Project Type**: TypeScript/JavaScript (Hodge itself), with support needed for all tech stacks in tool-registry.yaml

## Conversation Summary

During exploration, we clarified several key aspects of this feature:

**Tool Selection**: Initially considered jscpd (a duplication detector), but recognized that dependency-cruiser (already in Hodge's toolchain) is the appropriate tool for TypeScript/JavaScript dependency graphs with DOT output support.

**Scope and Granularity**: The graph should capture production code only (excluding tests, scripts, etc.). Module-level granularity provides the right abstraction for architectural analysis (20-30 nodes) rather than overwhelming file-level detail (100+ nodes). This makes it digestible for AI while still revealing architectural patterns, god modules, and circular dependencies.

**Generation Timing**: Graph generation occurs only at the end of a successful `/ship` command - the moment when code for a feature has reached its final form. The file is stored at `.hodge/architecture-graph.dot` and loaded during every `/hodge` call, making it available for all subsequent workflow commands.

**Multi-Language Support**: Take a comprehensive approach to tech stack support. Configure appropriate dependency graph tools for all languages in tool-registry.yaml (TypeScript/JS, Python, Kotlin, Java, Go, etc.) with best-guess configurations to be validated through real-world usage.

**Tool Registry Pattern**: Extend existing tool entries with a `graph_command` field to support dual-purpose usage - both quality gate checking (existing `default_command`) and architecture graph generation (new `graph_command`). This avoids breaking existing functionality while adding new capabilities.

**Error Handling**: Graph generation failures are non-blocking - log warnings but don't fail the ship process. Missing graph files are handled gracefully without breaking workflows.

## Implementation Approaches

### Approach 1: Incremental Integration with Smart Defaults

**Description**: Add architecture graph generation as a new `codebase_analysis` section in toolchain.yaml, extend tool-registry.yaml with `graph_command` fields for each supported language, integrate graph generation into the ship workflow, and load the graph file during `/hodge` execution.

**Pros**:
- Minimal disruption to existing workflows
- Smart defaults (module-level granularity) work well for most codebases
- Non-blocking behavior ensures robustness
- Existing dependency-cruiser tool reused for TypeScript/JavaScript
- Clear separation between quality gates and codebase analysis

**Cons**:
- Requires coordination across multiple files (tool-registry.yaml, ship command, hodge command)
- Initial tool configurations for non-TypeScript languages may need refinement
- Graph only updates after `/ship`, could be stale during long development sessions

**When to use**: This is the pragmatic, production-ready approach that balances functionality with maintainability.

### Approach 2: Real-Time Graph Generation

**Description**: Generate the architecture graph on-demand during every `/hodge` call or major workflow command, ensuring the graph is always current.

**Pros**:
- Graph always reflects current codebase state
- No stale data concerns
- Could provide real-time feedback on architectural changes

**Cons**:
- Performance overhead on every `/hodge` call (graph generation can take 5-10+ seconds on large codebases)
- Increased complexity in caching and staleness detection
- Tool execution overhead for every command invocation
- May slow down developer workflow

**When to use**: Only if users consistently report that post-ship graph updates are too infrequent.

### Approach 3: Multi-Level Graph Hierarchy

**Description**: Generate multiple graphs at different levels of abstraction (module-level, file-level, component-level) and allow AI to choose the appropriate level based on the question being asked.

**Pros**:
- Maximum flexibility for AI analysis
- Can zoom in/out based on context
- Supports both high-level architecture review and detailed impact analysis

**Cons**:
- 3x storage overhead (3 graph files)
- 3x generation time during `/ship`
- Added complexity in AI prompt engineering (which graph to use when?)
- Token overhead from multiple graph files

**When to use**: Consider this as a future enhancement once we validate that single-level graphs have limitations.

## Recommendation

**Approach 1: Incremental Integration with Smart Defaults**

This approach provides immediate value with minimal risk. By leveraging dependency-cruiser (already in the toolchain) and establishing a clean `codebase_analysis` section in toolchain.yaml, we create a foundation that can evolve over time.

Module-level granularity strikes the right balance for the stated use cases:
- Identifying architectural drift
- Assessing impact of changes
- Determining when architectural shifts are warranted
- Detecting god modules and circular dependencies

The non-blocking behavior ensures that graph generation never disrupts the development flow, while the post-ship timing captures architecture in its final, reviewed state.

We can always add real-time generation (Approach 2) or multi-level graphs (Approach 3) as enhancements if users request them, but starting simple increases the likelihood of successful adoption.

## Test Intentions

The following behavioral expectations will guide testing:

1. **Graph generation succeeds for supported tech stacks** - When architecture graph tool is configured and codebase uses a supported language, graph generation completes successfully
2. **Graph file created at correct location after successful /ship** - After a feature ships successfully, `.hodge/architecture-graph.dot` file exists and contains valid DOT format data
3. **Graph loaded and available during /hodge command execution** - When `/hodge` is invoked, architecture graph content is read and included in AI context
4. **Missing graph file handled gracefully** - When `.hodge/architecture-graph.dot` doesn't exist (new project, pre-first-ship), `/hodge` continues without errors
5. **Failed graph generation logs warning without failing /ship** - When graph generation tool fails (not installed, configuration error), ship process continues with warning logged
6. **Tool-specific graph commands configured for all supported languages** - tool-registry.yaml contains `graph_command` entries for TypeScript/JS, Python, Kotlin, Java, Go, and other supported languages
7. **Module-level graph output is readable and structured** - Generated DOT file uses module-level grouping (not file-level) and is parseable by AI

## Decisions Made During Exploration

1. ✓ **Tool Selection**: Use dependency-cruiser for TypeScript/JavaScript (already in toolchain, supports DOT output)
2. ✓ **File Location**: `.hodge/architecture-graph.dot`
3. ✓ **Granularity**: Module-level as default (better abstraction for architectural analysis)
4. ✓ **Tech Stack Support**: Comprehensive approach - configure all supported languages from the start
5. ✓ **Failure Behavior**: Non-blocking with warning
6. ✓ **Tool Registry Pattern**: Add `graph_command` field to existing tool entries (dual-purpose tools)
7. ✓ **Toolchain Structure**: `codebase_analysis.architecture_graph.command`
8. ✓ **Generation Timing**: Only at end of successful `/ship`
9. ✓ **Loading Strategy**: Every `/hodge` invocation loads the graph for AI context

## Decisions Needed

1. Should dependency-cruiser's `--collapse` parameter use directory depth or package boundaries for module grouping?
2. Should we provide a manual regeneration command (e.g., `hodge analyze-architecture`) or rely only on automatic `/ship` generation?
3. Exact `.dependency-cruiser.cjs` configuration for optimal graph output (filtering rules, grouping strategies)?

## Tool Registry Configuration

For reference, the dependency-cruiser entry in `src/bundled-config/tool-registry.yaml`:

```yaml
dependency-cruiser:
  languages: [typescript, javascript]
  detection:
    - type: package_json
      package: dependency-cruiser
  installation:
    package_managers:
      npm:
        package: dependency-cruiser
        install_command: npm install --save-dev dependency-cruiser
  default_command: npx depcruise --config .dependency-cruiser.cjs --output-type err ${files} || true
  graph_command: npx depcruise --config .dependency-cruiser.cjs --output-type dot . > .hodge/architecture-graph.dot || true
  version_command: depcruise --version
  categories: [architecture, architecture_graphing]
  error_pattern: '^\s*error\s+.+:\s+'
  warning_pattern: '^\s*warn\s+.+:\s+'
```

## Next Steps

1. Review exploration and make any remaining decisions
2. Use `/decide` to record architectural decisions (if needed)
3. Start building with `/build HODGE-362`