# Hodge Harden Mode

## ⚠️ REQUIRED: Pre-Harden Code Review

**STOP! You MUST complete this AI Code Review BEFORE running the harden command.**

## Critical Workflow Rule

**ERRORS MUST BE FIXED BEFORE VALIDATION**

This workflow has a hard gate at Step 6:
- If quality checks show ERRORS → STOP, fix them, re-run from Step 1
- If only WARNINGS → Proceed to validation (address warnings before ship)
- If clean → Proceed to validation

The CLI validation will fail on errors anyway. Catching them in pre-check saves time.

### Step 1: Generate Review Manifest
**Analyze changes and generate tiered review manifest:**

```bash
hodge harden {{feature}} --review
```

This command will:
1. Analyze changed files (via git diff with line counts)
2. Run quality checks (lint, typecheck, tests, etc.) and generate quality-checks.md
3. Select critical files for deep review and generate critical-files.md
4. Classify changes into review tier (SKIP/QUICK/STANDARD/FULL)
5. Filter relevant patterns and review profiles
6. Generate review-manifest.yaml with:
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

### Step 2.5: Read Quality Checks Report (REQUIRED)
```bash
# Read tool diagnostics (optimized for conciseness)
cat .hodge/features/{{feature}}/harden/quality-checks.md
```

This contains output from all quality checks. The toolchain has been configured to minimize noise:
- **Concise formats**: ESLint uses compact format (one issue per line), Vitest uses dot reporter
- **Minimal verbosity**: Tools suppress progress bars and extra formatting
- **Organized by check type**: Type checking, linting, testing, formatting, etc.

**Your task**: Parse this output to identify:
- **ERRORS**: Type errors, failing tests, ESLint errors that must be fixed before proceeding
- **WARNINGS**: ESLint warnings, code quality issues to address before ship

The file may be ~500 lines with issues, or very short when clean. Read the entire file to assess status.

### Step 2.6: Read Critical Files Manifest (HODGE-341.3)
```bash
# Read critical file analysis
cat .hodge/features/{{feature}}/harden/critical-files.md
```

This shows which files the algorithm scored as highest risk based on:
- **Tool diagnostics**: Blockers, warnings, errors from quality checks
- **Import fan-in**: Architectural impact (how many files import this file)
- **Change size**: Lines modified
- **Critical paths**: Configured + inferred critical infrastructure

The report shows:
- Top N files (default 10) ranked by risk score
- Risk factors for each file
- Inferred critical paths (files with >20 imports)
- Configured critical paths (from .hodge/toolchain.yaml)

### Step 3: Choose Review Tier
Based on the manifest's `recommended_tier`, choose your review tier:

**Tier Options:**
- **SKIP**: Pure documentation changes (no code review needed)
- **QUICK**: Test/config only, ≤3 files, ≤50 lines (~1K lines of context)
- **STANDARD**: Implementation changes, ≤10 files, ≤200 lines (~3K lines of context)
- **FULL**: Major changes or critical paths (~8K lines of context)

**Default**: Use the recommended tier unless you have a reason to override.

### Step 4: Load Context Files (MANDATORY)

**IMPORTANT**: You MUST load the context files listed in review-manifest.yaml before conducting your review. These files define the standards you're reviewing against.

#### Step 4a: Parse the Manifest

Identify which files to load from the review-manifest.yaml you read in Step 2.

**For ALL tiers**, load:
1. `.hodge/standards.md` (from `project_standards.path`)
2. `.hodge/principles.md` (from `project_principles.path`)
3. Each file in `matched_patterns.files[]` (prepend `.hodge/patterns/`)
4. Each file in `matched_profiles.files[]` (prepend `.hodge/review-profiles/`)

**For FULL tier ONLY**, also load:
5. `.hodge/decisions.md` (from `project_decisions.path`)
6. Each file in `lessons_learned.files[]` (prepend `.hodge/lessons/`)

#### Step 4b: Load Files Using Read Tool

**Example from HODGE-341.3 manifest** (yours will be different):

The manifest shows:
```yaml
matched_patterns:
  files:
    - test-pattern.md
    - error-boundary.md
matched_profiles:
  files:
    - testing/vitest-3.x.md
    - languages/typescript-5.x.md
```

So you would load:
```
Read: .hodge/standards.md
Read: .hodge/principles.md
Read: .hodge/patterns/test-pattern.md
Read: .hodge/patterns/error-boundary.md
Read: .hodge/review-profiles/testing/vitest-3.x.md
Read: .hodge/review-profiles/languages/typescript-5.x.md
Read: .hodge/decisions.md  # (FULL tier only)
```

**Note**: Extract the file list from YOUR review-manifest.yaml. Don't hardcode these paths - they change per feature.

#### Step 4c: Verification Checklist

Before proceeding to Step 5, confirm you loaded:
- [ ] standards.md
- [ ] principles.md
- [ ] All files from `matched_patterns.files[]`
- [ ] All files from `matched_profiles.files[]`
- [ ] (FULL only) decisions.md
- [ ] (FULL only) All files from `lessons_learned.files[]`

**Precedence Rules** (when conflicts arise):
1. **standards.md** = HIGHEST - Always takes precedence
2. **principles.md** = Guide interpretation of standards
3. **decisions.md** = Project-specific choices
4. **patterns/** = Reference implementations
5. **review-profiles/** = External best practices (lowest precedence)

**Example**: If a review profile suggests "always use async", but standards.md says "only use async when necessary", the standard wins.

### Step 5: Conduct AI Code Review

**Review Strategy**: Use the context files you loaded in Step 4 to assess the code.

**How to apply context during review**:
1. **Check standards.md first** - Does code violate any project standards?
2. **Apply principles.md** - Does code align with project philosophy?
3. **Reference patterns/** - Does code follow established patterns?
4. **Consider profiles/** - Does code follow language/framework best practices?
5. **Learn from lessons/** (FULL tier) - Have we made this mistake before?

**For HODGE-341.3 Risk-Based Review**:
- **Critical files** (from critical-files.md): Deep review against ALL loaded context
- **Files with tool issues** (from quality-checks.md): Check specific violations
- **Other changed files**: Scan for obvious standards violations

**What to look for**:
- Standards violations (especially BLOCKER severity)
- Test isolation violations (CRITICAL - see standards.md)
- TODO format violations (see standards.md)
- Cognitive complexity (see standards.md + profiles)
- File/function length standards
- Progressive enforcement rules (depends on phase)

**When you find an issue**:
1. Determine severity using standards.md definitions (BLOCKER/WARNING/SUGGESTION)
2. Note which standard/principle/profile it violates
3. Consider precedence if multiple sources conflict
4. Document in your review report with file:line reference

### Step 5.5: Verify Context Application

Before moving to Step 6, confirm you actually USED the context files:

**Self-Check Questions**:
- Did I reference specific standards from standards.md in my findings?
- Did I check for Test Isolation violations (mandatory standard)?
- Did I apply progressive enforcement rules based on current phase?
- Did I consider precedence when conflicts arose?
- Can I cite which standard/profile each issue violates?

**If you can't answer YES to these questions, return to Step 4 and re-load context.**

The purpose of loading context is to APPLY it, not just read it.

### Step 6: Assess Review Findings

After reviewing all files, determine if there are blocking issues.

**Question**: Did you find any ERRORS (not warnings) in quality-checks.md or during code review?

#### If YES (Errors Found) → STOP HERE 🚫

```
🚫 STANDARDS PRE-CHECK FAILED - Blocking Issues Found

[List all errors with file:line references]

**MANDATORY**: Fix ALL errors before proceeding to harden validation.

Next steps:
1. Fix each error listed above
2. Re-run quality checks: `hodge harden {{feature}} --review`
3. Verify errors are resolved
4. Return to Step 2 of this workflow

DO NOT proceed to Step 7 until all errors are resolved.
```

**Why this blocks**: Harden phase is "discipline mode". Errors indicate code that doesn't meet basic standards. The CLI validation will fail anyway, so catching errors early saves time.

#### If NO (Only Warnings or Clean) → Proceed to Step 7 ✅

Choose the appropriate status:

**Option A: No Issues Found**
```
✅ STANDARDS PRE-CHECK PASSED
All standards requirements appear to be met.
No errors or warnings found. Ready to proceed with validation.
```

**Option B: Warnings Only**
```
⚠️ STANDARDS PRE-CHECK - Warnings Found:

[List specific warnings, e.g.:]
1. File length warnings in src/commands/harden.ts:445
2. Cognitive complexity in src/lib/critical-file-selector.ts:127
3. TODO comments need phase markers

These are WARNINGS (not blockers). Proceeding with harden validation.
Should address before ship phase.
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
- If you found ERRORS in Step 6, document them in the report and STOP - do not proceed to Command Execution
- If you found only warnings (Option B) or no issues (Option A), generate the report and proceed to Command Execution

## Command Execution (Only After Errors Are Fixed)

**CHECKPOINT**: Before running this command, confirm:
- [ ] Quality-checks.md shows 0 errors (warnings are OK)
- [ ] Your Step 6 assessment was "Option A" or "Option B" (no blocking issues)
- [ ] All error-level issues have been fixed

**If you found errors in Step 6, DO NOT PROCEED. Return to fix them first.**

Ready to proceed? Execute the Hodge CLI command:
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