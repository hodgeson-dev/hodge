# Session Management - Enhanced Exploration

## Current Context
Building on the initial exploration, we now have:
- ✅ Cross-tool-compatibility shipped (HODGE.md works)
- ✅ ID management system (HODGE-xxx mapping)
- ✅ Interaction state system (for ship command)
- Ready to implement session management

## session-management Exploration

### Approach 1: Extend InteractionState Pattern
Leverage existing InteractionState system for session persistence
```typescript
// Extend existing interaction-state.ts
interface SessionState extends InteractionState {
  command: 'session';
  data: {
    feature: string;
    mode: HodgeMode;
    history: CommandHistory[];
    context: {
      decisions: string[];
      openTodos: string[];
      lastCommitHash?: string;
    };
    ai: {
      lastSummary: string;
      keyPoints: string[];
      suggestedNext: string;
    };
  };
}

// Auto-save after each command
class SessionManager extends InteractionStateManager {
  async checkpoint() {
    const state = this.buildSessionState();
    await this.save(state, '.hodge/sessions/current.json');
  }

  async restore() {
    const state = await this.read('.hodge/sessions/current.json');
    await this.regenerateContext(state);
  }
}
```

**Pros:**
- Reuses proven InteractionState infrastructure
- Consistent with ship command pattern
- File-based (works with all AI tools)

**Cons:**
- Might be too heavyweight for simple checkpoints
- InteractionState designed for different purpose

### Approach 2: Lightweight JSON Checkpoints
Minimal session files with just essential context
```typescript
// Simple session format
interface LightSession {
  v: 1;  // Schema version
  ts: number;  // Timestamp
  f: string;  // Feature
  m: string;  // Mode
  c: string[];  // Recent commands (last 10)
  d: string[];  // Recent decisions (last 5)
  n?: string;  // Next suggested action
}

// Ultra-fast saves
class QuickSession {
  private readonly file = '.hodge/.session';

  async save(data: Partial<LightSession>) {
    const current = await this.load();
    const updated = { ...current, ...data, ts: Date.now() };
    await fs.writeFile(this.file, JSON.stringify(updated));
  }

  async load(): Promise<LightSession | null> {
    if (!existsSync(this.file)) return null;
    return JSON.parse(await fs.readFile(this.file, 'utf-8'));
  }
}
```

**Pros:**
- Super fast (<10ms saves)
- Minimal disk usage
- Easy to implement
- Git-friendly (single small file)

**Cons:**
- Limited context preserved
- No conversation history

### Approach 2.5: Hybrid with HODGE.md Enhancement
Combine lightweight checkpoints with enhanced HODGE.md
```typescript
// Minimal session file
interface HybridSession {
  feature: string;
  mode: HodgeMode;
  checkpoint: string;  // ISO timestamp
  summary: string;  // One-line summary of progress
}

// Enhanced HODGE.md generation
class EnhancedHodgeMDGenerator extends HodgeMDGenerator {
  async generateWithSession(session: HybridSession) {
    const base = await super.generate();

    // Add session section
    return `${base}

## Current Session
**Resumed**: ${session.checkpoint}
**Progress**: ${session.summary}
**Working on**: ${session.feature} (${session.mode} mode)

## AI Context Restoration
You were helping with ${session.feature}. ${session.summary}
Continue from where we left off.
`;
  }
}
```

**Pros:**
- Leverages existing HODGE.md system
- Minimal new infrastructure
- AI gets context through HODGE.md
- Works with all AI tools immediately

**Cons:**
- Limited to what fits in HODGE.md
- No detailed conversation history

### Approach 3: Git-Based Session Branches
Use git branches as session persistence
```typescript
class GitSessionManager {
  async checkpoint(feature: string) {
    // Create/update session branch
    await exec(`git checkout -b session/${feature}`);
    await exec(`git add .hodge/`);
    await exec(`git commit -m "Session checkpoint: ${new Date().toISOString()}"`);
  }

  async restore(feature: string) {
    // Check if session branch exists
    const branches = await exec('git branch -a');
    if (branches.includes(`session/${feature}`)) {
      await exec(`git checkout session/${feature}`);
      // Regenerate context from branch state
    }
  }

  async cleanup() {
    // Delete old session branches
    const branches = await exec('git branch | grep session/');
    for (const branch of branches.split('\n')) {
      const age = await this.getBranchAge(branch);
      if (age > 7 * 24 * 60 * 60 * 1000) { // 7 days
        await exec(`git branch -D ${branch}`);
      }
    }
  }
}
```

**Pros:**
- Full state preservation
- Natural versioning
- Can recover from any point
- Works with git workflow

**Cons:**
- Creates branch pollution
- Requires git operations
- May conflict with user's git workflow

## Recommendation

**Approach 2.5: Hybrid with HODGE.md Enhancement** seems best because:

1. **Minimal Complexity** - Builds on existing HODGE.md system
2. **Immediate Value** - Works with all AI tools today
3. **Fast Implementation** - Can ship in Phase 2 (1 day)
4. **Progressive Enhancement** - Can add more context over time
5. **Git-Friendly** - Single small session file + enhanced HODGE.md

### Implementation Plan
1. Create `.hodge/.session` file after each command
2. Enhance HODGE.md generation to include session context
3. Add "Continue session?" prompt to status command
4. Auto-cleanup sessions older than 7 days
5. Test with Claude Code, Cursor, Copilot

## Test Intentions
- [ ] Session saves after explore/build/harden/ship commands
- [ ] HODGE.md includes session context when present
- [ ] Status command prompts to continue session
- [ ] Old sessions auto-cleanup after 7 days
- [ ] Session survives terminal/editor restarts
- [ ] Works with ID management (HODGE-xxx features)
- [ ] Handles missing/corrupted session files gracefully

## Next Steps
Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building with Hybrid with HODGE.md Enhancement → `/build session-management`
d) Save progress → `/save`
e) Check status → `/status session-management`
f) Done for now

Enter your choice (a-f):

Note: Option (c) will use the recommended approach. Use option (a) to choose a different approach.