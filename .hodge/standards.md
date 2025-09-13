# Hodge Development Standards

> Progressive standards that evolve with the project
> Last Updated: 2025-09-12

## Essential Standards (Always Enforced)

These standards are non-negotiable and enforced in all modes.

### TypeScript
- ✅ Strict mode enabled (`strict: true` in tsconfig.json)
- ✅ No `any` type without explicit justification comment
- ✅ Explicit return types for public methods
- ✅ Proper error handling (no unhandled promises)

### Testing
- ✅ All public APIs must have tests
- ✅ Test files named `*.test.ts` or `*.spec.ts`
- ✅ Use descriptive test names that explain the behavior

### Version Control
- ✅ Semantic commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- ✅ No commits directly to main branch
- ✅ Branch names follow pattern: `{mode}-{feature}` (e.g., `explore-ai-adapter`)

### Code Quality
- ✅ No console.log in production code (use proper logging)
- ✅ Handle all error cases explicitly
- ✅ No commented-out code in commits

## Recommended Standards (Progressive Enforcement)

These standards are:
- **Suggested** in Explore mode (warnings)
- **Recommended** in Build mode (strong warnings)
- **Enforced** in Harden mode (errors)

### Architecture
- 📁 Follow established directory structure:
  ```
  src/
  ├── commands/     # CLI command handlers
  ├── core/         # Business logic
  ├── adapters/     # External integrations
  ├── utils/        # Shared utilities
  └── types/        # TypeScript types
  ```
- 🔄 No circular dependencies
- 🎯 Single Responsibility Principle for classes

### Naming Conventions
- 📝 PascalCase: Classes, Types, Interfaces, Enums
- 📝 camelCase: Functions, variables, methods
- 📝 UPPER_SNAKE_CASE: Constants
- 📝 kebab-case: File names

### Error Handling
- 🔧 Use Result<T, E> pattern for operations that can fail
- 🔧 Throw errors only for truly exceptional cases
- 🔧 Provide meaningful error messages

### Testing
- 🧪 Minimum 80% code coverage
- 🧪 Integration tests for CLI commands
- 🧪 Mock external dependencies
- 🧪 Follow AAA pattern: Arrange, Act, Assert

### Documentation
- 📚 JSDoc comments for all public APIs
- 📚 README for each major module
- 📚 Include usage examples in documentation

## Learned Patterns (Discovered)

Patterns discovered through development and promoted based on usage.

### Current Patterns
*No patterns discovered yet - this section will grow as we build*

### Pattern Promotion Path
1. **Discovered**: Pattern detected in codebase
2. **Suggested**: Pattern recommended when similar code is written
3. **Standardized**: Pattern becomes a recommended standard

## Mode-Specific Application

### Explore Mode
- Essential standards: **Enforced**
- Recommended standards: **Suggested** (warnings only)
- Focus on: Rapid prototyping, trying different approaches

### Build Mode
- Essential standards: **Enforced**
- Recommended standards: **Strongly Recommended** (warnings)
- Focus on: Clean implementation, following patterns

### Harden Mode
- Essential standards: **Enforced**
- Recommended standards: **Enforced**
- Additional: Performance optimization, security review
- Focus on: Production readiness

## Enforcement Tools

### Current
- TypeScript compiler for type checking
- Manual code review

### Planned
- ESLint for code quality
- Prettier for formatting
- Vitest for testing standards
- Husky for pre-commit hooks

## Standard Evolution Process

1. **Proposal**: Suggest new standard via PR
2. **Discussion**: Team reviews and discusses
3. **Trial**: Test as "recommended" for 2 weeks
4. **Promotion**: Move to essential if successful
5. **Documentation**: Update this file

---

*Standards are living documents. Propose changes when you find better patterns.*