# Exploration: File Splitting - Module Reorganization with Strategic Exemptions

## Feature Overview
**PM Issue**: HODGE-357.6
**Type**: Sub-feature of HODGE-357 (ESLint Error Cleanup)
**Created**: 2025-10-27T15:54:02.278Z

## Problem Statement

10 files exceed the 400-line standard (ranging from 401 to 3062 lines), creating maintainability and code quality issues. However, upon analysis, 2 are template files containing auto-generated or embedded content that should be exempt from the line limit. This leaves 8 real code files requiring attention, with violations ranging from barely over (401 lines = 1.002x) to severely over (1082 lines = 2.7x).

The 400-line standard exists for good reasons:
- **Cognitive load**: Files over 400 lines become harder to understand and navigate
- **Testability**: Large files often indicate too many responsibilities
- **Maintainability**: Changes to large files have higher risk of unintended side effects

However, not all large files are created equal. Template/generated files and files barely over the threshold deserve different treatment than clear violations.

## Context

### Parent Epic: HODGE-357
The parent feature addresses 407 total ESLint issues through a phased approach. Siblings HODGE-357.1 through HODGE-357.5 have already shipped, tackling:
- Security vulnerabilities (regex backtracking, PATH injection)
- Nested ternaries and code quality quick wins
- Other priority ESLint errors

HODGE-357.6 focuses specifically on **file length violations** as the next phase of the quality improvement effort.

### Current File Length Violations (ESLint Output)

| File | Lines | Ratio | Category |
|------|-------|-------|----------|
| claude-commands.ts | 3062 | 7.6x | **Template (Exempt)** |
| pm-scripts-templates.ts | 1024 | 2.6x | **Template (Exempt)** |
| init.ts | 1082 | 2.7x | **Tier 1: Must Split** |
| plan.ts | 604 | 1.5x | **Tier 1: Must Split** |
| harden.ts | 577 | 1.4x | **Tier 1: Must Split** |
| hodge-md-generator.ts | 458 | 1.1x | **Tier 2: Probably Split** |
| pattern-learner.ts | 427 | 1.07x | **Tier 3: Evaluate** |
| sub-feature-context-service.ts | 421 | 1.05x | **Tier 3: Evaluate** |
| explore-service.ts | 413 | 1.03x | **Tier 3: Evaluate** |
| status.ts | 401 | 1.002x | **Tier 3: Evaluate** |

### Standards Context
From `.hodge/standards.md`:
- Maximum file length: **400 lines** (excluding blank lines and comments)
- Rationale: "Pragmatic balance that accommodates CLI orchestration patterns while still enforcing discipline"
- Progressive enforcement: Warnings in harden phase, blocking in ship phase

## Conversation Summary

### Limit Analysis: Keep 400 or Raise to 450-500?

**Explored raising the limit** to 450-500 to reduce forced splits, but decided to **keep 400** for these reasons:
1. **Already generous**: Industry standards often recommend 200-300 lines
2. **Standards explicitly chose 400**: Documented as "pragmatic balance"
3. **The violations tell a story**: Files at 2.7x over clearly need splitting; files at 1.002x over might not
4. **Better solution exists**: Strategic exemptions and tiered approach handles edge cases without weakening the standard

**Decision**: Keep 400-line standard as meaningful target, apply intelligently with exemptions.

### Template Files: Automatic Exemptions

Two files identified as legitimate exemption candidates:

**1. `claude-commands.ts` (3062 lines)**
- Auto-generated from `.claude/commands/*.md`
- Contains embedded template strings for all slash commands
- Header: "Do not edit directly - edit the source files and run: npm run sync:commands"
- Splitting would break code generation pattern

**2. `pm-scripts-templates.ts` (1024 lines)**
- Contains embedded JavaScript templates for PM scripts (Linear, GitHub, Jira)
- Returns arrays of complete script files as strings
- Each template is 200-300 lines but represents a cohesive unit
- Not "code" - it's data/configuration stored as TypeScript strings

**Implementation**: Add ESLint override rules to exempt both files from `max-lines` check.

### Tiered Priority Approach

**Tier 1: Must Split (1.4x-2.7x over)** - Clear violations
- Files significantly over the limit require splitting
- Natural boundaries likely exist at this scale
- Highest impact on code quality

**Tier 2: Probably Split (1.1x-1.3x over)** - Moderate violations
- Likely have extractable concerns
- Evaluate for natural split points

**Tier 3: Evaluate Case-by-Case (1.0x-1.1x over)** - Borderline
- May be legitimately cohesive
- Don't force splits that harm comprehension
- Exempt if cohesive, split if clear boundaries exist

### Starting Priority: init.ts

**Why init.ts first:**
- Biggest violator (1082 lines = 2.7x over)
- High value target (core initialization command)
- Natural split boundaries likely exist:
  - Detection logic (PM tools, frameworks, toolchains)
  - Generator logic (create config files, directories)
  - Validator logic (check project state, prerequisites)
  - Orchestrator logic (coordinate the flow)
- Once split, establishes pattern for other commands

### Testing Strategy

**Run full test suite after each file split** (not batch splits) to ensure:
- No regressions in functionality
- Import paths update correctly
- TypeScript compilation succeeds
- All 1300+ tests still pass

This aligns with Hodge's progressive testing philosophy - test behavior, not implementation.

## Implementation Approaches

### Approach 1: Tiered Progressive Splitting with Template Exemptions (Recommended)

**Philosophy**: Quick wins first, then tackle by severity, preserve cohesion for borderline cases.

**Phase 1: Template Exemptions (5 minutes)**
```typescript
// Add to .eslintrc.json
{
  "overrides": [
    {
      "files": [
        "src/lib/claude-commands.ts",
        "src/lib/pm-scripts-templates.ts"
      ],
      "rules": {
        "max-lines": "off"
      }
    }
  ]
}
```

**Immediate impact**: 10 violations → 8 violations

**Phase 2: Tier 1 Splits - Severe Violators (Priority Order)**

**2a. Split init.ts (1082 → ~300 each)**
```
src/commands/init.ts →
  src/commands/init/
    ├── init-detector.ts      (~300 lines - detect PM tools, frameworks, toolchains)
    ├── init-generator.ts     (~300 lines - generate configs, directories)
    ├── init-validator.ts     (~250 lines - validate prerequisites, project state)
    └── init-orchestrator.ts  (<300 lines - main command logic)
```

**2b. Split plan.ts (604 → ~350 each)**
```
src/commands/plan.ts →
  src/commands/plan/
    ├── plan-parser.ts        (~250 lines - parse feature descriptions)
    ├── plan-generator.ts     (~200 lines - generate sub-features)
    └── plan-orchestrator.ts  (~200 lines - main command logic)
```

**2c. Split harden.ts (577 → ~350 each)**
```
src/commands/harden.ts →
  src/commands/harden/
    ├── harden-validator.ts      (~250 lines - validate prerequisites)
    ├── harden-quality-gates.ts  (~200 lines - run quality checks)
    └── harden-orchestrator.ts   (~200 lines - main command logic)
```

**Testing after Phase 2**: Full test suite must pass after each split

**Phase 3: Tier 2 Evaluation - Moderate Violators**

**3a. Analyze hodge-md-generator.ts (458 lines)**
- Likely has extractable formatting helpers
- Evaluate for natural boundaries
- Split if clear separation exists

**Phase 4: Tier 3 Evaluation - Borderline Cases**

For each file (pattern-learner.ts, sub-feature-context-service.ts, explore-service.ts, status.ts):
1. **Read the file** to understand its cohesion
2. **Identify natural boundaries** (or lack thereof)
3. **Decision**:
   - If cohesive single responsibility → Exempt via ESLint override
   - If clear split points exist → Split
   - Special case for status.ts (only 1 line over) → Strong candidate for exemption

**Pros**:
- ✅ Quick win with template exemptions (psychological momentum)
- ✅ Focuses effort where it matters most (severe violations first)
- ✅ Preserves cohesion for borderline cases
- ✅ Maintains 400 as meaningful standard
- ✅ Run tests after each split (catches regressions early)
- ✅ Can pause/resume between phases

**Cons**:
- ❌ Multiple phases may feel like slow progress
- ❌ Requires judgment calls for Tier 3 files

**Estimated Effort**: 1.5 days total
- Phase 1: 5 minutes (template exemptions)
- Phase 2: 1 day (3 major splits with testing)
- Phase 3: 2-3 hours (1 file evaluation)
- Phase 4: 2-3 hours (4 file evaluations, potential splits)

---

### Approach 2: Uniform Splitting (No Exemptions)

**Philosophy**: Apply 400-line limit uniformly, split all 10 files without exceptions.

**Implementation**:
- Split template files into separate module exports (claude-commands.ts → 8 files, one per command)
- Split all 8 code files regardless of how close to the limit
- status.ts (401 lines) gets split even though only 1 line over

**Pros**:
- ✅ Simpler rule: "400 lines means 400 lines, no exceptions"
- ✅ No judgment calls needed
- ✅ Consistent enforcement

**Cons**:
- ❌ Forces splits that may harm comprehension (status.ts at 401 lines)
- ❌ Splits template files break code generation patterns
- ❌ More work for potentially less value
- ❌ Arbitrary splits may create new problems (artificial module boundaries)

**Estimated Effort**: 2-3 days

---

### Approach 3: Raise Limit to 450-500

**Philosophy**: Change the standard to accommodate current code patterns.

**Implementation**:
- Update `.eslintrc.json` to set `max-lines` to 450 or 500
- Update `.hodge/standards.md` to reflect new limit
- Only split files that exceed the new threshold

**Files requiring splits at 500-line limit**:
- claude-commands.ts (3062)
- pm-scripts-templates.ts (1024)
- init.ts (1082)
- plan.ts (604)
- harden.ts (577)

**Pros**:
- ✅ Reduces forced splits for borderline cases
- ✅ Faster implementation
- ✅ Less risk of breaking cohesion

**Cons**:
- ❌ Weakens the standard ("we don't follow our own rules")
- ❌ Slippery slope (why not 600? 800?)
- ❌ Doesn't address files that are genuinely too large (init.ts at 1082)
- ❌ Standards document explicitly chose 400 as "pragmatic balance"
- ❌ Files at 500+ lines still have cognitive load issues

**Estimated Effort**: 1.5-2 days

---

## Recommendation: Approach 1 (Tiered Progressive Splitting)

**Why this is best:**

1. **Respects the standard**: Keeps 400 as meaningful target while acknowledging legitimate exceptions
2. **Focus on value**: Spends effort where it matters (severe violations) vs bikeshedding (1-line violations)
3. **Pragmatic**: Template exemptions are obvious, borderline cases get evaluation
4. **Low risk**: Test after each split catches issues early
5. **Shippable incrementally**: Can ship after Phase 2 if needed, continue later
6. **Establishes pattern**: init.ts split creates blueprint for plan.ts and harden.ts

**Pattern for future work**: This approach creates a repeatable pattern:
- Auto-generated/template files → Automatic exemption
- Files 1.5x+ over → Must split
- Files barely over → Evaluate for cohesion

## Test Intentions

### TI-1: Template Exemption Behavior
**Given** ESLint configuration with template file exemptions
**When** running `npm run lint`
**Then** `claude-commands.ts` and `pm-scripts-templates.ts` should not report max-lines violations

### TI-2: Functionality Preservation After Splits
**Given** a file has been split into multiple modules
**When** running the full test suite (`npm test`)
**Then** all 1300+ tests should pass with no new failures

### TI-3: Import Path Correctness
**Given** files have been reorganized into subdirectories
**When** TypeScript compilation runs (`npm run typecheck`)
**Then** all imports should resolve correctly with no compilation errors

### TI-4: Module Cohesion Validation
**Given** a file has been split
**When** reviewing the resulting modules
**Then** each module should represent a focused, cohesive responsibility (not arbitrary splits)

### TI-5: ESLint Violation Reduction
**Given** all phases complete
**When** running `npm run lint`
**Then** max-lines violations should reduce from 10 to 0-3 (severe violations eliminated, legitimate exemptions documented)

## Decisions Decided During Exploration

1. ✓ **Keep 400-line standard**: Maintain 400 as meaningful target (not raise to 450-500) while allowing strategic exemptions
2. ✓ **Exempt template files**: Add ESLint overrides for `claude-commands.ts` and `pm-scripts-templates.ts`
3. ✓ **Use tiered approach**: Must split (500+), probably split (450-500), evaluate case-by-case (400-450)
4. ✓ **Priority order**: Start with init.ts (highest priority: 1082 lines, 2.7x over, natural split boundaries)
5. ✓ **Testing strategy**: Run full test suite after each file split (not batch splits) to catch regressions early

## No Decisions Needed

All key decisions were resolved during exploration. Ready to proceed to build phase.

## Next Steps

1. ✅ Exploration complete - proceed to `/build HODGE-357.6`
2. Start with Phase 1 (template exemptions) for quick win
3. Continue with Phase 2 (split init.ts, plan.ts, harden.ts)
4. Evaluate Phase 3 and 4 files based on findings

---
*Exploration completed: 2025-10-27*
*Ready for build phase*
