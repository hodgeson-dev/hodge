# Harden Report: HODGE-359.1

## Validation Results
**Date**: 10/28/2025, 5:32:55 PM
**Overall Status**: ✅ PASSED

### Test Results
- **Tests**: ✅ Passed
- **Linting**: ✅ Passed
- **Type Check**: ✅ Passed

### Tools Used
- type_checking: typescript
- linting: eslint
- testing: vitest
- formatting: prettier
- complexity: none
- code_smells: none
- duplication: jscpd
- architecture: dependency-cruiser
- security: semgrep

## Standards Compliance
All standards have been met. Code is production-ready.

## Performance
Validations were run in parallel for optimal performance.

## Next Steps
✅ Feature is production-ready!
- Use `/ship HODGE-359.1` to deploy
- Update PM issue status to "Done"

## Detailed Output

### type_checking: typescript
**Status**: ✅ Passed


```

```

### linting: eslint
**Status**: ✅ Passed


```
/Users/michaelkelly/Projects/hodge/src/commands/review.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/ship.ts: line 25, col 3, Warning - Async method 'execute' has too many lines (58). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/ship.ts: line 259, col 10, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/harden-service.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-service.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-service.ts: line 604, col 1, Warning - File has too many lines (427). Maximum allowed is 400. (max-lines)
/Users/michaelkelly/Projects/hodge/src/test/hodge-356.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/types/toolchain.ts: line 155, col 6, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)

9 problems

```

### testing: vitest
**Status**: ✅ Passed


```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

·················································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-10-29T00:32:53.562Z","name":"pm-adapter","timestamp":"2025-10-29T00:32:53.557Z","enableConsole":false,"msg":"Failed to load PM overrides"}
················{"level":"info","time":"2025-10-29T00:32:53.654Z","msg":"Process terminated"}
····························································································································································································································································

 Test Files  131 passed (131)
      Tests  1341 passed (1341)
   Start at  17:32:37
   Duration  17.51s (transform 3.21s, setup 0ms, collect 18.45s, tests 45.15s, environment 26ms, prepare 11.41s)

(node:42568) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:42908) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
(node:43006) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43019) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43070) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43111) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43530) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
fatal: No names found, cannot describe anything.
(node:43813) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43905) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43903) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43933) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43974) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43973) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:43980) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44005) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:44092) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44230) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44236) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44314) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44331) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44381) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44388) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

```

### formatting: prettier
**Status**: ✅ Passed


```
Checking formatting...
All matched files use Prettier code style!

```

### complexity: none
**Status**: ⚠️ Skipped
**Reason**: No tools configured for this check type

```

```

### code_smells: none
**Status**: ⚠️ Skipped
**Reason**: No tools configured for this check type

```

```

### duplication: jscpd
**Status**: ✅ Passed


```
[32mJSON report saved to report/jscpd-report.json[39m
Duplications detection: Found [1m9[22m exact clones with [1m129[22m(2.66%) duplicated lines in [1m17[22m (1 formats) files.

```

### architecture: dependency-cruiser
**Status**: ✅ Passed


```

  warn no-orphans: src/lib/claude-commands.ts
  warn no-circular: src/commands/harden.ts → 
      src/commands/harden/harden-validator.ts →
      src/commands/harden.ts

x 2 dependency violations (0 errors, 2 warnings). 68 modules, 251 dependencies cruised.


```

### security: semgrep
**Status**: ✅ Passed


```

```

