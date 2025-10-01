# Exploration: HODGE-311

## Feature Overview
**PM Issue**: HODGE-311
**Type**: general
**Created**: 2025-10-01T01:06:00.278Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 10

- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Problem Analysis

The root cause is in `src/lib/hodge-md-generator.ts:74-97` (`getCurrentMode()` method):

**Current Logic:**
- Checks if phase directories exist (ship > harden > build > explore)
- Returns highest phase directory found
- **Does NOT verify if shipping completed**

**What Happens:**
1. HODGE-307/308 complete shipping → `ship/` directory exists
2. Later command runs `hodge context` (or any command that generates HODGE.md)
3. `getCurrentMode()` sees `ship/` directory exists → returns "ship"
4. HODGE.md shows feature as "Mode: ship" (implying work in progress)
5. Reality: feature was already shipped hours ago (commits in git history)

**Expected Behavior:**
- Shipped features should be detected as completed
- HODGE.md should indicate "Mode: shipped" or be excluded entirely
- Next steps should NOT suggest continuing work on shipped features

## Implementation Approaches

### Approach 1: Add "shipped" mode detection
**Description**: Extend `getCurrentMode()` to check for completion markers and return "shipped" when a feature has been successfully shipped.

**Pros**:
- Clear status differentiation ("ship" vs "shipped")
- Preserves shipped feature context in HODGE.md
- Minimal code changes (single method update)
- Backward compatible with existing features

**Cons**:
- HODGE.md still includes shipped features (may clutter context)
- Doesn't address whether shipped features should be in HODGE.md at all
- Requires deciding on completion marker (ship-record.json, git commit, etc.)

**When to use**: If we want shipped features to remain visible in HODGE.md with clear completion status.

**Implementation**:
```typescript
private async getCurrentMode(feature: string): Promise<string> {
  const featurePath = path.join(this.basePath, '.hodge', 'features', feature);

  try {
    // Check if shipped (has ship-record.json)
    const shipRecordPath = path.join(featurePath, 'ship', 'ship-record.json');
    if (await this.fileExists(shipRecordPath)) {
      return 'shipped';  // Completed
    }

    // Check for active phase directories
    if (await this.fileExists(path.join(featurePath, 'ship'))) {
      return 'ship';  // In progress
    }
    // ... rest of checks
  }
}
```

### Approach 2: Exclude shipped features from HODGE.md generation
**Description**: Modify `generate()` to detect shipped features and either skip them or generate minimal "completed" status only.

**Pros**:
- Keeps HODGE.md focused on active work only
- Reduces AI context clutter
- Shipped features tracked in git history instead
- Cleaner separation: active work vs. completed work

**Cons**:
- Loses visibility into recent ships
- May confuse users who expect to see shipped features
- Requires changes to all callers of `generate()`
- More complex logic in generation flow

**When to use**: If HODGE.md should only reflect currently active work, not historical context.

### Approach 3: Detect most recent active feature automatically
**Description**: Change HODGE.md generation to automatically find the most recently active non-shipped feature instead of requiring explicit feature name.

**Pros**:
- Solves the root cause: why are we generating HODGE.md for shipped features?
- Automatic "current work" detection
- User doesn't need to specify feature name
- Always shows relevant active context

**Cons**:
- Breaking change to HODGE.md generation API
- Complex logic to determine "most recent active"
- May not handle multi-feature workflows well
- Requires audit of all `generate()` callers

**When to use**: If the real issue is that we're generating HODGE.md for the wrong features in the first place.

## Recommendation

**Approach 1: Add "shipped" mode detection** is the best choice because:

1. **Minimal Risk**: Single method change, no API breakage
2. **Clear Status**: Users/AI can see what's completed vs. in-progress
3. **Fast Fix**: Can be implemented and tested in <1 hour
4. **Enables Future Work**: Lays groundwork for Approach 2 (filtering) later
5. **Preserves History**: Shipped features remain discoverable

The real question isn't *how* to detect shipped features—it's *when* and *why* HODGE.md gets generated for shipped features. But that's a separate concern (command execution flow) that should be addressed in a follow-up issue.

**Implementation marker**: Use `ship-record.json` presence as completion indicator (it's created by `hodge ship` command on successful completion).

## Decisions Needed

1. **Mode naming**: Should completed state be "shipped", "completed", or "done"?
   - Recommendation: "shipped" (matches existing phase terminology)

2. **Next steps for shipped features**: What should HODGE.md suggest after shipping?
   - Recommendation: "Feature completed. Start new work with `hodge explore <feature>`"

3. **Filtering shipped features**: Should shipped features be excluded from HODGE.md entirely?
   - Recommendation: No (not in this issue). Keep visible with "shipped" status. Create follow-up issue for filtering logic.

4. **Completion marker**: Which file(s) indicate successful shipping?
   - Recommendation: `ship/ship-record.json` (reliably created by ship command)
   - Alternative: Check git commit message (unreliable, requires git dependency)

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-311`

---
*Template created: 2025-10-01T01:06:00.278Z*
*AI exploration to follow*
