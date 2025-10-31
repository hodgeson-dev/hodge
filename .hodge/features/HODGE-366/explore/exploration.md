# Exploration: Fix test isolation violations from process.chdir() contaminating project .hodge directory

**Created**: 2025-10-30
**Status**: Exploring

## Problem Statement

Tests are contaminating the project's `.hodge/context.json` file with test data (e.g., "feature": "HODGE-001"). The root cause is multiple test files using `process.chdir()` to change the global working directory, which creates race conditions in parallel test execution and allows nested service calls to write to the real project directory instead of test workspaces.

## Context

**Project Type**: Test infrastructure improvement
**Impact**: Test isolation, data integrity, parallel test safety

## Conversation Summary

During exploration, we discovered a systemic test isolation problem affecting 6 test files:

1. **explore.new-style.test.ts** - Uses `process.chdir(workspace.getPath())` before calling commands
2. **id-manager.test.ts** - Creates IDManager with testDir but doesn't prevent other code from accessing real `.hodge/`
3. **pm-integration.smoke.test.ts** - Uses temp directories but relies on global state that leaks
4. **explore.sub-feature.test.ts** - Found during grep search, same pattern
5. **explore-timing-fix.integration.test.ts** - Found during grep search, same pattern
6. **ship.integration.test.ts** - Found during grep search, same pattern

### The Cascading Dependency Problem

The core issue is nested calls that occur 3-5 layers deep from the test code:

```
Test creates ExploreCommand(workspace)
  → ExploreCommand.execute()
    → ContextManager.updateContext() [writes .hodge/context.json]
      → IDManager.createFeature()
        → IDManager.saveCounter() [writes .hodge/.counter]
          → IDManager.saveMappings() [writes .hodge/id-mappings.json]
            → PMHooks.linkIssue()
              → ContextManager.updateContext() [writes again]
```

At layer 4-5, services don't know they're in a test context. They simply call `process.cwd()` or use relative paths, writing to whatever directory is current.

### Why process.chdir() is Architecturally Broken

1. **Parallel Test Interference**: Vitest runs tests in parallel. If Test A does `chdir(dirA)` while Test B does `chdir(dirB)`, they fight over global state
2. **Async Timing Holes**: `chdir()` → start async operation → restore `chdir()` → async operation completes → **writes to wrong directory**
3. **Impossible to Track**: We can't predict every nested call 5 layers deep
4. **Standards Violation**: Our own standards say "never modify project state" - `process.chdir()` violates this by design

## Implementation Approaches

### Approach 1: Constructor Injection with Cascade Pattern (RECOMMENDED)

**Description**: Add optional `workingDir` parameter to all Command and Service classes, then cascade it through the dependency chain via constructors.

**Implementation Pattern**:
```typescript
// Commands accept workingDir
class ExploreCommand {
  constructor(private workingDir: string = process.cwd()) {}

  async execute(feature: string) {
    // Pass to all services
    const ctx = new ContextManager(this.workingDir);
    const idMgr = new IDManager(this.workingDir);
    const pmHooks = new PMHooks(this.workingDir);
  }
}

// Services accept and use workingDir
class ContextManager {
  constructor(private workingDir: string = process.cwd()) {}

  async updateContext() {
    const contextPath = path.join(this.workingDir, '.hodge/context.json');
    await fs.writeFile(contextPath, data);
  }
}

// Tests pass workspace directory
const command = new ExploreCommand(workspace.getPath());
await command.execute('test-feature');
// ✓ All nested calls write to workspace, not project root
```

**Pros**:
- Explicit propagation ensures isolation through entire call chain
- No global state - each test gets isolated instance graph
- Handles deep nesting automatically through constructor propagation
- Backward compatible via default parameter
- Testable guarantee - can verify project `.hodge/` unchanged

**Cons**:
- Requires modifying ~25-30 classes (10 commands + 15 services)
- Must remember to propagate workingDir to all dependencies
- More verbose constructor signatures

**When to use**: This is the correct long-term solution for test isolation

### Approach 2: File System Mocking

**Description**: Mock `fs` operations in tests to intercept writes and redirect them to test workspaces.

**Pros**:
- Fewer code changes (only test files)
- Services remain unchanged
- Can be applied selectively per test

**Cons**:
- Brittle - breaks when services change file operations
- Doesn't prevent `process.chdir()` race conditions
- Complex mock setup for every test
- Obscures actual behavior being tested
- Violates "test with real dependencies" philosophy

**When to use**: Never - this is an anti-pattern for integration tests

### Approach 3: Architectural Overhaul (Pass context object everywhere)

**Description**: Create a `WorkspaceContext` object that carries all path information and pass it through method parameters.

**Implementation**:
```typescript
interface WorkspaceContext {
  workingDir: string;
  hodgePath: string;
  // ... other paths
}

class ExploreCommand {
  async execute(feature: string, ctx: WorkspaceContext) {
    const contextMgr = new ContextManager();
    await contextMgr.updateContext(ctx, data);
  }
}
```

**Pros**:
- Very explicit about workspace boundaries
- Could carry additional context (config, logger, etc.)
- Single source of truth for paths

**Cons**:
- Breaking change - changes method signatures throughout codebase
- Much larger refactor (~50+ method signatures)
- Overkill for the current problem
- Would require deprecation period for backward compatibility

**When to use**: Only if we need to carry more context beyond working directory

## Recommendation

**Use Approach 1: Constructor Injection with Cascade Pattern**

This approach solves the root problem (explicit working directory propagation) without breaking existing code (default parameters maintain backward compatibility). It handles the "several layers deep" problem by making each class responsible for passing `workingDir` to its dependencies.

### Implementation Strategy (Phased)

**Phase 1**: Add isolation verification test (proves the problem)
**Phase 2**: Fix root services (ContextManager, IDManager, PMHooks)
**Phase 3**: Fix commands (ExploreCommand, BuildCommand, etc.)
**Phase 4**: Fix the 6 test files (remove `process.chdir()`, use constructor injection)
**Phase 5**: Add ESLint rule (prevent regression)
**Phase 6**: Update standards (document the pattern)

### Scope of Changes

**Files requiring modification** (~31 files total):
- 10 Command classes: explore, build, harden, ship, decide, status, context, plan, init, logs
- 15 Service classes: ContextManager, IDManager, PMHooks, ExploreService, BuildService, HardenService, ShipService, ToolchainService, etc.
- 6 Test files: The ones identified using `process.chdir()`

**Pattern per file**:
```typescript
// Before
class MyService {
  async doThing() {
    const file = path.join(process.cwd(), '.hodge/file.json');
  }
}

// After
class MyService {
  constructor(private workingDir: string = process.cwd()) {}

  async doThing() {
    const file = path.join(this.workingDir, '.hodge/file.json');
  }
}
```

## Test Intentions

Behavioral expectations for HODGE-366:

1. ✓ Tests run in parallel without interfering with each other's file system state
2. ✓ Project `.hodge/context.json` remains unchanged after running test suite
3. ✓ Project `.hodge/id-mappings.json` remains unchanged after running test suite
4. ✓ Tests using Commands with workspace directories write only to workspace
5. ✓ Nested service calls (3-5 layers deep) respect workspace isolation
6. ✓ ESLint blocks `process.chdir()` usage in test files
7. ✓ Failed/timed-out tests don't leave project state polluted

## Decisions Decided During Exploration

1. ✓ **Fix Strategy**: Use constructor injection with cascade pattern (Approach 1)
2. ✓ **Scope**: Fix all 6 identified test files (not just the initial 3)
3. ✓ **Prevention**: Add ESLint rule to prevent `process.chdir()` in tests
4. ✓ **Backward Compatibility**: Use default parameter `process.cwd()` to maintain existing behavior
5. ✓ **Scope of Changes**: Modify ~25-30 classes (10 commands + 15 services + 6 test files)

## Decisions Needed

**No Decisions Needed** - All implementation decisions were resolved during exploration.

## Next Steps

1. `/build HODGE-366` - Start implementing the constructor injection pattern
2. Begin with Phase 1: isolation verification test
3. Progress through phases 2-6 systematically
