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