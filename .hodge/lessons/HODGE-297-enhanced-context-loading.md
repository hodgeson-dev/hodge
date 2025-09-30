# Lessons Learned: HODGE-297 - Enhanced Context Loading

## Feature: Context Loading Verification and Enhancement

**Shipped**: 2025-09-30
**Status**: ✅ Production

### The Problem

The `/hodge` and `/load` commands were loading only minimal context:
- Basic session state (HODGE.md)
- Complete standards (standards.md)
- **All 1100+ lines** of decisions.md
- Pattern file list only (not content)

This created two issues:
1. **Too much of the wrong thing**: Loading 1100+ lines of decision history overwhelmed context windows
2. **Missing critical files**: Principles.md, AI-CONTEXT.md, phase-specific files, and PM tracking were not loaded

AI assistants lacked the context needed to provide informed suggestions while being burdened with outdated historical decisions.

### Approach Taken

Implemented **Smart Selective Context Loading** through 5 architectural decisions:

#### Decision 1: Limit Decision History
Changed from loading all 1100+ lines to loading **recent 20 decisions**. This provides relevant recent context while dramatically reducing context window usage.

**Implementation**: Added `loadRecentDecisions(limit)` method that:
- Parses decisions.md to find decision headers
- Extracts the most recent N decisions
- Adds truncation note when limited
- Gracefully handles missing files

#### Decision 2: Conditional PM Tracking
PM tracking files (id-mappings.json, 28KB) only load when a feature has a linked PM issue.

**Implementation**: Added `hasLinkedPMIssue(feature)` method that checks for `issue-id.txt` file existence before loading PM data.

#### Decision 3: Maintain On-Demand Pattern Loading
Kept existing pattern loading behavior (no changes needed). Patterns load only when explicitly referenced or requested, following AI-CONTEXT.md design.

#### Decision 4: Phase-Aware File Discovery
Load **all .md and .json files** from the current phase directory, supporting both standard files and custom user-created files.

**Implementation**: Added `loadPhaseFiles(feature, phase)` method that:
- Detects current phase (explore/build/harden/ship)
- Discovers all .md and .json files in that directory
- Filters by extension to avoid loading irrelevant files

#### Decision 5: Consistent Command Behavior
Updated both `/hodge` and `/load` commands to use the same enhanced context loading, ensuring predictable behavior.

### Key Learnings

#### 1. Testability Through Constructor Injection

**Discovery**: Following established patterns pays off. `PlanCommand` and `DecideCommand` already used optional `basePath` constructor parameters.

**Solution**: Added `basePath` parameter to `ContextCommand`:
```typescript
constructor(basePath?: string) {
  this.basePath = basePath || process.cwd();
}
```

**Impact**: Enabled isolated testing without `process.chdir()`, which doesn't work in Vitest workers.

#### 2. Progressive Enhancement Pattern

**Discovery**: The project already had a clear philosophy: "Load what you need, when you need it."

**Solution**: Followed the existing AI-CONTEXT.md guidance rather than creating a new approach. Added conditional loading based on context (PM tracking only when needed, phase files based on current phase).

**Impact**: Implementation aligned with existing architecture, making it easier to maintain and understand.

#### 3. Test Isolation is Critical

**Discovery**: Project standards mandate that tests must NEVER modify the project's `.hodge` directory.

**Solution**: All 5 smoke tests use `os.tmpdir()` for temporary directories:
```typescript
const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));
const command = new ContextCommand(tmpDir);
// ... test logic ...
await fs.rm(tmpDir, { recursive: true, force: true });
```

**Impact**: Tests run in complete isolation, preventing data corruption and ensuring parallel execution safety.

#### 4. Balance Completeness with Performance

**Discovery**: Loading everything is simple but wasteful. Loading nothing is fast but useless.

**Solution**: Smart selective loading based on actual needs:
- Recent 20 decisions (not all 130+)
- PM tracking only when linked
- Phase files only from current phase
- Core files always (principles, AI-CONTEXT)

**Impact**:
- Reduced context from ~1500 lines to ~700-1100 lines
- AI still has all relevant information
- Better performance, better relevance

### Code Examples

#### Recent Decisions Loading Pattern
```typescript
async loadRecentDecisions(limit: number = 20): Promise<string> {
  // Parse markdown to find decision headers
  const decisionIndices: number[] = [];
  lines.forEach((line, index) => {
    if (line.match(/^###\s+\d{4}-\d{2}-\d{2}\s+-\s+/)) {
      decisionIndices.push(index);
    }
  });

  // Take first N (most recent at top)
  const limitedIndices = decisionIndices.slice(0, limit);

  // Add truncation note
  const truncationNote = decisionIndices.length > limit
    ? `\n\n---\n*Showing ${limit} most recent decisions of ${decisionIndices.length} total*\n`
    : '';
}
```

#### Conditional Loading Pattern
```typescript
async hasLinkedPMIssue(feature: string): Promise<boolean> {
  const issueIdPath = path.join(this.basePath, '.hodge', 'features', feature, 'issue-id.txt');
  return this.fileExists(issueIdPath);
}

// In usage:
if (await hasLinkedPMIssue(feature)) {
  // Load id-mappings.json
}
```

#### Phase-Aware Discovery Pattern
```typescript
async detectPhase(feature: string): Promise<'explore' | 'build' | 'harden' | 'ship' | null> {
  // Check in reverse order (most advanced first)
  const phases = ['ship', 'harden', 'build', 'explore'];
  for (const phase of phases) {
    if (await this.fileExists(path.join(featurePath, phase))) {
      return phase;
    }
  }
  return null;
}
```

### Impact

**Performance**:
- Context size reduced from 1100+ lines to ~700-1100 lines
- Smart loading prevents unnecessary file reads
- Conditional PM tracking saves 28KB when not needed

**AI Quality**:
- Now loads principles.md (core philosophy)
- Now loads AI-CONTEXT.md (loading strategy guide)
- Phase-specific files provide relevant context
- Recent decisions more relevant than historical ones

**Maintainability**:
- Follows established constructor injection pattern
- Clear separation of concerns (each method does one thing)
- Comprehensive documentation with decision references
- 5 smoke tests ensure behavior stays correct

**Developer Experience**:
- Testable commands (basePath parameter)
- Consistent behavior (/hodge and /load work the same)
- Extensible (easy to add more conditional loading)

### Related Decisions

From `.hodge/decisions.md`:
1. Load recent 20 decisions instead of full 1100+ line history - balances context completeness with performance
2. Load id-mappings.json only when feature has linked PM issue - provides contextual PM tracking without unnecessary overhead
3. Keep current pattern loading behavior - load only on explicit reference or user request, following AI-CONTEXT.md design principles
4. Load all .md and .json files in current phase directory - supports custom files and flexible workflows while maintaining comprehensive context
5. Update both /hodge and /load commands with enhanced context loading - provides consistent experience and predictable behavior across the system

### Metrics

- **Files Changed**: 3 (2 modified, 1 added)
- **Lines Added**: 265 (126 in context.ts, 4 in hodge-md-generator.ts, 138 in tests)
- **Tests Added**: 5 smoke tests
- **Test Coverage**: All tests passing (207 total, no regressions)
- **Patterns Applied**: Error Boundary (graceful fallbacks), Constructor Injection (testability)

---

_Documented: 2025-09-30_
_Feature: HODGE-297_
_Phase: Shipped_