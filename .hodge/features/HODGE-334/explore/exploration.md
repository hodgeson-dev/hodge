# Exploration: HODGE-334

## Title
Auto-Load Parent and Sibling Context for Sub-Feature Exploration

## Problem Statement

When exploring sub-features (e.g., HODGE-333.3), the `/explore` command starts fresh without awareness of the parent feature's goals or what sibling features have already accomplished. Currently, users must manually run `/hodge HODGE-333` to load parent context, but this still misses valuable context from completed sibling features like HODGE-333.1 or HODGE-333.2. This creates friction and risks duplicating work or missing important architectural decisions, patterns, and infrastructure that siblings have already established.

## Conversation Summary

### Current Workflow Pain Point

Users currently work around this limitation by running `/hodge HODGE-333` (to load the parent) before exploring a sub-feature. However, this manual approach has gaps:

- **Missing Sibling Context**: Doesn't capture what was learned in HODGE-333.1, HODGE-333.2, etc.
- **Manual Overhead**: Requires remembering to load parent context separately
- **Inconsistent Context**: Different exploration sessions may have different levels of context depending on whether the user remembered to load the parent

### What Context is Valuable from Siblings

Through discussion, we identified four key types of context that should be automatically loaded from shipped siblings:

1. **Architectural Decisions**: Libraries chosen, patterns established, trade-offs made
2. **Lessons Learned**: What worked well, what to avoid, pivots made during implementation
3. **Shared Infrastructure**: Reusable code/modules that can be extended
4. **Implementation Patterns**: Coding patterns that should be consistent across the epic

**Scope**: Only **shipped** siblings should be considered. If a feature isn't shipped, the work is still in flux and might change or be abandoned, so we can't rely on learning from it.

### Feature ID Pattern and Detection

**Pattern Definition**:
- Parent: `HODGE-333`
- Children: `HODGE-333.1`, `HODGE-333.2`, `HODGE-333.3`, etc.

**Current Constraints** (keep simple for now):
- Always numeric sub-features (e.g., `.1`, `.2`, `.3`)
- Only one layer deep (no `HODGE-333.1.1` grandchildren)
- Single parent only (no multi-parent scenarios)

These constraints can be relaxed in future iterations if needed.

### Determining "Shipped" Status

**Most Reliable Indicator**: Presence of `ship/ship-record.json` file with `validationPassed: true`

**Why This Works**:
- The `ship-record.json` is created by the ship command as the final artifact
- The `validationPassed` field confirms all quality gates passed
- The directory could exist from a failed ship attempt, but the JSON + validation flag confirms actual completion
- Contains rich context (commit message, changes made) that we want to extract anyway

**Check Logic**:
```typescript
const shipRecordPath = `.hodge/features/${feature}/ship/ship-record.json`;
if (exists(shipRecordPath)) {
  const record = JSON.parse(readFile(shipRecordPath));
  if (record.validationPassed === true) {
    // Feature is shipped!
  }
}
```

### User Experience Flow

When running `/explore HODGE-333.3`:

1. **Detect Sub-Feature**: Parse feature ID to identify parent `HODGE-333`
2. **Load Parent Context**: Read parent's exploration.md and decisions
3. **Find Shipped Siblings**: Scan for `HODGE-333.1`, `HODGE-333.2` with valid ship records
4. **Show Context Summary**: Display what was found
   ```
   📚 Loaded context from HODGE-333 (parent) + 2 shipped siblings (333.1, 333.2)
   ```
5. **Allow Exclusions**: Prompt user to optionally exclude siblings
   ```
   Remove any siblings from context? (enter feature IDs like '333.1' or press enter to continue)
   ```
6. **Present Context**: Show hybrid summary (brief upfront + weave into conversation)
7. **Start Exploration**: Begin conversational exploration with full context

**Context Presentation Approach (Hybrid)**:
- Show brief structured summary upfront to orient the user
- Weave detailed context naturally into exploration conversation
- Example: "Since HODGE-333.1 used gray-matter for frontmatter parsing, we could extend that approach..."

### Edge Cases

**Re-exploring Parent with Existing Sub-Features**:
When running `/explore HODGE-333` and sub-features already exist:
```
⚠️  Sub-features found: HODGE-333.1, HODGE-333.2 (both shipped)

This parent feature already has sub-features. Are you sure you want to re-explore the parent?

(y) Yes, re-explore the parent
(n) No, cancel exploration

Your choice:
```

This prevents accidentally overwriting or muddying the parent exploration when decomposition has already begun.

**Other Edge Cases to Handle**:
- Parent with no shipped siblings: Show parent context only, proceed normally
- Sub-feature when parent doesn't exist: Proceed normally without special context loading
- All siblings excluded by user: Proceed with just parent context

## Implementation Approaches

### Approach 1: Slash Command Template Enhancement (Recommended)

**Description**: Enhance the `/explore` slash command template to detect sub-features, load context, and present it to Claude before starting the conversational exploration. The template orchestrates the context loading, and Claude receives it as part of the exploration kickoff.

**Architecture**:

**Template Changes** (`.claude/commands/explore.md`):
```markdown
## Step 0: Sub-Feature Context Loading (Before Command Execution)

{{#if is_sub_feature}}
Detecting sub-feature pattern: {{feature}}
Parent feature: {{parent_feature}}

Loading context...
- Parent exploration: {{parent_exploration_path}}
- Parent decisions: {{parent_decisions_path}}
- Shipped siblings: {{shipped_siblings}}

📚 Context Summary:
{{context_summary}}

Remove any siblings from context? (enter IDs or press enter):
{{user_input_for_exclusions}}

{{#if exclusions}}
Excluding: {{excluded_siblings}}
{{/if}}

Proceeding with context from:
- Parent: {{parent_feature}}
- Siblings: {{included_siblings}}
{{/if}}
```

**Context Extraction**:
The template would read and format:
- Parent exploration's Problem Statement, Recommendation, Key Decisions
- Each sibling's ship-record.json commit message (What Changed, Why, Impact)
- Each sibling's decisions.md or exploration decisions
- Each sibling's lessons learned files (if any)

**Presentation to AI**:
```markdown
## Loaded Context for HODGE-333.3

### Parent Feature (HODGE-333)
**Goal**: [Problem statement from parent exploration]
**Approach**: [Recommended approach from parent]
**Key Decisions**: [Decisions from parent]

### Shipped Sibling: HODGE-333.1
**Accomplished**: [Summary from commit message]
**Infrastructure Built**: frontmatter-parser.ts, markdown-utils.ts, review-profile-loader.ts
**Key Decision**: Simplified approach - no AST parsing, just gray-matter
**Can Be Reused**: Frontmatter parsing, markdown utilities

### Shipped Sibling: HODGE-333.2
...
```

**Pros**:
- No backend code changes needed
- Template-driven approach fits Hodge philosophy (AI analyzes, backend executes)
- Claude gets rich context to inform exploration questions
- User sees exactly what context was loaded (transparency)
- Easy to iterate on context format

**Cons**:
- Template complexity increases
- Handlebars templating may be limiting for complex logic
- Context extraction logic lives in template rather than typed code

**When to use**: When we want quick iteration without backend changes, and the context loading logic can be expressed in template syntax.

---

### Approach 2: Backend Service with Template Integration

**Description**: Create a `SubFeatureContextService` in the backend that detects sub-features, loads context, and returns structured data. The template calls this service and presents the results to Claude.

**Architecture**:

**Backend Service** (`src/lib/sub-feature-context-service.ts`):
```typescript
export interface SubFeatureContext {
  isSubFeature: boolean;
  parent?: {
    feature: string;
    exploration: ParentExploration;
    decisions: Decision[];
  };
  shippedSiblings: ShippedSibling[];
}

export interface ShippedSibling {
  feature: string;
  shipRecord: ShipRecord;
  decisions: Decision[];
  infrastructure: string[]; // files created
  lessonsLearned?: string;
}

export class SubFeatureContextService {
  detectSubFeature(feature: string): { isSubFeature: boolean; parent?: string };

  findShippedSiblings(parent: string, exclude: string[]): ShippedSibling[];

  loadParentContext(parent: string): ParentContext;

  buildContextSummary(context: SubFeatureContext): string;
}
```

**CLI Command Integration** (`src/commands/explore.ts`):
```typescript
export class ExploreCommand {
  execute(feature: string) {
    const contextService = new SubFeatureContextService();
    const detection = contextService.detectSubFeature(feature);

    if (detection.isSubFeature) {
      const siblings = contextService.findShippedSiblings(detection.parent);

      // Show summary and prompt for exclusions
      console.log(`📚 Context: ${detection.parent} + ${siblings.length} siblings`);
      const exclusions = await promptForExclusions(siblings);

      const context = contextService.loadContext(detection.parent, exclusions);

      // Pass context to template
      return { ...standardExploreData, subFeatureContext: context };
    }

    return standardExploreData;
  }
}
```

**Template Usage** (`.claude/commands/explore.md`):
```markdown
{{#if subFeatureContext}}
## Loaded Context for {{feature}}

{{subFeatureContext.summary}}

[Present context to Claude for exploration]
{{/if}}
```

**Pros**:
- Type-safe context loading with TypeScript
- Testable business logic (can unit test context extraction)
- Clean separation: CLI handles orchestration, service handles logic
- Easier to maintain complex context aggregation
- Reusable service for other commands (e.g., `/build` might want this too)

**Cons**:
- Requires backend code changes
- More upfront implementation work
- Adds new service class to maintain

**When to use**: When we want robust, testable, reusable context loading that can evolve with the feature.

---

### Approach 3: Hybrid - Minimal Backend + Smart Template

**Description**: Add a small helper function to the backend that returns simple data (feature IDs, file paths), and let the template do the heavy lifting of reading files and formatting context.

**Architecture**:

**Minimal Backend Helper** (`src/lib/feature-utils.ts`):
```typescript
export function analyzeFeature(feature: string): {
  isSubFeature: boolean;
  parent?: string;
  shippedSiblings: string[]; // just the IDs
  parentFiles: { exploration: string; decisions: string };
  siblingFiles: Map<string, { shipRecord: string; decisions: string }>;
} {
  // Minimal logic: detect pattern, check for ship records, return paths
}
```

**CLI passes to template**:
```typescript
const analysis = analyzeFeature(feature);
return { ...exploreData, featureAnalysis: analysis };
```

**Template does the formatting** (`.claude/commands/explore.md`):
```markdown
{{#if featureAnalysis.isSubFeature}}
## Step 0: Load Sub-Feature Context

Reading parent context from:
- {{featureAnalysis.parentFiles.exploration}}
- {{featureAnalysis.parentFiles.decisions}}

Reading sibling context from:
{{#each featureAnalysis.shippedSiblings}}
- {{this}}: {{lookup ../featureAnalysis.siblingFiles this}}
{{/each}}

[Template reads files and formats for Claude]
{{/if}}
```

**Pros**:
- Balance between template flexibility and type safety
- Backend only handles detection and path resolution
- Template controls presentation format (easy to iterate)
- Less backend code than Approach 2

**Cons**:
- Template becomes more complex with file reading logic
- Some logic duplication between backend and template
- Harder to test template logic

**When to use**: When we want some type safety but need template flexibility for rapid iteration on presentation format.

## Recommendation

**Use Approach 2: Backend Service with Template Integration**

This approach best aligns with Hodge's architecture and provides the strongest foundation:

**1. Separation of Concerns**:
- Backend (TypeScript): Handles complex logic (detection, validation, context extraction)
- Template (Markdown): Handles presentation and user interaction
- This matches the pattern established in other commands

**2. Testability**:
- Can write comprehensive tests for `SubFeatureContextService`
- Can test edge cases (missing parents, no siblings, invalid ship records)
- Template stays simple and focused on presentation

**3. Reusability**:
- The `/build` command might also want to load sub-feature context
- The `/decide` command could use sibling decisions to inform choices
- Building the service now enables these future enhancements

**4. Type Safety**:
- Structured interfaces for context data
- Compile-time checking for data structure
- Better IDE support and refactoring safety

**5. Evolution Path**:
- Easy to add more context types (patterns learned, shared test utilities, etc.)
- Can extend to multi-level hierarchies (grandchildren) later
- Can add caching/performance optimizations if needed

**Implementation Priority**:
1. Create `SubFeatureContextService` with detection and sibling-finding logic
2. Add ship record validation (check `validationPassed: true`)
3. Implement parent context loading (exploration + decisions)
4. Implement sibling context extraction (ship record, decisions, infrastructure)
5. Update `explore.ts` to use service and handle exclusions
6. Update explore template to present context to Claude
7. Add comprehensive tests for all detection and loading logic
8. Test end-to-end with real HODGE-333.X examples

## Test Intentions

### Sub-Feature Detection
- Detects sub-feature pattern correctly (e.g., HODGE-333.3 → parent HODGE-333)
- Handles non-sub-features correctly (HODGE-333 is not a sub-feature)
- Rejects invalid patterns (HODGE-333.1.1 grandchildren not supported yet)

### Shipped Sibling Discovery
- Finds all shipped siblings by checking ship/ship-record.json existence
- Validates ship records have validationPassed: true
- Excludes siblings with missing or invalid ship records
- Excludes siblings specified by user in exclusion prompt
- Handles parent with zero shipped siblings gracefully

### Parent Context Loading
- Loads parent exploration.md and extracts Problem Statement, Recommendation
- Loads parent decisions (from decisions.md or exploration.md Decisions Needed section)
- Handles missing parent exploration gracefully (proceeds without parent context)

### Sibling Context Extraction
- Extracts "What Changed" from sibling ship-record.json commit messages
- Identifies infrastructure files created (new modules, utilities)
- Loads sibling decisions from decisions.md or exploration
- Loads sibling lessons learned files if they exist
- Handles siblings with missing context files gracefully

### User Interaction
- Shows context summary before exploration starts
- Prompts user to exclude siblings with clear instructions
- Parses user exclusion input correctly (handles "333.1, 333.2" or "333.1 333.2")
- Allows user to press enter to include all siblings
- Updates context summary after exclusions applied

### Parent Re-exploration Protection
- Detects when exploring parent feature that already has sub-features
- Shows warning with list of existing sub-features
- Prompts user for confirmation (y/n)
- Cancels exploration if user chooses 'n'
- Proceeds with normal exploration if user chooses 'y'

### Context Presentation to AI
- Presents hybrid context: structured summary + conversational integration
- Includes parent goal, approach, and key decisions
- Includes each sibling's accomplishments, infrastructure, and decisions
- Makes context available for Claude to weave into exploration questions
- Format is clear and scannable (markdown headers, bullet points)

### Edge Cases
- Sub-feature when parent doesn't exist: proceeds without error
- Parent with no shipped siblings: shows parent context only
- All siblings excluded by user: shows parent context only
- Invalid ship record format: skips that sibling, continues with others
- Sibling missing context files: includes sibling in list but notes missing context

## Decisions Decided During Exploration

1. ✓ **Sub-feature pattern scope** - Only numeric patterns (HODGE-333.1) one level deep for now
2. ✓ **Shipped status check** - Use ship/ship-record.json with validationPassed: true
3. ✓ **Context to load from siblings** - Decisions, lessons, infrastructure, patterns (all four types)
4. ✓ **Sibling inclusion scope** - Only shipped siblings (not in-progress work)
5. ✓ **Exclusion interaction** - Ask before exploration starts, allow user to exclude siblings
6. ✓ **Context presentation style** - Hybrid: brief summary upfront + weave into conversation
7. ✓ **Parent re-exploration behavior** - Warn and prompt for confirmation when sub-features exist
8. ✓ **Implementation approach** - Backend service (Approach 2) for testability and reusability

## Decisions Needed

**No Decisions Needed** - All architectural and implementation decisions were resolved during exploration.

---
*Exploration completed: 2025-10-07T01:47:00.000Z*
