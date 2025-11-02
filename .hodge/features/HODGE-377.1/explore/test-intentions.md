# Test Intentions for HODGE-377.1

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Behaviors

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

## Edge Cases

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

---
*Generated during exploration phase. Convert to actual tests during build phase.*
