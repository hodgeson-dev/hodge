# Exploration: HODGE-052 - Auto-Save Context on Feature Switch

## Feature Analysis
**Type**: Context Management Enhancement
**Keywords**: auto-save, context switching, feature management
**Related Commands**: explore, build, context, save
**PM Issue**: HODGE-052
**Decision**: Auto-save current context when switching features with notification to user

## Context
- **Date**: 9/18/2025
- **Mode**: Explore (Enhanced)
- **Feature**: Auto-save current context when switching features with notification
- **Goal**: Seamless workflow without data loss

## Existing Context Management
Analyzed current implementation:
- `SessionManager` handles session creation and saves
- `/save` command exists for manual saves
- `.hodge/context.json` tracks current feature
- No automatic save on feature switch currently

## Recommended Approaches

### Approach 1: Event-Based Auto-Save (Recommended)
**Description**: Implement auto-save through command interceptor pattern

**Implementation Sketch**:
```typescript
// In commands base class or wrapper
async function withAutoSave(command: Command, feature: string) {
  const currentContext = await loadContext();
  if (currentContext.feature && currentContext.feature !== feature) {
    // Auto-save current context
    await sessionManager.autoSave(currentContext.feature);
    console.log(chalk.yellow(`✓ Auto-saved context for ${currentContext.feature}`));
  }
  // Execute command
  await command.execute(feature);
}
```

**Pros**:
- Transparent to user
- Works across all commands
- Single implementation point
- Preserves work automatically

**Cons**:
- Need to modify command execution flow
- Potential performance impact on every command

### Approach 2: Git-Hook Style Implementation
**Description**: Use pre-command hooks for auto-save

**Implementation Sketch**:
```typescript
// In bin/hodge.ts
program.hook('preAction', async (thisCommand, actionCommand) => {
  if (isFeatureCommand(actionCommand)) {
    const newFeature = extractFeature(actionCommand);
    await checkAndAutoSave(newFeature);
  }
});
```

**Pros**:
- Clean separation of concerns
- Easy to disable/enable
- Follows familiar git-hook pattern
- No modification to existing commands

**Cons**:
- Commander.js hook support may be limited
- Need to parse commands to extract feature

### Approach 3: Context Manager Service
**Description**: Centralized context manager that monitors all feature operations

**Implementation Sketch**:
```typescript
class ContextManager {
  private currentFeature?: string;

  async switchFeature(newFeature: string) {
    if (this.currentFeature && this.currentFeature !== newFeature) {
      await this.autoSave();
    }
    this.currentFeature = newFeature;
    await this.updateContextFile(newFeature);
  }

  private async autoSave() {
    const sessionManager = new SessionManager();
    const saveDir = await sessionManager.createSave(this.currentFeature);
    console.log(chalk.yellow(`📦 Auto-saved: ${this.currentFeature} → ${saveDir}`));
  }
}
```

**Pros**:
- Single source of truth for context
- Easy to test
- Can add more context features later
- Clean API for commands to use

**Cons**:
- Requires refactoring existing commands
- Another service to maintain

## Recommendation
Based on the analysis, **Event-Based Auto-Save (Approach 1)** appears most suitable because:
- Minimal changes to existing commands
- Works transparently across entire system
- Follows existing patterns in codebase
- Easy rollback if issues arise

## Implementation Hints
- Check SessionManager.createSave() for existing save logic
- Add configuration option to disable auto-save if needed
- Consider debouncing rapid feature switches
- Log auto-saves to `.hodge/auto-saves.log` for debugging

## Test Scenarios Discovered
- Switching between features rapidly
- Switching to non-existent feature
- Auto-save when disk is full
- Auto-save with corrupted context.json
- Concurrent feature switches

## Next Steps
- [ ] Review the recommended approaches
- [ ] Prototype event-based auto-save
- [ ] Test with existing commands
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-052`

---
*Updated exploration with specific implementation approaches (2025-09-18)*