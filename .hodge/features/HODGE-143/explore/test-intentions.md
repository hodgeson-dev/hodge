# Test Intentions for PM Adapter Hooks Enhancement (HODGE-143)

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] PMHooks should be integrated in all workflow commands
- [ ] Each command should update PM status correctly
- [ ] PM updates should not block command execution
- [ ] Failed PM updates should be logged but not fail commands

## Command-Specific Requirements
### Explore Command
- [ ] Should call PMHooks.onExplore() when creating new features
- [ ] Should update feature status to "exploring"
- [ ] Should add feature to project_management.md if new
- [ ] Should handle existing features gracefully

### Build Command
- [ ] Should maintain existing PMHooks functionality
- [ ] Should call onPhaseStart() with 'build' phase
- [ ] Should update status to "building"

### Harden Command
- [ ] Should call PMHooks.onPhaseStart() with 'harden' phase
- [ ] Should update external PM to "in_review"
- [ ] Should update local status to "hardening"

### Ship Command
- [ ] Should call PMHooks.onShip() method
- [ ] Should update PM status to "done"
- [ ] Should move feature to completed section
- [ ] Should update phase progress in project_management.md

## Integration Tests
- [ ] PMHooks should work with LocalPMAdapter
- [ ] Should handle missing PM configuration gracefully
- [ ] Should support multiple PM tools (Linear, GitHub, Jira)
- [ ] Should not interfere with command's primary function

## External PM Integration
- [ ] Should detect PM tool from environment variables
- [ ] Should map workflow phases to PM statuses correctly
- [ ] Should handle API failures gracefully
- [ ] Should skip updates when credentials missing

## Performance Criteria
- [ ] PM updates should be non-blocking
- [ ] Should not add >100ms to command execution
- [ ] Should handle network timeouts properly
- [ ] Should cache PM state when appropriate

## Error Scenarios
- [ ] Should handle missing .hodge/pm-scripts directory
- [ ] Should handle invalid feature names
- [ ] Should handle file write failures
- [ ] Should handle concurrent PM updates

## Notes
Add any specific test scenarios or edge cases discovered during exploration:

- PM updates are fire-and-forget (non-blocking)
- External PM updates only happen if configured
- Local PM (project_management.md) always updates

---
*Generated during exploration phase. Convert to actual tests during build phase.*