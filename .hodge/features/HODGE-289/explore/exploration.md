# Exploration: HODGE-289

## Feature Overview
**PM Issue**: HODGE-289
**Type**: general
**Created**: 2025-09-24T17:05:23.039Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

Current configuration usage analysis:
- **Environment Variables**: Used for sensitive data (API keys), feature flags (DEBUG), and PM tool selection
- **Config Files**: `.hodge/config.json` stores project metadata, PM settings, and detected tools
- **No user config file**: Projects using Hodge don't have their own config file currently

## Implementation Approaches

### Approach 1: Layered Configuration (Recommended)
**Philosophy**: Clear separation between project config, user secrets, and runtime overrides

**Structure**:
```
hodge.json (root)              - Project configuration (committed to git)
.hodge/config.json              - Generated metadata (not in git)
.env / environment variables    - Secrets and overrides (not in git)
```

**What goes where**:
- `hodge.json`: PM tool selection, status mappings, verbosity settings, feature flags
- `.hodge/config.json`: Auto-detected project info, cached data
- Environment variables: API keys, tokens, temporary overrides

**Pros**:
- Clear mental model - developers know where to look
- Follows industry standards (package.json pattern)
- Secrets never in version control
- Easy to share team settings

**Cons**:
- Two config files might be confusing initially
- Need migration from current .hodge/config.json

### Approach 2: Single Config with Environment Interpolation
**Philosophy**: One config file to rule them all, with ${ENV_VAR} substitution

**Structure**:
```
.hodge/config.json              - All configuration (enhanced current file)
.env / environment variables    - Secrets only
```

**Example config**:
```json
{
  "pm": {
    "tool": "linear",
    "apiKey": "${LINEAR_API_KEY}",
    "teamId": "${LINEAR_TEAM_ID}",
    "statusMap": { ... }
  }
}
```

**Pros**:
- Single source of truth
- Minimal changes to current structure
- Familiar to Docker/K8s users

**Cons**:
- Mixing user config with generated metadata
- Harder to share config across team
- `.hodge/` directory not typically in git

### Approach 3: Environment-First with Optional Config
**Philosophy**: Environment variables are primary, config file provides defaults

**Structure**:
```
hodge.defaults.json (root)     - Optional defaults (in git)
.env / environment variables    - Primary configuration
```

**Priority order**:
1. Environment variables (highest)
2. hodge.defaults.json
3. Built-in defaults

**Pros**:
- Works well in CI/CD and containers
- No required config files
- Very flexible

**Cons**:
- Environment variables can get unwieldy
- Less discoverable configuration options
- Harder to manage complex nested settings

## Recommendation
**Approach 1: Layered Configuration** - This provides the clearest separation of concerns and best aligns with developer expectations. The `hodge.json` file at the project root follows the pattern established by `package.json`, `tsconfig.json`, etc., making it immediately discoverable.

## Decisions Needed
1. **Config file naming**: Should we use `hodge.json` or `.hodgerc.json` for the root config?
2. **Migration strategy**: How do we migrate existing `.hodge/config.json` data?
3. **Environment variable prefix**: Keep `HODGE_` prefix or allow unprefixed vars?
4. **Config validation**: Should we validate config on every command or just on init?
5. **Default location**: Should `hodge.json` be created by `hodge init` by default?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-289`

---
*Template created: 2025-09-24T17:05:23.039Z*
*AI exploration to follow*
