# Quality Checks Report
**Generated**: 2025-10-24T09:20:09.443Z
**Total Checks**: 9

This report contains the raw output from all quality checks run by the toolchain.
The AI will interpret these results to identify issues that need to be fixed before shipping.


## TYPE CHECKING

### typescript - ✅ PASSED


## LINTING

### eslint - ❌ FAILED

**Output**:
```
/Users/michaelkelly/Projects/hodge/.hodge/.session: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/HODGE.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/context.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/build/build-plan.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/explore/exploration.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/explore/test-intentions.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/issue-id.txt: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-346.4/ship-record.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/id-mappings.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/lessons/HODGE-317.1-eliminate-hung-test-processes.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/lessons/HODGE-341.5-test-infrastructure-fix.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/project_management.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/report/jscpd-report.json: line 0, col 0, Error - Parsing error: ESLint was configured to run on `<tsconfigRootDir>/report/jscpd-report.json` using `parserOptions.project`: /users/michaelkelly/projects/hodge/tsconfig.json
The extension for the file (`.json`) is non-standard. You should add `parserOptions.extraFileExtensions` to your config.
/Users/michaelkelly/Projects/hodge/src/bin/hodge.ts: line 7, col 7, Warning - Variable name `__filename` must match one of the following formats: camelCase, PascalCase (@typescript-eslint/naming-convention)
/Users/michaelkelly/Projects/hodge/src/bin/hodge.ts: line 8, col 7, Warning - Variable name `__dirname` must match one of the following formats: camelCase, PascalCase (@typescript-eslint/naming-convention)
/Users/michaelkelly/Projects/hodge/src/commands/context.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 42, col 30, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 77, col 45, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 100, col 72, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 192, col 42, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 314, col 38, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 315, col 32, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 316, col 42, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 317, col 60, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 317, col 81, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 426, col 1, Warning - File has too many lines (387). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 489, col 12, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 520, col 33, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 521, col 23, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 522, col 34, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 523, col 40, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/lessons.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/lessons.ts: line 165, col 26, Error - Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service. (sonarjs/slow-regex)
/Users/michaelkelly/Projects/hodge/src/commands/status.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 50, col 3, Warning - Async method 'showFeatureStatus' has too many lines (74). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 50, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 146, col 3, Warning - Async method 'showOverallStatus' has too many lines (71). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 165, col 52, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 166, col 52, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 201, col 55, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 228, col 53, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 385, col 9, Error - Make sure the "PATH" variable only contains fixed, unwriteable directories. (sonarjs/no-os-command-from-path)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 390, col 21, Error - Make sure that executing this OS command is safe here. (sonarjs/os-command)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 409, col 1, Warning - File has too many lines (367). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 508, col 8, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)

45 problems
```


## TESTING

### vitest - ✅ PASSED

**Output**:
```
RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

·····················································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································

 Test Files  121 passed (121)
      Tests  1237 passed (1237)
   Start at  02:19:17
   Duration  51.78s (transform 2.61s, setup 0ms, collect 21.65s, tests 125.75s, environment 19ms, prepare 14.13s)

(node:43837) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43839) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:44257) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
(node:44497) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44447) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44714) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44716) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44958) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45003) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45079) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45367) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45387) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45407) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45415) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:45478) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:45504) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45632) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45825) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45865) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45964) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:46024) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:46019) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
```


## FORMATTING

### prettier - ✅ PASSED

**Output**:
```
Checking formatting...
All matched files use Prettier code style!
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
Duplications detection: Found [1m1[22m exact clones with [1m11[22m(0.23%) duplicated lines in [1m17[22m (3 formats) files.
```


## ARCHITECTURE

### dependency-cruiser - ✅ PASSED

**Output**:
```
warn no-orphans: report/jscpd-report.json
  warn no-orphans: .hodge/project_management.md
  warn no-orphans: .hodge/lessons/HODGE-341.5-test-infrastructure-fix.md
  warn no-orphans: .hodge/id-mappings.json
  warn no-orphans: .hodge/HODGE.md
  warn no-orphans: .hodge/features/HODGE-346.4/ship-record.json
  warn no-orphans: .hodge/features/HODGE-346.4/issue-id.txt
  warn no-orphans: .hodge/features/HODGE-346.4/explore/test-intentions.md
  warn no-orphans: .hodge/features/HODGE-346.4/explore/exploration.md
  warn no-orphans: .hodge/features/HODGE-346.4/build/build-plan.md
  warn no-orphans: .hodge/context.json
  warn no-orphans: .hodge/.session

x 12 dependency violations (0 errors, 12 warnings). 107 modules, 369 dependencies cruised.
```


## SECURITY

### semgrep - ❌ FAILED

**Output**:
```
[01.26][WARNING](ca-certs): Ignored 1 trust anchors.
```


---

**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.
