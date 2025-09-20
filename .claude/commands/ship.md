# 🚀 Hodge Ship Mode - Interactive Commit Experience

## Smart Ship Command
Execute the enhanced ship command with intelligent commit message generation:
```bash
hodge ship {{feature}}
```

## 🎯 Progressive Enhancement Active
This command adapts to Claude Code with:
- **Smart commit analysis** - Automatically detects type (feat/fix/docs) from your changes
- **Interactive markdown UI** - Review and edit commit messages right here
- **File-based state** - Seamless integration between CLI and Claude

## How It Works

### Step 1: Initial Analysis
```bash
hodge ship {{feature}}
```
The command will:
1. Analyze your git changes
2. Detect commit type and scope
3. Generate a smart commit message
4. Create an interactive UI file for you

### Step 2: Review & Edit (Claude Code Special)
When in Claude Code, the command creates:
- `.hodge/temp/ship-interaction/{{feature}}/ui.md` - Your interactive UI
- `.hodge/temp/ship-interaction/{{feature}}/state.json` - State tracking

You can edit the commit message directly in the markdown file!

**IMPORTANT: How to Continue After Editing:**
1. Edit the commit message in the `ui.md` file
2. Update the `state.json` file:
   - Change `"status": "pending"` to `"status": "confirmed"`
   - OR add your custom message to the `"customMessage"` field
3. Re-run the command - it will detect your changes and proceed

### Step 3: Finalize Ship
Re-run the command to use your edited message:
```bash
hodge ship {{feature}}        # Will detect confirmed state
# OR
hodge ship {{feature}} --yes   # Use suggested message as-is
```

## Options
```bash
hodge ship {{feature}} --skip-tests              # Skip tests (emergency only!)
hodge ship {{feature}} -m "Custom message"       # Direct message (skip interaction)
hodge ship {{feature}} --no-interactive          # Disable all interaction
hodge ship {{feature}} --yes                      # Accept suggested message
hodge ship {{feature}} --dry-run                  # Preview without committing
```

## What Gets Analyzed
The ship command intelligently examines:
- 📁 **File changes** - Added, modified, deleted files
- 🏷️ **Commit type** - feat, fix, docs, style, refactor, test, chore
- 📦 **Scope** - Detected from common directory patterns
- 💔 **Breaking changes** - Identified from specific patterns
- 🔗 **PM Integration** - Links to Linear/GitHub/Jira issues

## Standards Review Process (AI-Based STRICT Enforcement)

### 1. Load and Review Standards
```bash
cat .hodge/standards.md
```

### 2. Review ALL Changes Since Last Release
```bash
git diff main...HEAD  # All changes in feature branch
```

### 3. AI Standards Compliance Check (BLOCKING)
Review ALL changes against EVERY standard with ZERO tolerance:
- **Core Standards**: Must have TypeScript strict, ESLint clean, Prettier formatted
- **Testing Requirements**: Full test suite with >80% coverage
- **Code Comments/TODOs**: ALL TODOs must have proper phase markers
- **Quality Gates**: ZERO lint errors, ZERO type errors
- **Performance Standards**: ALL operations <500ms, tests <30s total

### 4. Report Violations (BLOCKING Level)
If ANY standards violations found, BLOCK shipping:
```
❌ STANDARDS REVIEW - Ship Blocked:

1. **TODO Format Violations** (3 found)
   src/commands/example.ts:45 - Missing phase marker
   src/lib/helper.ts:12 - Incomplete TODO without description
   tests/unit.test.ts:78 - Naked TODO

2. **Test Coverage Below 80%**
   Current: 72.3% - Required: 80%
   Missing coverage in: src/lib/validator.ts

3. **ESLint Errors** (2 found)
   no-explicit-any violations in src/types.ts

SHIP BLOCKED: All standards MUST be met before shipping.
Fix all violations and run /ship again.
```

## Testing Requirements (Progressive Model)
- **Ship Phase**: Full test suite required
- **Test Types**: All categories (smoke, integration, unit, acceptance)
- **Focus**: Is it production ready?
- **Run Command**: `npm test` - All tests must pass
- **Coverage**: Target >80% for shipped features

## Your Tasks Based on Results

### If Ship Succeeded ✅
1. All tests passed (full suite)
2. Copy the generated commit message
3. Commit your changes:
   ```bash
   git add .
   git commit -m "paste commit message here"
   ```
4. Push to main branch:
   ```bash
   git push origin main
   ```
5. Create release tag if needed:
   ```bash
   git tag v1.0.0
   git push --tags
   ```
6. Capture lessons learned (optional but valuable):
   ```markdown
   ## Lessons from {{feature}}

   **What worked well:**
   - [What approach or pattern was effective?]

   **What was challenging:**
   - [What took longer than expected?]

   **What to do differently next time:**
   - [What would you change?]

   Save to: .hodge/lessons/{{feature}}.md
   ```

7. Consider Global Improvements (if lessons suggest it):

   **Pattern Candidate?** If something worked particularly well:
   ```bash
   # Check if similar patterns exist
   grep -r "similar-concept" .hodge/patterns/

   # If novel and reusable, create pattern:
   cat > .hodge/patterns/{{pattern-name}}.md << 'EOF'
   # Pattern: {{Pattern Name}}

   ## Problem
   [What problem does this solve?]

   ## Solution
   [The approach that worked]

   ## Example from {{feature}}
   [Code or approach example]

   ## When to Use
   - [Scenario where this helps]
   EOF
   ```

   **Standards Gap?** If you hit a preventable issue:
   - Review if existing standards could have prevented it
   - If 3+ features hit the same issue, consider proposing a standard
   - Document in decisions: "Considering new standard based on {{feature}} lessons"

   **Review Similar Lessons:**
   ```bash
   # Check if others hit similar issues
   grep -r "similar-issue" .hodge/lessons/
   ```

   If pattern emerges across multiple features, elevate to team discussion.

8. Monitor production metrics

### If Ship Failed ❌
1. Review quality gate failures
2. Fix any issues:
   - **Tests failing**: Add missing test categories:
     - Smoke tests (basic functionality)
     - Integration tests (behavior)
     - Unit tests (logic validation)
     - Acceptance tests (user requirements)
   - **Coverage low**: Add tests for uncovered code
   - **No documentation**: Update README
   - **No changelog**: Update CHANGELOG.md
3. Re-run hardening if needed: `hodge harden {{feature}}`
4. Try shipping again

## Troubleshooting

### "Edit the message and save, then re-run ship to continue" Loop
If you're stuck in a loop where the command keeps asking you to edit:
1. Make sure you're updating the `state.json` file, not just the `ui.md`
2. Set `"status": "confirmed"` in state.json
3. Or use `--yes` flag to accept the suggested message

### Example state.json Update
```json
{
  "command": "ship",
  "status": "confirmed",  // ← Change from "pending" to "confirmed"
  "data": {
    "customMessage": "Your custom commit message here",  // ← Optional
    // ... rest of the data
  }
}
```

### Common Issues
- **Command regenerates ui.md**: You need to set status to "confirmed" not "ready"
- **Custom message not used**: Add it to both `customMessage` and `suggested` fields in state.json
- **Can't find state files**: Check `.hodge/temp/ship-interaction/{{feature}}/`

## Post-Ship Checklist
- [ ] Code committed with ship message
- [ ] Pushed to main branch
- [ ] Release tag created (if applicable)
- [ ] PM issue marked as Done
- [ ] Team notified of release
- [ ] Monitoring dashboards checked
- [ ] User feedback channels monitored

## Next Steps Menu
After shipping is complete, suggest:
```
### Next Steps
Choose your next action:
a) Monitor production metrics
b) Start new feature → `/explore`
c) Review project status → `/status`
d) Create release notes
e) Archive feature context
f) Gather user feedback
g) Update documentation
h) Done for now

Enter your choice (a-h):
```

Remember: The CLI handles all quality checks and PM updates. Focus on the actual deployment and monitoring.