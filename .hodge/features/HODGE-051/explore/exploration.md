# HODGE-051: AI-Executable Slash Commands

## Feature Overview
Make Claude Code slash commands AI-executable and portable across different AI-assisted development tools (Continue.dev, Cursor, Warp, etc.) through a command orchestration protocol.

## Problem Statement
Currently, slash commands are:
- User-initiated only (AI can't execute them)
- Claude Code specific (not portable)
- One-directional (user → AI, not AI → command → AI)

This limits the ability to create fully automated workflows where the AI can chain commands together based on context and user choices.

## ai-executable-commands Exploration

### Approach 1: Command Orchestration Protocol
The user's proposed approach where hodge CLI orchestrates AI behavior through prompts.

#### Implementation Sketch
```typescript
// 1. Commands are pre-loaded as context
interface CommandTemplate {
  name: string;
  markdown: string;
  triggers: string[];
}

// 2. Hodge CLI returns orchestration prompts
class CommandOrchestrator {
  async execute(command: string, args: string[]): Promise<OrchestratorResponse> {
    // Analyze current state
    const context = await this.gatherContext();

    // Return prompt telling AI what to do
    return {
      prompt: `Execute the pre-loaded '${command}' template with context:`,
      context,
      nextTemplate: 'ship', // Which pre-loaded template to use
      continueWith: 'hodge ship --continue' // Next CLI command to run
    };
  }
}

// 3. AI executes based on orchestration
// User: selects option "a"
// AI: runs `hodge ship session-management`
// CLI: returns "Execute the ship template"
// AI: follows pre-loaded ship.md template
// Template: includes `hodge ship --continue`
// CLI: returns next orchestration step
// ... loop continues
```

#### Pros
- **Tool-agnostic**: Works with any AI that can read markdown and execute commands
- **Bidirectional**: AI ↔ CLI communication loop
- **Composable**: Commands can chain together
- **Contextual**: CLI can adapt based on state
- **No hardcoding**: AI behavior defined in markdown, not code

#### Cons
- **Complex state management**: Need to track where we are in the flow
- **Error recovery**: What if the loop breaks?
- **AI variance**: Different AIs might interpret prompts differently

### Approach 2: State Machine with Markdown Templates
Formalize the command flow as a state machine where markdown templates define transitions.

#### Implementation Sketch
```typescript
// State machine definition in markdown
interface CommandState {
  state: string;
  template: string;
  transitions: {
    trigger: string;
    nextState: string;
    action: string;
  }[];
}

// Templates include state markers
/*
## SHIP_START
Execute: `hodge ship {{feature}}`
On success: → SHIP_REVIEW
On failure: → SHIP_ERROR

## SHIP_REVIEW
Review commit message...
Execute: `hodge ship --continue`
On confirm: → SHIP_COMMIT
On cancel: → SHIP_CANCEL
*/

// CLI manages state transitions
class StateMachineOrchestrator {
  async handleCommand(command: string): Promise<StateResponse> {
    const currentState = await this.loadState();
    const template = this.templates[currentState];

    return {
      executeTemplate: template,
      currentState,
      availableTransitions: this.getTransitions(currentState)
    };
  }
}
```

#### Pros
- **Predictable flow**: State machine ensures consistent behavior
- **Visual debugging**: Can visualize command flows
- **Resumable**: Can save and restore state
- **Testable**: State transitions are deterministic

#### Cons
- **Rigid structure**: Less flexible than free-form orchestration
- **More complex templates**: Need state markers and transitions
- **Learning curve**: Developers need to understand state machines

### Approach 3: Template Injection Protocol
CLI injects executable markdown directly into the conversation.

#### Implementation Sketch
```typescript
// CLI returns markdown that AI should "execute"
class TemplateInjector {
  async handleCommand(command: string, args: string[]): Promise<string> {
    const template = await this.loadTemplate(command);
    const context = await this.gatherContext();

    // Return markdown that AI will interpret as instructions
    return `
# EXECUTE THIS TEMPLATE NOW

${this.interpolate(template, context)}

## Your next action:
Run: \`hodge ${command} --step-2\`
    `;
  }
}

// AI sees the markdown and follows it
// No need for pre-loading, CLI provides everything
```

#### Pros
- **Simple implementation**: Just return markdown
- **Self-contained**: Each response has everything needed
- **Easy debugging**: Can see exact instructions
- **Progressive enhancement**: Can start simple, add complexity

#### Cons
- **Context size**: Injecting full templates uses tokens
- **No pre-validation**: Templates aren't checked until runtime
- **Repetition**: Same templates injected repeatedly

## Recommendation

**Approach 1: Command Orchestration Protocol** (the user's proposed approach) is the best because:

1. **Maximum portability** - Works with any AI tool that can execute commands
2. **Elegant abstraction** - Clean separation between orchestration (TypeScript) and behavior (markdown)
3. **Progressive complexity** - Can start simple and add features
4. **Maintains slash command paradigm** - Familiar to users
5. **Enables true automation** - AI can chain commands based on context

### Implementation Plan

#### Phase 1: Foundation
1. Create `CommandOrchestrator` class in hodge
2. Add `--orchestrate` flag to commands
3. Return structured prompts instead of console output

#### Phase 2: Template Loading
1. Convert `.claude/commands/*.md` to universal format
2. Create template loader that works across tools
3. Add template validation

#### Phase 3: Bidirectional Flow
1. Add state tracking between calls
2. Implement `--continue` pattern for multi-step flows
3. Add error recovery

#### Phase 4: Tool Adapters
1. Create adapters for Cursor, Continue.dev, etc.
2. Test across different AI environments
3. Document tool-specific quirks

## Test Intentions
- [ ] Orchestrator returns correct prompts
- [ ] Templates load properly across tools
- [ ] State persists between command calls
- [ ] Error states handled gracefully
- [ ] Commands chain correctly
- [ ] Works in Claude Code, Cursor, Continue.dev

## Technical Considerations

### State Management
```typescript
// Where to store orchestration state?
interface OrchestrationState {
  sessionId: string;
  currentCommand: string;
  step: number;
  context: Record<string, unknown>;
  history: string[];
}

// Option 1: File-based (like session-manager)
// Option 2: In-memory with TTL
// Option 3: Environment variables
```

### Cross-Tool Compatibility
```typescript
// How to detect which AI tool is running?
enum AITool {
  ClaudeCode = 'claude-code',
  Cursor = 'cursor',
  Continue = 'continue',
  Warp = 'warp',
  Unknown = 'unknown'
}

// Tool detection strategies:
// 1. Environment variables
// 2. Process name
// 3. Specific file markers
// 4. User configuration
```

### Template Format
```typescript
// Universal template format
interface UniversalTemplate {
  meta: {
    command: string;
    version: string;
    tools: string[]; // Which tools support this
  };
  sections: {
    trigger: string; // When to use this template
    context: string; // What context is needed
    instructions: string; // What the AI should do
    continuation: string; // Next step in flow
  };
}
```

## Next Steps
Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building with Command Orchestration Protocol → `/build HODGE-051`
d) Save progress → `/save`
e) Check status → `/status HODGE-051`
f) Done for now

Enter your choice (a-f):

Note: Option (c) will use the recommended approach. Use option (a) to choose a different approach.