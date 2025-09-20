# Hodge Harden Mode

## ⚠️ REQUIRED: Pre-Harden Standards Review

**STOP! You MUST complete this AI Standards Review BEFORE running the harden command.**

### Step 1: Review Recent Changes
```bash
# Review all changes in this feature
git diff main...HEAD -- . ':(exclude).hodge/features/'

# Or if on main branch
git diff HEAD~5..HEAD -- . ':(exclude).hodge/features/'
```

### Step 2: Load Standards for Reference
```bash
cat .hodge/standards.md | head -60  # Review key standards
```

### Step 3: AI Standards Compliance Checklist
**You MUST check each item below:**

- [ ] **TypeScript Standards**
  - Are there any `any` types that should be properly typed?
  - Are all function return types appropriate?
  - Is strict mode being followed?

- [ ] **Testing Requirements**
  - Are there integration tests (not just smoke tests)?
  - Do tests verify behavior, not implementation?
  - Is the Test Isolation Requirement followed (no .hodge modifications)?

- [ ] **Code Comments & TODOs**
  - Are all TODOs in format: `// TODO: [phase] description`?
  - Are there any naked TODOs without descriptions?
  - Should any TODOs be resolved before hardening?

- [ ] **Performance Standards**
  - Will CLI commands respond within 500ms?
  - Are there any synchronous operations that should be async?
  - Any unnecessary blocking operations?

- [ ] **Error Handling**
  - Is error handling comprehensive?
  - Are errors logged appropriately?
  - Do errors fail gracefully?

### Step 4: Report Standards Assessment
Based on your review, choose ONE:

**Option A: Ready to Harden ✅**
```
✅ STANDARDS PRE-CHECK PASSED
All standards requirements appear to be met.
Proceeding with harden command...
```

**Option B: Minor Issues (Warnings) ⚠️**
```
⚠️ STANDARDS PRE-CHECK - Warnings Found:

[List specific issues found, e.g.:]
1. TODO format violations in src/example.ts:45
2. Could use more comprehensive error handling
3. Some functions missing explicit return types

These are WARNINGS. Proceeding with harden, but should address before ship.
```

**Option C: Blocking Issues 🚫**
```
🚫 STANDARDS PRE-CHECK - Blocking Issues:

[List critical issues, e.g.:]
1. No integration tests found
2. Test modifies project .hodge directory
3. Multiple untyped 'any' uses in production code

RECOMMENDATION: Fix these issues before running harden.
Returning to build phase to address issues.
```

## Command Execution (After Pre-Check)

**Only proceed here if you chose Option A or B above!**

Execute the portable Hodge CLI command:
```bash
hodge harden {{feature}}
```

Options:
```bash
hodge harden {{feature}} --skip-tests  # Skip test execution (not recommended)
hodge harden {{feature}} --auto-fix    # Attempt to auto-fix linting issues
```

## What The CLI Does
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

## Post-Execution Verification

### Compare Results with Pre-Check
After the CLI runs, verify:
1. Did the CLI find issues you missed in pre-check?
2. Did your warnings align with actual validation results?
3. Are there patterns to improve future pre-checks?

### Review Harden Report
```bash
cat .hodge/features/{{feature}}/harden/harden-report.md
```

## Your Tasks Based on Results

### If Validation Passed ✅
1. Confirm your pre-check assessment was accurate
2. Review the harden report for any warnings
3. Consider proceeding to ship

### If Validation Failed ❌
1. Compare failures with your pre-check assessment
2. Fix each failing check:
   - **Integration tests failing**: Write or fix integration tests
   - **Smoke tests failing**: Fix basic functionality issues
   - **Linting errors**: Run with `--auto-fix` or fix manually
   - **Type errors**: Fix TypeScript issues
   - **Build errors**: Resolve compilation problems
3. Return to build phase if needed: `/build {{feature}}`
4. Re-run the ENTIRE harden process (including pre-check)

## Testing Requirements (Progressive Model)
- **Harden Phase**: Integration tests required
- **Test Types**: Smoke + Integration tests
- **Focus**: Does it behave correctly end-to-end?
- **Critical Rule**: Tests must NEVER modify project's .hodge directory
- Use test utilities from `src/test/helpers.ts` and `src/test/runners.ts`

## Production Checklist
Before proceeding to ship, ensure:
- [ ] Standards pre-check completed and documented
- [ ] Integration tests passing (behavior verification)
- [ ] Smoke tests passing (basic functionality)
- [ ] No linting errors (warnings acceptable)
- [ ] TypeScript strict mode passing
- [ ] Build succeeds without errors
- [ ] Test Isolation Requirement followed
- [ ] Error handling comprehensive
- [ ] Performance standards met
- [ ] Documentation updated if needed

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

## Important Notes
1. **The AI Standards Pre-Check is MANDATORY** - Never skip it
2. **Document your pre-check findings** - Include them in your response
3. **Be honest about issues** - Better to catch them now than in production
4. **Learn from mismatches** - If CLI finds issues you missed, understand why

Remember: The pre-check helps YOU catch issues early and understand the codebase better. The CLI validates, but YOUR review provides context and understanding.

ARGUMENTS: {{feature}}