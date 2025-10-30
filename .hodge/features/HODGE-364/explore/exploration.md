# Exploration: HODGE-364

**Title**: Remove Session Fallback Magic and Consolidate Session Management

**Created**: 2025-10-29
**Status**: Exploring

## Problem Statement

The `/hodge` command unexpectedly loads feature context when no feature is specified, due to session-aware fallback behavior in `context.ts:90` (`const feature = featureArg ?? session?.feature`). When a user runs `/hodge` without arguments, they expect to load only global context (standards, decisions, principles), but instead the command automatically loads the last-worked feature from the session. This "magic" behavior is confusing and prevents users from getting a clean project overview when starting new work.

Additionally, the codebase maintains two separate session management systems that duplicate responsibility and create maintenance overhead:
- **SessionManager** (`.hodge/.session`) - stores feature, mode, recentCommands, recentDecisions, summary, nextAction
- **ContextManager** (`.hodge/context.json`) - stores feature, mode, timestamp, lastCommand, PM integration fields

Both systems track feature and mode, creating confusion about which is the source of truth. The `explore-service.ts` writes to both systems, and the extra features in SessionManager (command/decision history, summaries) are unused by any other code.

## Context

**Project Type**: TypeScript CLI tool for AI-assisted development

**Related Standards**:
- HODGE-334: CLI/AI Separation of Concerns
- HODGE-363: Context Command YAML Manifest (introduced session-aware behavior)
- CLI Architecture: Commands should be explicit, not magical

**Trigger**:
User ran `/hodge` expecting clean global context to start a new feature with `/explore`, but was pulled back into HODGE-363's context automatically.

## Related Features

- HODGE-363: Context Command YAML Manifest - introduced the session-aware fallback behavior
- HODGE-054: Context-Aware Workflow Commands - original ContextManager implementation
- HODGE-297: Context loading optimization decisions

## Conversation Summary

The issue surfaced when the user ran `/hodge` (no arguments) expecting to load only global project context before starting a new feature. Instead, the command loaded HODGE-363's feature context because it had a session fallback: `const feature = featureArg ?? session?.feature`.

During exploration, we discovered this behavior was intentional (documented in HODGE-363 exploration as "session-aware feature detection"), but it creates unexpected "magic" that confuses users about what context they're in.

Further investigation revealed the codebase has two separate session systems:
1. **SessionManager** reading `.hodge/.session` - used by `explore-service.ts`, `context.ts`, `status.ts`, `hodge-md-context-gatherer.ts`
2. **ContextManager** reading `.hodge/context.json` - used by `build.ts`, `harden.ts`, `ship.ts`, `explore-service.ts`, `save-service.ts`

The duplication creates several problems:
- `explore-service.ts` updates both systems (lines 373-380)
- Users don't know which file represents true session state
- SessionManager's extra features (recentCommands, recentDecisions, summary, nextAction) are stored but never read by other code
- Maintenance burden of keeping two systems in sync

The user's desired flow is explicit and clear:
1. `/hodge` (no args) → loads global context only, sets `feature: null` in context.json
2. `/explore "description"` → creates feature during exploration, updates context.json with `feature: "HODGE-XXX"`
3. `/build` (no args) → reads context.json, finds feature, continues with that feature
4. `/hodge HODGE-XXX` → explicitly loads that feature's context

This flow eliminates magic, makes session state predictable, and keeps ContextManager as the single source of truth.

## Implementation Approaches

### Approach 1: Remove Fallback Only (Minimal Change)

**Description**: Remove the session fallback from `context.ts:90` but keep both session systems in place.

**Changes**:
```typescript
// Current (context.ts:90)
const feature = featureArg ?? session?.feature;

// Proposed
const feature = featureArg; // No fallback
```

**Pros**:
- Minimal code change (1 line)
- Fixes the immediate problem
- Low risk
- Fast to implement and test

**Cons**:
- Leaves technical debt (two session systems)
- SessionManager still exists but becomes even less useful
- Maintenance burden remains
- Doesn't address root cause of confusion

**When to use**: When you need a quick fix and can't afford the refactoring time.

---

### Approach 2: Consolidate Session Management (Recommended)

**Description**: Remove SessionManager entirely and use ContextManager as the single source of truth. Update all code currently using SessionManager to use ContextManager instead.

**Changes**:
1. Remove session fallback from `context.ts:90` (same as Approach 1)
2. Update 4 files using SessionManager to use ContextManager:
   - `src/lib/explore-service.ts` (lines 107-108, 127-128, 373-378)
   - `src/commands/context.ts` (lines 89-90)
   - `src/commands/status.ts` (line 36)
   - `src/lib/hodge-md/hodge-md-context-gatherer.ts` (line 32)
3. Delete `src/lib/session-manager.ts`
4. Remove unused fields (recentCommands, recentDecisions, summary, nextAction)
5. Update tests that reference SessionManager or `.session` file

**Pros**:
- Single source of truth for session state
- Eliminates duplication and confusion
- Removes unused code (command/decision history features)
- ContextManager already used by all workflow commands
- Simpler mental model for developers
- Reduces maintenance burden
- Aligns with user's expected flow

**Cons**:
- More extensive changes (4 files + removal)
- Need to update tests
- Slightly higher implementation risk
- Need to verify no hidden dependencies on SessionManager features

**When to use**: When you want to address the root cause and clean up technical debt while fixing the immediate issue.

---

### Approach 3: Hybrid - Keep SessionManager for Display Only

**Description**: Remove session fallback but keep SessionManager for generating display content in HODGE.md. ContextManager becomes authoritative for workflow state.

**Changes**:
1. Remove session fallback from `context.ts:90`
2. Mark ContextManager as authoritative in comments/docs
3. Keep SessionManager but clarify it's only for HODGE.md generation
4. Update SessionManager to read from context.json instead of maintaining separate state

**Pros**:
- Preserves SessionManager's display formatting logic
- Clear separation: ContextManager = state, SessionManager = presentation
- Less code deletion (might preserve useful display code)

**Cons**:
- Still maintains two systems (even if roles are clearer)
- More complex architecture
- SessionManager becomes a display adapter, which could just be a utility function
- Doesn't simplify as much as Approach 2
- Users still see two files (confusing)

**When to use**: When SessionManager's display formatting is valuable enough to preserve separately.

## Recommendation

**Approach 2: Consolidate Session Management**

This approach fixes the immediate problem (session fallback magic) while addressing the underlying technical debt (duplicate session systems). Here's why:

1. **Eliminates confusion**: Single file (context.json) represents session state - no ambiguity
2. **Simplifies codebase**: Removes ~200 lines of unused session management code
3. **Already partially adopted**: ContextManager is used by all workflow commands (build/harden/ship)
4. **Unused features**: SessionManager's extras (command/decision history) aren't consumed by any code
5. **Aligns with user expectations**: The user selected context.json in the UI - that's what they expect to be used
6. **Future-proof**: ContextManager has PM integration fields needed for workflow commands

The only real "con" is implementation scope, but the affected code is well-isolated:
- 4 files need updates (explore-service, context, status, hodge-md-context-gatherer)
- SessionManager has no complex dependencies
- Tests are already structured to handle both systems

This is the right time to consolidate because:
- We're already touching context.ts to fix the fallback
- The duplication is causing real user confusion
- The extra scope is manageable (1-2 hours of careful refactoring)

## Test Intentions

1. **When `/hodge` is called with no arguments**, it should load ONLY global context (no feature context) and not use session fallback
2. **When `/hodge HODGE-XXX` is called**, it should load global context PLUS that specific feature's context
3. **When context.json doesn't exist**, `/hodge` should handle gracefully and load global context only
4. **When `/explore` creates a new feature**, it should update context.json with the feature ID
5. **When workflow commands (`/build`, `/harden`, `/ship`) run without arguments**, they should read feature from context.json
6. **After SessionManager removal**, no code should reference `.hodge/.session` file
7. **After consolidation**, all session state should be in context.json with fields: feature, mode, timestamp, lastCommand, PM fields
8. **YAML manifest output** should clearly indicate whether feature context was loaded (via explicit argument or no feature)
9. **Context loading should be read-only** - doesn't update context.json, just reads and displays

## Decisions Decided During Exploration

1. ✓ **Remove session fallback behavior** - `/hodge` with no feature argument should load ONLY global context, no automatic feature loading from session
2. ✓ **Consolidate to ContextManager** - remove SessionManager entirely, use context.json as single source of truth
3. ✓ **Don't migrate unused fields** - recentCommands, recentDecisions, summary, nextAction are not used and should be dropped entirely
4. ✓ **Context flow for commands** - `/hodge` sets feature=null, `/explore` discovers and sets feature, subsequent commands read from context.json
5. ✓ **Session updates are write-only during commands** - workflow commands update context.json but context loading doesn't use it for fallback

## No Decisions Needed
