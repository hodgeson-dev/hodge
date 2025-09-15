# Hodge Ship Mode

## Command Execution
Execute the portable Hodge CLI command:
```bash
hodge ship {{feature}}
```

Options:
```bash
hodge ship {{feature}} --skip-tests              # Skip final tests (not recommended)
hodge ship {{feature}} -m "Custom commit message" # Custom commit message
```

## What This Does
1. Verifies feature has been hardened
2. Runs final quality gates:
   - Tests
   - Coverage check
   - Documentation check
   - Changelog check
3. Creates ship directory: `.hodge/features/{{feature}}/ship/`
4. Generates:
   - Ship record
   - Release notes
   - Commit message
5. Updates PM issue to "Done"

## After Command Execution
The CLI will output:
- Ship requirements AI context
- Quality gate results
- Ship summary with pass/fail status
- Generated commit message
- PM issue update confirmation

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