# Hodge Build Mode

You are now in **Build Mode** for: {{feature || "current feature"}}

## Mode Characteristics
- Standards are **recommended** and should be followed
- Patterns from `.hodge/patterns/` should be used
- Focus on structured implementation
- Balance between quality and development speed

## Pre-Build Checklist
1. Check for linked PM issue in `.hodge/features/{{feature}}/issue-id.txt`
2. If PM issue exists:
   - Check if issue has `hodge-decided` label or decision comment
   - If NOT decided, ask: "No decision has been made on this issue. Would you like to explore and decide first? (yes/no)"
     - If yes: Exit and suggest `/explore {{feature}}` then `/decide`
     - If no: Continue with build (mark as "fast-tracked")
3. If no PM issue:
   - Check for existing exploration in `.hodge/features/{{feature}}/explore/`
   - If no exploration, ask: "This feature hasn't been explored. Would you like to explore it first? (yes/no)"
     - If yes: Exit and suggest `/explore {{feature}}`
     - If no: Continue with build
4. Transition PM issue to "In Progress" state (if exists)
5. Review relevant decisions in `.hodge/decisions.md`
6. Load standards from `.hodge/standards.md`
7. Identify reusable patterns from `.hodge/patterns/`

## Build Process
1. If no exploration exists, ask: "No exploration found. Would you like to explore first or proceed with build?"
2. Create/update `.hodge/features/{{feature}}/context.md` with:
   - Chosen approach from exploration
   - Key technical decisions
   - Files being created/modified
3. Implement the feature following:
   - **SHOULD** follow coding standards
   - **SHOULD** use established patterns
   - **SHOULD** include basic error handling
   - **CONSIDER** adding tests

## Implementation Guidelines
- Use existing patterns where applicable
- Maintain consistency with project architecture
- Include helpful comments for complex logic
- Create meaningful commit messages

## Output Format
```
## Building: {{feature}}

{{#if pm_issue}}
📋 PM Issue: {{pm_issue.id}} - {{pm_issue.title}}
   Status: In Progress
   URL: {{pm_issue.url}}
{{/if}}

### Implementation Plan
- [ ] Component/Module 1
- [ ] Component/Module 2
- [ ] Integration points
- [ ] Basic testing

### Files Modified
- `path/to/file1.ts` - Description
- `path/to/file2.tsx` - Description

### Decisions Made
- Decision 1: Reasoning
- Decision 2: Reasoning

### Next Steps
Choose your next action:
a) Add tests for this feature
b) Proceed to hardening → `/harden {{feature}}`
c) Review changes → `/review`
d) Commit progress → `/save`
e) Switch to another feature → `/build`
f) Update PM issue status
g) Done for now

Enter your choice (a-g):
```

Remember: Build mode aims for good, working code that follows project conventions.