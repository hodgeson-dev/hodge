# Test Intentions for HODGE-280 - Always Load Core Context

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] `/hodge` command should always load core context files
- [ ] Core context should load before any conditional logic
- [ ] Should complete within reasonable time (<500ms)
- [ ] Should handle missing context files gracefully

## Context Loading Requirements
- [ ] Should always load .hodge/HODGE.md regardless of parameters
- [ ] Should always load .hodge/standards.md regardless of parameters
- [ ] Should always load .hodge/decisions.md regardless of parameters
- [ ] Should always list .hodge/patterns/ directory regardless of parameters
- [ ] Core context should be available in all modes (standard, feature, list, recent)

## Command Mode Tests
- [ ] `/hodge` (no params) should load core context then standard mode
- [ ] `/hodge {{feature}}` should load core context then feature context
- [ ] `/hodge --list` should load core context then show saves
- [ ] `/hodge --recent` should load core context then load recent save
- [ ] Any new modes added should automatically get core context

## Error Handling
- [ ] Should handle missing HODGE.md gracefully
- [ ] Should handle missing standards.md gracefully
- [ ] Should handle missing decisions.md gracefully
- [ ] Should handle missing patterns directory gracefully
- [ ] Should continue execution even if some files are missing

## Performance Criteria
- [ ] Context loading should not add >100ms to command execution
- [ ] Should not load same file multiple times
- [ ] Should handle large context files efficiently
- [ ] Should not block on file I/O operations

## User Experience
- [ ] Context should be presented in consistent order
- [ ] Output should be clearly labeled (standards, decisions, patterns)
- [ ] Should not overwhelm user with duplicate information
- [ ] Feature-specific context should complement, not replace core context

## Integration Tests
- [ ] Should work with all existing hodge commands
- [ ] Should maintain backward compatibility
- [ ] Should not break existing workflows
- [ ] Should enhance context awareness across all modes

## Notes
Edge cases discovered during exploration:
- Core context might already be partially loaded by hodge status
- Need to ensure we don't duplicate output
- Consider caching mechanism for repeated loads in same session

---
*Generated during exploration phase. Convert to actual tests during build phase.*