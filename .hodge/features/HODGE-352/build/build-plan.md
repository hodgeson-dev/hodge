# Build Plan: HODGE-352

## Feature Overview
**PM Issue**: HODGE-352 (linear)
**Status**: Complete
**Title**: Project cleanup and professional OSS organization

## Implementation Summary

Comprehensive cleanup and rebranding to prepare Hodge for public release as a professional open source project.

## Implementation Checklist

### Core Implementation
- [x] Delete outdated directories (podge/, tests/, old docs/)
- [x] Delete obsolete files (file, IMPLEMENTATION_PLAN.md)
- [x] Rebrand package from @agile-explorations/hodge to @hodgeson/hodge
- [x] Update all repository references to hodgeson-dev/hodge
- [x] Set homepage to www.hodgeson.dev

### Professional OSS Elements
- [x] Create CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- [x] Create SECURITY.md (vulnerability reporting policy)
- [x] Create professional README.md with badges
- [x] Add build status, npm version, and license badges

### Documentation
- [x] Create docs/ structure
  - [x] docs/getting-started.md (installation, first feature)
  - [x] docs/basic-usage.md (common workflows, slash commands)
  - [x] docs/advanced/README.md (placeholder for future guides)
- [x] Create examples/ directory structure
  - [x] examples/README.md (placeholder for sample projects)
- [x] Create scripts/README.md (document all 22 scripts)

### Configuration
- [x] Update .gitignore (.hodge/review-profiles/, report/)
- [x] Update CHANGELOG.md with rebranding entry
- [x] Update CONTRIBUTING.md repository references

### Quality Checks
- [x] Write comprehensive smoke tests (10 tests)
- [x] All tests passing (10/10)
- [x] Code follows project standards
- [x] No linting errors

## Files Modified

### Deleted
- `podge/` - Outdated design artifacts (5 files)
- `tests/` - Empty directory
- `file` - Empty file
- `IMPLEMENTATION_PLAN.md` - Outdated
- `docs/` - Old content (8 files deleted)

### Created
- `CODE_OF_CONDUCT.md` - Contributor Covenant 2.1
- `SECURITY.md` - Security policy and vulnerability reporting
- `docs/getting-started.md` - Installation and first feature guide
- `docs/basic-usage.md` - Common workflows and slash commands
- `docs/advanced/README.md` - Placeholder for advanced topics
- `examples/README.md` - Placeholder for sample projects
- `scripts/README.md` - Documentation for all 22 scripts
- `src/test/hodge-352.smoke.test.ts` - Comprehensive smoke tests

### Modified
- `package.json` - Rebranded to @hodgeson/hodge, updated repository
- `README.md` - Professional structure with badges and features
- `.gitignore` - Added .hodge/review-profiles/ and report/
- `CHANGELOG.md` - Documented rebranding and cleanup
- `CONTRIBUTING.md` - Updated repository references

## Decisions Made

1. **Domain choice**: www.hodgeson.dev (affordable, developer-focused, future-proof)
2. **GitHub org**: hodgeson-dev (hodgeson was taken)
3. **Badge selection**: Build status, npm version, license (professional without excess)
4. **Documentation approach**: Create structure now, defer comprehensive content to post-MVP
5. **Examples approach**: Create directory structure, defer sample projects to post-MVP

## Testing Notes

### Smoke Tests (10 tests, all passing)
- Verify outdated directories deleted
- Verify new documentation structure exists
- Verify OSS files created
- Verify examples structure exists
- Verify scripts documentation exists
- Verify package.json rebranded correctly
- Verify .gitignore updated
- Verify README has professional structure
- Verify CHANGELOG documents rebranding
- Verify CONTRIBUTING references new repository

**Test Result**: ✅ 10/10 passing

## Next Steps

1. ✅ Smoke tests passing - ready for harden phase
2. Run `/harden HODGE-352` to add integration tests
3. Validate all quality gates (linting, types, full test suite)
4. Ship to production with `/ship HODGE-352`

## Post-Ship Tasks

- [ ] Update Git remote: `git remote set-url origin git@github.com:hodgeson-dev/hodge.git`
- [ ] Push to new repository: `git push -u origin --all && git push -u origin --tags`
- [ ] Register hodgeson.dev domain
- [ ] Configure GitHub repository settings (description, topics, homepage)
- [ ] Archive old agile-explorations/hodge repository with redirect notice

---

**Build Complete** - All implementation tasks finished, smoke tests passing, ready for harden phase.
