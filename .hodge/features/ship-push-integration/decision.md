# Decision: Git Push Integration for Ship Command

## Decision Date
2025-01-15

## Feature
ship-push-integration

## Decision
**Adopt Hybrid Approach with Ship Hooks**

## Rationale

After exploring three approaches for integrating git push functionality into the ship command, we've decided on the hybrid approach with ship hooks for the following reasons:

### 1. Flexibility Without Breaking Changes
- Existing `hodge ship` behavior remains unchanged by default
- Users can opt-in to auto-push with configuration or flags
- Supports both integrated and separate workflows

### 2. Progressive Enhancement Works Best
- Each environment (Claude Code, Warp, Terminal, CI) gets optimal UX
- File-based interaction for Claude Code with markdown review
- Interactive prompts for terminal environments
- Automatic safe defaults for CI

### 3. Branch-Aware Intelligence
- Detects and warns about pushing to protected branches (main/master)
- Suggests feature branches for parallel work
- Extracts issue IDs from branch names automatically
- Provides different behavior based on branch type (feature/fix/release)

### 4. Safety First
- Never force pushes without explicit confirmation
- Shows what will be pushed before executing
- Handles conflicts gracefully
- Preserves local work always

### 5. Maintains Context
- Ship metadata flows naturally to push operation
- Work log updates happen automatically
- PM issue linking preserved throughout

## Implementation Plan

### Phase 1: Core Integration (MVP)
```typescript
// Extend ShipOptions
export interface ShipOptions {
  // existing options...
  push?: boolean;        // Auto-push after ship (default: false initially)
  noPush?: boolean;      // Explicitly disable push
  pushBranch?: string;   // Override target branch
}
```

- Add basic push functionality to ship command
- Implement `--push` and `--no-push` flags
- Add branch detection and warnings for main/master
- Create simple confirmation flow

### Phase 2: Progressive Enhancement
- Implement environment detection for push UI
- Create Claude Code markdown review files
- Add terminal interactive prompts
- Build CI-safe automatic mode

### Phase 3: Advanced Features
- PR creation integration (GitHub/GitLab APIs)
- Conflict pre-detection and resolution help
- Stacked PR support for parallel workflows
- Work log automatic updates

## Configuration Schema

```json
{
  "ship": {
    "autoPush": false,  // Default off initially, can be enabled per project
    "push": {
      "strategy": "safe",  // safe | force | interactive
      "createPR": "prompt",  // always | never | prompt
      "protectedBranches": ["main", "master", "develop"],
      "remoteName": "origin"
    }
  }
}
```

## Migration Path

1. **v1.0**: Push is opt-in with `--push` flag
2. **v1.1**: Can be enabled by default in config
3. **v1.2**: Smart defaults based on branch type
4. **Future**: Separate `hodge push` command for advanced use cases

## Alternatives Considered

### Integrated Push (Rejected)
- Would make ship command too complex
- Violates single responsibility principle
- Harder to maintain and test

### Separate Command Only (Rejected)
- Forces two-step workflow for common operation
- Loses context between ship and push
- Users might forget to push

## Success Criteria

1. Ship command remains fast and simple by default
2. Push integration feels natural when enabled
3. Each environment gets appropriate UX
4. No breaking changes to existing workflows
5. Safety checks prevent common mistakes

## TODOs for Implementation

```typescript
// TODO: Make protected branch patterns configurable
const protectedBranches = ['main', 'master', 'develop'];

// TODO: Make feature branch patterns configurable
const featureBranchPattern = /^(feature|fix|chore|docs)\//;

// TODO: Make commit type list configurable
const commitTypes = ['feat', 'fix', 'refactor', 'test', 'docs', 'chore'];

// TODO: Add issue pattern configuration for different PM tools
const issuePatterns = {
  linear: /(?:LIN|HOD)-\d+/i,
  jira: /[A-Z]{2,}-\d+/,
  github: /#\d+/
};
```

## Next Steps

1. Start building Phase 1 with `/build ship-push-integration`
2. Update ship command with basic push functionality
3. Add configuration system for push behavior
4. Implement branch-aware safety checks
5. Create environment-specific UI adapters

## Decision Impact

This decision affects:
- Ship command behavior (extended, not changed)
- User workflows (enhanced, not disrupted)
- Configuration schema (new options added)
- Documentation (needs update for push features)

## Review Date
Review this decision after Phase 1 implementation to assess if the hybrid approach is working as expected.

---

Decision recorded by: Hodge Explore Mode
Status: Approved for implementation