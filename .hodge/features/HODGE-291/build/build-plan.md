# Build Plan: HODGE-291

## Feature Overview
**PM Issue**: HODGE-291 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create main component/module - `src/lib/logger.ts`
- [x] Implement core logic - Pino logger with multi-stream support
- [x] Add error handling - Graceful fallback for log directory creation
- [x] Include inline documentation - Full JSDoc comments

### Integration
- [x] Connect with existing modules - Started with explore.ts
- [x] Update CLI/API endpoints - Added `hodge logs` command
- [x] Configure dependencies - Added pino and pino-pretty

### Quality Checks
- [x] Follow coding standards - TypeScript strict mode
- [x] Use established patterns - Command-specific child loggers
- [x] Add basic validation - Environment variable checking
- [x] Consider edge cases - Console output for init command only

## Files Modified
<!-- Track files as you modify them -->
- `src/lib/logger.ts` - New Pino-based logger implementation
- `src/lib/logger.smoke.test.ts` - Smoke tests for logger functionality
- `src/commands/logs.ts` - New command for viewing/managing logs
- `src/bin/hodge.ts` - Registered logs command in CLI
- `package.json` - Added pino dependencies and log scripts
- `src/commands/explore.ts` - Integrated logger for debugging

## Decisions Made
<!-- Document any implementation decisions -->
- Used Pino over Winston: 10-20x performance improvement critical for CLI
- Hybrid rotation strategy: Combines size (10MB) and time (daily) limits
- JSON format with pino-pretty: Structured data with readable dev output
- INFO as default level: Balanced logging without excessive noise
- Console output for init only: Respects Claude Code silent execution

## Testing Notes
<!-- Notes for testing approach -->
- Test scenario 1
- Test scenario 2

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-291` for production readiness
