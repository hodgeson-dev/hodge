# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **design and specification repository** for Hodge, a proposed AI development framework. Currently, there is no implementation - only comprehensive documentation describing how the tool should work.

## Project Concept

Hodge is designed as a balanced AI development framework with the philosophy: *"Freedom to explore, discipline to build, confidence to ship"*

### Key Features
- **Two-Mode System**: Explore Mode (creative experimentation) and Ship Mode (production-ready code)
- **Standards Engine**: Automatically detects and enforces coding standards
- **Pattern Learner**: Extracts reusable patterns from shipped code
- **AI Integration**: Deep integration with Claude Code, Cursor, and other AI tools

## Documentation Structure

All documentation is in the `podge/` directory:
- `hodge-v3-balanced.md` - Main specification and architecture
- `hodge-v3-bootstrap-guide.md` - Getting started guide
- `hodge-v3-claude-adapter.js` - Example Claude integration code
- `hodge-claude-slash-commands.md` - Claude Code slash command specifications
- `hodge-v3-repo.md` - Repository structure and setup

## Working with This Repository

### If asked to implement Hodge:
1. Start with `podge/hodge-v3-balanced.md` for the core architecture
2. Use `podge/hodge-v3-bootstrap-guide.md` for implementation order
3. The proposed tech stack is Node.js 18+ with ES modules, Commander.js for CLI

### If asked about Hodge functionality:
- All features are documented but not yet implemented
- Refer to the specification files for intended behavior
- The tool does not exist yet - only its design

### Proposed Implementation Details

**Technology Stack** (when implementing):
- Runtime: Node.js 18+
- Language: JavaScript with ES modules
- CLI: Commander.js
- Testing: Jest
- Linting: ESLint
- Formatting: Prettier

**Core Commands** (proposed):
```bash
hodge init          # Initialize project
hodge explore       # Enter explore mode
hodge ship          # Enter ship mode
hodge decide        # Record a decision
hodge learn         # Extract patterns
hodge standards     # Manage standards
```

## Important Notes

1. **This is NOT a working codebase** - it's a specification repository
2. There are no build/test/lint commands to run currently
3. All `.md` files in `podge/` are design documents, not user documentation
4. The Claude adapter code (`hodge-v3-claude-adapter.js`) is an example, not functional code

## Architecture Overview

The proposed architecture includes:
- **ModeManager**: Controls explore/ship mode transitions
- **StandardsEngine**: Detects and validates project standards
- **PatternLearner**: Machine learning-inspired pattern extraction
- **ContextBuilder**: Builds comprehensive AI context
- **AIAdapter**: Base class for AI tool integrations
- **DecisionTracker**: Lightweight decision logging system

Each component is designed to work together to create a seamless AI-assisted development workflow that maintains code quality while allowing creative exploration.