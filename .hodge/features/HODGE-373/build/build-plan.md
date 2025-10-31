# Build Plan: HODGE-373

## Feature Overview
No PM issue linked
**Status**: Complete ✅

## Implementation Checklist

### Core Implementation
- [x] Identify all boxes in explore.md template (2 found)
- [x] Apply compliance pattern to first box (Feature Discovery)
- [x] Apply compliance pattern to second box (Conversational Discovery)
- [x] Scan all 10 remaining command files for boxes (19 boxes total found)
- [x] Apply pattern to all 10 remaining command files
- [x] Write smoke tests to verify compliance
- [x] Document the pattern in .hodge/patterns/

### Integration
- [x] Pattern integrated into all slash command templates
- [x] No CLI/API changes needed (template-only change)
- [x] No new dependencies required

### Quality Checks
- [x] Smoke tests passing (5 tests)
- [x] Pattern documented for future use
- [x] All command files validated

## Files Modified

### Slash Command Templates (11 files)
- `.claude/commands/explore.md` - 2 boxes protected (Feature Discovery + Conversational Discovery)
- `.claude/commands/build.md` - 1 real box + 1 example box (Implementation Mode)
- `.claude/commands/checkpoint.md` - 1 box protected (Save Progress & Context)
- `.claude/commands/codify.md` - 2 boxes protected (Add Rules + Recommendation)
- `.claude/commands/decide.md` - 2 boxes protected (Decision Management + Decision N of M)
- `.claude/commands/harden.md` - 1 box protected (Production Readiness)
- `.claude/commands/hodge.md` - 2 boxes protected (Session Manager + Context Loading Complete)
- `.claude/commands/plan.md` - 2 boxes protected (Work Organization + Review & Approval)
- `.claude/commands/review.md` - 1 box protected (Advisory Code Review)
- `.claude/commands/ship.md` - 1 real box + 4 example boxes (Interactive Commit & Ship)
- `.claude/commands/status.md` - 1 box protected (Feature Overview)

### Tests
- `src/commands/template-compliance.smoke.test.ts` - NEW: 5 smoke tests verifying pattern compliance

### Documentation
- `.hodge/patterns/ai-template-compliance-pattern.md` - NEW: Pattern documentation with examples and validation

## Decisions Made
<!-- Document any implementation decisions -->
- **Two boxes in explore.md**: Discovered that explore.md has TWO boxes that need compliance patterns - the initial "Feature Discovery" box and the later "Conversational Discovery" box. Both now have the pattern applied.
- **Pattern must be applied before EACH box**: The compliance pattern must be placed immediately before every formatted box in a template, not just at the beginning of the file.
- **User tested the pattern**: User ran `/explore "This is just a test"` and discovered that the first box worked (with pattern) but the second box was replaced with markdown headers (no pattern). This validated the need for patterns before EVERY box.
- **Next step**: Need to scan all remaining command files for multiple boxes before applying patterns, to avoid missing any.

## Testing Notes
<!-- Notes for testing approach -->
- Test scenario 1
- Test scenario 2

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-373` for production readiness
