# Exploration: HODGE-312

## Feature Overview
**PM Issue**: HODGE-312
**Type**: general
**Created**: 2025-10-01T01:27:46.397Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 10

- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: None identified

## Problem Analysis

The `hodge status` command has **TWO critical bugs** in `/src/commands/status.ts`:

### Bug 1: Decision Detection (Line 38)
```typescript
const hasDecision = existsSync(path.join(exploreDir, 'decision.md'));
```
**Problem**: Looks for `explore/decision.md` but decision file is actually at `features/{feature}/decision.md` (feature root, not explore subdirectory)

**Evidence**:
- HODGE-311 has decision at `.hodge/features/HODGE-311/decision.md`
- Status shows "Decision: ○" (not done) even though decision exists

### Bug 2: Shipped Detection (Missing entirely)
**Problem**: No code to check if feature has been shipped successfully

**Current logic (lines 36-62)**:
- Checks if `explore/`, `build/`, `harden/` directories exist
- NO check for `ship-record.json` (completion marker)
- Can't distinguish "shipping in progress" from "shipped successfully"

**Evidence**:
- HODGE-311 has `ship/ship-record.json` (shipped 5 hours ago)
- Status shows it as "Production Ready" but doesn't show "shipped" state
- No "shipped" checkmark in progress list

### Root Cause
The status command was written before:
1. Decision files were moved to feature root (they used to be in explore/)
2. Ship-record.json was introduced as completion marker
3. "shipped" mode was added to hodge-md-generator.ts (HODGE-311)

## Implementation Approaches

### Approach 1: Apply HODGE-311 logic to status command
**Description**: Port the exact same shipped-detection logic from hodge-md-generator.ts into status.ts

**Pros**:
- Consistent detection logic across codebase
- Reuses proven solution from HODGE-311
- Fixes both bugs in one change
- Minimal risk (copying working code)

**Cons**:
- Code duplication (same logic in two files)
- Doesn't extract shared detection utility
- Future bugs might need fixing in two places

**When to use**: When we need a fast, reliable fix with proven logic

**Implementation**:
```typescript
// Fix Bug 1: Check decision.md at feature root, not explore/
const hasDecision = existsSync(path.join(featureDir, 'decision.md'));

// Fix Bug 2: Check for ship-record.json
const shipRecordPath = path.join(featureDir, 'ship', 'ship-record.json');
const isShipped = existsSync(shipRecordPath);

// Add to progress display:
console.log('  ' + (isShipped ? chalk.green('✓') : chalk.gray('○')) + ' Shipped');
```

### Approach 2: Extract shared status detection utility
**Description**: Create a shared `FeatureStatusDetector` class used by both status.ts and hodge-md-generator.ts

**Pros**:
- Single source of truth for status detection
- Better architecture (DRY principle)
- Future enhancements only need one change
- Easier to test in isolation

**Cons**:
- More code changes (create new file, update two files)
- Larger scope than fixing immediate bug
- Potential scope creep
- Need integration tests for new utility

**When to use**: When we want to fix technical debt while fixing the bug

**Implementation**:
```typescript
// src/lib/feature-status-detector.ts
export class FeatureStatusDetector {
  async getStatus(feature: string) {
    return {
      hasExploration: await this.checkExists('explore'),
      hasDecision: await this.checkExists('decision.md'),  // Root, not explore/
      hasBuild: await this.checkExists('build'),
      hasHarden: await this.checkExists('harden'),
      isShipped: await this.checkExists('ship/ship-record.json'),
      isProductionReady: await this.checkProductionReady()
    };
  }
}
```

### Approach 3: Minimal fix - decision.md only
**Description**: Fix only Bug 1 (decision detection), defer shipped detection to future work

**Pros**:
- Smallest possible change
- Zero risk of breaking anything else
- Can ship in <10 minutes
- Follows "fix one thing" principle

**Cons**:
- Doesn't solve the shipped detection problem
- Requires creating HODGE-313 for Bug 2
- User still sees incorrect status for shipped features
- Doesn't align with HODGE-311 (inconsistent behavior)

**When to use**: When we want absolute minimum risk and separate concerns

## Recommendation

**Approach 1: Apply HODGE-311 logic to status command**

**Why**:
1. **Consistency**: Matches the exact fix already proven in HODGE-311
2. **Complete**: Fixes BOTH bugs, not just one
3. **Low Risk**: We're copying working code, not inventing new logic
4. **Fast**: Can implement and test in 30 minutes
5. **User Value**: Users immediately see correct status for shipped features

The code duplication is acceptable because:
- Status command and HODGE.md generator serve different purposes
- Future refactoring can extract shared logic (Approach 2) if needed
- Consistency is more important than DRY right now

## Decisions Needed

1. **Mode naming for shipped state**: Use "shipped", "completed", or "done"?
   - Recommendation: "shipped" (matches HODGE-311 and existing phase terminology)

2. **Decision file path**: Change status to check feature root or move decision.md to explore/?
   - Recommendation: Check feature root (matches current file structure)

3. **Completion marker**: Use ship-record.json or git commit or both?
   - Recommendation: ship-record.json only (reliable, no git dependency)

4. **Next steps for shipped features**: What should status command suggest?
   - Recommendation: "Feature completed. Start new work with `hodge explore <feature>`"

5. **Progress display**: Should "Shipped" be a separate line or replace "Production Ready"?
   - Recommendation: Separate line (6th checkbox: Shipped)

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-312`

---
*Template created: 2025-10-01T01:27:46.397Z*
*AI exploration to follow*
