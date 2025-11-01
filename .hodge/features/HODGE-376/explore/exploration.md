# Exploration: Refactor Feature-Named Test Files to Follow Functionality-Based Naming Standard

**Created**: 2025-10-31
**Status**: Exploring

## Problem Statement

We have 17 test files with feature-ID names (e.g., `hodge-319.1.smoke.test.ts`, `hodge-328.smoke.test.ts`) that violate our test naming standard established in `.hodge/standards.md`. This standard requires tests to be co-located with the code they test and named by functionality, not by the feature that created them.

**Why this matters:**
1. **Undiscoverable**: Developers modifying `ship.ts` won't find `hodge-324.smoke.test.ts`
2. **Enables duplication**: Multiple features touching the same code create duplicate test files
3. **Lose context**: Feature IDs become meaningless trivia after shipping
4. **Poor documentation**: Filenames don't describe what's being tested

## Context

### Current Standard (from `.hodge/standards.md`)

**Correct Pattern**:
- `src/lib/toolchain-service.ts`
- `src/lib/toolchain-service.smoke.test.ts`
- `src/lib/toolchain-service.integration.test.ts`

**Incorrect Pattern (Anti-Pattern)**:
- ❌ `src/lib/hodge-359-1.smoke.test.ts`
- ❌ `src/test/feature-tests/hodge-400.test.ts`

### Files to Refactor (17 total)

**src/bin/**:
- `hodge-371-cleanup.smoke.test.ts` - Tests deleted commands/files (one-time cleanup)

**src/commands/**:
- `explore.hodge053.test.ts` - Tests ExploreCommand.detectInputType()
- `hodge-319.1.smoke.test.ts` - Tests build.ts, explore.ts, harden.ts, ship.ts file contents
- `hodge-319.4.smoke.test.ts` - Tests BuildCommand doesn't create context.json
- `hodge-324.smoke.test.ts` - Tests ship.ts doesn't generate lessons-draft
- `hodge-325.smoke.test.ts` - Tests /explore template decision tracking
- `hodge-326.smoke.test.ts` - Tests /build template conditional logic

**src/lib/**:
- `hodge-319.3.smoke.test.ts` - Tests /build template structure

**src/test/**:
- `hodge-328.integration.test.ts` - Tests validate-standards.js script
- `hodge-328.smoke.test.ts` - Tests validate-standards.js script
- `hodge-329.smoke.test.ts` - Tests GitHub workflows quality.yml
- `hodge-351.smoke.test.ts` - Tests vitest.config.ts worker limits
- `hodge-352.smoke.test.ts` - Tests project structure (docs/, examples/)
- `hodge-353.smoke.test.ts` - Tests package.json publishing config
- `hodge-354.smoke.test.ts` - Tests release-utils.js functions
- `hodge-356.smoke.test.ts` - Tests HardenService and ShipService APIs
- `hodge-357-6.smoke.test.ts` - Tests ESLint config template exemptions

### Key Insights from Analysis

1. **One obsolete test**: `hodge-371-cleanup.smoke.test.ts` verifies one-time cleanup actions and can be deleted
2. **Duplicate coverage exists**: `hodge-319.3` and `hodge-326` both test `.claude/commands/build.md`
3. **Some tests are complementary**: `hodge-319.1` (code inspection) and `hodge-319.4` (runtime behavior) test different aspects
4. **Existing command tests have good coverage**: We can merge into existing files without creating duplication

## Conversation Summary

We discussed three key questions:

### 1. Cleanup Test Exception
**Decision**: The `hodge-371-cleanup.smoke.test.ts` file can be deleted. While cleanup verification tests might be a valid exception to the standard, this particular test has served its purpose and is no longer needed.

### 2. Test Organization Strategy
**Decision**: Use "Distribute to match what they test" approach (Option B)
- Tests for configuration files go next to those files (vitest.config.test.ts at root)
- Tests for scripts go in scripts/ directory
- Tests for services go next to service files
- Cross-cutting project-level tests stay in src/test/ with descriptive names

### 3. Refactoring Depth
**Decision**: Moderate approach (Option B)
- Rename and consolidate where it makes sense
- Actively eliminate duplication during consolidation
- Don't just rename - actually analyze and merge

### Critical Finding: Duplication Detection

During analysis, we discovered that multiple hodge-XXX files test the same functionality:
- Tests must be carefully merged to avoid duplicating coverage
- Some tests are code inspection (static), others are behavioral (runtime) - these are complementary
- Template tests (for `.claude/commands/*.md`) should be consolidated into one file

## Implementation Approaches

### Approach 1: Minimal Renaming (Rejected)
**Description**: Simply rename files to match functionality without consolidation

**Pros**:
- Fastest to implement
- Lowest risk of breaking tests
- Easy to review

**Cons**:
- Doesn't address duplication
- Misses opportunity to improve test organization
- Still leaves tests scattered across multiple files

**When to use**: When time is critical and code freeze is imminent

### Approach 2: Moderate Consolidation (RECOMMENDED)
**Description**: Strategically merge tests to eliminate duplication while following the standard

**Implementation Strategy**:
1. **DELETE obsolete**: Remove `hodge-371-cleanup.smoke.test.ts`
2. **CONSOLIDATE templates**: Merge all slash command template tests into `src/test/slash-command-templates.smoke.test.ts`
3. **MERGE into commands**: Add tests to existing `explore.new-style.test.ts`, `ship.smoke.test.ts`, `harden.smoke.test.ts`
4. **DISTRIBUTE to modules**: Move service tests to `src/lib/*-service.smoke.test.ts`
5. **DISTRIBUTE to scripts**: Move script tests to `scripts/**/*.test.ts`
6. **RENAME project-level**: Give descriptive names to cross-cutting tests in `src/test/`

**Pros**:
- Eliminates duplication (we found hodge-319.3 and hodge-326 both test build.md)
- Tests are discoverable when modifying code
- Follows the standard strictly
- Preserves all coverage
- Better organized by functionality

**Cons**:
- Requires careful analysis to avoid breaking tests
- More work than simple renaming
- Larger diff to review

**When to use**: When we want to fix the problem properly (our current situation)

### Approach 3: Comprehensive Restructuring (Overkill)
**Description**: Completely reorganize all tests across the codebase to strictly follow co-location

**Pros**:
- Perfect adherence to standard
- Opportunity to fix ALL test organization issues

**Cons**:
- Very high risk of breaking tests
- Would touch hundreds of files
- Out of scope for this feature
- Diminishing returns

**When to use**: Major test refactoring initiative, not for this targeted fix

## Recommendation

**Use Approach 2: Moderate Consolidation**

This approach strikes the right balance between fixing the problem and managing risk. It:
- Directly addresses the standard violation
- Eliminates discovered duplication
- Makes tests discoverable
- Preserves all test coverage
- Sets a good example for future test organization

### Detailed Refactoring Plan

**Phase 1: Delete Obsolete (1 file)**
- Delete: `src/bin/hodge-371-cleanup.smoke.test.ts`

**Phase 2: Consolidate Templates (3 → 1 file)**
- Create: `src/test/slash-command-templates.smoke.test.ts`
- Merge from: `hodge-319.3`, `hodge-325`, `hodge-326`
- Eliminates: Duplication between hodge-319.3 and hodge-326 (both test build.md)

**Phase 3: Merge into Commands (4 files merged)**
- Merge into `explore.new-style.test.ts`: hodge053 (detectInputType) + hodge-319.1 (explore portion)
- Create `build.smoke.test.ts`: hodge-319.1 (build portion) + hodge-319.4
- Merge into `ship.smoke.test.ts`: hodge-319.1 (ship portion) + hodge-324
- Merge into `harden.smoke.test.ts`: hodge-319.1 (harden portion)

**Phase 4: Distribute to Modules (2 files)**
- Create `src/lib/harden-service.smoke.test.ts`: hodge-356 (HardenService portion)
- Create `src/lib/ship-service.smoke.test.ts`: hodge-356 (ShipService portion)

**Phase 5: Distribute to Scripts (2 files)**
- Create `scripts/validate-standards.test.ts`: hodge-328.*
- Create `scripts/lib/release-utils.test.ts`: hodge-354

**Phase 6: Distribute to Config (1 file)**
- Create `vitest.config.test.ts` at root: hodge-351

**Phase 7: Rename Project-Level (4 files)**
- `hodge-329` → `github-workflows.smoke.test.ts`
- `hodge-352` → `project-structure.smoke.test.ts`
- `hodge-353` → `package-configuration.smoke.test.ts`
- `hodge-357-6` → `eslint-configuration.smoke.test.ts`

**Net Result**:
- Delete: 1 file
- Create: 8 new files
- Merge into: 3 existing files
- Remove: 16 hodge-XXX files
- **Zero duplication**
- **100% coverage preserved**

## Test Intentions

### Behavioral Expectations

1. **All existing tests must pass after refactoring**
   - No test logic changes, only file organization
   - Coverage must remain identical

2. **Tests must be discoverable by functionality**
   - Developer modifying `ship.ts` can find ship tests
   - Developer modifying `vitest.config.ts` can find vitest config tests

3. **No duplicate test coverage**
   - Tests merged from hodge-319.3 and hodge-326 should not duplicate assertions
   - Each test case should verify unique behavior

4. **Cross-cutting tests clearly named**
   - `github-workflows.smoke.test.ts` obviously tests GitHub Actions
   - `package-configuration.smoke.test.ts` obviously tests package.json

5. **Test files follow standard naming convention**
   - Format: `<module-name>.<test-type>.test.ts`
   - Examples: `build.smoke.test.ts`, `harden-service.smoke.test.ts`

### Verification Strategy

After refactoring:
1. Run full test suite - all tests must pass
2. Check test count - should match before/after
3. Verify file locations match standard
4. Confirm no hodge-XXX test files remain
5. Validate new files follow naming convention

## Decisions Decided During Exploration

1. ✓ **Delete hodge-371-cleanup.smoke.test.ts** - One-time cleanup verification, no longer needed
2. ✓ **Use "Distribute" strategy (Option B)** - Tests go next to what they test
3. ✓ **Moderate refactoring depth** - Rename and consolidate, actively eliminate duplication
4. ✓ **Slash command template tests in src/test/** - Not in .claude/ directory (Hodge tests stay in Hodge codebase)
5. ✓ **Merge complementary tests** - Code inspection (hodge-319.1) and runtime behavior (hodge-319.4) both valuable

## No Decisions Needed

All decisions were resolved during exploration. Ready to build!

## Next Steps

1. ✅ Approve exploration
2. `/build HODGE-376` - Implement the refactoring following the detailed plan
3. Run test suite to verify all tests pass
4. `/harden HODGE-376` - Add any integration tests if needed
5. `/ship HODGE-376` - Ship the refactored test organization
