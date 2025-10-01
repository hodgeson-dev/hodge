# Build Plan: HODGE-289 - Configuration Management Strategy

## Feature Overview
**PM Issue**: HODGE-289 (linear)
**Status**: In Progress
**Description**: Implement layered configuration system separating secrets, user config, and generated metadata

## Implementation Checklist

### Core Implementation
- [x] Create ConfigManager module for layered config
- [x] Implement configuration priority (env > user > generated > defaults)
- [x] Add secret validation to prevent accidental commits
- [x] Include comprehensive inline documentation

### Integration
- [x] Update PM hooks to use ConfigManager
- [x] Migrate existing config loading logic
- [x] Add migration functionality for existing configs
- [x] Create createConfigManager for testing

### Quality Checks
- [x] Follow existing patterns (singleton, promises)
- [x] Use TypeScript strict typing
- [x] Add comprehensive error handling
- [x] Handle missing files gracefully

## Files Modified
- `src/lib/config-manager.ts` - New layered configuration manager
- `src/lib/pm/pm-hooks.ts` - Updated to use ConfigManager instead of direct config loading
- `.env.example` - Cleaned up to only include used variables
- `hodge.json.example` - New example user configuration file
- `src/lib/config-manager.smoke.test.ts` - Comprehensive smoke tests

## Files Removed/Cleaned
- Removed unused environment variables from `.env.example`:
  - LINEAR_TEAM_NAME, LINEAR_PROJECT_ID (not used in code)
  - GITHUB_REPO (not used)
  - JIRA_HOST, JIRA_EMAIL, JIRA_PROJECT_KEY (not implemented)
  - NODE_ENV, LOG_LEVEL (not used)

## Decisions Made
- **Layered Configuration**: hodge.json (user) > .hodge/config.json (generated) > env vars (secrets)
- **Security First**: Validate no secrets in user config files
- **Backward Compatible**: Support existing .hodge/config.json with migration path
- **Test-Friendly**: Support basePath parameter for isolated testing

## Configuration Structure
```
hodge.json (root)              - User configuration (in git)
.hodge/config.json              - Generated metadata (not in git)
.env / environment variables    - Secrets only (not in git)
```

## Testing Notes
- All 10 smoke tests passing
- Tests handle environment variable isolation
- Tests use temporary directories to avoid conflicts
- Config loading tested with and without files

## Next Steps
After implementation:
1. ✅ Run tests with `npm run test:smoke config-manager`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-289` for production readiness
