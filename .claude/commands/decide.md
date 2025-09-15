# Hodge Decide - Decision Management

## Command Execution

### For Single Decision
Execute the portable Hodge CLI command:
```bash
hodge decide "{{decision}}"
```

With feature association:
```bash
hodge decide "{{decision}}" --feature {{feature}}
```

## What This Does
1. Records decision in `.hodge/decisions.md`
2. Adds timestamp and formatting
3. Associates with feature if specified
4. Updates PM issue with decision comment (if feature linked)
5. Displays AI context update about the decision

## After Command Execution
The CLI will output:
- Decision confirmation
- File location
- Total decision count
- Feature association (if specified)

## Interactive Decision Mode
If you need to make multiple decisions or review pending ones:

1. **Gather pending decisions from**:
   - Code comments (TODO, FIXME, QUESTION)
   - Previous exploration notes
   - Uncommitted changes
   - Open questions in conversation

2. **Present each decision**:
   ```
   ## Decision {{number}} of {{total}}

   **Topic**: {{decision_topic}}
   **Context**: {{brief_context}}

   Options:
   a) {{option_1}}
      Pros: {{pros}}
      Cons: {{cons}}

   b) {{option_2}}
      Pros: {{pros}}
      Cons: {{cons}}

   c) Skip for now
   d) Need more exploration

   Your choice:
   ```

3. **For each decision made**:
   ```bash
   hodge decide "{{chosen_option_description}}" --feature {{feature}}
   ```

## Decision Format
Decisions are stored as:
```markdown
### YYYY-MM-DD - Decision Title

**Status**: Accepted
**Context**: Feature or general context
**Decision**: Full decision text
**Rationale**: Why this was chosen
**Consequences**: Impact of decision
```

## PM Integration
If decision is about a feature with PM issue:
- Automatically adds comment to PM issue
- Marks issue as "decided" if appropriate
- Updates issue description with decision

## Next Steps Menu
After decisions are recorded:
```
### Next Steps
Choose your next action:
a) Start building decided feature → `/build {{feature}}`
b) Explore another feature → `/explore`
c) Review all decisions → `/status`
d) Continue development
e) Done for now

Enter your choice (a-e):
```

Remember: The CLI handles decision recording and PM updates. Focus on making thoughtful technical choices.