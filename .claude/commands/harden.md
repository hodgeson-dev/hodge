---
description: Add integration tests and validate production readiness
argument-hint: <feature-id>
---

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔧 Harden: Production Readiness                         │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Harden:" prefix for context awareness
- ✅ Section name matches exactly as shown

## Response Parsing (AI Instructions)

When user responds to choice prompts:
- "a" or "b" etc. → select single option
- "a,b" or "a, b" → select multiple options (comma-separated, if applicable)
- "r" → select all options marked with ⭐ (when 2+ recommendations exist)
- "a, and [modification]" → select option with user's changes applied
- Invalid (e.g., "7" when options are a-d) OR uncertain (e.g., "maybe b?") → use collaborative error recovery:
  - Detect uncertainty patterns: "maybe", "?", "not sure", "either"
  - Offer repair options, never just reject
  - Example: "Hmm, I got 'maybe b?' - sounds uncertain. Let me help clarify: a) Continue with b, b) Explain options better, c) Start over"

## Step 0: Auto-Fix Simple Issues (HODGE-341.6)

**Run auto-fix FIRST to fix simple formatting and linting issues automatically.**

### Stage Your Changes
```bash
git add .
```

### Run Auto-Fix
```bash
hodge harden {{feature}} --fix
```

**What this does**:
- Runs formatters first: prettier, black, ktlint, google-java-format
- Then runs linters: eslint --fix, ruff --fix
- Automatically re-stages modified files
- Saves report to `.hodge/features/{{feature}}/harden/auto-fix-report.json`

**Communication flow**: Tools → CLI → AI → User

**What gets auto-fixed**:
- Code formatting issues
- Simple linting violations (unused imports, trailing whitespace, etc.)
- Style inconsistencies

**What requires manual fixing**:
- Type errors (handled in review step)
- Test failures (handled in review step)
- Complex logic errors (AI assists via Edit tool)
- Architectural issues (AI assists via Edit tool)

### Review Auto-Fix Results
```bash
git diff
```

Check what was changed. If auto-fix made unexpected changes, you can:
- Revert specific changes: `git checkout -- <file>`
- Stage additional fixes manually: `git add <file>`

**After auto-fix completes, proceed to Step 1 (Generate Review Manifest).**

---

## ⚠️ REQUIRED: Pre-Harden Code Review

**STOP! You MUST complete this AI Code Review BEFORE running the harden command.**

## Critical Workflow Rule

**ERRORS MUST BE FIXED BEFORE VALIDATION**

This workflow has a hard gate at Step 6:
- If quality checks show ERRORS → STOP, fix them, re-run from Step 0 (auto-fix)
- If only WARNINGS → Proceed to validation (address warnings before ship)
- If clean → Proceed to validation

The CLI validation will fail on errors anyway. Catching them in pre-check saves time.

────────────────────────────────────────────────────────────
📍 Step 1 of 7: Generate Review Manifest
────────────────────────────────────────────────────────────

Remaining:
  ○ Read Review Manifest
  ○ Choose Review Tier
  ○ Load Context Files
  ○ Conduct AI Review
  ○ Assess Findings
  ○ Generate Review Report

## Check for Relevant Lessons

Before starting the harden workflow, check for lessons related to the changes:

```bash
# Check for lessons based on modified files
git diff --name-only | xargs -I {} hodge lessons --match "testing,quality,validation" --files "{}"
```

**Display any high-confidence + critical lessons as proactive prompts** (see /build template for format).

### Step 1: Generate Review Manifest
**Analyze changes and generate tiered review manifest:**

```bash
hodge harden {{feature}} --review
```

This command will:
1. Analyze changed files (via git diff with line counts)
2. Run quality checks (lint, typecheck, tests, etc.) and generate validation-results.json
3. Select critical files for deep review (included in review-manifest.yaml)
4. Classify changes into review tier (SKIP/QUICK/STANDARD/FULL)
5. Filter relevant patterns and review profiles
6. Generate review-manifest.yaml with:
   - Recommended tier and reason
   - Changed files list with line counts
   - Critical files section with risk-ranked priorities
   - Context files to load (organized by precedence)
   - Matched patterns and profiles

────────────────────────────────────────────────────────────
📍 Step 2 of 7: Read Review Manifest
────────────────────────────────────────────────────────────

Previously completed:
  ✓ Generate Review Manifest

Remaining:
  ○ Choose Review Tier
  ○ Load Context Files
  ○ Conduct AI Review
  ○ Assess Findings
  ○ Generate Review Report

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

### Step 2.5: Read Validation Results (REQUIRED)
```bash
# Read structured validation data
cat .hodge/features/{{feature}}/harden/validation-results.json
```

This contains structured results from all quality checks with extracted errors and warnings:
- **Structured format**: JSON array with errorCount, warningCount, errors[], warnings[] for each tool
- **Organized by tool**: Each entry shows tool name, exit code, and extracted findings
- **Parsed diagnostics**: Errors and warnings extracted via regex patterns

**Your task**: Parse this JSON to identify:
- **ERRORS**: Tools with errorCount > 0 or exitCode != 0 that must be fixed before proceeding
- **WARNINGS**: Tools with warningCount > 0 to address before ship

The JSON structure makes it easy to programmatically assess status and extract specific issues.

### Step 2.6: Read Critical Files Section (HODGE-360)
Critical files are now included in review-manifest.yaml under the `critical_files` section (already loaded in Step 2).

**Check if critical_files section exists in the manifest you read:**
```yaml
critical_files:
  algorithm: "risk-weighted-v1.0"
  total_files: 46
  top_n: 10
  files:
    - path: "src/lib/toolchain-service.ts"
      rank: 1
      score: 116
      risk_factors:
        - "1 blocker issue"
        - "large change (227 lines)"
```

This shows which files the algorithm scored as highest risk based on:
- **Tool diagnostics**: Blockers, warnings, errors from validation-results.json
- **Import fan-in**: Architectural impact (how many files import this file)
- **Change size**: Lines modified
- **Critical paths**: Configured + inferred critical infrastructure

The section shows:
- Top N files (default 10) ranked by risk score
- Risk factors for each file explaining the score

────────────────────────────────────────────────────────────
📍 Step 3 of 7: Choose Review Tier
────────────────────────────────────────────────────────────

Previously completed:
  ✓ Generate Review Manifest
  ✓ Read Review Manifest

Remaining:
  ○ Load Context Files
  ○ Conduct AI Review
  ○ Assess Findings
  ○ Generate Review Report

### Step 3: Choose Review Tier
Based on the manifest's `recommended_tier`, choose your review tier:

**Tier Options:**
- **SKIP**: Pure documentation changes (no code review needed)
- **QUICK**: Test/config only, ≤3 files, ≤50 lines (~1K lines of context)
- **STANDARD**: Implementation changes, ≤10 files, ≤200 lines (~3K lines of context)
- **FULL**: Major changes or critical paths (~8K lines of context)

**Default**: Use the recommended tier unless you have a reason to override.

────────────────────────────────────────────────────────────
📍 Step 4 of 7: Load Context Files
────────────────────────────────────────────────────────────

Previously completed:
  ✓ Generate Review Manifest
  ✓ Read Review Manifest
  ✓ Choose Review Tier

Remaining:
  ○ Conduct AI Review
  ○ Assess Findings
  ○ Generate Review Report

### Step 4: Load Context Files (MANDATORY - NO EXCEPTIONS)

**CRITICAL**: You MUST load ALL context files listed in review-manifest.yaml before conducting your review. These files define the standards you're reviewing against.

**⚠️ DO NOT SKIP LOADING PROFILES**:
- Review profiles are compressed YAML format (~1-2KB each)
- They contain essential best practices for the tech stack
- Skipping them results in incomplete/incorrect reviews
- Token budget is 200K - profiles typically use <5K tokens total
- If you consider skipping due to tokens, CHECK YOUR REMAINING BUDGET FIRST

#### Step 4a: Parse the Manifest

Identify which files to load from the review-manifest.yaml you read in Step 2.

**For ALL tiers**, load (NO EXCEPTIONS):
1. `.hodge/standards.md` (from `project_standards.path`)
2. `.hodge/principles.md` (from `project_principles.path`)
3. **EVERY file** in `matched_patterns.files[]` (prepend `.hodge/patterns/`)
4. **EVERY file** in `matched_profiles.files[]` (prepend `.hodge/review-profiles/`)

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

#### Step 4c: Verification Checklist (BLOCKER - Must Complete)

**STOP! Before proceeding to Step 5, you MUST confirm you loaded ALL files:**

✅ **Required for ALL tiers**:
- [ ] standards.md - LOADED
- [ ] principles.md - LOADED
- [ ] All files from `matched_patterns.files[]` - COUNT: ___ files LOADED
- [ ] **All files from `matched_profiles.files[]`** - COUNT: ___ files LOADED ⚠️ NEVER SKIP

✅ **Required for FULL tier only**:
- [ ] decisions.md - LOADED (or N/A if not FULL tier)
- [ ] All files from `lessons_learned.files[]` - COUNT: ___ files LOADED (or N/A if not FULL tier)

**If you cannot check ALL boxes above, DO NOT PROCEED to Step 5.**
**Go back and load the missing files. NO EXCEPTIONS.**

**Precedence Rules** (when conflicts arise):
1. **standards.md** = HIGHEST - Always takes precedence
2. **principles.md** = Guide interpretation of standards
3. **decisions.md** = Project-specific choices
4. **patterns/** = Reference implementations
5. **review-profiles/** = External best practices (lowest precedence)

**Example**: If a review profile suggests "always use async", but standards.md says "only use async when necessary", the standard wins.

────────────────────────────────────────────────────────────
📍 Step 5 of 7: Conduct AI Code Review (MANDATORY - NO SKIP)
────────────────────────────────────────────────────────────

Previously completed:
  ✓ Generate Review Manifest
  ✓ Read Review Manifest
  ✓ Choose Review Tier
  ✓ Load Context Files (verified via Step 4c checklist)

Remaining:
  ○ Conduct Review (Step 5)
  ○ Document Findings (Step 5.6 - MANDATORY DELIVERABLE)
  ○ Assess Findings (Step 6)
  ○ Generate Review Report (Step 7)

### Step 5: Conduct AI Code Review

**🚫 BLOCKER**: This step is MANDATORY. You cannot skip directly to Step 6.

**⚠️ PREREQUISITE CHECK**: Did you complete Step 4c verification checklist?
- If NO, return to Step 4 immediately
- If YES, proceed with review
- **You MUST complete Step 5.6 (Document Findings) before proceeding to Step 6**

**Review Strategy**: Use the context files you loaded in Step 4 to assess the code.

**How to apply context during review** (in order of precedence):
1. **Check standards.md first** - Does code violate any project standards?
2. **Apply principles.md** - Does code align with project philosophy?
3. **Reference patterns/** - Does code follow established patterns?
4. **Apply profiles/** - Does code follow language/framework best practices? ⚠️ YOU LOADED THESE IN STEP 4
5. **Learn from lessons/** (FULL tier) - Have we made this mistake before?

**For HODGE-360 Risk-Based Review**:
- **Critical files** (from manifest critical_files section): Deep review against ALL loaded context
- **Files with tool issues** (from validation-results.json): Check specific violations
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

**Self-Check Questions** (ALL must be YES):
- [ ] Did I reference specific standards from standards.md in my findings?
- [ ] Did I check for Test Isolation violations (mandatory standard)?
- [ ] Did I apply progressive enforcement rules based on current phase?
- [ ] **Did I apply review profiles to check language/framework best practices?** ⚠️ CRITICAL
- [ ] Did I consider precedence when conflicts arose?
- [ ] Can I cite which standard/profile each issue violates in my review report?

**If you answered NO to ANY question above:**
1. Return to Step 4 and re-load the context files you missed
2. Re-conduct your review with ALL context applied
3. DO NOT proceed to Step 5.6

**The purpose of loading context is to APPLY it, not just read it.**

**Specific Profile Check**: Look at your review report draft - does it reference any of the profiles you loaded? If not, you didn't actually apply them. Go back and review against profile rules.

### Step 5.6: Document Review Findings (MANDATORY - NO SKIP)

**🚫 BLOCKER**: You MUST complete this step before proceeding to Step 6.

**Output your review findings to the user NOW** in this format:

```
## 📋 AI CODE REVIEW RESULTS

### Standards Checked:
- ✅ standards.md: [List specific rules checked]
- ✅ principles.md: [List principles verified]
- ✅ Patterns: [List patterns checked]
- ✅ Profiles: [List profiles applied - MUST include all loaded profiles]

### Critical Files Reviewed:
[List each critical file from manifest with findings]

### Findings by Severity:
**BLOCKERS (0)**
[List each blocker with file:line, violated rule, and profile/standard reference]

**WARNINGS (N)**
[List each warning with file:line, violated rule, and profile/standard reference]

**SUGGESTIONS (N)**
[List each suggestion with file:line, violated rule, and profile/standard reference]

### Standards Compliance:
- Test Isolation (MANDATORY): [✅ or ❌ with details]
- No Subprocess Spawning (CRITICAL): [✅ or ❌ with details]
- TypeScript Strict Mode (MANDATORY): [✅ or ❌ with details]
- [Other mandatory rules]: [✅ or ❌ with details]
```

**IMPORTANT**:
- This output proves you conducted the review
- It will be used in Step 6 to assess next actions
- If you cannot produce this output with specific rule references, you did NOT conduct the review
- DO NOT proceed to Step 6 until you output this to the user

────────────────────────────────────────────────────────────
📍 Step 6 of 7: Assess Review Findings
────────────────────────────────────────────────────────────

Previously completed:
  ✓ Generate Review Manifest
  ✓ Read Review Manifest
  ✓ Choose Review Tier
  ✓ Load Context Files
  ✓ Conduct AI Review
  ✓ Document Review Findings (Step 5.6)

Remaining:
  ○ Generate Review Report

### Step 6: Assess Review Findings

**⚠️ PREREQUISITE CHECK**: Did you complete Step 5.6 and output review findings to the user?
- If NO, return to Step 5.6 immediately - DO NOT SKIP THIS STEP
- If YES, proceed with assessment

After reviewing all files and documenting your findings in Step 5.6, determine if there are blocking issues.

**Question**: Did you find any ERRORS (not warnings) in validation-results.json or during code review?

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

#### If NO (Only Warnings or Clean) → Get User Decision on Fixes ✅

Present findings to the user and let them choose what to fix:

**Scenario A: Mandatory + Warnings Found**
```
🔔 YOUR RESPONSE NEEDED

I found issues in your code:

**Mandatory (blocking ship):**
- [list each mandatory issue with file:line]

**Warnings:**
- [list each warning with file:line]

What would you like to do?

a) ⭐ Fix mandatory issues (Recommended)
b) ⭐ Fix mandatory + warnings (Recommended)
c) Review issues first, then decide
d) Skip for now (ship will be blocked)

💡 Tip: You can modify any choice, e.g., "a, and also run tests after"

👉 Your choice [a/b/c/d or r for all recommended]:
```

**Scenario B: Only Mandatory Issues Found**
```
🔔 YOUR RESPONSE NEEDED

I found mandatory issues in your code:

**Mandatory (blocking ship):**
- [list each mandatory issue with file:line]

What would you like to do?

a) ⭐ Fix mandatory issues (Recommended - required for ship)
b) Review issues first, then decide
c) Skip for now (ship will be blocked)

💡 Tip: You can modify any choice, e.g., "a, and run tests after"

👉 Your choice [a/b/c]:
```

**Scenario C: Only Warnings Found**
```
🔔 YOUR RESPONSE NEEDED

I found warnings in your code:

**Warnings:**
- [list each warning with file:line]

What would you like to do?

a) ⭐ Fix all warnings (Recommended)
b) Select specific warnings to fix
c) Review issues first, then decide
d) Skip warnings (you can ship without fixing these)

💡 Tip: You can modify any choice, e.g., "b, just the file length warnings"

👉 Your choice [a/b/c/d]:
```

**Scenario D: No Issues Found**
```
✅ STANDARDS PRE-CHECK PASSED
All standards requirements appear to be met.
No errors or warnings found. Ready to proceed with validation.
```

**After User Choice:**
- **(a) Fix mandatory** → Use Edit tool to fix mandatory issues, then proceed to Step 7
- **(b) Fix mandatory + warnings** → Use Edit tool to fix all issues, then proceed to Step 7
- **(c) Review first** → Show detailed analysis of each issue, then re-present the choice
- **(d) Skip** → Proceed to Step 7 (document that issues remain)

────────────────────────────────────────────────────────────
📍 Step 7 of 7: Generate Review Report
────────────────────────────────────────────────────────────

Previously completed:
  ✓ Generate Review Manifest
  ✓ Read Review Manifest
  ✓ Choose Review Tier
  ✓ Load Context Files
  ✓ Conduct AI Review
  ✓ Assess Findings

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
- [ ] validation-results.json shows 0 errors (warnings are OK)
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
hodge harden {{feature}} --fix         # Auto-fix staged files (see Step 0)
```

**Note**: The `--fix` flag should be run as Step 0 (before review). See the top of this file for the complete auto-fix workflow.

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

## What's Next?

After completing the harden workflow, check validation status:

```bash
hodge status {{feature}}
```

Based on the status output:

**If "Production Ready" shows ✓ (all validation passed):**
```
### What's Next?

🎉 Feature is production-ready! All quality gates passed.

• `/ship {{feature}}` - Ship to production (Recommended)
• `/review` - Optional final code review
• `/status {{feature}}` - Check overall feature status
• `/save` - Save your progress

💡 Tip: You're ready to ship! All tests pass and quality gates are green.
```

**If "Production Ready" shows ○ (validation issues remain):**
```
### What's Next?

There are still issues blocking production readiness.

• Review validation-results.json for specific issues
• Fix failing tests or quality checks
• Re-run `/harden {{feature}} --fix` to auto-fix simple issues
• Re-run `/harden {{feature}} --review` after fixes
• `/build {{feature}}` - Return to build if major changes needed

💡 Tip: Address all ERRORS before shipping. Warnings can be addressed but won't block.
```

**If harden workflow was interrupted:**
```
### What's Next?

• `/harden {{feature}}` - Continue or restart harden workflow
• `/status {{feature}}` - Check what's been completed
• `/build {{feature}}` - Return to build if needed
• `/save` - Save your progress

💡 Tip: Complete the full harden workflow to validate production readiness.
```

## Important Notes
1. **The AI Standards Pre-Check is MANDATORY** - Never skip it
2. **Document your pre-check findings** - Include them in your response
3. **Be honest about issues** - Better to catch them now than in production
4. **Learn from mismatches** - If CLI finds issues you missed, understand why

Remember: The pre-check helps YOU catch issues early and understand the codebase better. The CLI validates, but YOUR review provides context and understanding.

ARGUMENTS: {{feature}}