# Exploration: HODGE-344.1

## Feature Overview
**PM Issue**: HODGE-344.1
**Parent Feature**: HODGE-344 (Unified review workflow with auto-fix and flexible file scoping)
**Type**: sub-feature
**Created**: 2025-10-14T04:38:00.000Z

## Title
Git file scoping utilities with all three scope methods

## Problem Statement

The unified review workflow (HODGE-344) requires git-aware file selection for three distinct scopes: single file validation (`--file`), directory traversal (`--directory`), and commit history analysis (`--last N`). These utilities must intelligently handle edge cases (deleted files, renames, merges, empty results) and provide clear, actionable error messages when no files are found. Without these foundational utilities, the remaining stories in HODGE-344 cannot implement their file scoping features.

## Parent Context

**Parent Epic**: HODGE-344 established the need for flexible file scoping with three methods:
- `--file path.ts` - Review single file
- `--directory src/lib/` - Review all git-tracked files recursively using `git ls-files`
- `--last N` - Review files from last N commits using `git log --diff-filter=d`

**Key Parent Decisions**:
- Use `git ls-files <directory>` for directory scoping (respects `.gitignore` automatically)
- Exclude deleted files from `--last N` using `git log --diff-filter=d`
- Include merge commits (they represent real changes)
- Handle empty file lists gracefully with helpful messages explaining why
- Binary files handled naturally by tools (no special validation needed in utilities)

**Story Position**: HODGE-344.1 is the first story in Lane 1 (Core Infrastructure) with no dependencies. All other stories depend on these utilities.

## Conversation Summary

We explored implementing three git utility functions in `src/lib/git-utils.ts` following the existing codebase patterns:

**Function Patterns**: All functions follow the existing `git-utils.ts` style:
- Async functions returning `Promise<string[]>`
- Use `execAsync` from `child_process` for consistency
- Exported functions (not class-based)
- Descriptive error messages with helpful context

**Error Handling Strategy**: Decided to use a custom `FileScopingError` class to distinguish expected "no files found" cases from unexpected git command failures. This allows callers (CLI/slash commands) to:
- Catch `FileScopingError` and display user-friendly messages with exit code 0
- Let other errors bubble up as actual failures requiring investigation

**Single File Validation**: Simple validation checking:
- File exists in the filesystem
- File is tracked by git (using `git ls-files`)
- Binary detection left to tools (not utility responsibility)

**Commit History Limits**: No hard limit on `--last N` to maintain flexibility, but warn when N > 100 to set user expectations about processing time. Let git handle any issues with extremely large values naturally.

**Edge Case Handling**:
- Deleted files: Excluded automatically via `git log --diff-filter=d`
- Renamed files: Git handles automatically (shows new path)
- Merge commits: Included by default (represent real changes)
- Empty results: Throw `FileScopingError` with descriptive message

## Implementation Approaches

### Approach 1: Three Separate Functions with Shared Error Class (Recommended)

**Description**: Implement three focused functions in `src/lib/git-utils.ts` - `validateFile()`, `getFilesInDirectory()`, and `getFilesFromLastNCommits()` - each handling one scope method. All three share a common `FileScopingError` class for consistent error handling and use the existing `execAsync` pattern.

**Pros**:
- Clear separation of concerns (one function per scope method)
- Easy to test each method independently
- Follows existing `git-utils.ts` patterns (like `getStagedFiles()`, `stageFiles()`)
- Custom error class enables type-safe error handling in callers
- Simple, maintainable API without over-abstraction

**Cons**:
- Some code duplication in error handling across functions
- Three separate functions instead of unified interface
- Callers need to know which function to call for each scope

**When to use**: When simplicity and clarity are prioritized over abstraction, and when following established codebase patterns is important for maintainability.

### Approach 2: Unified File Scoping Service Class

**Description**: Create a `FileScopingService` class that encapsulates all three scoping methods behind a unified interface. The class handles git command execution, error handling, and logging internally, providing methods like `scopeByFile()`, `scopeByDirectory()`, and `scopeByCommits()`.

**Pros**:
- Unified interface for all scoping operations
- Easier to add new scoping methods in future
- Can share common logic (git command execution, error handling) internally
- Could add features like caching or batch operations later

**Cons**:
- Breaks from existing `git-utils.ts` function-based pattern
- Adds unnecessary abstraction for relatively simple operations
- Callers need to instantiate the service (or use singleton)
- More complex testing (mocking class methods vs functions)
- Over-engineered for current requirements

**When to use**: When you anticipate significant expansion of scoping capabilities or need shared state across multiple scoping operations.

### Approach 3: Single Function with Mode Parameter

**Description**: Implement a single `getFilesInScope(mode, target)` function that accepts a mode parameter (`'file' | 'directory' | 'commits'`) and a target (file path, directory path, or commit count). The function internally dispatches to appropriate git commands based on the mode.

**Pros**:
- Single entry point for all scoping operations
- Easier to document (one function signature)
- Could enable dynamic mode selection at runtime
- Less duplication in error handling

**Cons**:
- Less type-safe (target could be string or number depending on mode)
- More complex implementation with conditional logic
- Harder to test (need to test all modes through one function)
- Doesn't follow existing `git-utils.ts` pattern of focused functions
- Unclear API (what does `getFilesInScope('commits', 'src/')` mean?)

**When to use**: When you need runtime mode selection or want to minimize the number of exported functions.

## Recommendation

**Approach 1: Three Separate Functions with Shared Error Class** is recommended.

**Rationale**:
1. **Consistency with Existing Code**: The `git-utils.ts` file already uses focused, exported functions (`getStagedFiles()`, `stageFiles()`, `getCurrentBranch()`, etc.). Adding three more functions in the same style maintains consistency.

2. **Simplicity and Clarity**: Each function has a clear, single purpose. Callers know exactly what they're getting: `validateFile()` validates a file, `getFilesInDirectory()` gets directory files, etc.

3. **Type Safety**: Each function has specific parameter types and return types. No ambiguity about what parameters mean or what gets returned.

4. **Testability**: Each function can be tested independently with focused test cases. No need to test mode combinations or conditional logic.

5. **Proper Error Handling**: The `FileScopingError` class enables callers to distinguish expected "no files found" cases (user-friendly message, exit 0) from unexpected git failures (log and investigate).

6. **No Over-Engineering**: This is foundational infrastructure. Keep it simple and focused. If future requirements emerge (caching, batch operations, etc.), we can refactor then with clear requirements.

**Implementation Details**:
```typescript
// Custom error class for expected "no files found" cases
export class FileScopingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileScopingError';
  }
}

// Validate single file exists and is git-tracked
export async function validateFile(filePath: string): Promise<string[]>

// Get all git-tracked files in directory (recursive)
export async function getFilesInDirectory(directory: string): Promise<string[]>

// Get files modified in last N commits (excluding deleted files)
export async function getFilesFromLastNCommits(count: number): Promise<string[]>
```

## Test Intentions

### 1. Single File Validation - Valid File
**Intent**: Verify that `validateFile()` returns a single-element array for valid git-tracked files.

**Verification**:
- Create a git-tracked file in test directory
- Call `validateFile('path/to/file.ts')`
- Expect `['path/to/file.ts']` returned
- No errors thrown

### 2. Single File Validation - Non-Existent File
**Intent**: Verify that `validateFile()` throws `FileScopingError` with helpful message for non-existent files.

**Verification**:
- Call `validateFile('missing.ts')` with non-existent file
- Expect `FileScopingError` thrown
- Error message contains "File not found or not git-tracked"
- Can catch with `instanceof FileScopingError`

### 3. Single File Validation - Untracked File
**Intent**: Verify that `validateFile()` throws `FileScopingError` for files that exist but aren't git-tracked.

**Verification**:
- Create file in test directory but don't add to git
- Call `validateFile('untracked.ts')`
- Expect `FileScopingError` thrown
- Error message contains "not git-tracked"

### 4. Directory Traversal - Valid Directory
**Intent**: Verify that `getFilesInDirectory()` returns all git-tracked files recursively.

**Verification**:
- Create directory with multiple git-tracked files and subdirectories
- Call `getFilesInDirectory('src/lib/')`
- Expect array of all tracked files in `src/lib/` and subdirectories
- Files in `.gitignore` excluded automatically

### 5. Directory Traversal - Empty Directory
**Intent**: Verify that `getFilesInDirectory()` throws `FileScopingError` for directories with no git-tracked files.

**Verification**:
- Create empty directory or directory with only ignored files
- Call `getFilesInDirectory('empty/')`
- Expect `FileScopingError` thrown
- Error message contains "No git-tracked files in directory"

### 6. Commit History - Valid Commit Count
**Intent**: Verify that `getFilesFromLastNCommits()` returns files from last N commits, excluding deleted files.

**Verification**:
- Create test repository with multiple commits
- Call `getFilesFromLastNCommits(3)`
- Expect array of files modified in last 3 commits
- Deleted files not included (verify with commit that deletes a file)
- Renamed files show as new path

### 7. Commit History - No Commits
**Intent**: Verify that `getFilesFromLastNCommits()` throws `FileScopingError` when repository has no commits or N exceeds commit count.

**Verification**:
- Test with brand new repository (0 commits)
- Call `getFilesFromLastNCommits(5)`
- Expect `FileScopingError` thrown
- Error message contains "No commits found" or similar

### 8. Commit History - Large N Warning
**Intent**: Verify that `getFilesFromLastNCommits()` logs a warning when N > 100 but still processes the request.

**Verification**:
- Call `getFilesFromLastNCommits(500)`
- Expect warning logged (can verify via logger mock)
- Function still returns results (doesn't reject)
- Warning message mentions processing time

### 9. Error Handling - Git Command Failure
**Intent**: Verify that unexpected git command failures throw regular `Error` (not `FileScopingError`) for proper error handling.

**Verification**:
- Mock `execAsync` to simulate git command failure (e.g., git not installed)
- Call any of the three functions
- Expect regular `Error` thrown (not `FileScopingError`)
- Error message contains git failure details

### 10. Edge Cases - Merge Commits Included
**Intent**: Verify that `getFilesFromLastNCommits()` includes files from merge commits.

**Verification**:
- Create test repository with merge commit
- Call `getFilesFromLastNCommits()` spanning the merge
- Expect files from merge commit included in results
- Verify with assertion on known merge commit files

## Decisions Decided During Exploration

1. **Custom Error Class**: Use `FileScopingError` class for expected "no files found" cases, allowing callers to distinguish from unexpected git command failures with `instanceof` checks. Enables user-friendly messaging with exit 0 for empty results.

2. **Function Pattern Consistency**: Follow existing `git-utils.ts` patterns - async functions returning `Promise<string[]>`, using `execAsync`, exported functions (not class-based), with descriptive error messages and helpful context.

3. **Single File Validation Scope**: Validation checks only file exists + git-tracked. Binary detection and other file type concerns left to tools (not utility responsibility).

4. **Commit History Limits**: No hard limit on `--last N` to maintain flexibility, but log warning when N > 100 to set user expectations about processing time. Let git handle any issues with extremely large N values naturally.

5. **Error Message Strategy**: Throw `FileScopingError` with descriptive messages explaining why no files found (no commits, no tracked files, file not found) rather than returning empty arrays silently.

6. **Return Type Consistency**: All three functions return `Promise<string[]>` matching existing git utility functions like `getStagedFiles()` and `stageFiles()`.

## No Decisions Needed

All implementation questions resolved during exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to confirm implementation approach
- [ ] Proceed to `/build HODGE-344.1`

---
*Exploration completed: 2025-10-14T04:38:00.000Z*
*AI exploration completed via conversational discovery with parent context*
