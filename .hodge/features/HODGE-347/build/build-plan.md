# Build Plan: HODGE-347

## Feature Overview
**PM Issue**: HODGE-347 (linear)
**Status**: In Progress
**Title**: Comprehensive Audit Trail and Log Persistence for Hodge Operations

## Implementation Checklist

### Core Implementation
- [x] Fix log rotation bug (runs on every import)
- [x] Implement hybrid log level configuration (HODGE_LOG_LEVEL + hodge.json)
- [x] Migrate library error logging to pino (PM adapters, harden-service)
- [x] Add inline documentation for configuration

### Integration
- [x] Export rotator for manual rotation (not automatic)
- [x] Update logger.ts with getLogLevel() function
- [x] Migrate PM adapters to use pino
- [x] Migrate harden-service to use pino

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (createCommandLogger)
- [x] Add error object logging with context
- [x] Consider edge cases (config file missing, env vars)

## Files Modified
- `src/lib/logger.ts` - Fixed auto-rotation bug, added hodge.json config support, simplified env vars
- `src/lib/pm/base-adapter.ts` - Migrated to pino logging
- `src/lib/pm/index.ts` - Migrated to pino logging
- `src/lib/harden-service.ts` - Migrated to pino logging (resolved HODGE-330 violation)
- `src/lib/logger.smoke.test.ts` - Added HODGE-347 specific smoke tests

## Decisions Made
- **Log rotation trigger**: Removed automatic rotation on module import; export rotator for manual/scheduled rotation to prevent log loss
- **Configuration hierarchy**: HODGE_LOG_LEVEL (env) → hodge.json → 'info' (default)
- **Removed LOG_LEVEL**: Simplified to use only HODGE_LOG_LEVEL for clarity
- **Config file location**: Use `hodge.json` at project root (not `.hodge/config.json`) - aligns with tsconfig.json pattern
- **Library migration scope**: Migrated actual library operations (PM adapters, harden-service); excluded user-facing presentation logic (todo-checker, git-utils warnings, pm-scripts templates)

## Testing Notes
- All 16 smoke tests passing
- Tests cover: log persistence, rotation export, HODGE_LOG_LEVEL, hodge.json config
- Verified pino IS appending correctly (no persistence issue)
- Real issue was aggressive rotation, now fixed

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-347` for production readiness
