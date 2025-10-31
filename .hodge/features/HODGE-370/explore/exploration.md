# Exploration: Complete test isolation fixes by eliminating contextManager singleton and adding basePath to all Commands

**Created**: 2025-10-31
**Status**: Exploring

## Problem Statement

HODGE-366 partially fixed test isolation by adding basePath injection to some commands and services. However, the `contextManager` singleton export (initialized with `process.cwd()` at module load time) still allows test contamination in BuildCommand, HardenCommand, and ShipCommand. Additionally, some test files still instantiate commands/services without passing basePath.

## Context

**Parent Feature**: HODGE-366 (Fix test isolation violations from process.chdir())
**Project Type**: Test infrastructure improvement - completing work started in HODGE-366
**Impact**: Complete test isolation, eliminate all project .hodge contamination

## Conversation Summary

During exploration, we investigated the 6 original test files identified in HODGE-366 and discovered:

### Test Files Status
1. **explore.new-style.test.ts** - ✅ Already fixed (passes workspace.getPath())
2. **id-manager.test.ts** - ✅ Already fixed (uses TempDirectoryFixture with basePath)
3. **pm-integration.smoke.test.ts** - ⚠️ Needs fixing (creates PMHooks() and DecideCommand() without basePath)
4. **explore.sub-feature.test.ts** - ✅ Already fixed (passes basePath to ExploreService and ExploreCommand)
5. **explore-timing-fix.integration.test.ts** - ✅ Already fixed (passes basePath)
6. **ship.integration.test.ts** - ❌ File deleted (only .tmp file remains, ESLint still references it)

### Root Cause: contextManager Singleton

The critical blocker is the contextManager singleton export in `src/lib/context-manager.ts:131`:
```typescript
export const contextManager = new ContextManager(); // ← Initialized with process.cwd()
```

This singleton is imported and used by:
- **BuildCommand** (line 5, uses singleton on lines 40, 52)
- **HardenCommand** (line 10, uses singleton on lines 79, 91)
- **ShipCommand** (line 4, uses singleton on lines 33, 45)

**The Problem**: Even though ShipCommand accepts basePath in its constructor, it still uses the singleton contextManager which was initialized with process.cwd() at module load time. This means:
1. Tests pass basePath to ShipCommand ✓
2. But ShipCommand calls `contextManager.getFeature()` ✗
3. Which reads from project root, not the test workspace ✗

### Commands Analysis

**Commands WITH basePath support:**
- ✅ ExploreCommand - has basePath constructor param, creates own ContextManager instance
- ✅ DecideCommand - has basePath constructor param
- ✅ PlanCommand - has basePath constructor param
- ✅ ShipCommand - has basePath constructor param (but still uses singleton!)
- ✅ ContextCommand - has basePath constructor param, creates own ContextManager instance (line 487)
- ✅ StatusCommand - creates own ContextManager instance locally (line 36)

**Commands NEEDING basePath:**
- ❌ **BuildCommand** - No constructor parameter, uses singleton contextManager
- ❌ **HardenCommand** - No basePath parameter, uses singleton contextManager

### Services Analysis

**Services already using instance-based ContextManager correctly:**
- ✅ ExploreService - Creates `new ContextManager(this.basePath)` on line 87
- ✅ HodgeMDContextGatherer - Creates `new ContextManager(this.basePath)` on line 33
- ✅ SaveService - Accepts ContextManager via constructor injection

**Pattern to follow**: Every service/command that needs ContextManager should create its own instance with basePath.

## Implementation Approaches

### Approach 1: Eliminate Singleton + Add basePath to Remaining Commands (RECOMMENDED)

**Description**: Remove the contextManager singleton export entirely and ensure all Commands create their own ContextManager instance with basePath from constructor.

**Implementation Steps**:

1. **Remove singleton export** (src/lib/context-manager.ts)
   ```typescript
   // REMOVE this line:
   export const contextManager = new ContextManager();
   ```

2. **Add basePath to BuildCommand** (src/commands/build.ts)
   ```typescript
   export class BuildCommand {
     private contextManager: ContextManager;

     constructor(private basePath: string = process.cwd()) {
       this.contextManager = new ContextManager(basePath);
     }

     async execute(feature?: string, options: BuildOptions = {}) {
       // Use this.contextManager instead of singleton
       const resolvedFeature = await this.contextManager.getFeature(feature);
       // ...
       await this.contextManager.updateForCommand('build', feature, 'build');
     }
   }
   ```

3. **Add basePath to HardenCommand** (src/commands/harden.ts)
   ```typescript
   export class HardenCommand {
     private contextManager: ContextManager;

     constructor(private basePath: string = process.cwd()) {
       this.contextManager = new ContextManager(basePath);
     }

     async execute(feature?: string, options: HardenOptions = {}) {
       // Use this.contextManager instead of singleton
       const resolvedFeature = await this.contextManager.getFeature(feature);
       // ...
       await this.contextManager.updateForCommand('harden', feature, 'harden');
     }
   }
   ```

4. **Fix ShipCommand to use instance** (src/commands/ship.ts)
   ```typescript
   export class ShipCommand {
     private contextManager: ContextManager;

     constructor(basePath?: string) {
       this.basePath = basePath ?? process.cwd();
       this.contextManager = new ContextManager(this.basePath); // Add this
     }

     async execute(feature?: string, message?: string) {
       // Change from: await contextManager.getFeature(feature)
       // To: await this.contextManager.getFeature(feature)
     }
   }
   ```

5. **Fix pm-integration.smoke.test.ts**
   - Pass `testDir` to `new PMHooks(testDir)`
   - Pass `testDir` to `new DecideCommand(testDir)`

6. **Clean up ESLint config**
   - Remove obsolete reference to deleted `ship.integration.test.ts`

**Pros**:
- Eliminates singleton anti-pattern completely
- Ensures complete test isolation - no way for tests to contaminate project root
- Follows constructor injection pattern established by HODGE-366
- Backward compatible via default parameter `process.cwd()`
- Makes dependency on ContextManager explicit in all Commands
- Aligns with existing pattern used by ExploreService, HodgeMDContextGatherer

**Cons**:
- Requires modifying 3 command files (build.ts, harden.ts, ship.ts)
- Requires updating 1 test file (pm-integration.smoke.test.ts)
- Small breaking change if anyone externally imports contextManager singleton (unlikely)

**When to use**: This is the correct solution to complete HODGE-366's work

### Approach 2: Keep Singleton but Add Instance Overrides

**Description**: Keep the singleton export for backward compatibility but add optional ContextManager injection to all Commands.

**Implementation**:
```typescript
export class BuildCommand {
  constructor(
    private basePath: string = process.cwd(),
    private contextManager: ContextManager = contextManager
  ) {}
}
```

**Pros**:
- No breaking changes to existing code
- Tests can inject workspace-scoped instances

**Cons**:
- Singleton still exists - confusing API (two ways to do same thing)
- Easy to forget to inject in tests, reverting to singleton behavior
- Doesn't fix the architectural issue
- Creates technical debt

**When to use**: Never - this adds complexity without solving the root problem

### Approach 3: Global Process.cwd() Mock in Tests

**Description**: Mock `process.cwd()` to return test workspace path globally in test setup.

**Pros**:
- Minimal code changes

**Cons**:
- Brittle - easy to break with parallel tests
- Violates "test with real dependencies" principle
- Doesn't solve the architectural issue with singleton
- Just hides the problem instead of fixing it

**When to use**: Never - this is an anti-pattern

## Recommendation

**Use Approach 1: Eliminate Singleton + Add basePath to Remaining Commands**

This completes the work started in HODGE-366 by eliminating the last source of test contamination - the contextManager singleton. The pattern is already established by ExploreService and other services that create their own ContextManager instances.

### Files Requiring Modification

**Commands** (3 files):
1. `src/commands/build.ts` - Add basePath constructor param, create ContextManager instance
2. `src/commands/harden.ts` - Add basePath constructor param, create ContextManager instance
3. `src/commands/ship.ts` - Add ContextManager instance field, use it instead of singleton

**Services** (1 file):
4. `src/lib/context-manager.ts` - Remove singleton export (line 131)

**Tests** (1 file):
5. `test/pm-integration.smoke.test.ts` - Pass basePath to PMHooks and DecideCommand

**Config** (1 file):
6. `.eslintrc.json` - Remove obsolete reference to deleted ship.integration.test.ts

**Total**: 6 files modified

### Scope of Changes

**Pattern per Command**:
```typescript
// Before
export class MyCommand {
  async execute(feature?: string) {
    const resolved = await contextManager.getFeature(feature); // ← singleton
  }
}

// After
export class MyCommand {
  private contextManager: ContextManager;

  constructor(private basePath: string = process.cwd()) {
    this.contextManager = new ContextManager(basePath);
  }

  async execute(feature?: string) {
    const resolved = await this.contextManager.getFeature(feature); // ← instance
  }
}
```

## Test Intentions

Behavioral expectations for HODGE-370:

1. ✓ BuildCommand creates files in workspace directory, not project root
2. ✓ HardenCommand creates files in workspace directory, not project root
3. ✓ ShipCommand creates files in workspace directory, not project root
4. ✓ pm-integration.smoke.test.ts tests run without contaminating project .hodge/
5. ✓ No singleton contextManager export exists in codebase
6. ✓ All Commands accepting basePath instantiate their own ContextManager with it
7. ✓ ESLint config contains no references to deleted test files

## Decisions Decided During Exploration

1. ✓ **Eliminate contextManager singleton** - No benefit to having it, causes test contamination
2. ✓ **Add basePath to BuildCommand** - Constructor injection pattern
3. ✓ **Add basePath to HardenCommand** - Constructor injection pattern
4. ✓ **Fix ShipCommand** - Stop using singleton, use instance instead
5. ✓ **Fix pm-integration.smoke.test.ts** - Pass basePath to all command/service instantiations
6. ✓ **Clean up ESLint** - Remove reference to deleted ship.integration.test.ts
7. ✓ **Pattern consistency** - All Commands create their own ContextManager instance

## No Decisions Needed

All implementation decisions were resolved during exploration. The approach is clear and follows the pattern established by HODGE-366.

## Next Steps

1. `/build HODGE-370` - Start implementing the constructor injection completion
2. Begin with removing the singleton export
3. Add basePath to BuildCommand and HardenCommand
4. Fix ShipCommand to use instance
5. Fix test files and ESLint config
