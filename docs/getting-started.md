# Getting Started with Hodge

Welcome to Hodge! This guide will help you install and set up Hodge for your first AI-assisted development workflow.

## Prerequisites

Before installing Hodge, ensure you have:

- **Node.js** ≥ 20.0.0 ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Claude Code** (recommended) - [Get Claude Code](https://claude.com/code)
- **Git** (for version control)

## Installation

Install Hodge globally using npm:

```bash
npm install -g @hodgeson/hodge
```

Verify installation:

```bash
hodge --version
```

## Initialize Your Project

Navigate to your project directory and initialize Hodge:

```bash
cd your-project
hodge init
```

This creates:
- `.hodge/` - Feature workspace and project context
- `.claude/commands/` - Slash command definitions for Claude Code
- Project standards and configuration files

## Your First Feature

Let's build a simple feature using Hodge's progressive workflow.

### 1. Explore

Open Claude Code and start exploring:

```
/explore user-profile
```

Claude will help you:
- Understand the problem space
- Consider different approaches
- Create test intentions (what should the feature do?)
- Record initial decisions

### 2. Build

Once exploration is complete, start building:

```
/build user-profile
```

Claude will:
- Implement the feature following recommended standards
- Write smoke tests (does it work without crashing?)
- Track files modified during implementation

### 3. Harden

Add integration tests and validate production readiness:

```
/harden user-profile
```

Claude will:
- Add integration tests (does it behave correctly?)
- Run quality checks (linting, types, tests)
- Validate against project standards

### 4. Ship

Create a commit and prepare for deployment:

```
/ship user-profile
```

Claude will:
- Run full test suite
- Create a well-formatted commit
- Update feature status
- Record lessons learned

## Project Management Integration

Hodge can integrate with your PM tool (Linear, GitHub Issues, or Jira).

### Linear Setup

1. Get your Linear API key from [Linear Settings](https://linear.app/settings/api)
2. Set environment variable:
   ```bash
   export LINEAR_API_KEY=your-api-key-here
   export LINEAR_TEAM_ID=your-team-id-here
   ```
3. Hodge will automatically create and update Linear issues

### GitHub Issues Setup

(Coming soon - Linear supported first)

### Jira Setup

(Coming soon - Linear supported first)

## Next Steps

- **[Basic Usage](./basic-usage.md)** - Common workflows and commands
- **[Advanced Topics](./advanced/)** - Deep dives into Hodge features
- **[TEST-STRATEGY.md](../TEST-STRATEGY.md)** - Testing philosophy
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Development setup

## Getting Help

- 📖 [Documentation](https://www.hodgeson.dev)
- 🐛 [Report Issues](https://github.com/hodgeson-dev/hodge/issues)
- 💬 [Discussions](https://github.com/hodgeson-dev/hodge/discussions)

---

**Ready to build?** Start with `/explore your-first-feature` in Claude Code!
