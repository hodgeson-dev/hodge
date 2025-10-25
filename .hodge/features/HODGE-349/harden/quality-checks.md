# Quality Checks Report
**Generated**: 2025-10-25T20:36:19.081Z
**Total Checks**: 9

This report contains the raw output from all quality checks run by the toolchain.
The AI will interpret these results to identify issues that need to be fixed before shipping.


## TYPE CHECKING

### typescript - ✅ PASSED


## LINTING

### eslint - ✅ PASSED

**Output**:
```
/Users/michaelkelly/Projects/hodge/src/commands/hodge-319.4.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/plan.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 58, col 30, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 69, col 45, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 70, col 78, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 72, col 37, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 75, col 37, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 115, col 37, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 210, col 72, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 323, col 3, Warning - Async method 'generatePlan' has too many lines (70). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 402, col 1, Warning - File has too many lines (604). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 439, col 3, Warning - Method 'generateStories' has too many lines (63). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 546, col 54, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 563, col 53, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 574, col 3, Warning - Async method 'getFeatureDescription' has too many lines (62). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 714, col 58, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/plan.ts: line 780, col 55, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts: line 13, col 8, Warning - Function 'getClaudeCommands' has too many lines (3040). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts: line 418, col 1, Warning - File has too many lines (3044). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/config-manager.ts: line 125, col 29, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/config-manager.ts: line 130, col 27, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/config-manager.ts: line 131, col 41, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/test/file-consolidation.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/test/pm-integration.integration.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.

24 problems

```


## TESTING

### vitest - ✅ PASSED

**Output**:
```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

··························································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-10-25T20:35:36.384Z","name":"pm-adapter","timestamp":"2025-10-25T20:35:36.384Z","enableConsole":false,"msg":"Failed to load PM overrides"}
···································{"level":"info","time":"2025-10-25T20:35:36.430Z","msg":"Process terminated"}
·············································································································································································································································································································································································································

 Test Files  123 passed (123)
      Tests  1258 passed (1258)
   Start at  13:35:19
   Duration  54.52s (transform 3.59s, setup 0ms, collect 26.48s, tests 134.55s, environment 48ms, prepare 15.36s)


```

**Errors**:
```
(node:78051) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78052) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78049) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
(node:78496) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78514) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78639) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79115) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79375) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79568) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79590) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79592) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79711) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79721) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:79760) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:80001) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:80050) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:80056) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:80152) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:80208) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:80211) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:80307) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:80318) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

```


## FORMATTING

### prettier - ❌ FAILED

**Output**:
```
Checking formatting...

```

**Errors**:
```
[warn] src/commands/hodge-319.4.smoke.test.ts
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
Duplications detection: Found [1m3[22m exact clones with [1m40[22m(1.88%) duplicated lines in [1m6[22m (1 formats) files.

```


## ARCHITECTURE

### dependency-cruiser - ✅ PASSED

**Output**:
```

  warn no-orphans: src/lib/claude-commands.ts

x 1 dependency violations (0 errors, 1 warnings). 35 modules, 89 dependencies cruised.


```


## SECURITY

### semgrep - ❌ FAILED

**Errors**:
```
[01.87][WARNING](ca-certs): Ignored 1 trust anchors.

```


---

**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.
