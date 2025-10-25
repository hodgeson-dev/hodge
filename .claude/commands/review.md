---
description: Run quality checks and analyze code changes
argument-hint: [--file <path>] [--directory <path>] [--last <N>]
---

┌─────────────────────────────────────────────────────────┐
│ 🔍 Review: Advisory Code Review                        │
└─────────────────────────────────────────────────────────┘

## Response Parsing (AI Instructions)

When user responds to choice prompts:
- "a" or "b" etc. → select single option
- "a,b" or "a, b" → select multiple options (comma-separated, if applicable)
- "r" → select all options marked with ⭐ (when 2+ recommendations exist)
- "a, and [modification]" → select option with user's changes applied
- Invalid (e.g., "7" when options are a-c) → use collaborative error recovery

## Overview

The `/review` command provides AI-orchestrated advisory code reviews for arbitrary file scopes with a review-first workflow. Unlike `/harden` which focuses on production readiness, `/review` helps you understand code quality issues before deciding what to fix.

**Supported Scopes:**
- `--file <path>` - Review single file
- `--directory <path>` - Review directory (all git-tracked files recursively)
- `--last <N>` - Review files from last N commits

**Workflow:**
1. **Review First**: CLI generates manifest and runs quality checks
2. **AI Interprets**: You read findings and explain issues conversationally
3. **Optional Fixes**: User chooses what to fix (if anything)
4. **Verify**: Re-run checks after fixes to confirm they worked

## Step 1: Execute Review Command

Parse the user's scope flags and execute the appropriate command:

**For single file review:**
```bash
hodge review --file src/lib/config.ts
```

**For directory review:**
```bash
hodge review --directory src/commands/
```

**For recent commits review:**
```bash
hodge review --last 3
```

The CLI will:
- Discover files using git utilities (validates tracked files)
- Generate review manifest with FULL tier and scope metadata
- Run quality checks (scoped where possible, project-wide for tools like tsc)
- Create review directory at `.hodge/reviews/review-{scope}-{target}-{timestamp}/`
- Write `review-manifest.yaml` and `quality-checks.md`
- Output directory path for you to read

## Step 2: Read Review Files

The CLI outputs the review directory path. Read the generated files:

```bash
cat .hodge/reviews/review-{scope}-{target}-{timestamp}/review-manifest.yaml
cat .hodge/reviews/review-{scope}-{target}-{timestamp}/quality-checks.md
```

**Important**: The exact directory name will be in the CLI output. Use that path.

## Step 3: Load Context Files (Based on Manifest)

The review manifest includes context files to load. For `/review`, always use **FULL tier** context:

**MUST load (from manifest)**:
1. `.hodge/standards.md` (project standards)
2. `.hodge/principles.md` (project principles)
3. `.hodge/decisions.md` (project decisions)
4. Each file in `matched_patterns.files[]` (prepend `.hodge/patterns/`)
5. Each file in `matched_profiles.files[]` (prepend `.hodge/review-profiles/`)
6. Each file in `lessons_learned.files[]` (prepend `.hodge/lessons/`)

**Context Application Precedence** (when conflicts arise):
1. **standards.md** = HIGHEST - Always takes precedence
2. **principles.md** = Guide interpretation of standards
3. **decisions.md** = Project-specific choices
4. **patterns/** = Reference implementations
5. **review-profiles/** = External best practices (lowest precedence)

## Step 4: Interpret Findings and Present to User

Parse `quality-checks.md` to understand what tools found:

**Your Analysis**:
- Identify issues by severity (errors vs warnings)
- Explain what each issue means in plain language
- Reference relevant standards/patterns/profiles
- Distinguish auto-fixable issues (formatters, linters) from manual issues (type errors, logic bugs)
- Consider scope context (user chose these specific files for a reason)

**Present Findings Conversationally**:
```
I reviewed {N} files in {scope} and found:

**Blockers** (must fix):
- {issue 1} in {file}:{line} - {explanation}
- {issue 2} in {file}:{line} - {explanation}

**Warnings** (should address):
- {issue 3} in {file}:{line} - {explanation}

**Suggestions** (optional improvements):
- {issue 4} in {file}:{line} - {explanation}

{Provide context about why these issues matter, reference standards/patterns}
```

**No Issues Found**:
If quality checks show all tools passed with no output, celebrate!
```
✅ No issues found! All {N} files in {scope} meet quality standards.

- Type checking: ✓ Passed
- Linting: ✓ Passed
- Testing: ✓ Passed
- Formatting: ✓ Passed

{Brief summary of what was checked}
```

## Step 5: Facilitate Fix Selection

Ask the user which issues they want to fix:

```
Would you like to fix any of these issues?

🔔 YOUR RESPONSE NEEDED

You can:

a) ⭐ Fix all auto-fixable issues (Recommended)
b) Select specific issues to fix
c) Skip fixes and just document findings

💡 Tip: You can modify any choice, e.g., "a, and also run tests after fixing"

👉 Your choice [a/b/c]:
```

**Handle User Response**:
- **Option (a)**: Proceed to Step 6 with all auto-fixable issues
- **Option (b)**: Let user specify (e.g., "1, 3, 5" or "issues in config.ts" or "just the blockers")
- **Option (c)**: Skip to Step 8 (write report, no fixes)
- **Questions**: If user asks for clarification, provide detailed analysis conversationally, then return to this question

## Step 6: Apply Fixes (If User Chooses)

### Step 6a: Auto-Fix First

Run auto-fix for formatters and linters:

```bash
hodge review --file src/lib/config.ts --fix
```

Use the **same scope flags** as Step 1. The `--fix` flag runs:
- Formatters first (prettier, black, google-java-format, ktlint)
- Then linters (eslint --fix, ruff --fix)

**Note**: Auto-fix modifies files but doesn't stage them (non-intrusive).

### Step 6b: Manual Fixes (If Needed)

For issues that can't be auto-fixed (type errors, logic bugs, complex refactoring):

Use the **Edit tool** to apply fixes:
```typescript
// Example: Fix type error
Edit({
  file_path: "src/lib/config.ts",
  old_string: "const value: string = 123;",
  new_string: "const value: number = 123;"
});
```

**Important**: Apply fixes thoughtfully. Explain changes to the user as you make them.

## Step 7: Re-run Quality Checks

After applying fixes, verify they worked:

```bash
hodge review --file src/lib/config.ts
```

Use the **same scope flags** as Step 1 (without `--fix`).

This will:
- Create a new review directory with fresh results
- Show updated quality check output
- Confirm fixes resolved the issues

Read the new results and report back to the user:
```
✅ Fixes verified! Re-running quality checks shows:

{Summary of what changed}
- Type errors: {N} → 0
- Linting issues: {N} → 0

{Confirmation that specific issues are resolved}
```

## Step 8: Write Review Report

Use the **Write tool** to create a review report documenting findings and fixes:

```markdown
# Code Review Report: {scope} - {target}

**Reviewed**: {ISO timestamp}
**Scope**: {scope type} - {target}
**Files Reviewed**: {N} files

## Summary
- 🚫 **{N} Blockers** (must fix)
- ⚠️ **{N} Warnings** (should address)
- 💡 **{N} Suggestions** (optional improvements)

## Findings

### Blockers

[List blocker issues found, with file:line references]

### Warnings

[List warning issues found]

### Suggestions

[List suggestion-level issues]

## Fixes Applied

{If fixes were applied:}
- Auto-fixed: {list of formatter/linter fixes}
- Manual fixes: {list of Edit tool changes}
- Verification: All fixes verified via re-run

{If no fixes applied:}
No fixes applied at user's request. Issues documented for future reference.

## Conclusion

{Overall assessment of code quality}
{Recommendations for next steps if any issues remain}
```

Save the report to the review directory:

```typescript
Write({
  file_path: ".hodge/reviews/review-{scope}-{target}-{timestamp}/review-report.md",
  content: "{report content from above}"
});
```

## Step 9: Conclude Review

Inform the user that the review is complete:

```
✅ Review complete!

**Summary**:
- Reviewed {N} files in {scope}: {target}
- {Issues summary}
- {Fixes summary if applicable}

**Review report saved** to:
.hodge/reviews/review-{scope}-{target}-{timestamp}/review-report.md

You can reference this review later or delete the directory if no longer needed.

{If issues remain, provide guidance on next steps}
```

## Important Notes

### Review vs Harden

`/review` is **advisory** (understand → optionally fix):
- Review first, fix optionally
- All files reviewed equally (no critical selection)
- Always FULL tier (comprehensive analysis)
- User controls what gets fixed

`/harden` is **production validation** (fix → validate):
- Auto-fix first, then validate
- Critical files prioritized by risk
- Tier varies based on change size
- Errors must be fixed before shipping

### Edge Cases

**Empty File Lists**:
If CLI reports "No files to review", explain why:
- File not found or not git-tracked → Suggest `git add`
- Directory has no tracked files → Check `.gitignore`
- No commits in range → Verify git history

**Large Scope Warnings**:
If CLI warns about large scope (e.g., `--last 100` with 500 files), acknowledge:
- Processing may take time
- Consider reducing scope if it's too much
- User explicitly chose this scope, so respect their decision

**Tool Failures**:
If quality-checks.md shows tools skipped or failed:
- Explain what happened (tool not found, configuration issue)
- Note that findings may be incomplete
- Suggest installing missing tools if needed

### Quality Check Scoping

Some tools receive scoped file lists, others run project-wide:

**Scoped** (only check specified files):
- eslint
- prettier
- black
- ruff

**Project-wide** (always check entire project):
- tsc (TypeScript)
- vitest (tests need full context)

This is documented in quality-checks.md for each tool.

## Error Handling

If the command fails:
- Check error message for specific issue
- Common causes: invalid path, file not tracked, git command failed
- Provide guidance based on error type
- Don't crash the conversation - help user recover

## What's Next?

After review completes:

```
### What's Next?

Review findings documented in `.hodge/reviews/{{filename}}.md`

• Address critical issues found in the review
• Continue with current workflow (`/build`, `/harden`, `/ship`)
• Run another review: `/review --file <path>` or `/review --directory <path>`
• `/status {{feature}}` - Check feature progress

💡 Tip: Use /review anytime to get targeted code quality feedback.
```

ARGUMENTS: {{flags}}
