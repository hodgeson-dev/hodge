# AI Context Architecture

## Document Hierarchy

### Always Loaded (Core Context)
These files are automatically included in AI context:

1. **`.hodge/standards.md`** (~30 lines)
   - WHAT: Requirements and rules
   - Enforced during harden/ship
   - Minimal, no examples

2. **Current slash command** (e.g., `.claude/commands/build.md`)
   - Phase-specific guidance
   - Next steps and workflows

### Loaded On-Demand
These files are loaded when relevant by:

**Current Reality:**
- **User explicitly references them** (e.g., "use the test pattern")
- **AI proactively loads them** when detecting relevant context
- **Slash commands reference them** (e.g., /build mentions test-pattern.md)

**How AI Should Load Patterns:**

1. **`.hodge/patterns/*.md`** (50-200 lines each)
   - Load `test-pattern.md` when: Writing tests, using test helpers
   - Load `structure-pattern.md` when: Creating new files/directories
   - Load `error-pattern.md` when: Implementing error handling
   - Signal phrases: "write a test", "create structure", "handle errors"

2. **`TEST-STRATEGY.md`**
   - Load when: Discussing testing philosophy or strategy
   - Signal phrases: "why test this way", "testing approach", "test philosophy"

3. **`CONTRIBUTING.md`**
   - Load when: Setting up development, new contributor questions
   - Signal phrases: "how to contribute", "development setup", "run locally"

## Design Principles

### Standards vs Patterns
- **Standards** = Rules to enforce (what must be done)
- **Patterns** = Examples to copy (how to do it)
- **Strategy** = Philosophy to understand (why we do it)

### Size Constraints
- Standards: <50 lines (always in context)
- Patterns: <200 lines (loaded when needed)
- Commands: <100 lines (one at a time)

### Loading Strategy
```
Phase: /explore
Loads: standards.md + explore.md

Phase: /build
Loads: standards.md + build.md + test-pattern.md (if testing)

Phase: /harden
Loads: standards.md + harden.md + relevant patterns

Phase: /ship
Loads: standards.md + ship.md + all quality gates
```

## Pattern Loading Triggers

### Automatic Loading (AI should proactively load)
When AI detects these activities, load the pattern:
```
Writing tests         → Load test-pattern.md
Creating files        → Load structure-pattern.md
Handling errors       → Load error-pattern.md
Building APIs         → Load api-pattern.md
```

### Manual Loading (User or command triggered)
```
/build command        → References test-pattern.md
/harden command       → References test-pattern.md
User asks "how to X"  → Load relevant pattern
```

### Example AI Behavior
```typescript
// User: "Add a test for the explore command"
// AI should:
// 1. Detect "add a test" → Load test-pattern.md
// 2. Find smoke test pattern
// 3. Apply pattern to explore command
```

## Implementation Status

### Current (Manual)
- User must ask AI to look at patterns
- AI (Claude/Cursor) may proactively read patterns based on context
- Slash commands can reference patterns in their documentation
- No automatic loading mechanism in Hodge itself

### Future Vision (Automated)
- Hodge could inject patterns into AI context based on mode
- Commands could auto-load relevant patterns
- AI adapters could detect triggers and load patterns
- Pattern loading could be configured in `.hodge/config.json`

## Effective Context Use
1. Keep standards minimal and enforceable
2. Keep patterns concrete and copyable
3. Load philosophy documents only for discussions
4. Reference other docs instead of duplicating
5. Trust AI to proactively load relevant patterns

## AI Behavior Guidelines

### Git and Quality Gates
1. **Never bypass Git hooks** - NEVER use `--no-verify` or skip pre-commit/pre-push hooks without explicit user permission
2. **Respect quality gates** - Pre-commit hooks (linting, formatting, tests) exist to ensure code quality
3. **Fix issues properly** - When hooks fail, fix the underlying issues rather than bypassing checks
4. **Ask before skipping** - If hooks are blocking progress, explain the issue and ask for permission before using `--no-verify`

### Code Quality Practices
- Always run tests before committing
- Fix linting errors rather than disabling rules
- Ensure proper formatting via hooks
- Maintain the test suite integrity

## Scaling Considerations

**Current Load:** ~1,400 lines maximum (manageable)
**Breaking Point:** ~4,000 lines (consider vectorization)
**See:** `CONTEXT-SCALING.md` for detailed analysis

---
*This architecture ensures AI has the right context at the right time without overloading.*
*Currently relies on AI intelligence and user guidance for pattern loading.*
*Will need vectorization when patterns exceed 10-15 files.*