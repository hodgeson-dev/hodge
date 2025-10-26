# Contributing to Hodge

Thank you for your interest in contributing to Hodge! This guide will help you get started with development and testing.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hodgeson-dev/hodge.git
   cd hodge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Local Testing

For detailed local testing instructions, see [docs/local-testing.md](./docs/local-testing.md).

### Quick Local Testing

Test your changes locally before submitting:

```bash
# Link Hodge globally for testing
npm run link:local

# Create a test workspace
npm run test:local

# Navigate to test workspace and test commands
cd /path/to/test-workspace
hodge init
hodge explore
hodge ship

# Clean up when done
npm run unlink:local
```

## Code Quality

We maintain high code quality standards:

### Quality Checks

Run all quality checks before submitting:

```bash
npm run quality
```

This runs:
- TypeScript type checking
- ESLint linting
- All tests

### Individual Commands

- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint linting
- `npm run format` - Prettier formatting
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically:
- Format code with Prettier
- Lint with ESLint
- Fix auto-fixable issues

## Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-new-command` - New features
- `fix/resolve-bug-description` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/improve-code-structure` - Code refactoring

### Commit Messages

Follow conventional commit format:
- `feat: add new explore mode command`
- `fix: resolve issue with standards detection`
- `docs: update local testing guide`
- `refactor: improve error handling`
- `test: add unit tests for pattern learner`

### Development Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**:
   ```bash
   # Use watch mode for rapid development
   npm run build:watch
   
   # Test in another terminal
   npm run link:local
   npm run test:local
   ```

3. **Run quality checks**:
   ```bash
   npm run quality
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## Dogfooding Hodge

Hodge uses itself for development. This creates some special workflows:

### PM Scripts Workflow

PM scripts are generated from templates during `hodge init`:
- **Templates**: `src/lib/pm-scripts-templates.ts` (source of truth)
- **Generated**: `.hodge/pm-scripts/` (project-specific)

When you modify PM script templates:
```bash
# After modifying pm-scripts-templates.ts
npm run update-pm-scripts
```

This command rebuilds the project and regenerates `.hodge/pm-scripts/` from the latest templates.

### Dogfooding Workflow

1. Make changes to source code in `src/`
2. Build the project: `npm run build`
3. If you changed PM scripts templates: `npm run update-pm-scripts`
4. Test using compiled version: `node dist/src/bin/hodge.js [command]`
5. Or use linked version: `hodge [command]` (after `npm link`)

Always test your changes using Hodge itself:
```bash
# Use Hodge to explore a feature
hodge explore my-new-feature

# Use Hodge to build the implementation
hodge build

# Use Hodge to ship the changes
hodge ship
```

### Debugging

For debugging Hodge while developing:

```bash
# Run with debug output
DEBUG=hodge:* node dist/src/bin/hodge.js [command]

# Use VS Code debugger with launch.json configuration
# Or use Chrome DevTools
node --inspect dist/src/bin/hodge.js [command]
```

## Project Structure

```
hodge/
├── src/                    # TypeScript source code
│   ├── bin/               # CLI entry point
│   ├── commands/          # Command implementations
│   ├── lib/              # Core library code
│   └── types/            # TypeScript type definitions
├── tests/                 # Test files
├── scripts/              # Build and utility scripts
├── docs/                 # Documentation
├── dist/                 # Built JavaScript (gitignored)
└── .hodge/               # Hodge configuration and patterns
```

## TypeScript Guidelines

- Use strict TypeScript configuration
- Export types from relevant modules
- Prefer interfaces over types for object shapes
- Use proper JSDoc comments for public APIs

## Testing Guidelines

### Our Testing Philosophy

**"Test behavior, not implementation"**

We follow a **Progressive Testing Strategy** - tests evolve with code maturity:

| Stage | Required Tests | Command |
|-------|---------------|---------|
| Explore | Test intentions (markdown) | N/A |
| Build | Smoke tests | `npm run test:smoke` |
| Harden | Integration tests | `npm run test:integration` |
| Ship | All tests passing | `npm test` |

See [TEST-STRATEGY.md](./TEST-STRATEGY.md) for complete testing philosophy.

### Writing Tests

#### 1. During Explore Phase
Create test intentions in your exploration document:
```markdown
## Test Intentions
- [ ] Should handle invalid input gracefully
- [ ] Should complete within 500ms
- [ ] Should integrate with existing system
```

#### 2. During Build Phase
Write at least one smoke test:
```typescript
import { smokeTest } from '../test/helpers';

smokeTest('should not crash', async () => {
  await expect(command.execute()).resolves.not.toThrow();
});
```

#### 3. During Harden Phase
Add integration tests:
```typescript
import { integrationTest } from '../test/helpers';
import { withTestWorkspace } from '../test/runners';

integrationTest('should create expected structure', async () => {
  await withTestWorkspace('test', async (workspace) => {
    await workspace.hodge('your-command');
    expect(await workspace.exists('expected-file')).toBe(true);
  });
});
```

### Test Categories

- **Smoke Tests** (`[smoke]`) - Quick sanity checks
- **Integration Tests** (`[integration]`) - Behavior verification
- **Unit Tests** (`[unit]`) - Logic validation
- **Acceptance Tests** (`[acceptance]`) - User story validation

### Running Tests

```bash
# During development
npm run test:watch         # Watch mode
npm run test:smoke         # Quick smoke tests only

# Before committing
npm run test:integration   # Behavior tests
npm test                   # All tests

# Coverage
npm run test:coverage      # Generate coverage report
```

### Test Utilities

Use our test utilities for cleaner tests:

- `src/test/mocks.ts` - Mock factories (createMockFs, createMockCache, etc.)
- `src/test/runners.ts` - Test workspace and command runners
- `src/test/helpers.ts` - Test categorization and assertions

## Documentation

- Update documentation for new features
- Keep README.md current
- Add examples for new commands
- Update type definitions and JSDoc

## Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Review the codebase for patterns and examples
- Check the [local testing guide](./docs/local-testing.md) for development tips

## Release Process

Releases are managed by maintainers using a semi-automated workflow that balances safety with control.

### NPM Account Setup (One-Time Setup)

Before you can publish to NPM, you need to set up your NPM account and the `@hodgeson` organization:

#### 1. Create NPM Account

1. Go to [npmjs.com](https://www.npmjs.com/) and sign up for a free account
2. Verify your email address
3. Set up Two-Factor Authentication (2FA):
   - Go to Account Settings → Two-Factor Authentication
   - Choose "Authorization and Publishing" (required for scoped packages)
   - Follow the setup instructions with your authenticator app
   - **Save your recovery codes** in a secure location

#### 2. Create the `@hodgeson` Organization

1. Log in to npmjs.com
2. Click your profile → "Add an Organization"
3. Choose organization name: `hodgeson`
4. Select "Create a free organization"
5. Add organization details:
   - Display name: "Hodgeson"
   - Description: "AI development framework: Freedom to explore, discipline to build, confidence to ship"
   - Website: https://www.hodgeson.dev

#### 3. Grant Publish Access

If you're not the organization owner, request publish access:

1. Organization owner goes to npmjs.com → Organizations → hodgeson
2. Click "Members" → "Invite Members"
3. Enter your NPM username
4. Grant role: "Developer" (allows publishing)
5. You'll receive an email invitation to accept

#### 4. Configure Local NPM Token

1. Generate an access token:
   - Go to npmjs.com → Account → Access Tokens
   - Click "Generate New Token"
   - Choose "Automation" type (recommended for publishing)
   - Copy the token immediately (you won't see it again)

2. Configure npm to use the token:
   ```bash
   npm login
   # Enter your username, password, and email
   # You'll be prompted for 2FA code
   ```

   Or set token directly in `~/.npmrc`:
   ```bash
   echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE" >> ~/.npmrc
   ```

3. Verify authentication:
   ```bash
   npm whoami
   # Should output your NPM username
   ```

### Release Workflow

Our release process uses a **Hybrid Workflow** - CI validates quality, maintainer controls publish timing.

#### Step 1: Update CHANGELOG

Before releasing, document what's changed:

```bash
# Edit CHANGELOG.md
# Add a new section for the release under "## [Unreleased]"
```

Example CHANGELOG entry:
```markdown
## [0.1.0-alpha.2] - 2025-01-26

### Added
- GitHub Actions validation workflow for releases
- Comprehensive NPM publishing documentation
- Automated package validation checks

### Fixed
- Package build artifacts now include all required files

### Changed
- Release process now uses semi-automated workflow
```

#### Step 2: Bump Version

Use npm's built-in `version` command to bump the version and create a git tag:

```bash
# For alpha releases (current stage)
npm version prerelease --preid=alpha
# This bumps: 0.1.0-alpha.1 → 0.1.0-alpha.2

# Other version bump commands (for future use):
npm version patch    # 0.1.0 → 0.1.1 (bug fixes)
npm version minor    # 0.1.0 → 0.2.0 (new features)
npm version major    # 0.1.0 → 1.0.0 (breaking changes)
```

This command:
- Updates `package.json` version
- Creates a git commit with message "0.1.0-alpha.2"
- Creates a git tag `v0.1.0-alpha.2`

#### Step 3: Push Tag to Trigger CI

Push the version tag to GitHub to trigger validation:

```bash
git push --follow-tags
```

This triggers the `.github/workflows/validate-release.yml` workflow which:
- Runs all quality checks (build, typecheck, lint, tests)
- Validates package configuration
- Checks build artifacts
- Creates a dry-run package
- Tests on Node 20.x and 22.x

#### Step 4: Monitor CI Validation

1. Go to GitHub Actions tab
2. Find the "Validate Release" workflow for your tag
3. Wait for all checks to complete (~3-5 minutes)
4. Review any failures and fix if needed

**If CI fails:**
```bash
# Fix the issues
git add .
git commit -m "fix: resolve release validation issues"

# Delete the old tag
git tag -d v0.1.0-alpha.2
git push origin :refs/tags/v0.1.0-alpha.2

# Create new tag with same version
git tag v0.1.0-alpha.2
git push --follow-tags
```

#### Step 5: Publish to NPM

Once CI validation passes, publish to NPM:

```bash
# Publish to NPM with alpha tag (keeps it off 'latest')
npm publish --tag alpha

# Verify publication
npm view @hodgeson/hodge@alpha
```

**Important Notes:**
- Use `--tag alpha` to keep the package off the `latest` tag
- Users install with: `npm install @hodgeson/hodge@alpha`
- When ready for stable release, use: `npm publish` (defaults to `latest` tag)

#### Step 6: Create GitHub Release

Create a GitHub Release with CHANGELOG excerpt:

1. Go to GitHub → Releases → "Draft a new release"
2. Choose the tag you just pushed (e.g., `v0.1.0-alpha.2`)
3. Release title: Same as version (e.g., `0.1.0-alpha.2`)
4. Description: Copy the relevant section from CHANGELOG.md
5. Check "This is a pre-release" (for alpha versions)
6. Click "Publish release"

Or use GitHub CLI:
```bash
# Extract CHANGELOG section for this version
gh release create v0.1.0-alpha.2 \
  --title "0.1.0-alpha.2" \
  --notes-file <(sed -n '/## \[0.1.0-alpha.2\]/,/## \[/p' CHANGELOG.md | head -n -1) \
  --prerelease
```

### Release Checklist

Use this checklist to ensure nothing is missed:

- [ ] All changes committed and pushed
- [ ] CHANGELOG.md updated with release notes
- [ ] `npm version prerelease --preid=alpha` executed
- [ ] Tag pushed with `git push --follow-tags`
- [ ] CI validation workflow passed
- [ ] `npm publish --tag alpha` executed successfully
- [ ] Package visible on npmjs.com
- [ ] GitHub Release created with notes
- [ ] Verified installation: `npm install -g @hodgeson/hodge@alpha`

### Automated Release Scripts (Recommended)

To simplify the release process, Hodge provides automated scripts that handle the mechanical steps of releasing. This is the **recommended approach** for maintainers.

#### Overview

The automated workflow consists of three scripts:
1. **`release:prepare`** - Automates steps 1-4 (CHANGELOG, version bump, tag push)
2. **`release:check`** - Optional CI status monitoring
3. **`release:publish`** - Automates steps 5-6 (NPM publish, GitHub Release)

#### Prerequisites

1. **GitHub Token**: Create a GitHub Personal Access Token (PAT) with `repo` scope:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select `repo` scope (full control of private repositories)
   - Copy the token and add to your environment:
     ```bash
     export GITHUB_TOKEN="your_github_token_here"
     # Add to ~/.zshrc or ~/.bashrc to persist
     ```

2. **NPM Authentication**: Ensure you're logged in to NPM (see NPM Account Setup above)

#### Quick Start

```bash
# Step 1: Prepare release (generates CHANGELOG, bumps version, pushes tag)
npm run release:prepare

# Step 2: (Optional) Monitor CI validation
npm run release:check

# Step 3: Publish to NPM and create GitHub Release
npm run release:publish
```

#### Detailed Workflow

##### Step 1: Prepare Release

The `release:prepare` script automates the first four manual steps:

```bash
npm run release:prepare
```

What it does:
1. ✅ Validates preconditions (no uncommitted changes, on main branch)
2. 📝 Generates CHANGELOG from conventional commits since last release
3. 👁️ Shows preview and prompts for approval (y/n/e)
4. 💾 Commits CHANGELOG
5. 🔖 Runs `npm version prerelease --preid=alpha`
6. ⬆️ Pushes commits and tags with `git push --follow-tags`
7. 🔄 Displays CI workflow URL

**Version Types:**
```bash
# Prerelease (default)
npm run release:prepare              # 0.1.0-alpha.1 → 0.1.0-alpha.2

# Other types
npm run release:prepare -- patch     # 0.1.0 → 0.1.1
npm run release:prepare -- minor     # 0.1.0 → 0.2.0
npm run release:prepare -- major     # 0.1.0 → 1.0.0
```

**CHANGELOG Preview Options:**
- `y` (yes) - Approve and proceed
- `n` (no) - Cancel release
- `e` (edit) - Open CHANGELOG.md in your editor for manual changes

##### Step 2: Monitor CI (Optional)

While CI runs, you can check the status without blocking:

```bash
npm run release:check
```

Possible outputs:
- ⏳ **Running**: CI validation in progress
- ✅ **Success**: CI passed, ready to publish
- ❌ **Failure**: CI failed, see recovery instructions
- ⚠️ **Not Found**: Workflow not found (wait a moment or check GitHub)

##### Step 3: Publish Release

Once CI validation passes, publish to NPM and create GitHub Release:

```bash
npm run release:publish
```

What it does:
1. 🔍 Checks CI validation status
2. 📦 Publishes to NPM (with appropriate tag: `alpha` for prereleases, `latest` for stable)
3. 📝 Creates GitHub Release with CHANGELOG excerpt
4. 🎉 Displays success summary with URLs

**Safety Features:**
- Blocks publishing if CI is still running (prompts to wait)
- Blocks publishing if CI validation failed (shows recovery instructions)
- Idempotent: Safe to re-run if already published
- Skips NPM publish if version already exists

#### Recovery from Failures

If CI validation fails after `release:prepare`, follow these steps:

```bash
# 1. Fix the issue on main branch
git add .
git commit -m "fix: resolve CI issue"

# 2. Clean up failed release
git reset --hard HEAD~2             # Remove CHANGELOG and version commits
git tag -d v0.1.0-alpha.2           # Delete local tag
git push origin :refs/tags/v0.1.0-alpha.2  # Delete remote tag

# 3. Re-run release:prepare
npm run release:prepare
```

#### Edge Cases Handled

The automated scripts handle common edge cases:

- ✅ **Uncommitted changes**: Blocks with clear error message
- ✅ **Wrong branch**: Ensures you're on `main` before releasing
- ✅ **No commits**: Detects when there's nothing to release
- ✅ **CI failures**: Provides recovery instructions
- ✅ **NPM failures**: Handles auth errors, conflicts, network issues
- ✅ **Duplicate publish**: Idempotent (safe to re-run)
- ✅ **GitHub API rate limits**: Clear error messages with retry instructions

#### Comparison: Manual vs Automated

| Aspect | Manual Workflow | Automated Scripts |
|--------|-----------------|-------------------|
| Steps | 7 manual steps | 2 commands |
| CHANGELOG | Manual writing | Auto-generated from commits |
| Approval | N/A | Interactive preview |
| CI Monitoring | Manual GitHub checking | Optional automated check |
| Error Recovery | Manual cleanup | Guided instructions |
| Idempotency | Manual tracking | Built-in |
| Time | ~10-15 minutes | ~3-5 minutes |

#### Automated Release Checklist

Simplified checklist when using automated scripts:

- [ ] All changes committed and pushed
- [ ] Run `npm run release:prepare` and approve CHANGELOG
- [ ] Wait for CI validation (monitor with `npm run release:check`)
- [ ] Run `npm run release:publish`
- [ ] Verify installation: `npm install -g @hodgeson/hodge@alpha`
- [ ] Verified CLI works: `hodge --version`

### Troubleshooting

**"You must be logged in to publish packages"**
- Run `npm login` and authenticate with your NPM account
- Ensure 2FA is set up and provide the code when prompted

**"You do not have permission to publish"**
- Ensure you're a member of the `@hodgeson` organization with "Developer" role
- Check `npm whoami` shows your correct username

**"Tag already exists"**
- Delete the tag: `git tag -d v0.1.0-alpha.2 && git push origin :refs/tags/v0.1.0-alpha.2`
- Create a new tag with a bumped version

**"CI validation failed"**
- Review the GitHub Actions logs for specific failures
- Fix issues and push corrections
- Delete and recreate the tag to re-trigger validation

### Version Strategy

- **Alpha** (`0.1.0-alpha.x`): Current stage, active development
- **Beta** (`0.1.0-beta.x`): Feature complete, stabilizing
- **Release Candidate** (`0.1.0-rc.x`): Final testing before stable
- **Stable** (`0.1.0`): Production ready, published to `latest` tag

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please be respectful and inclusive in all interactions.

Thank you for contributing to Hodge!