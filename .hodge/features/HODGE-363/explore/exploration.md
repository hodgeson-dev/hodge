# Exploration: HODGE-363

**Title**: Context Command YAML Manifest for AI-Driven File Loading

**Created**: 2025-10-29
**Status**: Exploring

## Problem Statement

The `/hodge` slash command currently hardcodes file reads in its template (e.g., `cat .hodge/HODGE.md`), making it difficult to extend context as new files are added. When the architecture graph feature (HODGE-362) was shipped, the `.hodge/architecture-graph.dot` file wasn't getting loaded into context because the template wasn't updated. The `hodge context` CLI command should return a structured YAML manifest of files for AI to read, eliminating hardcoded bash commands and following HODGE-334 separation of concerns.

## Context

**Project Type**: TypeScript CLI tool for AI-assisted development

**Related Standards**:
- HODGE-334: CLI/AI Separation of Concerns (CLI discovers structure, AI interprets content)
- CLI Architecture: `hodge context` is AI-orchestrated, not user-facing
- Logging Standards: Logger writes to pino files, command output to stdout

## Related Features

- HODGE-334: Established CLI/AI separation pattern
- HODGE-360: Review manifest using YAML (precedent for structured output)
- HODGE-362: Architecture graph feature that triggered this refactor

## Conversation Summary

The `/hodge` slash command serves as the context bootstrapper, called before all other workflow commands to load essential project and feature context. Currently, the template at `.claude/commands/hodge.md` contains hardcoded bash commands that read files directly:

```bash
cat .hodge/HODGE.md
cat .hodge/standards.md
cat .hodge/decisions.md
ls -la .hodge/patterns/
```

This approach has several problems:
1. **Maintenance burden**: Adding new context files requires manual template updates
2. **Inconsistency risk**: Easy to miss files or have template drift from actual needs
3. **Poor separation**: Template encodes structural knowledge that belongs in CLI
4. **Architecture violation**: Doesn't follow HODGE-334 (CLI discovers, AI interprets)

The immediate trigger was the architecture graph feature (HODGE-362). After shipping, the `.hodge/architecture-graph.dot` file wasn't being loaded into context because no one updated the `/hodge` template.

Since `hodge context` is an AI-orchestrated command (not user-facing like `hodge init` or `hodge logs`), we can optimize purely for AI consumption without backward compatibility concerns. The command should output a structured YAML manifest to stdout containing:

**Global files** (always loaded):
- `.hodge/HODGE.md` - session state and current feature
- `.hodge/standards.md` - enforceable project standards
- `.hodge/decisions.md` - architectural decisions
- `.hodge/principles.md` - guiding principles (if exists)
- `.hodge/architecture-graph.dot` - codebase dependency graph (if exists)
- `.hodge/context.json` - saved context state (if exists)

**Feature files** (when feature specified or from session):
- All files in `.hodge/features/HODGE-XXX/**/*.*` recursively

**Pattern awareness**:
- List of available patterns with extracted titles and overview sections
- Enables AI awareness without loading full pattern files upfront

**Metadata**:
- Architecture graph statistics (module count, dependency count)
- File availability status (available vs not_found)
- Future extensibility for additional metadata

The manifest uses YAML format for consistency with Hodge's existing configuration files (toolchain.yaml, review-manifest.yaml). The CLI extracts pattern titles and overviews per HODGE-334 (CLI discovers structure, AI interprets content), avoiding the need for AI to read full pattern files just for awareness.

Logger calls remain in place to write debugging information to pino log files (accessible via `hodge logs`), while the YAML manifest goes to stdout for AI consumption. No conflict between the two output streams.

The manifest is session-aware: when `/hodge` is called without arguments, it loads the session state to determine the current feature and includes that feature's context automatically.

## Implementation Approaches

### Approach 1: Minimal Manifest with File List Only

**Description**: Output a simple YAML structure containing just file paths and availability status, with minimal metadata.

**Structure**:
```yaml
version: "1.0"
files:
  - path: .hodge/HODGE.md
    status: available
  - path: .hodge/standards.md
    status: available
  - path: .hodge/features/HODGE-363/explore/exploration.md
    status: available
  - path: .hodge/principles.md
    status: not_found
```

**Implementation**:
- Single flat list of all files
- Simple status flag (available/not_found)
- No categorization or metadata
- AI determines file purpose from path

**Pros**:
- Simplest implementation
- Minimal code changes
- Easy to parse
- Fast to generate

**Cons**:
- No semantic information about file types
- No architecture graph stats
- No pattern awareness without reading files
- Harder for AI to prioritize files
- Loses contextual information

**When to use**: When simplicity and speed are paramount, and AI context can infer everything from file paths alone.

---

### Approach 2: Rich Manifest with Metadata Extraction

**Description**: Output a structured YAML manifest with categorized files, extracted pattern metadata, and architecture graph statistics.

**Structure**:
```yaml
version: "1.0"

global_files:
  - path: .hodge/HODGE.md
    status: available
  - path: .hodge/standards.md
    status: available
  - path: .hodge/decisions.md
    status: available
  - path: .hodge/principles.md
    status: not_found
  - path: .hodge/architecture-graph.dot
    status: available
  - path: .hodge/context.json
    status: not_found

architecture_graph:
  status: available
  modules: 208
  dependencies: 193
  location: .hodge/architecture-graph.dot
  note: "Updated after each successful /ship"

patterns:
  location: .hodge/patterns/
  files:
    - path: test-pattern.md
      title: "Testing Patterns and Examples"
      overview: "Demonstrates Hodge testing approaches using smoke and integration tests..."
    - path: structure-pattern.md
      title: "Code Structure Guidelines"
      overview: "Guidelines for organizing code following Hodge architectural patterns..."

feature_context:
  feature_id: HODGE-363
  files:
    - path: .hodge/features/HODGE-363/explore/exploration.md
      status: available
    - path: .hodge/features/HODGE-363/explore/test-intentions.md
      status: not_found
```

**Implementation**:
- Parse pattern files to extract `# title` and `## Overview` sections
- Count nodes/edges in architecture graph DOT file
- Categorize files by purpose (global, feature, patterns)
- Include rich metadata for context
- Session-aware feature detection

**Pros**:
- Perfect alignment with HODGE-334 (CLI extracts structure)
- AI gets rich context without reading all files upfront
- Pattern awareness without loading full patterns
- Architecture graph statistics immediately visible
- Clear categorization aids prioritization
- Extensible for future metadata

**Cons**:
- More complex implementation
- Pattern parsing adds processing time
- Larger YAML output
- More code to maintain

**When to use**: When following best practices and optimizing for AI workflow efficiency with rich contextual information.

---

### Approach 3: Hybrid with Lazy Loading Hints

**Description**: Basic manifest with file paths, plus "load on demand" hints for patterns and optional metadata.

**Structure**:
```yaml
version: "1.0"

files:
  global:
    - .hodge/HODGE.md
    - .hodge/standards.md
  feature:
    - .hodge/features/HODGE-363/explore/exploration.md
  patterns:
    - .hodge/patterns/test-pattern.md (lazy load)
    - .hodge/patterns/structure-pattern.md (lazy load)

metadata:
  architecture_graph:
    available: true
    hint: "Read .hodge/architecture-graph.dot for full graph"
```

**Implementation**:
- File categorization without deep metadata extraction
- Hints for optional/lazy loading
- Minimal parsing, maximum flexibility
- AI decides what to load and when

**Pros**:
- Balance between simplicity and structure
- Faster than Approach 2 (no pattern parsing)
- More structured than Approach 1
- Flexibility for AI to optimize loading

**Cons**:
- "Lazy load" concept not well-defined
- Unclear benefit over simpler approaches
- AI still needs to read patterns for awareness
- Metadata hints add complexity without clear value

**When to use**: When you want some structure but aren't sure which metadata will be valuable (exploratory approach).

## Recommendation

**Approach 2: Rich Manifest with Metadata Extraction**

This approach best aligns with Hodge principles and HODGE-334 architectural standards:

1. **Perfect HODGE-334 Compliance**: CLI discovers structure (extracts pattern titles/overviews, counts graph nodes), AI interprets content (reads files, synthesizes information)

2. **AI Workflow Optimization**: Pattern awareness without loading full files upfront saves tokens and processing time. Architecture graph statistics provide immediate codebase understanding.

3. **Maintainability**: When adding new context files (like architecture graph), just add to manifest generation. No template changes needed.

4. **Extensibility**: Rich structure supports future metadata additions (file timestamps, precedence hints, validation status, etc.)

5. **Consistency**: Mirrors review-manifest.yaml pattern from HODGE-360, establishing a consistent approach to structured CLI output.

6. **Token Efficiency**: Extracted pattern overviews (50-100 tokens each) vs full pattern files (1000+ tokens each) provides 10x improvement in initial context loading.

The additional complexity is justified by:
- Pattern parsing is straightforward (find `# title` and `## Overview` sections)
- Architecture graph stats already implemented in ArchitectureGraphService
- One-time implementation cost, ongoing maintenance benefits
- Aligns with strategic direction of CLI/AI separation

## Test Intentions

1. **Global file discovery**: When `hodge context` is executed, it should include all global files (.hodge/HODGE.md, standards.md, decisions.md, principles.md, architecture-graph.dot, context.json) with correct availability status

2. **Feature file discovery**: When `hodge context --feature HODGE-XXX` is executed, it should recursively discover all files in `.hodge/features/HODGE-XXX/**/*.*` and include them in the manifest

3. **Session-aware feature detection**: When `hodge context` is executed without feature argument, it should load session state and include that feature's context in the manifest

4. **Pattern metadata extraction**: For each pattern file in `.hodge/patterns/`, the manifest should include the extracted title (from `# title` line) and overview (from `## Overview` section)

5. **Architecture graph statistics**: When architecture graph exists, the manifest should include module count and dependency count parsed from the DOT file

6. **Missing file handling**: When a file doesn't exist (e.g., principles.md, context.json), the manifest should mark it as `status: not_found` rather than omitting it

7. **Valid YAML output**: The manifest should be valid YAML that can be parsed without errors, output to stdout

8. **Logger separation**: Logger calls should write to pino log files while YAML manifest writes to stdout, with no interference between streams

## Decisions Decided During Exploration

1. **YAML format**: Use YAML for manifest output (consistent with toolchain.yaml, review-manifest.yaml)

2. **Pure YAML output**: Output only YAML to stdout, no dual modes or flags needed (context command is AI-orchestrated only)

3. **CLI metadata extraction**: CLI extracts pattern titles/overviews per HODGE-334 separation (CLI discovers structure, AI interprets)

4. **Load everything**: Include all feature files without filtering (optimization deferred to future work)

5. **Session-aware**: Use session feature when no --feature argument provided (automatic context restoration)

6. **Logger to pino**: Keep logger.info() calls writing to pino files for `hodge logs` debugging, YAML manifest to stdout

7. **File status tracking**: Include availability status (available/not_found) for all files in manifest

8. **Conditional graph stats**: Include architecture graph statistics only when graph file exists and is parseable

## No Decisions Needed

All architectural and implementation decisions were resolved during exploration. Ready to proceed to `/build` phase.