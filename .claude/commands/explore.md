# Hodge Explore Mode

## IMPORTANT: Template Compliance
When presenting exploration results, you MUST follow this template EXACTLY:
- Option (c) MUST include the recommended approach name: "Start building with [approach name]"
- The note "Note: Option (c) will use the recommended approach..." MUST be included
- Don't abbreviate or modify the menu structure
- Include ALL menu options (a-f) even if they seem redundant
- Follow the exact wording shown in the "Next Steps Menu" section below

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

## Review Relevant Context

### 1. Check Lessons from Similar Features
```bash
# Search for relevant lessons
ls -la .hodge/lessons/ | grep -i "{{feature-keyword}}"

# Review any relevant lessons found
cat .hodge/lessons/SIMILAR-FEATURE.md
```
Consider what worked well and what to avoid based on past experience.

### 2. Review Applicable Patterns
```bash
# List available patterns
ls -la .hodge/patterns/

# Review patterns that might apply to {{feature}}
cat .hodge/patterns/relevant-pattern.md
```
Consider which patterns might guide your exploration.

### 3. Check Related Principles
```bash
# Review principles for exploration phase guidance
grep -A 5 "Explore" .hodge/principles.md
```
Remember: "Freedom to explore" - Standards are suggestions only in this phase.

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
Type one of these commands:
• `/decide` - Review and decide on approach
• `/build {{feature}}` - Start building with [recommended approach name]
• `/save` - Save your progress
• `/status {{feature}}` - Check current status
• Continue exploring - Just describe what else to explore

Or type your next request.

Note: `/build` will use the recommended approach. Use `/decide` to choose a different approach.
```

Remember: The CLI handles all the file creation and PM integration. Focus on generating creative solutions and documenting approaches.