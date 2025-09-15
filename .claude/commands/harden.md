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
4. Runs validation checks:
   - Tests (npm test)
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

## Your Tasks Based on Results

### If Validation Passed ✅
1. Review the harden report
2. Ensure all production requirements are met
3. Consider proceeding to ship

### If Validation Failed ❌
1. Review the detailed output in the report
2. Fix each failing check:
   - **Tests failing**: Fix broken tests or implementation
   - **Linting errors**: Run with `--auto-fix` or fix manually
   - **Type errors**: Fix TypeScript issues
   - **Build errors**: Resolve compilation problems
3. Re-run `hodge harden {{feature}}`

## Production Checklist
Ensure these are complete:
- [ ] All tests passing (>80% coverage)
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