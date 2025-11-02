# Exploration: Team Mode Detection & Configuration - Dynamic PM Integration

**Created**: 2025-11-01
**Status**: Exploring

## Problem Statement

Hodge needs to support both solo developers (simple, frictionless HODGE-XXX auto-increment) and team workflows (PM-integrated, conflict-free feature tracking) without forcing developers to choose upfront or requiring complex reconfiguration. The system should detect team mode based on project configuration and credentials, apply appropriate settings automatically, and allow seamless mid-project transitions between modes.

## Context

**Project Type**: Framework Enhancement (Team Collaboration Foundation)

**Parent Feature**: HODGE-377 - Team Development with Feature Branches & Workflow Refinement

This is the foundational sub-feature of the HODGE-377 epic. It provides the detection and configuration infrastructure that 4 other sub-features depend on (HODGE-377.2 through HODGE-377.5). The parent exploration established a Dual-Mode Architecture approach where solo and team modes coexist based on PM integration credential detection.

## Related Features

- HODGE-377 - Parent epic (Team Development)
- HODGE-001 - Initial feature structure
- HODGE-002 - PM integration foundation
- HODGE-004 - Context management

## Conversation Summary

We explored how team mode detection should work in practice, starting with the fundamental question of when detection happens. The key insight was that mode switching should be tied to the `pm.enabled` setting in `hodge.json` rather than purely credential-based detection - this gives developers explicit control while still allowing automatic activation when credentials are present.

For PM tool support, we determined that Linear and GitHub should be the initial focus (alongside Local), as these are most likely for smaller teams and prove the adapter generalization with 3 distinct implementations. The config structure analysis revealed minimal provider-specific needs (only Linear's `teamId`), supporting a simple unified configuration approach rather than provider-namespaced sections.

Edge case handling prioritized graceful degradation - missing credentials or PM unavailability should queue operations locally with warnings, not block development. The `pm.enabled: false` setting provides a hard override for developers who want to ignore credentials and work in solo mode explicitly.

We clarified that developers never call `hodge` commands directly (slash commands do), which informed the PM issue creation timing - issues are created after `exploration.md` is written, when we have meaningful content to populate the issue description. This also means abandoned explorations don't leave orphaned PM issues.

The gitignore strategy emerged as surprisingly simple: always add `.hodge/context.json` to `.hodge/.gitignore` regardless of mode, avoiding the complexity of mode-dependent gitignore management. Developers can override if needed, but the sensible default works for 95% of cases.

## Implementation Approaches

### Approach 1: Unified Configuration with Dynamic Detection (Recommended)

**Description**:

Single PM configuration section in `hodge.json` with `pm.enabled` as master control. Mode detection happens dynamically at runtime by checking `pm.enabled` + environment credentials. Credentials take precedence when `pm.enabled: true`, but `pm.enabled: false` provides hard override. Config structure is provider-agnostic with minimal provider-specific fields (`teamId` for Linear).

**Architecture**:
```typescript
// hodge.json structure
{
  "pm": {
    "enabled": true,                    // Master switch
    "tool": "linear",                   // "linear" | "github" | "local"
    "teamId": "abc-123",                // Linear-specific (optional for others)
    "statusMap": {                      // Shared across all providers
      "explore": "Backlog",
      "build": "In Progress",
      "harden": "In Review",
      "ship": "Done"
    },
    "verbosity": "normal",              // "minimal" | "normal" | "detailed"
    "queueOfflineRequests": true        // Graceful degradation
  }
}

// Detection logic (simplified)
function detectTeamMode(): boolean {
  const config = loadHodgeJson();
  if (!config.pm?.enabled) return false;           // Explicit disable

  const provider = config.pm.tool;
  const hasCredentials = checkCredentials(provider); // Check env vars

  if (!hasCredentials) {
    queueMode = true;                              // Queue operations
    return false;                                  // Effectively solo mode
  }

  return true;                                     // Team mode active
}

// Gitignore setup (during hodge init)
async function setupGitignore(basePath: string) {
  const gitignorePath = path.join(basePath, '.hodge', '.gitignore');
  await fs.writeFile(gitignorePath, 'context.json\n', { flag: 'a' });
}
```

**Pros**:
- Simple mental model (one place to configure PM)
- Explicit control via `pm.enabled` (no surprise mode changes)
- Graceful degradation when credentials missing
- Works seamlessly for solo → team transitions
- Minimal provider-specific config (scales well)
- Config structure already exists in current `hodge.json`

**Cons**:
- Requires reading `hodge.json` on every command (minor performance cost)
- `pm.enabled` flag might feel redundant when credentials present
- Mixing provider-agnostic and provider-specific fields in one section

**When to use**:
When you want explicit developer control over mode with automatic activation when configured. Best for projects that might transition from solo to team over time, or teams that want to temporarily disable PM integration without removing credentials.

---

### Approach 2: Credential-Only Detection (Automatic)

**Description**:

No `pm.enabled` flag - mode is purely determined by credential presence in environment. If `LINEAR_API_KEY` or `GITHUB_TOKEN` exists in environment, team mode activates automatically. Configuration in `hodge.json` only provides PM settings (status mapping, verbosity), not mode control.

**Architecture**:
```typescript
// hodge.json structure (no enabled flag)
{
  "pm": {
    "tool": "linear",                   // Which provider to use
    "teamId": "abc-123",                // Provider-specific config
    "statusMap": { ... },
    "verbosity": "normal"
  }
}

// Detection logic
function detectTeamMode(): boolean {
  const config = loadHodgeJson();
  const provider = config.pm?.tool ?? detectProviderFromEnv();

  return checkCredentials(provider);    // Only check - no override
}

// To disable team mode: unset credentials or remove from environment
```

**Pros**:
- Simplest implementation (no flag to manage)
- "Just works" when credentials present
- No redundancy between config and environment
- Fewer configuration options to document

**Cons**:
- No way to disable PM integration while keeping credentials in environment
- Can't test "solo mode with credentials present" scenarios
- Less explicit (mode changes invisibly when credentials added)
- Harder to temporarily disable PM without losing credential config
- No graceful degradation option (missing credentials = solo mode, no queuing)

**When to use**:
When you want maximum simplicity and assume developers always want PM integration when credentials are available. Best for teams that are "all-in" on PM integration without need for local-only testing.

---

### Approach 3: Provider-Namespaced Configuration

**Description**:

Each PM provider gets its own top-level configuration section in `hodge.json`, with global `pm.enabled` and `pm.provider` selecting which to use. This separates provider-agnostic settings from provider-specific configuration.

**Architecture**:
```typescript
// hodge.json structure
{
  "pm": {
    "enabled": true,
    "provider": "linear",               // Which provider to use
    "statusMap": { ... },               // Shared settings
    "verbosity": "normal",
    "queueOfflineRequests": true
  },
  "linear": {                           // Linear-specific config
    "teamId": "abc-123",
    "workspace": "my-workspace"
  },
  "github": {                           // GitHub-specific config
    "owner": "myorg",
    "repo": "myrepo",
    "labelPrefix": "hodge/"
  }
}

// Multiple providers configured simultaneously
// Switch by changing pm.provider, not by editing provider config
```

**Pros**:
- Clear separation of concerns (shared vs provider-specific)
- Can configure multiple providers simultaneously
- Easy to switch providers (just change `pm.provider`)
- More room for provider-specific features without cluttering main `pm` section
- Scales better if providers have many unique settings

**Cons**:
- More complex configuration structure
- More files to document and maintain
- Overkill for current needs (minimal provider differences)
- Breaking change from existing `hodge.json` structure
- Requires migration for current users

**When to use**:
When providers have significantly different configuration needs, or when you expect developers to frequently switch between multiple PM tools. Best for larger teams with diverse tooling requirements.

---

## Recommendation

**Approach 1 - Unified Configuration with Dynamic Detection**

**Rationale**:

Approach 1 provides the right balance of simplicity and control for Hodge's use case. The `pm.enabled` flag gives developers explicit control over mode without requiring credential manipulation, which is crucial for testing and temporary PM disabling. The unified config structure scales adequately given that provider differences are minimal (only Linear's `teamId` as provider-specific config).

Graceful degradation through operation queuing aligns with Hodge's philosophy of "freedom to explore" - developers shouldn't be blocked by PM unavailability during exploration phases. The existing `hodge.json` structure already follows this pattern, making implementation straightforward without breaking changes.

The detection logic is simple and deterministic: check `pm.enabled` first (hard override), then verify credentials. This prevents surprise mode changes and makes troubleshooting easier ("Is PM enabled? Do I have credentials?"). Mid-project mode switching becomes trivial - just toggle the flag.

Gitignore automation via `.hodge/.gitignore` (Option C) keeps our changes scoped to our directory and works for both modes, eliminating conditional logic entirely. PM issue creation timing after `exploration.md` written ensures we have meaningful content and prevents orphaned issues from abandoned explorations.

The implementation supports the parent epic's Dual-Mode Architecture cleanly while providing the foundation for HODGE-377.2 (PM-required feature creation) and HODGE-377.5 (Feature ID abstraction).

## Test Intentions

### Core Behaviors

1. **Detects team mode when `pm.enabled: true` and credentials present**
   - Linear: Check for `LINEAR_API_KEY` and `LINEAR_TEAM_ID` env vars
   - GitHub: Check for `GITHUB_TOKEN` env var
   - Should return `teamMode: true`

2. **Falls back to solo mode when `pm.enabled: false` (hard override)**
   - Even with valid credentials in environment
   - Should return `teamMode: false`
   - Should not attempt any PM operations

3. **Queues PM operations when `pm.enabled: true` but credentials missing**
   - Should return `teamMode: false` (effectively solo mode)
   - Should set `queueMode: true` internally
   - Should log warning about queuing operations

4. **Uses `pm.tool` to select provider when multiple credentials present**
   - Both `LINEAR_API_KEY` and `GITHUB_TOKEN` in environment
   - `pm.tool: "linear"` → uses Linear adapter
   - `pm.tool: "github"` → uses GitHub adapter

5. **Creates PM issue after exploration.md written**
   - Not at `/explore` start
   - Issue description populated from exploration content
   - Issue ID returned to slash command template

6. **Creates `.hodge/.gitignore` with `context.json` during init**
   - Happens regardless of team/solo mode
   - File created in `.hodge/` directory
   - Contains at minimum: `context.json`

7. **Validates provider-specific required config**
   - Linear adapter: Requires `teamId` in config
   - GitHub adapter: Doesn't require additional config (auto-detects from git)
   - Local adapter: Requires no config

8. **Loads PM configuration from `hodge.json`**
   - Reads `pm` section
   - Provides sensible defaults for missing fields
   - Validates structure before use

9. **Supports mid-project mode switching**
   - Developer can toggle `pm.enabled: true` → `false` (and vice versa)
   - No reinit required
   - Existing features continue working

### Edge Cases

10. **Defaults to solo mode when no `pm` section in config**
    - Missing `hodge.json` entirely → solo mode
    - `hodge.json` exists but no `pm` section → solo mode
    - `pm` section exists but `enabled` field missing → treat as `enabled: false`

11. **Handles PM configuration errors gracefully**
    - Invalid `pm.tool` value → warn and default to `local`
    - Linear adapter with missing `teamId` → queue operations with error
    - GitHub adapter with git remote detection failure → queue with error

12. **Handles PM unavailability gracefully**
    - API returns 401/403 (bad credentials) → queue operations, warn user
    - API timeout/network error → queue operations, warn user
    - Rate limit exceeded → queue operations with retry backoff

## Decisions Decided During Exploration

1. ✓ **Mode control mechanism**: `pm.enabled` in `hodge.json` is the master switch (not purely credential-based)
2. ✓ **Mode switching**: Mid-project transitions supported; no reinit required when toggling `pm.enabled`
3. ✓ **Credential detection**: Check environment variables (`LINEAR_API_KEY`, `GITHUB_TOKEN`) when `pm.enabled: true`
4. ✓ **Solo mode override**: `pm.enabled: false` = hard override (ignore credentials completely)
5. ✓ **Missing credentials handling**: Queue PM operations gracefully when `pm.enabled: true` but credentials absent
6. ✓ **Provider support**: Linear + GitHub initially (proves generalization with 3 adapters including Local)
7. ✓ **Provider selection**: `pm.tool` field disambiguates when multiple credentials present
8. ✓ **Config structure**: Unified `pm` section (not provider-namespaced) with minimal provider-specific fields
9. ✓ **PM issue creation timing**: After `exploration.md` written (not at `/explore` start) to have meaningful content
10. ✓ **Gitignore strategy**: Always add `.hodge/context.json` to `.hodge/.gitignore` via Option C (`.hodge/.gitignore` file)
11. ✓ **Config validation**: Missing `pm` section defaults to `enabled: false`
12. ✓ **PM unavailability handling**: Revert to queuing with warnings (don't fail hard)
13. ✓ **Mode switching trust**: Assume developer knows what they're doing when changing `pm.enabled: true` → `false`
14. ✓ **Migration**: No migration needed (no current external users)

## No Decisions Needed

All architectural questions resolved during exploration conversation.

## Next Steps

1. ✅ Exploration complete - all decisions resolved
2. Ready for `/build HODGE-377.1` to implement team mode detection
3. This provides foundation for HODGE-377.2 (PM-required feature creation) and HODGE-377.5 (Feature ID abstraction)
