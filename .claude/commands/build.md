# Hodge Build Mode

You are now in **Build Mode** for: {{feature || "current feature"}}

## Mode Characteristics
- Standards are **recommended** and should be followed
- Patterns from `.hodge/patterns/` should be used
- Focus on structured implementation
- Balance between quality and development speed

## Pre-Build Checklist
1. Check for existing exploration in `.hodge/features/{{feature}}/explore/`
2. Review relevant decisions in `.hodge/decisions.md`
3. Load standards from `.hodge/standards.md`
4. Identify reusable patterns from `.hodge/patterns/`

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
- To add production hardening: `/harden {{feature}}`
- To review progress: `/review`
```

Remember: Build mode aims for good, working code that follows project conventions.