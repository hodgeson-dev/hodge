# Build Plan: HODGE-328

## Feature Overview
**PM Issue**: HODGE-328 (linear)
**Status**: ✅ Completed
**Title**: Fix CI ESM compatibility error in validate-standards.js script

## Implementation Checklist

### Core Implementation
- [x] Convert scripts/validate-standards.js from CommonJS to ESM syntax
- [x] Replace `require()` with `import` statements
- [x] Remove unused `path` import
- [x] Verify script executes without ESM errors

### Integration
- [x] Script works with Node.js 20.x+ (tested with v22.12.0)
- [x] Script executes all validation checks properly
- [x] No changes needed to GitHub Actions workflow (filename unchanged)

### Quality Checks
- [x] Follow coding standards
- [x] Add smoke tests (5 tests, all passing)
- [x] Verify ESM syntax compliance
- [x] Test script execution on Node 22.x

## Files Modified

- `scripts/validate-standards.js` - Converted from CommonJS to ESM syntax
  - Changed `const fs = require('fs')` to `import fs from 'fs'`
  - Changed `const { execSync } = require('child_process')` to `import { execSync } from 'child_process'`
  - Removed unused `path` import

- `src/test/hodge-328.smoke.test.ts` - Created smoke tests (5 tests)
  - Validates ESM import syntax
  - Verifies no CommonJS require statements
  - Checks for necessary imports
  - Validates shebang and error handling

## Decisions Made

- **Use ESM imports over .cjs rename**: Aligns with project's ESM-first approach (`"type": "module"` in package.json)
- **Remove unused path import**: Cleaned up unnecessary dependency to avoid TypeScript warnings
- **Avoid subprocess spawning in tests**: Per HODGE-319.1 lesson learned, tests only check file contents, not execution

## Testing Notes

**Smoke Tests (5 total, all passing)**:
- Validates ESM import syntax exists
- Confirms no CommonJS require() statements
- Verifies all necessary imports present
- Checks shebang and async main function
- Validates error handling with process.exit

**Manual Verification**:
- Script executes successfully on Node.js 22.12.0
- All validation checks run properly (TypeScript, ESLint, Prettier, etc.)
- No "require is not defined" errors
- Exit codes work correctly

## Next Steps

✅ Implementation complete. Feature ready for harden phase.

1. ✅ All smoke tests passing (5/5)
2. ✅ Script verified on Node.js 22.x
3. ✅ ESM conversion successful
4. Ready to proceed to `/harden HODGE-328` for integration tests
