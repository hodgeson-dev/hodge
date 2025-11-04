# Harden Report: HODGE-377.6

## Validation Results
**Date**: 11/3/2025, 4:43:50 PM
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
- Use `/ship HODGE-377.6` to deploy
- Update PM issue status to "Done"

## Detailed Output

### type_checking: typescript
**Status**: ✅ Passed


```

```

### linting: eslint
**Status**: ✅ Passed


```
/Users/michaelkelly/Projects/hodge/src/commands/choice-formatting.smoke.test.ts: line 78, col 58, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/choice-formatting.smoke.test.ts: line 120, col 49, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/choice-formatting.smoke.test.ts: line 133, col 69, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/choice-formatting.smoke.test.ts: line 151, col 58, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/choice-formatting.smoke.test.ts: line 154, col 70, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 191, col 3, Warning - Async method 'showOverallStatus' has too many lines (71). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/status.ts: line 558, col 8, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/visual-patterns.smoke.test.ts: line 2, col 4, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/visual-rendering.smoke.test.ts: line 2, col 4, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/test/documentation-hierarchy.smoke.test.ts: line 7, col 80, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/documentation-hierarchy.smoke.test.ts: line 18, col 81, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/documentation-hierarchy.smoke.test.ts: line 33, col 84, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/documentation-hierarchy.smoke.test.ts: line 47, col 88, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/standards-enforcement.smoke.test.ts: line 10, col 79, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/standards-enforcement.smoke.test.ts: line 21, col 72, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/standards-enforcement.smoke.test.ts: line 32, col 69, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/standards-enforcement.smoke.test.ts: line 41, col 66, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/standards-enforcement.smoke.test.ts: line 68, col 65, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/standards-enforcement.smoke.test.ts: line 76, col 90, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/test/standards-enforcement.smoke.test.ts: line 94, col 80, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)

20 problems

```

### testing: vitest
**Status**: ✅ Passed


```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

··············································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-11-04T00:43:48.446Z","name":"pm-adapter","timestamp":"2025-11-04T00:43:48.446Z","enableConsole":false,"msg":"Failed to load PM overrides"}
················{"level":"info","time":"2025-11-04T00:43:48.462Z","msg":"Process terminated"}
····················································································································································································································································

 Test Files  131 passed (131)
      Tests  1362 passed (1362)
   Start at  16:43:35
   Duration  14.45s (transform 2.33s, setup 0ms, collect 15.66s, tests 34.54s, environment 16ms, prepare 10.30s)

(node:94798) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:94862) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:94860) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95171) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
(node:95351) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
(node:95518) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95538) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95547) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95615) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95619) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95714) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95841) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
(node:95871) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
⚠ No development tools detected
- Generating architecture graph...
- Detecting project technologies...
⚠ No review profiles with detection rules found
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
⚠ No development tools detected
- Generating architecture graph...
- Detecting project technologies...
⚠ No review profiles with detection rules found
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
⚠ No development tools detected
- Generating architecture graph...
- Detecting project technologies...
⚠ No review profiles with detection rules found
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting development tools...
⚠ No development tools detected
- Generating architecture graph...
- Detecting project technologies...
⚠ No review profiles with detection rules found
(node:95912) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95954) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95957) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95977) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:95988) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:96018) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:96038) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:96049) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:96070) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:96088) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
 - [1m[32msrc/commands/visual-rendering.smoke.test.ts[39m[22m [89:7 - 105:51] (16 lines, 210 tokens)
   [1m[32msrc/commands/visual-rendering.smoke.test.ts[39m[22m [25:7 - 41:37]

Clone found (typescript):
 - [1m[32msrc/commands/refine.smoke.test.ts[39m[22m [90:64 - 109:44] (19 lines, 194 tokens)
   [1m[32msrc/commands/refine.smoke.test.ts[39m[22m [67:62 - 86:67]

[90m┌────────────[39m[90m┬────────────────[39m[90m┬─────────────[39m[90m┬──────────────[39m[90m┬──────────────[39m[90m┬──────────────────[39m[90m┬───────────────────┐[39m
[90m│[39m[31m Format     [39m[90m│[39m[31m Files analyzed [39m[90m│[39m[31m Total lines [39m[90m│[39m[31m Total tokens [39m[90m│[39m[31m Clones found [39m[90m│[39m[31m Duplicated lines [39m[90m│[39m[31m Duplicated tokens [39m[90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m typescript [90m│[39m 17             [90m│[39m 4588        [90m│[39m 38594        [90m│[39m 2            [90m│[39m 35 (0.76%)       [90m│[39m 404 (1.05%)       [90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m [1mTotal:[22m     [90m│[39m 17             [90m│[39m 4588        [90m│[39m 38594        [90m│[39m 2            [90m│[39m 35 (0.76%)       [90m│[39m 404 (1.05%)       [90m│[39m
[90m└────────────[39m[90m┴────────────────[39m[90m┴─────────────[39m[90m┴──────────────[39m[90m┴──────────────[39m[90m┴──────────────────[39m[90m┴───────────────────┘[39m
[90mFound 2 clones.[39m
[3m[90mDetection time:[39m[23m: 1.303s

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

x 3 dependency violations (0 errors, 3 warnings). 124 modules, 513 dependencies cruised.


```

### security: semgrep
**Status**: ✅ Passed


```

```

