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

### Step 2: Story Generation (Vertical Slice Requirement)

**CRITICAL REQUIREMENT**: All stories MUST be vertical slices - complete, testable, shippable units of value.

#### What is a Vertical Slice?
A vertical slice is a story that:
1. **Provides complete value** to a stakeholder (user, admin, developer, tester, etc.)
2. **Is independently testable** - can be verified without other stories
3. **Is shippable** - could go to production on its own (even if behind a feature flag)

#### Vertical Slice Criteria (Moderate Standard)
Each story must satisfy BOTH criteria:
- ✅ **Stakeholder Value**: Clearly benefits someone (not just "backend work" or "setup")
- ✅ **Independently Testable**: Has verification criteria that don't depend on other incomplete stories

#### Good vs Bad Story Examples

**❌ BAD: Horizontal Slicing (Layer-Based)**
```
Epic: User Authentication
- Story 1: Backend API endpoints
- Story 2: Frontend UI components
- Story 3: Database schema
- Story 4: Integration tests

Problem: No story provides complete value alone. Can't test/ship backend without frontend.
```

**✅ GOOD: Vertical Slicing (Value-Based)**
```
Epic: User Authentication
- Story 1: Login with email/password (backend + frontend + tests + DB)
  Value: Users can log in, testable end-to-end, shippable
- Story 2: Password reset flow (backend + frontend + tests + email)
  Value: Users can reset passwords, independently testable, shippable
- Story 3: OAuth social login (backend + frontend + tests + provider integration)
  Value: Users can log in with Google, independently testable, shippable

Each story is a complete, working feature slice.
```

**❌ BAD: Incomplete Value**
```
- Story 1: Set up authentication configuration
- Story 2: Add user database tables
- Story 3: Create login API skeleton

Problem: None provide value to any stakeholder. Just setup/infrastructure.
```

**✅ GOOD: Complete Value**
```
- Story 1: Basic login authentication (includes setup, DB, API, UI - all needed for login to work)
  Value: Users can log in - complete feature

Each story delivers working functionality.
```

#### Vertical Slice Decision Tree

When generating stories, ask:

1. **Can this story be tested independently?**
   - No → Merge with dependent stories to create complete slice
   - Yes → Continue to question 2

2. **Does this story provide value to a stakeholder?**
   - No → This might be infrastructure - include it as part of a value-delivering story
   - Yes → Continue to question 3

3. **Could this story ship to production (even behind a feature flag)?**
   - No → Missing something (UI? Backend? Tests?) - expand to include all needed pieces
   - Yes → This is a valid vertical slice ✅

4. **Are all stories in the epic vertical slices?**
   - No → Revise the breakdown
   - Yes → Continue to dependencies

**If vertical slicing is not feasible:**
- ⚠️ Warn the user that stories may not meet vertical slice criteria
- 💡 Suggest creating a single issue instead of epic/stories
- ✅ Allow user to override with explanation if they have good reason

#### Story Generation Guidelines
For epics, identify stories based on:
- **Value-based boundaries** (not technical layers)
- Complete user workflows or features
- Natural work boundaries that deliver value
- Testing requirements (each story must be testable)
- Dependencies between components (minimize them)

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

**Before creating stories, validate vertical slice requirements:**

1. **Check each proposed story against vertical slice criteria:**
   - Does it provide complete value to a stakeholder?
   - Is it independently testable?
   - Could it ship to production (even behind a feature flag)?

2. **If stories are horizontal slices (e.g., "Backend" + "Frontend"):**
   - ⚠️ **WARN the user** that stories may not meet vertical slice criteria
   - 💡 **SUGGEST** combining them into value-based slices OR creating a single issue
   - Example: "⚠️ Warning: Stories 'Backend API' and 'Frontend UI' appear to be horizontal slices. Consider combining into 'Login Feature (backend + frontend + tests)' for complete value."

3. **If vertical slicing is not feasible:**
   - 💡 **RECOMMEND** creating a single issue instead of epic/stories
   - Example: "💡 Recommendation: This feature may be better as a single issue since it's difficult to split into independently valuable stories."

4. **Generate the plan with validated stories:**

Create epic/story breakdown:
```
Epic: HODGE-XXX: [Description from exploration.md]

Decisions Made:
1. Decision title 1
2. Decision title 2
3. Decision title 3

Stories (Vertical Slices):
- HODGE-XXX.1: Story title 1 (complete feature with backend + frontend + tests)
  ✅ Value: [Who benefits and how]
  ✅ Testable: [How to verify independently]
- HODGE-XXX.2: Story title 2 (complete feature slice) [depends on: HODGE-XXX.1]
  ✅ Value: [Who benefits and how]
  ✅ Testable: [How to verify independently]

Vertical Slice Validation:
✅ All stories provide complete stakeholder value
✅ All stories are independently testable
✅ All stories are shippable

Lane Allocation (N lanes):
Lane 1: HODGE-XXX.1
Lane 2: HODGE-XXX.2
```

**If warnings were issued:**
```
⚠️ Vertical Slice Warnings:
- Story X may not provide complete value (missing frontend/backend/tests)
- Consider revising breakdown or creating single issue

Would you like to:
a) Revise the plan to use vertical slices
b) Create as single issue instead
c) Proceed anyway (explain why this breakdown is correct)
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

### Step 4: Save AI-Generated Plan Structure

**IMPORTANT**: Before calling the CLI, save your generated plan structure to a file so the CLI can use it instead of keyword matching.

Use the Write tool to create the plan file:

**For epic plans with multiple stories:**
```
Write to: .hodge/temp/plan-interaction/{{feature}}/plan.json

Content (replace all {{placeholders}} with actual values):
{
  "feature": "{{feature}}",
  "type": "epic",
  "stories": [
    {
      "id": "{{feature}}.1",
      "title": "Story title",
      "description": "What this story delivers",
      "effort": "small|medium|large",
      "dependencies": [],
      "lane": 0
    }
  ],
  "lanes": {
    "count": {{N}},
    "assignments": {
      "0": ["{{feature}}.1"]
    }
  },
  "dependencies": {
    "{{feature}}.2": ["{{feature}}.1"]
  },
  "estimatedDays": {{days}},
  "createdAt": "{{current_iso_timestamp}}"
}
```

**For single-issue plans:**
```
Write to: .hodge/temp/plan-interaction/{{feature}}/plan.json

Content:
{
  "feature": "{{feature}}",
  "type": "single",
  "estimatedDays": 1,
  "createdAt": "{{current_iso_timestamp}}"
}
```

**Important**: Replace all `{{placeholders}}` with actual values from your analysis!

### Step 5: Execute Based on User Choice

**If user chooses (a) - Save locally:**
```bash
hodge plan {{feature}} --lanes N
```
The CLI will detect and use the plan.json file you created above.

**If user chooses (b) - Save and create PM issues:**
```bash
hodge plan {{feature}} --lanes N --create-pm
```
The CLI will detect and use the plan.json file, then create PM issues.

**If user chooses (c) - Modify:**
Allow user to specify changes, regenerate plan, update plan.json file, then return to Step 3.

**If user chooses (d) - Cancel:**
Exit without saving or creating anything. Clean up the temp file:
```bash
rm -rf .hodge/temp/plan-interaction/{{feature}}
```

## Important Notes

- **CRITICAL**: NEVER call `hodge plan` with `--create-pm` without explicit user approval
- **CRITICAL**: All stories MUST be vertical slices (complete value + independently testable + shippable)
- The `hodge plan` CLI is an internal tool, users never invoke it directly
- All user interaction happens in this slash command template
- PM issue creation is a destructive operation requiring explicit consent
- Plans can be regenerated if decisions change
- Lane allocation respects dependencies automatically
- Stories can be worked on independently within constraints
- **Warn users** if stories appear to be horizontal slices (layer-based)
- **Suggest single issue** when vertical slicing is not feasible

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