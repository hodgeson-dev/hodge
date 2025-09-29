# Exploration: HODGE-298

## Feature Overview
**PM Issue**: HODGE-298
**Type**: Plan Command Fixes
**Created**: 2025-09-29T19:09:56.319Z

**Problem Statement:**
The `/plan` command has two critical issues discovered when planning HODGE-297:

1. **Epic/Story Title Format Issue**:
   - Current: Epic title is just "HODGE-297" with no description
   - Expected: "HODGE-297: Context Loading Enhancement"
   - Sub-issues should also follow "HODGE-297.1: [description]" format

2. **Premature PM Issue Creation** ⚠️ **CRITICAL**:
   - Current behavior: Creates epic and stories in PM tool (Linear) immediately
   - Expected behavior: Display plan for user approval FIRST, then create PM issues
   - Problem: Users cannot review/adjust plan before it's created in PM tool

3. **Missing Decision Context**:
   - Current: Shows "Plan: 2 stories across 1 lanes" as only decision
   - Expected: Should list ALL 5 decisions made during `/decide` phase
   - Screenshot shows only 1 item under "Decisions Made" when there were 5

## Current Behavior Analysis

From `plan.ts` (line 376-400):
```typescript
private async createPMStructure(plan: DevelopmentPlan): Promise<void> {
  if (plan.type === 'single') {
    const result = await this.pmHooks.createPMIssue(plan.feature, [], false);
    // Creates immediately, no approval
  } else if (plan.stories) {
    const result = await this.pmHooks.createPMIssue(
      plan.feature,
      [`Plan: ${plan.stories.length} stories across ${plan.lanes?.count || 1} lanes`],
      true,
      subIssues
    );
    // Creates epic immediately, no approval
  }
}
```

The execute() method calls createPMStructure() without any approval step (line 82-84):
```typescript
// Create PM issues if not local-only
if (!options.localOnly) {
  await this.createPMStructure(plan);  // ← Creates immediately!
}
```

## Implementation Approaches

### Approach 1: Add Interactive Approval Step (Recommended)
**Description**: Insert an approval prompt between displaying the plan and creating PM issues. Only proceed with PM creation after explicit user confirmation.

**Implementation Flow:**
```typescript
// In execute() method:
1. Display plan (existing)
2. Save plan locally (existing)
3. **NEW: Prompt for approval**
   - Show: "Create this epic in Linear? (y/n)"
   - Wait for user input
   - If 'n': Exit with message "Plan saved locally, PM issues not created"
4. Only if approved: createPMStructure()
```

**Code Changes:**
- Add `promptForApproval()` method
- Add `readUserInput()` helper (use readline or similar)
- Modify `execute()` to await approval before calling `createPMStructure()`
- Update CLI output messages to indicate approval step

**Pros**:
- Prevents premature PM issue creation
- Gives users control over when issues are created
- Simple to implement (single approval gate)
- Works for both single issues and epics
- Aligns with "user in control" principle

**Cons**:
- Requires interactive input (won't work in non-TTY environments)
- Adds extra step to workflow
- May need --auto-approve flag for automation

**When to use**: Best for user-facing CLI commands where control is important. Perfect for this use case.

---

### Approach 2: Default to Local-Only, Explicit Flag for PM Creation
**Description**: Change default behavior to NOT create PM issues. Require explicit `--create-pm` flag to create issues in PM tool.

**Implementation Flow:**
```typescript
// Change defaults:
1. Display plan (existing)
2. Save plan locally (existing)
3. Only create PM if --create-pm flag provided
4. Update help text and output messages
```

**Code Changes:**
- Change default `localOnly` to `true`
- Add `--create-pm` flag (inverse of current `--local-only`)
- Update all documentation
- Modify output messages: "Plan saved locally. Use --create-pm to create in Linear."

**Pros**:
- Safe by default (no accidental PM issue creation)
- No interactive prompts needed
- Works in automation/scripts
- Clear, explicit opt-in

**Cons**:
- Changes existing behavior (breaking change)
- Extra flag to remember
- May frustrate users expecting automatic PM creation

**When to use**: Good for tools where automation is common or mistakes are costly.

---

### Approach 3: Two-Phase Command (`plan` then `plan apply`)
**Description**: Split planning into two commands: `hodge plan` (plan only) and `hodge plan apply` (create PM issues).

**Implementation Flow:**
```
hodge plan HODGE-298
  → Displays plan
  → Saves to .hodge/development-plan.json
  → Outputs: "Plan saved. Review and run 'hodge plan apply' to create PM issues"

hodge plan apply
  → Reads .hodge/development-plan.json
  → Creates PM issues
  → Updates plan with created issue IDs
```

**Code Changes:**
- Add `apply` subcommand to plan command
- Separate `generatePlan()` from `createPMStructure()`
- `hodge plan` only saves locally
- `hodge plan apply` reads saved plan and creates issues

**Pros**:
- Clean separation of concerns
- Review before apply pattern (like git)
- Allows plan editing before creation
- No breaking changes (apply is new)

**Cons**:
- More complex (two commands instead of one)
- State management (plan file)
- May feel verbose for simple cases

**When to use**: When users need to review/edit plans before execution. Good for teams.

## Additional Fixes Needed

### Fix 1: Epic/Story Title Format
**Current** (line 386-388):
```typescript
const subIssues = plan.stories.map((s) => ({
  id: s.id,
  title: s.title,  // ← Missing feature prefix
}));
```

**Fixed**:
```typescript
const subIssues = plan.stories.map((s) => ({
  id: s.id,
  title: `${s.id}: ${s.title}`,  // ← Add ID prefix
}));

// Also fix epic title
const epicTitle = `${plan.feature}: [description from exploration]`;
```

### Fix 2: Include All Decisions in PM Issue
**Current** (line 392):
```typescript
[`Plan: ${plan.stories.length} stories across ${plan.lanes?.count || 1} lanes`]
// ← Only shows plan summary, not actual decisions
```

**Fixed**:
```typescript
// Pass ALL decisions to PM hook
const decisions = await this.analyzeDecisions(plan.feature);
const result = await this.pmHooks.createPMIssue(
  plan.feature,
  decisions,  // ← Pass full decision list
  true,
  subIssues
);
```

### Fix 3: Get Epic Description from Exploration
Need to read `exploration.md` to get feature description for epic title:
```typescript
private async getFeatureDescription(feature: string): Promise<string> {
  const explorationFile = path.join(
    this.basePath,
    '.hodge',
    'features',
    feature,
    'explore',
    'exploration.md'
  );

  if (existsSync(explorationFile)) {
    const content = await fs.readFile(explorationFile, 'utf-8');
    // Extract description from "Problem Statement" or first paragraph
    // Return extracted description
  }

  return 'No description available';
}
```

## Recommendation

**Use Approach 1: Add Interactive Approval Step**

**Rationale:**
1. **Addresses the critical issue**: Prevents premature PM creation
2. **Minimal code changes**: Single approval gate, doesn't restructure commands
3. **User control**: Gives explicit approval before external side effects
4. **Backward compatible**: Can add `--auto-approve` flag for automation
5. **Clear workflow**: Display → Review → Approve → Create
6. **Aligns with standards**: CLI Architecture Standard says "no prompts", but this is AFTER displaying full context, and it's a destructive operation (creating external issues)

**Note on CLI Standards**: The standard says "NO prompts, confirmations, or user input" because commands are called from slash commands. However:
- This is a CRITICAL safety measure (prevents unwanted PM issue creation)
- Alternative is the --create-pm flag approach (Approach 2)
- Could implement as: Show plan, exit with message "Run with --approve to create PM issues"

**Actually, Approach 2 might be better given CLI standards!**

## Revised Recommendation

**Use Approach 2: Default to Local-Only with Explicit --create-pm Flag**

**Rationale:**
1. **Respects CLI Architecture Standards**: No interactive prompts, all control via flags
2. **Safe by default**: Won't accidentally create PM issues
3. **Works from slash commands**: Claude Code can decide whether to add --create-pm
4. **Clear messaging**: "Plan saved locally. Add --create-pm to create in Linear."
5. **Automation friendly**: Scripts can use --create-pm when ready

**Implementation:**
- Change default `localOnly` to `true`
- Add `--create-pm` flag
- Update messaging
- Fix title format (all 3 fixes above)
- Pass all decisions to PM tool

## Decisions Needed

1. **Decision: PM Creation Approval Mechanism**
   - Options:
     - a) Interactive approval prompt (requires TTY)
     - b) Default to local-only, explicit --create-pm flag (recommended)
     - c) Two-phase commands (plan, then plan apply)
   - **Recommendation**: Option B - Aligns with CLI Architecture Standards

2. **Decision: Epic Title Source**
   - Options:
     - a) Extract from exploration.md Problem Statement
     - b) Use feature name only (current behavior)
     - c) Prompt user for title (conflicts with CLI standards)
   - **Recommendation**: Option A - Read from exploration context

3. **Decision: Decision List Format in PM Issue**
   - Options:
     - a) Full decision text (verbose but complete)
     - b) Decision titles only (concise but less context)
     - c) Link to decisions.md (requires external docs)
   - **Recommendation**: Option B - Titles provide enough context, full text in decisions.md

4. **Decision: Backward Compatibility**
   - Options:
     - a) Breaking change: --create-pm required
     - b) Keep current behavior, add --no-pm flag
     - c) Config file setting for default behavior
   - **Recommendation**: Option A - Safety is more important than convenience

5. **Decision: Story Title Format**
   - Options:
     - a) "HODGE-XXX.Y: Description" (explicit, recommended)
     - b) "Description (HODGE-XXX.Y)" (ID as suffix)
     - c) Just "Description" (ID in metadata only)
   - **Recommendation**: Option A - Clear parent-child relationship

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-298`

---
*Template created: 2025-09-29T19:09:56.319Z*
*AI exploration to follow*
