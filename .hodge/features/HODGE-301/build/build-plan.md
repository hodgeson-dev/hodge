# Build Plan: HODGE-301

## Feature Overview
**PM Issue**: HODGE-301 (linear)
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create main component/module - Enhanced .claude/commands/plan.md template
- [x] Implement core logic - Added vertical slice validation guidance
- [x] Add error handling - Included warning/fallback mechanisms in template
- [x] Include inline documentation - Extensive examples and decision trees

### Integration
- [x] Connect with existing modules - Integrated with existing /plan workflow
- [x] Update CLI/API endpoints - No CLI changes needed (AI-driven approach)
- [x] Configure dependencies - No new dependencies required

### Quality Checks
- [x] Follow coding standards - Template follows markdown standards
- [x] Use established patterns - Follows existing slash command template patterns
- [x] Add basic validation - Added validation guidelines for AI
- [x] Consider edge cases - Included fallback to single issue

## Files Modified
- `.claude/commands/plan.md` - Added comprehensive vertical slice guidance
  - Added "What is a Vertical Slice?" section
  - Added vertical slice criteria (moderate standard)
  - Added good vs bad story examples (horizontal vs vertical slicing)
  - Added vertical slice decision tree (4-step validation)
  - Updated AI workflow with validation steps
  - Updated Important Notes section
- `src/commands/plan.test.ts` - Added smoke tests for template validation
  - Added test to verify vertical slice guidance exists
  - Added test to verify Important Notes updated

## Decisions Made
- **AI-driven approach**: No programmatic validation code, rely on AI following template guidance
- **Moderate criteria**: Balance between strict enforcement and flexibility
- **Warn-only validation**: Informational warnings during plan generation, no blocking
- **Auto-convert fallback**: Suggest single issue when vertical slicing not feasible
- **Extensive documentation**: Comprehensive examples and decision trees to guide AI

## Testing Notes
- Smoke tests verify template content is present and correct
- All 8 smoke tests passing (6 existing + 2 new template validation tests)
- Tests verify:
  - Vertical slice terminology exists
  - Criteria defined (stakeholder value + independently testable)
  - Good/bad examples present
  - Decision tree included
  - AI workflow updated with validation
  - Important Notes section enhanced

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-301` for production readiness
