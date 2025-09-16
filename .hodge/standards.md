# Project Standards

## Core Standards
- TypeScript with strict mode
- ESLint rules enforced
- Prettier formatting

## Testing Requirements

| Phase | Required | Time Limit |
|-------|----------|------------|
| **Build** | 1+ smoke test | <100ms each |
| **Harden** | Integration tests | <500ms each |
| **Ship** | All tests pass | <30s total |

## Code Comments and TODOs
- **TODO Convention**: Always use `// TODO:` comments for incomplete work
  - Format: `// TODO: [phase] description`
  - Examples:
    - `// TODO: Add error handling before ship`
    - `// TODO: Implement caching for performance`
    - `// TODO: Add tests in harden phase`
- **Phase Markers**: Include phase when relevant
  - `// TODO: [harden] Add integration tests`
  - `// TODO: [ship] Add proper error messages`
- **No Naked TODOs**: Always include what needs to be done
- **Review TODOs**: Check all TODOs before shipping

## Code Quality Gates
- No ESLint errors
- No TypeScript errors
- Test coverage >80% for shipped code
- Documentation for public APIs

## Performance Standards
- CLI commands respond within 500ms
- Build completes within 30s
- Tests complete within 30s

---
*Standards are enforced during harden and ship phases.*
*For implementation examples, see `.hodge/patterns/`*