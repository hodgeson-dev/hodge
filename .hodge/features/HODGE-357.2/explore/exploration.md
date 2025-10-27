# Exploration: Phase 2 - High Complexity Reduction via Service Extraction and File Splitting

**Feature**: HODGE-357.2
**Parent**: HODGE-357 - Complete Remaining ESLint Errors from HODGE-356
**Created**: 2025-10-27
**Status**: Exploring

## Problem Statement

Refactor 5 high-complexity functions (complexity 25-31) to reduce cognitive complexity below 15 while ensuring no file length violations are created. This is Phase 2 of the 4-phase ESLint cleanup effort.

**Target Functions**:
1. `src/lib/pm/pm-hooks.ts:269` - `generateRichComment()` - Complexity 31
2. `src/lib/detection.ts:423` - `detectFramework()` - Complexity 27
3. `src/lib/detection.ts:478` - `detectDatabase()` - Complexity 26
4. `src/commands/explore.ts:81` - `execute()` - Complexity 26
5. `src/lib/feature-spec-loader.ts:72` - Complexity 26

**Success Criteria**:
- All 5 functions reduced to complexity <15
- No files exceed 300-line limit after refactoring
- All existing tests still passing (1300+ tests)
- ESLint errors reduced by ~20%

## Context from Parent Epic (HODGE-357)

The parent epic identified 407 ESLint issues (69 errors, 338 warnings) requiring systematic refactoring through 4 phases over 8 days. The Hybrid Phased + Service Extraction approach was chosen to ship incrementally, reducing merge conflict risk.

**Phase 1 (HODGE-357.1 - ✓ Shipped)**: Reduced top 3 critical complexity functions (56/40/32 → <15) using comprehensive service extraction with constructor injection pattern. This established the architectural pattern we'll continue in Phase 2.

## Context from Sibling (HODGE-357.1)

HODGE-357.1 successfully refactored the 3 most complex functions using:
- **Comprehensive service extraction** for long-term architectural value
- **Constructor injection pattern** for testability (follows `constructor-injection-for-testing.md`)
- **File-size based solutions**: Enhanced existing ShipService, created ToolCategoryMapper helper, extracted cache-manager private methods
- **Full test suite validation** after each file refactoring

This Phase 2 continues the same proven pattern.

## File Size Analysis

Critical discovery: 3 of 4 target files are **severely over the 300-line limit**, requiring service extraction (not just private methods):

| File | Lines | Status | Required Action |
|------|-------|--------|-----------------|
| **explore.ts** | 879 | ⚠️ **+579 over** (3x limit) | **MUST extract service** |
| **pm-hooks.ts** | 616 | ⚠️ **+316 over** (2x limit) | **MUST extract service** |
| **detection.ts** | 573 | ⚠️ **+273 over** | **MUST extract service** |
| **feature-spec-loader.ts** | 208 | ✅ Under limit | **Private methods OK** |

Simple private method extraction would leave these files in violation of file length standards. Service extraction is necessary to achieve compliance.

## Conversation Summary

### Scope and Strategy
We confirmed tackling **all 5 functions in one feature** (not splitting into sub-features), continuing the **comprehensive service extraction with constructor injection** pattern from Phase 1, with equal priority across all functions.

### File-Size Based Approach
Initial preference was "keep it simple" with private method extraction, but file size analysis revealed 3 files severely over the 300-line limit. We adopted a **balanced strategy**: extract services where needed for file length compliance, use private methods for files already under limit.

### Architecture Decisions
Each file gets a right-sized solution based on current size and complexity:

1. **detection.ts (573 lines)**: Extract `FrameworkDetector` and `DatabaseDetector` classes - the `ProjectDetector` class is doing too much, split into specialized detector classes using composition
2. **pm-hooks.ts (616 lines)**: Extract `CommentGeneratorService` - separate comment generation responsibility from PM integration
3. **explore.ts (879 lines)**: Extract `ExploreService` - follow Phase 1's ShipService pattern (thin command orchestration, service handles business logic)
4. **feature-spec-loader.ts (208 lines)**: Private method extraction only - file under limit, complexity reduction sufficient

### Implementation Order
Start simple, progress to complex: feature-spec-loader.ts (simplest) → detection.ts (medium) → pm-hooks.ts (medium) → explore.ts (largest/riskiest). Run full test suite after each file.

## Implementation Approaches

### Approach 1: Balanced Service Extraction with File Splitting (Recommended)

**Description**: Extract services for oversized files to achieve both complexity reduction and file length compliance. Use private methods for files already under 300 lines. Follow Phase 1's proven patterns.

**1. feature-spec-loader.ts (208 lines) - Private Methods Only**

Current complexity 26 from complex YAML/JSON parsing logic.

```typescript
// Before: One large method with complexity 26
async load(specPath: string): Promise<FeatureSpec> {
  // 100+ lines of validation + YAML parsing + JSON parsing + error handling
}

// After: Extracted private methods
async load(specPath: string): Promise<FeatureSpec> {
  const rawContent = await this.readSpecFile(specPath);
  const parsed = await this.parseSpec(rawContent, specPath);
  return this.validateSpec(parsed);
}

private async parseSpec(content: string, path: string): Promise<unknown> {
  // YAML vs JSON detection and parsing
}

private validateSpec(spec: unknown): FeatureSpec {
  // Validation logic extracted
}
```

**Complexity Reduction**: 26 → <15
**File Impact**: 208 → ~220 lines (✅ under 300)

---

**2. detection.ts (573 lines) - Extract Detector Classes**

Current: `ProjectDetector` class doing too much (framework detection, database detection, PM detection, etc.)

```typescript
// Before: Monolithic ProjectDetector (573 lines)
export class ProjectDetector {
  async detect(): Promise<ProjectInfo> {
    // Orchestrates all detection
  }

  private detectFramework(): string[] {
    // 80+ lines, complexity 27
  }

  private detectDatabase(): string[] {
    // 70+ lines, complexity 26
  }

  // ... many other detection methods
}

// After: Specialized detector classes with composition
export class ProjectDetector {
  constructor(
    private rootPath: string = process.cwd(),
    private frameworkDetector = new FrameworkDetector(rootPath),
    private databaseDetector = new DatabaseDetector(rootPath),
    private pmDetector = new PMDetector(rootPath)
  ) {}

  async detect(): Promise<ProjectInfo> {
    const frameworks = await this.frameworkDetector.detect();
    const databases = await this.databaseDetector.detect();
    // ... orchestrate detection
  }
}

// New file: framework-detector.ts
export class FrameworkDetector {
  constructor(private rootPath: string) {}

  async detect(): Promise<string[]> {
    // Framework detection logic extracted
  }

  private checkPackageJson(): string[] { /* ... */ }
  private checkConfigFiles(): string[] { /* ... */ }
}

// New file: database-detector.ts
export class DatabaseDetector {
  constructor(private rootPath: string) {}

  async detect(): Promise<string[]> {
    // Database detection logic extracted
  }

  private checkDependencies(): string[] { /* ... */ }
  private checkConfigFiles(): string[] { /* ... */ }
}
```

**Complexity Reduction**: 27/26 → <15
**File Impact**:
- `detection.ts`: 573 → ~250 lines (orchestration only)
- New `framework-detector.ts`: ~150 lines
- New `database-detector.ts`: ~150 lines
- ✅ All files under 300

---

**3. pm-hooks.ts (616 lines) - Extract Comment Generator**

Current: `PMHooks` class with mixed responsibilities (PM integration + comment generation)

```typescript
// Before: PMHooks with inline comment generation (616 lines)
export class PMHooks {
  private async generateRichComment(
    feature: string,
    verbosity: 'minimal' | 'normal' | 'verbose'
  ): Promise<string> {
    // 67 lines, complexity 31
    // Multiple concatenation paths based on verbosity
  }

  async onShip(context: ShipContext): Promise<void> {
    const comment = await this.generateRichComment(context.feature, 'verbose');
    // ... PM updates
  }
}

// After: Extracted comment generation service
export class PMHooks {
  constructor(
    private basePath?: string,
    private commentGenerator = new CommentGeneratorService()
  ) {}

  async onShip(context: ShipContext): Promise<void> {
    const comment = await this.commentGenerator.generate(context, 'verbose');
    // ... PM updates
  }
}

// New file: comment-generator-service.ts
export class CommentGeneratorService {
  async generate(
    context: ShipContext,
    verbosity: 'minimal' | 'normal' | 'verbose'
  ): Promise<string> {
    const sections = this.buildSections(context, verbosity);
    return this.formatComment(sections);
  }

  private buildSections(
    context: ShipContext,
    verbosity: string
  ): CommentSection[] {
    // Verbosity-based section building
  }

  private formatComment(sections: CommentSection[]): string {
    // Comment formatting logic
  }
}
```

**Complexity Reduction**: 31 → <15
**File Impact**:
- `pm-hooks.ts`: 616 → ~500-550 lines
- New `comment-generator-service.ts`: ~100-150 lines
- ⚠️ `pm-hooks.ts` still over limit - may need Phase 3 attention

---

**4. explore.ts (879 lines) - Extract Explore Service**

Current: Largest file at 879 lines (3x the 300-line limit), `ExploreCommand` mixing orchestration with business logic

```typescript
// Before: Monolithic ExploreCommand (879 lines)
export class ExploreCommand {
  async execute(feature?: string, options: ExploreOptions = {}): Promise<void> {
    // 177 lines, complexity 26
    // Feature resolution + PM integration + template generation + validation
  }

  // ... many other methods
}

// After: Thin orchestration (following Phase 1 ShipService pattern)
export class ExploreCommand {
  constructor(
    private exploreService = new ExploreService(),
    private pmHooks = new PMHooks(),
    private logger = createCommandLogger('explore', { enableConsole: true })
  ) {}

  async execute(feature?: string, options: ExploreOptions = {}): Promise<void> {
    const resolvedFeature = await this.exploreService.resolveFeature(feature);
    await this.exploreService.createExplorationStructure(resolvedFeature);
    await this.pmHooks.onExplore(resolvedFeature, options.description);
    await this.exploreService.generateTemplates(resolvedFeature, options);
    await this.exploreService.loadContext(resolvedFeature);
  }
}

// New file: explore-service.ts
export class ExploreService {
  async resolveFeature(feature?: string): Promise<string> {
    // Feature resolution from args/context
  }

  async createExplorationStructure(feature: string): Promise<void> {
    // Directory creation, file scaffolding
  }

  async generateTemplates(feature: string, options: ExploreOptions): Promise<void> {
    // Template generation logic
  }

  async loadContext(feature: string): Promise<void> {
    // Sub-feature context, patterns, lessons
  }

  // ... extracted methods
}
```

**Complexity Reduction**: 26 → <15
**File Impact**:
- `explore.ts`: 879 → ~150-200 lines (thin orchestration)
- New `explore-service.ts`: ~400-500 lines
- ✅ Both files manageable (explore-service may need future splitting if >500)

---

**Implementation Order**:

1. **File 1: feature-spec-loader.ts** (least risky, smallest change)
   - Extract private methods for parsing and validation
   - Run full test suite
   - Verify complexity <15 with ESLint

2. **File 2: detection.ts** (medium complexity, new classes)
   - Create FrameworkDetector and DatabaseDetector classes
   - Update ProjectDetector with constructor injection
   - Run full test suite
   - Verify complexity <15, file lengths <300

3. **File 3: pm-hooks.ts** (medium complexity)
   - Create CommentGeneratorService class
   - Update PMHooks with constructor injection
   - Run full test suite
   - Verify complexity <15

4. **File 4: explore.ts** (highest risk, largest file)
   - Create ExploreService class
   - Refactor ExploreCommand to thin orchestration
   - Run full test suite
   - Verify complexity <15, file lengths manageable
   - Manual smoke test of `/explore` command

**Pros**:
- ✅ Achieves both complexity reduction AND file length compliance
- ✅ Follows proven Phase 1 patterns (service extraction + constructor injection)
- ✅ Right-sized solutions per file (no over-engineering)
- ✅ Incremental validation (full test suite after each file)
- ✅ Maintains testability through constructor injection
- ✅ Reduces technical debt significantly

**Cons**:
- ❌ More invasive than simple private methods
- ❌ Longer implementation time (3 days vs 1-2 days)
- ❌ Risk of breaking functionality (mitigated by comprehensive testing)
- ❌ pm-hooks.ts may still be slightly over limit after extraction

**When to use**: When files are severely over the 300-line limit and simple extraction won't achieve compliance. When you want proper architectural boundaries that will benefit long-term maintainability.

---

### Approach 2: Minimal Private Method Extraction

**Description**: Extract only the minimum private methods needed to reduce complexity below 15, without creating new service classes or splitting files.

**feature-spec-loader.ts**:
```typescript
// Extract 1-2 private methods
private parseYamlOrJson(content: string): unknown { /* ... */ }
private validateParsedSpec(spec: unknown): FeatureSpec { /* ... */ }
```

**detection.ts**:
```typescript
// Extract helper methods within ProjectDetector
private checkFrameworkInPackageJson(): string[] { /* ... */ }
private checkDatabaseInDependencies(): string[] { /* ... */ }
```

**pm-hooks.ts**:
```typescript
// Extract verbosity branches to private methods
private generateMinimalComment(context: ShipContext): string { /* ... */ }
private generateVerboseComment(context: ShipContext): string { /* ... */ }
```

**explore.ts**:
```typescript
// Extract 2-3 helper methods
private resolveFeatureFromArgs(feature?: string): Promise<string> { /* ... */ }
private createStructureAndTemplates(feature: string): Promise<void> { /* ... */ }
```

**Pros**:
- ✅ Faster implementation (1-2 days)
- ✅ Minimal code changes
- ✅ Lower risk of breaking functionality

**Cons**:
- ❌ **CRITICAL**: Leaves 3 files severely over 300-line limit (573, 616, 879 lines)
- ❌ Violates file length standards
- ❌ Doesn't address architectural issues
- ❌ Technical debt remains
- ❌ May need re-refactoring in Phase 3

**When to use**: Only if time pressure is extreme and you accept deferring file length violations to a future phase.

---

### Approach 3: Hybrid - Services for Large Files, Private Methods for Small

**Description**: Extract services only for files over 300 lines (detection.ts, pm-hooks.ts, explore.ts), use private methods for feature-spec-loader.ts.

This is essentially **Approach 1** but framed differently - same implementation, same results.

**Pros/Cons**: Identical to Approach 1

**When to use**: When you want to emphasize the pragmatic "only extract when needed" philosophy.

---

## Recommendation

**Use Approach 1: Balanced Service Extraction with File Splitting**

**Rationale**:
1. **Standards Compliance**: Only approach that achieves file length compliance (<300 lines)
2. **Follows Phase 1 Pattern**: Proven success with service extraction + constructor injection
3. **Right-Sized Solutions**: Each file gets appropriate treatment (services for large, private methods for small)
4. **Reduces Technical Debt**: Addresses both complexity AND file length issues
5. **Long-Term Value**: Proper architectural boundaries improve maintainability
6. **Testability**: Constructor injection enables comprehensive testing

**Trade-offs Accepted**:
- Takes 3 days instead of 1-2 days (minimal extraction)
- More invasive changes (mitigated by full test suite validation)
- pm-hooks.ts may remain slightly over limit (acceptable, can address in Phase 3)

**Why Not Minimal Extraction**: Would leave 3 files at 573, 616, 879 lines - violating standards and deferring technical debt to Phase 3. Not aligned with "ship incrementally with quality" philosophy.

## Test Intentions

### TI-1: Detection Equivalence
**What**: After splitting `ProjectDetector`, framework and database detection must produce identical results
**Verify**:
- Run existing detection tests
- Compare detected frameworks/databases before/after refactoring
- Verify no regressions in detection accuracy

### TI-2: PM Comment Generation Preservation
**What**: After extracting `CommentGeneratorService`, PM comments must be identical across all verbosity levels
**Verify**:
- Run existing PM hooks tests
- Verify comment content unchanged for minimal/normal/verbose modes
- Test verbosity switching behavior

### TI-3: Explore Workflow Integrity
**What**: After extracting `ExploreService`, the complete exploration workflow must work identically
**Verify**:
- Run existing explore.ts integration tests
- Manual smoke test: `/explore TEST-FEATURE`
- Verify exploration.md created, PM issue linked, templates generated

### TI-4: Spec Loader Parsing Accuracy
**What**: After extracting validation/parsing methods, YAML/JSON spec loading must work identically
**Verify**:
- Run existing feature-spec-loader tests
- Test YAML spec parsing
- Test JSON spec parsing
- Verify error handling for invalid specs

### TI-5: Complexity Verification
**What**: All 5 target functions must achieve complexity <15
**Verify**:
- Run `npm run lint` after each file refactoring
- Confirm no cognitive-complexity ESLint errors for refactored functions
- Document complexity scores in build plan

### TI-6: File Length Compliance
**What**: No files should exceed 300-line limit after refactoring
**Verify**:
- Check line counts with `wc -l` after each refactoring
- Confirm all files ≤300 lines (or ≤550 for pm-hooks.ts acceptable)
- Document file sizes in build plan

### TI-7: Constructor Injection Testability
**What**: Extracted services must be testable via constructor injection
**Verify**:
- Create tests injecting mock FrameworkDetector into ProjectDetector
- Create tests injecting mock DatabaseDetector into ProjectDetector
- Create tests injecting mock CommentGeneratorService into PMHooks
- Create tests injecting mock ExploreService into ExploreCommand
- Verify mocks called correctly

### TI-8: Regression Prevention
**What**: Full test suite must pass after each file refactoring
**Verify**:
- Run `npm test` after feature-spec-loader.ts refactoring (all pass)
- Run `npm test` after detection.ts refactoring (all pass)
- Run `npm test` after pm-hooks.ts refactoring (all pass)
- Run `npm test` after explore.ts refactoring (all pass)
- All 1300+ tests remain passing

### TI-9: Service Isolation
**What**: Extracted services must work independently
**Verify**:
- Unit test FrameworkDetector in isolation
- Unit test DatabaseDetector in isolation
- Unit test CommentGeneratorService in isolation
- Unit test ExploreService methods in isolation

## Decisions Decided During Exploration

1. ✓ **Scope**: All 5 functions in one feature (not split into sub-features)

2. ✓ **Pattern**: Continue comprehensive service extraction with constructor injection from Phase 1

3. ✓ **Priority**: Equal priority across all 5 functions

4. ✓ **Strategy**: File-size based approach - extract services to avoid length violations, private methods for small files

5. ✓ **detection.ts Organization**: Extract FrameworkDetector and DatabaseDetector classes (~250L main + 2x150L new)

6. ✓ **pm-hooks.ts Organization**: Extract CommentGeneratorService (~550L + 100L new)

7. ✓ **explore.ts Organization**: Extract ExploreService using Phase 1 pattern (~180L + 450L new)

8. ✓ **feature-spec-loader.ts Organization**: Private method extraction only (~220L, stays under limit)

9. ✓ **Implementation Order**: feature-spec-loader.ts → detection.ts → pm-hooks.ts → explore.ts (simple to complex)

## No Decisions Needed

All implementation decisions were resolved during conversational exploration. The approach is fully defined and ready for building.

## Related Context

- **Parent Epic**: HODGE-357 (Complete Remaining ESLint Errors from HODGE-356)
- **Sibling Feature**: HODGE-357.1 (Phase 1 - Critical Complexity Reduction) - shipped
- **Parent Decisions**: Hybrid Phased + Service Extraction approach, ship incrementally
- **Patterns**: `.hodge/patterns/constructor-injection-for-testing.md`
- **Patterns**: `.hodge/patterns/test-pattern.md` (behavior-focused testing)
- **Standards**: `.hodge/standards.md` (file/function length limits, progressive enforcement)

## Next Steps

Since all decisions are made during exploration:

1. **Start Building**: Run `/build HODGE-357.2` to begin implementation
2. **Follow Implementation Order**:
   - Day 1: feature-spec-loader.ts (morning), detection.ts (afternoon)
   - Day 2: pm-hooks.ts (full day)
   - Day 3: explore.ts (full day - largest/most complex)
3. **Validation Checklist**: Run full test suite after each file, verify complexity <15 and file lengths compliant
