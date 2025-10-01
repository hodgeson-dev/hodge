# Exploration: HODGE-313 - /hodge Command Not Showing Last Feature Status

## Problem Statement

The `/hodge` command is not displaying the correct status for the last feature worked on. Specifically:

**Observed Behavior:**
- User ships HODGE-312 (ship-record.json created successfully)
- User runs `/hodge` command
- HODGE.md shows: "Working on: HODGE-312 (explore mode)"
- Should show: "Working on: HODGE-312 (shipped mode)" or reflect that HODGE-312 is completed

**Root Cause Analysis:**

The `/hodge` slash command calls `hodge context` which:
1. Generates HODGE.md using `'general'` as the feature name (context.ts:68)
2. HodgeMDGenerator.getCurrentMode('general') is called
3. Since no `.hodge/features/general/` directory exists, it returns 'explore' (default, line 102)
4. The session manager loads the last session (HODGE-312 in shipped state)
5. HODGE.md combines:
   - Feature from session: "HODGE-312"
   - Mode from detection: "explore" (because 'general' was checked, not 'HODGE-312')

**Key Issue**: The `hodge context` command generates HODGE.md with mode detection for feature 'general', but displays session info for the actual feature (HODGE-312), creating a mismatch.

## Similar Features

### HODGE-311: Status command shipped detection
- Fixed the same bug in `hodge status` command
- Used ship-record.json check for shipped feature detection
- Applied correct mode detection logic
- Pattern: Check ship-record.json first before ship/ directory

### HODGE-312: Status command decision.md path
- Fixed decision.md detection in status command
- Checked feature root instead of explore/ subdirectory
- Pattern: Know where files actually live in the structure

## Implementation Approaches

### Approach 1: Use session feature for mode detection

**Description**: When generating HODGE.md in `hodge context`, load the session first and use the session's feature name for mode detection, not the generic 'general' parameter.

**Implementation**:
```typescript
// In context.ts loadDefaultContext():
private async loadDefaultContext(): Promise<void> {
  console.log(chalk.cyan('📚 Loading Hodge Context'));
  console.log();

  // Load session FIRST to get actual feature
  const session = await sessionManager.load();
  const featureToCheck = session?.feature || 'general';

  // Generate HODGE.md with actual feature for accurate mode detection
  await this.hodgeMDGenerator.saveToFile(featureToCheck);
  console.log(chalk.green('✓ Generated fresh HODGE.md'));

  // ... rest of method
}
```

**Pros**:
- Fixes the root cause: mode detection matches the feature being displayed
- Minimal code change (one line modification)
- Uses existing session infrastructure
- Consistent with how HODGE.md already displays session info
- Works for both active features and 'general' when no session exists

**Cons**:
- Assumes session always reflects current work (usually true but not guaranteed)
- Doesn't handle case where user wants to see overall project status vs feature status

**When to use**: This approach is ideal when HODGE.md should always reflect the current working feature's accurate state.

---

### Approach 2: Separate "project status" from "feature status"

**Description**: Create distinct modes for `/hodge` command - one for project overview (current behavior) and one for feature-specific status. Add a flag or separate command for each.

**Implementation**:
```typescript
// New flag: hodge context --feature-status
// Uses session feature for mode detection

// Default behavior: hodge context
// Shows project overview with 'general' mode

// In /hodge template:
if (recent_session_exists) {
  // Show both:
  // 1. Project status (general mode)
  // 2. Last feature: HODGE-312 (shipped)
}
```

**Pros**:
- Clear separation of concerns
- Project overview remains generic
- Feature status is explicitly requested
- User can see both views when needed

**Cons**:
- More complex UX (two different views)
- Requires UI changes to slash command template
- More code to maintain
- Doesn't solve the immediate confusion (default view still wrong)

**When to use**: If we want `/hodge` to provide project-level overview by default, with feature drill-down as secondary action.

---

### Approach 3: Smart detection - show most relevant context

**Description**: Make `hodge context` smart about what to show. If a session exists with recent activity, show that feature's status. If no recent session, show project overview with 'general'.

**Implementation**:
```typescript
private async loadDefaultContext(): Promise<void> {
  console.log(chalk.cyan('📚 Loading Hodge Context'));
  console.log();

  // Load session to check for recent work
  const session = await sessionManager.load();

  // If session is recent (< 24 hours?), use feature-specific context
  const isRecentSession = session && (Date.now() - session.ts) < 24 * 60 * 60 * 1000;
  const featureToCheck = isRecentSession ? session.feature : 'general';

  await this.hodgeMDGenerator.saveToFile(featureToCheck);
  console.log(chalk.green('✓ Generated fresh HODGE.md'));

  // ... rest
}
```

**Pros**:
- Balances both use cases (feature work vs project overview)
- Provides most relevant context automatically
- Natural UX (recent work = feature mode, stale = project overview)
- Gracefully handles both scenarios

**Cons**:
- Adds complexity with time-based logic
- "24 hours" threshold is arbitrary (magic number)
- Might be surprising behavior (mode changes based on time)
- Still doesn't give explicit control to user

**When to use**: If we want intelligent context switching based on recency of work.

---

## Recommended Approach

**Approach 1: Use session feature for mode detection**

**Rationale**:
1. **Simplest fix**: One-line change in context.ts
2. **Addresses root cause**: Mode detection now matches displayed feature
3. **Consistent behavior**: HODGE.md always reflects actual working context
4. **Follows existing pattern**: HODGE.md already uses session for feature/progress display
5. **User expectation**: When you run `/hodge`, you want to see where you left off, not a generic project view

**Trade-off accepted**: If user wants pure "project overview" mode, they can add that later as a separate flag (e.g., `hodge context --project`). Current priority is fixing the confusing mismatch.

## Decisions Needed

1. **Use session feature for mode detection** - Should `hodge context` always use the session's feature for mode detection, or keep 'general' as default?

2. **Session staleness** - Should there be a timeout after which we fall back to 'general' mode (e.g., if session is > 7 days old)?

3. **Add --project flag** - Should we add an explicit `hodge context --project` flag for generic project overview, separate from feature-specific status?

4. **Update /hodge template** - Should the `/hodge` slash command template be updated to clarify that it shows "last worked feature" status, not project overview?

5. **Backward compatibility** - Are there any tools or workflows that depend on `hodge context` using 'general' mode? (Unlikely since this appears to be a bug, not a feature)

## Test Intentions

### Behavior: Shipped feature shows correct mode
- **Given**: HODGE-312 is shipped (ship-record.json exists)
- **When**: User runs `hodge context` (or `/hodge` command)
- **Then**: HODGE.md should show "Mode: shipped" for HODGE-312
- **And**: Session context should match mode context

### Behavior: Active feature shows correct mode
- **Given**: HODGE-313 is in build phase (build/ directory exists)
- **When**: User runs `hodge context`
- **Then**: HODGE.md should show "Mode: build" for HODGE-313
- **And**: Mode detection should use session feature, not 'general'

### Behavior: No session defaults gracefully
- **Given**: No session file exists (.hodge/session.json missing)
- **When**: User runs `hodge context`
- **Then**: HODGE.md should show "Mode: explore" for 'general'
- **And**: No crash or error should occur

### Behavior: Old session falls back appropriately
- **Given**: Session exists but is > 7 days old (if staleness implemented)
- **When**: User runs `hodge context`
- **Then**: HODGE.md should show project-level context or prompt to start new work
- **And**: Clear guidance on next steps
