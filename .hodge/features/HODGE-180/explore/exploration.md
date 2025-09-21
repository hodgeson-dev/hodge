# Exploration: HODGE-180 - Test Isolation Review

## Feature Analysis
**Type**: Test Infrastructure Improvement
**Keywords**: test isolation, .hodge directory, temporary directories, test cleanup
**Related Commands**: test, lint, typecheck, quality
**PM Issue**: HODGE-180

## Context
- **Date**: 9/21/2025
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (loaded)
- **Problem**: Tests may be modifying the actual project's .hodge directory

## Current Issues Found

### Critical Issues
1. **session-manager.test.ts** (Lines 107, 127):
   - Writes directly to `.hodge` instead of `testDir/.hodge`
   - Could corrupt actual project session data

2. **Multiple tests using process.cwd()**:
   - `session-manager.test.ts`: `.test-session` in project root
   - `auto-save.test.ts`: `.test-hodge` in project root
   - `context-aware-commands.test.ts`: `.test-workflow` in project root
   - `context-manager.test.ts`: `.test-context` in project root

### Design Issues
1. **Smoke tests reading actual project files**:
   - `documentation-hierarchy.smoke.test.ts`
   - `standards-enforcement.smoke.test.ts`
   - These should either use fixtures or be clearly marked as project-dependent

## Recommended Approaches

### Approach 1: Surgical Fix (Recommended)
**Description**: Fix only the actual bugs while preserving test design intent

**Implementation**:
```typescript
// Fix session-manager.test.ts lines 107 & 127
await fs.mkdir(path.join(testDir, '.hodge'), { recursive: true });

// Update test directories to use tmpdir()
const testDir = path.join(os.tmpdir(), `hodge-test-${Date.now()}-${randomBytes(4).toString('hex')}`);
```

**Pros**:
- Minimal changes, low risk
- Preserves existing test structure
- Quick to implement and verify
- Fixes actual corruption issues

**Cons**:
- Doesn't address broader design patterns
- Smoke tests still read actual files

### Approach 2: Test Isolation Framework
**Description**: Create a comprehensive test isolation utility

**Implementation**:
```typescript
// src/test/isolation.ts
export class TestWorkspace {
  private dir: string;

  async setup() {
    this.dir = await mkdtemp(path.join(os.tmpdir(), 'hodge-test-'));
    await this.initializeHodgeStructure();
  }

  async cleanup() {
    await rm(this.dir, { recursive: true, force: true });
  }
}
```

**Pros**:
- Consistent isolation pattern
- Reusable across all tests
- Prevents future issues
- Better test parallelization

**Cons**:
- Requires refactoring many tests
- More complex initial implementation
- May break existing test assumptions

### Approach 3: Hybrid Progressive Enhancement
**Description**: Fix critical issues now, add framework gradually

**Implementation Steps**:
1. **Phase 1**: Fix direct `.hodge` writes (critical bugs)
2. **Phase 2**: Convert process.cwd() tests to tmpdir()
3. **Phase 3**: Add TestWorkspace utility for new tests
4. **Phase 4**: Gradually migrate existing tests

**Pros**:
- Immediate critical fixes
- Progressive improvement
- Backwards compatible
- Team can adopt gradually

**Cons**:
- Temporary inconsistency
- Requires tracking migration progress

## Recommendation
**Approach 3: Hybrid Progressive Enhancement** is recommended because:
- Fixes critical data corruption issues immediately
- Allows gradual migration without disrupting development
- Provides a clear path forward
- Balances risk vs. reward

## Test Cleanup Patterns

### Pattern 1: Always Use Temp Directories
```typescript
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

const testDir = path.join(
  tmpdir(),
  `hodge-test-${Date.now()}-${randomBytes(4).toString('hex')}`
);
```

### Pattern 2: Proper Cleanup in afterEach
```typescript
afterEach(async () => {
  try {
    await rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Log but don't fail - directory might not exist
    console.warn('Test cleanup warning:', error);
  }
});
```

### Pattern 3: Test-Generated Content Markers
```typescript
// Mark test-generated content for safe cleanup
const TEST_MARKER = '.test-generated';
await writeFile(path.join(saveDir, TEST_MARKER), '');
```

## Implementation Hints
- Start with critical session-manager.test.ts fixes
- Add tmpdir() utility to test/helpers.ts
- Update contributing guide with test isolation requirements
- Consider pre-commit hook to check for process.cwd() in tests

## Next Steps
- [ ] Review the recommended approaches
- [ ] Consider similar features for inspiration
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-180`

---
*Generated with AI-enhanced exploration (2025-09-21T14:27:14.054Z)*
