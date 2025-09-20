# Hodge Harden Mode

## Command Execution
Execute the portable Hodge CLI command:
```bash
hodge harden {{feature}}
```

Options:
```bash
hodge harden {{feature}} --skip-tests  # Skip test execution
hodge harden {{feature}} --auto-fix    # Attempt to auto-fix linting issues
```

## What This Does
1. Checks that feature has been built
2. Creates harden directory: `.hodge/features/{{feature}}/harden/`
3. Displays strict AI context for production standards
4. Runs progressive validation checks:
   - Integration tests (npm run test:integration)
   - Smoke tests (npm run test:smoke)
   - Linting (npm run lint)
   - Type checking (npm run typecheck)
   - Build (npm run build)
5. Generates validation report
6. Updates PM issue to "In Review"

## After Command Execution
The CLI will output:
- Strict AI context for production requirements
- Validation results for each check
- Overall pass/fail status
- Detailed report location

## Standards Review Process (AI-Based Enforcement)

### 1. Load Current Standards
```bash
cat .hodge/standards.md
```

### 2. Review Recent Changes
```bash
git diff HEAD  # Or git diff main...HEAD for branch changes
```

### 3. AI Standards Compliance Check
Review the changes against ALL standards and evaluate:
- **Core Standards**: TypeScript strict, ESLint, Prettier
- **Testing Requirements**: Integration tests present and meaningful
- **Code Comments/TODOs**: Proper format with phase markers
- **Quality Gates**: No lint/type errors, adequate test coverage
- **Performance Standards**: CLI <500ms, tests <30s

### 4. Report Violations (WARNING Level)
If standards violations found, report them clearly:
```
⚠️  STANDARDS REVIEW - Warnings Found:

1. **TODO Format Violation** (line 45 in src/commands/example.ts)
   Found: // TODO fix this later
   Required: // TODO: [phase] description

2. **Missing Integration Tests**
   Feature has only smoke tests. Integration tests required for harden phase.

3. **Performance Concern**
   New command may exceed 500ms response time due to synchronous file operations.

These are WARNINGS in harden phase. Consider addressing them before shipping.
Continue with hardening? (y/n)
```

## Your Tasks Based on Results

### If Validation Passed ✅
1. Review the harden report
2. Ensure all production requirements are met
3. Consider proceeding to ship

### If Validation Failed ❌
1. Review the detailed output in the report
2. Fix each failing check:
   - **Integration tests failing**: Write or fix integration tests (behavior verification)
   - **Smoke tests failing**: Fix basic functionality issues
   - **Linting errors**: Run with `--auto-fix` or fix manually
   - **Type errors**: Fix TypeScript issues
   - **Build errors**: Resolve compilation problems
3. Write integration tests if missing:
   ```typescript
   import { integrationTest } from '../test/helpers';
   import { withTestWorkspace } from '../test/runners';

   integrationTest('should create expected files', async () => {
     await withTestWorkspace('test', async (workspace) => {
       await workspace.hodge('{{feature}}');
       expect(await workspace.exists('expected-file')).toBe(true);
     });
   });
   ```
4. Re-run `hodge harden {{feature}}`

## Testing Requirements (Progressive Model)
- **Harden Phase**: Integration tests required
- **Test Types**: Smoke + Integration tests
- **Focus**: Does it behave correctly end-to-end?
- **Run Commands**:
  - `npm run test:integration` - Behavior verification
  - `npm run test:smoke` - Basic functionality
- Use test utilities from `src/test/helpers.ts` and `src/test/runners.ts`

## Production Checklist
Ensure these are complete:
- [ ] Integration tests passing (behavior verification)
- [ ] Smoke tests passing (basic functionality)
- [ ] No linting errors or warnings
- [ ] TypeScript strict mode passing
- [ ] Build succeeds without errors
- [ ] Error handling comprehensive
- [ ] Input validation complete
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation updated

## Next Steps Menu
After hardening is complete, suggest:
```
### Next Steps
Choose your next action:
a) Ship to production → `/ship {{feature}}`
b) Run additional tests
c) Request code review
d) Generate documentation
e) Back to build for fixes → `/build {{feature}}`
f) Check status → `/status {{feature}}`
g) Save progress → `/save`
h) Done for now

Enter your choice (a-h):
```

Remember: The CLI runs all validation automatically. Focus on fixing any issues found and ensuring production readiness.