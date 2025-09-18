# Test Intentions for HODGE-052 - Auto-Save Context

## Purpose
Document what we intend to test for the auto-save context feature.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Should auto-save when switching from one feature to another
- [ ] Should show notification when auto-save occurs
- [ ] Should not auto-save when no feature is currently active
- [ ] Should not auto-save when switching to the same feature
- [ ] Should complete auto-save quickly (<100ms)
- [ ] Should handle auto-save failures gracefully

## Auto-Save Trigger Tests
- [ ] Should trigger on `hodge explore <new-feature>` when another feature is active
- [ ] Should trigger on `hodge build <new-feature>` when another feature is active
- [ ] Should trigger on `hodge harden <new-feature>` when another feature is active
- [ ] Should trigger on `hodge ship <new-feature>` when another feature is active
- [ ] Should NOT trigger on non-feature commands (init, status, etc.)

## Save Behavior Tests
- [ ] Should create save in `.hodge/saves/` directory
- [ ] Should use timestamp-based naming for auto-saves
- [ ] Should preserve all context files (exploration.md, decisions, etc.)
- [ ] Should update `.hodge/context.json` with new feature
- [ ] Should not overwrite manual saves

## Notification Tests
- [ ] Should display feature name being auto-saved
- [ ] Should display save location
- [ ] Should use appropriate color coding (yellow for auto-save)
- [ ] Should be concise (single line notification)

## Error Handling Tests
- [ ] Should handle disk full gracefully
- [ ] Should handle permission denied on save directory
- [ ] Should handle corrupted context.json file
- [ ] Should handle missing SessionManager
- [ ] Should continue with command even if auto-save fails

## Performance Tests
- [ ] Auto-save overhead should be <100ms
- [ ] Should not block command execution
- [ ] Should handle rapid feature switches (debouncing)
- [ ] Memory usage should not increase significantly

## Configuration Tests
- [ ] Should respect auto-save disabled setting (if implemented)
- [ ] Should log auto-saves if logging enabled
- [ ] Should work with custom save directories

## Integration Tests
- [ ] Should work with existing /save command
- [ ] Should work with /load command
- [ ] Should integrate with SessionManager correctly
- [ ] Should update HodgeMDGenerator context
- [ ] Should work with PM integration

## Edge Cases
- [ ] Switching to non-existent feature
- [ ] Switching from unsaved new feature
- [ ] Multiple concurrent hodge processes
- [ ] Auto-save during long-running command
- [ ] Circular feature switching (A→B→A)

## User Experience
- [ ] Should feel seamless and automatic
- [ ] Should not interrupt workflow
- [ ] Should provide confidence that work is saved
- [ ] Should be discoverable through notifications

## Notes
Discovered during exploration:
- Need to check if feature has unsaved changes
- Consider debouncing for rapid switches
- May need to add auto-save history/log
- Consider max auto-saves limit to prevent disk fill

---
*Test intentions for auto-save context feature. Convert to actual tests during build phase.*