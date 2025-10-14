# Build Plan: HODGE-344.2

## Feature Overview
**PM Issue**: HODGE-344.2 (linear)
**Status**: Complete
**Title**: Review manifest generation with file scoping support

## Implementation Checklist

### Core Implementation
- [x] Create main component/module (review-report-saver.ts)
- [x] Implement core logic (enhanced manifest generator + report saver)
- [x] Add error handling (graceful directory creation, type-safe scope metadata)
- [x] Include inline documentation (JSDoc comments for all public functions)

### Integration
- [x] Connect with existing modules (extends ReviewManifestGenerator)
- [ ] Update CLI/API endpoints (deferred to HODGE-344.4)
- [x] Configure dependencies (types added to review-manifest.ts)

### Quality Checks
- [x] Follow coding standards (TypeScript strict mode, logger usage)
- [x] Use established patterns (TempDirectoryFixture for tests)
- [x] Add basic validation (scope metadata type checking)
- [x] Consider edge cases (empty file lists handled at caller level)

## Files Modified

### Core Implementation
- `src/lib/review-manifest-generator.ts` - Enhanced generateManifest() with optional fileList and scope parameters
- `src/types/review-manifest.ts` - Added ScopeMetadata interface and scope field to ReviewManifest
- `src/lib/review-report-saver.ts` - NEW: Standalone utility for saving review reports to .hodge/reviews/

### Tests
- `src/lib/review-manifest-generator.smoke.test.ts` - Added 4 smoke tests for file list and scope metadata
- `src/lib/review-report-saver.smoke.test.ts` - NEW: 12 smoke tests covering all report saver functionality

## Decisions Made

1. **Enhanced Manifest Generator** - Extended existing `generateManifest()` with optional `fileList` and `scope` parameters rather than creating separate generators. Maintains backward compatibility (no params = git diff mode) while supporting file-based reviews.

2. **Scope Metadata Schema** - Added `scope?: ScopeMetadata` field to ReviewManifest with type ('file' | 'directory' | 'commits' | 'feature'), target (string), and fileCount (number). Provides traceability for what was reviewed.

3. **Report Naming Convention** - Used timestamp-based naming `review-{YYYY-MM-DD-HHMMSS}.md` in `.hodge/reviews/` directory. Simple, sortable, avoids collisions.

4. **Standalone Utilities** - Built manifest generation and report saving as standalone, testable components without command integration. Enables clean composition in HODGE-344.3 (ReviewEngineService).

5. **Empty File List Handling** - Manifest generator assumes non-empty file lists. Empty list handling occurs at caller level using FileScopingError from HODGE-344.1.

6. **Test Strategy** - Smoke tests verify contracts (accepts file lists, scope metadata tracks correctly, report saving works). Integration testing deferred to HODGE-344.3 and HODGE-344.4.

## Testing Notes

### Smoke Tests (24 total - all passing)
- **Manifest Generator** (12 tests): Backward compatibility, file list support, scope metadata tracking (file/directory/commits/feature types), change analysis, context section, version filtering
- **Report Saver** (12 tests): Timestamp formatting, directory creation, report content (title/tier/sections), scope metadata rendering, path return

### Test Coverage
- All public APIs tested
- Edge cases covered (scope types, empty fields, timestamp formatting)
- Uses TempDirectoryFixture pattern for isolation
- No subprocess spawning (follows HODGE-319.1 standard)

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-344.2` for production readiness
