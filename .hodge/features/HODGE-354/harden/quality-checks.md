# Quality Checks Report
**Generated**: 2025-10-26T18:11:11.919Z
**Total Checks**: 9

This report contains the raw output from all quality checks run by the toolchain.
The AI will interpret these results to identify issues that need to be fixed before shipping.


## TYPE CHECKING

### typescript - ✅ PASSED


## LINTING

### eslint - ✅ PASSED

**Output**:
```
/Users/michaelkelly/Projects/hodge/scripts/lib/release-utils.js: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/scripts/release-check.js: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/scripts/release-prepare.js: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/scripts/release-publish.js: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/test/hodge-354.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.

5 problems

```


## TESTING

### vitest - ✅ PASSED

**Output**:
```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

····················································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-10-26T18:11:01.009Z","name":"pm-adapter","timestamp":"2025-10-26T18:11:01.009Z","enableConsole":false,"msg":"Failed to load PM overrides"}
················{"level":"info","time":"2025-10-26T18:11:01.024Z","msg":"Process terminated"}
························································································································································································································································································

 Test Files  128 passed (128)
      Tests  1308 passed (1308)
   Start at  11:10:49
   Duration  18.50s (transform 1.52s, setup 0ms, collect 9.82s, tests 47.20s, environment 17ms, prepare 8.44s)


```

**Errors**:
```
(node:13504) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:14510) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:14593) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:14900) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15003) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15095) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15139) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15187) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
(node:15242) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15279) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15339) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15340) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15382) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15394) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15448) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:15534) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15547) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15550) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15661) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15738) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15756) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:15797) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
Duplications detection: Found [1m1[22m exact clones with [1m12[22m(1%) duplicated lines in [1m5[22m (2 formats) files.

```


## ARCHITECTURE

### dependency-cruiser - ✅ PASSED

**Output**:
```

✔ no dependency violations found (10 modules, 16 dependencies cruised)


```


## SECURITY

### semgrep - ❌ FAILED

**Errors**:
```
[00.44][WARNING](ca-certs): Ignored 1 trust anchors.

```


---

**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.
