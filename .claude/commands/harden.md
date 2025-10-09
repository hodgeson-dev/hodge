# Hodge Harden Mode

## ⚠️ REQUIRED: Pre-Harden Code Review

**STOP! You MUST complete this AI Code Review BEFORE running the harden command.**

### Step 1: Generate Review Manifest
**Analyze changes and generate tiered review manifest:**

```bash
hodge harden {{feature}} --review
```

This command will:
1. Analyze changed files (via git diff with line counts)
2. Classify changes into review tier (SKIP/QUICK/STANDARD/FULL)
3. Filter relevant patterns and review profiles
4. Generate review-manifest.yaml with:
   - Recommended tier and reason
   - Changed files list with line counts
   - Context files to load (organized by precedence)
   - Matched patterns and profiles

### Step 2: Read Review Manifest
```bash
# Read the generated manifest
cat .hodge/features/{{feature}}/harden/review-manifest.yaml
```

The manifest shows:
- `recommended_tier`: SKIP | QUICK | STANDARD | FULL
- `change_analysis`: File counts and line counts
- `changed_files`: List of files with (+added/-deleted) counts
- `context`: Files to load for review (organized by precedence)

### Step 3: Choose Review Tier
Based on the manifest's `recommended_tier`, choose your review tier:

**Tier Options:**
- **SKIP**: Pure documentation changes (no code review needed)
- **QUICK**: Test/config only, ≤3 files, ≤50 lines (~1K lines of context)
- **STANDARD**: Implementation changes, ≤10 files, ≤200 lines (~3K lines of context)
- **FULL**: Major changes or critical paths (~8K lines of context)

**Default**: Use the recommended tier unless you have a reason to override.

### Step 4: Load Context Files
**Based on your chosen tier**, load the context files listed in the manifest's `context` section in precedence order:

**Precedence Rules** (CRITICAL - higher precedence = more authority):
1. **project_standards** (.hodge/standards.md) - HIGHEST PRECEDENCE
2. **project_principles** (.hodge/principles.md)
3. **project_decisions** (.hodge/decisions.md) - FULL tier only
4. **matched_patterns** (.hodge/patterns/*.md)
5. **matched_profiles** (.hodge/review-profiles/**/*.md)
6. **lessons_learned** (.hodge/lessons/*.md) - FULL tier only

**Read files using the Read tool based on your chosen tier:**
- All tiers: Load standards, principles, matched patterns, matched profiles
- FULL tier only: Also load decisions and lessons

**⚠️ CRITICAL**: Project standards override review profiles. If a standard conflicts with a profile recommendation, the standard takes precedence.

### Step 5: Conduct AI Code Review
**Review each changed file (from manifest) against the loaded context.**

Focus areas:
- Changed files are listed in manifest with line counts
- Review only the changed files, not entire codebase
- Apply precedence rules when standards conflict
- Check for violations categorized as BLOCKER, WARNING, or SUGGESTION

### Step 6: Report Review Findings
Based on your code review, choose ONE:

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

### Step 7: Generate Review Report
**IMPORTANT**: After conducting your review, you MUST write a review-report.md file documenting your findings.

Use the Write tool to create `.hodge/features/{{feature}}/harden/review-report.md` with this format:

```markdown
# Code Review Report: {{feature}}

**Reviewed**: [ISO timestamp]
**Tier**: [SKIP | QUICK | STANDARD | FULL]
**Scope**: Feature changes ([N] files, [N] lines)
**Profiles Used**: [list profiles from manifest]

## Summary
- 🚫 **[N] Blockers** (must fix before proceeding)
- ⚠️ **[N] Warnings** (should address before ship)
- 💡 **[N] Suggestions** (optional improvements)

## Critical Issues (BLOCKER)
[If any blockers found, list them here with file:line references]

### [file path]:[line number]
**Violation**: [Standard/Rule Name] - BLOCKER
[Detailed explanation of the issue and why it's blocking]

## Warnings
[If any warnings found, list them here]

### [file path]:[line number]
**Violation**: [Standard/Rule Name] - WARNING
[Detailed explanation]

## Suggestions
[If any suggestions, list them here]

### [file path]:[line number]
**Violation**: [Standard/Rule Name] - SUGGESTION
[Detailed explanation]

## Files Reviewed
[List all files that were reviewed]
1. [file path]
2. [file path]
...

## Conclusion
[Overall assessment - ready to proceed, needs fixes, etc.]
```

**Example for a clean review:**
```markdown
# Code Review Report: HODGE-333.4

**Reviewed**: 2025-10-08T17:30:00.000Z
**Tier**: STANDARD
**Scope**: Feature changes (6 files, 234 lines)
**Profiles Used**: general-coding-standards, general-test-standards, typescript-5.x, vitest-1.x

## Summary
- 🚫 **0 Blockers** (must fix before proceeding)
- ⚠️ **0 Warnings** (should address before ship)
- 💡 **0 Suggestions** (optional improvements)

## Critical Issues (BLOCKER)
None found.

## Warnings
None found.

## Suggestions
None found.

## Files Reviewed
1. src/test/standards-enforcement.smoke.test.ts
2. src/commands/review.integration.test.ts

## Conclusion
✅ All files meet project standards. Ready to proceed with harden validation.
```

**Important**:
- If you found BLOCKER issues in Step 6 (Option C), document them in the report and STOP - do not proceed to Command Execution
- If you found only warnings (Option B) or no issues (Option A), generate the report and proceed to Command Execution

## Command Execution (After Pre-Check and Report Generation)

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