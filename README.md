# Hodge

[![Build Status](https://img.shields.io/github/actions/workflow/status/hodgeson-dev/hodge/quality.yml?branch=main)](https://github.com/hodgeson-dev/hodge/actions)
[![npm version](https://img.shields.io/npm/v/@hodgeson/hodge)](https://www.npmjs.com/package/@hodgeson/hodge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AI development framework: Freedom to explore, discipline to build, confidence to ship.**

Hodge brings structure to AI-assisted development without sacrificing creativity. Work seamlessly with Claude Code through progressive phases that match how you actually build software.

---

## 🚧 Status

**Alpha Development** - Not ready for production use. Active development towards MVP.

## ✨ Features

- **Progressive Development** - Explore freely, build with structure, ship with confidence
- **Claude Code Integration** - Purpose-built slash commands for natural AI workflows
- **Smart Test Strategy** - Tests evolve with your code (intentions → smoke → integration → full suite)
- **PM Integration** - Connect to Linear, GitHub, or Jira (Linear supported first)
- **Quality Gates** - Automated standards enforcement that adapts to your phase
- **Feature Isolation** - Keep exploration, decisions, tests, and artifacts organized per feature

## 🚀 Quick Start

### Installation

```bash
npm install -g @hodgeson/hodge
```

### Initialize Your Project

```bash
hodge init
```

### Use in Claude Code

Once initialized, use slash commands in Claude Code:

```
/explore user-authentication    # Explore the problem space
/build user-authentication      # Implement with smoke tests
/harden user-authentication     # Add integration tests & validate
/ship user-authentication       # Create commit & ship to production
```

## 📖 Progressive Workflow

Hodge follows a natural progression from idea to production:

| Phase | Focus | Standards | Tests |
|-------|-------|-----------|-------|
| **Explore** | Understanding the problem | Optional | Test intentions (markdown) |
| **Build** | Getting it working | Recommended | Smoke tests (does it crash?) |
| **Harden** | Production readiness | Required | Integration tests (behavior) |
| **Ship** | Deployment | Enforced | Full coverage (confidence) |

## 🧪 Testing Philosophy

**"Vibe testing for vibe coding"** - Test behavior, not implementation.

```bash
npm run test:smoke       # Quick sanity checks (<100ms each)
npm run test:integration # Behavior verification (<500ms each)
npm test                 # Full suite (all tests)
npm run quality          # All checks (lint + type + test)
```

See [TEST-STRATEGY.md](./TEST-STRATEGY.md) for complete testing guidelines.

## 📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Installation and first steps
- **[TEST-STRATEGY.md](./TEST-STRATEGY.md)** - Testing philosophy and guidelines
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development setup and contribution guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

After running `hodge init`, your project will have:
- `.hodge/standards.md` - Project-specific standards
- `.claude/commands/` - Slash command definitions

## 🔧 Requirements

- **Node.js** ≥ 20.0.0
- **npm** (comes with Node.js)
- **Claude Code** (recommended) - https://claude.com/code

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Testing guidelines
- Code standards
- Pull request process

## 📜 License

MIT © [Hodgeson](https://www.hodgeson.dev)

---

**Learn more:** [www.hodgeson.dev](https://www.hodgeson.dev)
