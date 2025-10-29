# Build Plan: HODGE-360

## Feature Overview
Streamline /harden File Generation - Consolidate critical files into review-manifest.yaml
**Status**: Implementation Complete

## Implementation Checklist

### Core Implementation
- [x] Update ReviewManifest TypeScript interface to include critical_files section
- [x] Add buildCriticalFilesSection method to ReviewManifestGenerator
- [x] Update generateManifest to accept and include critical files data
- [x] Add HODGE-360 comments for future maintainers

### Integration
- [x] Update ReviewEngineService to pass critical files to manifest generator
- [x] Remove critical-files.md generation from HardenReview
- [x] Update HardenReview display output
- [x] Update /harden slash command template

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns (service class pattern)
- [x] Add inline documentation with HODGE-360 markers
- [x] Consider backward compatibility (optional field)

## Files Modified

### TypeScript Types
- `src/types/review-manifest.ts` - Added CriticalFilesSection and CriticalFileEntry interfaces

### Core Services
- `src/lib/review-manifest-generator.ts` - Added critical_files section generation
- `src/lib/review-engine-service.ts` - Pass critical files to manifest generator

### CLI Commands
- `src/commands/harden/harden-review.ts` - Removed critical-files.md generation, updated output

### Templates
- `.claude/commands/harden.md` - Updated to reference manifest critical_files section

### Tests
- `src/lib/review-manifest-generator.smoke.test.ts` - Added 2 smoke tests for critical_files

## Decisions Made

1. **Optional Field**: Made critical_files optional in ReviewManifest for backward compatibility
2. **Data Structure**: Used structured YAML format matching exploration recommendations
3. **Removal Strategy**: Completely removed critical-files.md generation rather than deprecating
4. **Template Updates**: Updated /harden template references inline with code changes

## Testing Notes

### Smoke Tests Added
- Test that critical_files section is included when criticalFiles data is provided
- Test that critical_files section is omitted when not provided (backward compatibility)
- Tests verify correct structure: algorithm, total_files, top_n, files array with rank/score/risk_factors

### Test Results
- All 14 smoke tests passing (including 2 new HODGE-360 tests)
- No TypeScript errors
- Backward compatibility verified

## Next Steps
1. Run full test suite: `npm test`
2. Check for type errors: `npm run typecheck`
3. Review changes: `git diff --staged`
4. Proceed to `/harden HODGE-360` for production readiness
