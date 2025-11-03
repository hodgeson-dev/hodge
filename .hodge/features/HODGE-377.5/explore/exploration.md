# Exploration: Feature ID Abstraction - Remove Hardcoded HODGE- Patterns for Multi-Adapter Support

**Created**: 2025-11-03
**Status**: Exploring

## Problem Statement

The codebase has ~711 hardcoded references to the HODGE- ID pattern across 123 TypeScript files, preventing seamless use of Linear, GitHub, and other PM tools. Feature IDs should work transparently regardless of PM adapter format (HODGE-377, HOD-123, PROJ-456, #123), enabling developers to use any PM tool without encountering pattern validation errors or broken functionality.

## Context

**Project Type**: Framework Enhancement (Team Collaboration - PM Integration Refactoring)

**Parent Feature**: HODGE-377 - Team Development with Feature Branches & Workflow Refinement

This is the fifth sub-feature of the HODGE-377 epic. It builds on HODGE-377.1's team mode detection, HODGE-377.2's PM-required feature creation, HODGE-377.3's gitignore/regeneration infrastructure, and HODGE-377.4's PM comment synchronization by removing the final blocker: hardcoded HODGE- pattern assumptions throughout the codebase.

## Related Features

- HODGE-377 - Parent epic (Team Development)
- HODGE-377.1 - Team Mode Detection & Configuration (shipped)
- HODGE-377.2 - PM-Required Feature Creation (shipped)
- HODGE-377.3 - Auto-Generated File Management (shipped)
- HODGE-377.4 - PM Comment Synchronization Foundation (shipped)
- HODGE-002 - PM integration foundation
- HODGE-004 - Context management

## Conversation Summary

We explored how to remove hardcoded HODGE- pattern assumptions while maintaining backward compatibility and enabling multi-adapter support. The key insight: the refactoring scope is much smaller than initially estimated - only 4 core production files need changes, with ~600 test occurrences kept as-is since they test LocalAdapter behavior.

The conversation clarified that feature directories remain unchanged (no renaming when switching PM tools), and feature IDs are permanently bound to their creating adapter. A feature created as HODGE-377 with LocalAdapter stays HODGE-377 forever; a feature created as HOD-123 with LinearAdapter stays HOD-123 forever. This significantly simplifies the scope by eliminating cross-adapter migration concerns.

For sub-feature relationships, we determined that all PM adapters must support sub-features, but via different mechanisms. LocalAdapter uses directory naming conventions (HODGE-377 → HODGE-377.1, HODGE-377.2), while Linear and GitHub adapters use their PM tools' native parent/child relationships via API calls. This requires extending the BasePMAdapter interface with three new methods: `isEpic()`, `getSubIssues()`, and `getParentIssue()`.

The actual hardcoded patterns are concentrated in four core files: `id-manager.ts` (7 occurrences with `/^HODGE-\d+(\.\d+)?$/` regex), `local-pm-adapter.ts` (19 occurrences in auto-increment logic), `sub-feature-context-service.ts` (8 occurrences with `/^(HODGE-\d+)\.(\d+)$/` regex for parent detection), and `lessons.ts` (feature ID extraction regex). The remaining ~600 occurrences are test fixtures and comments that should remain unchanged.

For test fixtures, we confirmed that tests should continue using HODGE-XXX examples since LocalAdapter is the default adapter. When testing Linear or GitHub adapter-specific behavior, tests will mock those adapters' API responses. Error messages should be adapter-agnostic ("Feature ID must match PM adapter format") rather than HODGE-specific. Documentation examples should use HODGE-XXX as the default with adapter-specific examples when documenting adapter-specific behavior.

The refactoring approach involves adding the three sub-feature methods to BasePMAdapter and refactoring the four core files to call adapter methods instead of using hardcoded regex patterns. This keeps all PM-specific logic within adapters, consistent with the architecture established in HODGE-377.1-4.

## Implementation Approaches

### Approach 1: Adapter-Centric Sub-Feature Detection (Recommended)

**Description**:

Extend the PM adapter interface with sub-feature methods (`isEpic`, `getSubIssues`, `getParentIssue`) and refactor the 4 core files to call adapter methods instead of using hardcoded HODGE- patterns. Each adapter implements sub-feature detection according to its own mechanism: LocalAdapter parses directory names, LinearAdapter calls Linear API, GitHubAdapter parses task lists or labels.

**Architecture**:
```typescript
// Extended BasePMAdapter interface
interface BasePMAdapter {
  // Existing from HODGE-377.1-4...
  isValidIssueID(input: string): boolean;
  fetchIssue(id: string): Promise<PMIssue>;
  createIssue(title: string, description: string): Promise<PMIssue>;
  appendComment(issueId: string, comment: string): Promise<void>;

  // New for HODGE-377.5: Sub-feature support
  isEpic(issueId: string): Promise<boolean>;
  getSubIssues(epicId: string): Promise<PMIssue[]>;
  getParentIssue(issueId: string): Promise<string | null>;
}

// LocalAdapter implementation
class LocalAdapter implements BasePMAdapter {
  async isEpic(issueId: string): Promise<boolean> {
    // Check if any directories match HODGE-377.1, HODGE-377.2 pattern
    const subFeatureDirs = fs.readdirSync('.hodge/features/')
      .filter(dir => dir.startsWith(`${issueId}.`) && /^\d+$/.test(dir.split('.')[1]));
    return subFeatureDirs.length > 0;
  }

  async getSubIssues(epicId: string): Promise<PMIssue[]> {
    // Find all subdirectories matching HODGE-377.1, HODGE-377.2, etc.
    const pattern = new RegExp(`^${this.escapeRegex(epicId)}\\.(\\d+)$`);
    const subDirs = fs.readdirSync('.hodge/features/')
      .filter(dir => pattern.test(dir))
      .sort((a, b) => {
        const aNum = parseInt(a.split('.').pop()!);
        const bNum = parseInt(b.split('.').pop()!);
        return aNum - bNum;
      });

    return subDirs.map(id => ({
      id,
      title: `Sub-feature ${id}`,
      description: '', // Read from exploration.md if available
      url: ''
    }));
  }

  async getParentIssue(issueId: string): Promise<string | null> {
    // Parse HODGE-377.1 → HODGE-377
    const match = issueId.match(/^(.+)\.(\d+)$/);
    return match ? match[1] : null;
  }
}

// LinearAdapter implementation
class LinearAdapter implements BasePMAdapter {
  async isEpic(issueId: string): Promise<boolean> {
    const issue = await this.client.issue(issueId);
    return (issue.children?.nodes?.length ?? 0) > 0;
  }

  async getSubIssues(epicId: string): Promise<PMIssue[]> {
    const issue = await this.client.issue(epicId);
    return (issue.children?.nodes ?? []).map(child => ({
      id: child.identifier,
      title: child.title,
      description: child.description ?? '',
      url: child.url
    }));
  }

  async getParentIssue(issueId: string): Promise<string | null> {
    const issue = await this.client.issue(issueId);
    return issue.parent?.identifier ?? null;
  }
}

// GitHubAdapter implementation
class GitHubAdapter implements BasePMAdapter {
  async isEpic(issueId: string): Promise<boolean> {
    const issue = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(issueId.replace('#', ''))
    });

    // Check for epic label
    if (issue.data.labels.some(l =>
      typeof l === 'object' && l.name?.toLowerCase() === 'epic'
    )) {
      return true;
    }

    // Check for task list items in body
    return /- \[[ x]\] #\d+/.test(issue.data.body ?? '');
  }

  async getSubIssues(epicId: string): Promise<PMIssue[]> {
    const issue = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(epicId.replace('#', ''))
    });

    // Parse task list for sub-issue numbers
    const taskListPattern = /- \[[ x]\] #(\d+)/g;
    const subIssueNumbers: number[] = [];
    let match;
    while ((match = taskListPattern.exec(issue.data.body ?? '')) !== null) {
      subIssueNumbers.push(parseInt(match[1]));
    }

    // Fetch each sub-issue
    const subIssues = await Promise.all(
      subIssueNumbers.map(num =>
        this.octokit.issues.get({ owner: this.owner, repo: this.repo, issue_number: num })
      )
    );

    return subIssues.map(res => ({
      id: `#${res.data.number}`,
      title: res.data.title,
      description: res.data.body ?? '',
      url: res.data.html_url
    }));
  }

  async getParentIssue(issueId: string): Promise<string | null> {
    // GitHub doesn't have native parent/child - would need to parse
    // "Part of #123" conventions from issue body
    // For now, return null (can enhance later)
    return null;
  }
}
```

**Refactored Services**:
```typescript
// sub-feature-context-service.ts (before)
detectSubFeaturePattern(featureId: string) {
  const subFeaturePattern = /^(HODGE-\d+)\.(\d+)$/;
  const match = featureId.match(subFeaturePattern);
  if (match) {
    return { parent: match[1], subNumber: match[2] };
  }
  return null;
}

// sub-feature-context-service.ts (after)
async detectSubFeaturePattern(featureId: string) {
  const adapter = await this.getAdapterForFeature(featureId);
  const parentId = await adapter.getParentIssue(featureId);
  if (parentId) {
    return { parent: parentId, isSubFeature: true };
  }
  return null;
}

async loadSiblingContext(parentId: string) {
  const adapter = await this.getAdapterForFeature(parentId);
  const siblings = await adapter.getSubIssues(parentId);
  // Load context from each sibling's exploration.md...
}

// id-manager.ts changes
async ensureFeatureID(name: string): Promise<string> {
  // Remove hardcoded /^HODGE-\d+(\.\d+)?$/ check
  // Use adapter.isValidIssueID() instead
  for (const adapter of [this.localAdapter, this.linearAdapter, this.githubAdapter]) {
    if (adapter?.isValidIssueID(name)) {
      return name; // Already a valid ID
    }
  }

  // Not a valid ID, generate new one via LocalAdapter
  return this.generateNextID();
}
```

**Pros**:
- Clean separation: Each adapter owns its sub-feature detection logic
- Consistent with HODGE-377.1-4 adapter pattern
- Easy to add new adapters (just implement 3 methods)
- LocalAdapter keeps HODGE-XXX.Y pattern, others use PM-native relationships
- No new service layer (minimal complexity)
- Aligns with existing architecture

**Cons**:
- Requires async calls where we previously had synchronous regex checks
- LinearAdapter/GitHubAdapter make API calls (potential performance impact)
- Need to determine which adapter owns a feature ID (requires adapter lookup)
- Must handle API failures gracefully (network errors, rate limits)

**When to use**:
When you want the cleanest abstraction that aligns with existing adapter architecture and are comfortable with async sub-feature detection in non-hot-path code.

---

### Approach 2: FeatureIDService Abstraction with Caching

**Description**:

Create a new `FeatureIDService` that sits between commands/services and PM adapters. This service provides a unified interface for all ID-related operations and caches API results to minimize calls to Linear/GitHub.

**Architecture**:
```typescript
// New service
class FeatureIDService {
  private adapterCache = new Map<string, BasePMAdapter>();
  private epicCache = new Map<string, boolean>();
  private subIssueCache = new Map<string, PMIssue[]>();

  constructor(
    private adapters: {
      local: LocalAdapter;
      linear?: LinearAdapter;
      github?: GitHubAdapter
    }
  ) {}

  async getAdapterForFeature(featureId: string): Promise<BasePMAdapter> {
    if (this.adapterCache.has(featureId)) {
      return this.adapterCache.get(featureId)!;
    }

    // Determine adapter based on ID format
    for (const adapter of Object.values(this.adapters)) {
      if (adapter?.isValidIssueID(featureId)) {
        this.adapterCache.set(featureId, adapter);
        return adapter;
      }
    }

    throw new Error(`No adapter found for feature ID: ${featureId}`);
  }

  async isEpic(featureId: string): Promise<boolean> {
    if (this.epicCache.has(featureId)) {
      return this.epicCache.get(featureId)!;
    }

    const adapter = await this.getAdapterForFeature(featureId);
    const result = await adapter.isEpic(featureId);
    this.epicCache.set(featureId, result);
    return result;
  }

  async getSubIssues(epicId: string): Promise<PMIssue[]> {
    if (this.subIssueCache.has(epicId)) {
      return this.subIssueCache.get(epicId)!;
    }

    const adapter = await this.getAdapterForFeature(epicId);
    const result = await adapter.getSubIssues(epicId);
    this.subIssueCache.set(epicId, result);
    return result;
  }

  clearCache(): void {
    this.epicCache.clear();
    this.subIssueCache.clear();
  }
}
```

**Pros**:
- Caching reduces API calls to Linear/GitHub
- Single place to manage adapter lookup logic
- Easy to add cross-cutting concerns (logging, metrics, retry logic)
- Clear interface for all ID operations
- Can batch API calls if needed

**Cons**:
- New service layer adds complexity
- Cache invalidation logic needed (when do we clear cache?)
- More indirection (commands → FeatureIDService → adapter)
- Overkill if API performance isn't a concern
- Premature optimization

**When to use**:
When PM API calls are expensive/slow and you need caching, or when you anticipate adding more cross-cutting concerns around ID operations.

---

### Approach 3: Minimal Refactoring with Helper Methods

**Description**:

Keep existing service structure but add helper methods that make the hardcoded patterns adapter-aware. Minimize changes by adding compatibility shims that try adapter methods first, then fall back to HODGE- pattern matching.

**Architecture**:
```typescript
// id-manager.ts - Add helper methods
class IDManager {
  async isValidFeatureID(id: string): Promise<boolean> {
    // Try each adapter
    if (this.localAdapter.isValidIssueID(id)) return true;
    if (this.linearAdapter?.isValidIssueID(id)) return true;
    if (this.githubAdapter?.isValidIssueID(id)) return true;

    // Fallback: Check if directory exists
    return fs.existsSync(`.hodge/features/${id}`);
  }

  async getParentFeatureID(featureId: string): Promise<string | null> {
    // Try adapter detection first
    const adapter = await this.getAdapterForFeature(featureId);
    if (adapter) {
      return adapter.getParentIssue(featureId);
    }

    // Fallback to LocalAdapter pattern for backward compat
    const match = featureId.match(/^(.+)\.(\d+)$/);
    return match ? match[1] : null;
  }
}
```

**Pros**:
- Minimal code changes (add helpers, not full refactor)
- Backward compatible (fallback to existing logic)
- Incremental migration path
- Less risk of breaking existing functionality
- Can be done incrementally over multiple PRs

**Cons**:
- Leaves technical debt (helper methods instead of clean abstractions)
- Mixing old patterns (regex fallbacks) with new patterns (adapter calls)
- Harder to maintain long-term
- Doesn't fully solve the abstraction problem
- Fallback logic can hide bugs

**When to use**:
When you need a quick solution with minimal risk, or as Phase 1 of a multi-phase refactor where you validate the approach before full commitment.

---

## Recommendation

**Approach 1 - Adapter-Centric Sub-Feature Detection**

**Rationale**:

Approach 1 provides the cleanest architecture that aligns with HODGE-377.1-4's adapter pattern. Adding `isEpic()`, `getSubIssues()`, and `getParentIssue()` to the BasePMAdapter interface is a natural extension that keeps all PM-specific logic within adapters, maintaining the architectural principle established in previous sub-features.

The async nature of these methods is acceptable because sub-feature detection happens during `/explore` context loading and `/plan` workflow command execution - not in hot paths where latency matters. The sub-feature context loading is inherently I/O-bound (reading exploration.md files from disk), so adding async API calls doesn't significantly change the performance profile.

Approach 2's caching layer is premature optimization. We should measure performance first before adding complexity. If Linear/GitHub API calls become a bottleneck, caching can be added to the adapters themselves without changing the interface. The FeatureIDService adds indirection that makes the codebase harder to understand for marginal benefit.

Approach 3's fallback logic leaves technical debt that will make future adapter additions harder. Mixing old patterns (regex fallbacks) with new patterns (adapter calls) creates confusion about which code path is canonical. The "backward compatibility" argument doesn't hold because we're not changing behavior - just moving the logic to the appropriate place (adapters).

The refactoring scope is focused on 4 core files (id-manager.ts, local-pm-adapter.ts, sub-feature-context-service.ts, lessons.ts) with well-defined boundaries. The ~600 test occurrences remain unchanged since they test LocalAdapter behavior. This makes it a low-risk change with high architectural value.

LocalAdapter's implementation is straightforward (directory name parsing), LinearAdapter and GitHubAdapter implementations leverage existing API client libraries, and all three adapters follow the same interface contract. This consistency makes the codebase easier to understand and maintain.

The approach also sets a clear precedent for future PM adapter implementations (Jira, Azure DevOps, etc.) - they simply implement the three sub-feature methods according to their PM tool's capabilities.

## Test Intentions

### Core Behaviors

1. **BasePMAdapter interface includes sub-feature methods**
   - `isEpic(issueId: string): Promise<boolean>` method defined
   - `getSubIssues(epicId: string): Promise<PMIssue[]>` method defined
   - `getParentIssue(issueId: string): Promise<string | null>` method defined
   - All adapters (Local, Linear, GitHub) implement these methods

2. **LocalAdapter detects epics via directory pattern**
   - Feature `HODGE-377` with subdirectories `HODGE-377.1`, `HODGE-377.2` → `isEpic('HODGE-377')` returns `true`
   - Feature `HODGE-377` with no subdirectories → `isEpic('HODGE-377')` returns `false`
   - `getSubIssues('HODGE-377')` returns array with `HODGE-377.1`, `HODGE-377.2`
   - Sub-issues sorted numerically (handles `HODGE-377.10` after `HODGE-377.9`)

3. **LocalAdapter detects parent via pattern parsing**
   - `getParentIssue('HODGE-377.1')` returns `'HODGE-377'`
   - `getParentIssue('HODGE-377')` returns `null` (no parent - is root)
   - Works with multi-level nesting: `getParentIssue('HODGE-377.1.2')` returns `'HODGE-377.1'`

4. **LinearAdapter detects epics via Linear API**
   - Calls `client.issue(issueId)` to fetch issue details
   - Checks `issue.children.nodes.length > 0` to determine if epic
   - Returns `true` if issue has sub-issues, `false` otherwise

5. **LinearAdapter fetches sub-issues via Linear API**
   - `getSubIssues(epicId)` calls Linear API to fetch child issues
   - Returns array of PMIssue objects with Linear identifiers (e.g., `PROJ-124`, `PROJ-125`)
   - Includes `title`, `description`, `url` from API response
   - Preserves API ordering

6. **GitHubAdapter detects epics via labels or task lists**
   - Issue with "epic" label → `isEpic()` returns `true`
   - Issue with task list (`- [ ] #123`, `- [x] #456`) → `isEpic()` returns `true`
   - Regular issue (no label, no task list) → `isEpic()` returns `false`

7. **GitHubAdapter parses sub-issues from task lists**
   - Extracts issue numbers from task list pattern `- [ ] #123`
   - Fetches each sub-issue via GitHub API
   - Returns PMIssue array with GitHub issue data (`#123`, `#456`)
   - Preserves task list order

8. **SubFeatureContextService uses adapter methods**
   - No hardcoded `/^HODGE-\d+/` regex patterns in production code
   - Calls `adapter.getParentIssue(featureId)` for parent detection
   - Calls `adapter.getSubIssues(epicId)` for sibling loading
   - Async throughout (no synchronous regex checks)

9. **IDManager validates IDs via adapters**
   - No hardcoded `HODGE-` string literal checks
   - Tries each available adapter's `isValidIssueID()` method
   - Falls back to directory existence check if no adapter matches
   - Adapter lookup is deterministic

10. **Error messages are adapter-agnostic**
    - Generic message: "Feature ID must match the configured PM adapter's format"
    - Not HODGE-specific: "Must be in HODGE-xxx format" (removed)
    - Error messages include which adapters were tried

### Edge Cases

11. **Handle missing adapter gracefully**
    - Feature ID doesn't match any adapter's `isValidIssueID()` → check if directory exists
    - If directory exists, proceed with operation
    - If directory doesn't exist, show clear error: "Feature {id} not found"

12. **Handle API failures in Linear/GitHub adapters**
    - Network error during `isEpic()` → log warning, return `false`
    - 404 for issue in `getSubIssues()` → log warning, return empty array `[]`
    - 404 for issue in `getParentIssue()` → log warning, return `null`
    - Don't crash workflow commands if PM API temporarily unavailable

13. **LocalAdapter handles malformed sub-feature patterns**
    - Directory `HODGE-377.abc` (non-numeric suffix) → ignored by `getSubIssues()`
    - Directory `HODGE-377.1.2.3` → parent is `HODGE-377.1.2` (immediate parent)
    - Directory name mismatch or non-feature directory → filtered out

14. **Sub-issue ordering is consistent**
    - LocalAdapter: Numeric sort by sub-feature number (1, 2, 10, not 1, 10, 2)
    - LinearAdapter: Preserves API order from Linear
    - GitHubAdapter: Preserves task list order from issue body

15. **Backward compatibility with existing HODGE-XXX features**
    - Existing `HODGE-001` through `HODGE-378` features continue working
    - No migration script required for old feature directories
    - Regex-based code replaced but behavior unchanged for LocalAdapter
    - Tests using HODGE-XXX fixtures pass without modification

16. **Adapter lookup is deterministic**
    - Given feature ID, always returns same adapter
    - LocalAdapter has priority for HODGE- pattern
    - LinearAdapter checked for configured Linear ID format
    - GitHubAdapter checked for #-prefixed numbers
    - Clear error if multiple adapters claim same ID format

17. **Documentation examples use HODGE-XXX as default**
    - JSDoc comments use HODGE-377 for generic examples
    - Adapter-specific docs show adapter-specific IDs (PROJ-123 for Linear, #456 for GitHub)
    - Error messages include example in correct format for active adapter

## Decisions Decided During Exploration

1. ✓ **Feature IDs bound to creating adapter**: HODGE-377 stays with LocalAdapter, HOD-123 stays with LinearAdapter, #456 stays with GitHubAdapter
2. ✓ **No adapter switching for existing features**: User handles edge cases with AI assistance if PM tool switch needed
3. ✓ **All adapters support sub-features**: Via different mechanisms (LocalAdapter naming, Linear/GitHub PM API)
4. ✓ **LocalAdapter keeps HODGE-XXX format**: Continue auto-increment HODGE-001, HODGE-002, etc.
5. ✓ **LocalAdapter sub-features via naming**: HODGE-377.1, HODGE-377.2 pattern parsed from directory names
6. ✓ **Linear/GitHub sub-features via PM API**: Native parent/child relationships from PM tools
7. ✓ **Adapter interface additions**: `isEpic()`, `getSubIssues()`, `getParentIssue()` methods
8. ✓ **Refactoring scope**: 4 core files (id-manager.ts, local-pm-adapter.ts, sub-feature-context-service.ts, lessons.ts)
9. ✓ **Test fixtures continue using HODGE-XXX**: LocalAdapter is default, tests unchanged
10. ✓ **Error messages adapter-agnostic**: Generic format messages, not HODGE-specific
11. ✓ **Documentation examples use HODGE-XXX**: With adapter-specific examples when documenting adapter behavior
12. ✓ **Async sub-feature detection acceptable**: Not a hot path, performance measured before adding caching
13. ✓ **Feature directories unchanged**: No renaming, keep original PM-provided IDs
14. ✓ **GitHubAdapter uses labels or task lists**: Epic detection via "epic" label or task list pattern
15. ✓ **API failure handling**: Graceful degradation, log warnings, return empty/null, don't crash

## No Decisions Needed

All architectural questions resolved during exploration conversation.
