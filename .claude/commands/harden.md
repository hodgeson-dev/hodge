# Hodge Harden Mode

You are now in **Harden Mode** for: {{feature || "current feature"}}

## Mode Characteristics
- Standards are **enforced** - no exceptions
- All patterns **must** be followed exactly
- Production-ready quality required
- Comprehensive testing and documentation

## Pre-Harden Requirements
1. Check for linked PM issue in `.hodge/features/{{feature}}/issue-id.txt`
2. If PM issue exists:
   - Check current state
   - If in "Backlog" or "Todo", ask: "This issue hasn't been built yet. Are you hardening existing code? (yes/no)"
     - If yes: Add comment "Fast-tracked to hardening - existing implementation"
     - If no: Exit and suggest `/build {{feature}}`
   - If in "Done", ask: "This issue is already shipped. Are you doing additional hardening? (yes/no)"
     - If yes: Add comment "Additional hardening post-ship"
     - If no: Exit
3. Check if feature has been built (`.hodge/features/{{feature}}/context.md`)
   - If not built, ask: "No build record found. Are you hardening existing code? (yes/no)"
4. Transition PM issue to "In Review" state (if appropriate)
5. Load and enforce ALL standards from `.hodge/standards.md`
6. Apply ALL relevant patterns from `.hodge/patterns/`
7. Review performance budgets and constraints

## Hardening Checklist
### Code Quality
- [ ] **MUST** follow all coding standards exactly
- [ ] **MUST** use established patterns
- [ ] **MUST** include comprehensive error handling
- [ ] **MUST** add input validation
- [ ] **MUST** implement proper logging

### Testing
- [ ] **MUST** write unit tests (>80% coverage)
- [ ] **MUST** add integration tests for critical paths
- [ ] **MUST** test error scenarios
- [ ] **MUST** verify performance budgets

### Security
- [ ] **MUST** validate all inputs
- [ ] **MUST** sanitize outputs
- [ ] **MUST** check authentication/authorization
- [ ] **MUST** prevent common vulnerabilities (XSS, SQL injection, etc.)

### Performance
- [ ] **MUST** meet response time requirements
- [ ] **MUST** optimize database queries
- [ ] **MUST** implement caching where appropriate
- [ ] **MUST** minimize bundle size

### Documentation
- [ ] **MUST** add JSDoc comments
- [ ] **MUST** update API documentation
- [ ] **MUST** document configuration options
- [ ] **MUST** include usage examples

## Output Format
```
## Hardening: {{feature}}

{{#if pm_issue}}
📋 PM Issue: {{pm_issue.id}} - {{pm_issue.title}}
   Status: In Review
   URL: {{pm_issue.url}}
{{/if}}

### Standards Compliance ✓
- [x] TypeScript strict mode
- [x] Error boundaries implemented
- [x] API response format standardized
- [x] Component size < 200 lines

### Test Coverage
- Unit Tests: XX%
- Integration Tests: X critical paths
- Performance: Meeting all budgets

### Security Review
- [x] Input validation
- [x] Authentication checks
- [x] Rate limiting
- [x] Data sanitization

### Production Readiness
- [x] Logging configured
- [x] Monitoring ready
- [x] Error tracking enabled
- [x] Documentation complete

### Deployment Notes
- Environment variables required
- Migration steps (if any)
- Feature flags configured

Status: **Production Ready** ✅

### Next Steps
Choose your next action:
a) Ship to production → `/ship {{feature}}`
b) Run final tests
c) Request code review
d) Generate documentation
e) Create PR
f) Review security checklist
g) Back to build for fixes → `/build {{feature}}`
h) Done for now

Enter your choice (a-h):
```

Remember: Harden mode accepts no compromises. Every standard must be met.