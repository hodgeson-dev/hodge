# Test Intentions: HODGE-357.7

This file tracks the behavioral expectations for HODGE-357.7. These are NOT implementation tests - they describe what the feature should accomplish.

## Test Intentions

### TI-1: All ESLint Errors Resolved with Proper Fixes
**Intent**: All 48 ESLint errors are resolved using proper fixes (not suppressions or disable comments)

**Why**: ESLint disable comments hide problems rather than fixing them. Proper fixes improve code quality.

**How to verify**:
- Run `npm run lint` and verify 0 errors
- Search codebase for `eslint-disable` comments added during this feature (should be 0)
- All fixes should address root cause, not suppress warnings

---

### TI-2: High-Priority Warnings Resolved
**Intent**: All 188 high-priority warnings are resolved (nullish coalescing, type safety, TODOs)

**Why**: These warnings indicate type safety issues and technical debt that should be addressed before release.

**How to verify**:
- Run `npm run lint` and verify warning count reduced from 282 to ~94-141
- Verify 123 nullish coalescing warnings resolved (`||` → `??`)
- Verify 45 type safety warnings resolved (unsafe arguments/assignments/returns)
- Verify 20 TODO comments either addressed or removed with rationale

---

### TI-3: Security Vulnerabilities Patched
**Intent**: Security vulnerabilities (slow regex, file permissions) are patched without breaking parsing or file operations

**Why**: Slow regex patterns are denial-of-service vulnerabilities. File permissions must be safe.

**How to verify**:
- Run `npm run lint` and verify 0 `sonarjs/slow-regex` errors
- Run `npm run lint` and verify 0 `sonarjs/file-permissions` errors
- Run existing tests to verify regex parsing still works correctly
- Run existing tests to verify file operations work correctly

---

### TI-4: Existing Tests Continue to Pass
**Intent**: All 1325+ existing tests continue to pass after all fixes

**Why**: Refactoring should not break existing functionality.

**How to verify**:
- Run `npm test` and verify all tests pass
- Run `npm run test:coverage` and verify coverage maintained or improved
- No new test failures introduced by fixes

---

### TI-5: No TypeScript Compilation Errors
**Intent**: No new TypeScript compilation errors introduced during refactoring

**Why**: Type safety improvements should fix issues, not create new ones.

**How to verify**:
- Run `npm run typecheck` and verify 0 errors
- TypeScript strict mode still enabled
- No `@ts-ignore` comments added to suppress errors

---

### TI-6: Nullish Coalescing Auto-Fix Safety
**Intent**: Auto-fixed nullish coalescing changes don't alter runtime behavior (validated by existing test suite)

**Why**: `||` and `??` have different semantics. Changes must not break logic.

**How to verify**:
- Run `npm test` after auto-fix and verify all tests pass
- Review auto-fixed changes for cases involving numbers, booleans, or empty strings
- If tests fail, manually review and fix the specific cases

---

### TI-7: Empty Catch Blocks Have Proper Error Handling
**Intent**: Empty catch blocks have proper error handling (logging via logger or re-throwing with context)

**Why**: Silent failures hide bugs. Errors should be logged or handled appropriately.

**How to verify**:
- Search codebase for empty catch blocks (should be 0 or have rationale comments)
- All catch blocks either log errors or re-throw with context
- Error handling follows logging standards (uses logger, not console)

---

### TI-8: Code Quality Metrics Improved
**Intent**: Code quality metrics show improvement (ESLint warnings reduced from 282 → ~94-141)

**Why**: Demonstrates comprehensive cleanup achieved its goals.

**How to verify**:
- Run `npm run lint` and verify warning count ~94-141 (66-75% reduction)
- Run `npm run lint` and verify 0 errors (100% error reduction)
- Code quality dashboard shows improvement

---

### TI-9: Test Infrastructure Improvements
**Intent**: Date.now() violations in tests are replaced with TempDirectoryFixture pattern (no race conditions)

**Why**: Date.now() causes race conditions in parallel tests. TempDirectoryFixture uses UUIDs for safety.

**How to verify**:
- Run `npm run lint` and verify 0 `local-rules/no-date-now-in-tests` errors
- Search test files for `Date.now()` usage (should be 0 or in non-directory-naming contexts)
- Run tests in parallel multiple times to verify no race conditions

---

### TI-10: All Quality Gates Pass
**Intent**: All quality gates pass: lint (0 errors), typecheck, test, build

**Why**: Production-ready code must pass all automated quality checks.

**How to verify**:
- Run `npm run quality` and verify all checks pass
- Run `npm run lint` and verify 0 errors
- Run `npm run typecheck` and verify 0 errors
- Run `npm test` and verify all tests pass
- Run `npm run build` and verify successful build

---

## Success Metrics

**Must Have** (blocking for ship):
- ✅ 0 ESLint errors (from 48)
- ✅ All 1325+ tests passing
- ✅ No TypeScript compilation errors
- ✅ All quality gates passing (lint, typecheck, test, build)
- ✅ Security vulnerabilities patched

**Should Have** (expected):
- ✅ 188 high-priority warnings resolved
- ✅ Warning count ~94-141 (66-75% reduction)
- ✅ All TODO comments addressed or removed
- ✅ Type safety improved

**Nice to Have**:
- ✅ Test coverage maintained or improved
- ✅ Code complexity metrics improved
- ✅ HODGE-357 epic fully complete

---
*Test intentions defined: 2025-10-27*
*Ready for build phase*
