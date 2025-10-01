# Build Plan: HODGE-285

## Feature Overview
**PM Issue**: HODGE-285 (linear)
**Status**: In Progress
**Purpose**: Fix explore command to properly separate AI and CLI concerns

## Decisions Made
1. **Clear AI/CLI boundary** - CLI creates structure only, AI generates content
2. **Full scope** - Remove approach generation from CLI code
3. **Template-driven** - AI generates 2-3 approaches in slash command
4. **Manual testing** - Verify through actual /explore usage

## Implementation Checklist

### Core Implementation
- [x] Remove `generateApproaches` method from explore.ts
- [x] Remove approach generation logic from `generateSmartTemplate`
- [x] Update exploration.md template to be blank/minimal
- [x] Update explore.md slash command to generate approaches post-CLI

### Integration
- [x] Ensure CLI only creates file structure
- [x] Remove "1 suggested approach" messaging from CLI
- [x] Update AI context to not mention approach count
- [x] Test that exploration.md starts blank

### Quality Checks
- [x] Clear separation of concerns
- [x] No AI-like content generation in CLI
- [x] Template ready for AI to fill
- [x] Backward compatibility maintained

## Files Modified
- `src/commands/explore.ts` - Removed approach generation methods ✅
- `.claude/commands/explore.md` - Added approach generation instructions ✅
- `src/lib/claude-commands.ts` - Auto-updated from explore.md ✅
- `src/test/explore-no-approach-generation.smoke.test.ts` - Created smoke tests ✅

## Testing Notes
✅ **All smoke tests passing** (93 tests total)
- Created 5 specific smoke tests for HODGE-285
- Verified approach generation methods removed
- Verified template has AI placeholders
- Verified slash command has generation instructions

## Implementation Summary
Successfully separated AI and CLI concerns:
- CLI creates minimal template structure only
- AI generates all approaches and recommendations
- Clear boundary established between tools
- No breaking changes to existing functionality

## Next Steps
After implementation:
1. ✅ Run tests with `npm test` - PASSED
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-285` for production readiness
