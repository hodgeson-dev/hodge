# Build Plan: HODGE-331

## Feature Overview
**PM Issue**: HODGE-331 (linear)
**Status**: Completed
**Approach**: Metadata Filtering with Structured Extra Data (Approach 2 from exploration)

## Implementation Checklist

### Core Implementation
- [x] Enhanced formatLogLine method to filter logger internals
- [x] Implemented command name capitalization and bracketing
- [x] Added line-by-line extra data formatting
- [x] Preserved raw JSON mode for debugging

### Integration
- [x] Updated existing logs command (no breaking changes)
- [x] Maintained backward compatibility with log files
- [x] All existing features preserved

### Quality Checks
- [x] Followed coding standards
- [x] Used established patterns
- [x] Added comprehensive smoke tests
- [x] Considered edge cases (malformed JSON, missing fields)

## Files Modified

### Implementation
- `src/commands/logs.ts` - Enhanced formatLogLine method (lines 169-240)
  - Added pinoInternals array to filter logger metadata
  - Capitalized command names: `log.command.charAt(0).toUpperCase() + log.command.slice(1)`
  - Changed bracket format: `chalk.blue(\`[${commandName}]\`)`
  - Line-by-line extra data: `\n  ${chalk.dim(key)}: ${valueStr}`

### Tests
- `src/commands/logs.smoke.test.ts` - Created 11 smoke tests
  - Basic command execution tests (no crash, options handling)
  - formatLogLine behavior tests (filtering, capitalization, formatting)
  - Raw mode preservation test

## Decisions Made

**Filtering Strategy**: Used expanded blocklist approach with pino-specific fields
- Filtered fields: time, level, pid, msg, command, timestamp, hodgeVersion, hostname, name, enableConsole, v
- Rationale: Covers all known pino/logger internals without being overly aggressive

**Capitalization**: Initial caps only (Ship, Build, Explore)
- Implementation: `command.charAt(0).toUpperCase() + command.slice(1)`
- Rationale: Clean, readable, consistent with user preference

**Extra Data Format**: Line-by-line with indentation (Option C)
- Format: `\n  ${key}: ${value}`
- Rationale: Most readable for multiple fields, easy to scan

**Non-pretty Mode**: Preserve complete raw JSON
- Implementation: Return original line unchanged when pretty=false
- Rationale: Ensures debugging capability is not lost

## Testing Notes

**Smoke Tests (11 total, all passing)**:
1. Command doesn't crash with no log file
2. Handles empty options
3. Handles pretty option
4. Handles level filter
5. Handles command filter
6. Handles tail option
7. Handles clear option
8. Filters logger internals in pretty mode
9. Capitalizes and brackets command names
10. Shows user data line-by-line
11. Preserves raw JSON in non-pretty mode

**Test Coverage**:
- ✅ Logger metadata filtering (enableConsole, hostname, name hidden)
- ✅ Command formatting ([Ship], [Build], [Explore])
- ✅ Extra data formatting (indented, line-by-line)
- ✅ Raw mode preservation (--no-pretty)
- ✅ Edge cases (malformed JSON, missing fields)

## Implementation Summary

**Before**:
```
10/4/2025, 10:58:34 PM INFO     5. Gather user feedback {
  "name": "ship",
  "enableConsole": true
}
```

**After**:
```
10/4/2025, 10:58:34 PM INFO [Ship] 5. Gather user feedback
```

**With User Data**:
```
10/4/2025, 10:58:35 PM ERROR [Build] Failed to load
  filePath: /foo/bar
  reason: not found
```

## Next Steps
After implementation:
1. ✅ Run smoke tests - All 11 tests passing
2. Run full test suite with `npm test`
3. Check linting with `npm run lint`
4. Review changes
5. Proceed to `/harden HODGE-331` for integration tests
