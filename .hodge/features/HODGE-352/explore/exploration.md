# Exploration: HODGE-352

**Title**: Project cleanup and professional OSS organization

## Feature Overview
**PM Issue**: HODGE-352
**Type**: general
**Created**: 2025-10-26T03:37:01.687Z

## Problem Statement

The Hodge project contains several outdated directories, duplicate structures, and missing professional OSS elements that make it feel less polished than it should be for public release. This includes old design docs (podge/), empty files/directories (tests/, file), unclear script purposes, and an outdated package name (@agile-explorations/hodge). The project needs a comprehensive cleanup to present a professional, well-organized open source project suitable for the NPM ecosystem.

## Conversation Summary

Through conversational exploration, we examined each item in the project root:

**Documentation (`docs/`)**
- Contains 8 files including outdated implementation reports and design docs
- Industry standard is to use `docs/` for user-facing documentation
- Need to clear old content and create new structure: getting-started.md, basic-usage.md, advanced/ subdirectory
- Root README.md serves as "storefront" with badges, quick start, and links to docs/

**Old Design Artifacts (`podge/`)**
- Contains 5 files from early Hodge v3 design exploration
- All content is outdated and superseded by current implementation
- Can be safely deleted (git history preserves it)

**Review Profiles**
- Root `review-profiles/` is the canonical source (81 files)
- Gets copied to `dist/review-profiles/` during build
- Gets synced to user's `.hodge/review-profiles/` during `hodge init`
- The `.hodge/review-profiles/` should be gitignored since it's generated

**Scripts (`scripts/`)**
- Contains 22 files including CI/CD tooling, PM integration, validation
- Used actively by .github/workflows/quality.yml (validate-standards.js)
- Used by build process (sync-claude-commands.js, sync-review-profiles.js)
- Need to add scripts/README.md documenting each script's purpose
- Audit and remove any unused scripts

**Test Directories**
- `test/` contains 6 actual test files (keep)
- `tests/` is empty (delete)

**Other Items**
- `report/` contains single jscpd-report.json (code duplication analysis output)
- `file` is an empty file (delete)
- `IMPLEMENTATION_PLAN.md` is outdated (delete)

**Package Naming**
- Current: `@agile-explorations/hodge`
- Decision: Rebrand to `@hodgeson/hodge`
- Domain www.hodgeson.dev chosen (affordable, developer-focused, future-proof)
- NPM org `@hodgeson` is available

**Professional OSS Elements**
- README.md needs: badges (build, coverage, npm version), better structure, professional polish
- CONTRIBUTING.md exists and is in good shape
- CHANGELOG.md exists and follows Keep a Changelog format
- Consider: CODE_OF_CONDUCT.md, SECURITY.md, examples/ directory

## Implementation Approaches

### Approach 1: Comprehensive Cleanup with Professional OSS Polish (Recommended)

**Description**: A thorough cleanup that removes all outdated artifacts, reorganizes documentation, rebrands the package, and adds professional OSS elements in a single coordinated effort.

**Steps**:
1. **Delete outdated/empty items**: podge/, tests/, file, IMPLEMENTATION_PLAN.md
2. **Clean docs/** directory: Remove all old files, create new structure with placeholder files
3. **Update .gitignore**: Add .hodge/review-profiles/, report/
4. **Create scripts/README.md**: Document purpose of each script, identify and remove unused ones
5. **Rebrand to @hodgeson/hodge**: Update package.json, README.md, CONTRIBUTING.md, all references
6. **Create professional README.md**: Add badges, improve structure, add features section, link to docs/
7. **Add professional OSS files**: CODE_OF_CONDUCT.md, SECURITY.md (optional but recommended)
8. **Create docs/ structure**: getting-started.md, basic-usage.md, advanced/ subdirectory with initial content
9. **Update CHANGELOG.md**: Add entry for rebranding and cleanup

**Pros**:
- Single coordinated effort ensures consistency
- Clean slate for documentation
- Professional appearance ready for public release
- Rebranding done in one shot (no gradual migration confusion)
- All outdated artifacts removed at once

**Cons**:
- Larger scope means more work upfront
- Need to write initial documentation content
- Multiple files to update for rebranding

**When to use**: When preparing for initial public release or major version bump where a clean, professional appearance matters.

### Approach 2: Incremental Cleanup (Minimal Viable Cleanup)

**Description**: Focus only on removing obvious trash and fixing structural issues, deferring documentation and professional polish to future efforts.

**Steps**:
1. **Delete trash**: podge/, tests/, file, IMPLEMENTATION_PLAN.md, old docs/
2. **Update .gitignore**: Add .hodge/review-profiles/, report/
3. **Create scripts/README.md**: Basic documentation only
4. **Rebrand to @hodgeson/hodge**: Package name and critical references only

**Pros**:
- Faster to implement
- Lower immediate effort
- Gets rid of obvious problems quickly

**Cons**:
- Still feels unpolished after cleanup
- Documentation cleanup deferred
- Professional OSS elements missing
- README still needs work later
- Multiple cleanup phases instead of one

**When to use**: When time is constrained and you just need to remove technical debt before continuing development.

### Approach 3: Cleanup + Documentation Generation Focus

**Description**: Combines cleanup with a strong emphasis on creating comprehensive, high-quality documentation as the primary deliverable.

**Steps**:
1. **Delete and reorganize** (same as Approach 1)
2. **Deep documentation effort**: Create complete getting-started guide, advanced topics, API reference, examples
3. **Add examples/ directory**: Sample projects showing Hodge usage
4. **Professional README**: Comprehensive with GIFs/screenshots
5. **Rebrand to @hodgeson/hodge**

**Pros**:
- Best documentation coverage
- Examples help users understand usage
- Complete professional package

**Cons**:
- Largest scope and time investment
- Documentation may need updates as MVP evolves
- Risk of documenting features that change

**When to use**: When preparing for 1.0 release and user adoption is the priority.

## Recommendation

**Approach 1: Comprehensive Cleanup with Professional OSS Polish**

This is the right level of effort for preparing Hodge for public release. The project is close to MVP completion, and doing a thorough cleanup now prevents future refactoring and rebranding hassle. The rebranding to `@hodgeson/hodge` is a one-time event that's easier to do before you have users. The professional OSS elements (CODE_OF_CONDUCT.md, SECURITY.md, proper README) signal that this is a serious, maintained project.

The documentation can start with basic content and be expanded over time, but having the structure in place is important. This approach strikes the right balance between thoroughness and pragmatism.

## Test Intentions

When this feature is complete, the following behaviors should be verified:

1. ✅ **No outdated directories exist**: podge/, tests/ (empty) have been removed
2. ✅ **No empty files exist**: file has been removed
3. ✅ **Documentation structure exists**: docs/ contains getting-started.md, basic-usage.md, advanced/ subdirectory
4. ✅ **Scripts are documented**: scripts/README.md exists and describes each script's purpose
5. ✅ **Gitignore is updated**: .hodge/review-profiles/ and report/ are gitignored
6. ✅ **Package is rebranded**: package.json shows @hodgeson/hodge, all references updated
7. ✅ **README is professional**: Contains badges, clear structure, features section, links to docs/
8. ✅ **Professional OSS files exist**: CODE_OF_CONDUCT.md and SECURITY.md are present
9. ✅ **Build process works**: Review profiles still copy correctly to dist/, sync works during hodge init
10. ✅ **CHANGELOG is updated**: Documents the rebranding and cleanup effort

## Decisions Decided During Exploration

1. ✓ **Package name**: Will be `@hodgeson/hodge`
2. ✓ **Domain**: www.hodgeson.com to be registered
3. ✓ **Delete**: podge/, tests/ (empty), file (empty), IMPLEMENTATION_PLAN.md
4. ✓ **Documentation location**: docs/ for user-facing content, README.md as storefront
5. ✓ **Review profiles**: Root directory is canonical source, .hodge/review-profiles/ is gitignored
6. ✓ **Scripts location**: Keep at root for CI/CD tooling, add README.md for documentation
7. ✓ **README approach**: Refresh as part of this cleanup with badges and professional structure
8. ✓ **Docs structure**: getting-started.md, basic-usage.md, advanced/ subdirectory

## Decisions Needed

1. Should we add CODE_OF_CONDUCT.md and SECURITY.md for professional OSS completeness?
2. Do we want an `examples/` directory with sample projects showing Hodge usage?
3. Should `report/` directory be gitignored (contains jscpd-report.json for code duplication analysis)?
4. What badges should be included in README.md? (Suggested: build status, test coverage, npm version, license)
5. Should we register www.hodgeson.com domain as part of this feature or defer?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-352`

---
*Template created: 2025-10-26T03:37:01.687Z*
*AI exploration to follow*
