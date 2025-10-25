# Quality Checks Report
**Generated**: 2025-10-25T00:32:04.915Z
**Total Checks**: 9

This report contains the raw output from all quality checks run by the toolchain.
The AI will interpret these results to identify issues that need to be fixed before shipping.


## TYPE CHECKING

### typescript - ✅ PASSED


## LINTING

### eslint - ❌ FAILED

**Output**:
```
/Users/michaelkelly/Projects/hodge/.claude/commands/build.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/codify.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/decide.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/explore.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/harden.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/hodge.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/plan.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/review.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/ship.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/status.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/HODGE.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/context.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/harden/auto-fix-report.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/harden/critical-files.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/harden/quality-checks.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/harden/review-manifest.yaml: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/ship-record.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/project_management.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/report/jscpd-report.json: line 0, col 0, Error - Parsing error: ESLint was configured to run on `<tsconfigRootDir>/report/jscpd-report.json` using `parserOptions.project`: /users/michaelkelly/projects/hodge/tsconfig.json
The extension for the file (`.json`) is non-standard. You should add `parserOptions.extraFileExtensions` to your config.
/Users/michaelkelly/Projects/hodge/src/commands/choice-formatting.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/hodge-324.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/visual-patterns.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/visual-rendering.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.

23 problems
```


## TESTING

### vitest - ❌ FAILED

**Output**:
```
RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

················································································x····················································x··x·······················································································x······································································································································x·xx································································································································································································································································································································································································································································································x·····························································································································x···············································································································································································x···················································································x·····x·

 Test Files  4 failed | 117 passed (121)
      Tests  12 failed | 1225 passed (1237)
   Start at  17:30:18
   Duration  102.97s (transform 34.35s, setup 0ms, collect 148.43s, tests 333.37s, environment 129ms, prepare 71.56s)

(node:29232) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:29231) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:29235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
(node:29605) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
(node:30123) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:30295) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:30436) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:30716) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:30956) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
⚠ No development tools detected
- Detecting project technologies...
⚠ No review profiles with detection rules found
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
(node:31130) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
⚠ No development tools detected
- Detecting project technologies...
⚠ No review profiles with detection rules found
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
⚠ No development tools detected
- Detecting project technologies...
⚠ No review profiles with detection rules found
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
⚠ No development tools detected
- Detecting project technologies...
⚠ No review profiles with detection rules found
(node:31235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:31455) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:31442) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:31532) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:31739) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:31830) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:31967) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:32046) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:32108) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:32128) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:32318) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:32402) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

⎯⎯⎯⎯⎯⎯ Failed Tests 12 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  scripts/sync-claude-commands.test.ts > sync-claude-commands > [smoke] should preserve command content
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ scripts/sync-claude-commands.test.ts:76:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/12]⎯

 FAIL  scripts/sync-claude-commands.test.ts > sync-claude-commands > [smoke] should generate consistent output across runs
Error: Test timed out in 10000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ scripts/sync-claude-commands.test.ts:92:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/12]⎯

 FAIL  src/lib/toolchain-service-registry.smoke.test.ts > ToolchainService - Registry-Based Detection (HODGE-341.2) > [smoke] should detect tools using registry without crashing
Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service-registry.smoke.test.ts:14:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/12]⎯

 FAIL  src/lib/toolchain-service-registry.smoke.test.ts > ToolchainService - Registry-Based Detection (HODGE-341.2) > [smoke] should detect TypeScript in this project
Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service-registry.smoke.test.ts:27:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/12]⎯

 FAIL  src/lib/toolchain-service-registry.smoke.test.ts > ToolchainService - Registry-Based Detection (HODGE-341.2) > [smoke] should detect ESLint in this project
Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service-registry.smoke.test.ts:41:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/12]⎯

 FAIL  src/lib/toolchain-service-registry.smoke.test.ts > ToolchainService - Registry-Based Detection (HODGE-341.2) > [smoke] should detect tool via config file
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service-registry.smoke.test.ts:54:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/12]⎯

 FAIL  src/lib/toolchain-service-registry.smoke.test.ts > ToolchainService - Registry-Based Detection (HODGE-341.2) > [smoke] should detect tool via package.json
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service-registry.smoke.test.ts:72:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/12]⎯

 FAIL  src/lib/toolchain-service-registry.smoke.test.ts > ToolchainService - Registry-Based Detection (HODGE-341.2) > [smoke] should detect ESLint plugin
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service-registry.smoke.test.ts:97:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/12]⎯

 FAIL  src/lib/toolchain-service-registry.smoke.test.ts > ToolchainService - Registry-Based Detection (HODGE-341.2) > [smoke] should handle missing tools gracefully
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service-registry.smoke.test.ts:131:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/12]⎯

 FAIL  src/lib/toolchain-service.smoke.test.ts > ToolchainService - Smoke Tests > [smoke] should detect tools from package.json
Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/lib/toolchain-service.smoke.test.ts:46:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/12]⎯

 FAIL  src/commands/ship.smoke.test.ts > Ship Command - Smoke Tests > [smoke] should be completely non-interactive
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/commands/ship.smoke.test.ts:61:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/12]⎯

 FAIL  src/commands/ship.smoke.test.ts > Ship Command - Smoke Tests > [smoke] should be non-interactive by default (no prompts allowed)
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/commands/ship.smoke.test.ts:105:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/12]⎯
```


## FORMATTING

### prettier - ❌ FAILED

**Output**:
```
Checking formatting...

[warn] src/commands/hodge-324.smoke.test.ts
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```


## COMPLEXITY

### none (SKIPPED)
**Reason**: No tools configured for this check type


## CODE SMELLS

### none (SKIPPED)
**Reason**: No tools configured for this check type


## DUPLICATION

### jscpd - ✅ PASSED

**Output**:
```
[32mJSON report saved to report/jscpd-report.json[39m
Duplications detection: Found [1m8[22m exact clones with [1m121[22m(1.9%) duplicated lines in [1m23[22m (5 formats) files.
```


## ARCHITECTURE

### dependency-cruiser - ❌ FAILED

**Output**:
```
warn no-orphans: report/jscpd-report.json
  warn no-orphans: .hodge/project_management.md
  warn no-orphans: .hodge/HODGE.md
  warn no-orphans: .hodge/features/HODGE-346.4/ship-record.json
  warn no-orphans: .hodge/features/HODGE-346.4/harden/review-manifest.yaml
  warn no-orphans: .hodge/features/HODGE-346.4/harden/quality-checks.md
  warn no-orphans: .hodge/features/HODGE-346.4/harden/critical-files.md
  warn no-orphans: .hodge/features/HODGE-346.4/harden/auto-fix-report.json
  warn no-orphans: .hodge/context.json
  warn no-orphans: .claude/commands/status.md
  warn no-orphans: .claude/commands/ship.md
  warn no-orphans: .claude/commands/review.md
  warn no-orphans: .claude/commands/plan.md
  warn no-orphans: .claude/commands/hodge.md
  warn no-orphans: .claude/commands/harden.md
  warn no-orphans: .claude/commands/explore.md
  warn no-orphans: .claude/commands/decide.md
  warn no-orphans: .claude/commands/codify.md
  warn no-orphans: .claude/commands/build.md
  error not-to-unresolvable: src/commands/hodge-324.smoke.test.ts → ../lib/file-utils.js

x 20 dependency violations (1 errors, 19 warnings). 28 modules, 13 dependencies cruised.
```


## SECURITY

### semgrep - ❌ FAILED

**Output**:
```
[02.77][WARNING](ca-certs): Ignored 1 trust anchors.
```


---

**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.
