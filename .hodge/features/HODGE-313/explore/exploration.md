# Exploration: HODGE-313

**Title**: Fix --feature flag to write ONLY to feature decisions.md (not global)

## Problem Statement
The `/decide` command's `--feature` flag has two bugs:
1. It writes to `decision.md` (singular) instead of `decisions.md` (plural)
2. It writes to BOTH `.hodge/decisions.md` AND `.hodge/features/XXX/decision.md`, but it should only write to the feature file when `--feature` is provided

## Root Cause Analysis

In `src/commands/decide.ts`:

**Line 103**: Always writes to global file
```typescript
await fs.writeFile(decisionsFile, content);  // ❌ Always writes to .hodge/decisions.md
```

**Lines 105-130**: Also writes to feature file (if flag provided)
```typescript
if (options.feature) {
  const featureDecisionFile = path.join(
    this.basePath,
    '.hodge',
    'features',
    options.feature,
    'decision.md'  // ❌ Wrong filename (singular)
  );
  if (existsSync(path.dirname(featureDecisionFile))) {
    await fs.writeFile(featureDecisionFile, ...);  // ❌ Writes to BOTH files
  }
}
```

According to HODGE-312 decision:
> "Write feature decisions to feature-specific decision.md only (when --feature flag provided) - feature decisions belong in .hodge/features/{feature}/decision.md for context locality, global decisions.md reserved for project-wide architectural decisions"

The intended behavior:
- **WITH** `--feature HODGE-XXX` → write ONLY to `.hodge/features/HODGE-XXX/decisions.md`
- **WITHOUT** `--feature` → write ONLY to `.hodge/decisions.md`

## Implementation Approaches

### Approach 1: Conditional Write + Filename Fix
**Description**: Wrap the global file write in an `if (!options.feature)` check and fix the filename to `decisions.md`

**Pros**:
- Clean separation: feature decisions go to feature file, global decisions go to global file
- Simple logic: one OR the other, never both
- Matches HODGE-312 decision exactly
- Two-line fix (add if condition, fix filename)

**Cons**:
- Existing decisions in global file won't be duplicated to feature files
- No migration path for historical decisions

**When to use**: Best for implementing the intended behavior cleanly going forward.

**Implementation**:
```typescript
// In src/commands/decide.ts

// Line 103: Only write to global if NO feature specified
if (!options.feature) {
  await fs.writeFile(decisionsFile, content);
}

// Line 105-130: Write to feature file if feature specified
if (options.feature) {
  const featureDecisionFile = path.join(
    this.basePath,
    '.hodge',
    'features',
    options.feature,
    'decisions.md'  // ✅ Fixed: plural
  );

  // Read existing feature decisions or create template
  let featureContent = '';
  if (existsSync(featureDecisionFile)) {
    featureContent = await fs.readFile(featureDecisionFile, 'utf-8');
  } else {
    featureContent = `# Feature Decisions: ${options.feature}

This file tracks decisions specific to ${options.feature}.

## Decisions

<!-- Add your decisions below -->

`;
  }

  // Append decision to feature file (same logic as global)
  const insertPosition = featureContent.lastIndexOf('<!-- Add your decisions below -->');
  if (insertPosition !== -1) {
    featureContent =
      featureContent.slice(0, insertPosition + '<!-- Add your decisions below -->'.length) +
      '\n' +
      newDecision +
      featureContent.slice(insertPosition + '<!-- Add your decisions below -->'.length);
  } else {
    featureContent += newDecision;
  }

  if (existsSync(path.dirname(featureDecisionFile))) {
    await fs.writeFile(featureDecisionFile, featureContent);
  }
}
```

### Approach 2: Append Format (Keep Current Simple Format)
**Description**: Fix the conditional logic and filename, but keep the simple single-decision format for feature files

**Pros**:
- Simpler than Approach 1 (no template management)
- Still fixes the core bugs
- Existing simple format might be intentional

**Cons**:
- Feature `decisions.md` has different format than global `decisions.md`
- Can't easily accumulate multiple decisions in one file
- Each write overwrites previous decision

**When to use**: If the simple format is intentional for feature files.

**Implementation**:
```typescript
// Line 103: Only write to global if NO feature
if (!options.feature) {
  await fs.writeFile(decisionsFile, content);
}

// Lines 105-130: Keep existing simple format, just fix filename
if (options.feature) {
  const featureDecisionFile = path.join(
    this.basePath,
    '.hodge',
    'features',
    options.feature,
    'decisions.md'  // ✅ Fixed: plural
  );
  if (existsSync(path.dirname(featureDecisionFile))) {
    await fs.writeFile(
      featureDecisionFile,
      `# Decision for ${options.feature}

**Date**: ${date}
**Time**: ${timestamp}

## Decision
${decision}

## Status
Feature-specific decision recorded.
`
    );
  }
}
```

### Approach 3: Accumulating Append Format
**Description**: Like Approach 1, but use the same template/append logic as global decisions for feature files

**Pros**:
- Consistent format between global and feature decisions
- Multiple decisions accumulate in one file
- Easy to review all feature decisions
- Matches user mental model (decisions.md works the same everywhere)

**Cons**:
- More complex than Approach 2
- Requires refactoring to share append logic

**When to use**: Best for consistency and when features have multiple decisions.

## Recommended Approach

**Approach 1: Conditional Write + Filename Fix** is recommended because:

1. **Matches intent**: Implements HODGE-312 decision correctly
2. **Consistent format**: Feature decisions look like global decisions
3. **Accumulation**: Multiple decisions for one feature build up in one file
4. **Clear separation**: Feature vs global decisions are distinct
5. **Future-proof**: Easy to add decision history/review features later

The shared template/append logic makes the system predictable and maintainable.

## Decisions Needed

1. **File format**: Should feature decisions.md use the same template format as global decisions.md?
2. **Accumulation**: Should multiple decisions append to the same file or overwrite?
3. **Migration**: Should we migrate existing decisions from global to feature files?
4. **Validation**: Should we error if `--feature` is provided but feature directory doesn't exist?

## Test Intentions

1. **Scenario: Feature decision writes ONLY to feature file**
   - Given: User runs `hodge decide "some decision" --feature HODGE-XXX`
   - When: Command completes
   - Then: Decision should exist in `.hodge/features/HODGE-XXX/decisions.md` (plural)
   - And: Decision should NOT exist in `.hodge/decisions.md`

2. **Scenario: Global decision writes ONLY to global file**
   - Given: User runs `hodge decide "some decision"` (no --feature flag)
   - When: Command completes
   - Then: Decision should exist in `.hodge/decisions.md`
   - And: No feature-specific file should be created

3. **Scenario: Multiple decisions to same feature accumulate**
   - Given: Two decisions recorded for HODGE-XXX with --feature flag
   - When: Both use `hodge decide "decision" --feature HODGE-XXX`
   - Then: Both decisions should exist in `.hodge/features/HODGE-XXX/decisions.md`
   - And: Second decision should NOT overwrite first

4. **Scenario: Feature file doesn't exist yet**
   - Given: Feature directory exists but no decisions.md file
   - When: First decision recorded with --feature
   - Then: decisions.md should be created with proper template format
