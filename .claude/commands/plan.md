# Hodge Plan - Work Organization & PM Integration

## Purpose
The `/plan` command transforms technical decisions into organized, executable work. It handles epic/story breakdown, dependency analysis, parallel lane allocation, and PM tool integration.

**IMPORTANT**: This slash command handles ALL user interaction for plan generation, refinement, and approval. The `hodge plan` CLI command is ONLY called after user approval to save the plan and optionally create PM issues.

## Command Execution Flow

### Phase 1: Generate Plan (No CLI Call)
AI analyzes decisions and generates plan structure WITHOUT calling any CLI commands yet.

### Phase 2: Display and Refine (Interactive)
Display the proposed plan to the user and allow refinement:
- Show epic/story breakdown
- Display dependencies
- Show lane allocation
- Allow user to request changes

### Phase 3: Save Plan (First CLI Call)
After user approves the plan structure:
```bash
hodge plan {{feature}} --lanes N
# This saves plan locally but does NOT create PM issues
```

### Phase 4: Create PM Issues (Second CLI Call - Optional)
Only after explicit user confirmation to create PM issues:
```bash
hodge plan {{feature}} --lanes N --create-pm
# This creates epic and stories in Linear
```

## Available Options
```bash
hodge plan {{feature}} --lanes 3        # Specify number of development lanes
hodge plan {{feature}} --create-pm      # Create PM issues (after approval only!)
```

## Workflow Position
```
/explore → /decide → /plan → /build
    ↑         ↑        ↑        ↑
 Investigate  Record  Organize  Implement
            Decisions   Work
```

## What This Command Does

### 1. Analyzes Decisions
- Reads decisions from `.hodge/decisions.md`
- Identifies work units from technical choices
- Determines complexity (single story vs epic)

### 2. Generates Work Breakdown
- Creates stories with effort estimates
- Identifies dependencies between stories
- Proposes epic structure when appropriate

### 3. Allocates to Development Lanes
- Distributes work across parallel tracks
- Respects dependency chains
- Optimizes for minimal blocking

### 4. Creates PM Structure
- Creates epics and stories in PM tool
- Sets up parent/child relationships
- Maps IDs for tracking

## Configuration

Add to `hodge.json`:
```json
{
  "planning": {
    "developmentLanes": 3,        // Number of parallel tracks
    "laneNames": [                // Optional custom names
      "backend",
      "frontend",
      "infrastructure"
    ],
    "autoAssignDependencies": true,
    "defaultStorySize": "medium"
  }
}
```

## Interactive Planning Process

### Step 1: Complexity Analysis
The AI analyzes decisions to determine if the feature needs:
- **Single Story**: Simple implementation (1-3 days)
- **Epic with Stories**: Complex feature requiring breakdown

### Step 2: Story Generation
For epics, the AI identifies stories based on:
- Technical areas mentioned in decisions
- Natural work boundaries
- Testing requirements
- Dependencies between components

### Step 3: Dependency Analysis
```
Example Dependency Graph:
Database Schema (296.1) → User Service (296.2) → Auth API (296.3)
                                               ↘
                                                  Frontend (296.4)
                                               ↗
Session Store (296.5) ────────────────────────→
```

### Step 4: Lane Allocation
Work is distributed to maximize parallelism:
```
Lane 1: Backend Core
  Day 1: Database schema (296.1)
  Day 2-3: User service (296.2)

Lane 2: Infrastructure (can start immediately)
  Day 1-2: Session store (296.5)
  Day 3: Available for next story

Lane 3: API/Frontend (starts after 296.1)
  Day 2-3: Auth API (296.3)
  Day 4-5: Frontend (296.4)
```

## Example Usage

### Basic Planning
```
$ hodge plan HODGE-296

📋 Planning Work Structure

Analyzing 3 decisions for HODGE-296...

Development Plan
================
Feature: HODGE-296
Type: epic

Stories (5):
  HODGE-296.1: Database schema and migrations (Lane 1)
  HODGE-296.2: API implementation [depends on: HODGE-296.1] (Lane 1)
  HODGE-296.3: Frontend components [depends on: HODGE-296.2] (Lane 2)
  HODGE-296.4: Tests and validation [depends on: all] (Lane 3)
  HODGE-296.5: Documentation (Lane 2)

Lane Allocation (3 lanes):
  Lane 1: HODGE-296.1, HODGE-296.2
  Lane 2: HODGE-296.3, HODGE-296.5
  Lane 3: HODGE-296.4

Estimated Timeline: 4 days
================

✓ Created epic with 5 stories in Linear
✓ Plan saved to .hodge/development-plan.json

Next Steps:

Parallel development ready:
  Lane 1: hodge build HODGE-296.1
  Lane 2: hodge build HODGE-296.5
  Lane 3: (wait for dependencies)
```

### Single Developer Mode
```
$ hodge plan HODGE-297 --lanes 1

📋 Planning Work Structure

Development Plan
================
Feature: HODGE-297
Type: epic

Stories in sequence:
  1. HODGE-297.1: Core implementation
  2. HODGE-297.2: Tests
  3. HODGE-297.3: Documentation

Estimated Timeline: 5 days
================

Next Steps:
  Start with: hodge build HODGE-297.1
```

## Output Files

### `.hodge/development-plan.json`
```json
{
  "feature": "HODGE-296",
  "type": "epic",
  "stories": [
    {
      "id": "HODGE-296.1",
      "title": "Database schema",
      "effort": "medium",
      "dependencies": [],
      "lane": 0
    }
  ],
  "lanes": {
    "count": 3,
    "assignments": {
      "0": ["HODGE-296.1", "HODGE-296.2"],
      "1": ["HODGE-296.3"],
      "2": ["HODGE-296.4"]
    }
  },
  "dependencies": {
    "HODGE-296.2": ["HODGE-296.1"],
    "HODGE-296.3": ["HODGE-296.2"]
  },
  "estimatedDays": 4,
  "createdAt": "2025-01-29T12:00:00Z"
}
```

## Benefits Over Previous Approach

### Before (in `/decide`)
- Mixed concerns: decisions + work planning
- No dependency analysis
- No parallel development support
- Confusing workflow

### After (with `/plan`)
- Clean separation of concerns
- Smart dependency management
- Parallel lane optimization
- Clear workflow progression

## Team Development

The `/plan` command enables effective team collaboration:

1. **Developer A** works Lane 1 (backend)
2. **Developer B** works Lane 2 (frontend)
3. **Developer C** works Lane 3 (testing/infrastructure)

All developers can see:
- What they can work on now
- What's blocking them
- When dependencies will be ready

## Solo Development

Even for solo developers, `/plan` provides value:
- Clear work sequence
- Dependency visibility
- Progress tracking
- Realistic time estimates

## AI Workflow for /plan Slash Command

### Step 1: Analyze Decisions
Read decisions from `.hodge/decisions.md` for the feature and identify work units.

### Step 2: Generate Plan Structure (AI Task)
Create epic/story breakdown:
```
Epic: HODGE-XXX: [Description from exploration.md]

Decisions Made:
1. Decision title 1
2. Decision title 2
3. Decision title 3

Stories:
- HODGE-XXX.1: Story title 1
- HODGE-XXX.2: Story title 2 [depends on: HODGE-XXX.1]

Lane Allocation (N lanes):
Lane 1: HODGE-XXX.1
Lane 2: HODGE-XXX.2
```

### Step 3: Present to User
Display the proposed plan and ask:
```
Review the plan above. Would you like to:
a) Approve and save plan locally
b) Approve and create PM issues in Linear
c) Modify the plan (adjust stories, dependencies, etc.)
d) Cancel

Your choice:
```

### Step 4: Execute Based on User Choice

**If user chooses (a) - Save locally:**
```bash
hodge plan {{feature}} --lanes N
```

**If user chooses (b) - Save and create PM issues:**
```bash
hodge plan {{feature}} --lanes N --create-pm
```

**If user chooses (c) - Modify:**
Allow user to specify changes, regenerate plan, then return to Step 3.

**If user chooses (d) - Cancel:**
Exit without saving or creating anything.

## Important Notes

- **CRITICAL**: NEVER call `hodge plan` with `--create-pm` without explicit user approval
- The `hodge plan` CLI is an internal tool, users never invoke it directly
- All user interaction happens in this slash command template
- PM issue creation is a destructive operation requiring explicit consent
- Plans can be regenerated if decisions change
- Lane allocation respects dependencies automatically
- Stories can be worked on independently within constraints

## Next Steps After Planning

After plan is saved and/or PM issues created:
```
### What would you like to do?
a) Start building first story → `/build {{first_story}}`
b) Review plan details → `cat .hodge/development-plan.json`
c) Regenerate plan → `/plan {{feature}} --lanes N`
d) View in Linear → [provide Linear URL if PM issues created]
e) Continue development
f) Done for now

Your choice:
```

Remember: `/plan` bridges the gap between decisions and implementation, turning ideas into actionable, parallel work streams.