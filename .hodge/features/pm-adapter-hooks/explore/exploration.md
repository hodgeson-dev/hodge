# Exploration: PM Adapter Hooks

## Feature Overview
Build a project management integration system with hooks in every command for automatic status updates and issue tracking.

## Context
- **Date**: 2025-01-16
- **Related**: Existing PM scripts in `.hodge/pm-scripts/`
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Build PM adapter interface and hooks now with basic Linear implementation")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-3-pm-integration-hooks`

## Problem Statement
Current PM integration challenges:
- Manual status updates required
- No automatic workflow progression
- PM scripts exist but aren't integrated
- Each tool (Linear, GitHub, Jira) needs different handling
- Retrofitting PM integration later would touch every command

## Approaches Explored

### Approach 1: Direct Integration in Commands
Embed PM logic directly in each command
- **Pros**: Simple, direct
- **Cons**: Tight coupling, hard to maintain, duplication

### Approach 2: Event System
Emit events that PM listeners handle
- **Pros**: Loose coupling, extensible
- **Cons**: Complex, over-engineered for current needs

### Approach 3: Adapter Pattern with Hooks (RECOMMENDED)
Interface-based adapters with hooks in commands
- **Pros**:
  - Clean separation
  - Easy to add new PM tools
  - No-op when unconfigured
  - Can implement incrementally
- **Cons**:
  - Need to add hooks to all commands
  - Requires careful interface design

## Recommended Approach: Adapter Pattern

### PMAdapter Interface
```typescript
interface PMAdapter {
  // Core hooks that every PM tool must implement
  async onExplore(feature: string): Promise<void>;
  async onDecide(decision: string, feature: string): Promise<void>;
  async onBuild(feature: string): Promise<void>;
  async onHarden(feature: string): Promise<void>;
  async onShip(feature: string): Promise<void>;

  // Optional advanced features
  async createIssue?(feature: string, description: string): Promise<string>;
  async linkIssue?(feature: string, issueId: string): Promise<void>;
  async updateStatus?(issueId: string, status: string): Promise<void>;
  async addComment?(issueId: string, comment: string): Promise<void>;
}
```

### Implementation Details

1. **PMManager Class**
   - Location: `src/lib/pm-manager.ts`
   - Loads configured adapter
   - Handles no-op when unconfigured
   - Manages PM tool detection

2. **LinearAdapter Implementation**
   ```typescript
   class LinearAdapter implements PMAdapter {
     async onExplore(feature: string) {
       await this.updateStatus(feature, 'in-discovery');
       await this.addComment(feature, 'Exploration started via Hodge');
     }

     async onBuild(feature: string) {
       await this.updateStatus(feature, 'in-progress');
     }

     async onHarden(feature: string) {
       await this.updateStatus(feature, 'in-review');
     }

     async onShip(feature: string) {
       await this.updateStatus(feature, 'done');
       await this.addComment(feature, 'Shipped via Hodge');
     }
   }
   ```

3. **Hook Integration in Commands**
   ```typescript
   // In each command
   class ExploreCommand {
     async execute(feature: string) {
       // ... existing logic ...

       // PM hook (no-op if no adapter configured)
       const pmAdapter = await PMManager.getAdapter();
       await pmAdapter?.onExplore(feature);
     }
   }
   ```

4. **Configuration**
   ```json
   {
     "pm": {
       "tool": "linear",
       "workflow": {
         "explore": "in-discovery",
         "build": "in-progress",
         "harden": "in-review",
         "ship": "done"
       }
     }
   }
   ```

## Test Intentions
- [ ] PMAdapter interface works correctly
- [ ] LinearAdapter updates statuses
- [ ] Hooks fire from all commands
- [ ] No-op behavior when unconfigured
- [ ] Configuration loading works
- [ ] PM scripts integration functions
- [ ] Error handling doesn't break commands

## Dependencies
- **Existing**: PM scripts in `.hodge/pm-scripts/`
- **Environment**: LINEAR_API_KEY, LINEAR_TEAM_ID
- **Config**: PM section in hodge.json

## Implementation Phases
1. **Phase 1**: Basic hooks + Linear adapter (now)
2. **Phase 2**: GitHub, Jira adapters (later)
3. **Phase 3**: Two-way sync, custom workflows (future)

## Key Decisions Made
1. ✅ Build PM adapter interface and hooks now
2. ✅ Start with Linear implementation
3. ✅ Use adapter pattern for extensibility
4. ✅ Build structure now to avoid painful retrofitting

## Next Steps
1. Define PMAdapter interface
2. Implement LinearAdapter using existing scripts
3. Add hooks to all commands
4. Add configuration schema
5. Test with real Linear workspace

## Related Features
- **Uses**: cross-tool-compatibility (context in HODGE.md)
- **Related**: batch-decision-extraction (decisions update PM)
- **Existing**: PM scripts in `.hodge/pm-scripts/`

## References
- Implementation Plan: `IMPLEMENTATION_PLAN.md#phase-3`
- Decisions: `.hodge/decisions.md` (2025-01-16)
- Existing Scripts: `.hodge/pm-scripts/fetch-issue.js`, `update-issue.js`