# Exploration: Complexity Reduction - Service Extraction

**Feature**: HODGE-357.5
**Parent**: HODGE-357 (Zero ESLint Errors Goal)
**PM Issue**: HODGE-357.5
**Type**: Sub-Feature - Complexity Reduction
**Started**: 2025-10-27
**Status**: Exploring

## Context

I've reviewed the parent epic (HODGE-357) which aims to eliminate all 75 ESLint errors through a phased incremental refactoring approach. Sibling HODGE-357.4 successfully eliminated 13 quick-win errors (nested ternaries, dead stores, unused variables) reducing errors from 67 → 54. This positions HODGE-357.5 to tackle the next most impactful category: cognitive complexity violations.

After HODGE-357.3 (security fixes) and HODGE-357.4 (quick wins), **54 ESLint errors remain**. Of these, approximately **15 errors are cognitive complexity violations** - functions exceeding the allowed complexity threshold of 15.

## Problem Statement

Fifteen functions across the codebase exceed cognitive complexity 15, making them difficult to understand, test, and maintain. These violations block achieving zero ESLint errors and represent significant technical debt.

**Target Functions** (from parent exploration):
- **init.ts** (4 functions) - complexity 16-22
- **plan.ts** (4 functions) - complexity 16-22
- **status.ts** (3 functions) - complexity 16-22
- **Others** (4 functions) - various files, complexity 16-19

The pattern established in HODGE-357.3 and HODGE-357.4 (extract logic to focused methods/services with clear separation of concerns) proves effective and should be continued.

## Implementation Approaches

### Approach 1: Service Extraction with Constructor Injection ⭐

**Description**: Extract complex business logic from command classes into focused service classes using constructor injection for testability.

**Pattern** (from parent exploration):
```typescript
// Before: High complexity in command class
class ShipCommand {
  async execute() {
    // 271 lines of mixed logic
    // Validation + quality gates + PM updates + commits
  }
}

// After: Thin orchestration layer
class ShipCommand {
  constructor(
    private validationService: ValidationService,
    private qualityGateService: QualityGateService
  ) {}

  async execute() {
    await this.validationService.validate(feature);
    const results = await this.qualityGateService.run(feature);
    // Clear, readable orchestration
  }
}
```

**Pros**:
- ✅ Highly testable (services can be unit tested in isolation)
- ✅ Reusable services across commands
- ✅ Clear separation of concerns
- ✅ Follows established pattern from HODGE-357.3
- ✅ Long-term maintainability

**Cons**:
- Requires creating new service files
- Slightly more code overall (but much clearer)

**When to use**: This approach is ideal for command classes with multiple responsibilities that can be clearly separated.

---

### Approach 2: Extract Private Helper Methods

**Description**: Extract complex logic into private helper methods within the same class, without creating separate service classes.

**Pattern**:
```typescript
// Before: High complexity
async execute() {
  if (!feature) throw Error();
  if (!existsSync(dir)) throw Error();
  // ... 200 more lines
}

// After: Extracted helpers
async execute() {
  await this.validatePrerequisites(feature);
  await this.runWorkflow(feature);
}

private async validatePrerequisites(feature: string) {
  if (!feature) throw Error();
  if (!existsSync(dir)) throw Error();
}
```

**Pros**:
- ✅ Simpler than service extraction
- ✅ No new files needed
- ✅ Reduces complexity effectively

**Cons**:
- ❌ Less reusable (methods tied to specific class)
- ❌ Harder to unit test in isolation
- ❌ Doesn't address long-term architecture

**When to use**: Quick complexity reduction for functions that don't have clear service boundaries.

---

### Approach 3: Guard Clauses + Early Returns

**Description**: Flatten nested conditionals using guard clauses and early returns.

**Pattern**:
```typescript
// Before: Nested (high complexity)
if (condition1) {
  if (condition2) {
    if (condition3) {
      doWork();
    }
  }
}

// After: Flat (low complexity)
if (!condition1) return;
if (!condition2) return;
if (!condition3) return;
doWork();
```

**Pros**:
- ✅ Minimal code changes
- ✅ Immediate complexity reduction
- ✅ Easier to read

**Cons**:
- ❌ Only addresses nesting, not overall logic complexity
- ❌ May not be sufficient for very complex functions

**When to use**: Functions with deep nesting but otherwise reasonable logic.

## Recommendation

**Use Approach 1 (Service Extraction with Constructor Injection)** for the following reasons:

1. **Consistency**: Follows the pattern already established in HODGE-357.3 and HODGE-357.4
2. **Testability**: Services can be unit tested in isolation, improving test coverage
3. **Reusability**: Extracted services can be reused across multiple commands
4. **Long-term value**: Improves architecture, not just reduces complexity scores
5. **Parent decision**: Aligns with the "Hybrid Phased + Service Extraction" approach decided for HODGE-357

**Implementation Plan**:
1. Identify the 15 functions with cognitive complexity >15
2. For each function, determine service boundaries
3. Create service classes with constructor injection
4. Extract business logic to services
5. Update command classes to use services
6. Run tests after each extraction
7. Verify complexity reduction with ESLint

**Expected Impact**: 15 complexity errors → 0 complexity errors (~28% progress toward zero errors goal)

## Test Intentions

### TI-1: Service Extraction Preserves Behavior
**Behavior**: All extracted services maintain the exact same behavior as the original inline logic.
**Verification**: Existing integration tests continue to pass without modification.

### TI-2: Services Are Testable in Isolation
**Behavior**: Each extracted service can be instantiated and tested independently without the full command context.
**Verification**: Unit tests can be written for each service using constructor injection of mock dependencies.

### TI-3: Complexity Metrics Improve
**Behavior**: All 15 target functions reduce cognitive complexity from >15 to ≤15.
**Verification**: ESLint reports show 0 cognitive complexity violations after refactoring.

### TI-4: No Regressions Introduced
**Behavior**: All existing tests continue to pass, no new errors introduced.
**Verification**: Full test suite (1325+ tests) passes, no new ESLint errors, TypeScript compiles cleanly.

### TI-5: Constructor Injection Pattern Followed
**Behavior**: All new services follow the constructor injection pattern established in previous sub-features.
**Verification**: Code review confirms services accept dependencies via constructor, not global state or require().

## No Decisions Needed

All implementation decisions have been made:
- ✓ **Approach**: Service extraction with constructor injection (from parent HODGE-357 decision)
- ✓ **Pattern**: Constructor injection for testability (established in HODGE-357.3)
- ✓ **Scope**: 15 cognitive complexity functions (defined in plan.json)
- ✓ **Testing**: Maintain all existing tests, add unit tests for services
- ✓ **Incremental**: Fix functions one at a time, test after each

Ready to proceed to `/build HODGE-357.5`.
