┌─────────────────────────────────────────────────────────┐
│ 🎯 Hodge: Session & Context Manager                    │
└─────────────────────────────────────────────────────────┘

## Purpose
Initialize or resume your Hodge development session with appropriate context.

**What this command does:**
- Loads context for your **last worked feature** (from session) or project overview
- Shows current state (exploration, decisions, build progress)
- Displays accurate mode for the feature you were working on
- Suggests possible next actions

**What this command does NOT do:**
- Does NOT automatically start building
- Does NOT run any development commands
- Does NOT make assumptions about what you want to do next
- Simply loads context and waits for your direction

**Note:** The `/hodge` command shows status for your last worked feature based on the active session. If you have a recent session for a feature, it will show that feature's accurate mode (e.g., "shipped", "build", etc.). If no session exists, it shows general project context.

## Usage Patterns
- `/hodge` - Load project context
- `/hodge {{feature}}` - Load context for specific feature

## Command Execution

### 1. Always Load Core Context First (ALL MODES)
```bash
# Load project HODGE.md (session info)
cat .hodge/HODGE.md

# Load complete standards
echo "=== PROJECT STANDARDS ==="
cat .hodge/standards.md

# Load all decisions
echo "=== PROJECT DECISIONS ==="
cat .hodge/decisions.md

# List available patterns
echo "=== AVAILABLE PATTERNS ==="
ls -la .hodge/patterns/
```

This provides core context for ALL modes:
- Current feature and mode (from HODGE.md)
- Complete standards (full file)
- All decisions (full file)
- Available patterns (list)

{{#if feature}}
### 2. Handle Feature Mode - Loading Feature-Specific Context

**IMPORTANT: This command ONLY loads context. It does not start any work.**

Load the project state and feature-specific context:
```bash
# Get current project status
hodge status

# Check for feature directory
ls -la .hodge/features/{{feature}}/ 2>/dev/null || echo "No feature directory yet"

# Load feature-specific context
hodge context --feature {{feature}}

# Load feature HODGE.md if it exists
echo "=== FEATURE CONTEXT ==="
cat .hodge/features/{{feature}}/HODGE.md 2>/dev/null || echo "No feature HODGE.md yet"
```

After loading context, these files are available:
- Feature HODGE.md: `.hodge/features/{{feature}}/HODGE.md` (if generated)
- Exploration: `.hodge/features/{{feature}}/explore/exploration.md`
- Decisions: `.hodge/features/{{feature}}/linked-decisions.md`
- Build plan: `.hodge/features/{{feature}}/build/build-plan.md`
- Test intentions: `.hodge/features/{{feature}}/explore/test-intentions.md`

**STOP HERE and present the context to the user.**

Based on what you find, present the current state:
- If exploration exists → "Exploration complete"
- If decision exists → "Decision made: [brief summary]"
- If build started → "Build in progress"
- If nothing exists → "No work started yet"

Then list available options WITHOUT taking action:
- "Continue with `/explore {{feature}}`" (if not explored)
- "Continue with `/build {{feature}}`" (if explored and decided)
- "Continue with `/harden {{feature}}`" (if built)
- "Review existing work at `.hodge/features/{{feature}}/`"

**Wait for explicit user direction before proceeding.**

{{else}}
### 2. Handle Standard Mode - Session Initialization

Load current project state:
```bash
hodge context
```

{{/if}}

## Core Principles
Before starting work, remember:
- **AI analyzes, backend executes** - You design, hodge implements
- **Complex data through files** - Use .hodge/tmp/ for structured data
- **Templates guide conversations** - Don't document hodge internals
- **Progressive development** - Explore freely, ship strictly

## Context Loaded

{{#if feature}}
### Working on: {{feature}}
Current mode: {{mode}}
Next suggested action: {{next_action}}

Available commands:
- `/explore {{feature}}` - Continue exploration
- `/build {{feature}}` - Start/continue building
- `/decide` - Record decisions

{{else}}
### Available Commands
- `/explore {{feature}}` - Start exploring a new feature
- `/build {{feature}}` - Build a feature with standards
- `/decide {{decision}}` - Record a decision
- `/ship {{feature}}` - Ship feature to production
- `/status` - Check current status
- `/review` - Review current work

### Quick Actions
{{#if current_feature}}
Continue with {{current_feature}}:
- Next: {{suggested_next_command}}
{{else}}
Start with:
- `/explore {{new_feature}}` for new work
{{/if}}

{{/if}}

## Session Best Practices

1. **Start each session with `/hodge`** to load context
2. **Run `/hodge {{feature}}`** when switching features
3. **Check `/status`** to see current progress

## Implementation Note

The `/hodge` command coordinates with the Hodge CLI to:
- Generate fresh context via `hodge status`
- Load feature-specific files from `.hodge/features/`
- Ensure principles and standards are available

┌─────────────────────────────────────────────────────────┐
│ 🎯 Hodge: Context Loading Complete                     │
└─────────────────────────────────────────────────────────┘

**This command has finished loading context. No actions have been taken.**

💬 Your response: