# Harden Report: HODGE-377.1

## Validation Results
**Date**: 11/1/2025, 5:01:44 PM
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
- Use `/ship HODGE-377.1` to deploy
- Update PM issue status to "Done"

## Detailed Output

### type_checking: typescript
**Status**: ✅ Passed


```

```

### linting: eslint
**Status**: ✅ Passed


```
/Users/michaelkelly/Projects/hodge/src/lib/structure-generator.ts: line 180, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/structure-generator.ts: line 287, col 36, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/structure-generator.ts: line 547, col 3, Warning - Async method 'generateCommonPMScripts' has too many lines (52). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/structure-generator.ts: line 665, col 1, Warning - File has too many lines (405). Maximum allowed is 400. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.smoke.test.ts: line 193, col 74, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.smoke.test.ts: line 205, col 83, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.smoke.test.ts: line 217, col 93, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.smoke.test.ts: line 226, col 94, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.smoke.test.ts: line 234, col 93, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.smoke.test.ts: line 244, col 14, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.ts: line 136, col 22, Warning - Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/team-mode-service.ts: line 170, col 22, Warning - Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined. (@typescript-eslint/no-unnecessary-condition)

12 problems

```

### testing: vitest
**Status**: ✅ Passed


```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

···········································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-11-02T00:01:42.171Z","name":"pm-adapter","timestamp":"2025-11-02T00:01:42.170Z","enableConsole":false,"msg":"Failed to load PM overrides"}
····················································{"level":"info","time":"2025-11-02T00:01:42.195Z","msg":"Process terminated"}
································································································································································································································································································

 Test Files  128 passed (128)
      Tests  1343 passed (1343)
   Start at  17:01:30
   Duration  13.15s (transform 2.08s, setup 0ms, collect 13.75s, tests 30.02s, environment 17ms, prepare 9.32s)

(node:7117) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:7113) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:7300) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:7720) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:7891) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:7984) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8070) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
fatal: No names found, cannot describe anything.
(node:8152) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:8197) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:8242) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8241) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8245) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8393) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8405) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8551) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8565) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8586) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8605) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8616) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8633) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8644) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:8660) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
 - [1m[32msrc/lib/team-mode-service.smoke.test.ts[39m[22m [41:5 - 51:47] (10 lines, 91 tokens)
   [1m[32msrc/lib/team-mode-service.smoke.test.ts[39m[22m [24:5 - 34:8]

[90m┌────────────[39m[90m┬────────────────[39m[90m┬─────────────[39m[90m┬──────────────[39m[90m┬──────────────[39m[90m┬──────────────────[39m[90m┬───────────────────┐[39m
[90m│[39m[31m Format     [39m[90m│[39m[31m Files analyzed [39m[90m│[39m[31m Total lines [39m[90m│[39m[31m Total tokens [39m[90m│[39m[31m Clones found [39m[90m│[39m[31m Duplicated lines [39m[90m│[39m[31m Duplicated tokens [39m[90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m typescript [90m│[39m 4              [90m│[39m 1231        [90m│[39m 7722         [90m│[39m 1            [90m│[39m 10 (0.81%)       [90m│[39m 91 (1.18%)        [90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m [1mTotal:[22m     [90m│[39m 4              [90m│[39m 1231        [90m│[39m 7722         [90m│[39m 1            [90m│[39m 10 (0.81%)       [90m│[39m 91 (1.18%)        [90m│[39m
[90m└────────────[39m[90m┴────────────────[39m[90m┴─────────────[39m[90m┴──────────────[39m[90m┴──────────────[39m[90m┴──────────────────[39m[90m┴───────────────────┘[39m
[90mFound 1 clones.[39m
[3m[90mDetection time:[39m[23m: 163.429ms

```

### architecture: dependency-cruiser
**Status**: ✅ Passed


```

  warn no-circular: src/lib/detection.ts → 
      src/lib/project-name-detector.ts →
      src/lib/detection.ts

x 1 dependency violations (0 errors, 1 warnings). 29 modules, 60 dependencies cruised.


```

### security: semgrep
**Status**: ✅ Passed


```

```

