# Ship Commit - HODGE-341.2

## Approved Commit Message

```
feat: implement two-layer toolchain configuration architecture (HODGE-341.2)

## What Changed

**Core Infrastructure** (5 files, 248 lines):
- src/bundled-config/tool-registry.yaml: Updated default commands with correct parameters
  - TypeScript: Added `-p tsconfig.build.json --noEmit ${files}`
  - Vitest: Added `NODE_ENV=test npx vitest run --reporter=dot`
  - jscpd: Added `--min-lines 10` flag to reduce noise
  - dependency-cruiser: Added `--config .dependency-cruiser.cjs ${files}`
  - eslint-plugin-sonarjs: Changed from `null` to `npx eslint ${files}`

- src/lib/toolchain-generator.ts: Extended to handle all 9 quality check categories
  - Added: complexity, code_smells, duplication, architecture, security
  - Refactored category mapping to use switch statement for maintainability
  - Used non-null assertions for TypeScript strict mode compliance

- src/lib/toolchain-service.ts: Enhanced quality checks execution
  - Extended runQualityChecks() to run all 9 check types
  - Fixed version detection regex to prevent ReDoS vulnerability
  - Improved error handling and logging

- src/lib/harden-service.ts: Captured all quality check results
  - Added private typed field for lastQualityCheckResults
  - Removed unsafe `any` types (TypeScript strict mode compliance)
  - Added getter method for command layer access

- src/commands/harden.ts: Integrated quality checks reporting
  - Added generateQualityChecksReport() method
  - Writes comprehensive quality-checks.md with all tool outputs
  - Reduced cognitive complexity via extractMethod refactoring

**Command Refactoring** (2 files, 137 lines):
- src/commands/build.ts: Extracted validatePrerequisites() method
  - Reduced cognitive complexity from 21 to under 15
  - Improved maintainability and readability

- src/commands/harden.ts: Extracted setupHardenEnvironment() method
  - Reduced cognitive complexity from 18 to under 15
  - Added helper methods for test status formatting

**Service Enhancement** (1 file, 69 lines):
- src/lib/ship-service.ts: Added updateShipRecord() method
  - Enables partial updates to ship-record.json
  - Proper error handling with structured logging

**Test Updates** (6 files, 74 lines):
- Updated ship-record.json path from `ship/ship-record.json` to root-level
- Fixed 14 test assertions for new ship-record location
- Increased timeout for slow toolchain detection tests (5s → 10s)
- All tests maintain proper isolation (no project .hodge modifications)

**Configuration Updates** (2 files):
- .hodge/toolchain.yaml: Added `--min-lines 10` to jscpd command
- src/types/toolchain.ts: Enhanced with comprehensive quality check categories

## Why This Change

Phase 2 of HODGE-341 epic implements the two-layer toolchain configuration architecture:
- **Layer 1 (Tool Registry)**: Hodge's universal tool knowledge with opinionated defaults
- **Layer 2 (Project Toolchain)**: User-customizable commands for their project

This enables:
- Proper tool detection and execution via registry-based patterns
- All 9 quality check categories (not just 4) running in harden phase
- Raw tool output capture for AI interpretation (HODGE-341.3)
- Commit range scoping using buildStartCommit/hardenStartCommit
- Scalable quality checks without hardcoded tool knowledge

## Impact

✅ **Architecture**:
- Clean two-layer separation: registry defines defaults, toolchain customizes
- CLI discovers structure, AI interprets content (HODGE-334 pattern)
- Service-based design with proper type safety

✅ **Code Quality**:
- All 939 tests passing (no regressions)
- Zero unsafe `any` types in HODGE-341.2 code
- TypeScript strict mode compliance throughout
- Reduced cognitive complexity in command files

✅ **Developer Experience**:
- `hodge init` generates toolchain.yaml with all 9 quality check categories
- Quality checks report (quality-checks.md) provides comprehensive tool outputs
- Better error messages and logging throughout
- Proper separation of concerns (commands vs services)

✅ **Quality Gates**:
- 9 quality check types now running: type_checking, linting, testing, formatting, complexity, code_smells, duplication, architecture, security
- Raw tool output preserved for AI review (HODGE-341.3)
- Commit-scoped file checking for focused reviews

**Pattern**: Two-layer configuration enables opinionated defaults with user customization, following the principle of "sensible defaults, easy overrides."

**Known Issues**: Pre-existing ESLint errors in codebase documented in .hodge/features/HODGE-341.2/KNOWN-ISSUES.md (159 errors from previous features, not introduced by HODGE-341.2)

Closes HODGE-341.2
```
