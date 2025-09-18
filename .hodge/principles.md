# Hodge Architectural Principles

## Core Principles

### 1. AI-Backend Separation
- **AI (Claude) Role**: Intellectual work - analysis, extraction, design, proposals
- **Backend (hodge) Role**: Operational work - file creation, PM updates, Git operations
- **Interface**: Clear command boundaries with well-defined inputs/outputs

### 2. Data Transfer Patterns
- **Simple Data**: CLI arguments for basic strings and flags
- **Complex Data**: File-based transfer through `.hodge/tmp/`
- **Structured Data**: YAML/JSON specifications for rich metadata
- **Preservation**: Spec files are historical artifacts, not temporary files

### 3. Template Abstraction
- **Principle**: Templates guide conversation flow, not implementation details
- **Good**: "Create the feature: `hodge explore feature --from-spec file.yaml`"
- **Bad**: "This will create directories X, Y, update file Z..."
- **Rule**: Treat hodge commands as black-box services

### 4. Context Preservation
- **Capture the Why**: Document rationale for decisions and groupings
- **Rich Metadata**: Preserve AI analysis (scope, dependencies, effort estimates)
- **Feature Specs**: Complete context from extraction to implementation

### 5. Progressive Development
- **Explore**: Freedom to experiment, minimal constraints
- **Build**: Balanced approach, should follow standards
- **Harden**: Strict enforcement, must meet quality gates
- **Ship**: Production ready, all requirements met

## Implementation Patterns

### File-Based Feature Extraction
```yaml
# Spec file preserves all AI analysis
version: "1.0"
feature:
  name: "feature-name"
  description: "What and why"
  rationale: "Why these pieces belong together"
  scope:
    included: ["what's in"]
    excluded: ["what's out"]
```

### Command Interface Design
- **Single Purpose**: Each command does one thing well
- **Progressive Options**: Simple cases easy, complex cases possible
- **Backward Compatible**: New approaches don't break old workflows

## Anti-Patterns to Avoid

1. **Tight Coupling**: Templates depending on implementation details
2. **Context Loss**: Generic templates instead of rich, specific content
3. **Auto-Deletion**: Removing audit trail and debugging information
4. **Pattern Matching in Code**: Trying to implement what AI does better
5. **Exposing Internals**: Documenting backend mechanics in user-facing templates

---
_These principles guide Hodge development and should be considered in all architectural decisions._