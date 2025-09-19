# Exploration: Feature Auto-Population

## Feature Overview
Automatically populate new feature directories with bundled context from exploration, decisions, and related files.

## Context
- **Date**: 2025-01-16
- **Parent**: feature-context-organization exploration
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Auto-populate feature directories")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-1-cross-tool-compatibility`

## Problem Statement
When creating new features, we need to:
- Bundle relevant context automatically
- Include source decisions and explorations
- Add related code snippets
- Create consistent directory structure
- Generate HODGE.md aggregated view

## Recommended Approach: Context Bundler

### Directory Structure Template
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

### Implementation Details

1. **ContextBundler Class**
   - Location: `src/lib/context-bundler.ts`
   - Gathers context from multiple sources
   - Creates directory structure
   - Generates initial files

2. **Context Sources**
   ```typescript
   interface ContextSources {
     exploration: string;      // Current exploration content
     decisions: Decision[];    // Related decisions
     relatedFiles: string[];   // Files mentioned in exploration
     gitDiff?: string;        // Current uncommitted changes
     pmContext?: PMContext;    // PM tool information
   }
   ```

3. **Auto-Population Triggers**
   - After `hodge extract-features`
   - During `hodge explore <new-feature>`
   - Via `hodge create-feature <name>`

4. **HODGE.md Generation**
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

## Test Intentions
- [ ] Directory structure created correctly
- [ ] Context bundled from all sources
- [ ] HODGE.md generated accurately
- [ ] Related files linked properly
- [ ] Metadata preserved in context.json

## Dependencies
- **Requires**: HODGE-003-feature-extraction
- **Uses**: HODGE-004-id-management for IDs
- **Generates**: HODGE.md for cross-tool compatibility

## Next Steps
1. Implement ContextBundler class
2. Add to feature creation workflow
3. Create HODGE.md generator
4. Test with real features

## Related Features
- **HODGE-003**: Triggers auto-population
- **HODGE-004**: Provides feature IDs
- **cross-tool-compatibility**: Uses HODGE.md format
- **Parent**: feature-context-organization