# Build Plan: HODGE-377.4 - PM Comment Synchronization

## Feature Overview
**Status**: Build Phase - Foundation Complete
**No PM issue linked** (solo mode development)

## Implementation Checklist

### Core Implementation
- [x] Extend CommentGeneratorService for decision/blocker comments
- [x] Add abstract `appendComment` method to BasePMAdapter
- [x] Add `appendComment` implementation to LinearAdapter (delegates to existing addComment)
- [ ] Add `appendComment` implementation to GitHubAdapter
- [ ] Add `appendComment` implementation to LocalAdapter
- [ ] Add blocker field to ShipRecordData interface

### Integration
- [ ] Integrate comment generation into commands (deferred to harden phase)
- [ ] Add retry queue mechanism (deferred to harden phase)
- [ ] Configure PM config for blocker handling (deferred to harden phase)

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (CommentGeneratorService extension)
- [ ] Add smoke tests for new functionality
- [ ] Consider edge cases (deferred to harden phase)

## Files Modified
- `src/lib/pm/comment-generator-service.ts` - Added generateDecisionComment, generateShipComment, generateBlockerComment methods
- `src/lib/pm/base-adapter.ts` - Added abstract appendComment method
- `src/lib/pm/linear-adapter.ts` - Added appendComment implementation (delegates to addComment)

## Decisions Made
- **Decision 1**: Extend existing CommentGeneratorService instead of creating new PMCommentService
  - *Reasoning*: Avoids duplication, leverages existing infrastructure, simpler architecture
- **Decision 2**: Use method aliasing for LinearAdapter/GitHubAdapter (appendComment → addComment)
  - *Reasoning*: Both adapters already have addComment methods, no need to rename existing code
- **Decision 3**: Defer retry queue and command integration to harden phase
  - *Reasoning*: Build phase should establish foundation with smoke tests, full integration tested in harden phase

## Testing Notes
**Build Phase Testing** (smoke tests only):
- Test CommentGeneratorService.generateDecisionComment formats correctly
- Test CommentGeneratorService.generateShipComment includes all fields
- Test CommentGeneratorService.generateBlockerComment has warning emoji
- Test LinearAdapter.appendComment delegates to addComment
- Test LocalAdapter.appendComment writes to file (when implemented)

**Harden Phase Testing** (integration tests):
- Test full workflow: decision → comment → PM issue updated
- Test retry queue when PM unavailable
- Test blocker workflow end-to-end
- Test comment failures gracefully degrade

## Next Steps
After smoke tests pass:
1. Run `npm run test:smoke` to verify basic functionality
2. Check linting with `npm run lint`
3. Review changes and stage with `git add .`
4. Proceed to `/harden HODGE-377.4` for:
   - LocalAdapter.appendComment implementation
   - GitHubAdapter.appendComment alias
   - ShipRecordData blocker field
   - Command integrations
   - Retry queue mechanism
   - Full integration tests
