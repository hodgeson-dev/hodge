# Exploration: HODGE-322

## Title
Complete test coverage improvements started in HODGE-321 - refactor ShipCommand to use ShipService

## Feature Overview
**PM Issue**: HODGE-322
**Type**: testing-infrastructure
**Created**: 2025-10-03T20:21:23.000Z

## Problem Statement

HODGE-321 successfully established the Service class extraction pattern by refactoring `HardenCommand` and `SaveCommand`, proving that testable business logic can be separated from CLI orchestration. However, the commit notes explicitly deferred `ShipCommand` refactoring due to its complexity (1030 lines). This feature completes the pattern by refactoring `ShipCommand`, but our exploration revealed a critical insight: **significant portions of ShipCommand are dead code that should be deleted, not refactored.**

The current `ShipService` (89 lines, 100% coverage) only extracts minimal validation logic. The real business logic that needs extraction and testing is buried within ShipCommand alongside ~300 lines of dead code.

## Context
- **Standards**: Loaded (suggested only in explore mode)
- **Available Patterns**: test-pattern.md (Service class extraction pattern from HODGE-321)
- **Recent Lessons**: HODGE-321 (Service extraction for HardenCommand/SaveCommand)
- **Related Features**: HODGE-321 (parent feature that deferred ShipCommand)

## Conversation Summary

The exploration uncovered a fundamental architectural problem with ShipCommand: it contains extensive dead code that's never executed in the actual workflow. By analyzing the `/ship` slash command template and git hooks, we discovered:

### **Dead Code Identified** (to be deleted):

1. **Commit Message Generation** (lines 269-440, ~170 lines):
   - The `/ship` slash command generates commit messages interactively in Claude Code
   - ShipCommand only *reads* the approved message from `.hodge/temp/ship-interaction/{feature}/state.json`
   - All commit message generation logic in ShipCommand is unreachable dead code
   - **Decision**: Delete entirely (Q2: Option A confirmed)

2. **Push Functionality** (lines 655-749, ~95 lines):
   - Current workflow: `/ship` creates commit, user manually pushes afterward
   - Push preview, branch protection, and execution infrastructure exists but is dormant
   - Push review file creation for Claude Code is unused
   - **Decision**: Delete entirely (Q3: Option A confirmed)

**Total Dead Code**: ~265 lines to delete

### **Quality Gates Architecture** (to be kept and refactored):

Discovered that ShipCommand quality gates (tests, coverage, docs, changelog) are **not redundant** with git hooks:

- **Git Hooks** (`.husky/pre-push`): Universal checks that run on *every* push (formatting, security)
- **Ship Quality Gates**: Phase-aware checks that run when entering "ship" phase (tests, coverage)
- **Architectural Separation**: Ship gates are *pre-commit* enforcement, hooks are *pre-push* safety net

**Decision**: Keep quality gates in ShipCommand (Q1 deferred to future feature for configurability), extract into testable ShipService methods.

### **Real Business Logic to Extract** (5 focus areas from Q4):

After removing dead code, the testable business logic is:

1. **Quality Gate Execution** (lines 208-266) - Run tests, check coverage, verify docs/changelog
2. **Ship Record Generation** (lines 453-465) - Create ship-record.json metadata
3. **Release Notes Generation** (lines 468-485) - Generate release-notes.md
4. **PM Integration** (line 506) - Update PM issue status via pmHooks.onShip()
5. **Metadata Backup/Restore** (lines 38-80, 567, 614-617) - Rollback on commit failure

These are the only areas that need Service extraction and testing.

## Implementation Approaches

### Approach 1: Delete-First Refactoring (Recommended)
**Description**: Delete dead code first to reveal the actual business logic, then extract into ShipService using the proven HODGE-321 pattern.

**Execution Order**:
```
Phase 1: Code Deletion
  1. Delete commit message generation (lines 269-440, ~170 lines)
  2. Delete push functionality (lines 655-749, ~95 lines)
  3. Update ShipCommand to read committed message from interaction state only
  4. Remove push-related options (push, noPush, pushBranch, forcePush, continuePush)
  Result: ShipCommand reduced from 1030 → ~765 lines

Phase 2: Service Extraction (5 focus areas)
  1. Extract quality gate execution into ShipService.runQualityGates()
  2. Extract ship record generation into ShipService.generateShipRecord()
  3. Extract release notes generation into ShipService.generateReleaseNotes()
  4. Extract PM integration coordination into ShipService.updatePMIssue()
  5. Extract metadata backup/restore into ShipService.backupMetadata/restoreMetadata()
  Result: ShipCommand becomes thin orchestrator (~300 lines)

Phase 3: Testing
  1. Add smoke tests for each ShipService method (target: 15-20 tests)
  2. Focus on business outcomes (what data is returned, not how it's generated)
  3. Mock external dependencies (execAsync, file I/O, PM hooks)
```

**Pros**:
- Reduces cognitive load (delete noise before refactoring signal)
- Follows proven HODGE-321 pattern exactly
- Clear separation: Phase 1 is safe deletion, Phase 2 is extraction
- Easier to review (deletion diff vs extraction diff)
- ShipCommand becomes maintainable (~300 lines vs 1030)

**Cons**:
- Requires two PR reviews (deletion, then extraction) if splitting phases
- Risk of deleting code that's actually needed (mitigated by thorough analysis)

**When to use**: When dead code obscures the real business logic that needs refactoring.

---

### Approach 2: Extract-Then-Delete
**Description**: Extract business logic into ShipService first, then delete dead code afterward.

**Execution Order**:
```
Phase 1: Service Extraction (5 focus areas)
  - Extract quality gates, ship record, release notes, PM integration, metadata backup
  - ShipCommand still contains dead code but delegates business logic

Phase 2: Code Deletion
  - Remove commit message generation and push functionality
  - Clean up now-unused helper methods
```

**Pros**:
- Business logic preserved in Service before deletion
- Lower risk of accidentally removing needed code
- Can test Service extraction independently

**Cons**:
- Harder to see what needs extraction (dead code in the way)
- Two areas of change in ShipCommand (extraction + deletion)
- Messier git history (mixed extraction and deletion)

**When to use**: When unsure if code is truly dead and want extraction as safety net.

---

### Approach 3: Hybrid Incremental Refactoring
**Description**: Delete push code first (clearly unused), extract business logic, then delete commit message generation last (if still dead after extraction).

**Execution Order**:
```
Phase 1: Delete push functionality (~95 lines)
Phase 2: Extract 5 business logic areas into ShipService
Phase 3: Re-evaluate commit message generation code
Phase 4: Delete if still unused, or keep if extraction revealed usage
```

**Pros**:
- Safest approach (incremental validation)
- Can stop at any phase if issues discovered
- Allows for mid-course corrections

**Cons**:
- Slowest approach (3-4 phases vs 2)
- More PR overhead (multiple reviews)
- Commit message generation analysis already definitive (it's dead)

**When to use**: When high uncertainty about code usage and want maximum safety.

---

## Recommendation

**Use Approach 1: Delete-First Refactoring**

**Rationale**:

1. **Analysis is Definitive**:
   - Commit message generation is proven dead (slash command does it)
   - Push functionality is proven unused (manual push in current workflow)
   - No ambiguity requiring incremental validation

2. **Follows HODGE-321 Pattern**:
   - Delete dead code doesn't change the pattern
   - Service extraction uses exact same approach as HardenService/SaveService
   - Proven pattern means lower risk

3. **Better Code Review**:
   - Deletion PR: "Remove dead code (commit gen + push)" - easy to verify
   - Extraction PR: "Extract 5 business logic areas to ShipService" - clear scope
   - Separation makes each PR focused and reviewable

4. **Maintainability Win**:
   - ShipCommand: 1030 lines → ~300 lines (70% reduction)
   - Easier to understand, modify, and debug
   - Business logic testable in isolation

5. **Aligns with Q2/Q3 Decisions**:
   - Q2: Delete commit message generation (Option A)
   - Q3: Delete push functionality (Option A)
   - Q4: Focus on 5 real business logic areas

**Implementation Order**:

1. **Build Phase**: Delete dead code, add smoke tests for deletions (verify nothing breaks)
2. **Harden Phase**: Extract 5 business logic areas, add comprehensive ShipService tests
3. **Ship Phase**: Document pattern in .hodge/patterns/, update HODGE-321 standard

---

## Test Intentions

### Dead Code Deletion Verification
- [ ] ShipCommand should not generate commit messages (reads from interaction state only)
- [ ] ShipCommand should not handle push operations (removed entirely)
- [ ] All tests should still pass after deletion (no behavioral changes)
- [ ] Ship workflow should work identically (create commit, show next steps)

### Quality Gate Extraction
- [ ] ShipService.runQualityGates() should execute test suite and return results
- [ ] ShipService.runQualityGates() should check coverage threshold and return pass/fail
- [ ] ShipService.runQualityGates() should verify docs existence and return status
- [ ] ShipService.runQualityGates() should verify changelog existence and return status
- [ ] ShipService.runQualityGates() should support skipTests option
- [ ] Quality gate results should be structured data (not console output)

### Ship Record Generation
- [ ] ShipService.generateShipRecord() should create ship record metadata with feature, timestamp, issueId
- [ ] ShipService.generateShipRecord() should include validation status and quality gate results
- [ ] ShipService.generateShipRecord() should include commit message reference

### Release Notes Generation
- [ ] ShipService.generateReleaseNotes() should generate markdown with feature name and PM issue
- [ ] ShipService.generateReleaseNotes() should include quality metrics (tests, coverage, docs, changelog)
- [ ] ShipService.generateReleaseNotes() should format date consistently

### PM Integration
- [ ] ShipService.updatePMIssue() should coordinate PM hooks to transition issue
- [ ] ShipService.updatePMIssue() should handle missing PM integration gracefully
- [ ] ShipService.updatePMIssue() should return update status

### Metadata Backup/Restore
- [ ] ShipService.backupMetadata() should save project_management.md, .session, context.json
- [ ] ShipService.restoreMetadata() should restore all backed up files
- [ ] ShipService.restoreMetadata() should handle missing files gracefully
- [ ] Metadata should be restored on commit failure (rollback safety)

### CLI Command Integration
- [ ] ShipCommand should delegate to ShipService for all business logic
- [ ] ShipCommand should remain thin orchestration layer (presentation only)
- [ ] ShipCommand should display ShipService results to user
- [ ] All existing ship workflows should continue to work identically

---

## Decisions Needed

1. **Deletion Verification Strategy**: Should we add temporary debug logging before deletion to confirm code paths are truly unused, or trust the static analysis from exploration?

2. **Service Method Granularity**: Should quality gates be one method `runQualityGates()` or separate methods (`runTests()`, `checkCoverage()`, `verifyDocs()`, `verifyChangelog()`)?

3. **Backup/Restore Location**: Should metadata backup/restore be in ShipService or a separate MetadataService (since it's error-handling logic, not core ship business logic)?

4. **PM Integration Wrapper**: Should `updatePMIssue()` be in ShipService or just have ShipCommand call `pmHooks.onShip()` directly (it's already a thin wrapper)?

5. **Test Mocking Strategy**: Should ShipService tests mock `execAsync()` and file I/O, or use temporary directories like HardenService tests?

6. **Documentation Location**: Should Service extraction pattern be added to .hodge/patterns/test-pattern.md or create new .hodge/patterns/service-extraction-pattern.md?

7. **Coverage Target**: With dead code deleted and Service tests added, what's the realistic coverage improvement target? (Current: 56.18% lines, Goal: 60%? 65%?)

---

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-322` with approved approach

---
*Exploration completed: 2025-10-03*
*AI-assisted conversational discovery*
