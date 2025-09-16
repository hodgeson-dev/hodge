# Hodge Explore Mode

## Command Execution
Execute the portable Hodge CLI command:
```bash
hodge explore {{feature}}
```

## What This Does
1. Creates exploration directory: `.hodge/features/{{feature}}/explore/`
2. Generates `test-intentions.md` with behavior checklist
3. Checks for PM issue and links if found
4. Displays AI context for exploration mode
5. Shows available patterns and decisions
6. Creates exploration template for you to fill in

## After Command Execution
The CLI will output:
- AI context guidelines for exploration mode
- PM issue linking status
- Project context (patterns, decisions)
- Created files location
- Next steps

## Your Tasks After CLI Command
1. Review the exploration template at `.hodge/features/{{feature}}/explore/exploration.md`
2. Review test intentions at `.hodge/features/{{feature}}/explore/test-intentions.md`
3. Generate 2-3 different implementation approaches
4. For each approach:
   - Create a quick prototype or code sketch
   - Note pros/cons
   - Consider integration with existing stack
5. Update test intentions with discoveries
6. Document your recommendation

## Exploration Guidelines
- Standards are **suggested** but not enforced
- Multiple approaches encouraged
- Focus on rapid prototyping and idea validation
- Be creative and explore alternatives
- **No tests required** - only test intentions (what should it do?)

## Next Steps Menu
After exploration is complete, suggest:
```
### Next Steps
Choose your next action:
a) Record decision → `/decide "chosen approach" --feature {{feature}}`
b) Continue exploring another aspect
c) Start building → `/build {{feature}}`
d) Save progress → `/save`
e) Check status → `/status {{feature}}`
f) Done for now

Enter your choice (a-f):
```

Remember: The CLI handles all the file creation and PM integration. Focus on generating creative solutions and documenting approaches.