# Scripts

Development, build, and CI/CD tooling for Hodge.

## Build Scripts

### `sync-claude-commands.js`
Synchronizes Claude Code slash command definitions from `.claude/commands/*.md` to the distributable format.

**Used by:** `npm run build`, `npm run sync:commands`
**Purpose:** Ensures slash commands are packaged correctly for distribution

### `sync-review-profiles.js`
Syncs review profiles from `review-profiles/` to distributable format.

**Used by:** `npm run build`, `npm run sync:profiles`
**Purpose:** Packages language/framework review profiles for user projects

---

## CI/CD Scripts

### `validate-standards.js`
Validates project code against Hodge standards (logging patterns, code quality).

**Used by:** `.github/workflows/quality.yml`
**Purpose:** Enforces standards in CI pipeline
**When it runs:** On every PR and push to main

---

## PM Integration Scripts

### `fetch-issue.js`
Fetches a Linear issue by ID for development/testing.

**Usage:** `node scripts/fetch-issue.js <ISSUE-ID>`
**Requires:** `LINEAR_API_KEY` environment variable

### `fetch-issue-hod6.js`
Specialized fetch script for HOD-6 feature development.

**Usage:** `LINEAR_API_KEY=xxx node scripts/fetch-issue-hod6.js`
**Purpose:** Development/testing of PM integration

### `fetch-issue-hod20.js`
Specialized fetch script for HOD-20 feature development.

**Usage:** `LINEAR_API_KEY=xxx node scripts/fetch-issue-hod20.js`
**Purpose:** Development/testing of PM integration

### `ship-issue.js`
Ships a Linear issue (updates status to Done).

**Usage:** `LINEAR_API_KEY=xxx LINEAR_TEAM_ID=xxx node scripts/ship-issue.js`
**Purpose:** Testing ship command PM integration

### `update-issue-hod6.js`
Updates Linear issue for HOD-6 feature development.

**Usage:** `LINEAR_API_KEY=xxx node scripts/update-issue-hod6.js`
**Purpose:** Development/testing of PM updates

### `update-issue-decision.js`
Updates a Linear issue with decision information.

**Usage:** `node scripts/update-issue-decision.js <ISSUE-ID> <DECISION>`
**Purpose:** Testing decision-to-PM sync

### `create-linear-project.js`
Creates a Linear project for Hodge organization/testing.

**Usage:** `LINEAR_API_KEY=xxx node scripts/create-linear-project.js`
**Purpose:** Initial Linear project setup

### `list-linear-teams.js`
Lists Linear teams for API key configuration.

**Usage:** `LINEAR_API_KEY=xxx node scripts/list-linear-teams.js`
**Purpose:** Finding team IDs for configuration

### `test-pm-connection.js`
Tests PM tool connection (Linear/GitHub/Jira).

**Usage:** `node scripts/test-pm-connection.js`
**Purpose:** Debugging PM integration issues

### `update-pm-scripts.js`
Updates PM scripts distributed to user projects.

**Usage:** `npm run update-pm-scripts`
**Purpose:** Regenerating `.hodge/pm-scripts/` templates

---

## Testing Scripts

### `create-test-workspace.ts`
Creates temporary test workspace for local testing.

**Usage:** `npm run test:local`
**Purpose:** Manual testing of Hodge commands in isolated environment

### `test-performance.js`
Measures general command performance.

**Usage:** `node scripts/test-performance.js`
**Purpose:** Performance profiling and optimization

### `test-build-performance.js`
Measures build command performance.

**Usage:** `node scripts/test-build-performance.js`
**Purpose:** Build phase performance profiling

### `test-harden-performance.js`
Measures harden command performance.

**Usage:** `node scripts/test-harden-performance.js`
**Purpose:** Harden phase performance profiling

---

## Maintenance Scripts

### `remove-skipped-tests.js`
Removes skipped tests from the codebase.

**Usage:** `node scripts/remove-skipped-tests.js`
**Purpose:** Cleanup after test refactoring (used once during HODGE-242)
**Status:** Historical - may not be needed again

---

## Cross-Platform Testing

### `cross-platform.test.ts`
Tests Hodge CLI across different platforms (macOS, Linux, Windows).

**Usage:** `npm run test:cross-platform`
**Purpose:** Ensuring cross-platform compatibility

---

## Script Categories

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Build** | sync-claude-commands, sync-review-profiles | Package distribution |
| **CI/CD** | validate-standards | Quality enforcement |
| **PM Integration** | fetch-issue*, ship-issue, update-issue*, create-linear-project, list-linear-teams, test-pm-connection, update-pm-scripts | Linear/GitHub/Jira workflows |
| **Testing** | create-test-workspace, test-*performance | Development testing |
| **Cross-Platform** | cross-platform.test | Platform compatibility |

---

## Adding New Scripts

When adding scripts:

1. Add to this README with clear purpose
2. Use descriptive filename (verb-noun pattern)
3. Include usage example
4. Note any environment variables required
5. Add to appropriate category above

---

**Need help?** See [CONTRIBUTING.md](../CONTRIBUTING.md)
