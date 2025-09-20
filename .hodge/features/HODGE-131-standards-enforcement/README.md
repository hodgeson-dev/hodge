# HODGE-131: Automated Standards Enforcement

## Problem Statement
While `.hodge/standards.md` defines critical project standards, there's no automated enforcement mechanism. Developers can accidentally (or intentionally) bypass standards, leading to inconsistent code quality and technical debt.

## Goal
Implement automated standards checking that integrates seamlessly with Hodge workflow commands, enforcing standards progressively through explore → build → harden → ship phases.

## Solution Overview

### 1. Standards Checker Module
Create a new module `src/lib/standards-checker.ts` that:
- Reads and validates against `.hodge/standards.md`
- Runs ESLint, TypeScript compiler, and test coverage checks
- Returns structured violation reports
- Provides fix suggestions where possible

### 2. Workflow Integration
Integrate standards checking into existing commands:

#### `hodge build`
- **Warns** about violations but doesn't block
- Shows standards summary at end
- Educates developers about requirements

#### `hodge harden`
- **Blocks** if critical standards aren't met:
  - ESLint errors
  - TypeScript errors
  - Missing required tests
- Provides clear error messages with fix commands

#### `hodge ship`
- **Refuses to ship** with any violations
- Runs comprehensive standards check
- Ensures all TODOs are reviewed
- Validates test coverage >80%
- Checks performance benchmarks

### 3. Real-time Feedback
Add standards status to `hodge status`:
```
Standards Compliance:
  ✅ TypeScript: No errors
  ⚠️  ESLint: 3 warnings
  ❌ Test Coverage: 72% (minimum 80%)
  ✅ Performance: All benchmarks pass
```

### 4. Git Hook Integration
Optional pre-commit/pre-push hooks that:
- Run standards checks before commits
- Can be bypassed with `--no-verify` for exploration
- Strictly enforced on main branch

## Implementation Plan

### Phase 1: Core Checker (Build)
- Create standards-checker module
- Parse standards.md requirements
- Implement basic validation logic

### Phase 2: Command Integration (Harden)
- Wire into build/harden/ship commands
- Add progressive enforcement logic
- Implement clear error reporting

### Phase 3: Enhanced Features (Ship)
- Add fix suggestions
- Integrate with hodge status
- Add configuration options
- Performance optimization

## Technical Details

### Standards Configuration Format
```typescript
interface StandardsConfig {
  core: {
    typescript: { strict: boolean };
    eslint: { errorLevel: 'error' | 'warn' };
    prettier: { enforced: boolean };
  };
  testing: {
    build: { minTests: number; maxTime: number };
    harden: { integrationTests: boolean; maxTime: number };
    ship: { coverage: number; maxTotalTime: number };
  };
  performance: {
    cliResponseTime: number;
    buildTime: number;
    testTime: number;
  };
}
```

### Enforcement Levels
```typescript
enum EnforcementLevel {
  IGNORE = 'ignore',     // Exploration phase
  WARN = 'warn',         // Build phase
  ERROR = 'error',       // Harden phase
  BLOCK = 'block'        // Ship phase
}
```

## Success Criteria
- [ ] Standards automatically checked during workflow
- [ ] Clear, actionable error messages
- [ ] Progressive enforcement (warn → error → block)
- [ ] Performance impact <100ms per command
- [ ] 100% backwards compatibility

## Future Enhancements
- Custom standards per project
- Team-specific standards profiles
- Standards history/trends tracking
- Auto-fix capability for common issues
- IDE integration for real-time feedback