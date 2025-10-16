# Build Plan: HODGE-346.1 - Standards validation and review profile creation

## Feature Overview
**Story**: HODGE-346.1 (Epic: HODGE-346 - Unified UX for Claude Code slash commands)
**Title**: Standards validation and review profile creation
**Status**: Completed

## Implementation Checklist

### Core Implementation
- [x] Validate UX design against existing standards/principles/decisions/patterns
- [x] Create UX review profile YAML (.hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml)
- [x] Create UX review profile markdown documentation (.hodge/review-profiles/ux-patterns/claude-code-slash-commands.md)
- [x] Write smoke tests for profile validation
- [x] Fix YAML parsing issues (block scalars for multiline examples, escaped apostrophes)

### Quality Checks
- [x] All 10 smoke tests passing
- [x] YAML is valid and parseable
- [x] Profile follows review-profile-pattern.md format
- [x] Documentation includes validation checklist
- [x] No conflicts with existing standards found

## Files Created

### Review Profile Files
- `.hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml` (175 lines)
  - Meta section with version, category, applies_to
  - 15 rules (8 MANDATORY, 7 SUGGESTED)
  - Covers all aspects of Conversational Companion UX design

- `.hodge/review-profiles/ux-patterns/claude-code-slash-commands.md` (513 lines)
  - Complete documentation of UX design system
  - Detailed explanation of each rule with examples
  - Validation checklist
  - Confirmation of no conflicts with existing standards
  - Cross-references to related patterns

### Test Files
- `src/lib/ux-profile-validation.smoke.test.ts` (146 lines)
  - 10 smoke tests covering profile validation
  - File existence checks
  - YAML parsing validation
  - Required fields verification
  - Mandatory rules verification
  - Documentation completeness checks

## Decisions Made

1. **YAML Format**: Used block scalars (`|`) for multiline examples instead of escaped newlines
   - **Reasoning**: More readable, easier to maintain, prevents parsing errors

2. **Apostrophe Escaping**: Doubled single quotes in guidance strings (e.g., `Don't` → `Don''t`)
   - **Reasoning**: YAML single-quote escaping requirement

3. **Rule Structure**: 8 MANDATORY + 7 SUGGESTED rules
   - **Reasoning**: Core visual patterns are blockers, intelligence features are suggestions

4. **Profile Location**: `.hodge/review-profiles/ux-patterns/` category
   - **Reasoning**: Follows existing category structure (languages, frameworks, testing, ux-patterns)

5. **Test Coverage**: 10 smoke tests, not integration tests
   - **Reasoning**: Build phase only requires smoke tests; integration tests come in harden phase

## Standards Validation Results

✅ **No conflicts found** with existing documentation:
- `.hodge/standards.md` - Slash command patterns compatible
- `.hodge/principles.md` - File not found
- `.hodge/decisions.md` - No UX-related decisions
- `.hodge/patterns/interactive-next-steps.md` - Compatible, enhancement opportunity

## Testing Results

All 10 smoke tests passing (36ms execution):
- ✅ Profile YAML file exists
- ✅ Profile markdown documentation exists
- ✅ Profile YAML is valid and parseable
- ✅ Profile has required meta fields
- ✅ Profile contains mandatory UX rules
- ✅ All rules have required fields
- ✅ Mandatory rules use BLOCKER or WARNING severity
- ✅ Profile markdown documentation is comprehensive
- ✅ Profile validates against existing standards
- ✅ Profile rules include examples for complex patterns

## Next Steps

Story HODGE-346.1 is complete and ready to ship. Next steps:

1. Run full quality checks: `npm run quality`
2. Stage all changes: `git add .`
3. Proceed to `/harden HODGE-346.1` to add integration tests
4. After hardening passes, proceed to `/ship HODGE-346.1`
5. Then continue epic with HODGE-346.2 (Core visual language patterns)
