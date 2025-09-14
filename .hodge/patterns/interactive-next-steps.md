# Interactive Next Steps Pattern

## Context
At the end of workflow commands, provide lettered options for quick selection rather than requiring users to type full commands.

## Pattern
```markdown
### Next Steps
Choose your next action:
a) [Action 1] → `[command if needed]`
b) [Action 2]
c) [Action 3]
...
h) Done for now

Enter your choice (a-h):
```

## Benefits
- Works across different AI tools (Claude, Cursor, etc.)
- Reduces typing and cognitive load
- Provides clear guidance on available actions
- Maintains workflow momentum

## Implementation
- Use lowercase letters (a, b, c, etc.)
- Include command hints where helpful with → arrow
- Always include "Done for now" as final option
- Keep options relevant to current context
- Limit to 6-8 options for clarity

## Examples

### After Exploration
```
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build {{feature}}`
```

### After Build
```
a) Add tests for this feature
b) Proceed to hardening → `/harden {{feature}}`
c) Review changes → `/review`
```

### After Ship
```
a) Monitor production metrics
b) Start exploring next feature → `/explore`
c) Review project status → `/status`
```

## When to Use
- At the end of all workflow commands (/explore, /decide, /build, /harden, /ship)
- After completing significant tasks
- When multiple logical next steps exist
- To guide users through the Hodge workflow

## When NOT to Use
- In error messages (provide specific recovery actions instead)
- For simple yes/no questions
- When only one logical next step exists