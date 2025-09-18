# Hodge - Session & Context Manager

## Purpose
Initialize or resume your Hodge development session with appropriate context.

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

First, load the project context:
```bash
hodge status
```

Review `.hodge/HODGE.md` for current project state.

Then check for feature-specific saves:
```bash
hodge context --feature {{feature}}
```

Load feature exploration/build files:
- `.hodge/features/{{feature}}/explore/exploration.md`
- `.hodge/features/{{feature}}/build/build-plan.md`
- `.hodge/features/{{feature}}/linked-decisions.md`

{{else}}
### Standard Session Initialization

1. **Load Current Project State**
   ```bash
   hodge context
   ```

   Review the generated `.hodge/HODGE.md` file for:
   - Current feature and mode
   - Recent decisions
   - Active standards
   - Working files

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

Ready to start development. What would you like to work on?