# Build Plan: HODGE-306

## Feature Overview
**PM Issue**: HODGE-306 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create main component/module
- [x] Implement core logic
- [x] Add error handling
- [x] Include inline documentation

### Integration
- [x] Connect with existing modules
- [x] Update CLI/API endpoints
- [x] Configure dependencies

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns
- [x] Add basic validation
- [x] Consider edge cases

## Files Modified
- `.claude/commands/build.md` - Added PM issue check section before Command Execution
  - Check for PM mapping in id-mappings.json
  - Prompt user to create PM issue if unmapped
  - Guide to /plan command for single-issue creation
  - Non-blocking behavior (respects user agency)
- `.claude/commands/build.smoke.test.ts` - Created smoke tests for template changes

## Decisions Made
All decisions were made during /decide phase:
1. Template-Based Prompt Enhancement (zero code changes)
2. Check before calling `hodge build` CLI command
3. Reuse `/plan` command for single-issue creation
4. Show prompt every time /build is called without PM mapping
5. Proceed with build anyway if user ignores prompt (non-blocking)

## Testing Notes
Created 5 smoke tests:
- Verify PM issue check section exists in template
- Verify user prompt for unmapped features
- Verify /plan command reference for single issue creation
- Verify non-blocking behavior documentation
- Verify skip logic for already mapped features

All tests passing ✅

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-306` for production readiness
