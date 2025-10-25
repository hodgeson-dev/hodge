---
description: Check status of a feature across all phases
argument-hint: <feature-id>
---

┌─────────────────────────────────────────────────────────┐
│ 📊 Status: Feature Overview and Context Management     │
└─────────────────────────────────────────────────────────┘

## Command Execution

### For Overall Status
```bash
hodge status
```

### For Feature-Specific Status
```bash
hodge status {{feature}}
```

## What This Does

### Overall Status (`hodge status`)
1. Checks Hodge initialization
2. Displays project configuration
3. Shows statistics:
   - Total features
   - Active features (not shipped)
   - Pattern count
   - Decision count
4. Lists active features
5. Provides AI context summary

### Feature Status (`hodge status {{feature}}`)
1. Shows feature progress:
   - ✓/○ Exploration
   - ✓/○ Decision
   - ✓/○ Build
   - ✓/○ Harden
   - ✓/○ Production Ready
2. PM integration status
3. Suggests next step for the feature

## After Command Execution
The CLI will output either:
- Overall project status with context
- Specific feature progress and next steps

## Using Status Information

### If Viewing Overall Status
Review the context and decide:
- Which feature to work on next
- Whether to start a new feature
- If any features need attention

### If Viewing Feature Status
Based on progress shown:
- **No exploration**: Start with `/explore {{feature}}`
- **No decision**: Review and use `/decide`
- **No build**: Continue with `/build {{feature}}`
- **No harden**: Proceed to `/harden {{feature}}`
- **Not production ready**: Fix issues and re-harden
- **Ready to ship**: Use `/ship {{feature}}`

## Quick Feature Switch
To switch between features:
1. Check current status: `hodge status`
2. Save current work: `/save`
3. Switch to new feature: `/explore` or `/build {{new-feature}}`

## Context Management
The status command helps you:
- Keep track of multiple features
- Understand project progress
- Maintain context when switching tasks
- See what needs attention

## What's Next?

Based on the status output, suggest context-aware next steps:

**If showing overall status (no specific feature):**
```
### What's Next?

{{#if active_features.length > 0}}
You have {{active_features.length}} active feature(s):
{{#each active_features}}
• {{this}} - Continue with `/build {{this}}` or `/harden {{this}}`
{{/each}}

Or start fresh:
• `/explore <new-feature>` - Start a new feature
• `/status {{feature}}` - Check specific feature details

💡 Tip: Focus on completing active features before starting new ones.
{{else}}
No active features. Ready to start something new!

• `/explore <feature>` - Start exploring a new feature
• Check velocity with `hodge status --stats`

💡 Tip: Use status --stats to see your shipping velocity and momentum.
{{/if}}
```

**If showing specific feature status:**
```
### What's Next?

Based on "{{feature}}" progress, use the "Next Step" suggestion shown above.

The status command has already analyzed your feature state and provided the optimal next command.

💡 Tip: Follow the suggested next step for the smoothest workflow progression.
```

Remember: The CLI tracks all feature progress automatically. Use status to stay oriented and make informed decisions about what to work on next.