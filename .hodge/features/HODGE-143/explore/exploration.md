# Exploration: PM Adapter Hooks Enhancement (HODGE-143)

## Feature Analysis
**Type**: PM Integration Enhancement
**Keywords**: pm-adapter-hooks, project management, workflow integration
**Related Commands**: explore, build, harden, ship
**PM Issue**: HODGE-143

## Context
- **Date**: 9/20/2025
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (loaded)
- **Existing Patterns**: 9
- **Current Implementation**: PMHooks class with LocalPMAdapter

## Problem Statement
The current PM hooks implementation only exists in the build command. We need to integrate PM hooks consistently across all workflow commands (explore, build, harden, ship) to ensure proper project management tracking throughout the development lifecycle.

## Similar Features
- HODGE-006: Local PM tracking implementation
- HODGE-007: PM auto-sync functionality
- HODGE-045: PM Tool Integration




## Recommended Approaches

### Approach 1: Centralized Hook Integration
**Description**: Create a centralized hook manager that all workflow commands use, ensuring consistent PM tracking across the entire workflow.

**Implementation**:
- Extract PMHooks instantiation to a shared service
- Add hooks to explore, harden, and ship commands
- Create consistent status mappings for all phases
- Implement rollback on failures

**Pros**:
- Single source of truth for PM updates
- Consistent behavior across all commands
- Easy to maintain and extend
- Better error handling

**Cons**:
- Requires refactoring existing build command
- More complex initialization

### Approach 2: Command-Level Hook Integration
**Description**: Add PMHooks directly to each workflow command, with command-specific customizations.

**Implementation**:
- Add PMHooks to explore.ts, harden.ts, ship.ts
- Each command manages its own PM interaction
- Custom status mappings per command
- Independent error handling

**Pros**:
- Simple to implement incrementally
- Commands remain independent
- Flexible per-command customization
- No shared state complexity

**Cons**:
- Code duplication across commands
- Harder to maintain consistency
- Risk of diverging implementations

### Approach 3: Event-Driven Hook System
**Description**: Implement an event-driven architecture where workflow commands emit events that PM hooks listen to.

**Implementation**:
- Create WorkflowEventEmitter class
- Commands emit phase transition events
- PMHooks subscribes to events
- Decoupled PM tracking from commands

**Pros**:
- Complete decoupling of concerns
- Easy to add new integrations
- Commands don't know about PM
- Testable in isolation

**Cons**:
- More complex architecture
- Event debugging can be harder
- Potential race conditions


## Recommendation
Based on the analysis, **Approach 2: Command-Level Hook Integration** appears most suitable because:
- Aligns with Hodge's "simple and direct" philosophy
- Matches existing pattern in build.ts
- Can be implemented incrementally
- Maintains command independence
- Easy to test and understand

## Implementation Plan

### PM Update Timing Strategy
- **explore/build/harden**: Update PM at START of phase (marking entry into phase)
- **ship**: Update PM only on SUCCESS (marking completion)
- This ensures PM accurately reflects work state

### Implementation Phases

1. **Phase 1**: Add PMHooks to explore command
   - Import and instantiate PMHooks
   - Call `onExplore()` at START of exploration
   - Update feature status to "exploring" immediately

2. **Phase 2**: Add PMHooks to harden command
   - Call `onPhaseStart()` at START with 'harden' phase
   - Update external PM to "in_review" immediately
   - Status remains "hardening" even if tests fail

3. **Phase 3**: Enhance ship command
   - Call `onShip()` ONLY after successful completion
   - Update PM status to "done" ONLY on success
   - If ship fails, PM remains in previous state

4. **Phase 4**: Refactor for consistency
   - Extract common PM configuration
   - Standardize error handling
   - Add integration tests for timing behavior

## Next Steps
- [ ] Review the recommended approaches
- [ ] Consider similar features for inspiration
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-143`

---
*Generated with AI-enhanced exploration (2025-09-20T20:28:41.626Z)*
