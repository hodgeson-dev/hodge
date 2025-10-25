# Pre-push Quality Checks

## Overview
This project uses smart selective pre-push hooks to catch quality issues before they reach CI/CD. The hooks prevent common CI failures by running critical checks locally.

## What Gets Checked

### Always (All Branches)
- **Prettier Formatting**: Checks all files for formatting issues (~1-2 seconds)

### Protected Branches Only
Protected branches (main, develop, release/*, hotfix/*) also run:
- **npm audit**: Security vulnerability scanning with moderate severity level
- **Caching**: Audit results are cached for 24 hours to improve performance

## Performance
- Target: < 5 seconds total execution time
- Prettier: ~1-2 seconds
- npm audit (cached): < 1 second
- npm audit (uncached): ~3-5 seconds

## Usage

### Normal Push
```bash
git push origin feature-branch  # Quick checks only
git push origin main           # Full checks including npm audit
```

### Force All Checks
```bash
HODGE_STRICT=true git push origin feature-branch
```

### Bypass Checks (Emergency Only)
```bash
git push --no-verify origin main
```

## Caching
npm audit results are cached in `.cache/` for 24 hours. The cache is automatically invalidated when:
- package-lock.json changes
- Cache expires (>24 hours old)
- Manual cache clear: `rm -rf .cache/`

## Troubleshooting

### Prettier Failures
```bash
# See what needs formatting
npx prettier --check .

# Fix all formatting issues
npx prettier --write .
```

### npm Audit Failures
```bash
# View vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Force fixes (may include breaking changes)
npm audit fix --force
```

### Hook Not Running
```bash
# Ensure husky is installed
npm run prepare

# Verify hook is executable
ls -la .husky/pre-push
```

## Configuration
The pre-push hook configuration is based on decisions made in HODGE-295:
- **Audit Level**: moderate (matching GitHub Actions)
- **Cache Duration**: 24 hours
- **Protected Branches**: main, develop, release/*, hotfix/*
- **Override Method**: --no-verify flag
- **Prettier Scope**: All files
- **Performance Target**: 5 seconds

## Implementation Details
- Location: `.husky/pre-push`
- Language: Bash (for portability and performance)
- Cache: `.cache/npm-audit-cache.json`
- Tests: `test/pre-push-hook.test.ts`