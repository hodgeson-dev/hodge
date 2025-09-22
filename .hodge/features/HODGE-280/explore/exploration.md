# Exploration: HODGE-280 - Always Load Core Context in /hodge Command

## Feature Analysis
**Type**: Enhancement
**Keywords**: hodge, context, loading, command
**Related Commands**: /hodge, context, status
**PM Issue**: HODGE-280

## Context
- **Date**: 9/21/2025
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (loaded)
- **Existing Patterns**: 9

## Problem Statement
The `/hodge` command currently has conditional logic that only loads full context files (HODGE.md, standards.md, decisions.md, patterns) in the `{{else}}` branch for standard initialization. When a feature parameter is passed, it skips loading these core files, only loading feature-specific context. This means users miss critical project context when resuming work on a feature.

## Similar Features
- HODGE-029 (Context loading)
- HODGE-030 (Command initialization)
- HODGE-056 (Session management)

## Implementation Approaches

### Approach 1: Always Load Core First (Recommended)
**Description**: Move core context loading to execute before any conditional branches, ensuring it always runs regardless of parameters.

**Implementation**:
```markdown
## Command Execution

### 1. Always Load Core Context (Before Any Conditions)
\`\`\`bash
# Load project HODGE.md (session info)
cat .hodge/HODGE.md

# Load complete standards
echo "=== PROJECT STANDARDS ==="
cat .hodge/standards.md

# Load all decisions
echo "=== PROJECT DECISIONS ==="
cat .hodge/decisions.md

# List available patterns
echo "=== AVAILABLE PATTERNS ==="
ls -la .hodge/patterns/
\`\`\`

{{#if list}}
### 2. Handle List Mode
...
{{else if recent}}
### 2. Handle Recent Mode
...
{{else if feature}}
### 2. Handle Feature Mode
...
{{else}}
### 2. Handle Standard Mode
...
{{/if}}
```

**Pros**:
- Guarantees core context is always available
- Simple, clean implementation
- Maintains backward compatibility
- Clear execution order

**Cons**:
- Slightly more output in all cases
- May load context twice if feature also loads it

### Approach 2: Conditional with Shared Function
**Description**: Create a shared section that both feature and standard modes reference.

**Implementation**:
- Define core loading as a reusable block
- Call it from both feature and standard branches
- Avoids duplication but requires template changes

**Pros**:
- No unnecessary loading
- More efficient for specific modes
- Can customize per mode

**Cons**:
- More complex template structure
- Risk of forgetting to call in new modes
- Harder to maintain consistency

### Approach 3: Smart Context Detection
**Description**: Check if context was already loaded, only load if missing.

**Implementation**:
- Add flag to track if core was loaded
- Conditionally load based on flag
- More intelligent but complex

**Pros**:
- Avoids duplicate loading
- Optimized for performance
- Smart handling of edge cases

**Cons**:
- Requires state management
- More complex logic
- Harder to debug issues

## Recommendation
**Approach 1: Always Load Core First** is the recommended solution because:
- Simplest to implement and maintain
- Guarantees consistent behavior
- Aligns with "explicit is better than implicit" principle
- Minimal performance impact (just cat'ing a few files)
- Users always have full context regardless of entry point

## Implementation Hints
- Move core loading block to top of command execution
- Keep it outside all conditional branches
- Ensure it runs before any feature-specific logic
- Test with all command variations (/hodge, /hodge feature, /hodge --list, etc.)

## Next Steps
- [ ] Review the recommended approaches
- [ ] Consider similar features for inspiration
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-280`

---
*Generated with AI-enhanced exploration (2025-09-22T01:26:12.128Z)*
