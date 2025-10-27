# Exploration: HODGE-356

## Feature Overview
**Title**: Standardize Quality Checking: Remove Tool-Specific Parsing, Fix CI Failures
**PM Issue**: HODGE-356
**Type**: Architecture Refactoring + Bug Fix
**Created**: 2025-10-26T19:49:02.297Z

## Problem Statement

The CI "Quality Checks" workflow fails with 94 ESLint errors and 319 warnings that pass locally during `/ship`. Root cause investigation reveals a deep architectural issue:

**Commands parse tool output instead of using universal exit codes**, creating:
1. **Maintenance burden** - Every new tool (Ruff, Checkstyle, Clippy) requires new parsing logic
2. **Tool-specific code** - Breaks the toolchain abstraction's purpose (language-agnostic quality checking)
3. **Masked quality issues** - ShipService bypasses toolchain entirely, using hardcoded `npm test`
4. **Inconsistent patterns** - HardenService uses toolchain but converts to legacy `ValidationResults` interface

The 94 ESLint errors never blocked shipping because `/ship` doesn't run linting at all.

## Conversation Summary

### Discovery Process
1. **Initial hypothesis**: CI and local configs are out of sync
   - **Reality**: Both produce identical output (94 errors, 319 warnings)
   - **Actual problem**: Local `/ship` doesn't enforce quality checks

2. **First architectural violation**: ShipService hardcodes `npm test`
   - Bypasses `.hodge/toolchain.yaml` configuration
   - Won't work for Python/Java/other language projects
   - Never runs linting or type checking

3. **Second architectural violation**: HardenService converts toolchain results
   - Uses toolchain correctly: `toolchainService.runQualityChecks('feature')`
   - But converts `RawToolResult[]` → `ValidationResults` (legacy interface)
   - Loses toolchain benefits through unnecessary conversion layer

4. **Critical insight**: Commands shouldn't parse tool output
   - **Problem**: Parsing ESLint output differently from Ruff/Checkstyle = maintenance hell
   - **Solution**: Toolchain already provides universal success flags (exit codes)
   - **Separation**: Commands check pass/fail, AI interprets details

### Key Decisions Made During Exploration

✓ **Use Approach 2 (Deep Integration)** - Refactor properly, not quick fixes
✓ **Zero tool-specific parsing** - Commands only check `result.success` flags
✓ **AI interprets details** - Full tool output written to quality-checks.md for AI analysis
✓ **Exit codes are universal** - Works for ESLint, Ruff, Clippy, Checkstyle automatically
✓ **Fix all 94 errors** - After refactoring, address all linting violations

## Implementation Approaches

### Approach 1: Minimal Refactor (Quick Fix) ❌ Rejected
**What**: Add toolchain calls to ShipService, keep legacy interfaces

**Why Rejected**:
- Doesn't fix the parsing problem
- Still requires tool-specific display logic
- Kicks the can down the road

### Approach 2: Deep Standardization ✅ **CHOSEN**
**What**: Remove all tool-specific parsing, use `RawToolResult[]` directly

**Changes Required**:

1. **Remove legacy interfaces**
   - Delete `ValidationResults` (HardenService)
   - Delete `QualityGateResults` (ShipService)
   - Both services return `RawToolResult[]` from toolchain

2. **Refactor HardenService**
   ```typescript
   // OLD: Converts toolchain results to legacy interface
   async runValidations(): Promise<ValidationResults> {
     const raw = await toolchainService.runQualityChecks('feature');
     return this.convertToolResult(raw); // ❌ Unnecessary conversion
   }

   // NEW: Return raw results directly
   async runValidations(): Promise<RawToolResult[]> {
     return await toolchainService.runQualityChecks('feature', feature);
   }
   ```

3. **Refactor ShipService**
   ```typescript
   // OLD: Hardcoded npm commands
   async runQualityGates(): Promise<QualityGateResults> {
     await execAsync('npm test'); // ❌ Bypasses toolchain
   }

   // NEW: Use toolchain
   async runQualityGates(): Promise<RawToolResult[]> {
     const toolchain = new ToolchainService();
     return await toolchain.runQualityChecks('all');
   }
   ```

4. **Update command display logic (NO PARSING)**
   ```typescript
   // ✅ Generic display using success flags
   for (const result of results) {
     const status = result.success ? '✓' : '✗';
     console.log(`${status} ${result.type}: ${result.tool}`);
   }

   // ✅ Write full output for AI interpretation
   await fs.writeFile('quality-checks.md',
     results.map(r => `## ${r.tool}\n${r.output}`).join('\n')
   );

   // ✅ Block on failures (using universal exit codes)
   const allPassed = results.every(r => r.skipped || r.success);
   if (!allPassed) {
     console.error('Quality checks failed. See quality-checks.md for details.');
     return;
   }
   ```

5. **AI interprets details**
   - Slash commands read `quality-checks.md`
   - AI sees actual error messages: "Cognitive complexity 57 (max 15)"
   - AI suggests fixes: "Extract helper functions to reduce complexity"
   - AI prioritizes: "These errors block shipping, TODOs can wait"

**Benefits**:
- ✅ Zero tool-specific code - Works for ANY language/tool automatically
- ✅ Exit codes are universal - Every tool uses them (0 = pass, non-zero = fail)
- ✅ Future-proof - Adding Ruff/Checkstyle/Clippy requires zero code changes
- ✅ Rich AI context - AI sees full error messages, not sanitized booleans
- ✅ No maintenance - No parsing logic to update when tools change
- ✅ Proper architecture - Toolchain is single source of truth

### Approach 3: Hybrid (Thin Mapping Layer) ❌ Rejected
**What**: Use toolchain internally, keep friendly interfaces externally

**Why Rejected**:
- Still requires maintaining mapping logic
- Doesn't solve the fundamental parsing problem
- Adds complexity without benefits

## Recommendation

**Implement Approach 2 (Deep Standardization)** for these reasons:

1. **Solves root cause** - Eliminates tool-specific parsing entirely
2. **Future-proof** - Adding Python/Java/Rust tools is truly zero-config
3. **Clean architecture** - Commands enforce gates, AI interprets details
4. **Exit codes are universal** - Works across ALL languages/tools
5. **Fix once, fix properly** - Avoids technical debt and future refactoring

## Test Intentions

### Behavioral Expectations

1. **HardenService returns toolchain results directly**
   - `runValidations()` returns `RawToolResult[]` (not `ValidationResults`)
   - No conversion or mapping logic exists
   - Results include all configured quality checks (linting, testing, type_checking, etc.)

2. **ShipService uses toolchain instead of npm commands**
   - `runQualityGates()` calls `ToolchainService.runQualityChecks()`
   - Returns `RawToolResult[]` (not `QualityGateResults`)
   - No hardcoded `npm test` or `execAsync()` calls

3. **Commands block on failures using success flags**
   - `/ship` blocks if any `result.success === false`
   - `/harden` continues but records failures
   - No tool-specific parsing of error messages

4. **Commands display generic status**
   - Shows "✓ linting: eslint" or "✗ testing: vitest"
   - Does NOT parse "15 errors found" from output
   - Dumps full output to quality-checks.md for AI

5. **ship-record.json stores full toolchain results**
   - Contains `RawToolResult[]` array for audit trail
   - No legacy `shipChecks` booleans
   - Supports backward compatibility if needed

6. **All 94 ESLint errors are fixed**
   - After refactoring, fix sonarjs/cognitive-complexity errors
   - Fix sonarjs/prefer-regexp-exec errors
   - Fix other SonarJS violations
   - All fixes verified by CI passing

7. **Works for non-TypeScript projects**
   - Python project with Ruff: blocks on Ruff failures
   - Java project with Checkstyle: blocks on Checkstyle failures
   - No code changes required for new tools

## Decisions Decided During Exploration

1. ✓ Use Approach 2 (Deep Integration) - Refactor properly, not minimal fixes
2. ✓ Zero tool-specific parsing in commands - Only check `result.success` flags
3. ✓ AI interprets tool output details - Commands write full output to quality-checks.md
4. ✓ Fix all 94 errors after refactoring - Don't ship with known violations
5. ✓ Remove legacy interfaces entirely - `ValidationResults` and `QualityGateResults` deleted

## Decisions Needed

**No decisions needed** - All architectural choices finalized during exploration.

## Next Steps
- `/build HODGE-356` - Implement the refactoring with smoke tests
- Fix the 94 ESLint errors systematically
- Verify CI passes with proper quality gates

---
*Exploration completed: 2025-10-26*
*Approach: Deep Standardization (Zero Parsing)*
