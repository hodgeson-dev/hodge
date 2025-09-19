# Exploration: HODGE-005 - Feature Auto-Population

## Feature Overview
Automatically populate new feature directories with bundled context from exploration, decisions, and related files.

## Feature Analysis
**Type**: Development Tool Enhancement
**Keywords**: auto-populate, context bundling, feature creation
**Related Commands**: explore, build, extract-features
**PM Issue**: HODGE-005

## Context
- **Date**: 9/16/2025 (Updated: 9/18/2025)
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (loaded)
- **Parent**: feature-context-organization exploration
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Auto-populate feature directories")

## Problem Statement
When creating new features, we need to:
- Bundle relevant context automatically
- Include source decisions and explorations
- Add related code snippets
- Create consistent directory structure
- Generate HODGE.md aggregated view

## Similar Features
- HODGE-003-feature-extraction (triggers auto-population)
- HODGE-004-id-management (provides feature IDs)
- HODGE-005-feature-auto-population (duplicate - merged)
- cross-tool-compatibility (uses HODGE.md format)

## Recommended Approaches

### Approach 1: Context Bundler Class (90% relevant)
**Description**: Create a dedicated ContextBundler class to gather and organize feature context

**Directory Structure Template**:
```
.hodge/features/HODGE-XXX-feature-name/
├── explore/
│   ├── exploration.md     # Main exploration doc
│   ├── context.json       # Mode and metadata
│   └── related-files.md   # Links to related code
├── build/
│   └── (created when building)
├── ship/
│   └── (created when shipping)
└── HODGE.md              # Aggregated view (auto-generated)
```

**Implementation Details**:
1. **ContextBundler Class** (`src/lib/context-bundler.ts`)
   - Gathers context from multiple sources
   - Creates directory structure
   - Generates initial files

2. **Context Sources**:
   ```typescript
   interface ContextSources {
     exploration: string;      // Current exploration content
     decisions: Decision[];    // Related decisions
     relatedFiles: string[];   // Files mentioned in exploration
     gitDiff?: string;        // Current uncommitted changes
     pmContext?: PMContext;    // PM tool information
   }
   ```

3. **Auto-Population Triggers**:
   - After `hodge extract-features`
   - During `hodge explore <new-feature>`
   - Via `hodge create-feature <name>`

**Pros**:
- Clean separation of concerns
- Reusable across commands
- Testable in isolation
- Extensible for future context sources

**Cons**:
- Additional class to maintain
- May over-engineer for simple cases

### Approach 2: Feature Populator Integration (75% relevant)
**Description**: Extend the existing FeaturePopulator class to handle all context bundling

**Pros**:
- Reuses existing infrastructure
- Less new code to maintain
- Already integrated with explore command

**Cons**:
- May overload single class responsibility
- Harder to test specific behaviors

### Approach 3: Template-Based System (60% relevant)
**Description**: Use file templates with variable substitution

**Pros**:
- Easy to customize templates
- Non-developers can modify
- Visual representation of structure

**Cons**:
- Less flexible for complex logic
- Template management overhead
- String manipulation risks

## Recommendation
Based on the analysis, **Context Bundler Class** is recommended because:
- Highest relevance score (90%)
- Clean architecture aligned with existing patterns
- Provides needed flexibility for context gathering
- Easy integration with existing commands

## Implementation Plan

### Phase 1: Core Implementation
1. Create ContextBundler class with basic functionality
2. Integrate with explore command
3. Generate directory structure and files

### Phase 2: HODGE.md Generation
```typescript
generateHodgeMD(feature: Feature): string {
  return `
# ${feature.name}

## Current Status
Mode: ${feature.mode}
ID: ${feature.id}

## Context
${bundleContext(feature)}

## Decisions
${feature.decisions.map(d => `- ${d}`).join('\n')}

## Next Steps
${feature.nextSteps}
  `;
}
```

### Phase 3: Integration Points
- Hook into explore command
- Add to extract-features workflow
- Create standalone create-feature command

## Test Intentions
- [ ] Directory structure created correctly
- [ ] Context bundled from all sources
- [ ] HODGE.md generated accurately
- [ ] Related files linked properly
- [ ] Metadata preserved in context.json
- [ ] Handles missing/partial context gracefully
- [ ] Idempotent operations (safe to re-run)

## Dependencies
- **Requires**: HODGE-003-feature-extraction (for extraction workflow)
- **Uses**: HODGE-004-id-management (for feature IDs)
- **Generates**: HODGE.md (for cross-tool compatibility)
- **Integrates**: FeaturePopulator (existing class)

## Next Steps
- [x] Merge duplicate feature directories
- [ ] Review exploration and approaches
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-005`
- [ ] Implement ContextBundler class
- [ ] Add to feature creation workflow
- [ ] Create HODGE.md generator
- [ ] Test with real features

---
*Generated with AI-enhanced exploration (2025-09-16T21:38:31.500Z)*
*Updated with merged content (2025-09-18T21:40:00.000Z)*