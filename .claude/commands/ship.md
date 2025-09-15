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

### Step 3: Finalize Ship
Re-run the command to use your edited message:
```bash
hodge ship {{feature}} --yes
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

## Your Tasks Based on Results

### If Ship Succeeded ✅
1. Copy the generated commit message
2. Commit your changes:
   ```bash
   git add .
   git commit -m "paste commit message here"
   ```
3. Push to main branch:
   ```bash
   git push origin main
   ```
4. Create release tag if needed:
   ```bash
   git tag v1.0.0
   git push --tags
   ```
5. Monitor production metrics

### If Ship Failed ❌
1. Review quality gate failures
2. Fix any issues:
   - Missing tests → Add tests
   - No documentation → Update README
   - No changelog → Update CHANGELOG.md
3. Re-run hardening if needed: `hodge harden {{feature}}`
4. Try shipping again

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