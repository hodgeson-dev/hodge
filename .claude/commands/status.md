# Hodge Status - Feature Overview and Context Management

{{#if feature}}
## Status for Feature: {{feature}}

Check `.hodge/features/{{feature}}/` for:
- Current mode and progress
- Context and decisions
- Files modified
- Next recommended actions

{{else}}
## All Features Status

Scan `.hodge/features/` directory and present:

```
## Feature Overview

### Active Feature
📍 **{{current_feature}}** ({{current_mode}} mode)
   Progress: {{progress_bar}} {{percentage}}%
   Last modified: {{timestamp}}
   Next action: {{recommendation}}

### Other Features

#### {{feature_1}}
   Mode: {{mode}}
   Progress: {{progress_bar}} {{percentage}}%
   Status: {{status}}

#### {{feature_2}}
   Mode: {{mode}}
   Progress: {{progress_bar}} {{percentage}}%
   Status: {{status}}

### Quick Actions
Select a feature to load:
a) {{feature_1}} - {{brief_description}}
b) {{feature_2}} - {{brief_description}}
c) {{feature_3}} - {{brief_description}}
d) Continue with current ({{current_feature}})

Your choice:
```

{{/if}}

## After Feature Selection

When user selects a feature to load:

1. **Update Context**
   - Set selected feature as current in `.hodge/context.md`
   - Load feature-specific context from `.hodge/features/{{feature}}/context.md`
   - Note the mode (explore/build/harden)

2. **Restore State**
   ```
   ## Loading Feature: {{feature}}
   
   ### Context Restored
   - Mode: {{mode}}
   - Approach: {{approach}}
   - Progress: {{what_was_completed}}
   
   ### Recent Decisions
   - {{relevant_decisions}}
   
   ### Next Steps
   - {{immediate_next_action}}
   - Continue with: `/{{mode}} {{feature}}`
   ```

3. **Auto-Save Trigger**
   After loading, save the context switch

## Session Context Structure

`.hodge/context.md` should contain:
```markdown
# Current Session Context

## Active Feature
- Name: {{feature}}
- Mode: {{mode}}
- Started: {{timestamp}}
- Last Updated: {{timestamp}}

## Session State
- Loaded from: {{previous_feature || "fresh"}}
- Switch count: {{number_of_feature_switches}}

## Working Files
- {{file_1}}
- {{file_2}}
```

Remember: There's only ONE active context at a time - the current session.