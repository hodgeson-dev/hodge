# Exploration: PM Auto-Sync

## Feature Overview
Automatic synchronization between Hodge features and PM tools when configured, with graceful fallback.

## Context
- **Date**: 2025-01-16
- **Parent**: feature-context-organization exploration
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Implement PM auto-sync")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-3-pm-integration-hooks`

## Problem Statement
Need bidirectional sync between:
- Hodge feature directories and PM tool issues
- Local changes and remote updates
- Status transitions across systems
- Multiple PM tools with different APIs

## Recommended Approach: Sync Manager

### Sync Architecture
```typescript
interface SyncManager {
  // Pull from PM tool
  async pullUpdates(): Promise<SyncResult>;
  
  // Push to PM tool
  async pushChanges(): Promise<SyncResult>;
  
  // Conflict resolution
  async resolveConflicts(conflicts: Conflict[]): Promise<void>;
  
  // Auto-sync on commands
  async syncOnCommand(command: string): Promise<void>;
}
```

### Implementation Details

1. **PMSyncManager Class**
   - Location: `src/lib/pm-sync-manager.ts`
   - Handles bidirectional sync
   - Manages conflict resolution
   - Provides retry logic

2. **Sync Triggers**
   ```typescript
   const syncPoints = {
     beforeExplore: 'pull',    // Get latest from PM
     afterDecide: 'push',      // Update PM with decisions
     afterBuild: 'push',       // Update status
     afterShip: 'push',        // Mark complete
     onStatus: 'pull'          // Check for updates
   };
   ```

3. **Conflict Resolution**
   ```bash
   hodge sync
   # Conflict detected in HODGE-001:
   # Local: "In Progress"
   # Remote: "In Review"
   # [L]ocal / [R]emote / [M]erge?
   ```

4. **Sync Configuration**
   ```json
   {
     "pm": {
       "sync": {
         "auto": true,
         "interval": "on-command",
         "conflictResolution": "prompt",
         "retryAttempts": 3
       }
     }
   }
   ```

## Test Intentions
- [ ] Pull updates from PM tool
- [ ] Push changes to PM tool
- [ ] Conflict detection works
- [ ] Retry logic handles failures
- [ ] Graceful degradation without network
- [ ] Multiple PM tools supported

## Dependencies
- **Requires**: pm-adapter-hooks (PMAdapter interface)
- **Uses**: HODGE-004-id-management (ID mapping)
- **Uses**: HODGE-006-local-pm-tracking (fallback)
- **Network**: API access to PM tools

## Implementation Phases
1. **Phase 1**: Basic push sync (status updates)
2. **Phase 2**: Pull sync (import issues)
3. **Phase 3**: Conflict resolution UI
4. **Phase 4**: Batch operations

## Next Steps
1. Implement PMSyncManager
2. Add sync hooks to commands
3. Create conflict resolution UI
4. Test with real PM tools

## Related Features
- **pm-adapter-hooks**: Defines adapter interface
- **HODGE-004**: Manages ID mappings
- **HODGE-006**: Provides fallback storage
- **Parent**: feature-context-organization