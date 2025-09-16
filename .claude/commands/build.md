# Hodge Build Mode

## Command Execution
Execute the portable Hodge CLI command:
```bash
hodge build {{feature}}
```

If you need to skip exploration/decision checks:
```bash
hodge build {{feature}} --skip-checks
```

## What This Does
1. Checks for existing exploration and decisions
2. Creates build directory: `.hodge/features/{{feature}}/build/`
3. Displays AI context for build mode
4. Shows available patterns to use
5. Creates build plan template
6. Links PM issue and updates status to "In Progress"

## After Command Execution
The CLI will output:
- AI context guidelines for build mode
- PM issue status update
- Available patterns list
- Build guidelines (SHOULD follow standards)
- Created files location

## Your Tasks After CLI Command
1. Review the build plan at `.hodge/features/{{feature}}/build/build-plan.md`
2. Implement the feature following:
   - **SHOULD** follow coding standards
   - **SHOULD** use established patterns
   - **SHOULD** include basic error handling
   - **MUST** write at least one smoke test
3. Write smoke tests (required):
   ```typescript
   import { smokeTest } from '../test/helpers';

   smokeTest('should not crash', async () => {
     await expect(command.execute()).resolves.not.toThrow();
   });
   ```
4. Update the build plan as you progress
5. Track files modified and decisions made

## Implementation Guidelines
- Use existing patterns where applicable
- Maintain consistency with project architecture
- Include helpful comments for complex logic
- Balance quality with development speed

## Testing Requirements (Progressive Model)
- **Build Phase**: Minimum 1 smoke test required
- **Test Type**: Quick sanity checks (<100ms)
- **Focus**: Does it work without crashing?
- **Run Command**: `npm run test:smoke`
- Use test utilities from `src/test/helpers.ts`

## Next Steps Menu
After building is complete, suggest:
```
### Next Steps
Choose your next action:
a) Run smoke tests → `npm run test:smoke`
b) Proceed to hardening → `/harden {{feature}}`
c) Review changes → `/review`
d) Save progress → `/save`
e) Check status → `/status {{feature}}`
f) Switch to another feature → `/build`
g) Update PM issue status
h) Done for now

Enter your choice (a-h):
```

Remember: The CLI handles all file management and PM integration. Focus on implementing quality code that follows project conventions.