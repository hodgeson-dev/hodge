# Date.now() Migration Plan

**Context**: HODGE-341.5 - Fixed persistent timeout issues caused by `Date.now()` race conditions in parallel test execution

**Status**: 19 remaining instances (down from 50+)

## Problem Summary

Using `Date.now()` for temporary directory naming causes race conditions when tests run in parallel (Vitest):
- Multiple tests execute simultaneously
- Tests create directories with identical timestamps
- Race conditions cause ENOENT errors and test timeouts
- Hard to debug, appears intermittent

## Solution: TempDirectoryFixture

The `TempDirectoryFixture` pattern provides:
- **UUID-based naming**: Guarantees uniqueness across parallel execution
- **Automatic cleanup**: Handles teardown with retry logic
- **Verification**: Checks operations succeeded before proceeding
- **Consistency**: Standardized pattern across all tests

## Migration Strategy

### ✅ Completed (20 instances)
1. `src/lib/toolchain-service.smoke.test.ts` - 8 tests
2. `test/pm-integration.integration.test.ts` - 6 tests
3. `test/pm-integration.smoke.test.ts` - 6 tests

### 🔄 Remaining (19 instances)

**ESLint Rule**: `local-rules/no-date-now-in-tests` now enforced (error level)
- Automatically catches new violations
- Shows helpful message with TempDirectoryFixture guidance
- Prevents regression

**Migration Approach**: Boy Scout Rule (incremental cleanup)
- When working on a feature, fix nearby `Date.now()` instances
- Not blocking - migrate opportunistically over time
- ESLint ensures no new instances added

## How to Migrate

### Before (Anti-Pattern ❌)
```typescript
import { tmpdir } from 'os';
import fs from 'fs/promises';

let testDir: string;

beforeEach(async () => {
  testDir = path.join(tmpdir(), `hodge-test-${Date.now()}`);  // ❌ Race condition!
  await fs.mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
});
```

### After (Correct Pattern ✅)
```typescript
import { TempDirectoryFixture } from '../src/test/temp-directory-fixture';

let fixture: TempDirectoryFixture;

beforeEach(async () => {
  fixture = new TempDirectoryFixture();
  await fixture.setup();  // ✅ UUID-based, verified
});

afterEach(async () => {
  await fixture.cleanup();  // ✅ Retry logic, verified
});
```

### Using Fixture Helper Methods
```typescript
// Instead of:
await fs.writeFile(path.join(testDir, '.hodge/config.yaml'), content);

// Use:
await fixture.writeFile('.hodge/config.yaml', content);  // Auto-creates parent dirs
```

## Remaining Instances by File

Run this to see current violations:
```bash
npx eslint 'src/**/*.test.ts' 'test/**/*.ts' --no-ignore 2>&1 | grep "no-date-now-in-tests"
```

### Key Files to Migrate
- `src/lib/id-manager.test.ts` - 2 instances
- `src/lib/logger.smoke.test.ts` - 1 instance
- `src/commands/review.smoke.test.ts` - 4 instances
- `src/commands/plan.test.ts` - 2 instances
- `src/lib/claude-commands.smoke.test.ts` - 3 instances
- Plus ~7 more files with 1-2 instances each

## Timeline

**Phase 1 (✅ Complete)**: Fix blocking test failures (5 tests)
**Phase 2 (✅ Complete)**: Add ESLint rule to prevent regression
**Phase 3 (🔄 Ongoing)**: Opportunistic cleanup via Boy Scout Rule

## Benefits Achieved

1. **✅ All tests passing**: 1002/1002 (was 997/1002)
2. **✅ Prevention in place**: ESLint catches new violations
3. **✅ Pattern documented**: Clear migration guide
4. **✅ Standard elevated**: TempDirectoryFixture now required (see `.hodge/standards.md`)

## References

- **Pattern**: `.hodge/patterns/temp-directory-fixture-pattern.md`
- **Standard**: `.hodge/standards.md` (line 323)
- **Implementation**: `src/test/temp-directory-fixture.ts`
- **ESLint Rule**: `eslint-local-rules.cjs`
- **Lesson Learned**: `.hodge/lessons/HODGE-341.5-test-infrastructure-fix.md`

---
_Created: 2025-10-13_
_Context: HODGE-341.5 test infrastructure improvements_
