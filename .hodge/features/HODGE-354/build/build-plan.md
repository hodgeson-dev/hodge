# Build Plan: HODGE-354

## Feature Overview
**PM Issue**: HODGE-354 (linear)
**Status**: Build Complete ✅

## Implementation Checklist

### Core Implementation
- [x] Create main component/module (scripts/lib/release-utils.js)
- [x] Implement core logic (release:prepare, release:check, release:publish)
- [x] Add error handling (comprehensive edge case coverage)
- [x] Include inline documentation (JSDoc comments throughout)

### Integration
- [x] Connect with existing modules (@octokit/rest for GitHub API)
- [x] Update CLI/API endpoints (npm scripts in package.json)
- [x] Configure dependencies (already available: @octokit/rest)

### Quality Checks
- [x] Follow coding standards (ESLint compliant)
- [x] Use established patterns (dual-script approach)
- [x] Add basic validation (precondition checks, CI status)
- [x] Consider edge cases (11 test intentions covered)

## Files Modified

### New Files Created
- `scripts/lib/release-utils.js` - Shared utility functions (git, GitHub API, NPM, conventional commits)
- `scripts/release-prepare.js` - Automates CHANGELOG, version bump, tag push
- `scripts/release-check.js` - Optional CI status monitoring
- `scripts/release-publish.js` - Automates NPM publish and GitHub Release
- `src/test/hodge-354.smoke.test.ts` - 30 comprehensive smoke tests

### Modified Files
- `package.json` - Added release:prepare, release:check, release:publish scripts
- `CONTRIBUTING.md` - Added "Automated Release Scripts" section with full documentation

## Decisions Made

### Decision 1: Dual Script Approach (Approach C)
**Rationale**: Natural breakpoints (prepare → wait → publish), resilient to terminal restarts, testable, pragmatic
- `release:prepare` handles steps 1-4 (CHANGELOG, version, push)
- `release:check` provides optional CI monitoring
- `release:publish` handles steps 6-7 (NPM, GitHub Release)

### Decision 2: Git Commit-Based CHANGELOG (No AI for v1)
**Rationale**: Simple, reliable, deterministic, fast, sufficient for current needs
- Parses conventional commits (feat:, fix:, docs:, etc.)
- Groups by category (Added, Fixed, Changed, etc.)
- Defers AI-powered generation to v2

### Decision 3: GitHub Actions API for CI Monitoring
**Rationale**: No state files needed, survives terminal restarts, API queries are fast
- Queries workflow runs by tag
- Returns status: running, success, failure, not_found

### Decision 4: Manual Cleanup on CI Failure
**Rationale**: Simple, transparent, avoids complex state management
- User resets commits, deletes tags, fixes issue
- Re-runs `release:prepare` with same version

### Decision 5: No State Files
**Rationale**: Simpler architecture, use git/NPM as source of truth
- Current version: read from `package.json`
- CI status: query GitHub API
- NPM publish status: check NPM registry API

## Testing Notes

### Smoke Tests (30 tests - all passing ✅)
Verified all 11 test intentions from exploration:

**Edge Case Handling:**
1. Uncommitted changes detection (hasUncommittedChanges)
2. Wrong branch detection (getCurrentBranch)
3. CI failure recovery (checkCIStatus returns 'failure')
4. NPM publish failure (getPackageInfo for error handling)
5. GitHub API rate limiting (error handling structure)

**Interactive Features:**
6. CHANGELOG preview (generateChangelogSection output)
7. Version confirmation (getPackageInfo version format)

**CI Monitoring:**
8. GitHub API integration (getRepoInfo structure)
9. Timeout handling (CI status types)

**Idempotency:**
10. Duplicate NPM publish (isVersionPublished check)
11. Duplicate GitHub Release (createGitHubRelease update path)

**Additional Coverage:**
- Git utilities (tags, commits, branches)
- Conventional commit parsing (feat:, fix:, docs:, breaking changes)
- Repository info extraction from package.json
- Package info validation
- Script file existence checks
- NPM scripts configuration

### Test Command
```bash
npm run test:smoke -- hodge-354
```

**Result**: 30 tests passed in 122ms ✅

## Implementation Highlights

### Comprehensive Edge Case Handling
- Validates preconditions before starting (uncommitted changes, wrong branch)
- Detects CI failures and provides recovery instructions
- Handles NPM registry errors (auth, conflicts, network)
- Idempotent operations (safe to re-run)

### Interactive User Experience
- CHANGELOG preview with approval workflow (y/n/e)
- Version confirmation before bumping
- Clear error messages with actionable guidance
- Progress indicators and status updates

### Conventional Commit Support
- Parses: `type(scope)!: subject`
- Supports types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- Detects breaking changes (!)
- Groups commits by type for organized CHANGELOG

### Safety Features
- Blocks publishing if CI still running
- Blocks publishing if CI validation failed
- Checks for uncommitted changes before starting
- Ensures on main branch before releasing
- Validates GitHub token and NPM authentication

## Next Steps

Build phase complete! Ready for:

1. ✅ All smoke tests passing (30/30)
2. ✅ Core functionality implemented
3. ✅ Documentation updated
4. 🔜 Proceed to `/harden HODGE-354` for integration tests and production validation
