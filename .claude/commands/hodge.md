---
description: Load context for a feature or view workflow status
argument-hint: [feature-id]
---

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🎯 Hodge: Session & Context Manager                     │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Hodge:" prefix for context awareness
- ✅ Section name matches exactly as shown

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

### 1. Load Context Manifest (HODGE-363)

{{#if feature}}
Generate context manifest for feature:
```bash
hodge context --feature {{feature}}
```
{{else}}
Generate context manifest for project:
```bash
hodge context
```
{{/if}}

The `hodge context` command outputs a YAML manifest containing:
- **global_files**: Core project files (standards, decisions, principles, etc.) with availability status - MUST READ ALL available files
- **architecture_graph**: Codebase dependency graph (modules and dependencies) - MUST READ if available for architectural awareness
- **patterns**: Available patterns with extracted titles and overviews (token-efficient awareness - read only when needed)
- **feature_context** (when feature specified): All files in feature directory - MUST READ ALL available files

**AI Instructions:**

1. Parse the YAML manifest output from `hodge context`
2. **MANDATORY**: Read ALL files marked as `status: available` in the manifest:
   - **MUST READ ALL** global_files with `status: available` - NO EXCEPTIONS
   - **MUST READ ALL** feature_context files with `status: available` - NO EXCEPTIONS
   - **MUST READ** architecture_graph if `status: available` - provides codebase dependency structure (always load for architectural awareness)
   - **patterns** section provides awareness without reading full files (read specific patterns only when needed)

3. Example Read sequence:
```bash
# Read available global files
cat .hodge/standards.md
cat .hodge/decisions.md
cat .hodge/principles.md
cat .hodge/context.json
# (skip any file if status: not_found)

# Read architecture graph for codebase structure
cat .hodge/architecture-graph.dot

# Read feature files if working on a feature
{{#if feature}}
cat .hodge/features/{{feature}}/explore/exploration.md
cat .hodge/features/{{feature}}/build/build-plan.md
# (read other feature files as shown in manifest)
{{/if}}
```

**STOP HERE and present the context to the user.**

{{#if feature}}
Check feature status to provide smart suggestions:
```bash
hodge status {{feature}}
```
{{else}}
Get project overview:
```bash
hodge status
```
{{/if}}

Based on the status output, present context-aware options:

**If Exploration ✓, Decision ○, Build ○:**
```
### Current State
Exploration complete. Ready to make decisions or start building.

### What's Next?
• `/decide` - Make architectural decisions (if needed)
• `/build {{feature}}` - Start building (Recommended)
• `/status {{feature}}` - Check detailed progress

💡 Tip: You can start building immediately or record decisions first.
```

**If Exploration ✓, Build ✓, Harden ○:**
```
### Current State
Build phase complete. Ready for integration tests and validation.

### What's Next?
• `/harden {{feature}}` - Add integration tests and validate (Recommended)
• `/build {{feature}}` - Continue building if needed
• `/status {{feature}}` - Check detailed progress

💡 Tip: Hardening validates production readiness with quality gates.
```

**If Harden ✓, Production Ready ✓:**
```
### Current State
Feature is production-ready! All quality gates passed.

### What's Next?
• `/ship {{feature}}` - Ship to production (Recommended)
• `/review` - Optional final review
• `/status {{feature}}` - Check detailed progress

💡 Tip: You're ready to ship! 🚀
```

**If already Shipped ✓:**
```
### Current State
Feature has been shipped. Great work! 🎉

### What's Next?
• `/explore <new-feature>` - Start your next feature (Recommended)
• `git push` - Push to remote if not done
• `/status` - Check overall project status

💡 Tip: Time to start something new or take a well-deserved break!
```

**If no work started yet:**
```
### Current State
No work started on {{feature}} yet.

### What's Next?
• `/explore {{feature}}` - Start exploring this feature (Recommended)
• `/status` - Check overall project status
• Choose a different feature to work on

💡 Tip: Begin with exploration to understand the problem space.
```

**Wait for explicit user direction before proceeding.**

## Core Principles
Before starting work, remember:
- **AI analyzes, backend executes** - You design, hodge implements
- **Templates guide conversations** - Don't document hodge internals
- **Progressive development** - Explore freely, ship strictly

## Context Loaded

{{#if feature}}
### Working on: {{feature}}
Current mode: {{mode}}
Next suggested action: {{next_action}}

Available commands:
• `/explore {{feature}}` - Continue exploration
• `/build {{feature}}` - Start/continue building
• `/decide` - Record decisions

{{else}}
### Available Commands
• `/explore {{feature}}` - Start exploring a new feature
• `/build {{feature}}` - Build a feature with standards
• `/decide {{decision}}` - Record a decision
• `/ship {{feature}}` - Ship feature to production
• `/status` - Check current status
• `/review` - Review current work

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

**This command has finished loading context. No actions have been taken.**

💬 Your response: