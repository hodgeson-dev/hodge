# Test Intentions for HODGE-291

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Should not crash when executed
- [ ] Should complete within reasonable time (<500ms)
- [ ] Should handle invalid input gracefully
- [ ] Should integrate with existing systems

## Logging-Specific Requirements
- [ ] Should log all commands executed (info level)
- [ ] Should capture errors with full stack traces (error level)
- [ ] Should log feature ID resolution logic (debug level)
- [ ] Should respect LOG_LEVEL environment variable
- [ ] Should create .hodge/logs directory if not exists
- [ ] Should not log to console for non-init commands
- [ ] Should include timestamp, level, command context in each log entry

## File Management Tests
- [ ] Should rotate logs when size exceeds 10MB
- [ ] Should keep maximum 5 log files
- [ ] Should handle disk full scenarios gracefully
- [ ] Should create separate error.log for errors only
- [ ] Should handle concurrent writes from multiple commands

## Integration Tests
- [ ] All 46 files with console.log should use new logger
- [ ] Child loggers should properly inherit parent context
- [ ] Logger should work in all environments (local, CI, production)
- [ ] Should preserve existing console output for init command

## Performance Criteria
- [ ] Logging overhead < 5ms per operation
- [ ] Async logging should not block command execution
- [ ] Log file writes should use buffering
- [ ] Should handle 1000+ log entries per second

## Debug Experience
- [ ] Log viewer tool should parse JSON logs
- [ ] Should be able to filter by level, command, timestamp
- [ ] Should provide clear context for debugging issues
- [ ] Example: HODGE-291-persistent-logging issue should show clear decision path

## Notes
Specific scenarios discovered during exploration:

- Feature ID pattern detection (HODGE-XXX vs plain names)
- Auto-save triggers creating many log entries
- PM tool API failures need detailed error logging
- Command execution timing metrics would be valuable

---
*Generated during exploration phase. Convert to actual tests during build phase.*