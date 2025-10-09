# Lessons Learned: HODGE-336

## Feature: Remove /load and /save Commands

### The Problem

The `/load` and `/save` slash commands added unnecessary complexity without providing value. Despite accumulating 896 auto-saves in `.hodge/saves/`, the commands were never used in practice. The current workflow (`/clear` → `/hodge HODGE-XXX` → `/explore`) already loaded feature context effectively, making the save/load system redundant.

**Key insight**: Features that seem useful in theory but go unused in practice become maintenance burden. The save/load infrastructure consumed ~3,950 lines of code for zero practical benefit.

### Approach Taken

**Complete Atomic Removal** - Removed all save/load infrastructure in a single change:

1. **Deleted 17 files** (~3,950 lines):
   - Slash commands (save.md, load.md)
   - CLI commands (save.ts, load.ts)
   - Core services (save-manager.ts, auto-save.ts)
   - Type definitions (save-manifest.ts)
   - 7 test files
   - 4 skipped mock-heavy tests

2. **Updated 8 files**:
   - Removed CLI registration (hodge.ts)
   - Removed auto-save calls (explore.ts, build.ts, harden.ts, ship.ts)
   - Removed session loading methods (context-manager.ts)
   - Updated slash command template (hodge.md)

3. **Verified completeness**:
   - Used grep to find all references to deleted code
   - Verified zero orphaned imports or calls
   - Ran full test suite (876/876 tests passing)

### Key Learnings

#### 1. Ad-Hoc Workflow Drives Discovery

**Discovery**: Working in an ad-hoc manner during feature implementation surfaced both immediate issues and new feature opportunities.

**What worked**:
- While removing save/load, discovered review profile loading was broken (HODGE-338)
- Identified need for manual testing phase between /build and /harden (HODGE-337)
- Created vitest-3.x profile requirement (HODGE-339)
- Captured all three issues immediately as new features

**Pattern**: Don't wait for "perfect" workflow - let real implementation surface problems and improvements. Capture discoveries as features immediately rather than deferring.

**Impact**: Created 3 new features (HODGE-337, 338, 339) that improve the framework's review and auto-detection systems.

#### 2. Manual Testing Gap in Slash Command Workflow

**Discovery**: There's a missing manual test step between `/build` and `/harden` phases.

**The Challenge**:
- Normal applications: Easy to manually test changes before hardening
- Slash commands: Require Claude Code to test, but testing pollutes current development context
- Current workaround: None - go straight from build to harden and hope

**Potential Solution**: Run a second Claude Code instance dedicated to manual testing, keeping development context clean.

**Why this matters**:
- Harden phase runs automated validation (tests, linting, type check)
- Manual testing would catch UX issues before automation runs
- Slash command testing requires AI interaction, not just `npm test`

**Action**: Documented as part of HODGE-337 (review process optimization) - need better workflow for manual slash command testing.

#### 3. Review Process Weight

**Surprise**: The harden review process was unexpectedly heavyweight and revealed multiple broken aspects.

**Issues discovered**:
- Review context loading asked for 60-100K tokens (cognitive overload)
- Review profiles failed to load (path resolution bug)
- Unclear value proposition (what does review catch that validation doesn't?)
- Review was confirmatory not corrective for low-risk deletions

**Insight**: May need to optimize the full review process itself, not just be smarter about when to skip it.

**What this revealed**:
- Template complexity creates friction (loads massive context that may not be relevant)
- Need risk-based review depth (deletions vs new code require different rigor)
- Review purpose needs clarification (architectural assessment vs correctness checking)

**Action**: Created HODGE-337 to explore review process optimization with potential solutions like chunked context, risk-based depth, and useful review reports.

#### 4. Complete Feature Removal Pattern (Reusable)

**Pattern**: When removing an entire feature, use this systematic checklist:

**Phase 1: Analyze Scope**
```bash
# Identify all components
- Slash commands (.claude/commands/)
- CLI commands (src/commands/)
- Core services (src/lib/)
- Type definitions (src/types/)
- Test files (*test.ts, *.spec.ts)
- Documentation references
```

**Phase 2: Delete Infrastructure**
```bash
# Remove files completely
rm .claude/commands/{feature}.md
rm src/commands/{feature}.ts
rm src/lib/{feature}-*.ts
rm src/types/{feature}-*.ts
rm **/*{feature}*.test.ts
```

**Phase 3: Remove References**
```bash
# Find all imports and calls
grep -r "from.*{feature}" src/
grep -r "import.*{feature}" src/

# Remove:
- Import statements
- Method calls
- CLI registration
- Template references
```

**Phase 4: Verify Completeness**
```bash
# Check for orphaned code
grep -r "{FeatureName}" src/        # PascalCase
grep -r "{featureName}" src/        # camelCase
grep -r "{feature-name}" src/       # kebab-case

# Expected result: Zero matches
```

**Phase 5: Validate**
```bash
# Run full suite
npm test           # All tests should pass
npm run lint       # No errors
npm run typecheck  # No type errors
npm run build      # Build succeeds
```

**When to use this pattern**:
- Removing unused features (like save/load)
- Deprecating old implementations
- Cleaning up experimental code
- Simplifying overly complex systems

**Key success factors**:
- Atomic removal (all at once, not phased)
- Comprehensive verification (grep for all references)
- Full test coverage (confirms nothing broke)
- Clear commit message (documents what was removed and why)

### Code Examples

**Before - Auto-save in workflow commands:**
```typescript
// src/commands/explore.ts
import { autoSave } from '../lib/auto-save.js';

async execute(feature: string): Promise<void> {
  await autoSave.checkAndSave(feature);  // Removed
  // ... rest of implementation
}
```

**After - Clean workflow without auto-save:**
```typescript
// src/commands/explore.ts
import { contextManager } from '../lib/context-manager.js';

async execute(feature: string): Promise<void> {
  // Auto-save removed - context managed via context.json
  // ... rest of implementation
}
```

**Before - Session loading in context manager:**
```typescript
// src/lib/context-manager.ts
async loadSession(saveName: string): Promise<LoadedSession> {
  // 83 lines of session loading logic - REMOVED
}

async loadRecent(): Promise<LoadedSession> {
  // 35 lines of recent session logic - REMOVED
}
```

**After - Focused context manager:**
```typescript
// src/lib/context-manager.ts
// Methods removed entirely
// ContextManager now focused solely on workflow state via context.json
```

**Verification pattern:**
```bash
# Ensure no orphaned references
grep -r "saveManager" src/     # 0 matches ✅
grep -r "autoSave" src/        # 0 matches ✅
grep -r "SaveManifest" src/    # 0 matches ✅
```

### Impact

✅ **Codebase Simplification**:
- Removed 3,950 lines of unused code
- Deleted 17 files
- Eliminated 896 auto-save directories
- Reduced from 9 to 7 main commands

✅ **Developer Experience**:
- Simpler workflow: `/hodge HODGE-XXX` replaces `/save` + `/load`
- Less cognitive load: Fewer commands to learn
- Cleaner codebase: No confusing unused features

✅ **Architecture**:
- ContextManager focused on single responsibility (workflow state)
- No orphaned references (verified via grep)
- Maintained all standards (logging HODGE-330, CLI architecture HODGE-321)

✅ **Test Quality**:
- Removed mock-heavy unit tests (aligned with "test behavior not implementation")
- Zero regressions: 876/876 tests passing
- Improved test signal-to-noise ratio

✅ **Workflow Insights**:
- Discovered 3 new features during implementation (HODGE-337, 338, 339)
- Identified manual testing gap in slash command workflow
- Surfaced review process optimization needs

### Related Decisions

**Exploration Decisions** (all resolved during exploration):
1. Remove both slash commands and CLI commands
2. Delete all 896 auto-saves
3. Remove SaveManager infrastructure entirely
4. Remove `--list` and `--recent` flags from `/hodge`
5. Use atomic removal approach (not phased)

**Pattern Identified**:
> "When a feature becomes redundant, complete removal is better than deprecation. Clean deletions prevent maintenance burden and reduce cognitive load."

This pattern should be applied when:
- Feature is unused (verified via metrics/logs)
- Equivalent functionality exists elsewhere
- No external users depend on it
- Atomic removal is feasible

### Future Implications

**This removal enables**:
1. Broader parameter cleanup in other commands (mentioned as future goal)
2. Simpler mental model for new contributors
3. Faster CI/CD (fewer tests to run)
4. Less maintenance burden (no dead code to consider during refactoring)

**Follow-up work**:
- HODGE-337: Optimize review process (discovered during harden phase)
- HODGE-338: Fix auto-detection version ranges and profile loading
- HODGE-339: Create Vitest 3.x review profile

---
_Documented: 2025-10-09_
_Pattern: Complete Feature Removal (reusable)_
