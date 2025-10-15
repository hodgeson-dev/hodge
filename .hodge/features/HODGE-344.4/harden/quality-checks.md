# Quality Checks Report
**Generated**: 2025-10-15T16:04:38.637Z
**Total Checks**: 9

This report contains the raw output from all quality checks run by the toolchain.
The AI will interpret these results to identify issues that need to be fixed before shipping.


## TYPE CHECKING

### typescript - ✅ PASSED


## LINTING

### eslint - ✅ PASSED

**Output**:
```
/Users/michaelkelly/Projects/hodge/src/bin/hodge.ts: line 7, col 7, Warning - Variable name `__filename` must match one of the following formats: camelCase, PascalCase (@typescript-eslint/naming-convention)
/Users/michaelkelly/Projects/hodge/src/bin/hodge.ts: line 8, col 7, Warning - Variable name `__dirname` must match one of the following formats: camelCase, PascalCase (@typescript-eslint/naming-convention)
/Users/michaelkelly/Projects/hodge/src/commands/review.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts: line 13, col 8, Warning - Function 'getClaudeCommands' has too many lines (2427). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts: line 400, col 1, Warning - File has too many lines (2431). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-service.ts: line 325, col 12, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-service.ts: line 455, col 1, Warning - File has too many lines (323). Maximum allowed is 300. (max-lines)

7 problems

```


## TESTING

### vitest - ✅ PASSED

**Output**:
```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

·························································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································

 Test Files  115 passed (115)
      Tests  1049 passed (1049)
   Start at  09:03:44
   Duration  50.03s (transform 2.49s, setup 0ms, collect 20.60s, tests 111.36s, environment 19ms, prepare 12.34s)


```

**Errors**:
```
(node:63477) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:63478) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:63476) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:63474) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:63897) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:64006) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:64332) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:64903) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:64905) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:64911) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
⚠ No development tools detected
- Detecting project technologies...
⚠ No review profiles with detection rules found
(node:64967) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65032) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65114) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65113) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65165) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65283) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65299) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65325) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65435) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65575) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:65613) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
Duplications detection: Found [1m0[22m exact clones with [1m0[22m(0%) duplicated lines in [1m5[22m (1 formats) files.

```


## ARCHITECTURE

### dependency-cruiser - ✅ PASSED

**Output**:
```

✔ no dependency violations found (91 modules, 346 dependencies cruised)


```


## SECURITY

### semgrep - ❌ FAILED

**Errors**:
```
[01.28][WARNING](ca-certs): Ignored 1 trust anchors.

```


---

**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.
