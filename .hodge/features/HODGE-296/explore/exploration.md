# Exploration: HODGE-296

## Feature Overview
**PM Issue**: HODGE-296
**Type**: general
**Created**: 2025-09-29T04:14:29.552Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: None identified

## Problem Statement
HODGE-295 did not create a Linear issue despite having Linear configured in hodge.json and Linear API credentials in .env. Investigation shows that PMHooks only updates existing issues but never creates them. The explore command needs to create the issue in Linear when starting a new feature.

## Root Cause Analysis
- PMHooks.onExplore() only updates status of existing issues
- No code path currently creates new Linear issues during explore
- Context.json shows `pmTool: null` because issue creation happens separately
- LinearAdapter has createIssue() method but it's never called

## Complexity Considerations

### The Epic Problem
During exploration, we don't yet know if a feature will be:
- A single issue
- An epic with multiple sub-issues
- Multiple independent issues

Creating a Linear issue during `/explore` commits us to a structure before we understand the scope. The `/decide` phase is where we determine the actual breakdown, but by then we may have already created the wrong issue type.

### The Decision Update Challenge
If we create issues early:
- `/decide` needs to update the issue with decisions made
- Decisions might reveal need for epic + sub-issues
- We'd need to convert/restructure already-created issues
- Decision history should be captured in Linear comments

## Implementation Approaches

### Approach A: Deferred Creation After Decisions
**Description**: Create Linear issues only after `/decide` when we know the structure.

**Implementation**:
1. `/explore` runs without creating Linear issues
2. `/decide` analyzes decisions and determines structure:
   - Single issue → create one Linear issue
   - Multiple parts → create epic with sub-issues
3. Store mappings for all created issues
4. `/build` and beyond update appropriate issues

**Pros**:
- Issues created with full context and correct structure
- No wasted issues for abandoned explorations
- Decisions inform issue descriptions

**Cons**:
- No Linear visibility during exploration phase
- Delayed PM tool integration

### Approach B: Draft Issue with Post-Decision Restructuring
**Description**: Create draft/placeholder issue in explore, restructure after decisions.

**Implementation**:
1. `/explore` creates single "Exploration" issue in Linear
2. `/decide` evaluates scope:
   - If single feature: update existing issue
   - If epic needed: convert to epic, create sub-issues
   - If multiple issues: create siblings, close exploration issue
3. Update mappings to track all related issues

**Pros**:
- Immediate Linear visibility
- Exploration tracked from start
- Flexible restructuring based on decisions

**Cons**:
- Complex issue manipulation logic
- Potential for orphaned exploration issues
- Linear API complexity for conversions

### Approach C: Hodge-Managed Issue Lifecycle
**Description**: Hodge maintains internal lifecycle, syncs to Linear at strategic points.

**Implementation**:
1. `/explore` tracks intent locally
2. `/decide` captures structure locally + creates Linear issues
3. Each sub-feature gets own HODGE-XXX ID
4. Parent/child relationships tracked in id-mappings
5. Smart sync based on workflow phase

**Pros**:
- Full control over issue structure
- Can handle complex hierarchies
- Decisions drive PM structure

**Cons**:
- More complex state management
- Delayed Linear visibility
- Need parent/child tracking

### Approach D: Template-Based Issue Creation (Recommended)
**Description**: Use decision templates to determine issue structure upfront.

**Implementation**:
1. `/explore` analyzes scope and suggests structure:
   - Simple feature → single issue template
   - Complex feature → epic template with predicted sub-issues
   - Uncertain → defer to decide phase
2. `/decide` confirms or modifies structure:
   - Create issues based on final decisions
   - Add decision outcomes as issue comments
3. Track all relationships in enhanced id-mappings

**Example Flow**:
```
explore HODGE-300 → Detects authentication feature
  → Suggests epic with: API, Frontend, Tests sub-issues
  → No Linear issues yet

decide → User confirms epic structure
  → Creates Linear epic HODGE-300
  → Creates sub-issues HODGE-300.1, 300.2, 300.3
  → Maps all IDs

build HODGE-300.1 → Updates specific sub-issue
```

**Pros**:
- Intelligent structure prediction
- Issues created with full context
- Supports complex hierarchies
- Clean separation of concerns

**Cons**:
- Requires template system
- More complex than simple creation

## Recommendation
**Recommended: Approach D - Template-Based Issue Creation**

This approach best handles the complexity of real-world development where features often decompose into multiple work items. By deferring Linear issue creation until after decisions are made, we ensure issues are created with the correct structure and full context. The template system provides intelligence about likely structures while maintaining flexibility.

## Critical Design Decisions

### Issue Structure Decisions
1. **When to determine if epic vs single issue?**
   - a) During explore based on patterns
   - b) During decide based on choices (recommended)
   - c) Let user explicitly specify

2. **How to handle epic creation?**
   - a) Create epic + all sub-issues atomically (recommended)
   - b) Create epic first, sub-issues as needed
   - c) Create flat issues, link manually

3. **Sub-issue ID format?**
   - a) HODGE-XXX.Y (e.g., HODGE-300.1) (recommended)
   - b) Separate HODGE-XXX for each
   - c) Use Linear's native sub-issue IDs

### Timing Decisions
4. **When to create Linear issues?**
   - a) After explore completes
   - b) After decide completes (recommended)
   - c) On first build command
   - d) Manually triggered

5. **How to handle abandoned explorations?**
   - a) Never create issues for unexplored features (recommended)
   - b) Create but auto-close after timeout
   - c) Create draft issues, delete if abandoned

### Data Structure Decisions
6. **How to track parent/child relationships?**
   - a) Enhanced id-mappings.json with hierarchy (recommended)
   - b) Separate hierarchy file
   - c) Store in Linear only

7. **How to update decision history?**
   - a) Add decisions as Linear comments (recommended)
   - b) Update issue description
   - c) Create linked document

### Error Handling Decisions
8. **What if Linear is unavailable during decide?**
   - a) Queue for later creation (recommended)
   - b) Fail the decide command
   - c) Continue without PM integration

9. **How to handle partial epic creation failure?**
   - a) Rollback all (transaction-like) (recommended)
   - b) Create what's possible
   - c) Retry failed items

10. **How to sync existing Linear epics?**
    - a) Import structure on link
    - b) Require Hodge structure
    - c) Flexible mapping (recommended)

## New Issue: Documentation Loading for AI

### Problem Discovered
The file `docs/epic-story-breakdown.md` was created to help AI understand epic/story breakdown, but:
1. It's in the Hodge project's `docs/` directory, not `.hodge/`
2. It won't be included when users install Hodge as an NPM package
3. There's no mechanism to load it for AI context

### Implementation Approaches for Documentation

#### Approach A: Move to .hodge/ Directory
**Description**: Move documentation to `.hodge/patterns/` or `.hodge/docs/`

**Pros**:
- Gets included in user's project
- Can be loaded by AI context commands
- Customizable per project

**Cons**:
- Needs to be generated/copied during `hodge init`
- May become outdated

#### Approach B: Embed in Command Files (Recommended)
**Description**: Include documentation directly in decide.md or as comments in decide.ts

**Pros**:
- Always available with the command
- Can't get out of sync
- Ships with NPM package
- No extra `/load` command needed
- Simpler for users
- Ensures consistent epic/story breakdown

**Cons**:
- Makes command files larger
- Harder to update documentation

#### Approach C: Generate During Init
**Description**: Have `hodge init` generate AI documentation in `.hodge/ai-docs/`

**Pros**:
- Documentation available in project
- Can be version-controlled
- AI can load via `/load` command
- Can be customized per project

**Cons**:
- Another file to generate
- Needs template in Hodge package
- Requires explicit `/load` command
- Users may forget to load it
- More complex workflow

### Decisions Needed for Documentation

1. **Where should AI documentation live?**
   - a) `.hodge/ai-docs/` directory
   - b) `.hodge/patterns/` directory
   - c) Embedded in command files (recommended)

2. **When should it be available?**
   - a) Always, embedded in command (recommended)
   - b) After `hodge init`
   - c) Manually loaded by user

3. **How should AI access it?**
   - a) Automatically when slash command is called (recommended)
   - b) Via explicit `/load` command
   - c) Include in CLAUDE.md context

## Next Steps
- [ ] Review exploration findings
- [ ] Decide on documentation loading approach
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-296`

---
*Updated: 2025-09-29 - Added documentation loading issue*
