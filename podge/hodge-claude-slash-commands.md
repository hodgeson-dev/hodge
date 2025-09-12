# Hodge Claude Code Slash Commands

## Overview: Never Leave Claude Code

Instead of jumping between `hodge` CLI and Claude Code, integrate Hodge directly into Claude Code through custom slash commands. This creates a fluid, conversational development experience where mode switching, pattern learning, and decision recording happen naturally within your AI conversation.

## Core Slash Commands

### Mode Commands
```
/explore <topic>        # Switch to exploration mode
/ship <feature>         # Switch to ship mode with standards enforcement
/mode                   # Show current mode
```

### Decision & Learning Commands
```
/decide <decision>      # Record a one-line decision
/learn                  # Extract patterns from recent code
/pattern save <name>    # Save current code as a pattern
/pattern use <name>     # Apply a saved pattern
```

### Context Commands
```
/context                # Show current context
/standards              # Show active standards
/standards on|off       # Toggle standards enforcement
/decisions              # Show project decisions
```

### Workflow Commands
```
/commit <message>       # Commit with Hodge-formatted message
/pr                     # Create PR with context
/review                 # Review current changes
/test                   # Generate tests for current code
```

## Implementation

### 1. Claude Code Configuration File

Create `.claude/commands.json` in your project:

```json
{
  "commands": {
    "explore": {
      "description": "Switch to exploration mode",
      "handler": "hodge-explore",
      "args": ["topic"],
      "updateContext": true
    },
    "ship": {
      "description": "Switch to ship mode with standards",
      "handler": "hodge-ship",
      "args": ["feature"],
      "updateContext": true
    },
    "decide": {
      "description": "Record a project decision",
      "handler": "hodge-decide",
      "args": ["decision"],
      "silent": true
    },
    "learn": {
      "description": "Learn patterns from current code",
      "handler": "hodge-learn",
      "interactive": true
    },
    "pattern": {
      "description": "Pattern management",
      "subcommands": {
        "save": {
          "handler": "hodge-pattern-save",
          "args": ["name"]
        },
        "use": {
          "handler": "hodge-pattern-use",
          "args": ["name"]
        },
        "list": {
          "handler": "hodge-pattern-list"
        }
      }
    }
  }
}
```

### 2. Command Handlers

Create `.claude/handlers/` directory with handler scripts:

#### hodge-explore.js
```javascript
#!/usr/bin/env node
import { updateClaudeContext, setMode } from '@agileexplorations/hodge/claude';

export async function handler({ topic }) {
  // Switch to exploration mode
  await setMode('explore');
  
  // Update Claude's context
  const context = await updateClaudeContext({
    mode: 'explore',
    topic,
    message: `
Switched to EXPLORATION mode for: ${topic}

You should now:
- Suggest multiple approaches
- Allow experimentation
- Standards are suggestions only
- Focus on learning and discovery
    `
  });
  
  return context;
}
```

#### hodge-ship.js
```javascript
#!/usr/bin/env node
import { updateClaudeContext, setMode, getStandards } from '@agileexplorations/hodge/claude';

export async function handler({ feature }) {
  // Switch to ship mode
  await setMode('ship');
  
  // Load enforced standards
  const standards = await getStandards();
  
  // Update Claude's context
  const context = await updateClaudeContext({
    mode: 'ship',
    feature,
    message: `
Switched to SHIP mode for: ${feature}

REQUIREMENTS:
- All standards MUST be followed
- Use established patterns
- Include comprehensive tests
- Production quality required

Active Standards:
${standards.map(s => `- ${s.name}`).join('\n')}
    `
  });
  
  return context;
}
```

#### hodge-decide.js
```javascript
#!/usr/bin/env node
import { recordDecision } from '@agileexplorations/hodge/claude';

export async function handler({ decision }) {
  await recordDecision(decision);
  
  return {
    success: true,
    message: `✓ Decision recorded: ${decision}`,
    updateContext: true
  };
}
```

#### hodge-learn.js
```javascript
#!/usr/bin/env node
import { extractPatterns, getCurrentCode } from '@agileexplorations/hodge/claude';

export async function handler() {
  // Get code from current Claude Code session
  const currentCode = await getCurrentCode();
  
  // Extract patterns
  const patterns = await extractPatterns(currentCode);
  
  if (patterns.length === 0) {
    return { message: 'No patterns found in current code' };
  }
  
  // Interactive selection
  return {
    type: 'interactive',
    patterns,
    prompt: 'Which patterns would you like to save?'
  };
}
```

### 3. Claude Code Plugin

Create a Claude Code plugin that intercepts slash commands:

```javascript
// .claude/plugin.js
class HodgePlugin {
  constructor() {
    this.mode = 'explore';
    this.context = {};
    this.standards = [];
    this.patterns = [];
    this.decisions = [];
  }
  
  async onCommand(command, args) {
    switch (command) {
      case 'explore':
        return this.switchToExplore(args);
      case 'ship':
        return this.switchToShip(args);
      case 'decide':
        return this.recordDecision(args);
      case 'learn':
        return this.learnPatterns();
      case 'pattern':
        return this.handlePattern(args);
      case 'test':
        return this.generateTests();
      case 'review':
        return this.reviewCode();
      default:
        return null;
    }
  }
  
  async switchToExplore(topic) {
    this.mode = 'explore';
    
    // Update system prompt
    await this.updateSystemPrompt(`
You are in EXPLORATION mode for: ${topic}

Guidelines:
- Suggest multiple approaches
- Standards are suggestions only
- Encourage experimentation
- Focus on learning

Available patterns: ${this.patterns.length}
Project decisions: ${this.decisions.length}
    `);
    
    return `🔍 Switched to exploration mode: ${topic}`;
  }
  
  async switchToShip(feature) {
    this.mode = 'ship';
    
    // Load and enforce standards
    this.standards = await this.loadStandards();
    
    await this.updateSystemPrompt(`
You are in SHIP mode for: ${feature}

STRICT REQUIREMENTS:
${this.standards.map(s => `- ${s.name}: ${s.rules.join(', ')}`).join('\n')}

All code MUST:
- Follow ALL standards
- Use established patterns
- Include tests
- Be production-ready
    `);
    
    return `🚀 Switched to ship mode: ${feature}`;
  }
  
  async recordDecision(decision) {
    // Append to decisions file
    const date = new Date().toISOString().split('T')[0];
    const decisionLine = `- ${date}: ${decision}`;
    
    await this.appendToFile('.hodge/decisions.md', decisionLine);
    this.decisions.push(decision);
    
    // Update context
    await this.updateSystemPrompt(null, {
      addDecision: decision
    });
    
    return `✓ Decision recorded: ${decision}`;
  }
  
  async learnPatterns() {
    // Analyze current buffer/recent changes
    const code = await this.getCurrentCode();
    const patterns = await this.extractPatterns(code);
    
    if (patterns.length === 0) {
      return 'No repeated patterns found';
    }
    
    // Show patterns and ask which to save
    const message = patterns.map((p, i) => 
      `${i + 1}. ${p.name} (found ${p.occurrences} times)`
    ).join('\n');
    
    return `Found patterns:\n${message}\n\nUse /pattern save <number> to save`;
  }
  
  async handlePattern(args) {
    const [subcommand, ...params] = args;
    
    switch (subcommand) {
      case 'save':
        return this.savePattern(params[0]);
      case 'use':
        return this.usePattern(params[0]);
      case 'list':
        return this.listPatterns();
    }
  }
  
  async generateTests() {
    // Get current code context
    const code = await this.getCurrentCode();
    
    // Generate test prompt
    await this.injectPrompt(`
Generate comprehensive tests for this code:

\`\`\`
${code}
\`\`\`

Follow the project's test patterns and achieve >80% coverage.
    `);
    
    return '🧪 Generating tests...';
  }
  
  async reviewCode() {
    const code = await this.getCurrentCode();
    
    if (this.mode === 'ship') {
      // Strict review
      await this.injectPrompt(`
Review this code for production readiness:

\`\`\`
${code}
\`\`\`

Check STRICTLY against:
${this.standards.map(s => `- ${s.name}`).join('\n')}

Any violations must be fixed.
      `);
    } else {
      // Gentle review
      await this.injectPrompt(`
Review this exploration code:

\`\`\`
${code}
\`\`\`

Suggest improvements but remember this is exploration.
      `);
    }
    
    return '🔍 Reviewing code...';
  }
}

// Register plugin
export default HodgePlugin;
```

### 4. Seamless Workflow Examples

#### Example 1: Exploring Authentication
```bash
# In Claude Code terminal
> /explore authentication options

🔍 Switched to exploration mode: authentication options

Claude: I'll explore three authentication approaches for you:

1. **NextAuth.js** - Full-featured auth solution...
2. **Clerk** - Managed auth service...
3. **Custom JWT** - Roll your own...

[Claude generates exploratory code]

> This Clerk approach looks good. Let me try it out.
> /decide "Using Clerk for auth - better DX than NextAuth"

✓ Decision recorded: Using Clerk for auth - better DX than NextAuth

> /ship user authentication

🚀 Switched to ship mode: user authentication

Claude: I'll implement user authentication with Clerk, following all standards:
[Claude now generates production-quality code with tests]
```

#### Example 2: Learning and Reusing Patterns
```bash
# After shipping a feature
> /learn

Found patterns:
1. API Route with Error Handling (found 3 times)
2. Form Component with Validation (found 2 times)

> /pattern save 1

✓ Pattern saved: API Route with Error Handling

# Later, in a new feature
> /ship payment processing
> /pattern use "API Route"

Claude: I'll implement payment processing using your API Route pattern:
[Claude generates code following the exact pattern]
```

#### Example 3: Mid-Conversation Mode Switch
```bash
> Can we add real-time notifications?

Claude: Let me explore some approaches for real-time notifications...

> /explore real-time notifications

🔍 Switched to exploration mode: real-time notifications

Claude: Now I can explore more freely. Here are three approaches:
1. WebSockets with Socket.io...
2. Server-Sent Events...
3. Pusher/Ably (managed)...

> Let's prototype Pusher
[Claude generates experimental code]

> This works great! /decide "Pusher for real-time - simpler than WebSockets"
> /ship real-time notifications

🚀 Switched to ship mode: real-time notifications

Claude: I'll now implement production-ready Pusher integration:
[Claude switches to strict standards mode]
```

### 5. Advanced Commands

#### Context-Aware Commands
```bash
/context full          # Show complete context
/context reset         # Reset to defaults
/context add <file>    # Add file to context
/context remove <file> # Remove file from context
```

#### Git Integration
```bash
/commit               # Commit with mode-aware message
/branch              # Create appropriate branch
/pr                  # Create PR with Hodge context
```

#### Standards Management
```bash
/standards            # List active standards
/standards check      # Validate current code
/standards learn      # Learn standards from code
/standards strict     # Maximum enforcement
/standards loose      # Minimum enforcement
```

#### Pattern Commands
```bash
/pattern match        # Find similar patterns
/pattern apply <name> # Apply pattern to selection
/pattern from <file>  # Learn pattern from file
```

### 6. Configuration Options

In `hodge.json`:
```json
{
  "claude": {
    "slashCommands": true,
    "autoMode": true,
    "shortcuts": {
      "/e": "/explore",
      "/s": "/ship",
      "/d": "/decide",
      "/l": "/learn",
      "/t": "/test"
    },
    "defaultMode": "explore",
    "autoLearn": {
      "enabled": true,
      "threshold": 2,
      "afterShip": true
    },
    "contextPersistence": {
      "enabled": true,
      "file": ".claude/context.json"
    }
  }
}
```

## Benefits

### 1. **Never Leave Claude Code**
Everything happens in one terminal - no context switching.

### 2. **Natural Conversation Flow**
Mode switches feel natural within the conversation.

### 3. **Immediate Context Updates**
Claude instantly knows when you switch modes or make decisions.

### 4. **Faster Development**
No need to prepare context files or copy/paste.

### 5. **Better Learning**
Patterns are learned from actual conversation output.

### 6. **Team Consistency**
Everyone uses the same commands and workflow.

## Implementation Path

### Phase 1: Basic Commands
- `/explore` and `/ship` mode switching
- `/decide` for recording decisions
- Basic context management

### Phase 2: Pattern Learning
- `/learn` from current session
- `/pattern` save and use
- Pattern matching

### Phase 3: Advanced Integration
- Git commands
- PR creation with context
- Team synchronization

### Phase 4: AI Enhancement
- Claude suggests when to switch modes
- Automatic pattern detection
- Proactive standards checking

## The Vision

Imagine never leaving Claude Code:

```bash
# Morning standup
> What should I work on today?

Claude: Based on your team's board, you have "Add user invitations" assigned. Shall I help you explore approaches?

> /explore user invitations

Claude: I'll explore some approaches...

[Work through exploration]

> /decide "Email magic links for invitations"
> /ship user invitations

[Claude ships with standards]

> /test

[Claude generates tests]

> /commit -m "Add user invitations with magic links"
> /pr

Claude: Created PR #124 with full context. Ready for review!

> /learn

Claude: I found a new "Email Service" pattern. Save it?

> Yes

Claude: Pattern saved. You now have 12 reusable patterns.
```

This creates a truly integrated AI development experience where Hodge becomes invisible infrastructure that enhances Claude Code rather than a separate tool you have to remember to use.