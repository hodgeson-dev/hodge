# Test Intentions for Context-Aware Workflow Commands (HODGE-054)

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Commands should read feature from context.json when no argument provided
- [ ] Commands should use explicit feature argument when provided
- [ ] Should maintain backward compatibility (existing scripts still work)
- [ ] Should handle missing context.json gracefully

## Context Reading Behavior
- [ ] `hodge build` without argument should use current feature from context
- [ ] `hodge build HODGE-123` should override context and use HODGE-123
- [ ] Should show clear error when no context and no argument provided
- [ ] Should auto-save context when switching features (integration with HODGE-052)

## Command-Specific Tests
### Explore Command
- [ ] Should save feature to context.json when executed
- [ ] Should update existing context when switching features
- [ ] Should trigger auto-save when switching

### Build Command
- [ ] Should read feature from context when no argument
- [ ] Should accept explicit feature argument
- [ ] Should update context when feature changes
- [ ] Should maintain mode as "build" in context

### Harden Command
- [ ] Should read feature from context when no argument
- [ ] Should accept explicit feature argument
- [ ] Should update context when feature changes
- [ ] Should maintain mode as "harden" in context

### Ship Command
- [ ] Should read feature from context when no argument
- [ ] Should accept explicit feature argument
- [ ] Should update context when feature changes
- [ ] Should maintain mode as "ship" in context

## Integration Tests
- [ ] Should work with auto-save feature (HODGE-052)
- [ ] Should work with session manager
- [ ] Should work with PM tool integration
- [ ] Status command should show current context

## Error Handling
- [ ] Should provide helpful error when no context exists
- [ ] Should handle corrupted context.json gracefully
- [ ] Should handle file permission errors
- [ ] Should not break if context.json is manually deleted

## User Experience
- [ ] Workflow should feel seamless (explore → build → harden → ship)
- [ ] Error messages should guide users on what to do
- [ ] Should reduce repetitive typing of feature IDs
- [ ] Should support both beginners (context) and power users (explicit)

## Edge Cases
- [ ] Running `hodge build` in a fresh project (no context)
- [ ] Switching between multiple features rapidly
- [ ] Context.json manually edited with invalid data
- [ ] Running commands in directories without .hodge structure
- [ ] Concurrent command execution (race conditions)

## Performance Criteria
- [ ] Context reading should add <50ms to command startup
- [ ] Should not impact command performance
- [ ] Context file should remain small (<10KB)

## Notes
- Context-aware behavior should feel natural and intuitive
- Error messages are critical for guiding users
- Backward compatibility is essential for existing workflows

---
*Generated during exploration phase. Convert to actual tests during build phase.*