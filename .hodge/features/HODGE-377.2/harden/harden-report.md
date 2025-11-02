# Harden Report: HODGE-377.2

## Validation Results
**Date**: 11/1/2025, 9:09:13 PM
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
- Use `/ship HODGE-377.2` to deploy
- Update PM issue status to "Done"

## Detailed Output

### type_checking: typescript
**Status**: ✅ Passed


```

```

### linting: eslint
**Status**: ✅ Passed


```
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 104, col 8, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 126, col 8, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 118, col 33, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 151, col 33, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 174, col 25, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 229, col 33, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 342, col 35, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 357, col 3, Warning - Async method 'createEpicWithStories' has too many lines (66). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 384, col 37, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 409, col 40, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 47, col 40, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 75, col 40, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 83, col 48, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 129, col 44, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 170, col 47, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 195, col 12, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/pm/local-pm-adapter.ts: line 50, col 27, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/local-pm-adapter.ts: line 53, col 30, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/local-pm-adapter.ts: line 173, col 22, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/local-pm-adapter.ts: line 473, col 46, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/local-pm-adapter.ts: line 544, col 12, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)

21 problems

```

### testing: vitest
**Status**: ✅ Passed


```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

·····························································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-11-02T04:09:11.855Z","name":"pm-adapter","timestamp":"2025-11-02T04:09:11.854Z","enableConsole":false,"msg":"Failed to load PM overrides"}
················{"level":"info","time":"2025-11-02T04:09:11.877Z","msg":"Process terminated"}
·····························································································································································································

 Test Files  130 passed (130)
      Tests  1354 passed (1354)
   Start at  21:08:56
   Duration  16.96s (transform 2.55s, setup 0ms, collect 17.77s, tests 40.17s, environment 22ms, prepare 11.91s)

(node:44493) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44787) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44794) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:44879) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45012) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45092) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45506) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
fatal: No names found, cannot describe anything.
(node:45532) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45558) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45629) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45635) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45701) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45853) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
(node:45868) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
⚠ No development tools detected
- Detecting project technologies...
⚠ No review profiles with detection rules found
(node:45913) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45939) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45941) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45946) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45952) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:45979) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:46001) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:46047) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:46059) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:46066) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
 - [1m[32msrc/lib/pm/pm-adapter-id-detection.smoke.test.ts[39m[22m [114:49 - 127:55] (13 lines, 108 tokens)
   [1m[32msrc/lib/pm/pm-adapter-id-detection.smoke.test.ts[39m[22m [94:52 - 107:32]

Clone found (typescript):
 - [1m[32msrc/lib/pm/linear-adapter.ts[39m[22m [126:2 - 136:2] (10 lines, 85 tokens)
   [1m[32msrc/lib/pm/linear-adapter.ts[39m[22m [72:2 - 82:7]

Clone found (typescript):
 - [1m[32msrc/lib/pm/github-adapter.ts[39m[22m [140:2 - 156:26] (16 lines, 184 tokens)
   [1m[32msrc/lib/pm/github-adapter.ts[39m[22m [107:12 - 123:25]

Clone found (typescript):
 - [1m[32msrc/lib/pm/github-adapter.ts[39m[22m [221:2 - 231:2] (10 lines, 126 tokens)
   [1m[32msrc/lib/pm/github-adapter.ts[39m[22m [110:2 - 120:2]

Clone found (typescript):
 - [1m[32msrc/lib/pm/github-adapter.ts[39m[22m [305:8 - 320:6] (15 lines, 101 tokens)
   [1m[32msrc/lib/pm/linear-adapter.ts[39m[22m [217:15 - 234:6]

Clone found (typescript):
 - [1m[32msrc/lib/pm/github-adapter.ts[39m[22m [333:2 - 347:7] (14 lines, 138 tokens)
   [1m[32msrc/lib/pm/github-adapter.ts[39m[22m [108:2 - 121:6]

[90m┌────────────[39m[90m┬────────────────[39m[90m┬─────────────[39m[90m┬──────────────[39m[90m┬──────────────[39m[90m┬──────────────────[39m[90m┬───────────────────┐[39m
[90m│[39m[31m Format     [39m[90m│[39m[31m Files analyzed [39m[90m│[39m[31m Total lines [39m[90m│[39m[31m Total tokens [39m[90m│[39m[31m Clones found [39m[90m│[39m[31m Duplicated lines [39m[90m│[39m[31m Duplicated tokens [39m[90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m typescript [90m│[39m 10             [90m│[39m 3122        [90m│[39m 26061        [90m│[39m 6            [90m│[39m 78 (2.5%)        [90m│[39m 742 (2.85%)       [90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m [1mTotal:[22m     [90m│[39m 10             [90m│[39m 3122        [90m│[39m 26061        [90m│[39m 6            [90m│[39m 78 (2.5%)        [90m│[39m 742 (2.85%)       [90m│[39m
[90m└────────────[39m[90m┴────────────────[39m[90m┴─────────────[39m[90m┴──────────────[39m[90m┴──────────────[39m[90m┴──────────────────[39m[90m┴───────────────────┘[39m
[90mFound 6 clones.[39m
[3m[90mDetection time:[39m[23m: 1.114s

```

### architecture: dependency-cruiser
**Status**: ✅ Passed


```

  warn no-circular: src/lib/detection.ts → 
      src/lib/project-name-detector.ts →
      src/lib/detection.ts
  warn no-circular: src/commands/init.ts → 
      src/commands/init/init-interaction.ts →
      src/commands/init.ts
  warn no-circular: src/commands/harden.ts → 
      src/commands/harden/harden-validator.ts →
      src/commands/harden.ts

x 3 dependency violations (0 errors, 3 warnings). 111 modules, 462 dependencies cruised.


```

### security: semgrep
**Status**: ✅ Passed


```

```

