# Exploration: HODGE-338

## Title
Fix Auto-Detection for Review Profiles (Version Ranges + Profile Loading)

## Feature Overview
**PM Issue**: HODGE-338
**Type**: bug-fix
**Created**: 2025-10-09T03:38:07.755Z
**Updated**: 2025-10-09T03:45:00.000Z

## Problem Statement

Auto-detection for review profiles has two related bugs:

### Bug 1: Version Range Detection Not Implemented
Currently auto-detection detects ALL profiles that mention a dependency (e.g., all TypeScript profiles, all Vitest profiles) rather than selecting the best match based on actual installed version.

**Issues**:
1. `version_range` field in detection rules is defined but never used by AutoDetectionService
2. Over-inclusive detection - detects typescript-4.x, typescript-5.x, vitest-0.34+, vitest-1.x when only one of each should match
3. No version checking logic - just checks if dependency exists in package.json
4. Results in bloated review-config.md with redundant profiles

**Example**: Project has typescript@5.3.3, should detect only typescript-5.x.md, not typescript-4.x.md

### Bug 2: Profile Loading Path Resolution
During HODGE-336 harden review, discovered that ProfileCompositionService cannot find review profiles even though they exist.

**Symptoms**:
- `hodge harden --review` reports "✓ Loaded 0 profiles"
- Warning: "⚠️ Missing profiles: languages/javascript-es2020+, languages/typescript-5.x, testing/vitest-1.x"
- Review-context.md shows: "MISSING PROFILES: ...md (listed in review-config.md but file does not exist)"
- Profiles actually exist in `.hodge/review-profiles/languages/`, `.hodge/review-profiles/testing/`

**Root Cause (suspected)**:
- ProfileCompositionService may be looking for profiles relative to wrong directory
- Path resolution issue when reading profiles specified in review-config.md
- May be looking in project root instead of `.hodge/review-profiles/`

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 11
- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-001
- **Relevant Patterns**: None identified

## Files Involved
- `src/lib/auto-detection-service.ts` - evaluateDetectionRules method (Bug 1)
- `src/lib/profile-composition-service.ts` - profile loading logic (Bug 2)
- `src/lib/frontmatter-parser.ts` - DetectionRules interface has version_range field
- `review-profiles/languages/typescript-*.md` - have version_range in frontmatter
- `.hodge/review-config.md` - lists profiles by relative path

## Expected Behavior

### Bug 1: Version Range Detection
- Parse `version_range` field from profile frontmatter (e.g., '>=5.0.0 <6.0.0')
- Read actual installed version from package.json dependencies/devDependencies
- Use semver comparison to select only matching profiles
- For multiple matches, select the most specific version range

### Bug 2: Profile Loading
- ProfileCompositionService should find profiles in `.hodge/review-profiles/` directory
- Resolve paths specified in review-config.md correctly (e.g., `languages/typescript-5.x.md` → `.hodge/review-profiles/languages/typescript-5.x.md`)
- Load profile content successfully and include in review-context.md

## Implementation Approaches
<!-- AI will generate 2-3 approaches here -->

## Recommendation
<!-- AI will provide recommendation -->

## Decisions Needed
<!-- AI will list decisions for /decide command -->

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-338`

---
*Template created: 2025-10-09T03:38:07.755Z*
*Updated with Bug 2 details: 2025-10-09T03:45:00.000Z*
*AI exploration to follow*
