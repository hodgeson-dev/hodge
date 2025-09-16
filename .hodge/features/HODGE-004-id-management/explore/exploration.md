# Exploration: Feature ID Management

## Feature Overview
Manage feature IDs across local (HODGE-xxx) and external PM tools (JIRA-123, HOD-456) with automatic mapping.

## Context
- **Date**: 2025-01-16
- **Parent**: feature-context-organization exploration
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Create ID management system")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-1-cross-tool-compatibility`

## Problem Statement
Features need consistent IDs for:
- Local tracking (when no PM tool configured)
- External PM tool integration
- Cross-referencing between systems
- Migration between PM tools

## Recommended Approach: Dual ID System

### ID Structure
```typescript
interface FeatureID {
  localID: string;        // HODGE-001, HODGE-002
  externalID?: string;    // JIRA-123, HOD-456, etc.
  pmTool?: string;        // linear, jira, github
  created: Date;
  lastSynced?: Date;
}
```

### Implementation Details

1. **IDManager Class**
   - Location: `src/lib/id-manager.ts`
   - Generates sequential HODGE-xxx IDs
   - Maps to external IDs
   - Handles ID conflicts

2. **ID Mapping File**
   ```json
   // .hodge/id-mappings.json
   {
     "HODGE-001": {
       "externalID": "HOD-123",
       "pmTool": "linear",
       "created": "2025-01-16T10:00:00Z",
       "lastSynced": "2025-01-16T15:00:00Z"
     }
   }
   ```

3. **Usage in Commands**
   ```bash
   hodge explore HODGE-001  # Use local ID
   hodge explore HOD-123    # Auto-resolve to HODGE-001
   hodge status --all       # Shows both IDs
   ```

## Test Intentions
- [ ] Sequential ID generation works
- [ ] External ID mapping persists
- [ ] ID resolution works both ways
- [ ] Conflict detection prevents duplicates
- [ ] Migration between PM tools preserves history

## Dependencies
- **File Storage**: `.hodge/id-mappings.json`
- **Related**: HODGE-006-local-pm-tracking
- **Related**: HODGE-007-pm-auto-sync

## Next Steps
1. Implement IDManager class
2. Add ID resolution to all commands
3. Create migration utilities
4. Test with multiple PM tools

## Related Features
- **HODGE-003**: Feature extraction needs IDs
- **HODGE-006**: Local PM tracking uses IDs
- **HODGE-007**: PM sync manages external IDs
- **Parent**: feature-context-organization