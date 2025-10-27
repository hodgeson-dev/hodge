# Test Intentions for HODGE-357.1

## Purpose
Document behavioral expectations for Phase 1 - Critical Complexity Reduction.
These are not actual tests, but a checklist of behaviors to verify during build phase.

## TI-1: Ship Workflow Preservation
**What**: After ship.ts refactoring, the complete shipping workflow must work identically
**Verify**:
- [ ] Run existing ship.ts integration tests (all pass)
- [ ] Manual smoke test: `hodge ship TEST-FEATURE` completes successfully
- [ ] Verify ship-record.json created with correct structure
- [ ] Verify PM issue updated in Linear
- [ ] Verify git commit created with ship message

## TI-2: Toolchain Generation Equivalence
**What**: After toolchain-generator.ts refactoring, toolchain.yaml output must be identical
**Verify**:
- [ ] Run existing toolchain generation tests (all pass)
- [ ] Compare generated toolchain.yaml before/after refactoring (byte-identical)
- [ ] Verify all tool categories mapped correctly (linting, testing, formatting, etc.)
- [ ] Verify commands section generated correctly for each tool

## TI-3: Cache Performance Maintenance
**What**: After cache-manager.ts refactoring, caching behavior and performance must be preserved
**Verify**:
- [ ] Run existing cache-manager tests (all pass)
- [ ] Verify cache hits still work (loader not called on second access to same key)
- [ ] Verify checksum validation still works for file-based cache
- [ ] Verify TTL expiration works correctly (cache invalidated after TTL)
- [ ] Verify cache performance characteristics unchanged (no regression)

## TI-4: Constructor Injection Testability
**What**: Extracted services must be testable via constructor injection
**Verify**:
- [ ] Create test that injects mock ShipService into ShipCommand
- [ ] Create test that injects mock ToolCategoryMapper into ToolchainGenerator
- [ ] Verify mocks are called correctly (method calls verified)
- [ ] Verify test isolation works (can test command without real services)

## TI-5: Complexity Verification
**What**: All 3 functions must have complexity <15 after refactoring
**Verify**:
- [ ] Run `npm run lint` after cache-manager.ts refactoring (no complexity errors)
- [ ] Run `npm run lint` after toolchain-generator.ts refactoring (no complexity errors)
- [ ] Run `npm run lint` after ship.ts refactoring (no complexity errors)
- [ ] Document actual complexity scores in build plan (target: <15 for all 3)

## TI-6: Regression Prevention
**What**: Full test suite must pass after each file refactoring
**Verify**:
- [ ] Run `npm test` after cache-manager.ts refactoring (all 1300+ tests pass)
- [ ] Run `npm test` after toolchain-generator.ts refactoring (all tests pass)
- [ ] Run `npm test` after ship.ts refactoring (all tests pass)
- [ ] No new test failures introduced during refactoring

## TI-7: Service Method Isolation
**What**: Extracted service methods must work independently (unit testable)
**Verify**:
- [ ] Unit test ShipService.validateShipReadiness() in isolation
- [ ] Unit test ShipService.runQualityGates() in isolation
- [ ] Unit test ShipService.createShipCommit() in isolation
- [ ] Unit test ToolCategoryMapper.mapToolToCategories() in isolation
- [ ] Unit test ToolCategoryMapper.buildCommandConfig() in isolation

## TI-8: Error Handling Preservation
**What**: Error handling behavior must be preserved after refactoring
**Verify**:
- [ ] Test that ship validation errors still throw appropriately (e.g., no hardening)
- [ ] Test that quality gate failures still prevent shipping (e.g., failing tests)
- [ ] Test that cache loading errors are still logged with proper context
- [ ] Verify error messages unchanged from user perspective

## TI-9: Integration Point Stability
**What**: Integration points (PM hooks, context manager, logger) must work after refactoring
**Verify**:
- [ ] Verify PMHooks still called correctly from ship workflow
- [ ] Verify contextManager.getFeature() still resolves features correctly
- [ ] Verify logging still works in refactored code (console + pino logs)
- [ ] Verify interaction with existing services unchanged

## Performance Criteria
- [ ] Ship command completes within same timeframe as before refactoring (<10s for typical feature)
- [ ] Toolchain generation completes within same timeframe (<2s for typical project)
- [ ] Cache operations maintain sub-millisecond performance
- [ ] No memory leaks introduced by refactoring

## Code Quality Verification
- [ ] All extracted methods have clear, descriptive names
- [ ] Code follows project's coding standards (ESLint, Prettier)
- [ ] TypeScript strict mode compliance maintained
- [ ] No new `any` types introduced (except in test mocks)

## Notes

**Refactoring Order**:
1. cache-manager.ts (least risky - private methods only)
2. toolchain-generator.ts (medium risk - new class with constructor injection)
3. ship.ts (highest risk - production critical, most complex)

**Testing Strategy**:
- Run full test suite after EACH file refactoring
- Add smoke tests for new service methods
- Verify complexity reduction with ESLint after each file

**Critical Success Factors**:
- Zero regressions (all existing tests pass)
- Complexity <15 for all 3 target functions
- Ship workflow works identically from user perspective

---
*These test intentions will be converted to actual tests during build phase.*
