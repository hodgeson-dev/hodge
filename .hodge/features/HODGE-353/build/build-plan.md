# Build Plan: HODGE-353 - NPM Package Publishing Setup

## Feature Overview
**PM Issue**: HODGE-353 (linear)
**Status**: Complete
**Approach**: Hybrid Workflow (GitHub Actions Validation + Local Publish)

## Implementation Checklist

### Core Implementation
- [x] Create GitHub Actions validate-release workflow
- [x] Document NPM account setup in CONTRIBUTING.md
- [x] Document release process in CONTRIBUTING.md
- [x] Create root index.ts for package main entry point
- [x] Update tsconfig.json to include root index.ts

### Integration
- [x] Configure package.json with publishConfig
- [x] Verify prepublishOnly script triggers build
- [x] Set up GitHub Actions workflow triggers on version tags

### Quality Checks
- [x] Follow coding standards
- [x] Use established patterns
- [x] Create comprehensive smoke tests (7 tests)
- [x] All smoke tests passing

## Files Modified

### Created
- `.github/workflows/validate-release.yml` - CI workflow to validate releases on version tags
- `src/test/hodge-353.smoke.test.ts` - Smoke tests for package validation
- `index.ts` - Root entry point for programmatic package usage

### Modified
- `CONTRIBUTING.md` - Added comprehensive Release Process section with:
  - NPM account setup (create account, 2FA, organization, tokens)
  - Release workflow (6 steps with examples)
  - Release checklist
  - Troubleshooting guide
  - Version strategy
- `tsconfig.json` - Added `index.ts` to include array

## Decisions Made

1. **Used Hybrid Workflow (Approach 3)**: CI validates quality on tags, maintainer publishes locally. Balances automation with control, simpler than full GitHub Actions automation.

2. **Root index.ts for main entry point**: Created `index.ts` at project root that exports from `src/lib/index.js` to match `package.json` main field (`./dist/index.js`). This enables programmatic usage of Hodge as a library.

3. **Stay on alpha tag**: Using `npm publish --tag alpha` keeps package off `latest` tag during early development. Users explicitly install with `@alpha`.

4. **Comprehensive validation in CI**: validate-release.yml runs all quality gates, validates package.json config, checks build artifacts, and runs dry-run pack before maintainer publishes.

## Testing Notes

### Smoke Tests (7 total, all passing)
1. ✅ package.json has required publishing configuration
2. ✅ prepublishOnly script is configured
3. ✅ validate-release workflow exists
4. ✅ CONTRIBUTING.md has release process documentation
5. ✅ required build artifacts are present after build
6. ✅ LICENSE file exists for NPM package
7. ✅ README.md exists for NPM package page

## Next Steps
1. ✅ All smoke tests passing
2. Stage all changes: `git add .`
3. Proceed to `/harden HODGE-353` for integration testing and production readiness
