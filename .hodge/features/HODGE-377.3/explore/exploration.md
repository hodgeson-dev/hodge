# Exploration: Auto-Generated File Management and Regeneration for Team Workflows

**Created**: 2025-11-02
**Status**: Exploring

## Problem Statement

In team workflows, auto-generated files like architecture-graph.dot and ship-record.json create unnecessary merge conflicts when multiple developers work in parallel branches. These files provide context for AI but don't need to be shared in version control, as they can be regenerated on-demand from the current codebase state.

## Context

**Project Type**: Framework Enhancement (Team Collaboration - Conflict Prevention)

**Parent Feature**: HODGE-377 - Team Development with Feature Branches & Workflow Refinement

This is the third sub-feature of the HODGE-377 epic. It builds on HODGE-377.1's team mode detection and HODGE-377.2's PM-required feature creation by addressing the remaining conflict scenarios in team development. The parent exploration identified architecture graph conflicts as "important" issues needing tooling support.

## Related Features

- HODGE-377 - Parent epic (Team Development)
- HODGE-377.1 - Team Mode Detection & Configuration (shipped)
- HODGE-377.2 - PM-Required Feature Creation (shipped)
- HODGE-002 - PM integration foundation
- HODGE-004 - Context management

## Conversation Summary

We explored what conflict scenarios remain after siblings 377.1 and 377.2 shipped. The key insight was that most critical conflicts are already solved: feature ID collisions are prevented by PM-provided IDs, and session context (context.json) is gitignored.

The architecture-graph.dot file was originally planned for "team visibility into codebase structure," but in practice it's an AI context file, not a team collaboration artifact. Each developer's branch diverges, making a shared graph meaningless. The graph is auto-generated from dependency-cruiser, so it can be regenerated on-demand.

We established a clear principle: **If the file is auto-generated, gitignore it and regenerate after pull/merge/rebase. If the file is human-authored, use standard Git workflows.**

This led to identifying ship-record.json as another auto-generated artifact that should be gitignored. These records contain validation results and commit SHAs from individual ships - useful historical data but not team-shared state.

The solution emerged as dramatically simpler than the original epic scope: instead of building special conflict resolution tooling (`hodge resolve --graph` with fancy detection), we just need a simple `hodge regen` command that regenerates the architecture graph.

For fresh clones, we determined that `hodge init` should generate the architecture graph immediately so AI has context from the start. Developers can optionally automate regeneration with git hooks (post-merge, post-rewrite), but manual `hodge regen` after pulls is the baseline workflow.

Documentation location was discussed - either README.md or docs/ directory for git hook setup instructions.

## Implementation Approaches

### Approach 1: Gitignore + Simple Regeneration Command (Recommended)

**Description**:

Gitignore all auto-generated context files and provide a simple `hodge regen` command that regenerates them on-demand. The command has no special conflict detection or resolution logic - it just re-runs the generation code. `hodge init` is updated to both create the gitignore patterns and generate the initial architecture graph.

**Architecture**:
```typescript
// New command: hodge regen
class RegenCommand {
  async execute(): Promise<void> {
    // Reuse existing graph generation from ShipService
    await this.generateArchitectureGraph();
    console.log('✓ Regenerated architecture-graph.dot');
  }
}

// Updated: hodge init
class InitCommand {
  async execute(): Promise<void> {
    // ... existing init logic ...

    // Create/append .hodge/.gitignore
    await this.createGitignorePatterns([
      'context.json',                    // From 377.1
      'architecture-graph.dot',          // New
      'features/**/ship-record.json'     // New (** matches any nesting)
    ]);

    // Generate initial architecture graph
    await this.generateArchitectureGraph();
    console.log('✓ Generated architecture-graph.dot');
  }
}
```

**Gitignore patterns**:
```
# .hodge/.gitignore
context.json
architecture-graph.dot
features/**/ship-record.json
```

**Developer workflow**:
```bash
# Fresh clone
git clone <repo>
hodge init          # Creates structure + generates graph

# After pull/merge/rebase
git pull
hodge regen         # Regenerate graph with latest code

# Optional automation with git hooks
# .git/hooks/post-merge and .git/hooks/post-rewrite:
#!/bin/sh
hodge regen
```

**Pros**:
- Dead simple - no special conflict detection needed
- Safe to run anytime (no side effects)
- Reuses existing graph generation code
- Clear developer workflow (pull → regen)
- Gitignore prevents accidental commits
- Works for solo and team workflows identically
- Fresh clones get context immediately via init

**Cons**:
- Requires manual `hodge regen` after pulls (unless developer sets up hooks)
- Each developer has their own graph (but this is actually a feature, not a bug)
- No validation that graph is current (but staleness doesn't break anything)

**When to use**:
When you want the simplest solution that prevents conflicts without adding workflow complexity. Best for teams that value simplicity over automation.

---

### Approach 2: Shared Graph with Conflict Resolution Tooling

**Description**:

Keep architecture-graph.dot in version control and build `hodge resolve --graph` command that detects merge conflicts in the graph file and regenerates it. Add pre-commit hooks that validate the graph is current before allowing commits.

**Architecture**:
```typescript
// New command: hodge resolve
class ResolveCommand {
  async execute(options: { graph?: boolean }): Promise<void> {
    if (options.graph) {
      // Detect if architecture-graph.dot has conflicts
      const hasConflicts = await this.detectGraphConflicts();

      if (hasConflicts) {
        console.log('⚠️ Conflict detected in architecture-graph.dot');
        console.log('Regenerating from current codebase...');
        await this.generateArchitectureGraph();
        console.log('✓ Resolved architecture graph conflicts');
      } else {
        console.log('✓ No conflicts found in architecture graph');
      }
    }
  }

  private async detectGraphConflicts(): Promise<boolean> {
    const content = await fs.readFile('.hodge/architecture-graph.dot', 'utf-8');
    return content.includes('<<<<<<<') || content.includes('>>>>>>>');
  }
}

// Pre-commit hook validation
class GraphValidator {
  async validateGraphCurrent(): Promise<boolean> {
    const currentGraph = await this.generateArchitectureGraph();
    const committedGraph = await fs.readFile('.hodge/architecture-graph.dot');
    return currentGraph === committedGraph;
  }
}
```

**Pros**:
- Shared architecture graph in version control
- Team sees consolidated view of codebase structure
- Automated conflict detection
- Prevents committing stale graphs

**Cons**:
- More complex implementation (conflict detection, validation)
- Graph diverges immediately on each branch (shared view is misleading)
- Pre-commit hooks slow down commits
- False positives (graph changes during normal development)
- Requires hook setup during init (or manual installation)
- Violates principle: "auto-generated files should be gitignored"
- Merge conflicts still happen (just with better tooling to resolve them)

**When to use**:
When team collaboration benefits outweigh the complexity cost, and the team wants a single canonical graph view.

---

### Approach 3: Lazy Regeneration with Staleness Detection

**Description**:

Gitignore architecture-graph.dot but add automatic staleness detection to commands that use the graph. When commands need the graph for AI context, check if it's stale and regenerate automatically. No manual `hodge regen` needed.

**Architecture**:
```typescript
// Automatic staleness detection
class ArchitectureGraphService {
  async ensureCurrentGraph(): Promise<void> {
    const graphExists = await fs.pathExists('.hodge/architecture-graph.dot');

    if (!graphExists) {
      await this.generateGraph();
      return;
    }

    // Check staleness: compare graph mtime to most recent source file mtime
    const graphMtime = (await fs.stat('.hodge/architecture-graph.dot')).mtime;
    const latestSourceMtime = await this.findLatestSourceFileMtime();

    if (latestSourceMtime > graphMtime) {
      console.log('⚠️ Architecture graph is stale, regenerating...');
      await this.generateGraph();
    }
  }

  private async findLatestSourceFileMtime(): Promise<Date> {
    // Find most recent modification time in src/
    // ... implementation ...
  }
}

// Commands that use graph context call ensureCurrentGraph() automatically
class ExploreCommand {
  async execute(): Promise<void> {
    await this.graphService.ensureCurrentGraph();
    // ... rest of explore logic ...
  }
}
```

**Pros**:
- Zero manual intervention (fully automatic)
- Graph always current when needed
- No git hooks required
- Developer doesn't think about regeneration

**Cons**:
- Staleness detection adds complexity
- Performance overhead (mtime checks on every command)
- False staleness detection (touching files doesn't mean graph changed)
- Surprising behavior (commands regenerating things silently)
- Harder to test (implicit regeneration logic scattered across commands)
- Unnecessary regeneration (graph might not have changed)

**When to use**:
When developer experience prioritizes "zero thought" automation over simplicity and predictability.

---

## Recommendation

**Approach 1 - Gitignore + Simple Regeneration Command**

**Rationale**:

Approach 1 aligns perfectly with the principle established during exploration: auto-generated files should be gitignored and regenerated on-demand. The architecture graph is AI context, not team collaboration state. Each developer's branch diverges, so maintaining a shared graph creates false conflicts without providing value.

The simplicity is compelling: `hodge regen` has no special logic beyond "regenerate the graph." It's safe to run anytime, doesn't require state management or conflict detection, and reuses existing generation code from ShipService. Developers understand the workflow immediately: pull changes, regenerate context.

Fresh clones work seamlessly because `hodge init` generates the initial graph. Developers who want automation can set up git hooks (post-merge, post-rewrite) with one line: `hodge regen`. Those who prefer manual control just run it after pulls.

The gitignore patterns are future-proof: `features/**/ship-record.json` handles any nesting level, preventing ship records from cluttering version control while preserving them locally for debugging.

This approach is dramatically simpler than the original HODGE-377 parent epic envisioned ("Conflict Resolution Guidance" with `hodge resolve --graph` and conflict detection). The insight: 377.1 and 377.2 already solved the critical conflicts. What remains are auto-generated files that shouldn't be shared.

Documentation in README.md or docs/ provides clear guidance without adding mandatory workflows. Teams can adopt git hook automation if they want it, or stick with manual regeneration.

The approach scales: as we identify other auto-generated context files (optimized YAML review profiles, etc.), we simply add them to `hodge regen` and update gitignore patterns.

## Test Intentions

### Core Behaviors

1. **`hodge regen` regenerates architecture-graph.dot using dependency-cruiser**
   - Command executes existing graph generation logic
   - Writes updated graph to `.hodge/architecture-graph.dot`
   - Graph content matches current codebase structure

2. **`hodge regen` outputs success message**
   - Console shows: "✓ Regenerated architecture-graph.dot"
   - Clear confirmation that regeneration completed

3. **`hodge regen` succeeds even if architecture-graph.dot doesn't exist yet**
   - Fresh state (no graph file) → generates new graph
   - Exit code 0 (success)
   - No errors about missing file

4. **`hodge regen` errors clearly if dependency-cruiser not configured**
   - Missing .dependency-cruiser.cjs config → clear error
   - Error message: "dependency-cruiser not configured. Run 'hodge init' to set up toolchain."
   - Exit code non-zero (failure)

5. **`hodge regen` can be run safely anytime**
   - No side effects beyond regenerating graph
   - Doesn't modify source code, commit history, or other state
   - Safe to run in dirty working directory
   - Safe to run multiple times (idempotent)

6. **`hodge init` creates `.hodge/.gitignore` with all three patterns**
   - Fresh init → creates `.hodge/.gitignore` file
   - Contains: `context.json`, `architecture-graph.dot`, `features/**/ship-record.json`
   - Each pattern on separate line

7. **`hodge init` generates architecture-graph.dot automatically**
   - After creating `.hodge/` structure
   - Runs graph generation immediately
   - Console shows: "✓ Generated architecture-graph.dot"
   - Fresh clones have graph for AI context

8. **`hodge init` appends new patterns if .gitignore already exists**
   - Existing `.hodge/.gitignore` with custom entries → preserved
   - New patterns appended (not overwritten)
   - No duplicate entries if pattern already exists
   - Handles projects initialized before HODGE-377.3

9. **Gitignore patterns prevent git from staging ignored files**
   - `git add .hodge/architecture-graph.dot` → not staged
   - `git add .hodge/features/HODGE-123/ship-record.json` → not staged
   - Git status shows files as ignored
   - Patterns work with nested feature paths (`features/**/ship-record.json`)

### Edge Cases

10. **`hodge regen` handles missing src/ directory gracefully**
    - Project with no source code yet → warns but doesn't fail
    - Or skips graph generation with informative message

11. **Git hook documentation accessible**
    - README.md or docs/ contains git hook setup instructions
    - Shows post-merge and post-rewrite hook examples
    - Clarifies hooks are optional automation

12. **Multiple ship-record.json nesting levels**
    - Pattern `features/**/ship-record.json` matches:
      - `.hodge/features/HODGE-123/ship-record.json` ✓
      - `.hodge/features/HODGE-377.1/ship-record.json` ✓
      - Future nested structures ✓

## Decisions Decided During Exploration

1. ✓ **Gitignore architecture-graph.dot**: Auto-generated AI context, developer-local, regenerated as needed
2. ✓ **Gitignore ship-record.json files**: Historical artifacts, not team-shared state
3. ✓ **Create `hodge regen` command**: Simple regeneration of architecture-graph.dot
4. ✓ **`hodge regen` output**: Show "✓ Regenerated architecture-graph.dot" for confirmation
5. ✓ **`hodge regen` safety**: Safe to run anytime, no side effects beyond regenerating graph
6. ✓ **Error handling**: Clear error if dependency-cruiser not configured
7. ✓ **`hodge init` graph generation**: Generate architecture-graph.dot immediately during init
8. ✓ **`hodge init` gitignore management**: Create/update `.hodge/.gitignore` with three patterns
9. ✓ **Gitignore pattern for ship records**: Use `features/**/ship-record.json` (matches any nesting)
10. ✓ **Documentation location**: README.md or docs/ directory for git hook setup
11. ✓ **Git hooks optional**: post-merge and post-rewrite hooks available for automation, but not required
12. ✓ **Human-authored file handling**: Standard Git workflows (merge/rebase) for standards.md, principles.md, etc.
13. ✓ **Auto-generated file principle**: If auto-generated → gitignore and regenerate; if human-authored → version control
14. ✓ **Scope reduction**: No special conflict resolution tooling needed (377.1/377.2 solved critical conflicts)

## No Decisions Needed

All architectural questions resolved during exploration conversation.

## Next Steps

1. ✅ Exploration complete - all decisions resolved
2. Ready for `/build HODGE-377.3` to implement gitignore patterns and regen command
3. This completes the conflict prevention infrastructure for HODGE-377 epic
