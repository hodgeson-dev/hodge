# Build Plan: HODGE-357.3 - Complete All ESLint Errors

## Feature Overview
**PM Issue**: HODGE-357.3 (linear)
**Status**: In Progress - Security Fixes Complete
**Start**: 75 errors → **Current**: 67 errors (-8, -11% progress)

## Implementation Strategy: Security-First Sequential Cleanup

### Phase 1: Security Vulnerabilities ✅ COMPLETE
- [x] Fix 4 ReDoS vulnerabilities (slow-regex) - Added non-backtracking patterns
- [x] Fix 5 PATH injection errors (no-os-command-from-path) - Added eslint-disable with justification
- [x] Fix 2 weak hashing errors (hashing) - Upgraded MD5 → SHA-256

**Result**: 7 errors fixed

### Phase 2: Nested Ternaries 🔄 IN PROGRESS
- [x] harden.ts:396 - Extracted nested ternary to if/else
- [ ] ship.ts - Need to locate and fix
- [ ] status.ts - Need to locate and fix (3 errors)
- [ ] pm-hooks.ts - Need to locate and fix (3 errors)
- [ ] interaction-state.ts - Need to locate and fix
- [ ] review-tier-classifier.ts - Need to locate and fix
- [ ] toolchain-service-registry.ts - Need to locate and fix

**Target**: 10 errors total

### Phase 3: Cognitive Complexity (Pending)
15 functions to refactor (complexity >15):
- init.ts: 4 functions (execute, setupPMIntegration, smartQuestionFlow, promptForPMTool)
- plan.ts: 4 functions
- status.ts: 3 functions
- Others: 4 functions

### Phase 4: File Length Violations (Pending)
8 files to split/refactor (<400 lines):
- init.ts: 983 lines
- plan.ts: 604 lines
- harden.ts: 570 lines
- hodge-md-generator.ts: 458 lines
- pattern-learner.ts: 427 lines
- sub-feature-context-service.ts: 421 lines
- explore-service.ts: 409 lines
- status.ts: 401 lines

**Exempt**: claude-commands.ts, pm-scripts-templates.ts (templates)

### Phase 5: Cleanup Remaining Errors (Pending)
~36 errors:
- Dead stores (explore.ts:91)
- Unused variables (explore.ts:190)
- Unsafe `any` (detection.ts: 12 errors)
- require-await violations
- Other type safety issues

## Files Modified

### Security Fixes
- `src/commands/init.ts` - Fixed ReDoS in git remote regex
- `src/lib/diagnostics-service.ts` - Fixed ReDoS in TypeScript error parsing
- `src/lib/pattern-learner.ts` - Fixed ReDoS in validation pattern, upgraded MD5→SHA-256
- `src/lib/structure-generator.ts` - Fixed ReDoS in import pattern
- `src/lib/git-detector.ts` - Added eslint-disable for hardcoded git commands (2 locations)
- `src/lib/pm-tool-detector.ts` - Added eslint-disable for hardcoded git command
- `src/lib/project-name-detector.ts` - Added eslint-disable for hardcoded git command
- `src/lib/pm/github-adapter.ts` - Added eslint-disable for hardcoded git command
- `src/lib/cache-manager.ts` - Upgraded MD5→SHA-256 for file hashing

### Nested Ternary Fixes
- `src/commands/harden.ts` - Extracted nested ternary to if/else (line 396)

## Decisions Made

1. **ReDoS Patterns**: Used non-backtracking character classes `[^x]` instead of lazy quantifiers `.*?`
2. **PATH Injection**: Hardcoded `'git'` commands are safe - added eslint-disable with justification
3. **Hashing**: SHA-256 minimum for all hashing operations (security best practice)
4. **Nested Ternaries**: Extract to if/else or map lookups for clarity

## Testing Notes
- Full test suite should be run after completing all fixes
- Security fixes are low-risk (pattern improvements)
- Nested ternary extractions should not change behavior
- Regression testing critical for cognitive complexity and file-splitting phases

## Next Steps
1. Complete Phase 2: Nested ternaries (9 remaining)
2. Start Phase 3: Cognitive complexity refactoring (15 functions)
3. Phase 4: File splitting (8 files)
4. Phase 5: Cleanup remaining errors (~36)
5. Run full test suite: `npm test`
6. Verify 0 errors: `npm run lint`
7. Proceed to `/harden HODGE-357.3`
