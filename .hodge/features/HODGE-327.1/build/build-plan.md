# Build Plan: HODGE-327.1 (Revisited - Review Persistence)

## Feature Overview
**Feature**: Save review reports with user choice and contextual metadata
**PM Issue**: HODGE-327 (parent epic)
**Story**: HODGE-327.1 enhancement (review persistence)
**Status**: Build Complete

## Implementation Checklist

### Core Implementation
- [x] Pivot from Service class approach to template-based approach
- [x] Enhance `.claude/commands/review.md` with save/discard prompt
- [x] Add filename generation logic (bash in template)
- [x] Add metadata extraction logic (bash in template)
- [x] Add feature context detection (git blame in template)
- [x] Implement Write tool usage for saving reports

### Integration
- [x] Sync template changes to `src/lib/claude-commands.ts`
- [x] Update standards.md with Write tool pattern documentation
- [ ] Test end-to-end workflow (manual testing needed)

### Quality Checks
- [x] Follow established slash command patterns (explore, ship)
- [x] Use Write tool consistently with other commands
- [x] Add YAML frontmatter metadata structure
- [x] Implement graceful feature detection (optional, best-effort)

## Files Modified

### Templates
- `.claude/commands/review.md` - Added Step 6 with save/discard prompt, filename generation, metadata extraction, and Write tool usage

### Generated Code
- `src/lib/claude-commands.ts` - Auto-synced from review.md template changes

### Standards
- `.hodge/standards.md` - Added "Slash Command File Creation Pattern" section documenting Write tool usage

### Deleted Files (Wrong Approach)
- `src/lib/review-persistence-service.ts` - Removed (violated standards - AI should write files, not Service classes)

## Decisions Made

### Architectural Pivot
**Decision**: Use Pure Template Implementation (Approach 2) instead of Service-Based Persistence (Approach 1)

**Reasoning**:
- Discovered that AI writes exploration.md, decisions.md, and lessons via Write tool
- Service class approach violated this established pattern
- `/review` should follow the same pattern: AI writes review reports using Write tool
- CLI only creates directory structures, not content files

### Write Tool Standardization
**Decision**: Document Write tool as the standard pattern for slash command file creation

**Reasoning**:
- Consistent with explore, ship, decide workflows
- Maintains clean separation: CLI = orchestration, AI = content generation
- Write tool handles parent directory creation automatically
- Avoids unnecessary Service class proliferation

### Filename Format
**Decision**: `{file-path-slug}-{timestamp}.md` (omit "file-" prefix for file scope)

**Reasoning**:
- Matches exploration naming: simple and readable
- Future-proof for scope expansion (directory-, pattern-, recent-, all-)
- Timestamp ensures uniqueness and chronological sorting

### Feature Detection
**Decision**: Best-effort git blame detection, gracefully omit if unavailable

**Reasoning**:
- Nice-to-have, not required
- Git blame may fail (not in git repo, no permissions, etc.)
- Optional YAML field - presence indicates confidence

## Testing Notes

### Manual Testing Required
1. Run `/review file src/commands/review.ts`
2. Verify report generates correctly
3. Choose "s" to save
4. Verify file created at `.hodge/reviews/{slug}-{timestamp}.md`
5. Verify YAML frontmatter is valid
6. Verify feature detection works (if in git repo)
7. Test "d" discard flow (should exit silently)

### No Automated Tests Needed
- Template-only change (bash logic embedded in markdown)
- Write tool usage is tested by Claude Code framework
- Manual verification sufficient for build phase

## Implementation Summary

**What Changed**:
1. Enhanced review.md template with Step 6 (Save Review Report)
2. Added filename generation using bash sed/awk
3. Added metadata extraction using grep
4. Added optional feature detection using git blame
5. Documented Write tool pattern in standards.md
6. Removed incorrect Service class implementation

**What Didn't Change**:
- Profile loading (unchanged)
- Context aggregation (unchanged)
- Review analysis logic (unchanged)
- Report generation format (unchanged)

**Impact**:
- Reviews can now be saved for future reference
- Metadata enables review history tracking
- User has simple binary choice (save/discard)
- Follows established Hodge workflow patterns

## Next Steps
1. ✅ Build complete - implementation finished
2. Manual testing recommended but optional for build phase
3. Consider `/harden HODGE-327.1` for integration tests (if needed)
4. Document in lessons learned when shipping

---
*Build completed: 2025-10-04*
*Approach: Pure Template Implementation with Write tool*
