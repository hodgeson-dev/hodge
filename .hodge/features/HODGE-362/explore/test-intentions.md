# Test Intentions for HODGE-362

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Feature: Architecture Graph Generation and Loading

### Graph Generation
- [ ] Graph generation succeeds for supported tech stacks - When architecture graph tool is configured and codebase uses a supported language, graph generation completes successfully
- [ ] Graph file created at correct location after successful /ship - After a feature ships successfully, `.hodge/architecture-graph.dot` file exists and contains valid DOT format data
- [ ] Failed graph generation logs warning without failing /ship - When graph generation tool fails (not installed, configuration error), ship process continues with warning logged

### Graph Loading
- [ ] Graph loaded and available during /hodge command execution - When `/hodge` is invoked, architecture graph content is read and included in AI context
- [ ] Missing graph file handled gracefully - When `.hodge/architecture-graph.dot` doesn't exist (new project, pre-first-ship), `/hodge` continues without errors

### Multi-Language Support
- [ ] Tool-specific graph commands configured for all supported languages - tool-registry.yaml contains `graph_command` entries for TypeScript/JS, Python, Kotlin, Java, Go, and other supported languages

### Graph Quality
- [ ] Module-level graph output is readable and structured - Generated DOT file uses module-level grouping (not file-level) and is parseable by AI

## Edge Cases and Considerations

### Tool Availability
- What happens when dependency-cruiser (or language-specific tool) is not installed?
- How do we detect tool availability before attempting graph generation?

### Configuration
- How do we handle missing or invalid `.dependency-cruiser.cjs` configuration?
- Should we provide a default configuration if none exists?

### Large Codebases
- How do we handle extremely large codebases that might produce massive DOT files?
- Should there be a size limit or truncation strategy?

### Graph Staleness
- How do we indicate when the graph is stale (many commits since last `/ship`)?
- Should this be a warning, or just informational?

### Multi-Project Scenarios
- What happens in a monorepo with multiple sub-projects?
- Should each sub-project have its own graph, or one unified graph?

## Integration Points

### Ship Command Integration
- Graph generation triggered at end of successful `/ship`
- Non-blocking behavior (warnings only on failure)
- Logging of graph generation status

### Hodge Command Integration
- Graph file loaded during `/hodge` execution
- Graph content included in AI context
- Graceful handling of missing graph file

### Toolchain Configuration
- `codebase_analysis.architecture_graph.command` in `.hodge/toolchain.yaml`
- Tool registry entries with `graph_command` field
- Language-specific tool detection and configuration

---
*Generated during exploration phase. Convert to actual tests during build phase.*