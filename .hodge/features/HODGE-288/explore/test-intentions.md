# Test Intentions for HODGE-288

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Should not crash when executed
- [ ] Should complete within reasonable time (<500ms)
- [ ] Should handle invalid input gracefully
- [ ] Should integrate with existing systems

## General-Specific Requirements
- [ ] PMHooks should call adapters for all workflow commands
- [ ] Adapters should handle PM tool API failures gracefully
- [ ] Configuration should be loaded from hodge.json
- [ ] Should work without any PM configuration (no-op mode)

## Approach-Specific Tests
- [ ] Enhanced hooks fire for decide, save, status commands
- [ ] Adapter registry allows multiple PM tools
- [ ] Workflow mappings are configurable
- [ ] Failed updates are queued for retry

## Integration Tests
- [ ] Should work with existing PMHooks class
- [ ] Should integrate with LocalPMAdapter
- [ ] Linear adapter should update issue status
- [ ] Should not break commands when PM fails

## Performance Criteria
- [ ] Response time < 200ms for typical operations
- [ ] Memory usage should not increase significantly
- [ ] Should handle concurrent operations
- [ ] Should scale to expected load

## User Experience
- [ ] Should provide clear error messages
- [ ] Should have appropriate loading states
- [ ] Should be intuitive to use
- [ ] Should work across supported browsers/platforms

## Notes
Add any specific test scenarios or edge cases discovered during exploration:

- Test PM updates when Linear API is down
- Test with multiple PM tools configured simultaneously
- Test that commands complete even if all PM updates fail
- Test configuration changes without restart
- Test hook middleware/plugin system if implemented

---
*Generated during exploration phase. Convert to actual tests during build phase.*