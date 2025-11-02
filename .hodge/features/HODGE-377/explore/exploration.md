# Exploration: Team Development with Feature Branches & Workflow Refinement

**Created**: 2025-11-01
**Status**: Exploring

## Problem Statement

Hodge currently assumes solo developer workflows. Multiple developers working in parallel feature branches create conflicts: feature ID collisions (two devs both create HODGE-377), session context merge conflicts (.hodge/context.json), and lack of visibility into work-in-progress on team boards. Additionally, the current /explore → /decide workflow creates "big upfront design" that doesn't match how teams discover implementation details just-in-time.

## Context

**Project Type**: Framework Enhancement (Team Collaboration + Workflow)

## Related Features

- HODGE-001 - Initial feature structure
- HODGE-002 - PM integration foundation
- HODGE-004 - Context management

## Collision Points Identified

### Critical (Must Solve)
1. **Feature ID Conflicts** - Auto-increment HODGE-XXX numbering causes merge conflicts when developers work in parallel branches
2. **Session Context (.hodge/context.json)** - Tracks current feature per-developer, guaranteed conflict on merge
3. **Lessons Learned Filenames** - Could collide if not scoped to unique feature IDs

### Important (Need Tooling Support)
4. **Architecture Graph** - Updates after each ship, parallel ships create conflicts
5. **PM Integration Gaps** - Status updates are one-way (local → remote), no rich comments/descriptions, no blocker visibility

### Acceptable (Normal Git Workflow)
6. **Shared Metadata Files** - standards.md, decisions.md, principles.md conflicts handled via standard Git merge resolution

## Technical Analysis

**Embedded HODGE-XXX Assumptions**: 641 occurrences across 104 files hardcode HODGE- prefix checks and directory paths. This requires abstraction layer to support both solo (HODGE-XXX) and team (PM-provided IDs) modes.

**Workflow Mismatch**: Current /explore asks too many detailed questions upfront. Teams need: high-level exploration → plan/assign → detailed refinement just-before-build.

**Terminology Confusion**: /decide handles both project-level decisions (now covered by /codify) and feature-level implementation details (should be separate).

## Conversation Summary

We identified that team collaboration requires two fundamental shifts: (1) eliminating feature ID conflicts through PM-integrated mode, and (2) restructuring the exploration workflow to support team planning and assignment.

The feature ID issue has 641 hardcoded assumptions throughout the codebase requiring abstraction. A FeatureIDService layer can handle both HODGE-XXX (solo) and PM IDs (team) transparently.

The workflow issue revealed that /decide is redundant with /codify and should be replaced with /refine for feature-level implementation details. This creates a clean three-stage process:
- **/explore** → Approaches explored, one recommended (high-level "what")
- **/refine** → Implementation details decided (detailed "how")
- **/codify** → Project-wide decisions/standards/principles

PM integration needs enhancement to provide team visibility: append comments with refinements, auto-block issues when conflicts surface during /refine, and enable teams to see progress on their boards.

Session context should be gitignored (developer-local), while architecture graph conflicts should trigger regeneration rather than manual merging.

We determined this is genuinely an epic requiring 6 sub-features to solve comprehensively.

## Implementation Approaches

### Approach 1: Dual-Mode Architecture (Solo vs Team)

**Description**: Preserve solo developer experience (HODGE-XXX auto-increment) while adding team mode (PM-provided IDs). Mode detection based on PM integration credentials. Feature ID abstraction layer handles both formats transparently.

**Architecture**:
```
FeatureIDService (new abstraction layer)
  ├─ isTeamMode() → checks PM credentials
  ├─ createFeatureID(nameOrPMId) → HODGE-XXX or PM ID
  ├─ resolveFeaturePath(id) → .hodge/features/{id}/
  └─ isValidFeatureID(id) → validates format

Solo Mode:
  - Feature dirs: .hodge/features/HODGE-001/
  - Auto-increment from id-counter.json
  - No PM integration required

Team Mode:
  - Feature dirs: .hodge/features/HOD-123/ (PM ID directly)
  - No HODGE-XXX generation
  - PM tool provides unique IDs
  - .hodge/context.json gitignored
```

**Pros**:
- Preserves "freedom to explore" for solo developers
- No breaking changes to existing workflows
- Clean separation: PM credentials present = team mode
- Backward compatible with all existing HODGE-XXX features
- Aligns with Hodge philosophy: simplicity for solo, discipline for teams

**Cons**:
- Maintains two code paths (more complexity)
- Large refactoring effort (641 occurrences to abstract)
- Tests need to cover both modes
- Migration complexity for existing projects

**When to use**: When preserving solo developer simplicity is priority, team mode is opt-in

---

### Approach 2: Always-PM Architecture

**Description**: Require PM integration for all users, even solo developers. Retire HODGE-XXX numbering completely. Use Local PM adapter with HOD-XXX format for solo devs. All features use consistent PM-ID-based directory structure.

**Architecture**:
```
Single ID system:
  - Solo devs: HOD-001 via Local PM adapter
  - Team devs: HOD-123 via Linear/Jira/GitHub
  - Feature dirs always: .hodge/features/HOD-XXX/
  - No HODGE- prefix anywhere in codebase
```

**Pros**:
- Single code path (simpler maintenance)
- Consistent ID format across all projects
- Cleaner abstraction (no dual-mode logic)
- Easier to reason about and test
- Smaller refactoring effort (one format to support)

**Cons**:
- Forces solo devs to think about "project IDs" for quick explorations
- Breaks existing HODGE-XXX workflows entirely
- Less aligned with "freedom to explore" philosophy
- Requires migration for all existing features
- Higher barrier to entry for solo developers

**When to use**: When consistency and simplicity trump solo developer experience

---

### Approach 3: Federated ID System

**Description**: Each developer configures their own prefix (MIKE-XXX, SARAH-XXX) in .hodge/config.json. IDs are namespaced by developer. On merge, features retain developer-prefixed IDs. PM integration optional, maps any prefix to external IDs.

**Architecture**:
```
Per-developer namespacing:
  - Developer A: MIKE-001, MIKE-002, ...
  - Developer B: SARAH-001, SARAH-002, ...
  - Feature dirs: .hodge/features/{prefix}-{number}/
  - Configured during: hodge init (asks for prefix)
  - PM integration: Optional, maps prefix-ID → external ID
```

**Pros**:
- No PM requirement for teams
- Clear ownership (ID shows who created it)
- Simple conflict resolution (different prefixes can't collide)
- Works for teams without formal PM tools
- Preserves auto-increment simplicity

**Cons**:
- Developer-prefixed IDs less professional for PM boards
- Requires prefix configuration during init/onboarding
- Cognitive overhead (remembering who owns MIKE-045)
- Doesn't solve PM visibility problem for teams
- Unusual convention (not standard in industry)

**When to use**: When team uses Hodge but doesn't want PM tool integration

---

## Recommendation

**Approach 1 - Dual-Mode Architecture**

**Rationale**:

Approach 1 best aligns with Hodge's philosophy: "Freedom to explore, discipline to ship." Solo developers get frictionless HODGE-XXX auto-increment, teams get conflict-free PM integration.

The refactoring effort (641 occurrences) is significant but necessary - the abstraction layer (FeatureIDService) provides long-term maintainability and testability. The dual-mode strategy is proven in other tools (Git itself has different workflows for solo vs collaborative projects).

Migration strategy (Option A: grandfather existing features) minimizes risk while establishing clear "v2" boundary at HODGE-377. Features HODGE-001 through HODGE-376 keep their current structure; HODGE-377 onwards use the new structure.

The workflow refinement (explore → refine split) complements team mode perfectly: exploration outputs create plannable PM issues, refinement happens just-before-build and surfaces blockers with team visibility. Retiring /decide eliminates redundancy with /codify and clarifies terminology: approaches (explore), refinements (refine), decisions (codify).

**Epic Structure** (6 sub-features):

1. **HODGE-377.1: Team Mode Detection & Configuration**
   - Detect PM integration credentials → team mode
   - Add .hodge/context.json to .gitignore in team mode
   - `hodge init` asks: "Working solo or with a team?"

2. **HODGE-377.2: PM-Required Feature Creation**
   - Team mode enforces PM ID validation
   - Error guidance for missing PM IDs
   - Optional: `hodge explore --create "description"` creates PM issue + feature atomically

3. **HODGE-377.3: Conflict Resolution Guidance**
   - `hodge resolve --graph` regenerates architecture graph
   - Documentation for expected conflicts
   - Pre-commit hook warns about context.json in team mode

4. **HODGE-377.4: Enhanced PM Sync**
   - Append comments on /refine (refinements decided)
   - Auto-update status to "Blocked" when /refine detects conflicts
   - Append commit SHA on /ship
   - Update issue description with links to feature directory

5. **HODGE-377.5: Feature ID Abstraction & Refactoring**
   - Create FeatureIDService abstraction layer
   - Replace 641 hardcoded HODGE- checks
   - Update path construction throughout codebase
   - Maintain backward compatibility

6. **HODGE-377.6: /explore → /refine Workflow Implementation**
   - Update /explore to stop at approach selection (3-5 exchanges)
   - Rename /decide to /refine (feature-level implementation details)
   - Add blocker detection logic in /refine
   - Create refinements.md structure (replaces decisions.md in feature dirs)
   - Keep /codify for project-level decisions

## Test Intentions

**Parent Epic Level** (high-level behavioral expectations):

1. Solo developer workflow continues working unchanged (HODGE-XXX auto-increment, local tracking)
2. Team mode activates when PM integration detected (no HODGE-XXX generation, PM IDs required)
3. Feature ID conflicts prevented (no two developers create same ID)
4. Session context doesn't cause merge conflicts (.hodge/context.json gitignored in team mode)
5. PM issues show work progress (comments appended on refine/ship, status updated on phase transitions)
6. Refinement blockers visible on team boards (auto-update to "Blocked" status with explanation)
7. /explore conversations stay high-level (3-5 exchanges, stops at approach selection)
8. /refine surfaces implementation details and detects approach conflicts
9. Existing HODGE-XXX features continue working (backward compatibility)

## Decisions Decided During Exploration

1. ✓ **Team mode indicator**: Presence of PM integration credentials (not separate flag)
2. ✓ **Feature ID strategy**: Solo = HODGE-XXX auto-increment, Team = PM-provided IDs directly
3. ✓ **Session context**: Gitignore .hodge/context.json in team mode (developer-local)
4. ✓ **Architecture graph conflicts**: Regenerate via `hodge resolve --graph`, don't manually merge
5. ✓ **Shared metadata conflicts**: Accept as normal Git workflow (standards.md, decisions.md, principles.md)
6. ✓ **Lessons learned**: Filename = feature ID (conflicts prevented by unique PM IDs in team mode)
7. ✓ **PM sync strategy**: One-way (local → remote) with rich updates (status + comments + blockers)
8. ✓ **Refinement blocker handling**: Auto-update PM status to "Blocked" + append explanation comment
9. ✓ **Retire /decide command**: Redundant with /codify (which handles project-level decisions)
10. ✓ **Terminology clarification**: Approaches (explore), Refinements (refine), Decisions (codify)
11. ✓ **Workflow split**: /explore stops at approach selection, /refine handles implementation details
12. ✓ **File structure**: exploration.md (approaches), refinements.md (new, implementation details)
13. ✓ **Migration strategy**: Option A - grandfather existing features (HODGE-001 to HODGE-376 keep decisions.md), new structure for HODGE-377+
14. ✓ **Epic scope**: Combined epic (team development + workflow refinement belong together)

## No Decisions Needed

All major architectural questions resolved during exploration conversation.

## Next Steps

1. ✅ Exploration complete - all decisions resolved
2. Use `/plan HODGE-377` to break into 6 sub-features (recommended)
3. Or start with `/build HODGE-377.1` (team mode detection) if ready
