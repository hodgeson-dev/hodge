# Build Context: HOD-20

## Feature: Create explore/build/harden commands
**Status**: In Progress
**Approach**: Lightweight Command Pattern

## Implementation Plan

### Technical Approach
Following the established init command pattern:
- Each command as a separate class in `src/commands/`
- Direct file system operations for mode context
- Shared PM integration utilities
- Clear console output for AI/user guidance

### Files to Create/Modify

1. **New Command Classes**:
   - `src/commands/explore.ts` - ExploreCommand class
   - `src/commands/build.ts` - BuildCommand class
   - `src/commands/harden.ts` - HardenCommand class

2. **Test Files**:
   - `src/commands/explore.test.ts`
   - `src/commands/build.test.ts`
   - `src/commands/harden.test.ts`

3. **Modified Files**:
   - `src/bin/hodge.ts` - Wire up new commands

### Key Implementation Details

- **Consistent Pattern**: Match InitCommand structure exactly
- **PM Integration**: Reuse existing PM adapter pattern
- **File Structure**: Create mode-specific directories under `.hodge/features/`
- **Output Format**: Clear, AI-friendly console output
- **Error Handling**: Graceful failures with helpful messages

### Standards to Follow
- TypeScript with strict typing
- Commander.js action handlers
- Async/await pattern
- Chalk for colored output
- Comprehensive unit tests