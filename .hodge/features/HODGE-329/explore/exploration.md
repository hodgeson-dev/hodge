# Exploration: HODGE-329

## Title
Fix TruffleHog CI security scan failure on direct main branch pushes

## Problem Statement

The TruffleHog security scanning GitHub Action fails on every push to main with the error "BASE and HEAD commits are the same. TruffleHog won't scan anything." This occurs because the action's default configuration (`base: main`, `head: HEAD`) is designed for PR-based workflows where there's a commit range to scan. When pushing directly to main, both BASE and HEAD resolve to the same commit hash, causing the scan to exit with an error before any security scanning occurs.

## Conversation Summary

The project currently uses a direct-to-main workflow without branches or pull requests, which is common for solo/early-stage development. The TruffleHog action's "ADVANCED USAGE" section (lines 15-26 in the workflow) checks if BASE and HEAD are the same and exits with error code 1, preventing the "scan commits based on event type" logic from ever running.

Key requirements identified:
- **Initial scan**: Need to perform a full repository scan at least once (never done before)
- **Incremental scanning**: After initial scan, only scan new commits on each push
- **Maintain security**: Cannot disable scanning despite the errors
- **Future-proof**: Configuration must work when PR workflow is adopted post-initial-release
- **Every push**: Scanning should happen on every push to main

The current error shows the action receives `COMMIT_IDS: ["f12239607c50a6c223c93ce1aac288fb50cef7a8"]` which means GitHub provides the commit information, but the hardcoded `BASE: main` and `HEAD: HEAD` environment variables override the dynamic logic.

## Implementation Approaches

### Approach 1: Remove BASE/HEAD parameters (Dynamic commit detection)

**Description**: Remove the hardcoded `base: main` and `head: HEAD` parameters from the workflow configuration, allowing TruffleHog's built-in event-type detection to work correctly.

**Changes Required**:
```yaml
# Current (failing):
- uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: main        # Remove this
    head: HEAD        # Remove this
    version: latest

# Fixed:
- uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    version: latest
```

**How it works**:
- Without BASE/HEAD parameters, the action's "ADVANCED USAGE" section is skipped
- The "scan commits based on event type" logic (lines 34-63) handles push events correctly
- For push events, it uses `${{ github.event.before }}` and `${{ github.event.after }}` from GitHub's event payload
- First push scans from repository root, subsequent pushes scan commit ranges

**Pros**:
- Minimal configuration change (just remove 2 lines)
- Leverages TruffleHog's built-in event handling
- Automatically works for both push and PR events (future-proof)
- No custom scripting or conditional logic needed

**Cons**:
- Less explicit control over what gets scanned
- First push might scan large history if repo has many commits
- Relies on GitHub event payload structure (could change)

**When to use**: Best for standard workflows where TruffleHog's defaults are acceptable.

---

### Approach 2: Conditional BASE/HEAD with fallback logic

**Description**: Modify the workflow to set BASE/HEAD conditionally based on event type, using GitHub's event context to provide correct values for push events.

**Changes Required**:
```yaml
- uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event_name == 'push' && github.event.before || 'main' }}
    head: ${{ github.event_name == 'push' && github.event.after || 'HEAD' }}
    version: latest
```

**How it works**:
- For push events: Uses `github.event.before` (previous commit) and `github.event.after` (new commit)
- For PR events: Falls back to `main` and `HEAD` (standard PR scanning)
- First push to repo will have `before: 0000000...` which TruffleHog treats as "scan from beginning"

**Pros**:
- Explicit control over BASE/HEAD values per event type
- Clear what's being scanned in workflow file
- Handles first-time scans automatically (0000... commits)
- Works for both current and future PR workflows

**Cons**:
- More complex YAML expression syntax
- Harder to debug if GitHub context changes
- Requires understanding GitHub Actions event payloads

**When to use**: When you want explicit control over scan ranges and clear visibility in the workflow.

---

### Approach 3: Full repository scan on push, incremental on PR

**Description**: Configure different scanning strategies based on workflow: full repo scan on push to main, incremental diff on PRs.

**Changes Required**:
```yaml
- uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    # For pushes: scan entire repo
    # For PRs: scan diff
    base: ${{ github.event_name == 'pull_request' && github.event.pull_request.base.sha || '' }}
    head: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || '' }}
    version: latest
```

**How it works**:
- When `base` and `head` are empty strings, TruffleHog scans entire repository
- For PRs, uses PR-specific commit SHAs from event payload
- Every push to main scans full repo (safest but slower)

**Pros**:
- Guaranteed complete scan on every main push (highest security)
- No risk of missing secrets in commit ranges
- Simple PR scanning when that workflow is adopted
- No reliance on commit history continuity

**Cons**:
- Slower CI on every push (scans entire repo)
- Wastes resources re-scanning unchanged files
- Not efficient for large repositories
- May hit rate limits on large repos

**When to use**: When maximum security is priority over CI performance, or for smaller repositories.

---

### Approach 4: Two-stage scanning workflow

**Description**: Create separate workflow jobs for initial full scan and incremental scanning, using workflow artifacts or repository state to track scan status.

**Changes Required**:
```yaml
jobs:
  check-scan-status:
    runs-on: ubuntu-latest
    outputs:
      has_baseline: ${{ steps.check.outputs.has_baseline }}
    steps:
      - name: Check for baseline scan
        id: check
        run: |
          # Check if baseline scan marker exists
          if [ -f .trufflehog-baseline ]; then
            echo "has_baseline=true" >> $GITHUB_OUTPUT
          else
            echo "has_baseline=false" >> $GITHUB_OUTPUT
          fi

  full-scan:
    needs: check-scan-status
    if: needs.check-scan-status.outputs.has_baseline == 'false'
    runs-on: ubuntu-latest
    steps:
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          version: latest
          # No base/head = full repo scan
      - name: Create baseline marker
        run: touch .trufflehog-baseline && git add .trufflehog-baseline && git commit -m "chore: TruffleHog baseline scan complete"

  incremental-scan:
    needs: check-scan-status
    if: needs.check-scan-status.outputs.has_baseline == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.before }}
          head: ${{ github.event.after }}
          version: latest
```

**Pros**:
- Clear separation between initial and incremental scans
- Explicit tracking of scan state
- Can customize behavior for each scan type
- Good for complex security requirements

**Cons**:
- Most complex implementation (2 jobs + state management)
- Requires committing marker file to repository
- More YAML to maintain
- Could cause issues if marker file is accidentally deleted

**When to use**: Only when you need explicit control over initial vs incremental scanning with state tracking.

## Recommendation

**Use Approach 1: Remove BASE/HEAD parameters**

This approach is recommended because:

1. **Simplest solution**: Just remove 2 lines from the workflow - minimal change, minimal risk
2. **Leverages built-in logic**: TruffleHog's event-type detection handles push events correctly when BASE/HEAD aren't forced
3. **Future-proof**: Automatically works for PR workflows when adopted (no configuration changes needed)
4. **Handles first scan**: The action's logic treats the first push correctly by scanning from repo root
5. **Well-tested**: This is how TruffleHog is designed to work by default

The current failure occurs specifically because hardcoded `base: main` and `head: HEAD` override the smart event detection. By removing these parameters, the action will:
- Use `github.event.before` and `github.event.after` for push events (lines 38-47 of the action)
- Scan only new commits on subsequent pushes
- Work correctly for PRs when that workflow is adopted

**Alternative if more control needed**: Approach 2 provides explicit BASE/HEAD values per event type while maintaining simplicity.

## Decisions Decided During Exploration

1. ✓ **Scan entire repo initially, then incremental** - First run will scan full history, subsequent runs scan only new commits
2. ✓ **Run on every push to main** - Keep current trigger, don't change to scheduled or manual
3. ✓ **Support PR scanning when workflow changes** - Configuration must work for future PR-based development
4. ✓ **Keep direct-to-main workflow** - No branches/PRs until after initial release (current workflow stays)

## Decisions Needed

**No Decisions Needed**

All technical decisions were resolved during conversational exploration.

## Test Intentions

**Initial Repository Scan**:
- First workflow run should scan entire repository history for secrets
- Should not fail with "BASE and HEAD are the same" error
- Should detect any secrets present in historical commits

**Incremental Scanning on Subsequent Pushes**:
- After initial scan, each push should only scan new commits since previous push
- Should use commit range from `github.event.before` to `github.event.after`
- Should not re-scan unchanged files or commits

**Direct Push to Main Compatibility**:
- Workflow should succeed on direct pushes to main branch
- Should not require PR workflow to function correctly
- Should properly resolve BASE and HEAD commits for comparison

**Future PR Workflow Support**:
- Configuration should work unchanged when PR workflow is adopted
- Should scan PR diff when event type is `pull_request`
- Should integrate with PR status checks when that workflow is enabled

**Security Gate Enforcement**:
- CI build should fail if secrets are detected in scanned commits
- `--fail` flag behavior should be preserved
- Should block merge/push if secrets found

---

*Exploration completed: 2025-10-05T01:07:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
