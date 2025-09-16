# Exploration: Local PM Tracking

## Feature Overview
Local project_management.md file as fallback when no PM tool is configured, enabling basic issue tracking.

## Context
- **Date**: 2025-01-16
- **Parent**: feature-context-organization exploration
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Add local project_management.md")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-3-pm-integration-hooks`

## Problem Statement
Many projects don't have PM tools configured, but still need:
- Basic issue tracking
- Feature status visibility
- Work history
- Simple roadmap management
- Migration path to PM tools later

## Recommended Approach: Markdown-Based PM

### File Structure
```markdown
# Project Management

## Active Features

### HODGE-001: Cross-tool Compatibility
- **Status**: In Progress
- **Created**: 2025-01-16
- **Updated**: 2025-01-16
- **Description**: Make Hodge work with any AI tool
- **Decisions**:
  - Use HODGE.md as universal context file
  - Implement directory storage with MD view

## Completed Features

### HODGE-002: Core Standards
- **Status**: Shipped
- **Completed**: 2025-01-16
- **Description**: Template-based standards system

## Backlog

### HODGE-008: Advanced Pattern Learning
- **Status**: Planned
- **Description**: ML-inspired pattern extraction
```

### Implementation Details

1. **LocalPMAdapter Class**
   - Location: `src/lib/pm-adapters/local-pm-adapter.ts`
   - Implements PMAdapter interface
   - Reads/writes project_management.md
   - Maintains feature history

2. **PM Operations**
   ```typescript
   class LocalPMAdapter implements PMAdapter {
     async onExplore(feature: string) {
       await this.updateFeatureStatus(feature, 'Exploring');
       await this.addActivity(feature, 'Started exploration');
     }

     async onShip(feature: string) {
       await this.moveToCompleted(feature);
       await this.addActivity(feature, 'Shipped');
     }
   }
   ```

3. **Migration Support**
   ```bash
   hodge pm-migrate --to linear
   # Reads project_management.md
   # Creates issues in Linear
   # Updates id-mappings.json
   ```

## Test Intentions
- [ ] Markdown file created on init
- [ ] Features tracked correctly
- [ ] Status updates work
- [ ] History preserved
- [ ] Migration to PM tools works
- [ ] Fallback when PM tool fails

## Dependencies
- **Uses**: HODGE-004-id-management for feature IDs
- **Implements**: PMAdapter interface from pm-adapter-hooks
- **File**: `.hodge/project_management.md`

## Next Steps
1. Implement LocalPMAdapter
2. Add to PM manager as default
3. Create migration utilities
4. Test with real features

## Related Features
- **HODGE-004**: ID management system
- **HODGE-007**: PM auto-sync (can sync from local)
- **pm-adapter-hooks**: Defines PMAdapter interface
- **Parent**: feature-context-organization