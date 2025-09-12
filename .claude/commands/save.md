# Hodge Save - Preserve Session Context

Save the current session context for later restoration.

## Save Process

### 1. Determine Save Name
{{#if name}}
Use provided name: `{{name}}`
{{else}}
Generate name from: `{{feature}}-{{mode}}-{{timestamp}}`
Example: `auth-build-20241115-1430`
{{/if}}

### 2. Create Comprehensive Snapshot

Create `.hodge/saves/{{save_name}}/` containing:

#### context.json
```json
{
  "name": "{{save_name}}",
  "feature": "{{current_feature}}",
  "mode": "{{current_mode}}",
  "timestamp": "{{iso_timestamp}}",
  "session": {
    "duration": "{{session_time}}",
    "filesModified": ["..."],
    "decisionsCount": {{count}},
    "featuresWorked": ["..."],
    "keyDecisions": ["..."]
  },
  "nextPhase": "{{next_planned_work}}",
  "todoStatus": {
    "completed": {{completed_count}},
    "pending": {{pending_count}},
    "currentPhase": {{phase_number}}
  }
}
```

#### snapshot.md
```markdown
# Context Snapshot: {{title}}

## Working On:
- {{primary_work_item}} 
- {{secondary_items}}
- {{key_achievement}}

## Progress:
- ✅ {{completed_item_1}}
- ✅ {{completed_item_2}}
- 🔄 {{in_progress_items}}
- ⏳ {{pending_items}}

## Key Accomplishments:

### 1. **{{category_1}}**:
   {{detailed_accomplishments}}

### 2. **{{category_2}}**:
   {{detailed_accomplishments}}

## Technical Decisions:
{{list_of_technical_decisions_made}}

## Meta Development Process:
{{any_meta_aspects_like_dogfooding}}

## Current Todo State:
{{numbered_list_with_status_indicators}}

## Environment State:
```bash
Directory: {{working_directory}}
Git: {{git_status}}
Next Phase: {{next_phase}}
Testing Strategy: {{testing_approach}}
```

## Files Created/Modified in Session:
{{detailed_file_list_with_descriptions}}

## Next Session Suggestions:
1. **{{suggestion_1}}**: {{description}}
2. **{{suggestion_2}}**: {{description}}
3. **{{suggestion_3}}**: {{description}}

## Commands for Quick Resume:
```bash
# After restarting Claude Code
cd {{working_directory}}

# Test or continue work
{{relevant_commands}}
```

## Key Context to Remember:
{{important_context_points}}

## Pending Decisions:
{{list_of_decisions_still_needed}}

---
*Session saved for easy restoration with `/load {{save_name}}`*
```

### 3. Copy Current State Files
- Copy `.hodge/context.md` → `.hodge/saves/{{save_name}}/context.md`
- Copy `.hodge/features/{{feature}}/` → `.hodge/saves/{{save_name}}/feature/`
- Reference (not copy) decisions.md and standards.md

### 4. Confirm Save

```
✅ Session saved as: {{save_name}}

Snapshot includes:
- Current feature state ({{feature}})
- Mode context ({{mode}})
- {{count}} recent decisions
- {{count}} modified files

To restore this session later:
`/load {{save_name}}`

Recent saves:
1. {{save_1}} - {{time_ago}}
2. {{save_2}} - {{time_ago}}
3. {{save_3}} - {{time_ago}}
```

## Auto-Save Note
This save is in addition to automatic saves that occur after certain commands.
Manual saves are useful for:
- Before major changes
- End of work session
- Before switching to different feature
- Creating restore points

Remember: Saves preserve context and progress, making it easy to resume work exactly where you left off.