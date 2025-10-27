# Exploration: Complete Remaining 67 ESLint Errors from HODGE-356

**Feature**: HODGE-357
**Started**: 2025-10-26
**Status**: Exploring

## Problem Statement

After HODGE-356's quick wins (fixing 32 simple ESLint errors), **407 total ESLint issues remain** in the codebase:
- **69 errors** (blocking)
- **338 warnings** (non-blocking but should be addressed)

These issues prevent shipping HODGE-356 and represent significant technical debt. The remaining errors require substantial refactoring rather than simple pattern replacements.

### Why This Matters

1. **CI Pipeline Fails**: Cannot ship features with ESLint errors
2. **Code Quality**: High cognitive complexity indicates poor maintainability
3. **Security**: Regex backtracking and PATH injection vulnerabilities
4. **Technical Debt**: Accumulates over time if not addressed systematically

## Current State Analysis

### Error Breakdown by Category

| Category | Count | Severity | Priority |
|----------|-------|----------|----------|
| Cognitive Complexity | 24 | Error | P1 - Critical |
| File/Function Length | 34 | Warning | P2 - High |
| Nullish Coalescing | 89 | Warning | P4 - Low |
| Security Issues | 9 | Error | P3 - Medium |
| Empty Catch Blocks | 11 | Warning | P2 - High |
| TODO Comments | 8 | Warning | P5 - Cleanup |
| Other Code Quality | 242 | Warning | P4 - Low |

### Critical Refactoring Required (Top 3 Functions)

#### 1. `src/commands/ship.ts:31` - execute() method
- **Complexity**: 56 (allowed: 15)
- **Lines**: 271 (allowed: 50)
- **Impact**: Core shipping workflow
- **Issue**: Mixes validation, quality gates, PM updates, and commits in one function

**Current Structure**:
```typescript
async execute(feature?: string, options: ShipOptions = {}): Promise<void> {
  // 271 lines doing EVERYTHING:
  // - Feature resolution
  // - Hardening validation
  // - Quality gate execution
  // - PM issue updates
  // - Commit creation
  // - Lessons learned generation
  // - Complex branching logic
}
```

#### 2. `src/lib/toolchain-generator.ts:30` - generate()
- **Complexity**: 40 (allowed: 15)
- **Lines**: ~200
- **Impact**: Init command toolchain detection
- **Issue**: Large switch statement for tool categorization

**Current Structure**:
```typescript
async generate(detectedTools: DetectedTool[], outputPath: string): Promise<void> {
  // Loops through all detected tools
  // Giant switch statement mapping categories
  // Complex command generation logic
  // No extraction of concerns
}
```

#### 3. `src/lib/cache-manager.ts:108` - getOrLoad()
- **Complexity**: 32 (allowed: 15)
- **Lines**: 65
- **Impact**: Performance-critical caching
- **Issue**: TTL logic, checksum validation, error handling all mixed

**Current Structure**:
```typescript
async getOrLoad<T>(key: string, loader: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
  // Nested conditionals for:
  // - Cache validity checks
  // - TTL expiration
  // - Checksum validation
  // - Error handling
  // - Cache updates
}
```

### High Complexity Functions (5 functions, complexity 25-31)

1. **src/lib/pm/pm-hooks.ts:269** - `generateRichComment()` - Complexity 31
   - Issue: Verbosity-based branching, multiple concatenation paths
   - Lines: 67

2. **src/lib/detection.ts:423** - `detectFramework()` - Complexity 27
   - Issue: Multiple framework detection paths with nested checks

3. **src/lib/detection.ts:478** - `detectDatabase()` - Complexity 26
   - Issue: Similar to detectFramework, needs extraction

4. **src/commands/explore.ts:81** - `execute()` - Complexity 26
   - Lines: 177
   - Issue: Mixed exploration logic and PM integration

5. **src/lib/feature-spec-loader.ts:72** - Complexity 26
   - Issue: Complex YAML/JSON parsing logic

### Medium Complexity (5 functions, complexity 20-24)

- `src/commands/init.ts:89` - execute() - 22
- `src/commands/decide.ts:19` - execute() - 22
- `src/lib/auto-detection-service.ts:47` - detectProfiles() - 17
- `src/lib/auto-detection-service.ts:122` - evaluateDetectionRules() - 22
- `src/lib/pm/pm-hooks.ts` - 2 functions (20-24)

### Low Complexity Quick Wins (11 functions, complexity 16-19)

- `src/commands/init.ts` - 3 functions (16-19)
- `src/lib/feature-populator.ts` - 2 functions (16-18)
- `src/lib/prompts.ts:16` - 18
- `src/lib/detection.ts:166` - 18
- `src/lib/pm/pm-hooks.ts:562` - 17
- `src/lib/profile-composition-service.ts:187` - 19
- `src/lib/review-tier-classifier.ts:224` - 16

### Security Vulnerabilities

#### Slow Regex (4 occurrences)
- **src/commands/init.ts:1105** - Backtracking vulnerability
- Need: Rewrite patterns without nested quantifiers

#### PATH Injection (5 occurrences)
- **src/lib/detection.ts:189** - `which` command using PATH
- **src/lib/detection.ts:312** - Similar PATH usage
- Need: Validate paths or use absolute paths

### File Length Violations

| File | Lines | Allowed | Overage |
|------|-------|---------|---------|
| src/lib/claude-commands.ts | 3062 | 300 | +2762 |
| src/commands/init.ts | 985 | 300 | +685 |
| src/commands/explore.ts | 651 | 300 | +351 |
| src/commands/plan.ts | 604 | 300 | +304 |
| src/commands/harden.ts | 567 | 300 | +267 |
| src/lib/cache-manager.ts | 308 | 300 | +8 |
| src/commands/context.ts | 389 | 300 | +89 |
| src/commands/status.ts | 401 | 300 | +101 |

**Note**: `claude-commands.ts` is template-heavy and may need exemption consideration.

## Exploration Approaches

### Approach 1: Phased Incremental Refactoring (Recommended)

**Philosophy**: Fix in priority order, ship incrementally

**Phases**:

#### Phase 1: Critical Complexity (Week 1)
- Extract ship.ts execute() into service methods
- Extract toolchain-generator.ts switch logic
- Extract cache-manager.ts validation logic
- **Goal**: Reduce top 3 complexity scores from 56/40/32 → <15
- **Ship**: After phase 1 complete

#### Phase 2: High Complexity (Week 2)
- Refactor 5 high-complexity functions (25-31)
- Use strategy pattern for pm-hooks verbosity logic
- Extract detection helpers from detection.ts
- **Ship**: After phase 2 complete

#### Phase 3: Medium + Security (Week 3)
- Fix 5 medium-complexity functions (20-24)
- Rewrite slow regexes
- Validate PATH usage
- Fix empty catch blocks
- **Ship**: After phase 3 complete

#### Phase 4: File Length + Warnings (Week 4)
- Split large files (init.ts, explore.ts, etc.)
- Convert || to ?? (89 occurrences - automated)
- Fix unnecessary conditionals
- **Ship**: Final cleanup

**Pros**:
- ✅ Ship value incrementally
- ✅ Manageable scope per phase
- ✅ Can pause/resume between phases
- ✅ Reduced merge conflict risk

**Cons**:
- ❌ Multiple feature branches
- ❌ Longer overall timeline
- ❌ May accumulate new errors during refactoring

**Estimated Effort**: 4 weeks (1 week per phase)

---

### Approach 2: Big Bang Complete Refactoring

**Philosophy**: Fix everything in one comprehensive effort

**Tasks**:
1. Refactor all 24 cognitive complexity errors
2. Split all 8 oversized files
3. Fix all 9 security vulnerabilities
4. Fix all 11 empty catch blocks
5. Convert all 89 nullish coalescing warnings
6. Address remaining code quality issues

**Pros**:
- ✅ Complete resolution in one feature
- ✅ Single PR, single review
- ✅ Comprehensive test coverage update

**Cons**:
- ❌ High risk of merge conflicts
- ❌ Difficult to review (massive PR)
- ❌ Long feature branch = integration hell
- ❌ All-or-nothing (can't ship partial progress)
- ❌ Estimated 2-3 weeks of focused work

**Estimated Effort**: 2-3 weeks continuous work

---

### Approach 3: Automated Tooling + Manual Refactoring

**Philosophy**: Automate what can be automated, manually fix the rest

**Phase 1 - Automated Fixes** (Day 1):
```bash
# ESLint auto-fix for safe transformations
npx eslint . --fix

# Converts || to ?? automatically
# Fixes some formatting issues
# Removes unnecessary conditions
```

**Phase 2 - Manual Critical Refactoring** (Week 1-2):
- Manually refactor 24 cognitive complexity errors
- Manual security fixes (regexes, PATH)
- Manual file splitting

**Phase 3 - Manual Cleanup** (Week 3):
- Empty catch blocks
- TODO comments
- Remaining manual fixes

**Pros**:
- ✅ Automated fixes reduce manual work
- ✅ Focuses human effort on complex refactoring
- ✅ Fast initial progress

**Cons**:
- ❌ ESLint --fix may introduce behavior changes
- ❌ Need comprehensive test verification
- ❌ May create churn if automated fixes are wrong

**Estimated Effort**: 1 day automated + 2 weeks manual

---

### Approach 4: Service Extraction Pattern (Architectural)

**Philosophy**: Refactor by extracting services, not just reducing complexity

**Pattern**:
```typescript
// Before: 271-line ship.ts execute()
async execute(feature?: string, options: ShipOptions = {}): Promise<void> {
  // All logic inline
}

// After: Thin orchestration layer
async execute(feature?: string, options: ShipOptions = {}): Promise<void> {
  const featureContext = await this.featureResolver.resolve(feature);
  await this.validationService.validateShipReadiness(featureContext);
  const qualityResults = await this.qualityGateService.run(featureContext);
  await this.pmService.updateIssue(featureContext, qualityResults);
  await this.commitService.createShipCommit(featureContext, qualityResults);
  await this.learningService.generateLessons(featureContext);
}
```

**Services to Extract**:
1. **FeatureResolverService** - Resolve feature from args/context
2. **ShipValidationService** - Validate hardening, prerequisites
3. **QualityGateService** - Run tests, linting, type checks
4. **PMIntegrationService** - Update PM issues
5. **ShipCommitService** - Create commits with messages
6. **LearningService** - Generate lessons learned

**Pros**:
- ✅ Cleanest architecture
- ✅ Highly testable (each service isolated)
- ✅ Reusable services across commands
- ✅ Long-term maintainability

**Cons**:
- ❌ Most invasive refactoring
- ❌ Risk of over-engineering
- ❌ Longer implementation time
- ❌ May violate "thin CLI orchestration" standard

**Estimated Effort**: 3-4 weeks

---

## Recommended Approach: Hybrid Phased + Service Extraction

**Combine Approach 1 (Phased) + Approach 4 (Service Extraction)**

### Phase 1: ship.ts Service Extraction (Week 1)
Extract ship.ts into services:
- ShipValidationService
- QualityGateService
- ShipCommitService
- Keep PM and learning logic inline for now

**Ship after**: ship.ts complexity < 15

### Phase 2: Critical Complexity (Week 2)
- toolchain-generator.ts: Extract strategy pattern
- cache-manager.ts: Extract validation helper
- pm-hooks.ts: Extract comment generator

**Ship after**: Top 8 functions < 15 complexity

### Phase 3: Security + File Splitting (Week 3)
- Fix 9 security vulnerabilities
- Split init.ts, explore.ts (2 largest files)
- Fix empty catch blocks

**Ship after**: All errors resolved, warnings acceptable

### Phase 4: Automated Cleanup (Week 4)
```bash
npx eslint . --fix  # Auto-fix warnings
npm test           # Verify no regressions
```

**Ship after**: Zero errors, minimal warnings

## Complexity Reduction Strategies

### Strategy 1: Extract Validation Methods

**Pattern**:
```typescript
// Before: Nested validation (high complexity)
async execute() {
  if (!feature) throw Error('No feature');
  if (!existsSync(dir)) throw Error('No directory');
  if (!validationPassed) throw Error('Not validated');
  // 300 more lines...
}

// After: Extracted validation (low complexity)
async execute() {
  await this.validatePrerequisites(feature);
  await this.runWorkflow(feature);
}

private async validatePrerequisites(feature: string): Promise<void> {
  if (!feature) throw Error('No feature');
  if (!existsSync(dir)) throw Error('No directory');
  if (!validationPassed) throw Error('Not validated');
}
```

**Reduces complexity**: 10-15 points per extraction

---

### Strategy 2: Strategy Pattern for Branching Logic

**Pattern**:
```typescript
// Before: Complex switch/if-else (high complexity)
if (pmTool === 'linear') {
  // 30 lines Linear logic
} else if (pmTool === 'github') {
  // 30 lines GitHub logic
} else if (pmTool === 'jira') {
  // 30 lines Jira logic
}

// After: Strategy pattern (low complexity)
const adapter = PMAdapterFactory.create(pmTool);
await adapter.updateIssue(data);
```

**Reduces complexity**: 15-20 points for large switch statements

---

### Strategy 3: Early Returns (Guard Clauses)

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

**Reduces complexity**: 5-10 points per function

---

### Strategy 4: Extract Configuration Objects

**Pattern**:
```typescript
// Before: Many parameters (high complexity)
function processData(
  a: string,
  b: number,
  c: boolean,
  d: string[],
  e: Record<string, unknown>
) {
  // Complex logic using all parameters
}

// After: Config object (low complexity)
interface ProcessConfig {
  source: string;
  count: number;
  enabled: boolean;
  items: string[];
  metadata: Record<string, unknown>;
}

function processData(config: ProcessConfig) {
  // Same logic, clearer intent
}
```

**Reduces complexity**: 3-5 points per extraction

## Security Fix Patterns

### Fix 1: Slow Regex Rewrite

**Before** (backtracking vulnerability):
```typescript
// src/commands/init.ts:1105
const pattern = /^(.*?)\s*=\s*(.*)$/;  // Catastrophic backtracking
```

**After** (non-backtracking):
```typescript
const pattern = /^([^=\s]+)\s*=\s*(.+)$/;  // Specific character classes
// OR add input length validation:
if (input.length > 1000) throw new Error('Input too long');
```

### Fix 2: PATH Validation

**Before** (PATH injection risk):
```typescript
// src/lib/detection.ts:189
const { stdout } = await execAsync(`which ${toolName}`);
```

**After** (validated):
```typescript
// Validate toolName is alphanumeric only
if (!/^[a-zA-Z0-9-_]+$/.test(toolName)) {
  throw new Error('Invalid tool name');
}
const { stdout } = await execAsync(`which ${toolName}`);

// OR use absolute paths:
const knownPaths = ['/usr/local/bin', '/usr/bin'];
for (const dir of knownPaths) {
  const fullPath = path.join(dir, toolName);
  if (existsSync(fullPath)) return fullPath;
}
```

## Testing Strategy

### Test Coverage Requirements

Each refactored function MUST maintain/improve test coverage:

| Phase | Test Type | Coverage Goal |
|-------|-----------|---------------|
| Phase 1 | Integration | 90%+ for ship.ts services |
| Phase 2 | Unit + Integration | 85%+ for extracted helpers |
| Phase 3 | Security tests | 100% for security fixes |
| Phase 4 | Regression | All existing tests pass |

### Regression Prevention

**Before ANY refactoring**:
```bash
npm test                    # Capture baseline (all tests pass)
npm run test:coverage       # Capture coverage baseline
```

**After EACH file refactoring**:
```bash
npm test                    # Must pass
npm run test:coverage       # Must maintain/improve
npm run lint                # Must show reduction in errors
```

### Test Intentions Alignment

All test intentions from TI-1 through TI-5 should be validated:
- TI-1: Ship workflow end-to-end tests
- TI-2: Individual function behavior tests
- TI-3: Error handling tests (catch blocks)
- TI-4: Security vulnerability tests (regex, PATH)
- TI-5: Code quality smoke tests

## Risk Assessment

### High Risk Areas

1. **ship.ts refactoring**
   - Risk: Breaking production shipping workflow
   - Mitigation: Comprehensive integration tests, manual smoke test

2. **Security fixes**
   - Risk: Changing regex behavior breaks parsing
   - Mitigation: Extensive test coverage for affected code paths

3. **Service extraction**
   - Risk: Circular dependencies, over-engineering
   - Mitigation: Follow CLI architecture standards, thin orchestration

### Medium Risk Areas

1. **File splitting**
   - Risk: Breaking imports, circular dependencies
   - Mitigation: TypeScript compiler will catch import issues

2. **Automated fixes**
   - Risk: ESLint --fix may change behavior
   - Mitigation: Review all auto-fixes, run full test suite

### Low Risk Areas

1. **Nullish coalescing conversions** (|| → ??)
   - Safe if values are truly null/undefined checks
   - Review any || with boolean/number values

2. **Empty catch block fixes**
   - Adding logging/error handling only improves code

## Success Criteria

### Phase-Level Success

**Phase 1**:
- ✅ ship.ts complexity < 15
- ✅ All ship.ts tests passing
- ✅ Ship workflow smoke test passes

**Phase 2**:
- ✅ Top 8 functions complexity < 15
- ✅ All affected tests passing
- ✅ No new TypeScript errors

**Phase 3**:
- ✅ Zero ESLint errors
- ✅ Security vulnerabilities patched
- ✅ All tests passing

**Phase 4**:
- ✅ <50 ESLint warnings (down from 338)
- ✅ CI pipeline green
- ✅ HODGE-356 shippable

### Overall Success

- ✅ **407 issues → <50 issues** (88% reduction)
- ✅ **69 errors → 0 errors** (100% resolution)
- ✅ All 1300+ tests still passing
- ✅ No new TypeScript errors
- ✅ Coverage maintained >80%
- ✅ CI pipeline passes
- ✅ Shipping workflow validated

## Estimated Effort

### Phased Incremental Approach (Recommended)

| Phase | Focus | Effort | Cumulative |
|-------|-------|--------|------------|
| Phase 1 | Critical (ship.ts, toolchain, cache) | 2 days | 2 days |
| Phase 2 | High complexity (5 functions) | 3 days | 5 days |
| Phase 3 | Security + file splitting | 2 days | 7 days |
| Phase 4 | Automated cleanup + verification | 1 day | 8 days |

**Total**: 8 working days (~1.5 weeks)

### Alternative: Big Bang

**Total**: 15-20 working days (3-4 weeks) of continuous focused work

## Next Steps

1. **Get approval** on Hybrid Phased + Service Extraction approach
2. **Create HODGE-357.1** for Phase 1 (ship.ts service extraction)
3. **Review** ship.ts current implementation in detail
4. **Design** service interfaces before extraction
5. **Implement** Phase 1 with full test coverage
6. **Ship** Phase 1 before moving to Phase 2

## Open Questions

1. **Service extraction scope**: Extract all services (Approach 4) or only where complexity demands?
2. **File splitting strategy**: Split by responsibility or by feature area?
3. **Automated fixes**: Run `eslint --fix` in Phase 4 or avoid automation?
4. **Timeline**: Ship all 4 phases as one HODGE-357, or split into sub-features?
5. **claude-commands.ts**: Exempt from file length rules (it's template-heavy)?

## Related Context

- **HODGE-356**: Phase 1 quick wins (32 errors fixed)
- **Standards**: `.hodge/standards.md` - File/function length limits
- **Patterns**: `.hodge/patterns/constructor-injection-for-testing.md` - Service extraction pattern
- **Testing**: `.hodge/patterns/test-pattern.md` - Behavior testing approach
