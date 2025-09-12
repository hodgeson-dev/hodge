# Hodge Decide - Decision Management

{{#if decision}}
## Recording Single Decision

Record this decision in `.hodge/decisions.md`:
- Decision: {{decision}}
- Category: [Determine from context: Architecture/Patterns/Tools/Constraints]
- Date: {{current_date}}

Format as one-liner:
```
- {{date}}: {{decision}}
```

Then confirm: "Decision recorded: {{decision}}"

{{else}}
## Interactive Decision Mode

### 1. Gather Pending Decisions
Scan for pending decisions from:
- Previous `/review` output
- Conversation history
- Code comments (TODO, FIXME, QUESTION)
- Uncommitted exploration results

### 2. Present Decisions Interactively

For EACH pending decision, present:

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

c) {{option_3}} (if applicable)
   ...

d) Skip for now (revisit later)
e) Need more exploration

Your choice:
```

### 3. Wait for User Input
- DO NOT simulate or assume user choices
- Wait for actual user response
- Accept single letters (a, b, c) or multiple (a and c)
- Accept custom decisions if user types something else

### 4. Process Each Decision
After user responds:
1. Record decision in `.hodge/decisions.md`
2. Update relevant context files
3. Note any follow-up actions needed
4. Move to next pending decision

### 5. Summary After All Decisions

```
## Decisions Recorded

✓ {{count}} decisions made:
1. {{decision_1}}
2. {{decision_2}}
...

📋 Follow-up actions:
- {{action_1}}
- {{action_2}}

⏭️ {{skipped_count}} decisions skipped for later

Next recommended action: {{suggestion}}
```

{{/if}}

## Decision Format in `.hodge/decisions.md`

Always use one-line format:
```markdown
## Category
- YYYY-MM-DD: [Decision] - [Brief reason]
```

Categories:
- Architecture
- Patterns  
- Tools
- Constraints
- Process

Remember: Decisions should be concise, actionable, and include reasoning.