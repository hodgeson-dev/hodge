# Contributing to Hodge

Thank you for your interest in contributing to Hodge! This guide will help you get started with development and testing.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hodgeson-dev/hodge.git
   cd hodge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Local Testing

For detailed local testing instructions, see [docs/local-testing.md](./docs/local-testing.md).

### Quick Local Testing

Test your changes locally before submitting:

```bash
# Link Hodge globally for testing
npm run link:local

# Create a test workspace
npm run test:local

# Navigate to test workspace and test commands
cd /path/to/test-workspace
hodge init
hodge explore
hodge ship

# Clean up when done
npm run unlink:local
```

## Code Quality

We maintain high code quality standards:

### Quality Checks

Run all quality checks before submitting:

```bash
npm run quality
```

This runs:
- TypeScript type checking
- ESLint linting
- All tests

### Individual Commands

- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint linting
- `npm run format` - Prettier formatting
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically:
- Format code with Prettier
- Lint with ESLint
- Fix auto-fixable issues

## Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-new-command` - New features
- `fix/resolve-bug-description` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/improve-code-structure` - Code refactoring

### Commit Messages

Follow conventional commit format:
- `feat: add new explore mode command`
- `fix: resolve issue with standards detection`
- `docs: update local testing guide`
- `refactor: improve error handling`
- `test: add unit tests for pattern learner`

### Development Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**:
   ```bash
   # Use watch mode for rapid development
   npm run build:watch
   
   # Test in another terminal
   npm run link:local
   npm run test:local
   ```

3. **Run quality checks**:
   ```bash
   npm run quality
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## Dogfooding Hodge

Hodge uses itself for development. This creates some special workflows:

### PM Scripts Workflow

PM scripts are generated from templates during `hodge init`:
- **Templates**: `src/lib/pm-scripts-templates.ts` (source of truth)
- **Generated**: `.hodge/pm-scripts/` (project-specific)

When you modify PM script templates:
```bash
# After modifying pm-scripts-templates.ts
npm run update-pm-scripts
```

This command rebuilds the project and regenerates `.hodge/pm-scripts/` from the latest templates.

### Dogfooding Workflow

1. Make changes to source code in `src/`
2. Build the project: `npm run build`
3. If you changed PM scripts templates: `npm run update-pm-scripts`
4. Test using compiled version: `node dist/src/bin/hodge.js [command]`
5. Or use linked version: `hodge [command]` (after `npm link`)

Always test your changes using Hodge itself:
```bash
# Use Hodge to explore a feature
hodge explore my-new-feature

# Use Hodge to build the implementation
hodge build

# Use Hodge to ship the changes
hodge ship
```

### Debugging

For debugging Hodge while developing:

```bash
# Run with debug output
DEBUG=hodge:* node dist/src/bin/hodge.js [command]

# Use VS Code debugger with launch.json configuration
# Or use Chrome DevTools
node --inspect dist/src/bin/hodge.js [command]
```

## Project Structure

```
hodge/
├── src/                    # TypeScript source code
│   ├── bin/               # CLI entry point
│   ├── commands/          # Command implementations
│   ├── lib/              # Core library code
│   └── types/            # TypeScript type definitions
├── tests/                 # Test files
├── scripts/              # Build and utility scripts
├── docs/                 # Documentation
├── dist/                 # Built JavaScript (gitignored)
└── .hodge/               # Hodge configuration and patterns
```

## TypeScript Guidelines

- Use strict TypeScript configuration
- Export types from relevant modules
- Prefer interfaces over types for object shapes
- Use proper JSDoc comments for public APIs

## Testing Guidelines

### Our Testing Philosophy

**"Test behavior, not implementation"**

We follow a **Progressive Testing Strategy** - tests evolve with code maturity:

| Stage | Required Tests | Command |
|-------|---------------|---------|
| Explore | Test intentions (markdown) | N/A |
| Build | Smoke tests | `npm run test:smoke` |
| Harden | Integration tests | `npm run test:integration` |
| Ship | All tests passing | `npm test` |

See [TEST-STRATEGY.md](./TEST-STRATEGY.md) for complete testing philosophy.

### Writing Tests

#### 1. During Explore Phase
Create test intentions in your exploration document:
```markdown
## Test Intentions
- [ ] Should handle invalid input gracefully
- [ ] Should complete within 500ms
- [ ] Should integrate with existing system
```

#### 2. During Build Phase
Write at least one smoke test:
```typescript
import { smokeTest } from '../test/helpers';

smokeTest('should not crash', async () => {
  await expect(command.execute()).resolves.not.toThrow();
});
```

#### 3. During Harden Phase
Add integration tests:
```typescript
import { integrationTest } from '../test/helpers';
import { withTestWorkspace } from '../test/runners';

integrationTest('should create expected structure', async () => {
  await withTestWorkspace('test', async (workspace) => {
    await workspace.hodge('your-command');
    expect(await workspace.exists('expected-file')).toBe(true);
  });
});
```

### Test Categories

- **Smoke Tests** (`[smoke]`) - Quick sanity checks
- **Integration Tests** (`[integration]`) - Behavior verification
- **Unit Tests** (`[unit]`) - Logic validation
- **Acceptance Tests** (`[acceptance]`) - User story validation

### Running Tests

```bash
# During development
npm run test:watch         # Watch mode
npm run test:smoke         # Quick smoke tests only

# Before committing
npm run test:integration   # Behavior tests
npm test                   # All tests

# Coverage
npm run test:coverage      # Generate coverage report
```

### Test Utilities

Use our test utilities for cleaner tests:

- `src/test/mocks.ts` - Mock factories (createMockFs, createMockCache, etc.)
- `src/test/runners.ts` - Test workspace and command runners
- `src/test/helpers.ts` - Test categorization and assertions

## Documentation

- Update documentation for new features
- Keep README.md current
- Add examples for new commands
- Update type definitions and JSDoc

## Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Review the codebase for patterns and examples
- Check the [local testing guide](./docs/local-testing.md) for development tips

## Release Process

Releases are managed by maintainers:

1. Version bumping follows semantic versioning
2. Changelog is updated for each release
3. GitHub releases are created with release notes

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please be respectful and inclusive in all interactions.

Thank you for contributing to Hodge!