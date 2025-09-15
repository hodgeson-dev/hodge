# Decision for interactive-ship-commits

**Date**: 2025-09-15
**Time**: 8:50:42 PM

## Decision
Use Progressive Enhancement approach for interactive ship commits with environment-specific optimizations

## Chosen Approach: Progressive Enhancement

### Core Strategy
Start with basic functionality and progressively add features based on environment capabilities:
1. Baseline: File-based interaction (works everywhere)
2. Enhanced: Interactive prompts (TTY environments)
3. Premium: Rich UI (Claude Code markdown, Warp workflows)
4. AI-Powered: Message enhancement (Cursor, Aider integration)

### Key Implementation Points

1. **Environment Detection**
   - Check for TTY, specific env vars, and tool markers
   - Graceful fallback chain
   - User can override via config

2. **Claude Code Gets Premium Experience**
   - Rich markdown-based UI in `.claude/commands/ship.md`
   - State persistence via JSON files
   - Better than terminal through tables, formatting, persistent context

3. **Per-Environment Optimizations**
   - **Warp**: Leverage workflows for repeatability
   - **Aider**: Cooperative mode to avoid conflicts
   - **Cursor**: AI enhancement for commit messages
   - **Continue.dev**: File-based with VS Code hints

4. **Universal Features**
   - Flags work everywhere: `--no-interactive`, `--edit`, `--message`, `--yes`
   - File-based protocol as common foundation
   - Intelligent commit type detection
   - Work log integration

## Rationale

This approach was chosen because:
1. **Universal compatibility** - Works in all environments
2. **Optimal UX** - Each environment gets its best possible experience
3. **Backwards compatible** - Existing workflows continue to work
4. **Future-proof** - Can add new environments without breaking changes
5. **Claude Code advantage** - Turns limitation into strength with rich markdown UI

## Status
This decision has been recorded in the main decisions file.

## Next Steps
1. Build the Progressive Enhancement implementation
2. Start with environment detection module
3. Implement file-based communication protocol
4. Create rich markdown UI for Claude Code
5. Test across all target environments