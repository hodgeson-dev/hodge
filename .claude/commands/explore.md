# Hodge Explore Mode

You are now entering **Explore Mode** for the feature: {{feature}}

## PM Integration
First, check if this feature matches a PM issue:
1. Check environment for PM configuration (HODGE_PM_TOOL, LINEAR_TEAM_ID, etc.)
2. If PM is configured:
   - Search for issue by ID if {{feature}} matches pattern (e.g., LIN-123)
   - Otherwise search by title/description
   - If issue found:
     - Check if issue has `hodge-decided` label or decision comment
     - If previously decided, ask: "A decision has already been made on this issue. Would you like to re-explore it? (yes/no)"
       - If no: Show previous decision from comments and exit
       - If yes: Continue with re-exploration (note: will need new decision)
   - Fetch issue details: description, acceptance criteria, comments
   - Use this context to guide exploration
3. If no PM issue found:
   - Proceed with exploration
   - Save exploration results locally
   - Note: PM issue can be created later via `/decide` after reviewing exploration

## Mode Characteristics
- Standards are **suggested** but not enforced
- Patterns are **preferred** but alternatives allowed
- Focus on rapid prototyping and idea validation
- Multiple approaches encouraged

## Your Tasks
1. Create exploration directory: `.hodge/features/{{feature}}/explore/`
2. If PM issue found, save issue ID to `.hodge/features/{{feature}}/issue-id.txt`
3. Generate 2-3 different approaches for implementing {{feature}}
4. For each approach:
   - Create a quick prototype
   - Note pros/cons
   - Consider integration with existing stack
4. Suggest which approach might work best and why

## Context Awareness
- Check `.hodge/decisions.md` for relevant past decisions
- Reference `.hodge/standards.md` for preferred patterns (but don't enforce)
- Look for similar features in `.hodge/features/` for inspiration

## Output Format
Present exploration results as:
```
## {{feature}} Exploration

### Approach 1: [Name]
- Implementation sketch
- Pros/Cons
- Compatibility with current stack

### Approach 2: [Name]
...

### Recommendation
Based on exploration, [approach] seems best because...

### Next Steps
Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build {{feature}}`
d) Save progress and switch context → `/save`
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):
```

## Post-Exploration Actions
After exploration completes:
1. Save exploration locally to `.hodge/features/{{feature}}/explore/`
2. If PM issue exists:
   - Do NOT update issue yet (wait for decision)
   - Note: "Exploration saved locally. Use `/decide` to choose approach and update PM issue"
3. If no PM issue:
   - Save exploration locally
   - Suggest: "Use `/decide` to review approaches and optionally create a PM issue"

Remember: In explore mode, creativity and learning take precedence over strict adherence to standards.