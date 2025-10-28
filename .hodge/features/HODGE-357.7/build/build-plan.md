# Build Plan: HODGE-357.7 - Final ESLint Cleanup

## Feature Overview
**PM Issue**: HODGE-357.7 (linear)
**Status**: In Progress
**Approach**: Batched Incremental Fixes with Auto-Fix Acceleration
**Estimated Time**: 8.5-10.5 hours

## Current Status (2025-10-27)

**Baseline Metrics**:
- ESLint Errors: 48
- ESLint Warnings: 282
- Total Issues: 330

**Discovery**: ESLint auto-fix (`--fix`) does NOT fix `prefer-nullish-coalescing` warnings. All 123 nullish coalescing changes must be done manually.

## Implementation Plan

### Batch 1: Code Cleanup - Low Risk (2-3 hours)
**Status**: ⏳ Not Started
**Target**: Fix 28 items (8 errors + 20 warnings)

#### Tasks:
1. **Unused Imports** (3 errors) - EASY
   - [ ] File unknown, line 8:31 - Remove 'LightSession'
   - [ ] File unknown, line 6:10 - Remove 'LinearAdapter'
   - [ ] File unknown, line 7:10 - Remove 'GitHubAdapter'

2. **Unnecessary Escapes** (3 errors) - EASY
   - [ ] File unknown, line 138:19,21,23 - Remove backtick escapes

3. **Single Char in Character Class** (2 errors) - EASY
   - [ ] File unknown, line 50:19 - Simplify character class
   - [ ] File unknown, line 63:17 - Simplify character class

4. **TODO Comments** (20 warnings) - MEDIUM
   - [ ] Review each TODO and either:
     - Address the task
     - Remove if no longer relevant
     - Document why it's deferred

**Verification**:
```bash
npm run lint | grep -E "(unused-import|no-useless-escape|single-char-in-character-classes|todo-tag)"
# Should show 0 results for errors
```

---

### Batch 2: Type Safety - Medium Complexity (4-5 hours)
**Status**: ⏳ Not Started
**Target**: Fix 78 items (13 errors + 65 warnings)

#### Tasks:
1. **Empty Catch Blocks** (10 errors) - MEDIUM
   - [ ] Add proper error handling (logging or re-throw)
   - Pattern: Use `logger.error('Context', { error })` or re-throw with context

2. **Unsafe Member Access** (7 errors + 4 warnings = 11 total) - HARD
   - [ ] Properly type package.json access
   - [ ] Add type guards or assertions

3. **Unsafe Assignments** (2 errors + 9 warnings = 11 total) - HARD
   - [ ] Add proper type annotations
   - [ ] Replace `any` with specific types

4. **Unsafe Arguments** (1 error + 15 warnings = 16 total) - HARD
   - [ ] Add type assertions or proper typing

5. **Unsafe Returns** (6 warnings) - MEDIUM
   - [ ] Add explicit return types
   - [ ] Ensure type safety

6. **Require-Await** (11 warnings) - EASY
   - [ ] Remove `async` keyword if no await
   - [ ] Or add proper await if needed

7. **Nullish Coalescing** (123 warnings) - TEDIOUS
   - [ ] Convert `||` to `??` where appropriate
   - [ ] Review each case for falsy vs nullish behavior
   - ⚠️ **Risk**: `||` treats `0`, `""`, `false` as falsy; `??` only treats `null`/`undefined`

8. **Redundant Type Constituents** (1 error) - EASY
   - [ ] Remove `unknown` from union type

**Verification**:
```bash
npm run lint | grep -E "(no-unsafe|require-await|prefer-nullish-coalescing|redundant-type-constituents)" | grep error
# Should show 0 errors
```

---

### Batch 3: Complex Refactoring - High Risk (3-4 hours)
**Status**: ⏳ Not Started
**Target**: Fix 20 items (all errors)

#### Tasks:
1. **Slow Regex (Security)** (4 errors) - CRITICAL
   - [ ] src/commands/build.ts:548:19 - Rewrite without catastrophic backtracking
   - [ ] src/lib/detection.ts:168:24 - Rewrite pattern
   - [ ] src/lib/profile-composition-service.ts:151:9 - Rewrite pattern
   - [ ] src/lib/toolchain-generator.ts:56:18 - Rewrite pattern
   - **Pattern**: Avoid nested quantifiers like `(.*?)*` or `(.+)+`
   - **Test**: Validate parsing still works correctly

2. **File Permissions (Security)** (2 errors) - CRITICAL
   - [ ] src/commands/init.ts:448:34 - Review chmod permissions
   - [ ] src/commands/init.ts:532:32 - Review chmod permissions
   - **Pattern**: Ensure 0o755 or 0o644 are appropriate

3. **Floating Promises** (1 error) - MEDIUM
   - [ ] src/commands/build.ts:32:5 - Add await or void operator

4. **Parameter Reassignment** (2 errors) - MEDIUM
   - [ ] src/commands/build.ts:99:5 - Create new variable instead
   - [ ] src/commands/build.ts:117:5 - Create new variable instead

5. **Date.now() in Tests** (2 errors) - EASY
   - [ ] src/test/plan.integration.test.ts:167:26 - Use TempDirectoryFixture
   - [ ] src/test/plan.integration.test.ts:86:61 - Use TempDirectoryFixture
   - **Pattern**: See `.hodge/patterns/temp-directory-fixture-pattern.md`

6. **Function Return Type** (3 errors) - HARD
   - [ ] src/lib/pm/pm-hooks.ts:170:35 - Refactor to return consistent type
   - [ ] src/lib/pm/pm-hooks.ts:334:37 - Refactor to return consistent type
   - [ ] src/lib/review-tier-classifier.ts:191:3 - Refactor to return consistent type

7. **Nested Template Literals** (2 errors) - EASY
   - [ ] src/lib/detection.ts:175:55 - Refactor template string
   - [ ] src/lib/detection.ts:178:57 - Refactor template string

8. **Redundant Assignments** (1 error) - EASY
   - [ ] src/commands/build.ts:68:17 - Remove redundant assignment

9. **Anchor Precedence** (1 error) - EASY
   - [ ] src/lib/profile-composition-service.ts:350:19 - Add grouping parens

10. **Deprecation** (1 error) - MEDIUM
    - [ ] src/commands/init.ts:203:18 - Replace deprecated function

**Verification**:
```bash
npm run lint | grep error
# Should show 0 errors (all blocking issues resolved)
```

---

## Final Verification

After all batches complete:

```bash
# Run full quality gate
npm run quality

# Expected results:
# - ESLint errors: 0 (from 48)
# - ESLint warnings: ~94-141 (from 282, 66-75% reduction)
# - All tests passing (1325+)
# - TypeScript compilation: 0 errors
# - Build: successful
```

## Files Modified
<!-- Track files as work progresses -->

**Known Files with Errors**:
- `src/commands/build.ts` - Floating promises, parameter reassignment, redundant assignments
- `src/commands/init.ts` - File permissions, deprecation, slow regex
- `src/lib/detection.ts` - Slow regex, nested templates, single char classes
- `src/lib/pm/pm-hooks.ts` - Function return type inconsistency
- `src/lib/profile-composition-service.ts` - Slow regex, anchor precedence
- `src/lib/review-tier-classifier.ts` - Function return type
- `src/lib/toolchain-generator.ts` - Slow regex
- `src/test/plan.integration.test.ts` - Date.now() usage
- Various files - Empty catch blocks, type safety issues, nullish coalescing

## Decisions Made

1. **Auto-fix limitation**: ESLint `--fix` does not support `prefer-nullish-coalescing`. All 123 instances require manual review and changes.

2. **Batch order adjusted**: Starting with Code Cleanup (Batch 1) instead of auto-fix since auto-fix provided minimal benefit.

3. **File path detection needed**: ESLint output doesn't always show full file paths in grep. May need to parse lint output more carefully or use `--format` option.

## Testing Strategy

**After Each Batch**:
```bash
npm test                    # Verify no regressions
npm run lint | tail -20     # Check progress
```

**Final Testing**:
- All existing tests must pass (1325+)
- No new test failures
- Code coverage maintained or improved

## Next Steps

1. **Immediate**: Identify exact file paths for all errors using:
   ```bash
   npm run lint --format=json > lint-output.json
   ```

2. **Batch 1**: Start with unused imports, unnecessary escapes (quickest wins)

3. **Batch 2**: Tackle type safety improvements systematically

4. **Batch 3**: Handle security-critical and complex refactoring last

5. **Ship**: After all quality gates pass, proceed to `/harden HODGE-357.7`

## Risks & Mitigations

**Risk 1: Nullish Coalescing Behavior Changes**
- Mitigation: Review each case carefully, run tests after each file

**Risk 2: Security Regex Rewrites Break Parsing**
- Mitigation: Add specific tests for affected patterns before changing

**Risk 3: Time Overrun**
- Mitigation: Can ship incrementally after each batch if needed

---
*Updated: 2025-10-27*
*Estimated completion: 8.5-10.5 hours of focused work*
