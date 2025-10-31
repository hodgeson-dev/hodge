# Harden Report: HODGE-366

## Validation Results
**Date**: 10/31/2025, 2:32:58 AM
**Overall Status**: ❌ FAILED

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
Standards violations detected. Please fix before shipping.

## Performance
Validations were run in parallel for optimal performance.

## Next Steps
❌ Issues need to be resolved:
- Review validation output below
- Fix identified issues
- Run `/harden HODGE-366` again

## Detailed Output

### type_checking: typescript
**Status**: ✅ Passed


```

```

### linting: eslint
**Status**: ✅ Passed


```
/Users/michaelkelly/Projects/hodge/src/commands/explore-timing-fix.integration.test.ts: line 0, col 1, Error - Add some tests to this file or delete it. (sonarjs/no-empty-test-file)
/Users/michaelkelly/Projects/hodge/src/commands/explore.new-style.test.ts: line 0, col 1, Error - Add some tests to this file or delete it. (sonarjs/no-empty-test-file)
/Users/michaelkelly/Projects/hodge/src/commands/explore.new-style.test.ts: line 176, col 77, Warning - Async arrow function has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/commands/explore.new-style.test.ts: line 181, col 10, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/explore.sub-feature.test.ts: line 0, col 1, Error - Add some tests to this file or delete it. (sonarjs/no-empty-test-file)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 62, col 25, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 182, col 3, Warning - Async method 'performExploration' has too many lines (54). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 247, col 27, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 0, col 1, Error - Add some tests to this file or delete it. (sonarjs/no-empty-test-file)
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 10, col 5, Warning - Async method 'runQualityChecks' has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 17, col 5, Warning - Async method 'loadConfig' has no 'await' expression. (@typescript-eslint/require-await)
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 81, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 187, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 190, col 25, Warning - Unsafe member access .feature on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 191, col 25, Warning - Unsafe member access .commitMessage on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/commands/ship.ts: line 36, col 3, Warning - Async method 'execute' has too many lines (58). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/ship.ts: line 273, col 10, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/ship.ts: line 560, col 1, Warning - File has too many lines (403). Maximum allowed is 400. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/explore-service.ts: line 219, col 3, Warning - Async method 'analyzeFeatureIntent' has too many lines (61). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/explore-service.ts: line 222, col 7, Warning - Arrow function has too many lines (55). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/explore-service.ts: line 385, col 3, Warning - Method 'buildTemplateContent' has too many lines (63). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 7, col 26, Warning - 'CodePattern' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 7, col 26, Error - Remove this unused import of 'CodePattern'. (sonarjs/unused-import)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 7, col 39, Warning - 'LearningResult' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 7, col 39, Error - Remove this unused import of 'LearningResult'. (sonarjs/unused-import)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 19, col 5, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 19, col 15, Error - Unsafe construction of an any type value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 29, col 13, Warning - 'mockExistsSync' is assigned a value but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 29, col 13, Error - Remove the declaration of the unused 'mockExistsSync' variable. (sonarjs/no-unused-vars)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 29, col 13, Error - Remove this useless assignment to variable "mockExistsSync". (sonarjs/no-dead-store)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 36, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 36, col 84, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 76, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 76, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 76, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 78, col 21, Warning - Unsafe member access .statistics on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 79, col 21, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 82, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 82, col 32, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 82, col 39, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 82, col 62, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 84, col 32, Warning - Unsafe member access .frequency on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 87, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 87, col 31, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 87, col 38, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 87, col 61, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 91, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 91, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 91, col 35, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 91, col 58, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 95, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 95, col 33, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 95, col 40, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 95, col 63, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 109, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 109, col 61, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 112, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 112, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 112, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 114, col 21, Warning - Unsafe member access .statistics on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 115, col 21, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 133, col 37, Warning - Unsafe argument of type `any` assigned to a parameter of type `Dirent<Buffer<ArrayBufferLike>>[]`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 137, col 12, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 141, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 141, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 141, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 144, col 21, Warning - Unsafe member access .statistics on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 155, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 155, col 60, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 176, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 176, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 176, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 178, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 178, col 25, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 178, col 32, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 178, col 55, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 180, col 25, Warning - Unsafe member access .category on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 189, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 189, col 64, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 213, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 213, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 213, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 215, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 215, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 215, col 35, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 215, col 58, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 217, col 28, Warning - Unsafe member access .category on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 226, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 226, col 62, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 256, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 256, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 256, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 258, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 258, col 31, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 258, col 38, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 258, col 61, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 260, col 31, Warning - Unsafe member access .category on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 262, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 262, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 262, col 35, Warning - Unsafe member access .patterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 262, col 58, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 264, col 28, Warning - Unsafe member access .category on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 275, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 275, col 56, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 295, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 295, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 295, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 297, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 297, col 26, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 297, col 33, Warning - Unsafe member access .standards on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 297, col 57, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 299, col 26, Warning - Unsafe member access .level on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 308, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 308, col 61, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 338, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 338, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 338, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 340, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 340, col 29, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 340, col 36, Warning - Unsafe member access .standards on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 340, col 60, Warning - Unsafe member access .name on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 342, col 29, Warning - Unsafe member access .level on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 353, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 353, col 84, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 372, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 372, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 372, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 374, col 21, Warning - Unsafe member access .recommendations on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 375, col 21, Warning - Unsafe member access .recommendations on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 378, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 378, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 378, col 35, Warning - Unsafe member access .recommendations on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 378, col 63, Warning - Unsafe return of an `any` typed value. (@typescript-eslint/no-unsafe-return)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 378, col 63, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 378, col 65, Warning - Unsafe member access .includes on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 388, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 388, col 56, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 405, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 405, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 405, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 408, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 408, col 24, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 408, col 31, Warning - Unsafe member access .recommendations on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 409, col 9, Warning - Unsafe return of an `any` typed value. (@typescript-eslint/no-unsafe-return)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 409, col 9, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 409, col 9, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 409, col 11, Warning - Unsafe member access .toLowerCase on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 409, col 25, Warning - Unsafe member access .includes on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 424, col 9, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 424, col 71, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 442, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 442, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 442, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 444, col 21, Warning - Unsafe member access .statistics on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 445, col 21, Warning - Unsafe member access .statistics on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 454, col 36, Warning - Unsafe argument of type `any` assigned to a parameter of type `string | Buffer<ArrayBufferLike>`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 454, col 57, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 462, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 462, col 28, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 462, col 36, Warning - Unsafe member access .analyzeShippedCode on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 464, col 21, Warning - Unsafe member access .statistics on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 475, col 37, Warning - Unsafe argument of type `any` assigned to a parameter of type `Dirent<Buffer<ArrayBufferLike>>[]`. (@typescript-eslint/no-unsafe-argument)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 479, col 12, Warning - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 492, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 492, col 30, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 492, col 38, Warning - Unsafe member access .loadExistingPatterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 494, col 23, Warning - Unsafe member access .length on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 495, col 23, Warning - Unsafe member access [0] on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 496, col 23, Warning - Unsafe member access [0] on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 504, col 13, Warning - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 504, col 30, Error - Unsafe call of an `any` typed value. (@typescript-eslint/no-unsafe-call)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts: line 504, col 38, Warning - Unsafe member access .loadExistingPatterns on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts: line 552, col 14, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)

173 problems

```

### testing: vitest
**Status**: ✅ Passed


```

 RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

··············xstdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should complete full ship workflow with pre-approved message
🚀 Entering Ship Mode
Feature: test-feature

════════════════════════════════════════════════════════════
AI CONTEXT UPDATE:
════════════════════════════════════════════════════════════
You are now in SHIP MODE for: test-feature

SHIPPING REQUIREMENTS:
• Feature MUST be production-ready
• ALL tests MUST pass
• Documentation MUST be complete
• Code review SHOULD be done
• PM issue will be marked as Done
════════════════════════════════════════════════════════════


stdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should complete full ship workflow with pre-approved message
   Follow the proper flow:
   hodge explore test-feature
   hodge build test-feature
   hodge harden test-feature
   hodge ship test-feature


··xstdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should fallback to default message when no state exists
🚀 Entering Ship Mode
Feature: test-feature

════════════════════════════════════════════════════════════
AI CONTEXT UPDATE:
════════════════════════════════════════════════════════════
You are now in SHIP MODE for: test-feature

SHIPPING REQUIREMENTS:
• Feature MUST be production-ready
• ALL tests MUST pass
• Documentation MUST be complete
• Code review SHOULD be done
• PM issue will be marked as Done
════════════════════════════════════════════════════════════


stdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should fallback to default message when no state exists
   Follow the proper flow:
   hodge explore test-feature
   hodge build test-feature
   hodge harden test-feature
   hodge ship test-feature


···xstdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should handle corrupted state gracefully and fallback
🚀 Entering Ship Mode
Feature: test-feature

════════════════════════════════════════════════════════════
AI CONTEXT UPDATE:
════════════════════════════════════════════════════════════
You are now in SHIP MODE for: test-feature

SHIPPING REQUIREMENTS:
• Feature MUST be production-ready
• ALL tests MUST pass
• Documentation MUST be complete
• Code review SHOULD be done
• PM issue will be marked as Done
════════════════════════════════════════════════════════════


stdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should handle corrupted state gracefully and fallback
   Follow the proper flow:
   hodge explore test-feature
   hodge build test-feature
   hodge harden test-feature
   hodge ship test-feature


·xstdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should create ship record and release notes
🚀 Entering Ship Mode
Feature: test-feature

════════════════════════════════════════════════════════════
AI CONTEXT UPDATE:
════════════════════════════════════════════════════════════
You are now in SHIP MODE for: test-feature

SHIPPING REQUIREMENTS:
• Feature MUST be production-ready
• ALL tests MUST pass
• Documentation MUST be complete
• Code review SHOULD be done
• PM issue will be marked as Done
════════════════════════════════════════════════════════════


stdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should create ship record and release notes
   Follow the proper flow:
   hodge explore test-feature
   hodge build test-feature
   hodge harden test-feature
   hodge ship test-feature


···xstdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should skip push to protected branch without prompting
🚀 Entering Ship Mode
Feature: test-feature

════════════════════════════════════════════════════════════
AI CONTEXT UPDATE:
════════════════════════════════════════════════════════════
You are now in SHIP MODE for: test-feature

SHIPPING REQUIREMENTS:
• Feature MUST be production-ready
• ALL tests MUST pass
• Documentation MUST be complete
• Code review SHOULD be done
• PM issue will be marked as Done
════════════════════════════════════════════════════════════


stdout | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should skip push to protected branch without prompting
   Follow the proper flow:
   hodge explore test-feature
   hodge build test-feature
   hodge harden test-feature
   hodge ship test-feature


······················································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-10-31T09:32:57.112Z","name":"pm-adapter","timestamp":"2025-10-31T09:32:57.112Z","enableConsole":false,"msg":"Failed to load PM overrides"}
······························{"level":"info","time":"2025-10-31T09:32:57.129Z","msg":"Process terminated"}
········································································································································································································································································

 Test Files  1 failed | 131 passed (132)
      Tests  5 failed | 1363 passed (1368)
   Start at  02:32:43
   Duration  15.79s (transform 2.93s, setup 0ms, collect 17.50s, tests 37.08s, environment 23ms, prepare 12.33s)

(node:59769) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:59765) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
stderr | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should complete full ship workflow with pre-approved message
⚠️  Feature has not been hardened.
❌ Feature has not been built or hardened.

stderr | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should fallback to default message when no state exists
⚠️  Feature has not been hardened.
❌ Feature has not been built or hardened.

stderr | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should handle corrupted state gracefully and fallback
⚠️  Feature has not been hardened.
❌ Feature has not been built or hardened.

stderr | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should create ship record and release notes
⚠️  Feature has not been hardened.
❌ Feature has not been built or hardened.

stderr | src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should skip push to protected branch without prompting
⚠️  Feature has not been hardened.
❌ Feature has not been built or hardened.

(node:60186) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60208) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60307) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60436) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:60723) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
fatal: No names found, cannot describe anything.
(node:60989) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61119) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61124) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61121) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61205) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61299) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61306) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:61360) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61369) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61417) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61421) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61476) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61525) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61551) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:61564) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should complete full ship workflow with pre-approved message
AssertionError: expected 'initial\n' to contain 'fix: streamline ship workflow'

[32m- Expected[39m
[31m+ Received[39m

[32m- fix: streamline ship workflow[39m
[31m+ initial[39m
[31m+[39m

 ❯ src/commands/ship.integration.test.ts:82:26
     80|       const lastCommitResult = await workspace.run('git log -1 --prett…
     81|       const lastCommit = lastCommitResult.output;
     82|       expect(lastCommit).toContain('fix: streamline ship workflow');
       |                          ^
     83|       expect(lastCommit).toContain('pre-approved message');
     84| 
 ❯ Module.withTestWorkspace src/test/runners.ts:160:5
 ❯ src/commands/ship.integration.test.ts:30:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should fallback to default message when no state exists
AssertionError: expected 'initial\n' to contain 'test-feature'

[32m- Expected[39m
[31m+ Received[39m

[32m- test-feature[39m
[31m+ initial[39m
[31m+[39m

 ❯ src/commands/ship.integration.test.ts:118:39
    116|       // Verify commit was made with default message
    117|       const lastCommitResult = await workspace.run('git log -1 --prett…
    118|       expect(lastCommitResult.output).toContain('test-feature');
       |                                       ^
    119|       expect(lastCommitResult.output).toContain('Implementation comple…
    120|     });
 ❯ Module.withTestWorkspace src/test/runners.ts:160:5
 ❯ src/commands/ship.integration.test.ts:94:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should handle corrupted state gracefully and fallback
AssertionError: expected 'initial\n' to contain 'test-feature'

[32m- Expected[39m
[31m+ Received[39m

[32m- test-feature[39m
[31m+ initial[39m
[31m+[39m

 ❯ src/commands/ship.integration.test.ts:150:39
    148| 
    149|       const lastCommitResult = await workspace.run('git log -1 --prett…
    150|       expect(lastCommitResult.output).toContain('test-feature');
       |                                       ^
    151|     });
    152|   });
 ❯ Module.withTestWorkspace src/test/runners.ts:160:5
 ❯ src/commands/ship.integration.test.ts:124:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should create ship record and release notes
AssertionError: expected false to be true // Object.is equality

[32m- Expected[39m
[31m+ Received[39m

[32m- true[39m
[31m+ false[39m

 ❯ src/commands/ship.integration.test.ts:178:32
    176|         '.hodge/features/test-feature/ship-record.json'
    177|       );
    178|       expect(shipRecordExists).toBe(true);
       |                                ^
    179| 
    180|       // Verify release notes were created
 ❯ Module.withTestWorkspace src/test/runners.ts:160:5
 ❯ src/commands/ship.integration.test.ts:155:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  src/commands/ship.integration.test.ts > Ship Command - Integration Tests > [integration] should skip push to protected branch without prompting
AssertionError: expected 'initial\n' to contain 'test-feature'

[32m- Expected[39m
[31m+ Received[39m

[32m- test-feature[39m
[31m+ initial[39m
[31m+[39m

 ❯ src/commands/ship.integration.test.ts:221:39
    219|       // Verify commit was made locally
    220|       const lastCommitResult = await workspace.run('git log -1 --prett…
    221|       expect(lastCommitResult.output).toContain('test-feature');
       |                                       ^
    222|     });
    223|   });
 ❯ Module.withTestWorkspace src/test/runners.ts:160:5
 ❯ src/commands/ship.integration.test.ts:196:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


```

### formatting: prettier
**Status**: ❌ Failed


```
Checking formatting...
[warn] src/commands/explore.new-style.test.ts
[warn] src/commands/ship.integration.test.ts
[warn] Code style issues found in 2 files. Run Prettier with --write to fix.

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
 - [1m[32msrc/commands/ship.integration.test.ts[39m[22m [155:27 - 169:42] (14 lines, 129 tokens)
   [1m[32msrc/commands/ship.integration.test.ts[39m[22m [94:28 - 144:78]

[90m┌────────────[39m[90m┬────────────────[39m[90m┬─────────────[39m[90m┬──────────────[39m[90m┬──────────────[39m[90m┬──────────────────[39m[90m┬───────────────────┐[39m
[90m│[39m[31m Format     [39m[90m│[39m[31m Files analyzed [39m[90m│[39m[31m Total lines [39m[90m│[39m[31m Total tokens [39m[90m│[39m[31m Clones found [39m[90m│[39m[31m Duplicated lines [39m[90m│[39m[31m Duplicated tokens [39m[90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m typescript [90m│[39m 10             [90m│[39m 3441        [90m│[39m 27079        [90m│[39m 1            [90m│[39m 14 (0.41%)       [90m│[39m 129 (0.48%)       [90m│[39m
[90m├────────────[39m[90m┼────────────────[39m[90m┼─────────────[39m[90m┼──────────────[39m[90m┼──────────────[39m[90m┼──────────────────[39m[90m┼───────────────────┤[39m
[90m│[39m [1mTotal:[22m     [90m│[39m 10             [90m│[39m 3441        [90m│[39m 27079        [90m│[39m 1            [90m│[39m 14 (0.41%)       [90m│[39m 129 (0.48%)       [90m│[39m
[90m└────────────[39m[90m┴────────────────[39m[90m┴─────────────[39m[90m┴──────────────[39m[90m┴──────────────[39m[90m┴──────────────────[39m[90m┴───────────────────┘[39m
[90mFound 1 clones.[39m
[3m[90mDetection time:[39m[23m: 1.196s

```

### architecture: dependency-cruiser
**Status**: ✅ Passed


```

✔ no dependency violations found (55 modules, 188 dependencies cruised)


```

### security: semgrep
**Status**: ✅ Passed


```

```

