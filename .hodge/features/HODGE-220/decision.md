# Decision: HODGE-220 - Fix Uncommitted Files After Ship

## Decision
**Pre-Commit All Updates with Rollback on Failure**

Move all file updates (autoSave, HODGE.md, PM tracking) BEFORE git commit, with state rollback if commit fails to prevent inconsistent state.

## Implementation Strategy

### 1. Backup Current State
Before making any updates, capture current state of metadata files:
```typescript
const backup = {
  featureHodge: await fs.readFile(featureHodgePath),
  pmTracking: await fs.readFile(pmPath),
  session: await fs.readFile(sessionPath),
  context: await fs.readFile(contextPath)
};
```

### 2. Perform All Updates
Execute all metadata updates in sequence:
```typescript
try {
  // Update all metadata first
  await autoSave.checkAndSave(feature);
  await populator.generateFeatureHodgeMD(feature);
  await pmAdapter.updateStatus(feature, 'shipped');

  // Stage everything
  await execAsync('git add -A');

  // Create commit
  await execAsync(`git commit -m "${commitMessage}"`);

  // Success - no rollback needed
  console.log('✓ Ship completed with clean working tree');
} catch (error) {
  // Rollback on failure
  await rollbackMetadata(backup);
  throw error;
}
```

### 3. Rollback Mechanism
If commit fails, restore previous state:
```typescript
async function rollbackMetadata(backup) {
  console.log('⚠️ Commit failed, rolling back metadata...');

  await fs.writeFile(featureHodgePath, backup.featureHodge);
  await fs.writeFile(pmPath, backup.pmTracking);
  await fs.writeFile(sessionPath, backup.session);
  await fs.writeFile(contextPath, backup.context);

  console.log('✓ Metadata rolled back to pre-ship state');
}
```

## Rationale
- **Single atomic commit**: Users expect one commit per ship
- **Clean working tree**: No manual cleanup required after ship
- **Safe failure mode**: Rollback prevents inconsistent state
- **Simple mental model**: Everything happens together or not at all

## Testing Requirements
- Test successful ship leaves no uncommitted files
- Test failed commit triggers rollback
- Test metadata state is consistent after rollback
- Test all edge cases (merge conflicts, permission errors, etc.)

## Migration Path
1. Implement rollback mechanism first
2. Move all updates before commit
3. Add comprehensive error handling
4. Test thoroughly in staging
5. Deploy with feature flag initially

---
*Decision made: 2025-09-21*
*Feature: HODGE-220*