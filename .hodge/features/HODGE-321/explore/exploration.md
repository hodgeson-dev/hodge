# Exploration: HODGE-321

## Title
Fix test coverage CI failures by refactoring CLI commands and adjusting coverage configuration

## Feature Overview
**PM Issue**: HODGE-321
**Type**: testing-infrastructure
**Created**: 2025-10-03T18:49:26.884Z

## Problem Statement
CI is failing because test coverage is at 50.59% (lines/statements) and 73-74% (functions/branches), well below the 80% threshold. The root cause is that CLI commands (harden, ship, init, link, logs) contain untestable orchestration code that's only called by Claude Code slash commands, not by users. The current architecture violates the "test behavior not implementation" philosophy because CLI entry points cannot be tested without subprocess spawning (which is banned by standards).

## Context
- **Standards**: Loaded (suggested only in explore mode)
- **Available Patterns**: test-pattern.md, progressive-enhancement-commands.md
- **Recent Lessons**: HODGE-317.1 (subprocess spawning ban), HODGE-319.1 (subprocess regression fix), HODGE-320 (flaky tests elimination)

## Conversation Summary

The exploration revealed a fundamental architectural issue: Hodge has a dual-architecture system where CLI commands serve as orchestration layers for Claude Code slash commands, not as user-facing tools. The coverage failure isn't a testing problem—it's an architecture signal.

**Key Insights Discovered**:

1. **CLI Commands Are AI-Orchestrated**: With the exception of `init` and `logs`, all CLI commands are exclusively called by Claude Code slash commands. This is a critical architectural principle that should be documented in standards.

2. **Coverage Patterns Reveal Architecture**:
   - ✅ Good coverage (72-96%): decide, explore, load, build, plan - these already extract testable logic
   - ❌ Poor coverage (8-51%): harden, ship, save - these mix orchestration with business logic
   - ❌ Zero coverage: scripts directory, link, logs, bin/hodge.ts - orchestration-only code

3. **The Testing Paradox**: Cannot test CLI behavior via subprocess spawning (standards ban), but coverage expects CLI entry points to be tested. The solution is to test business logic outcomes, not CLI orchestration.

4. **Scripts Directory Misclassification**: The scripts/ directory contains standalone tools (ship-issue.js, sync-claude-commands.js, test-pm-connection.js) that should be excluded from core application coverage.

5. **Immediate Priority**: `/harden` at 8.21% coverage is critical because it enforces quality gates that protect production. It needs refactoring first.

## Implementation Approaches

### Approach 1: Progressive CLI Refactoring (Recommended)
**Description**: Extract testable business logic from CLI commands into service classes, starting with /harden. CLI commands become thin orchestration wrappers that call testable services.

**Pattern**:
```typescript
// Before: Untestable CLI command
class HardenCommand {
  async execute() {
    // 300 lines of mixed orchestration + business logic
  }
}

// After: Testable service + thin CLI wrapper
class HardenService {
  async validateStandards() { /* testable */ }
  async runQualityGates() { /* testable */ }
  async generateReport() { /* testable */ }
}

class HardenCommand {
  async execute() {
    const service = new HardenService();
    await service.validateStandards();
    await service.runQualityGates();
    console.log(await service.generateReport());
  }
}
```

**Pros**:
- Aligns with existing pattern (decide, explore, load already do this)
- Preserves "test behavior not implementation" philosophy
- Enables testing business outcomes without subprocess spawning
- Incremental refactoring - start with /harden, expand to /ship and /save
- CLI commands remain simple orchestration layers

**Cons**:
- Requires refactoring 3-4 commands (harden, ship, save, possibly init)
- Initial time investment before coverage improves
- Need to decide on service class architecture

**When to use**: When you want sustainable, maintainable test coverage that reflects actual business logic.

### Approach 2: Coverage Configuration Adjustment
**Description**: Adjust vitest.config.ts to exclude CLI orchestration code and scripts, setting appropriate thresholds for testable business logic only.

**Changes**:
```typescript
coverage: {
  exclude: [
    'node_modules/',
    'dist/',
    '*.config.ts',
    'scripts/',           // Exclude standalone tools
    'src/bin/**',         // Exclude CLI entry point
    'src/commands/*Command.ts',  // Exclude CLI wrappers (or just execute methods)
  ],
  thresholds: {
    lines: 80,          // Keep 80% for business logic
    functions: 80,
    branches: 75,       // Slightly lower for branch coverage
    statements: 80,
  }
}
```

**Pros**:
- Immediate CI fix - no code changes required
- Accurately reflects what should be tested (business logic)
- Aligns coverage metrics with testing philosophy
- Scripts directory properly excluded

**Cons**:
- Doesn't solve underlying architecture issue
- CLI commands still contain untestable mixed logic
- May hide technical debt in CLI orchestration layers
- Coverage numbers become less meaningful for CLI-heavy features

**When to use**: As a temporary fix while planning Approach 1, or if CLI orchestration is considered acceptable technical debt.

### Approach 3: Hybrid Approach with Facade Pattern
**Description**: Create a HardenFacade that both CLI and tests can use, providing a clean API for harden operations. CLI calls facade, tests call facade directly.

**Pattern**:
```typescript
class HardenFacade {
  async harden(feature: string, options: HardenOptions) {
    const results = {
      standards: await this.checkStandards(),
      tests: await this.runTests(),
      quality: await this.checkQuality()
    };
    return results;  // Testable return value
  }
}

// CLI uses facade
class HardenCommand {
  async execute() {
    const facade = new HardenFacade();
    const results = await facade.harden(feature, options);
    this.displayResults(results);  // Thin presentation layer
  }
}

// Tests use facade directly
test('harden validates standards', async () => {
  const facade = new HardenFacade();
  const results = await facade.harden('test-feature');
  expect(results.standards.passed).toBe(true);
});
```

**Pros**:
- Single API for both CLI and tests
- Clear separation of concerns (facade = logic, CLI = presentation)
- Easier to maintain than duplicating logic
- Testable business outcomes without subprocess spawning

**Cons**:
- Additional abstraction layer to maintain
- Facade pattern may be overkill for simple commands
- Still requires refactoring existing commands

**When to use**: When you want a formal architectural pattern with clear boundaries between business logic and presentation.

## Recommendation

**Use Progressive CLI Refactoring (Approach 1)** with immediate coverage config adjustment (Approach 2) as a bridge.

**Rationale**:
1. **Immediate CI Fix**: Adjust coverage config to exclude scripts/ and properly set thresholds
2. **Sustainable Solution**: Refactor /harden first (highest impact, lowest coverage), then /ship and /save
3. **Follow Existing Pattern**: decide, explore, load, build already demonstrate this works
4. **Align with Philosophy**: Tests business outcomes, not CLI orchestration
5. **Document Architecture**: Add standard/principle that CLI commands are AI-orchestrated

**Implementation Order**:
1. **Phase 1 (Immediate)**: Update vitest.config.ts to exclude scripts/, adjust thresholds if needed
2. **Phase 2 (High Priority)**: Refactor HardenCommand to extract HardenService with testable business logic
3. **Phase 3 (Medium Priority)**: Refactor ShipCommand and SaveCommand using same pattern
4. **Phase 4 (Documentation)**: Add principle/standard documenting CLI-as-orchestration architecture

## Test Intentions

### Coverage Configuration
- [ ] Scripts directory should be excluded from coverage metrics
- [ ] CLI entry points (src/bin/) should be excluded from coverage
- [ ] Coverage thresholds should reflect testable business logic (80% lines/statements/functions, 75% branches)

### Harden Command Refactoring
- [ ] HardenService should validate standards and return validation results
- [ ] HardenService should run quality gates and return gate results
- [ ] HardenService should run test suite and return test results
- [ ] HardenService should generate report data (not console output)
- [ ] HardenCommand should delegate to HardenService and display results
- [ ] Tests should verify business outcomes (standards validation, quality gates, test execution)

### Ship & Save Command Improvements
- [ ] ShipService should handle git operations and return commit metadata
- [ ] ShipService should update PM tracking and return update status
- [ ] SaveService should handle save/load operations and return save metadata
- [ ] Tests should verify business logic without subprocess spawning

### Documentation & Standards
- [ ] New standard should document that CLI commands are AI-orchestrated (not user-facing)
- [ ] Test pattern documentation should include CLI refactoring example
- [ ] Coverage configuration should be documented in standards

## Decisions Needed

1. **Coverage Threshold Strategy**: Should we maintain 80% for all metrics, or accept lower thresholds (75%) for branch coverage given CLI architecture?

2. **CLI Exclusion Scope**: Should we exclude entire CLI command files from coverage, or just the execute() methods? What about src/bin/?

3. **Refactoring Pattern**: Should we use Service classes (HardenService), Facade pattern (HardenFacade), or another architectural pattern?

4. **Documentation Standard**: Should "CLI commands are AI-orchestrated" be added as a Principle or a Standard? Where does it fit?

5. **Ship & Save Priority**: Should we refactor /ship (51%) and /save (70%) in this feature, or defer to separate features after validating the pattern with /harden?

6. **Scripts Directory**: Confirm that scripts/ should be excluded from coverage (these are standalone tools, not core application code)?

7. **Init & Logs Commands**: How should we handle init (25%, user-facing) and logs (0%, debugging tool) - refactor or accept lower coverage?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-321` with approved approach

---
*Exploration completed: 2025-10-03*
*AI-assisted conversational discovery*
