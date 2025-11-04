---
description: Drill into implementation details after exploration
argument-hint: <feature-id>
---

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 📋 Refine: Implementation Refinement                    │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Refine:" prefix for context awareness
- ✅ Section name matches exactly as shown

## Purpose

The `/refine` command bridges exploration and implementation by drilling into implementation details:
- **After**: Exploration (high-level what + recommended approach)
- **Before**: Building (actual implementation)
- **Output**: refinements.md with detailed implementation plan

## Command Execution

Execute the Hodge CLI command:
```bash
hodge refine {{feature}}
```

## What This Does

1. Validates that exploration.md exists
2. Checks for existing refinements.md (use `--rerun` to regenerate)
3. Creates `refine/` directory structure
4. Loads exploration context and questions
5. Loads sub-feature context (parent + siblings) if applicable
6. Outputs context for AI refinement conversation

## After Command Execution

The CLI will output:
- Recommended approach from exploration
- Questions for refinement (from exploration.md)
- Sub-feature context (parent + sibling refinements, if applicable)
- Instructions for two-phase refinement conversation

## Two-Phase Refinement Conversation

### Phase 1: Address Known Questions

If the CLI shows "Questions for Refinement", address each one:

1. Read the questions from the CLI output
2. For each question, ask the user for their input
3. Capture answers with rationale

**Example**:
```
I see 3 questions from exploration:

1. Context manifest loading - Should refinements.md be in the manifest?
2. Sub-feature integration - How should /refine load parent context?
3. Questions section handling - Remove after /refine or keep for reference?

Let's work through these together...

**Question 1**: Context manifest loading
The exploration recommends: "Yes, include in feature_context manifest"

Do you agree with this recommendation?
a) ⭐ Yes, use the recommendation
b) No, let me specify a different approach

[User responds, capture decision]
```

### Phase 2: Open Implementation Drill-Down

After addressing known questions, ask:

**"Are there other implementation details we should work through before building?"**

Explore areas like:
- **Library/Framework choices**: Which specific libraries for the recommended approach?
- **Code organization**: Folder structure, module boundaries
- **Error handling**: Error codes, message formats, retry strategies
- **Integration patterns**: How does this integrate with existing code?
- **Data structures**: What data models/interfaces are needed?
- **Performance considerations**: Caching, optimization strategies
- **Migration plan**: If this changes existing functionality
- **Edge cases**: What could go wrong? How do we handle it?

Work through these conversationally, capturing decisions as you go.

## Create refinements.md

After both phases complete, synthesize everything into refinements.md using the Write tool.

**Structure** (mirror exploration.md for easy consumption during /build):

```markdown
# Refinement: {{feature title}}

**Created**: {{date}}
**Status**: Complete

## Implementation Summary

{{High-level overview referencing the exploration's recommended approach}}

## Detailed Implementation Plan

### Library and Framework Choices
{{Specific libraries/frameworks chosen with rationale}}

### Code Organization
{{Module structure, file layout, separation of concerns}}

### Integration Patterns
{{How this integrates with existing code}}

### Error Handling Strategy
{{Error codes, message formats, handling patterns}}

### Data Structures
{{Interfaces, types, data models needed}}

## Known Questions Resolved

{{For each question from exploration.md:}}

### {{Question}}
**Answer**: {{answer}}
**Rationale**: {{why this answer}}

## Additional Decisions Made

{{Any decisions discovered during Phase 2:}}

### {{Decision}}
**Rationale**: {{why}}
**Alternatives Considered**: {{what else was considered}}

## Test Strategy

### Unit Tests
{{What to unit test, mocking strategy}}

### Integration Tests
{{What integration tests are needed}}

### Fixtures and Test Data
{{What test fixtures or data are needed}}

### Coverage Requirements
{{Expected coverage level for this feature}}

## Migration/Rollout Plan

{{If this changes existing functionality:}}

### Backward Compatibility
{{How do we maintain compatibility?}}

### Migration Steps
{{What steps are needed to migrate?}}

### Feature Flags
{{Do we need feature flags?}}

## Edge Cases and Gotchas

{{List potential edge cases and how to handle them:}}

- **Edge Case 1**: {{description and handling}}
- **Edge Case 2**: {{description and handling}}

## Implementation Validations

{{Things that can only be verified hands-on during building:}}

- [ ] {{Validation 1}} - Hypothesis: {{what we think}}, Verify by: {{how}}
- [ ] {{Validation 2}} - Hypothesis: {{what we think}}, Verify by: {{how}}

## Next Steps

1. Review refinements with the team (if applicable)
2. Run `/build {{feature}}` to start implementation
```

**Save to**: `.hodge/features/{{feature}}/refine/refinements.md`

Use the Write tool:
```
Write tool with file_path: /path/to/.hodge/features/{{feature}}/refine/refinements.md
Content: [synthesized refinements.md content]
```

## Sub-Feature Context Integration

If the CLI shows "📚 Sub-Feature Context Available", you MUST:

1. **Read parent and sibling refinements**:
   - Parent refinements show the overall epic's implementation decisions
   - Sibling refinements show patterns established by earlier sub-features

2. **Ensure consistency**:
   - Use the same libraries/patterns as siblings when possible
   - Follow the same code organization structure
   - Maintain architectural coherence across the epic

3. **Reference context naturally**:
   - "Following the pattern from HODGE-377.1, we'll use..."
   - "Consistent with the parent epic's decision to use X, we'll..."
   - "Building on HODGE-377.3's infrastructure for Y..."

## Team Mode: PM Comment

If team mode is enabled, the CLI will automatically post a PM comment when you complete refinement. The comment format:

```
📋 Refinement Complete: {{Implementation Summary first paragraph}}

Key Decisions:
- {{Decision 1}}
- {{Decision 2}}
- {{Decision 3}}

Ready to build: /build {{feature}}
```

No action needed from you - this happens automatically via the CLI.

## Completion

After creating refinements.md, confirm completion:

```
✅ Refinement complete!

Created: .hodge/features/{{feature}}/refine/refinements.md

Next step: `/build {{feature}}` to start implementation
```

## Flags

- `--rerun`: Regenerate existing refinements.md
  ```bash
  hodge refine {{feature}} --rerun
  ```

## Notes

- **Refinement is optional but recommended**: If exploration has no "Questions for Refinement" and is straightforward, you can skip directly to `/build`
- **Iteration is fine**: Use `--rerun` to refine your refinements as understanding deepens
- **PM integration**: Works seamlessly with Linear, GitHub, and local PM adapters
