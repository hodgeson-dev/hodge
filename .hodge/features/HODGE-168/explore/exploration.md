# HODGE-168: Save/Load Performance & Effectiveness Optimization

## Problem Analysis

### Current State
After reviewing the codebase, I've identified the following:

**What's Already Implemented:**
- ✅ `SaveManager` class with manifest-based saves (src/lib/save-manager.ts)
- ✅ Save manifest types (src/types/save-manifest.ts)
- ✅ Incremental save support in SaveManager
- ✅ Lazy loading support in SaveManager
- ✅ Auto-save using SaveManager in auto-save.ts
- ✅ Context manager with lazy load methods

**What's Missing:**
- ❌ No CLI `hodge save` command exists
- ❌ SaveManager not integrated into any CLI commands
- ❌ `/save` and `/load` commands don't use SaveManager
- ❌ Methods in SaveManager are incomplete (mock implementations)
- ❌ No actual git integration in SaveManager
- ❌ Performance tests are skipped

### Key Issues

1. **Speed**: Current save/load copies entire directories (1-3 seconds)
2. **Redundancy**: Saving generated files, unchanged content, duplicate data
3. **Incomplete Integration**: SaveManager exists but isn't used
4. **Command Division**: Unclear what belongs in `/save` vs `hodge save`
5. **Context Loss**: Not saving all necessary state for resumption

### What Should Be Saved

**Essential (Always Save):**
- Current feature and phase
- Modified files list (paths only)
- Recent decisions
- Completed/pending tasks
- Test status
- Session duration/timestamps

**Reference Only (Don't Copy):**
- Feature exploration/build/harden files (already persisted)
- Standards/patterns (static, don't change)
- Generated files (can be regenerated)
- Node_modules, dist, coverage (excluded)

**On-Demand (Save References):**
- Git diff/status (can be recalculated)
- Large exploration documents (load when needed)
- Work logs (load when requested)

## Exploration Approaches

### Approach 1: Complete SaveManager Integration
**Concept**: Finish the SaveManager implementation and integrate it everywhere

**Implementation:**
```typescript
// 1. Complete SaveManager methods
class SaveManager {
  async createManifest(name: string, options: SaveOptions): Promise<SaveManifest> {
    // Real implementation using git commands
    const gitStatus = await execAsync('git status --porcelain');
    const modifiedFiles = this.parseGitStatus(gitStatus.stdout);

    // Get actual context, decisions, tests
    const context = await this.contextManager.read();
    const decisions = await this.getRecentDecisions();
    const testStatus = await this.getTestStatus();

    return {
      version: '2.0',
      type: options.type || 'full',
      timestamp: new Date().toISOString(),
      session: {
        feature: context.feature,
        phase: context.mode,
        lastAction: context.lastCommand,
        startTime: context.timestamp,
        elapsedMinutes: this.calculateElapsed(context.timestamp)
      },
      state: {
        decisions,
        completedTasks: await this.getCompletedTasks(),
        pendingTasks: await this.getPendingTasks(),
        testStatus,
        modifiedFiles,
        lastCommit: await this.getLastCommit()
      },
      references: {
        featureDir: `.hodge/features/${context.feature}`,
        exploration: `.hodge/features/${context.feature}/explore/exploration.md`,
        buildPlan: `.hodge/features/${context.feature}/build/build-plan.md`
      },
      excluded: ['node_modules', 'dist', 'coverage', '.git']
    };
  }
}

// 2. Create CLI save command
export class SaveCommand {
  private saveManager = new SaveManager();

  async execute(name?: string, options: SaveOptions = {}): Promise<void> {
    const savePath = await this.saveManager.save(name || this.generateName(), options);
    console.log(`✓ Saved to ${savePath}`);
  }
}

// 3. Update context command to use SaveManager
export class ContextCommand {
  private saveManager = new SaveManager();

  async loadRecentSave(): Promise<void> {
    const saves = await this.discoverSaves();
    if (saves.length > 0) {
      const session = await this.saveManager.load(saves[0].name, { lazy: true });
      this.presentSession(session);
    }
  }
}
```

**Pros:**
- Leverages existing work
- Consistent save/load mechanism
- Optimized performance
- Clear architecture

**Cons:**
- Significant implementation work
- Need to update multiple commands
- Risk of breaking existing functionality

---

### Approach 2: Slash Command Optimization Only
**Concept**: Keep save/load in slash commands, optimize the markdown templates

**Implementation:**
```markdown
# /save command (optimized)

## Smart Save Process

1. **Determine What Changed**
   ```bash
   # Get only what's changed since last save
   git diff --stat > .hodge/tmp/changes.txt
   hodge context diff --since-last-save
   ```

2. **Create Minimal Manifest**
   ```bash
   # Save only references and state
   echo '{"feature": "{{feature}}", "phase": "{{phase}}", "modified": [...]}' > manifest.json
   ```

3. **Skip Redundant Data**
   - Don't copy feature directories (already persisted)
   - Don't save generated files
   - Don't duplicate static content

# /load command (optimized)

## Fast Load Process

1. **Load Manifest First**
   ```bash
   # Just read the manifest (instant)
   cat .hodge/saves/{{name}}/manifest.json
   ```

2. **Present Summary Immediately**
   Show user the context without loading files

3. **Load Content On-Demand**
   Only read files when user needs them
```

**Pros:**
- Minimal code changes
- Quick to implement
- Low risk
- Clear separation of concerns

**Cons:**
- Limited optimization potential
- Can't leverage SaveManager benefits
- Inconsistent with auto-save implementation

---

### Approach 3: Hybrid Progressive Enhancement (Recommended)
**Concept**: Implement save/load in phases, starting with CLI integration

**Phase 1 - CLI Integration (Quick Win):**
```typescript
// Create minimal hodge save/load commands that use SaveManager
export class SaveCommand {
  async execute(name?: string): Promise<void> {
    // Use existing SaveManager
    const savePath = await saveManager.save(name, { minimal: true });
    console.log(`Saved: ${savePath}`);
  }
}

export class LoadCommand {
  async execute(name?: string): Promise<void> {
    // Use lazy loading
    const session = await saveManager.load(name, { lazy: true });
    console.log(`Loaded: ${session.manifest.session.feature}`);
  }
}
```

**Phase 2 - Complete SaveManager:**
```typescript
// Finish the mock implementations
- Real git integration
- Actual file system operations
- Decision/task extraction
- Test status detection
```

**Phase 3 - Optimize Slash Commands:**
```markdown
# Update /save and /load to use hodge save/load
- /save delegates to `hodge save`
- /load delegates to `hodge load`
- /hodge uses same optimized loading
```

**Pros:**
- Incremental improvement
- Quick initial wins
- Can ship Phase 1 immediately
- Low risk per phase
- Builds on existing work

**Cons:**
- Multiple deployment phases
- Temporary inconsistencies between phases

## Command Division Philosophy

### `/save` and `/load` (Slash Commands)
**Purpose**: AI orchestration and context presentation
- Parse user intent
- Present rich context to user
- Coordinate multiple operations
- Handle error messages gracefully
- Provide helpful suggestions

### `hodge save` and `hodge load` (CLI Commands)
**Purpose**: Actual implementation and file operations
- Create/read manifest files
- Perform git operations
- Calculate differences
- Manage file system
- Return structured data

### Division of Labor
```
User → /save → hodge save → SaveManager → File System
         ↓         ↑            ↓
    AI Context  Structured   Optimized
    & UX        Data         Operations
```

## Test Intentions

What the optimized save/load system should do:

1. **Save Performance**
   - [ ] Minimal saves complete in <100ms
   - [ ] Incremental saves complete in <500ms
   - [ ] Full saves complete in <1 second
   - [ ] Auto-saves don't block workflow

2. **Load Performance**
   - [ ] Manifest loads in <100ms
   - [ ] Basic context available immediately
   - [ ] Full restoration available on-demand
   - [ ] No unnecessary file reading

3. **Data Completeness**
   - [ ] All necessary context is preserved
   - [ ] Session can be fully resumed
   - [ ] No data loss on save/load cycle
   - [ ] Incremental saves capture all changes

4. **User Experience**
   - [ ] Clear feedback on what was saved
   - [ ] Instant context on load
   - [ ] Seamless auto-save
   - [ ] Helpful error messages

## Recommendation

**Implement Approach 3: Hybrid Progressive Enhancement**

This approach:
1. Leverages the existing SaveManager work
2. Provides immediate performance improvements
3. Maintains backward compatibility
4. Allows incremental deployment
5. Clear separation between AI (slash) and implementation (CLI)

The phases can be implemented as:
- **Phase 1**: One day (CLI commands + basic integration)
- **Phase 2**: Two days (complete SaveManager implementation)
- **Phase 3**: One day (update slash commands)

This delivers value quickly while building toward the complete solution.