# Exploration: Cross-Tool Compatibility

## Feature Overview
Enable Hodge to work seamlessly with any AI assistant tool (Claude, Cursor, Continue, Aider, etc.) through universal context files.

## Context
- **Date**: 2025-01-16
- **Related Discussion**: Extensive exploration of Hodge's next implementation phase
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 entries)
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-1-cross-tool-compatibility-priority-1`

## Problem Statement
Currently, Hodge works well with Claude through slash commands, but:
- Won't work with Cursor, Continue, Aider, or other AI tools
- Context is scattered across multiple directories
- No way for AI tools to see the full picture
- Each tool has different context file expectations

## Approaches Explored

### Approach 1: Tool-Specific Files
Generate separate files for each tool (CLAUDE.md, CURSOR.md, etc.)
- **Pros**: Each tool gets optimized format
- **Cons**: Duplication, maintenance burden, not scalable

### Approach 2: Universal HODGE.md (RECOMMENDED)
Single HODGE.md file with universal format, symlinks for compatibility
- **Pros**:
  - One source of truth
  - Works with all tools
  - Symlinks maintain compatibility
  - Easy to maintain
- **Cons**:
  - May lose some tool-specific optimizations
  - Need to manage symlinks

### Approach 3: Plugin Architecture
Build adapters for each AI tool
- **Pros**: Deep integration possible
- **Cons**: Complex, high maintenance, requires tool cooperation

## Recommended Approach: Universal HODGE.md

### Architecture
```
HodgeFileGenerator
├── Aggregates context from .hodge/features/
├── Generates HODGE.md with current state
├── Creates tool-specific symlinks
└── Called by every command automatically
```

### Implementation Details
1. **HodgeFileGenerator Class**
   - Location: `src/lib/hodge-file-generator.ts`
   - Aggregates context from all sources
   - Formats for universal readability
   - Writes to multiple locations

2. **HODGE.md Format**
   ```markdown
   # HODGE.md - Feature: {feature} ({mode} mode)
   ## Current State
   ## Commands
   ## Standards
   ## Recent Work
   ## TODOs
   ## For AI Assistants
   ```

3. **Integration Points**
   - Add to all existing commands (explore, build, harden, ship, decide, status)
   - Auto-regenerate on each command
   - Include tool-specific sections

### Key Decisions Made
1. ✅ Hybrid approach: Keep directories for storage, HODGE.md as aggregated view
2. ✅ HODGE.md as primary context file with symlinks
3. ✅ Auto-regeneration on each command (not manually edited)

## Test Intentions
- [ ] HODGE.md generates correctly with feature context
- [ ] Symlinks work for Claude compatibility
- [ ] All commands trigger regeneration
- [ ] Context aggregation includes all relevant sources
- [ ] Tool-specific sections render correctly
- [ ] Works with Claude, Cursor, Continue, Aider

## Dependencies
- No new dependencies needed
- Uses existing fs-extra for file operations
- Builds on existing command structure

## Next Steps
1. Build HodgeFileGenerator class
2. Add generation to all commands
3. Test with multiple AI tools
4. Document setup for each tool

## Related Features
- **Depends on**: None (foundational)
- **Enables**: session-management, all future features
- **Related**: pm-adapter-hooks (will use HODGE.md for context)

## References
- Implementation Plan: `IMPLEMENTATION_PLAN.md#phase-1`
- Decisions: `.hodge/decisions.md` (2025-01-16)
- Analysis: This exploration session