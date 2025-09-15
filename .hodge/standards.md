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

### Code Documentation
- Mark all unfinished work with `// TODO:` comments
- Include descriptive text after TODO explaining what needs to be done
- Examples:
  - `// TODO: Implement actual PM fetching via adapter`
  - `// TODO: Add validation for user input`
  - `// TODO: Optimize this query for performance`
- Never use vague comments like "Note:", "In real implementation", etc.
- All placeholder code must have a TODO comment
- TODOs are easily discoverable by IDEs and search tools

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

### Multi-Environment Command Standards

All Hodge commands MUST support multiple AI coding environments through Progressive Enhancement:

1. **Environment Detection Required**
   - Commands must detect: Claude Code, Warp, Aider, Continue.dev, Cursor, Terminal
   - Must have non-interactive fallback for unknown environments
   - Detection logic should be centralized in EnvironmentDetector class

2. **File-Based State Protocol**
   - All commands must support file-based interaction as baseline
   - State files in `.hodge/temp/<command>-interaction/`
   - JSON format for state persistence
   - Clean up temporary files after execution

3. **Claude Code Premium Experience**
   - Claude commands in `.claude/commands/` should provide rich markdown UI
   - Markdown files are the UI, not just launchers
   - Use tables, collapsible sections, and formatting
   - Maintain context between interactions

4. **Universal Flags**
   - All commands must support: `--no-interactive`, `--yes`, `--edit`, `--dry-run`
   - Flags must work identically across all environments
   - Document flag behavior in command help

5. **Graceful Degradation**
   - Never break in unknown environments
   - Always provide meaningful output even without interactivity
   - File-based fallback is mandatory

See `.hodge/patterns/progressive-enhancement-commands.md` for implementation details.

