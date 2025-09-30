# Exploration: HODGE-303

## Feature Overview
**PM Issue**: HODGE-303
**Type**: general
**Created**: 2025-09-30T05:03:56.510Z

## Problem Statement

The GitHub Actions "Quality Checks" workflow fails on the Prettier check, but `npx prettier --check .` passes locally. The error shows:

```
[warn] src/lib/claude-commands.ts
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
Error: Process completed with exit code 1.
```

### Root Cause Analysis

Investigation revealed:
1. **Build modifies the file**: The build script runs `npm run sync:commands` which regenerates `src/lib/claude-commands.ts`
2. **Local uncommitted changes**: The file has uncommitted changes (trailing commas removed from template literal strings)
3. **CI workflow order**: The workflow runs `npm run build` (step 30) BEFORE `npx prettier --check .` (step 40)
4. **Prettier config**: Uses `endOfLine: "lf"` and `trailingComma: "es5"`
5. **Sync script behavior**: The `scripts/sync-claude-commands.js` generates TypeScript template literals from markdown files, but the output differs from what's committed

The issue is that:
- CI checks out clean code → runs build → build regenerates file with different formatting → prettier check fails
- Local runs don't regenerate the file (already built) → prettier check passes on uncommitted version

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9
- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: error-boundary.md, async-parallel-operations.md

## Implementation Approaches

### Approach 1: Add Prettier to Sync Script
**Description**: Modify `scripts/sync-claude-commands.js` to run Prettier on the generated file before writing it.

**Pros**:
- Ensures generated code is always formatted correctly
- Single source of truth - the sync script owns the formatting
- No workflow changes needed
- Works for both CI and local development
- Future-proof - any formatting changes automatically applied

**Cons**:
- Adds prettier as a dependency to the sync script (minor overhead)
- Slightly slower build time (negligible - <100ms)

**When to use**: This is the ideal approach when you have code generation that should always produce consistently formatted output.

**Implementation**:
```javascript
// In sync-claude-commands.js, after writing:
const { execSync } = require('child_process');
fs.writeFileSync(OUTPUT_FILE, tsCode, 'utf8');
execSync(`npx prettier --write ${OUTPUT_FILE}`, { stdio: 'inherit' });
```

### Approach 2: Reorder CI Workflow Steps
**Description**: Run the Prettier check BEFORE the build step in the GitHub Actions workflow.

**Pros**:
- Checks source files before they're modified by build
- Validates what's committed, not what's generated
- Simple workflow change
- Clear separation of concerns

**Cons**:
- Doesn't solve the underlying issue (generated file may still be incorrectly formatted)
- Generated files might not match prettier standards
- Could cause issues for developers who run build locally then commit
- Misleading - you're checking source but shipping generated code

**When to use**: When you only care about source file formatting and generated files are ephemeral (like dist/).

### Approach 3: Git Pre-commit Hook
**Description**: Add a pre-commit hook that runs the sync script and stages changes to generated files.

**Pros**:
- Catches formatting issues before commit
- Works locally for developers
- Ensures committed code is always in sync

**Cons**:
- Doesn't solve CI issue (CI still regenerates)
- Requires developers to set up hooks (friction)
- Adds overhead to every commit
- HODGE-295 already implements pre-commit hooks, would need integration

**When to use**: As a supplement to Approach 1 for additional local validation.

## Recommendation

**Approach 1: Add Prettier to Sync Script** is the best solution because:

1. **Root cause fix**: Addresses the actual problem (generated code formatting) rather than working around it
2. **Consistency**: Generated code will always match prettier standards, in CI and locally
3. **Simplicity**: Single change to the sync script, no workflow modifications
4. **Future-proof**: Any future formatting rule changes automatically apply to generated code
5. **Zero developer friction**: No setup required, works transparently

The implementation is straightforward:
```javascript
// At the end of syncCommands() in scripts/sync-claude-commands.js
fs.writeFileSync(OUTPUT_FILE, tsCode, 'utf8');

// Format the generated file
const { execSync } = require('child_process');
execSync(`npx prettier --write ${OUTPUT_FILE}`, { stdio: 'pipe' });
console.log('✅ Formatted generated file with Prettier');
```

## Decisions Needed

1. **Primary approach decision**: Confirm Approach 1 (Add Prettier to sync script) vs alternatives
2. **Error handling**: Should sync script fail if prettier fails, or warn and continue?
3. **Scope**: Should we also check/format other generated files, or only claude-commands.ts?
4. **Pre-commit integration**: Should we integrate with HODGE-295's pre-commit hooks for additional safety?
5. **Documentation**: Update CONTRIBUTING.md to explain generated file formatting strategy?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-303`

---
*Template created: 2025-09-30T05:03:56.510Z*
*AI exploration to follow*
