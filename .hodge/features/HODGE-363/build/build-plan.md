# Build Plan: HODGE-363

## Feature Overview
No PM issue linked
**Status**: In Progress

## Implementation Checklist

### Core Implementation
- [x] Create TypeScript types for context manifest
- [x] Implement pattern metadata extraction service
- [x] Update ContextCommand to generate YAML manifest
- [x] Add error handling for missing files/directories
- [x] Include inline documentation

### Integration
- [x] Integrate PatternMetadataService with ContextCommand
- [x] Use existing ArchitectureGraphService for graph statistics
- [x] Update ContextCommand execute flow to generate YAML by default
- [x] Maintain backward compatibility for --list, --recent, --todos flags

### Quality Checks
- [x] Follow coding standards (TypeScript strict mode, ESLint)
- [x] Use established patterns (TempDirectoryFixture for tests)
- [x] Add comprehensive smoke tests
- [x] Consider edge cases (missing patterns, no graph, no feature)

## Files Modified

### Created Files
- `src/types/context-manifest.ts` - TypeScript types for YAML manifest structure
- `src/lib/pattern-metadata-service.ts` - Service to extract pattern titles/overviews
- `src/commands/context.smoke.test.ts` (added tests) - 7 new smoke tests for YAML manifest generation

### Modified Files
- `src/commands/context.ts` - Added YAML manifest generation (lines 4-257)
  - New imports: yaml, PatternMetadataService, ContextManifest types
  - Modified execute() to call generateManifest() by default
  - Added generateManifest(), buildGlobalFiles(), buildPatternsSection(), buildArchitectureGraphSection(), buildFeatureContext(), discoverFeatureFiles()

- `.claude/commands/hodge.md` - Updated /hodge template (lines 31-90)
  - Replaced hardcoded bash commands with `hodge context` call
  - Added YAML manifest parsing instructions for AI
  - Simplified context loading workflow

## Decisions Made

1. **YAML manifest over legacy output**: Default mode generates YAML for AI consumption, special flags (--list, --recent, --todos) use legacy console output

2. **console.log for YAML, logger for pino**: YAML output goes to stdout via console.log, logger.info() writes to pino files for debugging

3. **extractYaml helper in tests**: Tests capture console.log output and filter out logger messages to extract pure YAML

4. **Pattern overview truncation**: Truncate pattern overviews to 200 characters for token efficiency while maintaining usefulness

5. **Architecture graph counting logic**: Count nodes by dividing quoted strings by 2 (each node appears twice in DOT format)

## Testing Notes

### Smoke Tests (7 new tests)
1. Valid YAML manifest generation
2. Global files with availability status
3. Pattern metadata extraction (title + overview)
4. Architecture graph statistics inclusion
5. Feature context file discovery (recursive)
6. Graceful handling of missing patterns directory
7. README.md exclusion from patterns list

### Test Coverage
- Pattern parsing with # Title and ## Overview sections
- File status tracking (available vs not_found)
- Session-aware feature detection
- YAML parsing and validation
- Edge cases (empty directories, missing files)

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-363` for production readiness
