# Hodge - Session & Context Manager

## Purpose
Initialize or resume your Hodge development session with appropriate context.

**What this command does:**
- Loads existing context for a feature or project
- Shows current state (exploration, decisions, build progress)
- Suggests possible next actions

**What this command does NOT do:**
- Does NOT automatically start building
- Does NOT run any development commands
- Does NOT make assumptions about what you want to do next
- Simply loads context and waits for your direction

## Usage Patterns
- `/hodge` - Load project context and offer recent saves
- `/hodge {{feature}}` - Load context for specific feature
- `/hodge --recent` - Auto-load most recent save
- `/hodge --list` - Show all available saved contexts

## Command Execution

{{#if list}}
### Available Saved Sessions
```bash
hodge context --list
```

This shows all saved sessions with details.

{{else if recent}}
### Loading Most Recent Session
```bash
hodge context --recent
```

This loads the most recent save and displays the context for resuming work.

{{else if feature}}
### Loading Feature-Specific Context

**IMPORTANT: This command ONLY loads context. It does not start any work.**

First, load the project context:
```bash
hodge status
```

Then load feature-specific and global context:
```bash
# 1. Check for feature directory
ls -la .hodge/features/{{feature}}/ 2>/dev/null || echo "No feature directory yet"

# 2. Load feature-specific context
hodge context --feature {{feature}}

# 3. Load feature HODGE.md if it exists
echo "=== FEATURE CONTEXT ==="
cat .hodge/features/{{feature}}/HODGE.md 2>/dev/null || echo "No feature HODGE.md yet"

# 4. Load global context files
echo "=== PROJECT STANDARDS ==="
cat .hodge/standards.md

echo "=== PROJECT DECISIONS ==="
cat .hodge/decisions.md

echo "=== AVAILABLE PATTERNS ==="
ls -1 .hodge/patterns/*.md 2>/dev/null | xargs -I {} basename {} .md
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
### Standard Session Initialization

1. **Load Current Project State**
   ```bash
   hodge context
   ```

2. **Load Full Context Files**
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

   This provides:
   - Current feature and mode (from HODGE.md)
   - Complete standards (full file)
   - All decisions (full file)
   - Available patterns (list)

2. **Check for Recent Saves**

   The context command will automatically discover and display recent saves.

   Found saved sessions:
   {{#each saves}}
   **{{name}}**
   - Feature: {{feature}}
   - Mode: {{mode}}
   - Saved: {{timestamp}}
   - Summary: {{summary}}
   {{/each}}

3. **Restoration Options**

   {{#if saves}}
   Would you like to:
   a) Restore most recent: "{{most_recent_save}}"
   b) Choose a different save
   c) Start fresh without restoring
   d) View more details about saves

   Your choice:
   {{else}}
   No saved sessions found. Starting fresh.
   {{/if}}

{{/if}}

## Core Principles
Before starting work, remember:
- **AI analyzes, backend executes** - You design, hodge implements
- **Complex data through files** - Use .hodge/tmp/ for structured data
- **Templates guide conversations** - Don't document hodge internals
- **Preserve context** - Spec files and saves are documentation, not trash
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
- `/save` - Save current progress

{{else}}
### Available Commands
- `/explore {{feature}}` - Start exploring a new feature
- `/build {{feature}}` - Build a feature with standards
- `/decide {{decision}}` - Record a decision
- `/ship {{feature}}` - Ship feature to production
- `/status` - Check current status
- `/save {{name}}` - Save session context
- `/review` - Review current work

### Quick Actions
{{#if current_feature}}
Continue with {{current_feature}}:
- Next: {{suggested_next_command}}
{{else}}
Start with:
- `/explore {{new_feature}}` for new work
- `/hodge --list` to see saved sessions
{{/if}}

{{/if}}

## Session Best Practices

1. **Start each session with `/hodge`** to load context
2. **Use `/save` before breaks** to preserve progress
3. **Run `/hodge {{feature}}`** when switching features
4. **Check `/hodge --list`** if you've lost track

## Implementation Note

The `/hodge` command coordinates with the Hodge CLI to:
- Generate fresh context via `hodge status`
- Discover saved sessions in `.hodge/saves/`
- Load feature-specific files from `.hodge/features/`
- Ensure principles and standards are available

## Context Loading Complete

**This command has finished loading context. No actions have been taken.**

What would you like to do next?