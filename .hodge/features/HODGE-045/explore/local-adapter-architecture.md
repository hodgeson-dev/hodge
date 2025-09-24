# LocalPMAdapter Architecture Analysis

## Current Design Investigation

### Why LocalPMAdapter Doesn't Extend BasePMAdapter

After analyzing the codebase, I've discovered that LocalPMAdapter's special treatment is **intentional by design**. Here's why:

#### 1. Different Purpose & Responsibility
- **BasePMAdapter**: Interface for external PM tools (Linear, GitHub, Jira)
  - Deals with issues, states, transitions
  - API-centric operations
  - Optional integration

- **LocalPMAdapter**: Local file-based project tracking
  - Manages `project_management.md` file
  - Track features and phases locally
  - ALWAYS active (not optional)

#### 2. Different Interface Requirements

**BasePMAdapter Abstract Methods**:
```typescript
abstract fetchStates(projectId?: string): Promise<PMState[]>;
abstract getIssue(issueId: string): Promise<PMIssue>;
abstract updateIssueState(issueId: string, stateId: string): Promise<void>;
abstract searchIssues(query: string): Promise<PMIssue[]>;
abstract createIssue(title: string, description?: string): Promise<PMIssue>;
```

**LocalPMAdapter Methods**:
```typescript
async init(): Promise<void>
async addFeature(feature: string, description: string, phase?: string): Promise<void>
async updateFeatureStatus(feature: string, status: FeatureStatus): Promise<void>
async updatePhaseProgress(): Promise<void>
```

The interfaces are fundamentally incompatible because they serve different purposes.

#### 3. Always-On vs Optional
- LocalPMAdapter is **always created** in PMHooks constructor
- External adapters are **conditionally invoked** based on configuration
- Local tracking happens regardless of external PM tool availability

## Problem Statement

The current architecture creates two parallel PM tracking systems:
1. **Local tracking** (always on) - via LocalPMAdapter
2. **External tracking** (optional) - via BasePMAdapter implementations

This separation means:
- ❌ Code duplication between local and external tracking
- ❌ LocalPMAdapter can't benefit from BasePMAdapter's conventions/caching
- ❌ Can't swap local adapter for testing/mocking easily
- ❌ Inconsistent interfaces make it harder to understand

## Approach 1: Keep Separation, Add Shared Interface

### Implementation
Create a minimal shared interface that both can implement:
```typescript
interface PMTracker {
  trackFeature(feature: string, status: string): Promise<void>;
  trackShip?(feature: string, context?: ShipContext): Promise<void>;
}

// LocalPMAdapter implements PMTracker
class LocalPMAdapter implements PMTracker {
  async trackFeature(feature: string, status: string) {
    // Map to internal methods
    await this.updateFeatureStatus(feature, status);
  }
}

// BasePMAdapter implements PMTracker
abstract class BasePMAdapter implements PMTracker {
  async trackFeature(feature: string, status: string) {
    const issue = await this.findIssueByFeature(feature);
    if (issue) {
      await this.updateIssueState(issue.id, status);
    }
  }
}
```

### Pros
- Minimal changes to existing code
- Preserves current architecture
- Allows unified testing interface
- Keeps local adapter's special status

### Cons
- Still has two separate systems
- Limited shared functionality
- Doesn't solve underlying duplication

## Approach 2: LocalPMAdapter as Special BasePMAdapter (Recommended)

### Implementation
Make LocalPMAdapter extend BasePMAdapter but with special handling:
```typescript
export class LocalPMAdapter extends BasePMAdapter {
  private pmPath: string;
  private operationQueue: Promise<void> = Promise.resolve();

  constructor(basePath?: string) {
    // Special config for local adapter
    super({
      config: {
        tool: 'local' as PMTool,
        baseUrl: basePath || '.'
      }
    });
    this.pmPath = path.join(basePath || '.', '.hodge', 'project_management.md');
  }

  // Implement abstract methods with local file operations
  async fetchStates(): Promise<PMState[]> {
    // Return hodge workflow states
    return [
      { id: 'exploring', name: 'Exploring', type: 'unstarted' },
      { id: 'building', name: 'Building', type: 'started' },
      { id: 'hardening', name: 'Hardening', type: 'started' },
      { id: 'shipped', name: 'Shipped', type: 'completed' }
    ];
  }

  async getIssue(issueId: string): Promise<PMIssue> {
    // Read from project_management.md
    const content = await this.readPMFile();
    const feature = this.parseFeature(content, issueId);
    return {
      id: issueId,
      title: feature.description,
      state: this.mapStatusToState(feature.status),
      url: `file://${this.pmPath}#${issueId}`
    };
  }

  async updateIssueState(issueId: string, stateId: string): Promise<void> {
    // Keep existing updateFeatureStatus logic
    await this.updateFeatureStatus(issueId, stateId as FeatureStatus);
  }

  async searchIssues(query: string): Promise<PMIssue[]> {
    const content = await this.readPMFile();
    return this.searchFeatures(content, query);
  }

  async createIssue(title: string, description?: string): Promise<PMIssue> {
    await this.addFeature(title, description || title);
    return this.getIssue(title);
  }

  // Keep existing special methods
  async init(): Promise<void> { /* existing */ }
  async updatePhaseProgress(): Promise<void> { /* existing */ }

  // Add file operations as private methods
  private async readPMFile(): Promise<string> { /* ... */ }
  private parseFeature(content: string, id: string): Feature { /* ... */ }
}
```

### Pros
- ✅ Unifies the adapter architecture
- ✅ LocalPMAdapter can use BasePMAdapter's conventions/caching
- ✅ Consistent interface for all adapters
- ✅ Can be called through PMHooks.callPMAdapter
- ✅ Preserves special always-on behavior
- ✅ Better testability and mockability

### Cons
- Requires mapping local concepts to issue-based interface
- More significant refactoring needed
- Some methods might feel forced (e.g., getIssue for local features)

## Approach 3: Dual-Mode Adapter Pattern

### Implementation
Create a unified adapter that can work in both local and external modes:
```typescript
export class UnifiedPMAdapter extends BasePMAdapter {
  private localAdapter: LocalPMAdapter;
  private externalAdapter?: BasePMAdapter;

  constructor(options: PMAdapterOptions & { localPath?: string }) {
    super(options);
    this.localAdapter = new LocalPMAdapter(options.localPath);

    // Create external adapter if configured
    if (options.config.tool !== 'local') {
      this.externalAdapter = this.createExternalAdapter(options);
    }
  }

  // All methods update both local and external
  async updateIssueState(issueId: string, stateId: string): Promise<void> {
    // Always update local
    await this.localAdapter.updateFeatureStatus(issueId, stateId);

    // Optionally update external
    if (this.externalAdapter) {
      try {
        await this.externalAdapter.updateIssueState(issueId, stateId);
      } catch (error) {
        // Silent failure for external
        console.log(chalk.gray(`External PM update failed: ${error}`));
      }
    }
  }

  // Other methods follow similar pattern
}
```

### Pros
- Single adapter handles both local and external
- Guaranteed local tracking
- Automatic fallback behavior
- Simplifies PMHooks

### Cons
- Mixes responsibilities
- More complex adapter logic
- Harder to test in isolation

## Recommendation

**Approach 2: LocalPMAdapter as Special BasePMAdapter** is the best solution because:

1. **Architectural Consistency**: All PM adapters share the same base class and interface
2. **Preserves Specialness**: LocalPMAdapter remains always-on through PMHooks
3. **Code Reuse**: Can leverage BasePMAdapter's conventions, caching, and utilities
4. **Testability**: Unified interface makes testing and mocking easier
5. **Future-Proof**: Easy to add new adapters or swap implementations
6. **Backward Compatible**: Existing special methods (init, updatePhaseProgress) preserved

### Implementation Plan
1. Extend LocalPMAdapter from BasePMAdapter
2. Implement abstract methods using file operations
3. Map local concepts (features) to PM concepts (issues)
4. Update PMHooks to optionally call LocalPMAdapter through callPMAdapter
5. Keep special always-on initialization in constructor
6. Add 'local' as a valid PMTool type

### Special Handling in PMHooks
```typescript
export class PMHooks {
  private localAdapter: LocalPMAdapter;  // Always created

  constructor(basePath?: string) {
    // LocalPMAdapter is special - always initialized
    this.localAdapter = new LocalPMAdapter(basePath);
  }

  async init(): Promise<void> {
    // Always initialize local (special behavior preserved)
    await this.localAdapter.init();

    // Load external config
    await this.loadConfiguration();
  }

  // Can now optionally route through callPMAdapter
  private async callPMAdapter(tool: string, feature: string, status: string): Promise<void> {
    switch (tool.toLowerCase()) {
      case 'local':
        // LocalPMAdapter can now be called this way too
        await this.localAdapter.updateIssueState(feature, status);
        break;
      // ... other adapters
    }
  }
}
```

## Why This Design Makes Sense

The original separation was based on:
1. **Different data models** (files vs API issues)
2. **Different lifecycles** (always-on vs optional)
3. **Different purposes** (local tracking vs external sync)

However, these differences can be abstracted behind a common interface while preserving the special behaviors through:
1. **Constructor logic** - LocalPMAdapter always created
2. **Init pattern** - Local always initialized first
3. **Silent failure** - External can fail, local cannot
4. **Method mapping** - Local file ops mapped to issue operations

This gives us the best of both worlds: architectural consistency with preserved specialness.