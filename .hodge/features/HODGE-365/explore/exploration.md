# Exploration: Fix status command Production Ready indicator to check ship-record.json

**Created**: 2025-10-30
**Status**: Exploring

## Problem Statement

The `/status` command incorrectly displays "○ Production Ready" for shipped features. When a feature has been successfully shipped (with `validationPassed: true` in ship-record.json), the Production Ready indicator should show ✓, not ○.

## Root Cause Analysis

The `checkProductionReady()` method in `src/commands/status.ts` (lines 81-96) has a structural mismatch:

**What the code expects:**
```typescript
const results = JSON.parse(...) as Record<string, { passed: boolean }>;
return Object.values(results).every((r) => r.passed);
```

**What actually exists in validation-results.json:**
```json
[
  {
    "type": "type_checking",
    "tool": "typescript",
    "exitCode": 0,
    "errorCount": 0,
    // No "passed" field exists
  }
]
```

The code looks for a `passed` field that doesn't exist in the array structure, causing the check to fail even when all validations succeeded.

## Conversation Summary

We explored three potential approaches:

1. **Use ship-record.json instead** - Ship record already contains `validationPassed: true` which is the definitive proof of production readiness
2. **Fix validation-results.json format** - Add a `passed` field or change status.ts to read the array format correctly
3. **Check both files** - More granular state showing "Production Ready ✓" after harden, then "Shipped ✓" separately

The discussion revealed that:
- Ship-record.json is already the single source of truth for production readiness
- "Harden ✓" already indicates hardening is complete
- "Production Ready" semantically means "passed all gates and can go to production"
- Having Production Ready and Shipped both check the same condition (ship validation passed) accurately reflects reality

## Implementation Approaches

### Approach 1: Reuse Ship Validation Check (Recommended)

**Description**: Make `checkProductionReady()` delegate to `checkShipped()` since they represent the same state: "validation passed and ready for production."

**Implementation**:
```typescript
private async checkProductionReady(featureDir: string): Promise<boolean> {
  // Production ready means ship validation passed
  return this.checkShipped(featureDir);
}
```

**Pros**:
- Simple one-line fix
- Single source of truth (ship-record.json)
- Semantically correct: shipped = production ready
- No redundant file checks

**Cons**:
- Both indicators show ✓ simultaneously (not really a con, reflects reality)

**When to use**: This is the cleanest approach that fixes the bug and maintains semantic clarity.

---

### Approach 2: Fix validation-results.json Reading Logic

**Description**: Update `checkProductionReady()` to correctly read the array structure in validation-results.json and check `exitCode === 0` and `errorCount === 0`.

**Implementation**:
```typescript
private async checkProductionReady(featureDir: string): Promise<boolean> {
  const validationFile = path.join(featureDir, 'harden', 'validation-results.json');
  if (!existsSync(validationFile)) {
    return false;
  }

  try {
    const results = JSON.parse(await fs.readFile(validationFile, 'utf-8')) as Array<{
      exitCode: number;
      errorCount: number;
      skipped?: boolean;
    }>;
    return results
      .filter(r => !r.skipped)
      .every(r => r.exitCode === 0 && r.errorCount === 0);
  } catch {
    return false;
  }
}
```

**Pros**:
- Production Ready ✓ could appear after `/harden` completes
- More granular workflow visibility

**Cons**:
- More complex logic
- Creates potential for drift between harden validation and ship validation
- "Production Ready" appearing before ship is semantically confusing
- Redundant with "Harden ✓" indicator

**When to use**: Only if we want separate states for "hardened" vs "shipped"

---

### Approach 3: Dual Check (Harden OR Ship)

**Description**: Check both validation-results.json (with fixed logic) AND ship-record.json, showing Production Ready ✓ if either passes.

**Implementation**:
```typescript
private async checkProductionReady(featureDir: string): Promise<boolean> {
  // Check if shipped (definitive proof)
  const shipped = await this.checkShipped(featureDir);
  if (shipped) return true;

  // Otherwise check harden validation
  const validationFile = path.join(featureDir, 'harden', 'validation-results.json');
  // ... (same logic as Approach 2)
}
```

**Pros**:
- Most granular state tracking
- Shows production readiness as soon as hardening passes

**Cons**:
- Most complex implementation
- Two sources of truth for the same concept
- Higher maintenance burden
- Still semantically confusing (what does "production ready but not shipped" mean?)

**When to use**: If we need to distinguish between "validated and ready" vs "actually shipped"

## Recommendation

**Use Approach 1: Reuse Ship Validation Check**

This approach is the simplest, most semantically correct solution. "Production Ready" means "this code has been validated and is ready for production," which is exactly what ship-record.json with `validationPassed: true` certifies.

Benefits:
- Single source of truth eliminates drift and maintenance burden
- One-line fix is trivial to implement and test
- Aligns with actual workflow: shipping proves production readiness
- "Harden ✓" already tells users hardening is complete
- Both indicators showing ✓ together accurately reflects reality

The fix is straightforward and eliminates the structural mismatch that caused the bug.

## Test Intentions

### Behavioral Expectations

1. **When a feature has been shipped with validationPassed: true**
   - Status display should show "✓ Production Ready"
   - Status display should show "✓ Shipped"

2. **When a feature has NOT been shipped**
   - Status display should show "○ Production Ready"
   - Status display should show "○ Shipped"

3. **When ship-record.json exists but validationPassed is false**
   - Status display should show "○ Production Ready"
   - Status display should show "○ Shipped"

## Decisions Decided During Exploration

1. ✓ **Use ship-record.json as the source of truth** - Ship validation is the definitive certification of production readiness
2. ✓ **Production Ready and Shipped show same state** - Both indicators check ship-record.json, eliminating the bug and reflecting reality
3. ✓ **Simplify implementation** - Make checkProductionReady() delegate to checkShipped() for single source of truth

## No Decisions Needed

All architectural decisions were resolved during exploration. The implementation approach is clear and straightforward.

## Next Steps

1. Implement Approach 1 (one-line change to checkProductionReady)
2. Add/update tests to verify the three behavioral expectations
3. Verify fix resolves the HODGE-364 status display issue
