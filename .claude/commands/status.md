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

## Next Steps

After checking status, you can:

- Continue with the suggested feature
- Start a new feature with `/explore`
- Resume an active feature with `/build {{feature}}`
- Review and record decisions with `/decide`
- Check a specific feature with `/status {{feature}}`

Remember: The CLI tracks all feature progress automatically. Use status to stay oriented and make informed decisions about what to work on next.