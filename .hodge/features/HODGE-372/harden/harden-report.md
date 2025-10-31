# Harden Report: HODGE-372

## Validation Results
**Date**: 10/31/2025, 11:48:36 AM
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
- Use `/ship HODGE-372` to deploy
- Update PM issue status to "Done"

## Detailed Output

### type_checking: typescript
**Status**: ✅ Passed


```

```

### linting: eslint
**Status**: ✅ Passed


```
/Users/michaelkelly/Projects/hodge/src/commands/context.smoke.test.ts: line 249, col 29, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.smoke.test.ts: line 271, col 43, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/context.smoke.test.ts: line 288, col 50, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)

3 problems

```

### testing: vitest
**Status**: ✅ Passed


```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

···················································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-10-31T18:48:32.880Z","name":"pm-adapter","timestamp":"2025-10-31T18:48:32.880Z","enableConsole":false,"msg":"Failed to load PM overrides"}
······················{"level":"info","time":"2025-10-31T18:48:32.901Z","msg":"Process terminated"}
·····························································································································································································································································································································

 Test Files  130 passed (130)
      Tests  1350 passed (1350)
   Start at  11:48:17
   Duration  18.11s (transform 2.59s, setup 0ms, collect 18.49s, tests 43.09s, environment 18ms, prepare 13.36s)

(node:78041) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78357) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
fatal: No names found, cannot describe anything.
(node:78513) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78571) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78774) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78852) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:78856) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79120) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79121) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79188) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79190) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:79318) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79348) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79357) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79389) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79422) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79431) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79442) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79444) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79598) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79604) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:79631) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
 - [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [112:55 - 124:42] (12 lines, 118 tokens)
   [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [46:55 - 58:35]

Clone found (typescript):
 - [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [141:7 - 153:36] (12 lines, 162 tokens)
   [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [70:7 - 83:42]

Clone found (typescript):
 - [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [162:52 - 174:28] (12 lines, 118 tokens)
   [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [46:55 - 58:35]

Clone found (typescript):
 - [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [181:2 - 197:38] (16 lines, 201 tokens)
   [1m[32msrc/commands/hodge-372.smoke.test.ts[39m[22m [137:2 - 83:42]

Clone found (typescript):
 - [1m[32msrc/commands/context.smoke.test.ts[39m[22m [235:7 - 249:54] (14 lines, 117 tokens)
   [1m[32msrc/commands/context.smoke.test.ts[39m[22m [181:9 - 223:10]

[90m┌────────────[39m[90m┬────────────────[39m[90m┬─────────────[39m[90m┬──────────────[39m[90m┬──────────────[39m[90m┬──────────────────[39m[90m┬───────────────────┐[39m
[90m│[39m[31m Format     [39m[90m│[39m[31m Files analyzed [39m[90m│[39m[31m Total lines [39m[90m│[39m[31m Total tokens [39m[90m│[39m[31m Clones found [39m[90m│[39m[31m Duplicated lines [39m[90m│[39m[31m Duplicated tokens [39m[90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m typescript [90m│[39m 3              [90m│[39m 1263        [90m│[39m 10263        [90m│[39m 5            [90m│[39m 66 (5.23%)       [90m│[39m 716 (6.98%)       [90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m [1mTotal:[22m     [90m│[39m 3              [90m│[39m 1263        [90m│[39m 10263        [90m│[39m 5            [90m│[39m 66 (5.23%)       [90m│[39m 716 (6.98%)       [90m│[39m
[90m└────────────[39m[90m┴────────────────[39m[90m┴─────────────[39m[90m┴──────────────[39m[90m┴──────────────[39m[90m┴──────────────────[39m[90m┴───────────────────┘[39m
[90mFound 5 clones.[39m
[3m[90mDetection time:[39m[23m: 349.331ms

```

### architecture: dependency-cruiser
**Status**: ✅ Passed


```

✔ no dependency violations found (25 modules, 51 dependencies cruised)


```

### security: semgrep
**Status**: ✅ Passed


```

```

