# hodge Development Standards

## Project Overview
- **Type**: node
- **Package Manager**: npm
- **Git Repository**: Yes

## Code Quality Standards

### Testing
- **Frameworks**: vitest
- All features should have tests before moving to harden mode
- Maintain test coverage above 80%
- Use descriptive test names that explain the expected behavior

### Code Style
- **Linting**: eslint, prettier
- Follow configured linting rules strictly in harden mode
- Auto-format code before commits
- Use consistent naming conventions

### Build & Deployment
- **Build Tools**: typescript, tsconfig
- Code must build without warnings in harden mode
- Maintain type safety (if TypeScript is detected)
- Optimize bundle size for production

### Node.js Standards
- Use ES modules where possible
- Handle errors appropriately with proper error types
- Use async/await over callbacks
- Keep dependencies minimal and up-to-date

## Mode-Specific Guidelines

### Explore Mode
- Focus on rapid prototyping and experimentation
- Document key findings and decisions
- Don't worry about perfect code quality initially

### Build Mode  
- Follow basic standards and conventions
- Include essential tests for core functionality
- Apply linting rules as recommendations

### Harden Mode
- All standards are strictly enforced
- Complete test coverage required
- Code must pass all quality checks
- Documentation must be comprehensive

## Custom Standards

Add your project-specific standards here...

