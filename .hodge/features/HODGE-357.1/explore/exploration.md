# Exploration: Phase 1 - Critical Complexity Reduction via Service Extraction

**Feature**: HODGE-357.1
**Parent**: HODGE-357 - Complete Remaining ESLint Errors from HODGE-356
**Created**: 2025-10-26
**Status**: Exploring

## Problem Statement

Refactor the 3 most complex functions in the codebase to reduce cognitive complexity below 15 through comprehensive service extraction. This is Phase 1 of the 4-phase ESLint cleanup effort.

**Target Functions**:
1. `src/commands/ship.ts:31` execute() - Complexity 56 → <15
2. `src/lib/toolchain-generator.ts:30` generate() - Complexity 40 → <15
3. `src/lib/cache-manager.ts:108` getOrLoad() - Complexity 32 → <15

**Success Criteria**:
- All 3 functions reduced to complexity <15
- All existing tests still passing (1300+ tests)
- ESLint errors reduced by ~30%
- Code is more maintainable and testable

## Context from Parent Epic (HODGE-357)

The parent epic identified 407 ESLint issues (69 errors, 338 warnings) requiring systematic refactoring. The Hybrid Phased + Service Extraction approach was chosen to ship incrementally after each phase, reducing merge conflict risk and enabling pause/resume between phases.

This Phase 1 tackles the highest-impact complexity issues first, creating a foundation for subsequent phases.

## Conversation Summary

### Service Extraction Scope
**Decision**: Use comprehensive service extraction for long-term architectural value rather than minimal extraction for quick wins. While this is more invasive, it creates proper architectural boundaries that will benefit future maintenance.

### Testing Strategy
**Decision**: Employ both strategies - leverage existing test suite for regression prevention AND add new smoke tests for extracted services. Run full test suite after each file refactoring (not just smoke tests) for maximum safety given the production-critical nature of ship.ts.

### Risk Approach
**Decision**: Moderate risk tolerance - extract all services for one file, verify with full test suite, then move to next file. This balances thoroughness with development velocity.

### Service Organization (File-Size Based)
Three different approaches based on file characteristics:

1. **ship.ts** - Enhance existing ShipService
   - Infrastructure already exists (ShipCommand instantiates ShipService)
   - Extract validation, quality gates, commit logic into ShipService methods
   - Keep ShipCommand as thin orchestration layer

2. **toolchain-generator.ts** - Create specialized ToolCategoryMapper helper
   - The 40-complexity comes from giant switch statement for tool categorization
   - Single responsibility: separate category mapping from file generation
   - New class justified by complexity reduction

3. **cache-manager.ts** - Extract private helper methods
   - File only 8 lines over limit (308 vs 300)
   - Extract validateCacheEntry() and loadWithErrorHandling() as private methods
   - No new class needed - internal refactoring sufficient

### Constructor Injection Pattern
**Decision**: Use constructor injection with default instances for all services (except cache-manager private methods). This follows the project's `constructor-injection-for-testing.md` pattern and provides best long-term maintainability.

**Example**:
```typescript
export class ShipCommand {
  constructor(
    private shipService = new ShipService(),
    private pmHooks = new PMHooks(),
    private logger = createCommandLogger('ship', { enableConsole: true })
  ) {}
}
```

**Benefits**: Testable (inject mocks), flexible (defaults for production), no breaking changes, future-proof.

## Implementation Approaches

### Approach 1: Comprehensive Service Extraction with Constructor Injection (Recommended)

**Description**: Extract services comprehensively using file-size based organization strategy, employ constructor injection pattern throughout, and validate with full test suite after each file.

**ship.ts Refactoring**:
```typescript
// Before: 271-line execute() method with complexity 56

// After: Thin orchestration
async execute(feature?: string, options: ShipOptions = {}): Promise<void> {
  const resolvedFeature = await this.shipService.resolveFeature(feature);
  await this.shipService.validateShipReadiness(resolvedFeature, options);
  const qualityResults = await this.shipService.runQualityGates(resolvedFeature, options);
  await this.pmHooks.updateShipStatus(resolvedFeature, qualityResults);
  await this.shipService.createShipCommit(resolvedFeature, qualityResults);
  await this.shipService.generateLessonsLearned(resolvedFeature);
}
```

**Extracted ShipService methods**:
- `resolveFeature(feature?: string): Promise<string>` - Feature resolution from args/context
- `validateShipReadiness(feature: string, options: ShipOptions): Promise<void>` - Hardening checks, prerequisite validation
- `runQualityGates(feature: string, options: ShipOptions): Promise<QualityResults>` - Tests, linting, type checking
- `createShipCommit(feature: string, results: QualityResults): Promise<void>` - Git commit creation with messages
- `generateLessonsLearned(feature: string): Promise<void>` - Lessons learned generation

**toolchain-generator.ts Refactoring**:
```typescript
// Before: 200-line generate() with complexity 40 (giant switch statement)

// After: Delegated to helper
async generate(detectedTools: DetectedTool[], outputPath: string): Promise<void> {
  const config = this.buildBaseConfig();

  for (const tool of detectedTools) {
    const categories = this.categoryMapper.mapToolToCategories(tool);
    const commands = this.categoryMapper.buildCommandConfig(tool);
    this.addToolToConfig(config, tool, categories, commands);
  }

  await this.writeConfigFile(config, outputPath);
}
```

**New ToolCategoryMapper class**:
- `mapToolToCategories(tool: DetectedTool): string[]` - Category mapping logic (extracted from switch)
- `buildCommandConfig(tool: DetectedTool): CommandConfig` - Command configuration builder

**cache-manager.ts Refactoring**:
```typescript
// Before: 65-line getOrLoad() with complexity 32

// After: Extracted private helpers
async getOrLoad<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = this.cache.get(key);
  const isValid = await this.validateCacheEntry(cached, key, options);

  if (isValid) {
    this.hits++;
    return cached.data as T;
  }

  return await this.loadWithErrorHandling(key, loader, options);
}

// New private methods
private async validateCacheEntry<T>(
  entry: CacheEntry<T> | undefined,
  key: string,
  options: CacheOptions
): Promise<boolean> {
  // TTL validation
  // Checksum validation for file-based cache
  // Returns true if valid, false if expired/invalid
}

private async loadWithErrorHandling<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  // Error-wrapped loader execution
  // Cache update on successful load
  // Proper error context in logs
}
```

**Implementation Order**:
1. **File 1: cache-manager.ts** (least risky - private methods only)
   - Extract validateCacheEntry() and loadWithErrorHandling()
   - Run full test suite
   - Verify complexity <15 with ESLint

2. **File 2: toolchain-generator.ts** (medium risk - new class)
   - Create ToolCategoryMapper class
   - Add constructor injection to ToolchainGenerator
   - Extract category mapping and command config logic
   - Run full test suite
   - Verify complexity <15 with ESLint

3. **File 3: ship.ts** (highest risk - production critical)
   - Extract methods into ShipService
   - Update ShipCommand constructor (already has injection)
   - Refactor execute() to call service methods
   - Run full test suite
   - Verify complexity <15 with ESLint
   - Manual smoke test of shipping workflow

**Pros**:
- ✅ Long-term architectural value (proper service boundaries)
- ✅ Highly testable (constructor injection enables mocking)
- ✅ Follows project patterns (constructor-injection-for-testing.md)
- ✅ Incremental validation (full test suite after each file)
- ✅ File-size appropriate solutions (no over-engineering)
- ✅ Reduces complexity by 60-80% (56/40/32 → <15)

**Cons**:
- ❌ More invasive than minimal extraction
- ❌ Longer implementation time (2 days vs 1 day)
- ❌ Risk of breaking existing functionality (mitigated by testing)

**When to use**: When code maintainability and long-term architectural health are priorities, and when you have comprehensive test coverage to validate refactoring safety.

---

### Approach 2: Minimal Extraction for Quick Wins

**Description**: Extract only the minimum methods needed to reduce complexity below 15, without creating new classes or using constructor injection.

**ship.ts Refactoring**:
```typescript
// Extract 2-3 private helper methods within ShipCommand
private async validateShipReadiness(feature: string): Promise<void> {
  // Extract validation logic only
}

private async runQualityGates(feature: string): Promise<QualityResults> {
  // Extract quality gate logic only
}

// Keep rest inline in execute()
```

**toolchain-generator.ts Refactoring**:
```typescript
// Extract switch statement to private method
private getCategoriesForTool(toolName: string): string[] {
  switch (toolName) {
    case 'eslint': return ['linting'];
    // ... rest of switch
  }
}
```

**cache-manager.ts Refactoring**:
```typescript
// Add 1-2 early returns to reduce nesting
async getOrLoad<T>(...): Promise<T> {
  if (!cached) return await this.loadFresh(key, loader);
  if (expired) return await this.loadFresh(key, loader);
  return cached.data as T;
}
```

**Pros**:
- ✅ Faster implementation (1 day vs 2 days)
- ✅ Less invasive (minimal code changes)
- ✅ Lower risk (smaller change surface)

**Cons**:
- ❌ Missed opportunity for architectural improvement
- ❌ Less testable (no injection, harder to mock)
- ❌ May need re-refactoring later
- ❌ Doesn't follow project patterns

**When to use**: When time pressure is extreme, or when you want to validate complexity reduction before committing to larger refactoring.

---

### Approach 3: Hybrid - New Classes + Private Methods

**Description**: Create new service classes for ship.ts and toolchain-generator.ts, but keep cache-manager.ts and less critical logic as private methods.

**ship.ts**: Extract to ShipService (same as Approach 1)
**toolchain-generator.ts**: Create ToolCategoryMapper (same as Approach 1)
**cache-manager.ts**: Use early returns + private methods (mix of Approach 1 and 2)

**Pros**:
- ✅ Balances architectural improvement with pragmatism
- ✅ Focuses new classes where they add most value
- ✅ Moderate implementation time

**Cons**:
- ❌ Inconsistent approach across files
- ❌ May confuse future maintainers (why different patterns?)
- ❌ Doesn't fully leverage constructor injection benefits

**When to use**: When you want architectural improvement for critical areas but want to minimize change surface for stable, low-risk code.

## Recommendation

**Use Approach 1: Comprehensive Service Extraction with Constructor Injection**

**Rationale**:
1. **Long-term value**: Proper service boundaries make future maintenance easier
2. **Testability**: Constructor injection enables comprehensive testing
3. **Consistency**: Follows project's established constructor-injection-for-testing.md pattern
4. **Safety**: Full test suite after each file ensures regression prevention
5. **File-appropriate**: Each file gets right-sized solution (enhance existing, create new, private methods)
6. **Risk-managed**: Moderate approach (one file at a time) balances thoroughness with velocity

**Trade-off**: This takes 2 days vs 1 day for minimal extraction, but the architectural debt reduction is worth the investment given this is Phase 1 of a multi-phase cleanup.

## Test Intentions

### TI-1: Ship Workflow Preservation
**What**: After ship.ts refactoring, the complete shipping workflow must work identically
**Verify**:
- Run existing ship.ts integration tests
- Manual smoke test: `hodge ship TEST-FEATURE`
- Verify ship-record.json created, PM issue updated, commit created

### TI-2: Toolchain Generation Equivalence
**What**: After toolchain-generator.ts refactoring, toolchain.yaml output must be identical
**Verify**:
- Run existing toolchain generation tests
- Compare generated toolchain.yaml before/after refactoring (identical output)
- Verify all tool categories mapped correctly

### TI-3: Cache Performance Maintenance
**What**: After cache-manager.ts refactoring, caching behavior and performance must be preserved
**Verify**:
- Run existing cache-manager tests
- Verify cache hits still work (loader not called on second access)
- Verify checksum validation still works for file-based cache

### TI-4: Constructor Injection Testability
**What**: Extracted services must be testable via constructor injection
**Verify**:
- Create test that injects mock ShipService into ShipCommand
- Create test that injects mock ToolCategoryMapper into ToolchainGenerator
- Verify mocks are called correctly

### TI-5: Complexity Verification
**What**: All 3 functions must have complexity <15 after refactoring
**Verify**:
- Run `npm run lint` after each file refactoring
- Confirm no cognitive-complexity ESLint errors for refactored functions
- Document complexity scores in build plan

### TI-6: Regression Prevention
**What**: Full test suite must pass after each file refactoring
**Verify**:
- Run `npm test` after cache-manager.ts refactoring (all pass)
- Run `npm test` after toolchain-generator.ts refactoring (all pass)
- Run `npm test` after ship.ts refactoring (all pass)

### TI-7: Service Method Isolation
**What**: Extracted service methods must work independently
**Verify**:
- Unit test ShipService.validateShipReadiness() in isolation
- Unit test ShipService.runQualityGates() in isolation
- Unit test ToolCategoryMapper.mapToolToCategories() in isolation

### TI-8: Error Handling Preservation
**What**: Error handling behavior must be preserved after refactoring
**Verify**:
- Test that ship validation errors still throw appropriately
- Test that quality gate failures still prevent shipping
- Test that cache loading errors are still logged correctly

### TI-9: Integration Point Stability
**What**: Integration points (PM hooks, context manager, logger) must work after refactoring
**Verify**:
- Verify PMHooks still called correctly from ship workflow
- Verify contextManager still resolves features correctly
- Verify logging still works in refactored code

## Decisions Decided During Exploration

1. ✓ **Service Extraction Scope**: Use comprehensive service extraction for long-term architectural value (vs minimal extraction for quick wins)

2. ✓ **Testing Strategy**: Run full test suite after each file refactoring for maximum safety (vs smoke tests only during development)

3. ✓ **Risk Approach**: Moderate - extract all services for one file, verify with full test suite, then move to next file

4. ✓ **ship.ts Organization**: Enhance existing ShipService with extracted methods + use constructor injection

5. ✓ **toolchain-generator.ts Organization**: Create ToolCategoryMapper helper class + use constructor injection

6. ✓ **cache-manager.ts Organization**: Extract private helper methods (no new class needed - file only 8 lines over limit)

7. ✓ **Constructor Injection Pattern**: Use constructor injection pattern with default instances for all services (best long-term maintainability, follows project pattern)

## No Decisions Needed

All implementation decisions were resolved during conversational exploration. The approach is fully defined and ready for building.

## Related Context

- **Parent Epic**: HODGE-357 (Complete Remaining ESLint Errors from HODGE-356)
- **Parent Decisions**: Hybrid Phased + Service Extraction approach, ship incrementally
- **Patterns**: `.hodge/patterns/constructor-injection-for-testing.md`
- **Patterns**: `.hodge/patterns/test-pattern.md` (behavior-focused testing)
- **Standards**: `.hodge/standards.md` (progressive enforcement, build phase guidelines)

## Next Steps

Since all decisions are made during exploration:

1. **Start Building**: Run `/build HODGE-357.1` to begin implementation
2. **Follow Implementation Order**:
   - Day 1: cache-manager.ts refactoring (morning), toolchain-generator.ts refactoring (afternoon)
   - Day 2: ship.ts refactoring (full day - most complex)
3. **Validation Checklist**: Run full test suite after each file, verify complexity <15 with lint
