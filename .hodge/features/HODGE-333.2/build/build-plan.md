# Build Plan: HODGE-333.2

## Feature Overview
**PM Issue**: HODGE-333.2 (linear)
**Status**: Build Complete - Ready for Harden
**Approach**: Frontmatter-Driven Profile Discovery

## Implementation Checklist

### Core Implementation
- [x] Extended frontmatter parser to support detection field
- [x] Created ProfileDiscoveryService (scans review-profiles/)
- [x] Created AutoDetectionService (evaluates detection rules)
- [x] Created ReviewConfigGenerator (generates .hodge/review-config.md)
- [x] Added applies_to glob detection support

### Integration
- [x] Removed --force flag from InitCommand
- [x] Integrated auto-detection into InitCommand.execute()
- [x] Added glob package dependency (with types)
- [x] Clean detection output display

### Placeholder Profiles Created
- [x] TypeScript (uses applies_to detection)
- [x] JavaScript (uses applies_to detection)
- [x] React (uses dependency detection)
- [x] Vitest (uses dependency detection)

### Quality Checks
- [x] Followed coding standards
- [x] Added comprehensive error handling
- [x] Graceful fallbacks for missing profiles
- [x] Smoke test for ProfileDiscoveryService (3 tests passing)

## Files Modified

**New Files**:
- `src/lib/profile-discovery-service.ts` - Scans and parses review profiles
- `src/lib/auto-detection-service.ts` - Evaluates detection rules and applies_to globs
- `src/lib/review-config-generator.ts` - Generates .hodge/review-config.md
- `src/lib/profile-discovery-service.smoke.test.ts` - Smoke tests (3 passing)
- `review-profiles/languages/typescript.md` - Placeholder profile
- `review-profiles/languages/javascript.md` - Placeholder profile
- `review-profiles/frameworks/react.md` - Placeholder profile
- `review-profiles/testing/vitest.md` - Placeholder profile

**Modified Files**:
- `src/lib/frontmatter-parser.ts` - Added DetectionRules interface and validation
- `src/commands/init.ts` - Removed --force flag, integrated auto-detection
- `src/lib/structure-generator.ts` - Removed force parameter
- `package.json` - Added glob and @types/glob dependencies

## Decisions Made

1. **applies_to as fallback detection**: If no explicit detection rules, use applies_to globs to check for matching files
2. **Graceful degradation**: Missing profiles or detection errors don't break initialization
3. **Clean output**: Show only detected technologies ("✓ TypeScript", "✓ React")
4. **Profile organization**: Created subdirectories (languages/, frameworks/, testing/, etc.)
5. **Detection flexibility**: Supports both explicit rules (files/dependencies) and implicit (applies_to)

## Testing Notes

**Smoke Tests**:
- ProfileDiscoveryService: 3 tests passing
- Tests discovery, registry structure, and detectable profiles count

**Manual Testing Needed**:
- Run `hodge init` in a TypeScript project
- Verify review-config.md is generated
- Check detection output shows correct technologies

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-333.2` for production readiness
