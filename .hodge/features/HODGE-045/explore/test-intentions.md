# Test Intentions for HODGE-045

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] PM hooks should update without blocking ship command
- [ ] Silent failure pattern should prevent PM errors from failing ship
- [ ] Should complete PM update within 2 seconds
- [ ] Should handle missing PM configuration gracefully

## PM Adapter Requirements
- [ ] GitHub adapter should auto-detect repository from git remote
- [ ] Linear adapter should connect with valid API key
- [ ] Adapters should map hodge statuses to PM tool states
- [ ] Comment/label updates should include rich context

## Approach-Specific Tests
- [ ] GitHub Issues Integration should work with public/private repos
- [ ] Linear integration should handle team/workspace IDs
- [ ] Rich comments should format correctly in each PM tool

## Integration Tests
- [ ] Should work with current authentication system
- [ ] Should respect user permissions
- [ ] Should handle database transactions properly
- [ ] Should emit appropriate events/logs

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

-
-
-

---
*Generated during exploration phase. Convert to actual tests during build phase.*