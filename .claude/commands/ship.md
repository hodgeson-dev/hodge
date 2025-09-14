# Hodge Ship Mode

You are now in **Ship Mode** for: {{feature || "current feature"}}

## Mode Characteristics
- All standards **must** be met
- Feature must be production-ready
- Tests must be passing
- Documentation must be complete

## Pre-Ship Requirements
1. Check for linked PM issue in `.hodge/features/{{feature}}/issue-id.txt`
2. If PM issue exists:
   - Check current state
   - If in "Backlog" or "Todo", ask: "This issue hasn't progressed through build/harden. Are you shipping existing code? (yes/no)"
     - If yes: Add comment "Fast-tracked to ship - existing implementation"
     - If no: Exit and suggest normal flow `/explore` → `/build` → `/harden` → `/ship`
   - If already "Done", ask: "This issue is already shipped. Are you doing a re-release? (yes/no)"
     - If yes: Add comment "Re-shipped with updates"
     - If no: Exit
3. Check if feature has been hardened (`.hodge/features/{{feature}}/context.md`)
   - If not hardened, ask: "No hardening record found. Ship without hardening? (yes/no)"
     - If yes: Add warning comment to PM issue
     - If no: Exit and suggest `/harden {{feature}}`
4. Transition PM issue to "Done" state (if appropriate)
5. All tests must pass
6. Code review should be complete
7. Documentation must be updated

## Ship Checklist
### Quality Gates
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Code coverage meets requirements (>80%)
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Documentation complete

### PM Integration
- [ ] Issue acceptance criteria verified
- [ ] Issue ready to close
- [ ] Ship notes prepared

### Deployment
- [ ] Code merged to main branch
- [ ] Release notes prepared
- [ ] Version tagged (if applicable)
- [ ] Changelog updated

## Ship Process
1. Final quality verification
2. Create ship commit with PM issue reference
3. Merge to main branch
4. Tag release if applicable
5. Update PM issue to Done
6. Add ship summary to issue

## Output Format
```
## Shipping: {{feature}}

{{#if pm_issue}}
📋 PM Issue: {{pm_issue.id}} - {{pm_issue.title}}
   Status: Done ✅
   URL: {{pm_issue.url}}
{{/if}}

### Ship Summary
- Feature: {{feature}}
- Tests: All passing ✅
- Coverage: {{coverage}}%
- Documentation: Complete ✅

### Release Notes
{{release_notes}}

### Commit Message
```
ship: {{feature}}{{#if pm_issue}} (closes {{pm_issue.id}}){{/if}}

- Implementation complete
- Tests passing
- Documentation updated
{{#if pm_issue}}- Closes {{pm_issue.id}}{{/if}}
```

### Next Steps
Choose your next action:
a) Monitor production metrics
b) Start exploring next feature → `/explore`
c) Review project status → `/status`
d) Create release notes
e) Archive feature context
f) Update documentation
g) Gather user feedback
h) Done for now

Enter your choice (a-h):

Status: **Shipped to Production** 🚀
```

Remember: Ship mode is the final gate. Only production-ready code ships.