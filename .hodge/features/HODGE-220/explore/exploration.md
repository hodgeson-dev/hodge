# Exploration: HODGE-220 - Fix Uncommitted Files After Ship

## Feature Analysis
**Type**: Bug Fix / Ship Process Enhancement
**Keywords**: ship, git commit, uncommitted files, workflow
**Related Commands**: ship, git operations
**PM Issue**: HODGE-220

## Context
- **Date**: 9/21/2025
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (loaded)
- **Problem**: After `/ship` successfully completes, there are still uncommitted files

## Issue Investigation

### Current Behavior
After running `hodge ship HODGE-180`, we observe 14 uncommitted files:
```
 M .hodge/.session
 M .hodge/context.json
 M .hodge/features/HODGE-180/HODGE.md
 M .hodge/id-counter.json
 M .hodge/id-mappings.json
 M .hodge/project_management.md
?? .hodge/features/HODGE-218/
?? .hodge/features/HODGE-219/
```

### Root Cause Analysis
The ship command modifies files both **before** and **after** creating the git commit:

1. **Line 71**: `autoSave.checkAndSave(feature)` runs first, modifying:
   - `.hodge/.session`
   - `.hodge/context.json`
   - `.hodge/id-counter.json`
   - `.hodge/id-mappings.json`

2. **Line 521**: `git add .` stages all current changes
3. **Line 524-526**: Git commit is created with staged changes
4. **Line 578**: `populator.generateFeatureHodgeMD(feature)` runs AFTER commit, modifying:
   - `.hodge/features/HODGE-180/HODGE.md`
   - `.hodge/project_management.md`

### Why This Is a Problem
- Violates the expectation that ship should leave a clean working tree
- Creates confusion about what was actually shipped
- Can lead to accidental commits of post-ship modifications
- Makes the ship process feel incomplete

## Recommended Approaches

### Approach 1: Two-Phase Commit (Recommended)
**Description**: Create two commits - one for the feature, one for post-ship metadata

**Implementation**:
```typescript
// Phase 1: Commit the actual feature changes
await execAsync('git add -A');
await execAsync(`git commit -m "${commitMessage}"`);

// Phase 2: Update metadata and commit those changes
await populator.generateFeatureHodgeMD(feature);
await pmAdapter.updateStatus(feature, 'shipped');
await execAsync('git add .hodge/');
await execAsync(`git commit -m "chore: update metadata after shipping ${feature}"`);
```

**Pros**:
- Clean separation between feature and metadata
- Each commit has a single purpose
- Working tree is clean after ship

**Cons**:
- Two commits instead of one
- Might confuse users who expect single commit

### Approach 2: Pre-Commit All Updates
**Description**: Move all file updates before the git commit

**Implementation**:
```typescript
// Do ALL updates first
await autoSave.checkAndSave(feature);
await populator.generateFeatureHodgeMD(feature);
await pmAdapter.updateStatus(feature, 'shipped');

// Then create single commit with everything
await execAsync('git add -A');
await execAsync(`git commit -m "${commitMessage}"`);
```

**Pros**:
- Single atomic commit
- Simple to understand
- No post-commit modifications

**Cons**:
- Feature HODGE.md would show "shipped" status before actual commit
- Risk of inconsistent state if commit fails

### Approach 3: Exclude Metadata from Commit
**Description**: Don't commit metadata files during ship, let user handle separately

**Implementation**:
```typescript
// Stage only source changes, not .hodge directory
await execAsync('git add src/ tests/ docs/');
await execAsync(`git commit -m "${commitMessage}"`);

// Update metadata after commit
await populator.generateFeatureHodgeMD(feature);
console.log('Note: Metadata files updated but not committed');
```

**Pros**:
- Feature commits stay clean
- Metadata can be committed separately

**Cons**:
- Still leaves uncommitted files
- Doesn't solve the original problem

## Recommendation
Based on the analysis, **Approach 2: Pre-Commit All Updates** appears most suitable because:
- Creates a single, clean commit with all changes
- Leaves no uncommitted files after ship
- Maintains atomic operation (all-or-nothing)
- Simplest fix with least disruption to existing workflow


## Implementation Hints
- Follow existing code patterns
- Add comprehensive error handling
- Include unit tests

## Next Steps
- [ ] Review the recommended approaches
- [ ] Consider similar features for inspiration
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-220`

---
*Generated with AI-enhanced exploration (2025-09-21T21:38:38.440Z)*
