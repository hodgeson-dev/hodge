# AI Tool Integration Setup Exploration

## Feature Overview
Enable `hodge init` to detect AI-assisted development tools (Claude Code, Warp, Aider, Cursor, Continue.dev) and offer to install appropriate integrations.

## Current State
- We already detect Claude Code (checks for CLAUDE.md)
- No integration installation offered
- Other AI tools not detected

## Approach 1: Minimal Claude-Only Integration

### Implementation
```typescript
// In detection.ts
interface DetectedTools {
  // ... existing fields
  hasClaudeCode: boolean;
  aiDevTools: {
    claude?: boolean;
    cursor?: boolean;
    aider?: boolean;
    warp?: boolean;
    continue?: boolean;
  };
}

// In init.ts - After detection
if (projectInfo.detectedTools.hasClaudeCode && !hasHodgeClaudeIntegration()) {
  const installIntegration = await confirm(
    'Claude Code detected. Install Hodge integration for better AI assistance?'
  );

  if (installIntegration) {
    await installClaudeIntegration(hodgePath);
  }
}
```

### What the integration would install:
- `.hodge/integrations/claude/README.md` - Instructions for Claude
- `.hodge/integrations/claude/context-builder.md` - How to use Hodge context
- Append to existing CLAUDE.md: Reference to Hodge integration

### Pros
- Simple, focused on what we have (Claude)
- Non-invasive (just documentation)
- Quick to implement

### Cons
- Limited to Claude only
- Doesn't handle other tools yet
- Manual process for other tools

---

## Approach 2: Extensible Multi-Tool Detection

### Implementation
```typescript
// New file: src/lib/ai-tool-detector.ts
export class AIToolDetector {
  private detectors = {
    claude: () => this.detectClaude(),
    cursor: () => this.detectCursor(),
    aider: () => this.detectAider(),
    warp: () => this.detectWarp(),
    continue: () => this.detectContinue(),
  };

  async detectAITools(): Promise<AIToolsInfo> {
    const detected = await Promise.all(
      Object.entries(this.detectors).map(async ([name, detector]) => ({
        name,
        detected: await detector(),
      }))
    );

    return {
      tools: detected.filter(t => t.detected).map(t => t.name),
      primary: this.determinePrimaryTool(detected),
    };
  }

  private async detectClaude(): Promise<boolean> {
    return fs.pathExists('CLAUDE.md') ||
           !!process.env.CLAUDE_PROJECT;
  }

  private async detectCursor(): Promise<boolean> {
    return fs.pathExists('.cursor/') ||
           fs.pathExists('.cursorignore');
  }

  private async detectAider(): Promise<boolean> {
    return fs.pathExists('.aider/') ||
           fs.pathExists('.aiderignore');
  }

  // ... other detectors
}
```

### Integration Installation
```typescript
// In init command
const aiTools = await new AIToolDetector().detectAITools();

if (aiTools.tools.length > 0) {
  console.log(chalk.yellow('\n🤖 AI Development Tools Detected:'));
  aiTools.tools.forEach(tool => {
    console.log(`   • ${tool}`);
  });

  const shouldInstall = await confirm(
    'Would you like to install Hodge integrations for better AI assistance?'
  );

  if (shouldInstall) {
    for (const tool of aiTools.tools) {
      await installIntegration(tool, hodgePath);
    }
  }
}
```

### Pros
- Detects multiple tools
- Extensible architecture
- Can prioritize primary tool
- Future-proof

### Cons
- More complex
- Need research on each tool's conventions
- More testing required

---

## Approach 3: Plugin-Based Integration System

### Implementation
```typescript
// Integration plugin interface
interface AIIntegration {
  name: string;
  detect(): Promise<boolean>;
  install(hodgePath: string): Promise<void>;
  configure(options: IntegrationOptions): Promise<void>;
}

// Claude integration plugin
class ClaudeIntegration implements AIIntegration {
  name = 'Claude Code';

  async detect(): Promise<boolean> {
    return fs.pathExists('CLAUDE.md');
  }

  async install(hodgePath: string): Promise<void> {
    // Create integration files
    await this.createContextHelper(hodgePath);
    await this.updateClaudeMd();
    await this.createSlashCommands(hodgePath);
  }

  private async createSlashCommands(hodgePath: string): Promise<void> {
    const commands = `
# Hodge Slash Commands for Claude

## /hodge-explore <feature>
Explore a new feature with Hodge guidance

## /hodge-build
Build the explored feature following standards

## /hodge-ship
Ship the feature with git integration
    `;

    await fs.writeFile(
      path.join(hodgePath, 'integrations/claude/commands.md'),
      commands
    );
  }
}

// Registry
class IntegrationRegistry {
  private integrations: AIIntegration[] = [
    new ClaudeIntegration(),
    // new CursorIntegration(),
    // new AiderIntegration(),
  ];

  async detectAndInstall(): Promise<void> {
    const detected = await this.detectAll();
    if (detected.length > 0) {
      await this.promptForInstallation(detected);
    }
  }
}
```

### Pros
- Most flexible and maintainable
- Each integration self-contained
- Easy to add new tools
- Can provide tool-specific features

### Cons
- Most complex to implement
- Requires plugin architecture
- Might be over-engineering for now

---

## Recommendation

**Start with Approach 1** (Minimal Claude-Only Integration) because:
1. We already have Claude detection working
2. It's the only tool we have real integration ideas for
3. Quick to implement and test
4. Can evolve to Approach 2 later

The integration should:
1. Only trigger if CLAUDE.md exists but Hodge integration isn't installed
2. Be optional (user can decline)
3. Add helpful context about using Hodge with Claude
4. Not modify existing CLAUDE.md content (just append a reference)

## Implementation Plan

### Phase 1: Claude Integration (Approach 1)
1. Add `hasHodgeClaudeIntegration()` check
2. Create integration installer
3. Generate Claude-specific helpers:
   - How to use `.hodge/` context
   - Suggested workflow with Hodge commands
   - Custom instructions for Claude

### Phase 2: Extend to Other Tools (Future)
1. Implement Approach 2's detector system
2. Add Cursor detection (`.cursor/` directory)
3. Add Aider detection (`.aider/` directory)
4. Create minimal integrations for each

## Next Steps

Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring integration details
c) Start building immediately → `/build ai-tool-integration`
d) Save progress and switch context → `/save`
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):