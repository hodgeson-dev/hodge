# Pattern: Progressive Enhancement for Multi-Environment Commands

## Pattern Overview
Commands should detect their execution environment and provide the best possible UX for that environment, with graceful fallbacks ensuring universal compatibility.

## Core Principles

### 1. Environment Detection Hierarchy
```typescript
// Detection order (most specific to least)
1. Claude Code (.claude/ directory)
2. Aider (AIDER_CHAT_HISTORY_FILE)
3. Continue.dev (CONTINUE_WORKSPACE)
4. Cursor (CURSOR_WORKSPACE)
5. Warp (TERM_PROGRAM=WarpTerminal)
6. TTY Terminal (process.stdin.isTTY)
7. Non-interactive fallback
```

### 2. Progressive Enhancement Levels

#### Level 0: Base Functionality (Always Works)
- File-based interaction
- Clear console output
- Command flags for automation
- JSON state persistence

#### Level 1: Interactive Terminal (TTY)
- Readline prompts
- Colored output
- Progress indicators
- Inline editing

#### Level 2: Environment-Specific Features
- **Claude Code**: Rich markdown UI
- **Warp**: Workflow integration
- **Aider**: Git cooperation
- **Cursor**: AI enhancement
- **Continue**: VS Code hints

#### Level 3: Premium Features
- AI-powered suggestions
- Visual diffs
- Multi-step wizards
- Context persistence

## Implementation Pattern

### 1. Command Structure
```typescript
class ProgressiveCommand {
  private env: Environment;
  private capabilities: Capabilities;

  constructor() {
    this.env = new EnvironmentDetector().detect();
    this.capabilities = this.env.capabilities;
  }

  async execute(args: CommandArgs): Promise<void> {
    // Level 0: Always prepare state files
    await this.prepareStateFiles(args);

    // Level 1-3: Progressive enhancement
    if (this.env.isClaudeCode) {
      return this.executeClaudeMode(args);
    } else if (this.capabilities.interactive) {
      return this.executeInteractiveMode(args);
    } else {
      return this.executeFileMode(args);
    }
  }
}
```

### 2. State Management Protocol
```
.hodge/temp/<command>-interaction/
├── state.json         # Current state and metadata
├── input.txt          # User input/selections
├── output.txt         # Generated content
├── context.json       # Additional context
└── history.jsonl      # Interaction history
```

### 3. Claude Code Markdown Integration
```markdown
# Enhanced Command Pattern

1. Portable command generates state files
2. Markdown reads and displays rich UI
3. User interacts through markdown
4. Markdown calls portable command with flags
5. Portable command reads state and executes

Key: The markdown IS the UI, not just a launcher
```

## Environment-Specific Strategies

### Claude Code
- **Strategy**: Rich markdown UI
- **Implementation**:
  - Generate state files
  - Markdown provides interactive UI
  - File-based communication
- **Advantages**: Best documentation, all options visible, persistent context

### Warp
- **Strategy**: Native features + workflows
- **Implementation**:
  - Use readline for prompts
  - Support workflow YAML
  - Leverage Warp AI
- **Advantages**: Reusable workflows, fast iteration

### Aider
- **Strategy**: Cooperative integration
- **Implementation**:
  - Detect Aider environment
  - Offer cooperation modes
  - Respect Aider's git flow
- **Advantages**: No conflicts, enhanced messages

### Continue.dev
- **Strategy**: File-based with hints
- **Implementation**:
  - Use file-based interaction
  - Provide VS Code tips
  - Future: VS Code extension
- **Advantages**: Works despite limitations

### Cursor
- **Strategy**: AI enhancement
- **Implementation**:
  - Full interactive mode
  - Offer AI improvements
  - Leverage Cursor features
- **Advantages**: Best-in-class AI assistance

## Universal Flags Pattern

All commands should support:
```bash
--no-interactive    # Skip all prompts
--yes, -y           # Accept all defaults
--edit              # Force editor mode
--dry-run           # Preview without executing
--format <format>   # Output format (json, text, markdown)
--quiet, -q         # Minimal output
--verbose, -v       # Detailed output
--debug             # Show environment detection
```

## Testing Strategy

### 1. Environment Simulation
```typescript
// Test with mocked environments
process.env.CLAUDE_WORKSPACE = 'true';
process.stdin.isTTY = false;
```

### 2. Capability Matrix Testing
Test each combination:
- Environment × Capability × Flag

### 3. Fallback Chain Testing
Ensure graceful degradation when features unavailable

## Documentation Pattern

Each command should document:
1. Default behavior per environment
2. Available flags
3. Environment-specific features
4. Fallback behaviors
5. Configuration options

## Configuration Schema
```json
{
  "commands": {
    "<command>": {
      "interactive": "always" | "never" | "auto",
      "environment": "detect" | "force:<env>",
      "features": {
        "ai": boolean,
        "workflows": boolean,
        "markdown": boolean
      }
    }
  }
}
```

## Success Metrics

1. **Universal Compatibility**: Works in 100% of environments
2. **Optimal UX**: Each environment uses its best features
3. **Graceful Degradation**: Never breaks, always has fallback
4. **User Control**: Flags override automatic detection
5. **Future-Proof**: New environments easy to add

## Anti-Patterns to Avoid

❌ **Don't**:
- Assume TTY availability
- Hard-code environment checks
- Break on unknown environments
- Ignore user preferences
- Create environment-specific commands

✅ **Do**:
- Always have file-based fallback
- Detect capabilities, not just environment
- Respect user configuration
- Document environment differences
- Test all fallback paths

## Migration Guide for Existing Commands

1. Add environment detection
2. Identify interactive elements
3. Create file-based alternative
4. Add progressive enhancement
5. Test across environments
6. Document behaviors

## Related Patterns
- [Interactive Claude Markdown Commands](./interactive-claude-markdown.md)
- [File-Based State Protocol](./file-state-protocol.md)
- [Universal Command Flags](./universal-flags.md)