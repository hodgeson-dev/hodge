# Exploration: HODGE-313

**Title**: Fix PM issue description extraction from decisions and exploration.md

## Problem Statement
When users execute `/build` after `/decide` without executing `/plan`, they're prompted to create a PM issue. However, the issue title is `"HODGE-XXX: No description available"` and there's no actual description text in the issue body, only a list of "Decisions Made".

## Root Cause Analysis

The issue occurs in the `/build` workflow:

1. **build.md template** (line 29-34): When user chooses to create PM issue, it calls `/plan {{feature}}` to generate a single-issue plan
2. **plan.ts** (line 500-505): For single issues, calls `pmHooks.createPMIssue(epicTitle, decisions, false)` 
   - `epicTitle` comes from `getFeatureDescription()` which returns `"No description available"` when exploration.md doesn't exist or doesn't have extractable description
3. **pm-hooks.ts** (line 369-370): Passes `feature` (which is the title with "No description available") and formatted decisions to Linear adapter
4. **linear-adapter.ts** (line 149-154): Creates issue with `title` and `description` parameters
   - The `title` parameter receives `"HODGE-313: No description available"`
   - The `description` parameter receives formatted decisions list
   - Linear shows "Decisions Made" heading but no actual feature description

The problem: **`getFeatureDescription()` returns fallback text when no exploration exists, but this should either extract from decisions or prompt the user for a description.**

## Implementation Approaches

### Approach 1: Inline Description Prompt
**Description**: When creating a PM issue without prior exploration, prompt the user in the `/build` template to provide a brief description before calling `/plan`.

**Pros**:
- User provides context-aware description in natural language
- No code changes needed - pure template modification
- Gives user control over how the issue is described
- Works well with the existing interactive flow

**Cons**:
- Adds friction to the build flow
- User might not have a concise description ready
- Breaks the "quick experiments" use case

**When to use**: Best when we want maximum accuracy and user control, accepting a slight workflow slowdown.

**Implementation**:
```markdown
# In .claude/commands/build.md around line 29

**If user chooses (a) - Yes**:
First, ask for a brief description:
```
Let me help you create a PM issue for tracking this work.

Please provide a brief description of what this feature does (1-2 sentences):
```

After user provides description, save it to a temp file and call /plan:
```bash
# Save description
mkdir -p .hodge/temp/plan-interaction/{{feature}}
echo "{{user_description}}" > .hodge/temp/plan-interaction/{{feature}}/description.txt

# Generate and create PM issue
/plan {{feature}}
```
```

### Approach 2: Smart Description Extraction
**Description**: Enhance `getFeatureDescription()` to intelligently extract description from decisions when exploration doesn't exist. Look for the first decision that describes what the feature does, or synthesize from multiple decisions.

**Pros**:
- Zero friction - fully automatic
- Leverages existing decision context
- Works for both `/build` after `/decide` and `/build` after `/plan`
- Maintains "quick experiments" workflow

**Cons**:
- Extracted description might not be ideal
- Decisions may not contain a clear feature description
- More complex extraction logic needed
- Could generate confusing descriptions if decisions are technical

**When to use**: Best for maintaining workflow speed while improving description quality automatically.

**Implementation**:
```typescript
// In src/commands/plan.ts, enhance getFeatureDescription()

private async getFeatureDescription(feature: string): Promise<string> {
  // First try existing exploration.md extraction (unchanged)
  const explorationFile = path.join(...);
  if (existsSync(explorationFile)) {
    // ... existing logic ...
  }

  // NEW: Try to extract from decisions
  const decisions = await this.analyzeDecisions(feature);
  if (decisions.length > 0) {
    // Strategy 1: Look for implementation approach decision
    const approachDecision = decisions.find(d => 
      d.toLowerCase().includes('implement') || 
      d.toLowerCase().includes('approach')
    );
    if (approachDecision) {
      return this.cleanDecisionText(approachDecision);
    }

    // Strategy 2: Use first substantial decision
    const substantialDecision = decisions.find(d => d.length > 30);
    if (substantialDecision) {
      return this.cleanDecisionText(substantialDecision);
    }

    // Strategy 3: Synthesize from multiple decisions
    return `Implementing ${decisions.length} technical decisions`;
  }

  return 'No description available';
}

private cleanDecisionText(decision: string): string {
  // Remove phase markers, truncate to reasonable length
  return decision
    .replace(/\[.*?\]/g, '')
    .split('-')[0]
    .trim()
    .substring(0, 100);
}
```

### Approach 3: Hybrid - Try Extraction, Fallback to Prompt
**Description**: Combine both approaches - try smart extraction first, but if the result is poor quality (too short, generic, etc.), prompt the user for a better description.

**Pros**:
- Best of both worlds - automatic when possible, human input when needed
- Maintains workflow speed in common cases
- Ensures quality descriptions
- User only prompted when truly necessary

**Cons**:
- Most complex to implement
- Requires quality assessment logic
- May still interrupt user sometimes
- Template and code changes needed

**When to use**: Best for production-quality solution that balances automation with quality.

**Implementation**:
```markdown
# In .claude/commands/build.md

**If user chooses (a) - Yes**:
1. Attempt to extract description from decisions
2. If extraction successful and high-quality, proceed automatically
3. If extraction fails or low-quality, prompt user:

```
I found this description from your decisions:
"{{extracted_description}}"

Is this accurate, or would you like to provide a better description?
a) Use extracted description
b) Provide custom description

Your choice:
```
```

## Recommended Approach

**Approach 2: Smart Description Extraction** is recommended because:

1. **Maintains workflow speed** - The `/build` after `/decide` flow should be quick for "freedom to explore"
2. **Decisions contain context** - Users have just completed `/decide`, so decisions are fresh and relevant
3. **Simple implementation** - Primarily code changes in one method, no template coordination needed
4. **Backward compatible** - Still works with `/plan` after `/explore` (uses exploration.md)
5. **Graceful degradation** - Falls back to "No description available" if extraction truly fails

The key insight: Users who skip `/explore` and go straight to `/decide` are making *decisions about what to build*, which inherently describes the feature. We should extract that description rather than asking them to repeat it.

## Decisions Needed

1. **Which implementation approach**: Smart extraction (recommended), inline prompt, or hybrid?
2. **Extraction strategy**: Which decision patterns should be prioritized for description extraction?
3. **Quality threshold**: When is "No description available" acceptable vs requiring better text?
4. **Character limit**: Should extracted descriptions be truncated, and at what length?
5. **Template vs code**: Should we also update the `/build` template to mention the description source?

## Test Intentions

1. **Scenario: Build after decide without plan**
   - Given: User has completed `/decide` for HODGE-XXX
   - When: User runs `/build` and chooses to create PM issue  
   - Then: PM issue title should contain meaningful description extracted from decisions
   
2. **Scenario: Build after explore and decide**
   - Given: User has exploration.md with "Problem Statement"
   - When: User runs `/build` and creates PM issue
   - Then: PM issue should use exploration description (existing behavior)

3. **Scenario: No exploration, minimal decisions**
   - Given: Feature has only 1 short decision
   - When: Creating PM issue
   - Then: Should handle gracefully (use decision text or fallback)

4. **Scenario: Description quality**
   - Given: Various decision text formats
   - When: Extracting descriptions
   - Then: Should clean formatting, remove markers, truncate appropriately
