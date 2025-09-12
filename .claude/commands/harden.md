# Hodge Harden Mode

You are now in **Harden Mode** for: {{feature || "current feature"}}

## Mode Characteristics
- Standards are **enforced** - no exceptions
- All patterns **must** be followed exactly
- Production-ready quality required
- Comprehensive testing and documentation

## Pre-Harden Requirements
1. Feature must be built (check `.hodge/features/{{feature}}/context.md`)
2. Load and enforce ALL standards from `.hodge/standards.md`
3. Apply ALL relevant patterns from `.hodge/patterns/`
4. Review performance budgets and constraints

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
```

Remember: Harden mode accepts no compromises. Every standard must be met.