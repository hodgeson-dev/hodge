# Build Plan: HODGE-357.1 - Phase 1 Critical Complexity Reduction

**PM Issue**: HODGE-357.1 (Linear)
**Parent**: HODGE-357 - Complete Remaining ESLint Errors
**Status**: In Progress
**Estimated**: 2 days

## Objective

Refactor 3 critical high-complexity functions through comprehensive service extraction with constructor injection:
1. `src/commands/ship.ts:31` execute() - Complexity 56 → <15
2. `src/lib/toolchain-generator.ts:30` generate() - Complexity 40 → <15
3. `src/lib/cache-manager.ts:108` getOrLoad() - Complexity 32 → <15

**Success Criteria**:
- ✅ All 3 functions complexity <15
- ✅ All 1300+ tests passing
- ✅ ESLint errors reduced by ~30%
- ✅ Zero regressions in functionality

## Implementation Order

### File 1: cache-manager.ts (Day 1 Morning - Least Risky)
**Why First**: Private methods only, no new classes, file only 8 lines over limit

**Refactoring**:
- Extract `validateCacheEntry()` as private method
- Extract `loadWithErrorHandling()` as private method
- Simplify `getOrLoad()` to use extracted helpers

**Validation**:
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - complexity <15 for getOrLoad()
- [ ] Verify cache hit performance unchanged
- [ ] Verify checksum validation still works

---

### File 2: toolchain-generator.ts (Day 1 Afternoon - Medium Risk)
**Why Second**: New class needed, constructor injection, moderate complexity

**Refactoring**:
1. Create `src/lib/tool-category-mapper.ts`:
   ```typescript
   export class ToolCategoryMapper {
     mapToolToCategories(tool: DetectedTool): string[] {
       // Extract switch statement logic here
     }

     buildCommandConfig(tool: DetectedTool): CommandConfig {
       // Extract command config logic here
     }
   }
   ```

2. Update ToolchainGenerator constructor:
   ```typescript
   export class ToolchainGenerator {
     constructor(
       private categoryMapper = new ToolCategoryMapper(),
       private registryLoader = new ToolRegistryLoader()
     ) {}
   }
   ```

3. Refactor `generate()` to delegate to categoryMapper

**Validation**:
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - complexity <15 for generate()
- [ ] Verify toolchain.yaml output identical before/after
- [ ] Verify all tool categories mapped correctly

---

### File 3: ship.ts (Day 2 Full Day - Highest Risk)
**Why Last**: Production-critical, most complex, requires careful extraction

**Refactoring**:
1. Extract methods into existing ShipService:
   ```typescript
   // Add to src/lib/ship-service.ts
   async resolveFeature(feature?: string): Promise<string> {
     // Move feature resolution logic from ShipCommand
   }

   async validateShipReadiness(feature: string, options: ShipOptions): Promise<void> {
     // Move validation logic (hardening checks, prerequisites)
   }

   async runQualityGates(feature: string, options: ShipOptions): Promise<QualityResults> {
     // Move quality gate logic (tests, linting, type checking)
   }

   async createShipCommit(feature: string, results: QualityResults): Promise<void> {
     // Move commit creation logic
   }

   async generateLessonsLearned(feature: string): Promise<void> {
     // Move lessons learned generation
   }
   ```

2. Simplify ShipCommand.execute() to thin orchestration:
   ```typescript
   async execute(feature?: string, options: ShipOptions = {}): Promise<void> {
     const resolvedFeature = await this.shipService.resolveFeature(feature);
     await this.shipService.validateShipReadiness(resolvedFeature, options);
     const qualityResults = await this.shipService.runQualityGates(resolvedFeature, options);
     await this.pmHooks.updateShipStatus(resolvedFeature, qualityResults);
     await this.shipService.createShipCommit(resolvedFeature, qualityResults);
     await this.shipService.generateLessonsLearned(resolvedFeature);
   }
   ```

**Validation**:
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - complexity <15 for execute()
- [ ] Manual smoke test: `hodge ship TEST-FEATURE`
- [ ] Verify ship-record.json created correctly
- [ ] Verify PM issue updated
- [ ] Verify git commit created

## Files Modified

### Created Files
- [ ] `src/lib/tool-category-mapper.ts` - New helper class for toolchain category mapping

### Modified Files
- [ ] `src/lib/cache-manager.ts` - Extract validation and loading helpers (private methods)
- [ ] `src/lib/toolchain-generator.ts` - Add constructor injection, delegate to ToolCategoryMapper
- [ ] `src/lib/ship-service.ts` - Add extracted methods from ShipCommand
- [ ] `src/commands/ship.ts` - Simplify execute() to thin orchestration

### Test Files (if needed)
- [ ] `src/lib/tool-category-mapper.test.ts` - Unit tests for new class (if smoke tests needed)
- [ ] Update existing ship-service.test.ts with new method tests (if needed)

## Decisions Made During Exploration

All decisions documented in `.hodge/features/HODGE-357.1/explore/exploration.md`:

1. ✓ **Service Extraction Scope**: Comprehensive extraction for long-term value
2. ✓ **Testing Strategy**: Full test suite after each file + new smoke tests for services
3. ✓ **Risk Approach**: Moderate - one file at a time with full validation
4. ✓ **ship.ts**: Enhance existing ShipService + constructor injection
5. ✓ **toolchain-generator.ts**: Create ToolCategoryMapper + constructor injection
6. ✓ **cache-manager.ts**: Private helper methods (no new class)
7. ✓ **Constructor Injection**: Use pattern with default instances (best maintainability)

## Testing Strategy

### Per-File Validation
After each file refactoring:
1. Run `npm test` - verify all 1300+ tests pass
2. Run `npm run lint` - verify complexity <15 for target function
3. Run specific integration tests for refactored component
4. Document complexity score reduction

### Smoke Tests (Build Phase Requirement)
Create at least 1 smoke test per file to verify basic functionality:

```typescript
// Example smoke test structure
import { smokeTest } from '../test/helpers';

smokeTest('cache-manager should handle basic operations', async () => {
  const cache = CacheManager.getInstance();
  const result = await cache.getOrLoad('test', async () => 'data');
  expect(result).toBe('data');
});

smokeTest('toolchain-generator should generate config', async () => {
  const generator = new ToolchainGenerator();
  await expect(generator.generate([], 'test.yaml')).resolves.not.toThrow();
});

smokeTest('ship-service methods should not crash', async () => {
  const service = new ShipService();
  await expect(service.resolveFeature('TEST-001')).resolves.toBeDefined();
});
```

### Integration Tests
Rely on existing comprehensive test suite (1300+ tests) for regression prevention.

## Patterns Used

- **Constructor Injection** (`.hodge/patterns/constructor-injection-for-testing.md`)
  - Applied to ToolchainGenerator (new), ShipCommand (already has it)
  - Default instances in constructor parameters for zero-config usage

- **Service Extraction** (from exploration approach)
  - Extract validation, business logic, complex operations into services
  - Keep command classes as thin orchestration layers

- **Test Pattern** (`.hodge/patterns/test-pattern.md`)
  - Focus on behavior testing, not implementation
  - Test what users see, not how code works internally

## Complexity Reduction Tracking

| File | Function | Before | After | Reduction | Status |
|------|----------|--------|-------|-----------|--------|
| ship.ts | execute() | 46 | <15 ✅ | 31+ points | **COMPLETE** |
| cache-manager.ts | getOrLoad() | 32 | TBD | TBD | Pending |
| toolchain-generator.ts | generate() | 40 | TBD | TBD | Pending |

**Goal**: All functions <15 complexity

**Progress**: 1/3 files complete (33%)

## Risk Mitigation

### High-Risk Areas
1. **ship.ts** - Production-critical shipping workflow
   - Mitigation: Full test suite + manual smoke test
   - Validation: Verify ship-record, PM updates, commits all work

2. **Breaking existing tests**
   - Mitigation: Run tests after EACH file, not at end
   - Validation: 100% test pass rate required

3. **Introducing subtle bugs during extraction**
   - Mitigation: Behavior-focused tests verify equivalence
   - Validation: Integration tests cover end-to-end workflows

### Medium-Risk Areas
1. **Constructor injection breaking instantiation**
   - Mitigation: Default parameters maintain backward compatibility
   - Validation: Existing code works without changes

2. **New ToolCategoryMapper class complexity**
   - Mitigation: Extract incrementally, verify at each step
   - Validation: Toolchain.yaml output must be identical

## Next Steps After Implementation

1. **Immediate Validation**:
   - [ ] Run full test suite: `npm test`
   - [ ] Run linting: `npm run lint`
   - [ ] Verify ESLint errors reduced by ~30%
   - [ ] Check complexity scores for all 3 functions (<15)

2. **Stage Work for Review**:
   ```bash
   git add .
   ```

3. **Move to Harden Phase**:
   ```bash
   /harden HODGE-357.1
   ```

4. **Update Parent Epic**:
   - Document Phase 1 completion
   - Report complexity reduction metrics
   - Prepare for Phase 2 (HODGE-357.2)

## Implementation Notes

- Follow incremental refactoring: extract one method at a time, test, commit
- Use TypeScript strict mode compliance throughout
- Keep existing error handling behavior unchanged
- Maintain all logging (console + pino) as-is
- No `any` types except in test mocks
- Document extracted methods with JSDoc comments

---

**Ready to implement!** Follow the file order above, validate after each step, and maintain zero regressions.
