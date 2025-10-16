# Quality Checks Report
**Generated**: 2025-10-16T21:09:46.889Z
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
/Users/michaelkelly/Projects/hodge/.claude/commands/visual-patterns.smoke.test.ts: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.claude/commands/visual-rendering.smoke.test.ts: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/.session: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/HODGE.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/context.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/build/ai-diff-analysis.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/build/build-plan.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/explore/exploration.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/explore/test-intentions.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/harden/auto-fix-report.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/harden/critical-files.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/harden/quality-checks.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/harden/review-manifest.yaml: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/issue-id.txt: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/ship-record.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346/decisions.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/id-mappings.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/patterns/slash-command-verification-pattern.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/project_management.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/report/jscpd-report.json: line 0, col 0, Error - Parsing error: ESLint was configured to run on `<tsconfigRootDir>/report/jscpd-report.json` using `parserOptions.project`: /users/michaelkelly/projects/hodge/tsconfig.json
The extension for the file (`.json`) is non-standard. You should add `parserOptions.extraFileExtensions` to your config.
/Users/michaelkelly/Projects/hodge/src/lib/claude-commands.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts: line 13, col 8, Warning - Function 'getClaudeCommands' has too many lines (2435). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts: line 406, col 1, Warning - File has too many lines (2439). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/hodge-319.3.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/hodge-md-generator.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/hodge-md-generator.ts: line 70, col 24, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/hodge-md-generator.ts: line 381, col 1, Warning - File has too many lines (458). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/hodge-md-generator.ts: line 404, col 68, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)

38 problems
```


## TESTING

### vitest - ❌ FAILED

**Output**:
```
RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

···············································x··········································································································································································································································································································································································································x························································································x··························································································································································································································································································································································································································································································································································································································································xx··

 Test Files  3 failed | 116 passed (119)
      Tests  5 failed | 1165 passed (1170)
   Start at  14:08:36
   Duration  70.11s (transform 5.56s, setup 0ms, collect 45.77s, tests 195.05s, environment 67ms, prepare 32.40s)

(node:38984) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:38987) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:39021) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:39209) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
(node:39430) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:39649) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:39961) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40026) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40153) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40196) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40431) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:40584) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40635) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40705) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40767) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40835) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40839) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:40935) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:41007) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:41039) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:41150) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:41197) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  scripts/sync-claude-commands.test.ts > sync-claude-commands > [smoke] should generate valid TypeScript
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ scripts/sync-claude-commands.test.ts:36:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  src/commands/hodge-319.4.smoke.test.ts > HODGE-319.4 - Phase-Specific Context.json Elimination > [smoke] build command should NOT create phase-specific context.json
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ smokeTest src/test/helpers.ts:31:10
     29|  */
     30| export function smokeTest(name: string, fn: () => void | Promise<void>…
     31|   return it(testCategory(TestCategory.SMOKE, name), fn, timeout);
       |          ^
     32| }
     33| 
 ❯ src/commands/hodge-319.4.smoke.test.ts:6:3

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯
```


## FORMATTING

### prettier - ❌ FAILED

**Output**:
```
Checking formatting...
Error occurred when checking code style in 2 files.

[error] No parser could be inferred for file "/Users/michaelkelly/Projects/hodge/.hodge/.session".
[error] No parser could be inferred for file "/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.2/issue-id.txt".
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
Duplications detection: Found [1m0[22m exact clones with [1m0[22m(0%) duplicated lines in [1m31[22m (5 formats) files.
```


## ARCHITECTURE

### dependency-cruiser - ✅ PASSED

**Output**:
```
warn no-orphans: src/lib/claude-commands.ts
  warn no-orphans: report/jscpd-report.json
  warn no-orphans: .hodge/project_management.md
  warn no-orphans: .hodge/patterns/slash-command-verification-pattern.md
  warn no-orphans: .hodge/id-mappings.json
  warn no-orphans: .hodge/HODGE.md
  warn no-orphans: .hodge/features/HODGE-346/decisions.md
  warn no-orphans: .hodge/features/HODGE-346.2/ship-record.json
  warn no-orphans: .hodge/features/HODGE-346.2/issue-id.txt
  warn no-orphans: .hodge/features/HODGE-346.2/harden/review-manifest.yaml
  warn no-orphans: .hodge/features/HODGE-346.2/harden/quality-checks.md
  warn no-orphans: .hodge/features/HODGE-346.2/harden/critical-files.md
  warn no-orphans: .hodge/features/HODGE-346.2/harden/auto-fix-report.json
  warn no-orphans: .hodge/features/HODGE-346.2/explore/test-intentions.md
  warn no-orphans: .hodge/features/HODGE-346.2/explore/exploration.md
  warn no-orphans: .hodge/features/HODGE-346.2/build/build-plan.md
  warn no-orphans: .hodge/features/HODGE-346.2/build/ai-diff-analysis.md
  warn no-orphans: .hodge/context.json
  warn no-orphans: .hodge/.session
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

x 29 dependency violations (0 errors, 29 warnings). 49 modules, 34 dependencies cruised.
```


## SECURITY

### semgrep - ❌ FAILED

**Output**:
```
[01.44][WARNING](ca-certs): Ignored 1 trust anchors.
```


---

**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.
