# Proposal: /plan Command for Work Organization

## Problem Statement
Currently, the `/decide` command conflates decision-making with work planning. This violates single responsibility and makes the workflow less clear.

## Proposed Solution: Dedicated `/plan` Command

### Workflow Separation

#### Before (Current)
```
/explore → /decide (decisions + epic/story + PM) → /build
```

#### After (Proposed)
```
/explore → /decide (decisions only) → /plan (work breakdown + PM) → /build
```

### /plan Command Responsibilities

#### 1. Work Breakdown
- Analyze decisions to identify discrete work units
- Propose epic/story structure
- Estimate effort for each story
- Get user approval for structure

#### 2. Dependency Analysis
- Identify dependencies between stories
- Create dependency graph
- Determine critical path
- Flag potential blockers

#### 3. Parallel Lane Allocation
- Distribute stories across configurable development lanes
- Ensure dependencies are respected
- Optimize for parallel execution
- Support 1-N developers

#### 4. PM Tool Integration
- Create epics and stories in PM tool
- Set up proper parent/child relationships
- Add dependency links where supported
- Update status and assignments

### Configuration

```json
// hodge.json
{
  "planning": {
    "developmentLanes": 3,        // Number of parallel tracks
    "laneNames": [                // Optional custom names
      "backend",
      "frontend",
      "infrastructure"
    ],
    "autoAssignDependencies": true,
    "defaultStorySize": "medium",  // small, medium, large
    "includeTestingLane": true     // Dedicated QA track
  }
}
```

### Command Usage

```bash
# Basic planning
hodge plan

# Plan specific feature
hodge plan HODGE-296

# Plan with lane override
hodge plan --lanes 2

# Plan with no PM integration
hodge plan --local-only
```

### Example Interaction

```
$ hodge plan HODGE-296

📋 Analyzing decisions and existing work...

## Proposed Work Structure

**Epic**: HODGE-296 - PM Issue Creation
**Estimated Total**: 5-7 days
**Recommended Lanes**: 2

**Stories**:
1. HODGE-296.1: Fix TypeScript validation (1 day)
2. HODGE-296.2: Create PM issue on decide (2 days)
3. HODGE-296.3: Queue mechanism for failures (1 day)
4. HODGE-296.4: Epic/story breakdown UI (2 days)
5. HODGE-296.5: Integration tests (1 day)

**Dependencies**:
- 296.2 depends on 296.1
- 296.3 can run parallel to 296.2
- 296.4 depends on 296.2
- 296.5 depends on all

**Lane Allocation** (2 lanes):

Lane 1 (Core Implementation):
- Day 1: HODGE-296.1 (TypeScript)
- Day 2-3: HODGE-296.2 (PM creation)
- Day 4-5: HODGE-296.4 (Epic breakdown)

Lane 2 (Support & Testing):
- Day 1-2: HODGE-296.3 (Queue mechanism)
- Day 3-5: HODGE-296.5 (Tests)

Options:
a) Accept plan as-is
b) Modify stories
c) Change lane allocation
d) Add/remove dependencies
e) Cancel

Your choice: a

✅ Creating PM issues...
Created epic LIN-123
Created stories LIN-124 through LIN-128
Updated .hodge/development-plan.json

Ready to start development:
- Lane 1: hodge build HODGE-296.1
- Lane 2: hodge build HODGE-296.3
```

### Benefits

1. **Clear Separation of Concerns**
   - `/decide` = architectural decisions
   - `/plan` = work organization
   - `/build` = implementation

2. **Better Team Collaboration**
   - Multiple developers can work in parallel
   - Clear dependency visibility
   - Reduced blocking between stories

3. **Improved PM Integration**
   - More sophisticated epic/story creation
   - Better status tracking
   - Dependency management in PM tools

4. **Flexibility**
   - Can plan without PM tool
   - Configurable lane count
   - Works for solo or team development

### Migration Path

1. **Phase 1**: Keep existing `/decide` functionality, add `/plan` as optional
2. **Phase 2**: Move PM creation to `/plan`, deprecation warnings in `/decide`
3. **Phase 3**: Remove PM functionality from `/decide`

### Implementation Priority

1. Basic `/plan` command structure
2. Work breakdown from decisions
3. Simple lane allocation (no dependencies)
4. Dependency analysis
5. Smart lane allocation with dependencies
6. PM tool integration
7. Advanced features (critical path, Gantt charts, etc.)

## Decision Required

Should we proceed with implementing the `/plan` command to separate work planning from decision making?

**Options**:
a) Yes, implement `/plan` as proposed
b) Yes, but with modifications (specify)
c) No, keep current `/decide` approach
d) Need more exploration

This would be a significant but valuable architectural change that better aligns with the principle of single responsibility and enables more sophisticated work planning.