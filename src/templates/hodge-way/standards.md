# Project Standards

## The Hodge Way

This project follows the Hodge development philosophy:
> "Freedom to explore, discipline to ship"

### Core Principles

1. **Progressive Testing** - "Vibe testing for vibe coding"
   - Test behavior, not implementation
   - Never test console.log calls or mock interactions
   - Tests evolve with code maturity

2. **Progressive Type Safety**
   - `any` is allowed in explore mode
   - Types tighten as code matures
   - TypeScript inference over explicit types

3. **Phase-Based Development**
   - **Explore**: Rapid prototyping, no rules
   - **Build**: Basic standards, smoke tests
   - **Harden**: Strict standards, integration tests
   - **Ship**: Production ready, full coverage

## Testing Standards

### Testing Philosophy
- Test what users see, not how it works
- Focus on behavior and contracts
- Prefer integration tests over unit tests
- Use real dependencies when possible

### Phase Requirements

| Phase | Tests Required | Focus | Time Limit | Coverage |
|-------|---------------|-------|------------|----------|
| **Explore** | No | Test intentions only | - | - |
| **Build** | Smoke tests | Happy path | <100ms | - |
| **Harden** | Integration | Edge cases | <500ms | 70% |
| **Ship** | Full suite | All behaviors | <30s total | 80% |

### What NOT to Test
- ❌ Console.log statements
- ❌ Mock function calls (toHaveBeenCalledWith)
- ❌ Implementation details
- ❌ Private methods
- ❌ Framework internals

### What TO Test
- ✅ User-visible behavior
- ✅ Public API contracts
- ✅ Error conditions users might encounter
- ✅ Integration between components
- ✅ Critical business logic

## Type Safety Standards

### Progressive Type Rules

| Rule | Explore | Build | Harden | Ship |
|------|---------|-------|--------|------|
| `no-explicit-any` | off | warn | error | error |
| `explicit-return-types` | off | off | off | off |
| `no-unsafe-assignment` | off | warn | error | error |
| `no-unsafe-return` | off | warn | error | error |

### Type Guidelines
- Use `unknown` instead of `any` when possible
- Let TypeScript infer return types
- Add types when they add clarity
- Don't fight the type system during exploration

## Code Quality Standards

### Linting
- **Explore**: Linting disabled
- **Build**: Linting as warnings
- **Harden**: Linting as errors
- **Ship**: All linting must pass

### Documentation
- Document WHY, not WHAT
- Public APIs need JSDoc comments
- Complex logic needs inline comments
- Decision records for architecture choices

### Performance
- Commands must respond within 500ms
- Build must complete within 30s
- Test suite must complete within 30s
- Optimize only when measured

## Workflow Standards

### Git Workflow
1. Branch from main
2. Explore feature
3. Build implementation
4. Harden with tests
5. Ship with PR

### Decision Making
- Record decisions in `.hodge/decisions.md`
- Include context, alternatives, consequences
- Reference decisions in code comments
- Review decisions quarterly

### Pattern Learning
- Extract patterns from shipped code
- Share patterns in `.hodge/patterns/`
- Reuse patterns in new features
- Evolve patterns based on usage

## Project-Specific Standards

*Add your project-specific standards below:*

### API Standards
- RESTful conventions
- Consistent error responses
- Version with Accept headers
- Rate limiting on all endpoints

### Database Standards
- Migrations for schema changes
- Indexes for common queries
- Soft deletes for audit trail
- Connection pooling

### Security Standards
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- Rate limiting
- Audit logging

---

## Customization

These standards are starting points. Modify them based on:
- Your team's preferences
- Project requirements
- Lessons learned
- Performance needs

To customize:
1. Edit this file directly
2. Changes apply to all team members
3. Commit changes with clear reasoning

---

*Remember: Standards should enable productivity, not hinder it. Adjust as needed.*