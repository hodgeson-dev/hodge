# Hodge Development Standards

This document explains how standards are enforced in the Hodge project.

## Quick Start

Standards are automatically enforced through:
1. **Pre-commit hooks** - Run on every commit
2. **CI/CD pipeline** - Run on every push
3. **Manual validation** - Run `npm run quality`

## Three-Tier Standard System

### 1. Essential Standards (Always Enforced)
- TypeScript strict mode
- No `any` without justification
- Semantic commit messages
- Tests for public APIs
- No console.log in production code

### 2. Recommended Standards (Progressive)
| Mode | Enforcement |
|------|------------|
| Explore | Suggested (warnings) |
| Build | Recommended (strong warnings) |
| Harden | Enforced (errors) |

### 3. Learned Patterns (Discovered)
- Extracted from actual code
- Suggested when similar code is written
- Can be promoted to recommended standards

## Enforcement Tools

### Pre-commit Hooks
Automatically runs on `git commit`:
- ESLint fixes
- Prettier formatting
- Standards validation

### Validation Script
```bash
# Run all quality checks
npm run quality

# Run individual checks
npm run lint        # ESLint
npm run format      # Prettier
npm run typecheck   # TypeScript
npm run test        # Tests
```

### Manual Validation
```bash
# Check standards compliance
node scripts/validate-standards.js
```

## Working with Standards

### In Explore Mode
```bash
hodge explore "feature-name"
```
- Essential standards enforced
- Recommended standards are suggestions
- Focus on rapid prototyping

### In Build Mode
```bash
hodge build "feature-name"
```
- Essential standards enforced
- Recommended standards strongly suggested
- Warnings for violations

### In Harden Mode
```bash
hodge harden "feature-name"
```
- All standards enforced
- No exceptions allowed
- Production-ready quality required

## Bypassing Checks (Emergency Only)

```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "emergency: fix critical bug"

# Disable specific ESLint rule for a line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response;
```

## Adding New Standards

1. Propose via PR to `.hodge/standards.md`
2. Discuss with team
3. Test as "recommended" for 2 weeks
4. Promote to "essential" if successful

## Troubleshooting

### Pre-commit hook not running
```bash
npm run prepare  # Reinstall husky
```

### ESLint errors
```bash
npm run lint -- --fix  # Auto-fix what's possible
```

### Prettier conflicts
```bash
npm run format  # Format all files
```

## CI/CD Integration

GitHub Actions automatically runs:
1. TypeScript compilation
2. ESLint checks
3. Prettier verification
4. Test suite
5. Standards validation

See `.github/workflows/quality.yml` for configuration.

## Standards Evolution

Standards are living documents:
- Review quarterly
- Adjust based on team feedback
- Extract patterns from shipped code
- Document decisions in `.hodge/decisions.md`