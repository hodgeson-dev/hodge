# Test Intentions for HODGE-364

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements

### Context Loading Behavior
- [ ] `/hodge` with no arguments should load ONLY global context (no feature context)
- [ ] `/hodge` with no arguments should NOT use session fallback from context.json
- [ ] `/hodge HODGE-XXX` with explicit feature should load global context PLUS that feature's context
- [ ] When context.json doesn't exist, `/hodge` should handle gracefully and load global context only

### Session Management Consolidation
- [ ] After SessionManager removal, no production code should reference `.hodge/.session` file
- [ ] After consolidation, all session state should be in context.json with fields: feature, mode, timestamp, lastCommand, PM fields
- [ ] No production code should reference recentCommands, recentDecisions, summary, or nextAction fields

### Workflow Integration
- [ ] When `/explore` creates a new feature, it should update context.json with the feature ID
- [ ] When workflow commands (`/build`, `/harden`, `/ship`) run without arguments, they should read feature from context.json
- [ ] Context loading (`/hodge`) should be read-only - doesn't update context.json, just reads and displays

### YAML Manifest Output
- [ ] YAML manifest should clearly indicate whether feature context was loaded (explicit argument vs no feature)
- [ ] When no feature specified, manifest should show empty feature_context section or omit it entirely
- [ ] When feature specified, manifest should show that feature's files

## Edge Cases

### Missing Files
- [ ] Should handle missing context.json gracefully (treat as no session)
- [ ] Should handle corrupted context.json gracefully (treat as no session)

### Backward Compatibility
- [ ] If `.hodge/.session` exists from old installation, should ignore it (not crash)
- [ ] Tests should not depend on SessionManager being present

## Integration Tests

### Full Workflow
- [ ] Run `/hodge` → verify global context only
- [ ] Run `/explore "test feature"` → verify context.json created with feature ID
- [ ] Run `/build` (no args) → verify it uses feature from context.json
- [ ] Run `/hodge HODGE-XXX` → verify explicit feature loading works

### Migration Path
- [ ] Replace SessionManager calls in explore-service.ts with ContextManager
- [ ] Replace SessionManager calls in context.ts with ContextManager
- [ ] Replace SessionManager calls in status.ts with ContextManager
- [ ] Replace SessionManager calls in hodge-md-context-gatherer.ts with ContextManager
- [ ] Remove session-manager.ts file
- [ ] Update all tests that reference SessionManager or .session file

## Notes

**Key Implementation Files:**
- `src/commands/context.ts` - Remove session fallback (line 90)
- `src/lib/explore-service.ts` - Replace SessionManager with ContextManager
- `src/commands/status.ts` - Replace SessionManager with ContextManager
- `src/lib/hodge-md/hodge-md-context-gatherer.ts` - Replace SessionManager with ContextManager
- `src/lib/session-manager.ts` - DELETE this file
- Tests that reference `.hodge/.session` - Update to use context.json

**Unused Fields to Remove:**
- recentCommands
- recentDecisions
- summary
- nextAction

---
*Generated during exploration phase. Convert to actual tests during build phase.*