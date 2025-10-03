# Hodge

AI development framework: Freedom to explore, discipline to build, confidence to ship.

## Status

🚧 **Alpha Development** - Not ready for production use

## Requirements

- **Node.js** ≥ 20.0.0

## Installation

```bash
npm install -g @agile-explorations/hodge
```

## Quick Start

```bash
# Initialize Hodge in your project
hodge init

# Start exploring a feature
hodge explore "user authentication"

# Build with recommended standards
hodge build "user authentication"

# Harden for production
hodge harden "user authentication"
```

## Testing Philosophy

We follow a **Progressive Testing Strategy** - tests evolve with code maturity:

- **Explore**: Write test intentions (what should it do?)
- **Build**: Write smoke tests (does it work at all?)
- **Harden**: Add integration tests (does it behave correctly?)
- **Ship**: Full test suite (is it production ready?)

See [TEST-STRATEGY.md](./TEST-STRATEGY.md) for complete testing guidelines.

### Quick Test Commands

```bash
npm run test:smoke       # Quick sanity checks
npm run test:integration # Behavior verification
npm run test:unit        # Logic validation
npm run test:acceptance  # User story validation
npm run test             # Run all tests
```

## Documentation

- [TEST-STRATEGY.md](./TEST-STRATEGY.md) - Testing philosophy and guidelines
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Development roadmap
- [.hodge/standards.md](./.hodge/standards.md) - Project standards (after `hodge init`)

## License

MIT © Agile Explorations