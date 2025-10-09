# Pattern: Complete Feature Removal

## Problem
You need to remove an entire feature (commands, infrastructure, tests) from the codebase without leaving orphaned code or breaking existing functionality.

## Solution

### When to Use
- Removing unused features
- Deprecating old implementations
- Cleaning up experimental code
- Simplifying overly complex systems

**Prerequisites**: Feature must be unused or have equivalent functionality elsewhere.

### Implementation Pattern

#### Phase 1: Analyze Scope
```bash
# Identify all components
- Slash commands (.claude/commands/)
- CLI commands (src/commands/)
- Core services (src/lib/)
- Type definitions (src/types/)
- Test files (*test.ts, *.spec.ts)
- Documentation references
```

#### Phase 2: Delete Infrastructure
```bash
# Remove files completely
rm .claude/commands/{feature}.md
rm src/commands/{feature}.ts
rm src/lib/{feature}-*.ts
rm src/types/{feature}-*.ts
rm **/*{feature}*.test.ts
```

#### Phase 3: Remove References
```bash
# Find all imports and calls
grep -r "from.*{feature}" src/
grep -r "import.*{feature}" src/

# Remove:
- Import statements
- Method calls
- CLI registration
- Template references
```

#### Phase 4: Verify Completeness
```bash
# Check for orphaned code
grep -r "{FeatureName}" src/        # PascalCase
grep -r "{featureName}" src/        # camelCase
grep -r "{feature-name}" src/       # kebab-case

# Expected result: Zero matches
```

#### Phase 5: Validate
```bash
# Run full suite
npm test           # All tests should pass
npm run lint       # No errors
npm run typecheck  # No type errors
npm run build      # Build succeeds
```

## Key Success Factors
- **Atomic removal**: All at once, not phased
- **Comprehensive verification**: grep for all references
- **Full test coverage**: Confirms nothing broke
- **Clear commit message**: Documents what and why

## Example
See HODGE-336 for complete example: Removed save/load commands (17 files, 3,950 lines) with zero regressions.

## Trade-offs
- **Pro**: Clean, verifiable, atomic change
- **Pro**: No half-removed infrastructure
- **Con**: Large changeset (but straightforward to review)
- **Con**: Requires comprehensive test coverage

## Related Patterns
- Test behavior not implementation (validates removal safety)
- Progressive development (know when to simplify vs add)

---
*Pattern identified: HODGE-336*
*Last updated: 2025-10-09*
