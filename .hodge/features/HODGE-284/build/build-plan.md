# Build Plan: HODGE-284 - Fix /decide Command Multiple Decisions

## Feature Overview
**PM Issue**: HODGE-284 (linear)
**Status**: In Progress
**Purpose**: Restore ability for /decide to gather and present multiple decisions

## Implementation Checklist

### Core Implementation
- [x] Update decide.md with Decision Categories Framework
- [x] Add requirement for recommended option in each decision
- [x] Update explore.md to document decisions needed
- [x] Write smoke tests for template changes

### Template Updates
- [x] Add primary source: current exploration decisions
- [x] Define 6 decision categories to always check
- [x] Add instruction to find at least 2-3 decisions
- [x] Require marking one option as "(Recommended)"
- [x] Add "Decisions Needed" section to exploration template

### Quality Checks
- [x] Follow existing template patterns
- [x] Maintain backward compatibility
- [x] Add clear instructions for AI
- [x] Include examples in templates

## Files Modified
- `.claude/commands/decide.md` - Added Decision Categories Framework and multiple decision gathering
- `.claude/commands/explore.md` - Added Decisions Needed documentation requirement
- `src/test/decide-command.smoke.test.ts` - Created smoke tests for template updates

## Decisions Made
1. **Decision Categories Framework** - Check 6 categories for comprehensive coverage
2. **Config in .hodge/config.json** - Protected branch patterns will go here
3. **Minimal fix approach** - Template updates only, no code changes
4. **Recommended option requirement** - Each decision must have one recommended choice

## Testing Notes
- All 6 smoke tests passing
- Tests verify Decision Categories Framework presence
- Tests confirm exploration as primary source
- Tests check for recommended option requirement

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-284` for production readiness
