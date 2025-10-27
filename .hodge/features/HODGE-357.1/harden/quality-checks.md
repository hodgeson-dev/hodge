# Quality Checks Report
**Generated**: 2025-10-27T02:24:11.975Z
**Total Checks**: 9

This report contains the raw output from all quality checks run by the toolchain.
The AI will interpret these results to identify issues that need to be fixed before shipping.


## TYPE CHECKING

### typescript - ❌ FAILED

**Output**:
```
src/lib/tool-category-mapper.ts(6,29): error TS2305: Module '"../types/toolchain.js"' has no exported member 'ToolInfo'.
src/lib/tool-category-mapper.ts(69,5): error TS6133: 'tool' is declared but its value is never read.
```


## LINTING

### eslint - ❌ FAILED

**Output**:
```
/Users/michaelkelly/Projects/hodge/.hodge/.session: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/HODGE.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/context.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-356/build/build-plan.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-356/build/refactoring-complete.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-356/explore/exploration.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-356/explore/test-intentions.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-356/issue-id.txt: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-356/ship-record.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357.1/build/build-plan.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357.1/build/progress-checkpoint.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357.1/build/refactoring-complete.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357.1/explore/exploration.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357.1/explore/test-intentions.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357.1/issue-id.txt: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357.1/ship-record.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357/build/build-plan.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357/decisions.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357/explore/exploration.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357/explore/test-intentions.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357/issue-id.txt: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357/plan.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/features/HODGE-357/ship-record.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/id-counter.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/id-mappings.json: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/patterns/test-pattern.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/project_management.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/.hodge/standards.md: line 0, col 0, Warning - File ignored by default.  Use a negated ignore pattern (like "--ignore-pattern '!<relative/path/to/filename>'") to override.
/Users/michaelkelly/Projects/hodge/report/jscpd-report.json: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/decide.ts: line 16, col 30, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/decide.ts: line 19, col 3, Warning - Async method 'execute' has too many lines (125). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/decide.ts: line 19, col 9, Error - Refactor this function to reduce its Cognitive Complexity from 22 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/commands/decide.ts: line 190, col 68, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/decide.ts: line 197, col 59, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 78, col 32, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 81, col 3, Warning - Async method 'execute' has too many lines (177). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 81, col 9, Error - Refactor this function to reduce its Cognitive Complexity from 26 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 90, col 25, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 210, col 76, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 314, col 27, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 414, col 47, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 417, col 1, Warning - File has too many lines (651). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 423, col 3, Warning - Async method 'analyzeFeatureIntent' has too many lines (55). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 532, col 21, Warning - Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 533, col 17, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 534, col 16, Warning - Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/explore.ts: line 669, col 3, Warning - Method 'generateTestIntentions' has too many lines (106). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/harden.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 46, col 41, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 292, col 60, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 297, col 59, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 303, col 69, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 344, col 3, Warning - Method 'generateReport' has too many lines (54). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 355, col 60, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 357, col 59, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 358, col 69, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 396, col 47, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 397, col 56, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 403, col 12, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 403, col 29, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 455, col 1, Warning - File has too many lines (570). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 555, col 14, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/harden.ts: line 616, col 3, Warning - Async method 'handleReviewMode' has too many lines (56). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/hodge-319.1.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/hodge-324.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 89, col 3, Warning - Async method 'execute' has too many lines (68). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 89, col 9, Error - Refactor this function to reduce its Cognitive Complexity from 22 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 194, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 212, col 3, Warning - Method 'getPMToolEnvTemplate' has too many lines (81). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 292, col 12, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 300, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 310, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 330, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 436, col 1, Warning - File has too many lines (983). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 591, col 3, Warning - Async method 'executePatternLearning' has too many lines (63). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 597, col 10, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 598, col 10, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 683, col 68, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 718, col 3, Warning - Async method 'smartQuestionFlow' has too many lines (108). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 718, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 791, col 11, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 840, col 20, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 888, col 3, Warning - Async method 'promptForPMTool' has too many lines (75). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 888, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 916, col 39, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 1103, col 19, Error - Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service. (sonarjs/slow-regex)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 1111, col 3, Warning - Method 'displayCompletionMessage' has too many lines (70). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 1198, col 3, Warning - Async method 'checkAndOfferAIIntegrations' has too many lines (52). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/init.ts: line 1267, col 3, Warning - Async method 'installClaudeIntegration' has too many lines (90). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/ship-clean-tree.integration.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/ship-clean-tree.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/ship.integration.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/commands/ship.ts: line 25, col 3, Warning - Async method 'execute' has too many lines (127). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/commands/ship.ts: line 162, col 10, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/cache-manager.ts: line 98, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/cache-manager.ts: line 365, col 14, Error - Make sure this weak hash algorithm is not used in a sensitive context here. (sonarjs/hashing)
/Users/michaelkelly/Projects/hodge/src/lib/cache-manager.ts: line 492, col 1, Warning - File has too many lines (328). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 166, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 189, col 34, Error - Make sure the "PATH" variable only contains fixed, unwriteable directories. (sonarjs/no-os-command-from-path)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 198, col 11, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 307, col 34, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 312, col 34, Error - Make sure the "PATH" variable only contains fixed, unwriteable directories. (sonarjs/no-os-command-from-path)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 389, col 40, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 390, col 43, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 423, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 27 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 438, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 438, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 439, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 439, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 440, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 440, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 478, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 26 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 486, col 1, Warning - File has too many lines (366). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 493, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 493, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 494, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 494, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 495, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 495, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 496, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 496, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 497, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 497, col 13, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 531, col 16, Error - Make sure the "PATH" variable only contains fixed, unwriteable directories. (sonarjs/no-os-command-from-path)
/Users/michaelkelly/Projects/hodge/src/lib/detection.ts: line 548, col 23, Error - Make sure the "PATH" variable only contains fixed, unwriteable directories. (sonarjs/no-os-command-from-path)
/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts: line 55, col 42, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts: line 102, col 3, Warning - Async method 'generateExploration' has too many lines (86). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts: line 102, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts: line 255, col 9, Error - Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts: line 304, col 32, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts: line 305, col 33, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts: line 306, col 31, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/harden-service.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/harden-service.ts: line 69, col 54, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/harden-service.ts: line 96, col 54, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 110, col 14, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 115, col 53, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 139, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 227, col 13, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 345, col 55, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 364, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 393, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 435, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 456, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 461, col 12, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 472, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 475, col 65, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts: line 489, col 10, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/interaction-state.ts: line 246, col 55, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/interaction-state.ts: line 256, col 6, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts: line 150, col 9, Error - Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service. (sonarjs/slow-regex)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts: line 349, col 19, Error - Group parts of the regex together to make the intended operator precedence explicit. (sonarjs/anchor-precedence)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts: line 453, col 1, Warning - File has too many lines (427). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts: line 544, col 14, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts: line 583, col 12, Error - Make sure this weak hash algorithm is not used in a sensitive context here. (sonarjs/hashing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 116, col 33, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 149, col 33, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 172, col 25, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 227, col 33, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 340, col 35, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 346, col 7, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 355, col 3, Warning - Async method 'createEpicWithStories' has too many lines (66). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 382, col 37, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 398, col 1, Warning - File has too many lines (359). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 407, col 40, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 437, col 34, Error - Make sure the "PATH" variable only contains fixed, unwriteable directories. (sonarjs/no-os-command-from-path)
/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts: line 456, col 7, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 47, col 40, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 75, col 40, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 83, col 48, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 129, col 44, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 170, col 47, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts: line 195, col 12, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 165, col 3, Warning - Async method 'callPMAdapter' has too many lines (62). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 165, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 263, col 60, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 269, col 3, Warning - Async method 'generateRichComment' has too many lines (55). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 269, col 17, Error - Refactor this function to reduce its Cognitive Complexity from 31 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 290, col 38, Warning - Unnecessary conditional, both sides of the expression are literal values. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 291, col 32, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 291, col 54, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 342, col 3, Warning - Async method 'createPMIssue' has too many lines (97). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 342, col 9, Error - Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 373, col 50, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 418, col 54, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 429, col 1, Warning - File has too many lines (440). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 518, col 11, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 526, col 11, Warning - Prefer using an optional chain expression instead, as it's more concise and easier to read. (@typescript-eslint/prefer-optional-chain)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 531, col 7, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 564, col 9, Error - Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 585, col 52, Warning - Unnecessary conditional, both sides of the expression are literal values. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 589, col 32, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts: line 596, col 11, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/profile-composition-service.ts: line 169, col 9, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/profile-composition-service.ts: line 187, col 3, Warning - Method 'buildConcatenatedContent' has too many lines (91). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/profile-composition-service.ts: line 187, col 11, Error - Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/profile-composition-service.ts: line 258, col 11, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/profile-composition-service.ts: line 273, col 11, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/prompts.ts: line 16, col 3, Warning - Async method 'promptShipCommit' has too many lines (126). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/prompts.ts: line 16, col 9, Error - Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/prompts.ts: line 23, col 57, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/prompts.ts: line 120, col 37, Error - Refactor this function to always return the same type. (sonarjs/function-return-type)
/Users/michaelkelly/Projects/hodge/src/lib/prompts.ts: line 276, col 37, Error - Refactor this function to always return the same type. (sonarjs/function-return-type)
/Users/michaelkelly/Projects/hodge/src/lib/prompts.ts: line 305, col 3, Warning - Async method 'promptPushOptions' has too many lines (51). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/prompts.ts: line 380, col 1, Warning - File has too many lines (329). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/review-tier-classifier.ts: line 224, col 11, Error - Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. (sonarjs/cognitive-complexity)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 117, col 11, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 117, col 46, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 124, col 11, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 124, col 46, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 131, col 11, Error - Extract this nested ternary operation into an independent statement. (sonarjs/no-nested-conditional)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 131, col 51, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 386, col 61, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 411, col 55, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 412, col 54, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 413, col 64, Warning - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (@typescript-eslint/prefer-nullish-coalescing)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 422, col 64, Error - 'unknown' overrides all other types in this union type. (@typescript-eslint/no-redundant-type-constituents)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 486, col 1, Warning - File has too many lines (327). Maximum allowed is 300. (max-lines)
/Users/michaelkelly/Projects/hodge/src/lib/ship-service.ts: line 514, col 44, Warning - Unnecessary conditional, value is always truthy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/todo-checker.ts: line 39, col 5, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/todo-checker.ts: line 47, col 14, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/todo-checker.ts: line 73, col 7, Error - Handle this exception or don't catch it at all. (sonarjs/no-ignored-exceptions)
/Users/michaelkelly/Projects/hodge/src/lib/todo-checker.ts: line 82, col 33, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/tool-category-mapper.ts: line 72, col 19, Error - Unsafe member access .default_command on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/tool-category-mapper.ts: line 77, col 7, Error - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/tool-category-mapper.ts: line 77, col 25, Error - Unsafe member access .default_command on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/tool-category-mapper.ts: line 78, col 7, Error - Unsafe assignment of an `any` value. (@typescript-eslint/no-unsafe-assignment)
/Users/michaelkelly/Projects/hodge/src/lib/tool-category-mapper.ts: line 78, col 26, Error - Unsafe member access .categories on an `any` value. (@typescript-eslint/no-unsafe-member-access)
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-generator.ts: line 33, col 3, Warning - Async method 'generate' has too many lines (66). Maximum allowed is 50. (max-lines-per-function)
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-generator.ts: line 43, col 36, Warning - Complete the task associated to this "TODO" comment. (sonarjs/todo-tag)
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-generator.ts: line 61, col 14, Warning - Unnecessary conditional, value is always falsy. (@typescript-eslint/no-unnecessary-condition)
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-service-registry.integration.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-service-registry.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/lib/toolchain-service.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.
/Users/michaelkelly/Projects/hodge/src/test/hodge-356.smoke.test.ts: line 0, col 0, Warning - File ignored because of a matching ignore pattern. Use "--no-ignore" to override.

236 problems
```


## TESTING

### vitest - ✅ PASSED

**Output**:
```
RUN  v3.2.4 /Users/michaelkelly/Projects/hodge

···················································································································································································································································································································································································································································································································································································································································································································································································································································································{"level":"warn","time":"2025-10-27T02:24:09.911Z","name":"pm-adapter","timestamp":"2025-10-27T02:24:09.910Z","enableConsole":false,"msg":"Failed to load PM overrides"}
························{"level":"info","time":"2025-10-27T02:24:09.921Z","msg":"Process terminated"}
··································································································································································································································································································································································································································································

 Test Files  129 passed (129)
      Tests  1325 passed (1325)
   Start at  19:23:59
   Duration  12.13s (transform 1.82s, setup 0ms, collect 11.29s, tests 32.50s, environment 15ms, prepare 8.07s)

(node:98700) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:99110) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:99191) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
(node:99492) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
fatal: No names found, cannot describe anything.
(node:99792) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:99942) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:99943) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:99978) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
(node:283) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:281) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:483) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:507) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:518) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:596) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:601) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:612) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:624) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:630) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:638) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:780) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:789) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:801) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
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
Duplications detection: Found [1m15[22m exact clones with [1m227[22m(1.46%) duplicated lines in [1m56[22m (3 formats) files.
```


## ARCHITECTURE

### dependency-cruiser - ❌ FAILED

**Output**:
```
warn no-orphans: report/jscpd-report.json
  warn no-orphans: .hodge/standards.md
  warn no-orphans: .hodge/project_management.md
  warn no-orphans: .hodge/patterns/test-pattern.md
  warn no-orphans: .hodge/id-mappings.json
  warn no-orphans: .hodge/id-counter.json
  warn no-orphans: .hodge/HODGE.md
  warn no-orphans: .hodge/features/HODGE-357/ship-record.json
  warn no-orphans: .hodge/features/HODGE-357/plan.json
  warn no-orphans: .hodge/features/HODGE-357/issue-id.txt
  warn no-orphans: .hodge/features/HODGE-357/explore/test-intentions.md
  warn no-orphans: .hodge/features/HODGE-357/decisions.md
  warn no-orphans: .hodge/features/HODGE-357/build/build-plan.md
  warn no-orphans: .hodge/features/HODGE-357.1/ship-record.json
  warn no-orphans: .hodge/features/HODGE-357.1/issue-id.txt
  warn no-orphans: .hodge/features/HODGE-357.1/explore/test-intentions.md
  warn no-orphans: .hodge/features/HODGE-357.1/explore/exploration.md
  warn no-orphans: .hodge/features/HODGE-357.1/build/refactoring-complete.md
  warn no-orphans: .hodge/features/HODGE-357.1/build/build-plan.md
  warn no-orphans: .hodge/features/HODGE-356/ship-record.json
  warn no-orphans: .hodge/features/HODGE-356/issue-id.txt
  warn no-orphans: .hodge/features/HODGE-356/explore/test-intentions.md
  warn no-orphans: .hodge/features/HODGE-356/explore/exploration.md
  warn no-orphans: .hodge/features/HODGE-356/build/refactoring-complete.md
  warn no-orphans: .hodge/features/HODGE-356/build/build-plan.md
  warn no-orphans: .hodge/context.json
  warn no-orphans: .hodge/.session
  error not-to-unresolvable: .hodge/features/HODGE-357/explore/exploration.md → ✖
  error not-to-unresolvable: .hodge/features/HODGE-357.1/build/progress-checkpoint.md → ✖

x 29 dependency violations (2 errors, 27 warnings). 129 modules, 357 dependencies cruised.
```


## SECURITY

### semgrep - ❌ FAILED

**Output**:
```
[01.13][WARNING](ca-certs): Ignored 1 trust anchors.
```


---

**Note**: This is a machine-readable report for AI interpretation. The AI will analyze these results and provide actionable feedback in the harden workflow.
