# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Repository Overview

Hodge is an AI development framework that balances creative exploration with production discipline. Philosophy: *"Freedom to explore, discipline to build, confidence to ship"*

## Project Standards

**ALWAYS FOLLOW:** `.hodge/standards.md` - Contains enforceable requirements for code quality, testing, and performance.

## Development Workflow

### Progressive Development Model
```
/explore → Test Intentions (markdown)
/build   → Smoke Tests (required)
/harden  → Integration Tests (required)
/ship    → Full Test Suite (required)
```

### Slash Commands
Use commands in `.claude/commands/`:
- `/explore {{feature}}` - Start exploring with test intentions
- `/build {{feature}}` - Build with smoke tests
- `/harden {{feature}}` - Add integration tests
- `/ship {{feature}}` - Ship with full test suite

## Key Directories

```
.hodge/
├── standards.md        # Requirements (ALWAYS loaded)
├── patterns/          # Code examples (loaded on-demand)
│   ├── test-pattern.md
│   └── structure-pattern.md
├── features/          # Feature work directories
└── AI-CONTEXT.md      # Context loading strategy

.claude/
└── commands/          # Slash command documentation

src/
├── commands/          # Command implementations
├── lib/              # Core libraries
├── test/             # Test utilities
└── types/            # TypeScript definitions
```

## Testing Approach

**Philosophy:** "Vibe testing for vibe coding" - Test behavior, not implementation.

### Quick Commands
```bash
npm run test:smoke       # Quick sanity checks
npm run test:integration # Behavior verification
npm test                 # Full suite
npm run quality         # All checks (lint, type, test)
```

### Test Utilities
- Use `src/test/helpers.ts` for test categorization
- Use `src/test/runners.ts` for workspace testing
- Use `src/test/mocks.ts` for mock factories

## Working with Hodge

### Initialize a Project
```bash
hodge init
```

### Typical Workflow
1. `hodge explore "feature"` - Create test intentions
2. `hodge build "feature"` - Implement with smoke tests
3. `hodge harden "feature"` - Add integration tests
4. `hodge ship "feature"` - Ship with full test coverage

## Pattern Loading

When working on specific areas, load relevant patterns:
- Testing → `.hodge/patterns/test-pattern.md`
- Structure → `.hodge/patterns/structure-pattern.md`
- Errors → `.hodge/patterns/error-pattern.md`

## Quality Gates

Before shipping, ensure:
- All tests pass (`npm test`)
- No linting errors (`npm run lint`)
- No TypeScript errors (`npm run typecheck`)
- Coverage >80% for new code

## Important Notes

1. **Standards are non-negotiable** - Always follow `.hodge/standards.md`
2. **Test progressively** - Match test depth to development phase
3. **Never bypass Git hooks** - NEVER use `--no-verify` or skip pre-commit/pre-push hooks without explicit user permission. These hooks ensure code quality and should always run unless the user specifically asks to bypass them
4. **Use patterns** - Copy from `.hodge/patterns/` for consistency
5. **Load context wisely** - Don't overload with unnecessary docs

---
*For detailed testing philosophy, see TEST-STRATEGY.md*
*For contribution guidelines, see CONTRIBUTING.md*