# Build Plan: HODGE-344.1

## Feature Overview
**PM Issue**: HODGE-344.1 (linear)
**Status**: Completed
**Feature**: Git file scoping utilities with all three scope methods

## Implementation Checklist

### Core Implementation
- [x] Create `FileScopingError` custom error class
- [x] Implement `validateFile()` function
- [x] Implement `getFilesInDirectory()` function
- [x] Implement `getFilesFromLastNCommits()` function
- [x] Add error handling for expected and unexpected failures
- [x] Include comprehensive inline documentation

### Integration
- [x] Added functions to existing `src/lib/git-utils.ts`
- [x] Follows existing patterns (`execAsync`, async functions returning `Promise<string[]>`)
- [x] Exports all new functions and error class

### Quality Checks
- [x] Followed coding standards (TypeScript strict mode)
- [x] Used established patterns from existing `git-utils.ts`
- [x] Added validation for all inputs
- [x] Handled edge cases (empty results, invalid paths, git failures)
- [x] Added warning for large N values (> 100 commits)

## Files Modified
- `src/lib/git-utils.ts` - Added 4 exports:
  - `FileScopingError` class for expected "no files found" cases
  - `validateFile(filePath)` - Validates single file exists and is git-tracked
  - `getFilesInDirectory(directory)` - Gets all git-tracked files in directory recursively
  - `getFilesFromLastNCommits(count)` - Gets files from last N commits (excluding deleted)
- `src/lib/git-file-scoping.smoke.test.ts` - Created smoke tests (9 tests, all passing)

## Decisions Made
1. **Error Handling Strategy**: Use `FileScopingError` for expected "no files found" cases, allowing callers to catch with `instanceof` and provide user-friendly messages with exit code 0
2. **Function Signatures**: All functions return `Promise<string[]>` matching existing `git-utils` pattern
3. **Git Commands**:
   - `validateFile`: Uses `git ls-files` to check if file is tracked
   - `getFilesInDirectory`: Uses `git ls-files <directory>` (respects `.gitignore` automatically)
   - `getFilesFromLastNCommits`: Uses `git log --diff-filter=d` to exclude deleted files
4. **Large N Warning**: Log warning when N > 100 but still process (no hard limit)
5. **File Locations**: Added functions at end of `git-utils.ts` to maintain organization

## Testing Notes
**Smoke Tests Created** (9 tests, all passing):
1. FileScopingError is proper custom error class
2. validateFile is a function with correct signature
3. validateFile returns Promise resolving to string array
4. getFilesInDirectory is a function with correct signature
5. getFilesInDirectory returns Promise resolving to string array
6. getFilesFromLastNCommits is a function with correct signature
7. getFilesFromLastNCommits returns Promise resolving to string array
8. validateFile rejects with FileScopingError for non-existent file
9. getFilesInDirectory rejects with FileScopingError for empty directory

**Test Results**: ✅ All 9 smoke tests passing (71ms total)

**Integration Tests**: Will be added in HODGE-344.2 when these utilities are integrated with the review command

## Implementation Summary

Successfully implemented three git file scoping functions following the exploration recommendations:

- **FileScopingError**: Custom error class enables type-safe error handling
- **validateFile()**: Validates single file exists and is git-tracked
- **getFilesInDirectory()**: Gets git-tracked files in directory (respects `.gitignore`)
- **getFilesFromLastNCommits()**: Gets files from last N commits (excludes deleted, includes merges)

All functions follow existing `git-utils.ts` patterns and include comprehensive error handling and documentation.

## Next Steps
1. ✅ Run tests - Done (9/9 passing)
2. ⏭️ Check linting with `npm run lint`
3. ⏭️ Stage changes with `git add .`
4. ⏭️ Proceed to `/harden HODGE-344.1` for integration tests and production readiness
