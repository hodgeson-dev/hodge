# Build Plan: HODGE-321

## Feature Overview
**PM Issue**: HODGE-321 (linear)
**Status**: In Progress
**Goal**: Fix test coverage CI failures by refactoring CLI commands and adjusting coverage configuration

## Implementation Checklist

### Phase 1: Coverage Configuration (Immediate CI Fix)
- [ ] Update vitest.config.ts with coverage exclusions (scripts/, src/bin/)
- [ ] Set coverage thresholds: 80% lines/statements/functions, 75% branches
- [ ] Verify CI passes with new configuration

### Phase 2: Standards Documentation
- [ ] Add "AI-Orchestrated CLI Commands" standard to .hodge/standards.md
- [ ] Document that CLI commands (except init/logs) are called by Claude Code only
- [ ] Update test-pattern.md with Service class extraction example

### Phase 3: Service Layer Refactoring
- [ ] Create HardenService and extract business logic from HardenCommand
  - validateStandards() - returns validation results
  - runQualityGates() - returns gate results
  - runTests() - returns test results
  - generateReportData() - returns report data (not console output)
- [ ] Create ShipService and extract business logic from ShipCommand
  - handleGitOperations() - returns commit metadata
  - updatePMTracking() - returns update status
- [ ] Create SaveService and extract business logic from SaveCommand
  - handleSave() - returns save metadata
  - handleLoad() - returns load metadata

### Phase 4: CLI Command Updates
- [ ] Update HardenCommand to delegate to HardenService
- [ ] Update ShipCommand to delegate to ShipService
- [ ] Update SaveCommand to delegate to SaveService
- [ ] Ensure CLI commands remain thin orchestration wrappers

### Phase 5: Testing
- [ ] Write smoke tests for HardenService (minimum 1 required)
- [ ] Write smoke tests for ShipService (minimum 1 required)
- [ ] Write smoke tests for SaveService (minimum 1 required)
- [ ] Run full test suite to verify coverage thresholds met
- [ ] Verify CI passes with all changes

## Implementation Decisions (from /decide)

1. **Coverage Thresholds**: 80% for lines/statements/functions, 75% for branches
2. **CLI Exclusion**: Exclude scripts/, src/bin/, and execute() methods only
3. **Refactoring Pattern**: Service classes (HardenService, ShipService, SaveService)
4. **Documentation**: Add to Standards under CLI Architecture section
5. **Scope**: Refactor all three commands (harden, ship, save) in this feature
6. **Scripts Directory**: Exclude from coverage (standalone development tools)
7. **Init & Logs**: Accept lower coverage as user-facing exceptions

## Files Modified
<!-- Track files as you modify them -->
- `vitest.config.ts` - Updated coverage exclusions and thresholds
- `.hodge/standards.md` - Added AI-orchestrated CLI commands standard
- `src/lib/harden-service.ts` - NEW: Extracted business logic from HardenCommand
- `src/lib/ship-service.ts` - NEW: Extracted business logic from ShipCommand
- `src/lib/save-service.ts` - NEW: Extracted business logic from SaveCommand
- `src/commands/harden.ts` - Refactored to use HardenService
- `src/commands/ship.ts` - Refactored to use ShipService
- `src/commands/save.ts` - Refactored to use SaveService
- `src/lib/harden-service.test.ts` - NEW: Smoke tests for HardenService
- `src/lib/ship-service.test.ts` - NEW: Smoke tests for ShipService
- `src/lib/save-service.test.ts` - NEW: Smoke tests for SaveService

## Testing Strategy
- Test business logic outcomes through service classes
- Verify standards validation, quality gates, and test execution (HardenService)
- Verify git operations and PM tracking (ShipService)
- Verify save/load operations (SaveService)
- NO subprocess spawning (banned by standards)
- Focus on behavior, not implementation

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Run coverage check with `npm run test:coverage`
3. Verify CI passes with new thresholds
4. Check linting with `npm run lint`
5. Review changes
6. Proceed to `/harden HODGE-321` for integration tests
