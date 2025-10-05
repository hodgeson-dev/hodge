# Exploration: HODGE-328

## Title
Fix CI ESM compatibility error in validate-standards.js script

## Problem Statement

The `scripts/validate-standards.js` file uses CommonJS `require()` syntax but fails in CI because `package.json` contains `"type": "module"`, which treats all `.js` files as ES modules. Node.js 20.x throws "ReferenceError: require is not defined in ES module scope" during the "Validate standards" step in GitHub Actions, blocking the quality check workflow.

## Conversation Summary

### Issue Analysis

The CI failure occurs because:
- `scripts/validate-standards.js` uses CommonJS syntax (`const fs = require('fs')`)
- `package.json` has `"type": "module"` which makes all `.js` files ES modules
- Node.js 20.x in CI strictly enforces ES module rules
- The script needs to use `import` statements instead of `require()`

### Decision Made

User chose to convert the script to ESM syntax (using `import` statements) rather than rename to `.cjs` to maintain CommonJS. This aligns with the project's ESM-first approach.

## Implementation Approaches

### Approach 1: Convert to ESM with import statements (Recommended)

**Description**: Update `scripts/validate-standards.js` to use ES module syntax with `import` statements, maintaining all existing functionality.

**Changes Required**:
```javascript
// Replace CommonJS requires:
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// With ESM imports:
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
```

**Additional Considerations**:
- `__dirname` is not available in ESM, need to use `import.meta.url` if needed
- Top-level `await` is supported in ESM
- `main()` function can remain async and be called directly

**Pros**:
- Aligns with project's ESM configuration (`"type": "module"`)
- Consistent with rest of codebase
- Modern JavaScript standard
- No file renaming needed
- Maintains script functionality

**Cons**:
- Requires updating all require() statements
- Need to ensure no CommonJS-specific patterns remain

**When to use**: This is the recommended approach for ESM-first projects like Hodge.

---

### Approach 2: Rename to .cjs extension

**Description**: Rename `scripts/validate-standards.js` to `scripts/validate-standards.cjs` to explicitly mark it as CommonJS, allowing `require()` to work.

**Changes Required**:
- Rename file: `mv scripts/validate-standards.js scripts/validate-standards.cjs`
- Update any scripts in `package.json` that reference this file
- Update GitHub Actions workflow to call `.cjs` file

**Pros**:
- Zero code changes needed
- Explicitly marks file as CommonJS
- Quick fix

**Cons**:
- Inconsistent with project's ESM-first approach
- Creates mixed module system in project
- Not the long-term solution for an ESM project
- Still need to update CI workflow references

**When to use**: Only if maintaining CommonJS syntax is critical (not the case here).

---

### Approach 3: Use dynamic import()

**Description**: Keep the file as `.js` but wrap CommonJS-style code in a dynamic import wrapper.

**Not Recommended**: This would be unnecessarily complex and doesn't solve the root issue. Dynamic imports are for runtime module loading, not for converting CommonJS scripts.

## Recommendation

**Use Approach 1: Convert to ESM with import statements**

This approach:
1. **Aligns with project architecture**: Hodge is configured as ESM (`"type": "module"`)
2. **Fixes CI immediately**: Node 20.x will execute the script without errors
3. **Maintains consistency**: All project code uses ESM syntax
4. **Future-proof**: ESM is the JavaScript standard going forward
5. **Simple implementation**: Straightforward find-and-replace of require statements

**Implementation Steps**:
1. Replace all `require()` calls with `import` statements
2. Update any CommonJS exports (if present) to ESM `export`
3. Test locally with `node scripts/validate-standards.js`
4. Verify in CI that the script executes successfully

## Decisions Decided During Exploration

1. ✓ **Convert to ESM (import statements)** - User selected Approach 1 over renaming to .cjs

## Decisions Needed

**No Decisions Needed**

All technical decisions were resolved during conversational exploration.

## Test Intentions

**ESM Syntax Compatibility**:
- Script executes without "require is not defined" error
- All imports resolve correctly (fs, path, child_process)
- Script runs successfully in Node 20.x environment

**Functionality Preservation**:
- All existing validation checks continue to work (TypeScript, ESLint, Prettier, etc.)
- Exit codes remain correct (0 for success, 1 for errors)
- Console output formatting is preserved

**CI Integration**:
- GitHub Actions "Validate standards" step passes
- Script can be executed via `node scripts/validate-standards.js`
- No changes needed to workflow files (filename stays the same)

---

*Exploration completed: 2025-10-05T00:40:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
