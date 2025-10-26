# Exploration: HODGE-354

## Feature Overview
**PM Issue**: HODGE-354
**Type**: general
**Created**: 2025-10-26T17:29:21.408Z
**Title**: Automated Release Scripts for NPM Publishing Workflow

## Problem Statement (User-Provided)

It would be great to automate steps 1-4 with a script that includes AI generation of the CHANGELOG update, and a script to automate steps 6-7. Is that feasible?

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 17
- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-001
- **Relevant Patterns**: None identified
- **Related Feature**: HODGE-353 (NPM Package Publishing setup - shipped)

### Current Manual Release Process (from CONTRIBUTING.md)

The current 7-step release workflow documented in HODGE-353:

1. **Update CHANGELOG.md** - Manually document changes
2. **Commit CHANGELOG** - `git add CHANGELOG.md && git commit -m "docs: update CHANGELOG for vX.Y.Z"`
3. **Bump version** - `npm version prerelease --preid=alpha` (auto-commits package.json)
4. **Push tag** - `git push --follow-tags`
5. **Monitor CI validation** - Wait for GitHub Actions workflow to complete
6. **Publish to NPM** - `npm publish --tag alpha`
7. **Create GitHub Release** - Use GitHub UI to document the release

**Pain points identified**:
- Steps 1-4 are mechanical but error-prone (easy to forget commits, wrong version bumps)
- Step 5 requires manual monitoring and waiting
- Steps 6-7 are simple but require context switching
- Recovery from CI failures is unclear

## Exploration Summary

Through conversational exploration, we discussed several approaches to automating the release workflow. Key discussion points:

1. **Scope**: Automating for Hodge itself (not a general-purpose tool for all projects)
2. **State persistence**: How to handle terminal restarts during CI waiting
3. **CI monitoring**: How to know when GitHub Actions validation completes
4. **Recovery strategy**: What happens when CI fails
5. **CHANGELOG generation**: Whether to use AI or conventional git-based approach
6. **Claude Code integration**: How to invoke AI capabilities programmatically
7. **Edge case handling**: Uncommitted changes, wrong branch, NPM failures

## Implementation Approaches

### Approach A: Monolithic Single Script

**Description**: One `release:execute` script that handles all steps 1-7 in sequence.

**How it works**:
```bash
npm run release:execute
```
1. Updates CHANGELOG from git commits
2. Shows preview and requires approval
3. Commits CHANGELOG
4. Runs `npm version`
5. Pushes tags
6. Monitors CI via GitHub API (blocks until complete)
7. If CI passes: publishes to NPM and creates GitHub Release
8. If CI fails: exits with instructions for cleanup

**Pros**:
- Simple mental model (one command does everything)
- No state files needed
- Linear execution flow

**Cons**:
- Not resilient to terminal restarts during CI wait
- Long-running blocking process (2-5 minutes for CI)
- All-or-nothing approach (can't easily split publish from prepare)
- Harder to test individual phases

**State Management**: None needed (blocks until complete or fails)

**Recovery**: If CI fails:
1. User manually reverts commit: `git reset --hard HEAD~1`
2. User deletes tag: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`
3. User fixes issue and re-runs `release:execute`

---

### Approach B: External Orchestration Tool

**Description**: Use a dedicated release tool like `semantic-release`, `release-it`, or `np`.

**How it works**:
```bash
npm install --save-dev semantic-release
# Configure .releaserc.json
npm run release
```

**Pros**:
- Battle-tested and widely used
- Handles complex scenarios (monorepos, plugins, etc.)
- Active maintenance and community support
- Built-in CI/CD integrations

**Cons**:
- Heavy dependency (semantic-release has 50+ transitive deps)
- Complex configuration for our simple use case
- May conflict with Hodge's opinionated workflow
- Harder to customize for Hodge-specific needs
- Overkill for a single package

**State Management**: Managed by tool (varies by choice)

**Recovery**: Depends on tool's error handling

**Assessment**: Overpowered for our needs. We want simple, transparent automation that fits Hodge's philosophy.

---

### Approach C: Dual Script Approach (Recommended)

**Description**: Two focused scripts that map to natural breakpoints in the workflow.

**How it works**:
```bash
# Script 1: Prepare release (steps 1-4)
npm run release:prepare
# → Updates CHANGELOG from git commits
# → Shows preview and requires approval
# → Commits CHANGELOG
# → Runs npm version prerelease --preid=alpha
# → Pushes tags
# → Prints: "CI validation running at https://github.com/..."
# → Prints: "Run 'npm run release:check' to monitor status"

# Optional: Check CI status without blocking
npm run release:check
# → Queries GitHub API for workflow status
# → Prints: "CI validation in progress (2m 15s elapsed)..."
# → OR: "✅ CI validation passed! Run 'npm run release:publish'"
# → OR: "❌ CI validation failed. Check logs at https://..."

# Script 2: Publish release (steps 6-7)
npm run release:publish
# → Checks CI status via GitHub API
# → If still running: prints status and exits
# → If failed: prints error and exit instructions
# → If passed: publishes to NPM and creates GitHub Release
```

**Pros**:
- Natural breakpoints (prepare → wait → publish)
- Resilient to terminal restarts (git/NPM is source of truth)
- Can manually intervene between scripts if needed
- Each script is focused and testable
- No state files needed
- Optional `release:check` for impatient developers

**Cons**:
- Requires two commands instead of one
- User needs to remember to run second script
- Slightly more complex mental model

**State Management**:
- No state files needed
- Current version: read from `package.json`
- CI status: query GitHub API using latest tag
- NPM publish status: check NPM registry API

**Recovery**: If CI fails:
1. `release:publish` detects failure and prints instructions
2. User manually fixes issue on main branch
3. User cleans up: `git reset --hard HEAD~1` (revert npm version commit)
4. User deletes tag: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`
5. User re-runs `release:prepare` with same version

**Idempotency**:
- `release:prepare` is NOT idempotent (creates new version/tag each run)
- `release:publish` IS idempotent (checks NPM registry before publishing)

---

## Recommendation

**Choose Approach C: Dual Script Approach**

**Reasoning**:
1. **Aligns with Hodge philosophy**: Simple, transparent, focused tools
2. **Resilient**: No state files, survives terminal restarts
3. **Flexible**: Can manually intervene between prepare and publish
4. **Testable**: Each script has clear inputs/outputs
5. **Pragmatic**: Solves the real pain points without over-engineering

**For v1 (this feature)**:
- Focus on mechanical automation (CHANGELOG from git commits)
- Skip AI generation (adds complexity, unclear value)
- Implement comprehensive edge case handling
- Create interactive preview/approval flow

**For v2 (future enhancement)**:
- Explore AI-powered CHANGELOG generation
- Investigate Claude Code programmatic API
- Add support for custom CHANGELOG templates
- Consider GitHub Release note generation via AI

## CHANGELOG Generation Strategy (Decision Made)

**Chosen approach**: **Git commit-based CHANGELOG (Option D - No AI for v1)**

**How it works**:
1. Query git commits since last tag: `git log --oneline --no-merges v0.1.0-alpha.1..HEAD`
2. Parse commit messages using conventional commits format (feat:, fix:, docs:, etc.)
3. Group by category (### Added, ### Fixed, ### Changed, etc.)
4. Generate markdown formatted CHANGELOG section
5. Show preview to user for approval
6. Append to CHANGELOG.md on approval

**Example output**:
```markdown
## [0.1.0-alpha.2] - 2025-10-26

### Added
- Automated release scripts for NPM workflow (HODGE-354)

### Fixed
- Test isolation violations in logs command (HODGE-350)

### Documentation
- Clarified release commit sequence in CONTRIBUTING.md
```

**Why this approach**:
- **Simple**: No AI complexity, no external API calls
- **Reliable**: Deterministic output based on git history
- **Fast**: Instant generation, no waiting
- **Sufficient**: Conventional commits already describe changes well
- **Extensible**: Can add AI enhancement in v2 if needed

**Deferred to v2**: AI-powered CHANGELOG generation using Claude Code API

## CI Monitoring Strategy (Decision Made)

**Approach**: Query GitHub Actions API for workflow status

**Implementation**:
```typescript
// Pseudo-code
async function checkCIStatus(tag: string): Promise<'running' | 'success' | 'failure'> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner: 'hodgeson-dev',
    repo: 'hodge',
    event: 'push',
    branch: tag, // Tags appear as branches in API
    per_page: 1
  });

  if (!runs.workflow_runs.length) return 'running';
  const run = runs.workflow_runs[0];

  if (run.status === 'in_progress' || run.status === 'queued') return 'running';
  if (run.conclusion === 'success') return 'success';
  return 'failure';
}
```

**User experience**:
```bash
$ npm run release:prepare
✓ CHANGELOG updated
✓ Version bumped to 0.1.0-alpha.2
✓ Tag pushed to GitHub

🔄 CI validation running at https://github.com/hodgeson-dev/hodge/actions/runs/12345
   Run 'npm run release:check' to monitor status

$ npm run release:check
⏳ CI validation in progress (2m 15s elapsed)...
   Check status: https://github.com/hodgeson-dev/hodge/actions/runs/12345

$ npm run release:check
✅ CI validation passed!
   Run 'npm run release:publish' to publish to NPM

$ npm run release:publish
✅ Published @hodgeson/hodge@0.1.0-alpha.2 to NPM
✅ Created GitHub Release: https://github.com/hodgeson-dev/hodge/releases/tag/v0.1.0-alpha.2
```

**Authentication**: Uses `GITHUB_TOKEN` environment variable (create PAT with `repo` scope)

## Test Intentions

### Edge Case Handling

1. **Uncommitted Changes Detection**
   - `release:prepare` checks for uncommitted changes before starting
   - If found: prints error and exits with instructions to commit or stash
   - **Test intention**: Verify script exits cleanly with uncommitted files

2. **Wrong Branch Detection**
   - `release:prepare` ensures current branch is `main`
   - If on different branch: prints error and exits
   - **Test intention**: Verify script exits when not on main branch

3. **CI Failure Recovery**
   - `release:publish` detects CI failure via GitHub API
   - Prints clear instructions for cleanup (reset commit, delete tag)
   - **Test intention**: Verify error message includes cleanup commands

4. **NPM Publish Failure**
   - `release:publish` handles NPM registry errors gracefully
   - If 409 conflict: checks if version already published (idempotent)
   - If auth error: prints instructions for `npm login`
   - **Test intention**: Verify script handles NPM errors without leaving partial state

5. **GitHub API Rate Limiting**
   - `release:check` and `release:publish` handle API rate limits
   - If rate limited: prints clear message and retry instructions
   - **Test intention**: Mock API rate limit response, verify error handling

### Interactive Preview/Approval

6. **CHANGELOG Preview**
   - `release:prepare` shows generated CHANGELOG section before committing
   - Prompts: "Approve this CHANGELOG? (y/n/e)"
   - `y`: proceeds with commit, `n`: aborts, `e`: opens editor for manual changes
   - **Test intention**: Test all three approval paths (yes/no/edit)

7. **Version Confirmation**
   - `release:prepare` shows version bump before executing
   - Example: "Bumping version: 0.1.0-alpha.1 → 0.1.0-alpha.2. Continue? (y/n)"
   - **Test intention**: Verify version preview matches npm version output

### CI Monitoring

8. **GitHub API Integration**
   - `release:check` queries GitHub Actions API correctly
   - Handles all workflow states: queued, in_progress, completed (success/failure)
   - **Test intention**: Mock GitHub API responses for all states

9. **Timeout Handling**
   - `release:check` doesn't block forever if CI hangs
   - After 10 minutes: suggests checking GitHub UI manually
   - **Test intention**: Verify timeout logic with mocked long-running CI

### Idempotency

10. **Duplicate NPM Publish**
    - `release:publish` checks NPM registry before publishing
    - If version exists: skips publish, continues to GitHub Release
    - **Test intention**: Mock NPM registry with existing version, verify skip

11. **Duplicate GitHub Release**
    - `release:publish` checks if GitHub Release already exists
    - If exists: updates release notes instead of creating new one
    - **Test intention**: Mock existing GitHub Release, verify update path

## Decisions Made During Exploration

All decisions were made through conversational exploration. No separate `/decide` phase needed.

### Decision 1: Script Architecture
- **Question**: Single script vs separate commands?
- **Chosen**: Separate commands (`release:prepare` and `release:publish`)
- **Rationale**: Natural breakpoints, resilient to terminal restarts, testable

### Decision 2: CHANGELOG Generation
- **Question**: AI-powered vs git commit-based?
- **Chosen**: Git commit-based for v1, defer AI to v2
- **Rationale**: Simpler, reliable, sufficient for current needs

### Decision 3: CI Monitoring
- **Question**: How to know when CI completes?
- **Chosen**: GitHub Actions API with optional `release:check` command
- **Rationale**: No blocking required, survives terminal restarts

### Decision 4: Recovery Strategy
- **Question**: What happens when CI fails?
- **Chosen**: Manual cleanup (reset commit, delete tag) then re-run
- **Rationale**: Simple, transparent, avoids complex state management

### Decision 5: State Persistence
- **Question**: How to handle terminal restarts during CI wait?
- **Chosen**: No state files, use git/NPM as source of truth
- **Rationale**: Simpler, no file sync issues, querying APIs is fast

### Decision 6: Version Idempotency
- **Question**: Can we re-use same version after CI failure?
- **Chosen**: Yes, user cleans up and re-runs `release:prepare`
- **Rationale**: Matches manual workflow, clear mental model

### Decision 7: Edge Case Handling
- **Question**: Handle uncommitted changes, wrong branch, etc.?
- **Chosen**: Yes, comprehensive validation in `release:prepare`
- **Rationale**: Prevents common mistakes, improves UX

## No Decisions Needed

All implementation decisions were resolved during conversational exploration. The feature is ready to proceed to `/build HODGE-354`.

## Next Steps

- [x] Exploration complete
- [x] All decisions made during exploration
- [ ] Proceed to `/build HODGE-354`
- [ ] Implement `release:prepare` script
- [ ] Implement `release:publish` script
- [ ] Implement `release:check` helper
- [ ] Create smoke tests for all 11 test intentions
- [ ] Update `package.json` with new script commands
- [ ] Document new scripts in CONTRIBUTING.md

---
*Exploration completed: 2025-10-26T17:37:00.000Z*
*All decisions made conversationally - no /decide phase needed*
