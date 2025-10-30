# Harden Report: HODGE-364

## Validation Results
**Date**: 10/29/2025, 1:51:56 AM
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
- Use `/ship HODGE-364` to deploy
- Update PM issue status to "Done"

## Detailed Output

### type_checking: typescript
**Status**: ✅ Passed


```

```

### linting: eslint
**Status**: ✅ Passed


```
/Users/michaelkelly/Projects/hodge/src/commands/context.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 479, col 12, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 512, col 33, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 513, col 23, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 514, col 34, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.ts: line 515, col 40, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 188, col 3, Warning - Async method 'showOverallStatus' has too many lines (71). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 551, col 8, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/esm-config.integration.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/explore-service.ts: line 212, col 3, Warning - Async method 'analyzeFeatureIntent' has too many lines (61). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/explore-service.ts: line 215, col 7, Warning - Arrow function has too many lines (55). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/explore-service.ts: line 378, col 3, Warning - Method 'buildTemplateContent' has too many lines (63). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/test/test-isolation.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.

14 problems

```

### testing: vitest
**Status**: ✅ Passed


```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

···········································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-10-29T08:51:54.682Z","name":"pm-adapter","timestamp":"2025-10-29T08:51:54.681Z","enableConsole":false,"msg":"Failed to load PM overrides"}
················{"level":"info","time":"2025-10-29T08:51:54.699Z","msg":"Process terminated"}
·························································································································································································································································································

 Test Files  132 passed (132)
      Tests  1364 passed (1364)
   Start at  01:51:41
   Duration  15.17s (transform 2.31s, setup 0ms, collect 15.07s, tests 37.35s, environment 18ms, prepare 11.07s)

(node:3335) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:3600) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
(node:3842) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:3946) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4174) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4447) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4514) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
(node:4517) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
(node:4637) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4862) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4860) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4868) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4899) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4911) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4928) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:4977) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:5091) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:5111) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:5123) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:5153) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:5162) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:5194) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
Clone found (typescript):
 - [1m[32msrc/commands/context.smoke.test.ts[39m[22m [252:7 - 263:54] (11 lines, 109 tokens)
   [1m[32msrc/commands/context.smoke.test.ts[39m[22m [221:7 - 232:10]

[90m┌────────────[39m[90m┬────────────────[39m[90m┬─────────────[39m[90m┬──────────────[39m[90m┬──────────────[39m[90m┬──────────────────[39m[90m┬───────────────────┐[39m
[90m│[39m[31m Format     [39m[90m│[39m[31m Files analyzed [39m[90m│[39m[31m Total lines [39m[90m│[39m[31m Total tokens [39m[90m│[39m[31m Clones found [39m[90m│[39m[31m Duplicated lines [39m[90m│[39m[31m Duplicated tokens [39m[90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m typescript [90m│[39m 11             [90m│[39m 3853        [90m│[39m 31852        [90m│[39m 1            [90m│[39m 11 (0.29%)       [90m│[39m 109 (0.34%)       [90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m [1mTotal:[22m     [90m│[39m 11             [90m│[39m 3853        [90m│[39m 31852        [90m│[39m 1            [90m│[39m 11 (0.29%)       [90m│[39m 109 (0.34%)       [90m│[39m
[90m└────────────[39m[90m┴────────────────[39m[90m┴─────────────[39m[90m┴──────────────[39m[90m┴──────────────[39m[90m┴──────────────────[39m[90m┴───────────────────┘[39m
[90mFound 1 clones.[39m
[3m[90mDetection time:[39m[23m: 1.825s

```

### architecture: dependency-cruiser
**Status**: ✅ Passed


```

  warn no-orphans: src/lib/claude-commands.ts

x 1 dependency violations (0 errors, 1 warnings). 54 modules, 170 dependencies cruised.


```

### security: semgrep
**Status**: ✅ Passed


```

```

