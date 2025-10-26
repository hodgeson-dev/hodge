# Exploration: HODGE-353

**Title**: NPM Package Publishing Setup with Semi-Automated Workflow

## Feature Overview
**PM Issue**: HODGE-353
**Type**: general
**Created**: 2025-10-26T16:25:39.133Z

## Problem Statement

Hodge needs a complete NPM publishing setup to make `@hodgeson/hodge` available to users. This includes NPM organization setup, semi-automated publishing workflow with quality gates, and comprehensive documentation for maintainers to execute releases confidently.

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 17
- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-002
- **Relevant Patterns**: None identified

## Conversation Summary

The package is currently configured as `@hodgeson/hodge` at version `0.1.0-alpha.1` with basic NPM publishing configuration already in place (`publishConfig.access: "public"`, `prepublishOnly` build script). The project has a comprehensive CI/CD quality workflow testing on Node 20.x and 22.x.

Key requirements identified:
- **Publishing Scope**: Complete setup including NPM org creation, automated workflow, and maintainer documentation
- **NPM Organization**: Need guidance on creating `@hodgeson` organization and setting up maintainer access
- **Automation Level**: Semi-automated workflow where CI validates quality but maintainer controls publish timing
- **Version Management**: Use npm's built-in `npm version` command for simplicity and standard workflow
- **Quality Gates**: All CI checks must pass, only publish from main branch, clean git state required
- **Release Channel**: Stay on alpha tag (`--tag alpha`) to keep package off `latest` during early development
- **Documentation**: Full release process in CONTRIBUTING.md including CHANGELOG update steps

The package bundles templates, review profiles, and a binary executable. Current `files` array in package.json includes `dist`, `README.md`, and `LICENSE`.

## Implementation Approaches

### Approach 1: GitHub Actions with Manual Approval
**Description**: Fully automated CI workflow triggered by git tags, with manual approval step before publishing

**Implementation**:
- Create `.github/workflows/publish.yml` triggered on version tags (`v*`)
- Workflow runs all quality checks on tag push
- Manual approval step using GitHub Environment protection rules
- If approved, workflow runs `npm publish --tag alpha`
- Automated GitHub Release creation with CHANGELOG excerpt

**Pros**:
- Everything happens in CI (consistent environment)
- Clear audit trail via GitHub Actions logs
- No local NPM token needed by maintainers
- Can enforce branch protections and required reviews
- GitHub Release creation automated

**Cons**:
- Requires GitHub repository secrets for NPM_TOKEN
- More complex initial setup (Environment, secrets, approval flow)
- Debugging publish issues requires CI iteration
- Slight learning curve for GitHub Environments

**When to use**: Ideal for teams with multiple maintainers, want full audit trail, prefer all automation in CI

### Approach 2: Local Publish Script
**Description**: Maintainer-executed script that validates everything before running `npm publish` locally

**Implementation**:
- Create `scripts/publish.sh` that runs pre-publish checks
- Script validates: on main branch, clean git state, CI passing, version bumped
- Script prompts for confirmation before `npm publish --tag alpha`
- Maintainer manually updates CHANGELOG before running script
- Maintainer manually creates GitHub Release after publish

**Pros**:
- Simple to understand and debug
- Maintainer has full control at each step
- No GitHub secrets or environment configuration needed
- Easy to test the publish process (dry-run flag)
- Works offline (except actual publish)

**Cons**:
- Requires maintainer to have NPM token locally
- Manual steps increase chance of human error
- Less consistent environment (local machine variations)
- No automated audit trail
- Requires updating documentation if process changes

**When to use**: Ideal for solo maintainer or small team, want simplicity over automation, comfortable with local workflows

### Approach 3: Hybrid Workflow (GitHub Actions Validation + Local Publish)
**Description**: CI validates quality on tags, but maintainer publishes locally after approval

**Implementation**:
- Git tag triggers `.github/workflows/validate-release.yml` (quality checks only)
- Workflow runs full test suite, builds, validates package contents
- If validation passes, maintainer is notified (GitHub notification, not blocking)
- Maintainer reviews validation results, then runs `npm publish --tag alpha` locally
- Document clear checklist in CONTRIBUTING.md: update CHANGELOG → `npm version` → push tag → wait for CI → review results → publish

**Pros**:
- Balances automation with control (best of both worlds)
- CI validates quality without needing NPM secrets
- Maintainer makes final publish decision with context
- Simpler than full GitHub Actions automation
- Easy to add more automation later

**Cons**:
- Still requires local NPM token
- Two-step process (push tag, then publish)
- Could forget to publish after CI passes
- Manual coordination between CI results and local action

**When to use**: Ideal for semi-automated workflow with safety nets, want CI validation without full automation complexity

## Recommendation

**Approach 3: Hybrid Workflow (GitHub Actions Validation + Local Publish)**

This approach best fits the stated requirements for "semi-automated" publishing. It provides:

1. **Safety**: CI validates all quality gates before any publish happens
2. **Control**: Maintainer makes final decision after reviewing validation results
3. **Simplicity**: Avoids GitHub Environment setup and NPM token secrets management
4. **Incremental**: Easy to evolve toward full automation (Approach 1) later if desired
5. **Clear Process**: Step-by-step workflow documented in CONTRIBUTING.md

The workflow:
```bash
# 1. Update CHANGELOG.md with release notes
# 2. Bump version (creates git tag)
npm version prerelease --preid=alpha  # 0.1.0-alpha.1 → 0.1.0-alpha.2

# 3. Push tag to trigger CI validation
git push --follow-tags

# 4. Wait for CI to pass (GitHub Actions runs validate-release.yml)
# 5. Review validation results in GitHub Actions tab
# 6. Publish to NPM if validation passed
npm publish --tag alpha

# 7. Create GitHub Release with CHANGELOG excerpt
```

This balances automation with maintainer control, providing guardrails without removing human judgment from the publish decision.

## Test Intentions

### Behavioral Expectations
1. **CI Validation Workflow**: When a version tag is pushed, GitHub Actions runs full quality suite (build, typecheck, lint, tests, standards validation)
2. **Package Contents**: Published package includes dist/, README.md, LICENSE and excludes source files, tests, and development configs
3. **NPM Installation**: Package installs successfully from NPM registry in a clean environment (`npm install -g @hodgeson/hodge`)
4. **Binary Executable**: After installing from NPM, `hodge --version` command works and displays correct version
5. **Release Documentation**: CONTRIBUTING.md contains complete release process with examples for version bumping, CHANGELOG updates, and publish steps
6. **NPM Setup Guide**: Documentation includes clear instructions for creating NPM account, setting up 2FA, creating `@hodgeson` organization, and configuring publish permissions

## Decisions Decided During Exploration

1. ✓ **Version Management Strategy**: Use `npm version prerelease --preid=alpha` for version bumping (built-in, creates git tags automatically, simple workflow)
2. ✓ **Quality Gates**: Require all CI checks to pass and only publish from main branch
3. ✓ **Release Channel Strategy**: Stay on alpha release channel using `--tag alpha` flag (keeps package off `latest` tag during early development)
4. ✓ **Documentation Location**: Document release process in CONTRIBUTING.md with CHANGELOG update steps included
5. ✓ **Automation Level**: Semi-automated workflow where CI validates quality but maintainer controls publish timing

## No Decisions Needed

All decisions were resolved during the exploration conversation.

## Next Steps
- [ ] Review exploration findings
- [x] All decisions made during exploration
- [ ] Proceed to `/build HODGE-353`

---
*Exploration completed: 2025-10-26*
