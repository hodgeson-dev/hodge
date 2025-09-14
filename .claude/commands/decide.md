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
- Uncommitted exploration results in `.hodge/features/*/explore/`
- Check if exploration exists without corresponding PM issue

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
4. If decision is about an explored feature:
   a. If PM issue already exists:
      - Add `hodge-decided` label
      - Add comment with decision:
        ```
        ## ✅ Hodge Decision Made
        - Date: {{timestamp}}
        - Chosen approach: {{chosen_approach}}
        - Rationale: {{decision_rationale}}
        - Next step: Ready for /build
        ```
   b. If no PM issue exists:
      - Ask: "Would you like to create a PM issue for '{{feature}}'? (yes/no)"
      - If yes:
        - Create issue with chosen approach from decision
        - Add `hodge-decided` label
        - Include exploration summary and decision in description
        - Save issue ID to `.hodge/features/{{feature}}/issue-id.txt`
5. Move to next pending decision

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

### Next Steps
Choose your next action:
a) Start building the decided feature → `/build {{feature}}`
b) Explore another feature → `/explore`
c) Review project status → `/status`
d) Create/update PM issues for decisions
e) Review all decisions → show `.hodge/decisions.md`
f) Done for now

Enter your choice (a-f):
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